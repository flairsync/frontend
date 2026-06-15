# Frontend Instructions: Reservation Pre-Order Workflow (Full)

This document describes the complete end-to-end flow for pre-ordering items with a reservation, both during creation and when reading back the reservation data.

---

## How It Works (Backend Summary)

When a reservation is created with items, the backend:
1. Creates an `Order` record linked to that reservation.
2. Saves each item as an `OrderItem` tied to that order (prices, names, and tax are snapshotted from the menu).
3. Links the reservation to the order via an `orderId` field.

When the reservation is fetched, the response includes a nested `order` object with its `items` array. There is no separate endpoint needed for items — they come embedded in the reservation response.

---

## Step 1 — Creating a Reservation WITH Pre-Order Items

### Endpoint
```
POST /businesses/:businessId/reservations
```

### Full Payload Shape
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "reservationTime": "2025-08-15T19:00:00.000Z",
  "guestCount": 2,
  "notes": "Window table preferred",
  "tableId": "uuid-of-table",
  "reservationSource": "APP",
  "durationMinutes": 90,
  "preOrderItems": [
    {
      "menuItemId": "uuid-of-menu-item",
      "quantity": 2,
      "notes": "No onions"
    },
    {
      "menuItemId": "uuid-of-another-item",
      "quantity": 1
    }
  ]
}
```

### Critical Notes
- `preOrderItems` is **optional**. Omit it entirely if the customer does not pre-select items.
- Each entry in `preOrderItems` must have:
  - `menuItemId` (UUID, required) — must be a valid, active menu item from this business
  - `quantity` (integer ≥ 1, required)
  - `notes` (string, optional) — item-level special instructions
- Do **not** send price, name, or tax fields — the backend snapshots those from the menu automatically.
- The `preOrderItems` field name is exactly this string — do not rename it to `items`, `orderItems`, or anything else.

### What the Frontend Must Ensure
- The item selection UI must load menu items from the business's menu before the reservation form is shown.
- `menuItemId` values must come from the actual menu API response — do not use placeholder or hardcoded IDs.
- If the user removes all selected items before submitting, send `preOrderItems: []` or omit the field entirely.

---

## Step 2 — Fetching a Reservation with Its Items

### Endpoint (for detail view — always use this, not the list state)
```
GET /businesses/:businessId/reservations/:reservationId
```

### Response Shape (relevant section)
```json
{
  "id": "...",
  "customerName": "John Doe",
  "status": "confirmed",
  "reservationTime": "2025-08-15T19:00:00.000Z",
  "guestCount": 2,
  "table": {
    "id": "...",
    "name": "Table 4",
    "number": 4,
    "capacity": 4,
    "status": "reserved"
  },
  "order": {
    "id": "...",
    "status": "created",
    "type": "dine_in",
    "paymentStatus": "unpaid",
    "totalAmount": 45.00,
    "items": [
      {
        "id": "...",
        "menuItemId": "...",
        "name": "Grilled Salmon",
        "quantity": 2,
        "totalPrice": 30.00,
        "status": "pending",
        "notes": "No onions"
      },
      {
        "id": "...",
        "menuItemId": "...",
        "name": "Caesar Salad",
        "quantity": 1,
        "totalPrice": 15.00,
        "status": "pending",
        "notes": null
      }
    ]
  }
}
```

### Rendering Rules
| Condition | What to render |
|-----------|---------------|
| `order === null` | No pre-order — do not show an items section at all |
| `order !== null` and `order.items.length === 0` | Show "No items selected" |
| `order !== null` and `order.items.length > 0` | Render the items list |

For each item, display: `name`, `quantity`, `totalPrice`, and `notes` (if present).
Display `order.totalAmount` as the pre-order subtotal.

---

## Step 3 — List View (Dashboard / Staff List)

### Endpoint
```
GET /businesses/:businessId/reservations
```

The list response also includes the `order` and `order.items` fields with the same structure as above. However:

- **Do not rely on the list data to render a full detail view** — always refetch via `GET /reservations/:id` on click.
- The list view can use `order !== null` as a visual indicator (e.g., a badge or icon) to show that a reservation has a pre-order, without rendering the full item list inline.

---

## Common Mistakes to Avoid

1. **Not sending `preOrderItems` at all** — If the form has an item selector but the field is never included in the API call body, no order is created. Check the network request payload in DevTools to confirm the field is present and populated.

2. **Sending an empty array instead of omitting** — Sending `"preOrderItems": []` is safe (the backend ignores it), but make sure an empty array is not accidentally sent when the user did select items due to a state management bug.

3. **Using the list state to show item details** — The list endpoint returns items, but the data may be stale if a staff member just created or modified a reservation. Always fire a fresh `GET /reservations/:id` for the detail view.

4. **Wrong field name** — The field must be `preOrderItems` in the request body. The order service field is `items` internally, but the reservation creation endpoint expects `preOrderItems`.
