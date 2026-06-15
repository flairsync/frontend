# Frontend Guide: Diner Experience Mode

Base URL: `https://api.flairsync.com/api/v1`

---

## Overview

**Diner Mode** is a focused, full-screen experience that activates on the guest app when a customer is physically at a restaurant — either because they have been seated, or because they have an active in-progress order. It replaces the standard business discovery view with a stripped-down, context-aware UI: the business's menu, the customer's live order, and a "Call Waiter" button. Everything else (reviews, opening hours, other businesses, map, etc.) is hidden.

---

## 1. When to Activate / Deactivate

### Entry Conditions — activate diner mode if **either** is true:

| Condition | How to detect |
|---|---|
| Guest has a `SEATED` reservation at a business | `GET /discovery/reservations/mine` → any item with `status === 'seated'` |
| Guest has an active `dine_in` order at a business | `GET /discovery/businesses/:id/my-orders` → any order with `type === 'dine_in'` and status in `['created', 'accepted', 'preparing', 'ready']` |

> **Priority:** The SEATED reservation is the primary trigger. If a customer is seated but hasn't ordered yet, diner mode must still activate so they can browse the menu and call a waiter.

### Exit Conditions — deactivate diner mode when **all** are true:

- There is no `SEATED` reservation for that business
- There is no active `dine_in` order (all orders are `completed`, `canceled`, or `rejected`)

When both conditions clear, transition the user back to the standard business profile or the home/discovery screen.

---

## 2. Lifecycle State Machine

```
Normal App
    │
    │  reservation.status === 'seated'
    │  OR active dine_in order found
    ▼
┌─────────────────────────┐
│      DINER MODE         │
│                         │
│  ┌─────────────────┐   │
│  │  Pre-order phase│   │  ← SEATED, no order yet
│  │  (browse menu,  │   │
│  │   call waiter)  │   │
│  └────────┬────────┘   │
│           │ order placed│
│  ┌────────▼────────┐   │
│  │  Active order   │   │  ← order status: created → accepted → preparing → ready
│  │  phase          │   │
│  └────────┬────────┘   │
│           │ order completed / canceled + no SEATED reservation
└───────────┼─────────────┘
            │
            ▼
        Normal App
```

---

## 3. What to Show vs. Hide

### Show in Diner Mode

| Element | Notes |
|---|---|
| Business name + logo | Minimal header only |
| Floor/table reference | e.g. "Table 4, Floor 1" — from the reservation's `tableId` |
| Menu (full, browseable) | Categories, items, variants, modifiers |
| Active order card | Live status + item list |
| "Add more items" button | Visible while order is in `created` or `accepted` status |
| "Call Waiter" button | UI-only for now — see Section 7 |
| Bottom tab: Menu / My Order | Two-tab navigation within diner mode |

### Hide in Diner Mode

| Element | Reason |
|---|---|
| Business discovery / search | Not relevant |
| Reviews & ratings | Not relevant while eating |
| Opening hours | Already inside |
| Location / map | Already there |
| Price range, tags, cuisine type | Not relevant in context |
| "Reserve a table" CTA | Already seated |
| Other businesses | Context is locked to one business |
| Main app navigation (home, explore, profile tabs) | Replace with diner-mode bottom bar |

---

## 4. API Endpoints

### 4.1 Check for Active Sessions (run on app load + on resume)

```
GET /discovery/reservations/mine
```

Returns all of the current user's reservations across all businesses. Filter client-side for `status === 'seated'` to determine if diner mode should activate.

Response shape (relevant fields):
```json
{
  "data": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "status": "seated",
      "tableId": "uuid",
      "reservationTime": "2026-05-14T19:00:00.000Z",
      "guestCount": 2
    }
  ]
}
```

---

### 4.2 Fetch Business Menu

```
GET /discovery/businesses/:businessId/menu
```

No auth required. Returns categories and items. Use this to render the full menu inside diner mode.

---

### 4.3 Check for Active Orders

```
GET /discovery/businesses/:businessId/my-orders
```

Requires auth. Filter client-side for `type === 'dine_in'` and `status` in `['created', 'accepted', 'preparing', 'ready']`.

Response shape (relevant fields):
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "preparing",
      "type": "dine_in",
      "tableId": "uuid",
      "items": [...],
      "totalAmount": 42.50,
      "paymentStatus": "unpaid"
    }
  ]
}
```

---

### 4.4 Fetch Single Order (for live status polling)

```
GET /discovery/businesses/:businessId/my-orders/:orderId
```

Poll this every **30 seconds** while diner mode is active to refresh order status. No WebSocket in this phase.

---

### 4.5 Place a New Order

```
POST /discovery/businesses/:businessId/orders
```

Payload:
```json
{
  "type": "dine_in",
  "tableId": "uuid-of-table",
  "reservationId": "uuid-of-reservation",
  "items": [
    {
      "menuItemId": "uuid",
      "variantId": "uuid",
      "quantity": 1,
      "modifiers": [{ "modifierItemId": "uuid" }],
      "notes": "No onions please"
    }
  ]
}
```

Always pass `reservationId` and `tableId` when placing orders from within diner mode — this ties the order to the active session.

---

### 4.6 Add Items to an Existing Order

```
POST /discovery/businesses/:businessId/my-orders/:orderId/items
```

Only available while order `status` is `created` or `accepted`. Hide the "Add items" button once the order reaches `preparing`.

Payload:
```json
{
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "modifiers": [],
      "notes": ""
    }
  ]
}
```

---

## 5. Order Status Display

Map backend `status` values to user-facing labels and visuals:

| Backend Status | Display Label | UI Treatment |
|---|---|---|
| `created` | "Order received" | Spinner / waiting indicator |
| `accepted` | "Order confirmed" | Checkmark, still editable |
| `preparing` | "Being prepared" | Progress animation — lock edits |
| `ready` | "Ready to serve!" | Highlight card, pulse animation |
| `completed` | "Enjoy your meal!" | Muted / archive |
| `canceled` / `rejected` | "Order cancelled" | Error state, offer to reorder |

---

## 6. Menu Browsing in Diner Mode

The menu layout inside diner mode should be optimized for quick selection — not discovery:

- **Sticky category bar** at the top (scroll spy)
- **Add to cart flow** with variant/modifier selector as a bottom sheet
- A persistent **"View Order" floating button** showing item count + total — tapping it switches to the "My Order" tab
- Mark items as **unavailable** if `isAvailable === false` on the menu item

No search bar needed here. The customer already knows they are at this restaurant — optimize for speed of ordering, not exploration.

---

## 7. Call Waiter Button

> **Backend:** Not yet implemented. This is a UI placeholder for the FCM-based push notification feature planned for a future phase.

For now:
- Render a "Call Waiter" button prominently (e.g., floating action button or a section in the bottom bar)
- On tap: show a local confirmation toast — "Your waiter has been notified" — **without making any API call**
- Add a **60-second cooldown** after tapping to prevent spam (disable the button, show a countdown timer)
- When FCM is integrated later, this button will call a new endpoint (TBD) which triggers a push notification to the restaurant's staff device

---

## 8. Entering Diner Mode — UX Flow

1. **On app load / resume**: call `GET /discovery/reservations/mine` and check for `seated` status
2. If found, **immediately redirect** the user to diner mode for that `businessId`
3. Load the business menu and the active order (if any) in parallel
4. Show a **brief entry animation or banner**: "You're seated at [Business Name]" to orient the user
5. Replace the main navigation with the diner-mode bottom bar (Menu / My Order)

If the user has **no reservation** but has an active `dine_in` order (walk-in scenario), the same flow applies — detect via `GET /discovery/businesses/:businessId/my-orders` on the business profile screen.

---

## 9. Exiting Diner Mode — UX Flow

1. Poll `GET /discovery/businesses/:businessId/my-orders/:orderId` every 30s
2. When order reaches `completed` (or `canceled`/`rejected`) AND the reservation is no longer `seated`:
   - Show an **exit banner**: "Thanks for dining with us! Your session has ended."
   - Offer a "Leave a Review" CTA (link to `POST /discovery/businesses/:businessId/reviews`)
   - After 3 seconds (or on dismiss), navigate back to the home/discovery screen
3. The user can also **manually exit** via an "X" or "Leave" button in the diner-mode header — this just dismisses the UI client-side (does not change any backend state)

---

## 10. Polling Strategy (No WebSocket)

Since there is no real-time layer in this phase, use interval polling:

| What | Endpoint | Interval | When |
|---|---|---|---|
| Order status | `GET /discovery/businesses/:id/my-orders/:orderId` | Every 30s | While diner mode is active and order is not terminal |
| Session check | `GET /discovery/reservations/mine` | Every 60s | While diner mode is active |

- Stop all polling when the app goes to background (visibility API / app lifecycle events)
- Resume polling immediately when the app comes back to foreground
- Clear all intervals on exit from diner mode

---

## 11. Edge Cases

| Scenario | Behaviour |
|---|---|
| Customer has 2 simultaneous `seated` reservations at different businesses | Show a modal asking which one to enter — list both businesses |
| Reservation becomes `completed` or `no_show` but an active order still exists | Stay in diner mode until the order also reaches a terminal status |
| Business does not allow orders (`allowOrders === false`) | Hide "Place Order" and "Add Items" entirely — show menu as read-only, keep waiter button |
| Menu fails to load | Show a retry button, do not crash out of diner mode |
| Order placement fails (business too far, etc.) | Surface the API error message to the user inline in the cart |
