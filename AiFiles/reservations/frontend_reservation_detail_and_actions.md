# Frontend Instructions: Reservation Detail Fetch & Action Button Guards

Two fixes are required on the staff Business Dashboard for the reservations section.

---

## Fix 1 — Fetch Full Details on "View" Click

### Problem
When a staff member clicks a reservation in the list to view its details (e.g., opens a drawer, modal, or navigates to a detail page), the UI is currently reading data directly from the list state. The list endpoint returns a condensed snapshot; it does **not** guarantee that nested data (like pre-order items) is fresh or fully populated at the point of rendering.

### Required Change
When the user clicks to open or view a reservation's details, always fire a dedicated fetch to the single-reservation endpoint **before** rendering the detail view. Do **not** reuse the object already in the list state.

**Endpoint:**
```
GET /businesses/:businessId/reservations/:reservationId
```

**Flow:**
1. User clicks a reservation row/card in the list.
2. Immediately show a loading state (spinner or skeleton) in the detail panel/modal/drawer.
3. Fire `GET /businesses/:businessId/reservations/:reservationId`.
4. Render the full detail using the fresh response — including the `order` and `order.items` arrays.
5. On error, show an error message and close/dismiss the detail view.

**What the response includes (relevant fields):**
```json
{
  "id": "...",
  "customerName": "...",
  "status": "confirmed",
  "reservationTime": "...",
  "guestCount": 4,
  "table": { "id": "...", "name": "Table 5", "capacity": 6 },
  "order": {
    "id": "...",
    "status": "created",
    "totalAmount": 45.00,
    "items": [
      {
        "id": "...",
        "name": "Grilled Salmon",
        "quantity": 2,
        "totalPrice": 30.00,
        "status": "pending",
        "notes": "No sauce"
      }
    ]
  }
}
```

If `order` is `null`, the reservation has no pre-order — do not render the items section at all.
If `order.items` is an empty array `[]`, render "No items selected."

---

## Fix 2 — Hide Edit & Cancel Buttons on Terminal Statuses

### Problem
The Edit and Cancel action buttons are currently rendered regardless of the reservation's current status. A reservation that is already `cancelled`, `completed`, `no_show`, `expired`, or `rejected` cannot be modified — the backend will reject any update attempt. The UI must reflect this.

### Terminal Statuses (read-only, no actions allowed)
```
cancelled | completed | no_show | expired | rejected
```

### Required Change
Gate the visibility of action buttons based on `reservation.status`. Apply this logic wherever action buttons appear: the list row action menu, the detail view toolbar, and any inline action dropdowns.

**Logic (pseudo-code):**
```ts
const TERMINAL_STATUSES = ['cancelled', 'completed', 'no_show', 'expired', 'rejected'];

const isTerminal = TERMINAL_STATUSES.includes(reservation.status);

// Render conditionally:
// - Edit button: hide if isTerminal
// - Cancel button: hide if isTerminal
// - Assign Table button: hide if isTerminal
// - Mark No-Show button: hide if isTerminal
```

**What to show instead when terminal:**
- Display a read-only status badge (already done for status display).
- Optionally show a muted label like "This reservation is closed and cannot be modified." in the detail view, so staff understand it is intentional and not a UI bug.
- For `cancelled` specifically: if `cancelReason` is present, display it. If `cancelledAt` is present, display when it was cancelled.

**Summary table of allowed actions per status:**

| Status      | Edit | Cancel | Assign Table | Mark No-Show |
|-------------|------|--------|--------------|--------------|
| `pending`   | ✅   | ✅     | ✅           | ❌           |
| `confirmed` | ✅   | ✅     | ✅           | ✅           |
| `waitlist`  | ✅   | ✅     | ✅           | ❌           |
| `seated`    | ✅   | ❌     | ❌           | ❌           |
| `cancelled` | ❌   | ❌     | ❌           | ❌           |
| `completed` | ❌   | ❌     | ❌           | ❌           |
| `no_show`   | ❌   | ❌     | ❌           | ❌           |
| `expired`   | ❌   | ❌     | ❌           | ❌           |
| `rejected`  | ❌   | ❌     | ❌           | ❌           |
