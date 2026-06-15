# KDS Frontend Updates Guide

This document covers all backend changes made to the KDS system that require frontend work.
Reference the existing `frontend_station_guide.md` for auth, pairing, and base KDS setup.

---

## 1. Recall (Un-bump) Button

### What changed
New endpoint: `PATCH /station/kds-orders/:orderId/items/:itemId/recall`

Transitions an item from `READY` back to `SENT`. Requires device token + staff PIN token (`X-Staff-Token`).

### What to build
Add an **undo/recall button** on each bumped (READY) item card in the KDS.

- Show it only when `item.status === 'ready'`
- On tap: call the recall endpoint, then re-fetch or patch local state (`item.status = 'sent'`, `item.readyAt = null`)
- If the order's `status` comes back as `'preparing'` (order was rolled back from READY), update the order header accordingly
- Use a distinct visual style — e.g. outlined, secondary colour — so it's not accidentally tapped

**Response shape:**
```ts
{
  item: OrderItem,       // updated item with status = 'sent', readyAt = null
  orderStatus: string,   // may have rolled back from 'ready' to 'preparing'
}
```

---

## 2. Elapsed Time Display (sentAt / readyAt on items)

### What changed
`OrderItem` now has two nullable timestamp fields:

| Field | Set when | Cleared when |
|---|---|---|
| `sentAt` | Item enters `SENT` | Never |
| `readyAt` | Item enters `READY` | On recall (set to `null`) |

### What to build

**In-queue timer** — show how long an item has been waiting since it was sent to the kitchen:
```ts
const elapsedSeconds = Math.floor((Date.now() - new Date(item.sentAt).getTime()) / 1000);
```

Display as `MM:SS`. Colour-code by urgency:
- `< 5 min` → green
- `5–10 min` → amber
- `> 10 min` → red

**Prep time** — once an item is READY, show how long it took:
```ts
const prepSeconds = Math.floor((new Date(item.readyAt).getTime() - new Date(item.sentAt).getTime()) / 1000);
```

Poll or use a local `setInterval` — the server only provides the timestamps, not a live countdown. Refresh the KDS queue every 30 seconds minimum.

---

## 3. Kitchen Notes on KDS Tickets

### What changed
`getKdsOrders` response now includes `kitchenNotes` at the order level.

### What to build
Display `kitchenNotes` on the **order ticket header**, not on individual items. Suggested placement: below the table name / order type badge. Use a distinct style (italic, amber background pill) so chefs notice it immediately.

```ts
// Response shape (per order):
{
  id: string,
  status: string,
  tableName: string | null,
  kitchenNotes: string | null,  // ← render this
  priority: number,
  readyAt: string | null,
  createdAt: string,
  stationItems: OrderItem[],
  otherItemsCount: number,
  allItemsDone: boolean,
}
```

Only render the notes section when `kitchenNotes !== null`.

---

## 4. Priority — Manual Ticket Ordering

### What changed
- `Order` has a new `priority: number` field (default `0`)
- New endpoint: `PATCH /station/kds-orders/:orderId/priority` with body `{ priority: number }`
- `getKdsOrders` returns orders sorted `priority DESC, createdAt ASC`

### What to build

**Priority badge** on each ticket — show when `priority > 0`:
```tsx
{order.priority > 0 && <PriorityBadge value={order.priority} />}
```

**Priority controls** for KDS staff (requires staff PIN):
- A simple `+` / `-` stepper or a "Rush" quick-button that sets `priority = 1`
- Call `PATCH /station/kds-orders/:orderId/priority` with the new value
- Re-sort the local queue immediately after the response (or re-fetch)

Suggested UX: a long-press on a ticket opens a context menu with "Mark as Rush" (sets priority 1) and "Clear Priority" (sets priority 0).

---

## 5. Expo Screen

### What changed
`GET /station/kds-orders?expo=true` returns a cross-station view. Any device token can call it regardless of whether the device has a `kitchenStationId` assigned.

### What to build
A new **ExpoScreen** (`src/station/kds/ExpoScreen.tsx`). This is a separate view from the regular KDS — it is shown on a dedicated expo tablet at the pass.

**Response shape:**
```ts
{
  id: string,
  status: string,
  tableName: string | null,
  kitchenNotes: string | null,
  priority: number,
  readyAt: string | null,
  createdAt: string,
  allStationsDone: boolean,   // ← primary signal to the expediter
  stations: Array<{
    kitchenStationId: string | null,
    done: boolean,
    items: OrderItem[],
  }>,
}
```

**Layout suggestion:**
- Each ticket is a card showing table, order type, kitchen notes, and a row of station pills
- Station pill = green tick when `done: true`, spinner/amber when `done: false`
- When `allStationsDone: true`, highlight the entire card (green border) — this is the expediter's cue to plate and run the order
- Orders with `requiresExpoConfirm: true` and `allStationsDone: true` show an **"Confirm"** button (see section 7)

**Polling:** poll every 10–15 seconds. The expo screen is read-heavy.

**How to detect expo mode:** store a flag in the station's local config (e.g. `localStorage.setItem('kds_mode', 'expo')`). On boot, if `kds_mode === 'expo'` render `ExpoScreen` instead of `KDSApp`.

**readyMaxAgeMinutes** applies here too — pass it as a query param (see section 8).

---

## 6. Bump Validation — 403 on Wrong Station

### What changed
`bumpItem` and `recallItem` now return **HTTP 403** (not 200 with an error body) if the item belongs to a different kitchen station. Previously the error was silently returned as a success response.

### What to build
Make sure your bump/recall API calls handle the 403 case explicitly:
```ts
try {
  await bumpItem(orderId, itemId);
} catch (err) {
  if (err.status === 403) {
    showToast('This item is not assigned to your station');
    return;
  }
  throw err;
}
```

No UI change needed beyond the error handling.

---

## 7. Expo Confirmation (`requiresExpoConfirm`)

### What changed
- `Order` has a new `requiresExpoConfirm: boolean` field (set at order creation, default `false`)
- When `true`, bumping the last item does **not** auto-advance the order to `READY`
- Instead, the bump response includes `awaitingExpoConfirm: true`
- New endpoint: `PATCH /station/kds-orders/:orderId/expo-confirm` — manually pushes the order to READY after the expediter approves

### What to build

**On the regular KDS ticket** — when bump response has `awaitingExpoConfirm: true`:
- Show a status badge: "Waiting for Expo" (amber)
- Do NOT show the order as done — `allItemsDone` may be true but the order is still `PREPARING`

**On the Expo screen** — when `allStationsDone: true` and `order.requiresExpoConfirm: true`:
- Show a prominent **"Confirm & Send"** button on the ticket
- On tap: call `PATCH /station/kds-orders/:orderId/expo-confirm` (requires staff PIN)
- On success: order transitions to `READY`, update the card style

**Expo-confirm error cases to handle:**

| Status | Code | Meaning |
|---|---|---|
| 400 | `order.expo_confirm_not_required` | Flag not set on this order, should not happen in normal flow |
| 400 | `order.invalid_status` | Order is not in PREPARING |
| 409 | `order.items_not_ready` | Some items are still SENT — cannot confirm yet |

---

## 8. READY Ticket Age Filter (`readyMaxAgeMinutes`)

### What changed
- `Order` now has a `readyAt: timestamptz` field set when the order first becomes READY
- Both `GET /station/kds-orders` and `GET /station/kds-orders?expo=true` accept `?readyMaxAgeMinutes=N`
- Orders in `READY` status with `readyAt` older than N minutes are excluded from the response

### What to build

**Settings panel** in the KDS app (accessible from a settings/gear icon, owner-only or manager-only):
- "Hide completed tickets after" — number input (minutes), default empty (no filter)
- Persist in `localStorage` as `kds_ready_max_age`
- Pass as query param on every poll: `GET /station/kds-orders?readyMaxAgeMinutes=${value}`

**Ticket elapsed-time since READY** — the `readyAt` field on the order lets you show how long a ticket has been sitting at READY at the order level (separate from item-level `readyAt`):
```ts
const waitingSeconds = order.readyAt
  ? Math.floor((Date.now() - new Date(order.readyAt).getTime()) / 1000)
  : null;
```

This is useful on the expo screen to flag orders that are READY but not yet collected by waitstaff.

---

## 9. Staff Auth Gate on KDS Read (`kdsRequiresStaffAuth`)

### What changed
- `Station` has a new `kdsRequiresStaffAuth: boolean` field (default `false`)
- When `true`, `GET /station/kds-orders` requires a valid `X-Staff-Token` header
- Returns **HTTP 401** with code `station.kds.staff_auth_required` if the token is missing or invalid

**Toggle via dashboard:** `PATCH /station/businesses/:businessId/stations/:stationId` with `{ kdsRequiresStaffAuth: true }`.

### What to build

**Dashboard — Station Settings:**
Add a toggle "Require staff login to view KDS" in the station edit panel. This calls the existing update-station endpoint with the new flag.

**KDS app — conditional PIN gate:**
On boot, after the device token is validated, check if `kdsRequiresStaffAuth` is set. You can read this from the `GET /station/me` response or detect it from the first 401 on `GET /station/kds-orders`.

Recommended approach — detect it from the 401:
```ts
const res = await fetchKdsOrders();
if (res.status === 401 && res.data?.code === 'station.kds.staff_auth_required') {
  // show PIN login screen before rendering KDS queue
  showPinLogin();
  return;
}
```

Once staff logs in (PIN login flow from `frontend_station_guide.md`), store the `shortToken` and attach it as `X-Staff-Token` on all KDS poll requests. When the staff token expires (30 min), re-prompt the PIN login screen.

**Staff token expiry handling:**
```ts
// On any KDS poll that returns 401 with staff_auth_required code:
if (isStaffAuthRequired(err)) {
  clearStaffToken();
  showPinLogin();
}
```

---

## Summary of New API Calls

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `PATCH` | `/station/kds-orders/:orderId/items/:itemId/recall` | device + staff | Un-bump READY → SENT |
| `PATCH` | `/station/kds-orders/:orderId/priority` | device + staff | Set ticket priority |
| `PATCH` | `/station/kds-orders/:orderId/expo-confirm` | device + staff | Manually push to READY (expo gate) |
| `GET` | `/station/kds-orders?expo=true` | device (+ staff if gated) | Expo cross-station view |
| `GET` | `/station/kds-orders?readyMaxAgeMinutes=N` | device (+ staff if gated) | Filter stale READY tickets |
| `PATCH` | `/station/businesses/:businessId/stations/:stationId` | dashboard JWT | Toggle `kdsRequiresStaffAuth` / `requiresExpoConfirm` |

## Summary of New Response Fields

| Field | Location | Type | Notes |
|---|---|---|---|
| `sentAt` | `OrderItem` | `string \| null` | ISO timestamp when item entered SENT |
| `readyAt` | `OrderItem` | `string \| null` | ISO timestamp when item entered READY; null after recall |
| `kitchenNotes` | KDS order | `string \| null` | Order-level chef note |
| `priority` | KDS order | `number` | Default 0; higher = shown first |
| `readyAt` | KDS order | `string \| null` | When the whole order became READY |
| `allItemsDone` | KDS order | `boolean` | All station items are READY/SERVED |
| `awaitingExpoConfirm` | bump/advance response | `boolean` | True when all items done but expo gate is holding |
| `allStationsDone` | expo order | `boolean` | All stations finished |
| `stations` | expo order | `array` | Per-station breakdown with `done` flag |
