# Frontend Order State Machine Update

The backend ordering system has been redesigned with a formal, validated state machine and race-condition protection. This document covers **every change** the frontend must make. Update all type definitions, API calls, UI state guards, and status-based rendering before shipping.

---

## 1. New `OrderStatus` Enum — Replace All Old Values

The old six-value enum is **gone**. Replace it everywhere (TypeScript types, string comparisons, switch statements, UI labels, filter dropdowns, badge colors).

### Old → New Mapping

| Old value (remove) | New value (use instead) | Meaning |
|---|---|---|
| `'open'` | `'created'` | Order placed, awaiting staff acceptance |
| `'pending_confirmation'` | `'created'` | Same — both collapse into `created` |
| `'sent'` | `'preparing'` | Kitchen is actively preparing |
| `'served'` | `'ready'` | Food is ready / served to table |
| `'closed'` | `'completed'` | Order fully done |
| `'cancelled'` | `'canceled'` | Canceled (note: single `l`) |
| *(none)* | `'accepted'` | Staff accepted, not yet preparing |
| *(none)* | `'rejected'` | Staff rejected the order |

### Updated TypeScript Type

```ts
export type OrderStatus =
  | 'created'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'rejected'
  | 'canceled';
```

### Allowed Transitions (read-only reference — enforced server-side)

```
created   → accepted  | rejected  | canceled
accepted  → preparing | canceled
preparing → ready     | canceled
ready     → completed | canceled
completed → (terminal)
rejected  → (terminal)
canceled  → (terminal)
```

---

## 2. API Endpoint Changes — Removed & Replaced

> [!WARNING]
> The following three endpoints **no longer exist**. Calling them will return 404. Remove every call site.

| Removed endpoint | Replaced by |
|---|---|
| `PATCH /businesses/:bId/orders/:id/send` | `PATCH …/accept` then `PATCH …/prepare` |
| `PATCH /businesses/:bId/orders/:id/serve` | `PATCH …/ready` |
| `PATCH /businesses/:bId/orders/:id/close` | `PATCH …/complete` |

---

## 3. New Endpoints — Add These Call Sites

All endpoints below are under `PATCH /businesses/:businessId/orders/:orderId/…` unless noted.

### 3.1 Accept Order — `PATCH …/accept`
Moves order from `created → accepted`.

- **Request body:** none
- **Who calls it:** Staff / cashier after reviewing the order
- **Success response key:** `ORDER_ACCEPT_SUCCESS`

```ts
await api.patch(`/businesses/${businessId}/orders/${orderId}/accept`);
```

---

### 3.2 Reject Order — `PATCH …/reject`
Moves order from `created → rejected`. Terminal — cannot be undone.

- **Request body:**
```json
{ "reason": "Item no longer available" }
```
`reason` is optional but strongly recommended for customer-facing flows.

- **Success response key:** `ORDER_REJECT_SUCCESS`
- **New field on order:** `rejectionReason: string | null`

```ts
await api.patch(`/businesses/${businessId}/orders/${orderId}/reject`, {
  reason: 'Out of stock',
});
```

---

### 3.3 Start Preparing — `PATCH …/prepare`
Moves order from `accepted → preparing`. **Inventory is deducted at this step** (not at accept).

- **Request body:** none
- **Who calls it:** Kitchen staff / KDS when they start cooking
- **Success response key:** `ORDER_PREPARE_SUCCESS`
- **Side-effect:** All `pending` order items transition to `sent` (dispatched to kitchen station)

```ts
await api.patch(`/businesses/${businessId}/orders/${orderId}/prepare`);
```

---

### 3.4 Mark Ready — `PATCH …/ready`
Moves order from `preparing → ready`. Kitchen signals the food is done.

- **Request body:** none
- **Success response key:** `ORDER_READY_SUCCESS`
- **Side-effect:** All `sent` order items transition to `ready`

```ts
await api.patch(`/businesses/${businessId}/orders/${orderId}/ready`);
```

---

### 3.5 Complete Order — `PATCH …/complete`
Moves order from `ready → completed`. Replaces the old `/close` endpoint.

- **Request body:**
```json
{
  "force": false,
  "notes": "Optional closing note"
}
```

**Rules (same as old `/close`):**
- If `paymentStatus !== 'paid'` and `force` is not `true` → API returns error `order.unpaid`
- If `force: true`, then `notes` is **required** → API returns error `order.complete_notes_required`
- If `paymentStatus === 'paid'` → body is optional

- **Success response key:** `ORDER_COMPLETE_SUCCESS`
- **Side-effects:** Sets `closedAt` timestamp, frees the table, emits `order.completed` event (WebSocket / real-time if wired)

```ts
// Happy path — fully paid
await api.patch(`/businesses/${businessId}/orders/${orderId}/complete`);

// Force-complete an unpaid order
await api.patch(`/businesses/${businessId}/orders/${orderId}/complete`, {
  force: true,
  notes: 'Customer left, manager approved write-off',
});
```

---

### 3.6 Cancel Order — `PATCH …/cancel` (updated, not new)
The cancel endpoint URL is unchanged but its allowed states have expanded.

**Old:** only worked from `open`
**New:** works from `created`, `accepted`, `preparing`, `ready`

- **Request body:**
```json
{ "reason": "Customer changed mind" }
```
`reason` is **required** if `order.totalPaid > 0`.

- **Success response key:** `ORDER_CANCEL_SUCCESS`
- **Side-effect:** Restores inventory for items already sent to kitchen, frees the table

---

## 4. Updated `GET /businesses/:businessId/orders` — Default Status Filter

The default filter (when no `status` param is passed) has changed.

| | Statuses returned |
|---|---|
| **Old default** | `open`, `sent`, `served` |
| **New default** | `created`, `accepted`, `preparing`, `ready` |

Pass `?status=all` for full history. Pass `?status=completed` for completed orders, etc.

**Required change:** Update any "active orders" tab or live-order board that omits the `status` param — it now correctly shows the four active states.

---

## 5. New Field on the Order Object

The order response payload has one new field:

```ts
interface Order {
  // ... existing fields ...
  rejectionReason: string | null;  // populated when status === 'rejected'
  // closedAt is now set on COMPLETED (not just closed) — already existed
}
```

Update your `Order` TypeScript interface / Zod schema to include `rejectionReason`.

---

## 6. UI State Guards — Which Actions to Show

Use the table below to drive button visibility/disabled state. Never rely on the server to block — guard in the UI first for a smooth experience.

| Action button | Show / enable when `order.status` is… |
|---|---|
| **Accept** | `created` |
| **Reject** | `created` |
| **Start Preparing** | `accepted` |
| **Mark Ready** | `preparing` |
| **Complete** | `ready` |
| **Cancel** | `created` \| `accepted` \| `preparing` \| `ready` |
| **Add Items** | `created` \| `accepted` *(blocked on preparing/ready/terminal)* |
| **Edit Item** (variant/qty) | item.status === `pending` |
| **Void Item** | item.status === `pending` |
| **Add Payment** | any non-terminal status |
| **Refund Payment** | any status |
| **Transfer Table** | any non-terminal status |

**Terminal statuses** (`completed`, `rejected`, `canceled`) → disable / hide all mutation actions. Show read-only view.

---

## 7. Status Badge Colors & Labels — Update Your Design System

Suggested mapping (adjust to your design system):

| Status | Label | Color hint |
|---|---|---|
| `created` | Pending | Yellow / amber |
| `accepted` | Accepted | Blue |
| `preparing` | Preparing | Orange |
| `ready` | Ready | Green |
| `completed` | Completed | Gray / muted |
| `rejected` | Rejected | Red |
| `canceled` | Canceled | Red / muted |

---

## 8. Workflow Diagrams for UI Flows

### Staff Order Flow (POS / Dashboard)
```
[Create Order]
      ↓ status = created
[Accept]  ──────────────→  [Reject]  → show rejectionReason, end
      ↓ status = accepted
[Start Preparing]
      ↓ status = preparing
[Mark Ready]
      ↓ status = ready
[Complete]  ─────────────────────────────────────────────────┐
      ↓ status = completed                                   │
   (done)                                              (check payment
                                                       status first;
                                                       offer force if needed)

[Cancel] available at any non-terminal step → status = canceled
```

### Discovery / Guest Order Flow
Guest orders are created via the public discovery endpoint. They always start as `created`. The business must call `/accept` or `/reject` — there is no longer a separate `pending_confirmation` state. If `business.requireOrderConfirmation` is true, the staff dashboard should highlight newly `created` orders for review.

---

## 9. Real-Time / WebSocket Events (if applicable)

The backend now emits lifecycle events after every successful transition:

| Event name | Fired when |
|---|---|
| `order.accepted` | CREATED → ACCEPTED |
| `order.rejected` | CREATED → REJECTED |
| `order.preparing` | ACCEPTED → PREPARING |
| `order.ready` | PREPARING → READY |
| `order.completed` | READY → COMPLETED |
| `order.canceled` | any → CANCELED |

> [!IMPORTANT]
> The old `order.closed` event **no longer fires**. Update any WebSocket listener that subscribed to `order.closed` to subscribe to `order.completed` instead.

---

## 10. Concurrency / Conflict Handling

The backend now uses database-level locking on all status transitions. If two staff members click a button at the exact same time on the same order:

- The first request wins and the transition completes.
- The second request reads the updated status, sees the transition is no longer valid, and returns an error with code `order.invalid_transition`.

**Required frontend handling:** When you receive `order.invalid_transition`, refresh the order from the server and re-render. Do not retry the same transition silently. Show a toast: *"Order was already updated. Refreshing..."*

---

## 11. Summary Checklist

- [ ] Replace `OrderStatus` enum / type with the 7 new values
- [ ] Remove all references to `'open'`, `'pending_confirmation'`, `'sent'`, `'served'`, `'closed'`, `'cancelled'`
- [ ] Remove API calls to `/send`, `/serve`, `/close`
- [ ] Add API calls for `/accept`, `/reject`, `/prepare`, `/ready`, `/complete`
- [ ] Update `/cancel` to be available from `created | accepted | preparing | ready`
- [ ] Update default active-order filter (now catches `created | accepted | preparing | ready`)
- [ ] Add `rejectionReason: string | null` to the `Order` interface
- [ ] Update all status badge labels and colors
- [ ] Update button show/hide logic using the state guard table in §6
- [ ] Handle `order.invalid_transition` errors with an order refresh + user toast
- [ ] Update WebSocket listener from `order.closed` → `order.completed`
- [ ] Guest/discovery flows: remove `pending_confirmation` handling — treat as `created`
