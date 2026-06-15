# Frontend Guide: Public User History & Reviews

**Base URL:** `https://api.flairsync.com/api/v1`

All routes in this document are under the **discovery** namespace (`/discovery/businesses/:businessId/...`). They require a logged-in user (JWT cookie) unless stated otherwise. Public read routes work without auth.

---

## Part 1 — Business Card & Profile (Updated Fields)

Both the business search list and the business profile page now return **real** rating data directly — you no longer need a separate stats call to show the average on cards or the profile header.

### 1.1 Business Search List

```
GET /discovery/businesses
```

Each item in the `data` array now includes:

```json
{
  "id": "uuid",
  "name": "The Rustic Table",
  "rating": 4.3,
  "reviewCount": 128,
  ...
}
```

| Field         | Type             | Notes                                             |
| ------------- | ---------------- | ------------------------------------------------- |
| `rating`      | `number \| null` | Rounded to 1 decimal. `null` means no reviews yet |
| `reviewCount` | `number`         | Total number of reviews                           |

> **UX note:** When `rating` is `null`, render a neutral "No reviews yet" state rather than a 0-star display.

---

### 1.2 Business Profile Page

```
GET /discovery/businesses/:businessId
```

The profile response now includes the full review summary — use this to populate the rating widget in the page header without an extra request.

```json
{
  "id": "uuid",
  "name": "The Rustic Table",
  "rating": 4.3,
  "reviewCount": 128,
  "reviewDistribution": {
    "1": 3,
    "2": 5,
    "3": 12,
    "4": 40,
    "5": 68
  },
  ...
}
```

| Field                | Type             | Notes                                           |
| -------------------- | ---------------- | ----------------------------------------------- |
| `rating`             | `number \| null` | Average rating, 1 decimal                       |
| `reviewCount`        | `number`         | Total reviews                                   |
| `reviewDistribution` | `object`         | Count per star level (keys `"1"` through `"5"`) |

> **UX note:** Fetch this once on page load and use `reviewDistribution` to render the star bar chart in the header. You can still call `GET .../reviews/stats` separately if you need a refreshed count after the user submits a new review.

---

## Part 2 — Order History & Reorder

### 2.1 List My Orders

Use this to populate an "Order History" section on the public business page.

```
GET /discovery/businesses/:businessId/my-orders
```

**Auth:** Required

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 10, max 100) |
| `status` | string | Filter: `created`, `accepted`, `preparing`, `ready`, `completed`, `rejected`, `canceled` |
| `startDate` | string | ISO date string, filter from |
| `endDate` | string | ISO date string, filter to |

**Response:**

```json
{
  "message": "discovery.my_orders",
  "data": [
    {
      "id": "uuid",
      "status": "completed",
      "type": "takeaway",
      "paymentStatus": "paid",
      "totalAmount": "24.50",
      "createdAt": "2026-04-20T14:30:00.000Z",
      "items": [ ... ],
      "payments": [ ... ]
    }
  ],
  "page": 1,
  "totalPages": 3
}
```

---

### 2.2 Get a Single Past Order

Use this to show the full breakdown of a specific past order (items, prices, modifiers).

```
GET /discovery/businesses/:businessId/my-orders/:orderId
```

**Auth:** Required. Returns 404 if the order doesn't belong to the logged-in user.

**Response:**

```json
{
  "message": "discovery.my_order",
  "data": {
    "id": "uuid",
    "status": "completed",
    "type": "dine_in",
    "totalAmount": "24.50",
    "items": [
      {
        "menuItemId": "uuid",
        "nameSnapshot": "Margherita Pizza",
        "basePriceSnapshot": "12.00",
        "quantity": 2,
        "selectedModifiers": [
          { "modifierItemId": "uuid", "name": "Extra Cheese", "price": "1.50" }
        ],
        "totalPrice": "27.00",
        "notes": "Well done"
      }
    ],
    "payments": [ ... ]
  }
}
```

---

### 2.3 Reorder (repeat a past order)

Creates a brand-new order pre-populated with all the items (and modifiers) from a previous order. Use this for a **"Reorder"** button on a past order card.

```
POST /discovery/businesses/:businessId/my-orders/:orderId/reorder
```

**Auth:** Required

**Body (all optional — defaults to the original order's values):**

```json
{
  "type": "takeaway",
  "tableId": "uuid"
}
```

| Field     | Type                                        | Description                                 |
| --------- | ------------------------------------------- | ------------------------------------------- |
| `type`    | `"dine_in"` \| `"takeaway"` \| `"delivery"` | Override order type. Defaults to original   |
| `tableId` | UUID                                        | Override table assignment. Defaults to none |

**Response:** Same shape as a new order — returns the newly created order object.

**Error cases:**

- `403` — Business is not published or doesn't accept orders
- `404` — Original order not found or doesn't belong to user

> **UX note:** On success, navigate the user to the active order tracking view for the new order ID.

---

## Part 3 — Reservation History

### 3.1 List My Reservations

```
GET /discovery/businesses/:businessId/my-reservations
```

**Auth:** Required

**Query params:** `page`, `limit`, `status` (same pagination pattern as orders)

### 3.2 Reservation Timeline

```
GET /discovery/businesses/:businessId/my-reservations/:reservationId/timeline
```

Returns the full event log for a reservation (created, confirmed, seated, cancelled, etc.).

---

## Part 4 — Reviews System

### 4.1 Public Review List (no auth needed)

```
GET /discovery/businesses/:businessId/reviews
```

**Auth:** None required

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 10) |
| `rating` | number 1–5 | Filter by exact star rating |

**Response:**

```json
{
  "message": "discovery.reviews",
  "data": [
    {
      "id": "uuid",
      "rating": 4,
      "comment": "Great food, friendly staff!",
      "createdAt": "2026-04-18T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "firstName": "Sarah",
        "lastName": "M."
      }
    }
  ],
  "page": 1,
  "totalPages": 5
}
```

---

### 4.2 Review Stats (no auth needed)

Use this if you need a live refresh of the summary after a review is submitted (the profile endpoint already includes this on initial load).

```
GET /discovery/businesses/:businessId/reviews/stats
```

**Auth:** None required

**Response:**

```json
{
  "message": "discovery.reviews.stats",
  "data": {
    "average": 4.3,
    "total": 128,
    "distribution": {
      "1": 3,
      "2": 5,
      "3": 12,
      "4": 40,
      "5": 68
    }
  }
}
```

> `average` is `null` when there are no reviews yet.

---

### 4.3 Get My Review for This Business

Check whether the logged-in user has already reviewed this business. Use on page load to decide between "Write a review" and "Edit your review".

```
GET /discovery/businesses/:businessId/reviews/mine
```

**Auth:** Required

**Response:** The review object, or `null` in `data` if none exists.

```json
{ "message": "discovery.reviews.mine", "data": null }
```

```json
{
  "message": "discovery.reviews.mine",
  "data": {
    "id": "uuid",
    "rating": 5,
    "comment": "Best burger in town.",
    "createdAt": "2026-04-15T18:00:00.000Z"
  }
}
```

---

### 4.4 Create a Review

```
POST /discovery/businesses/:businessId/reviews
```

**Auth:** Required

**Body:**

```json
{
  "rating": 5,
  "comment": "Amazing experience!"
}
```

| Field     | Type    | Required | Constraints   |
| --------- | ------- | -------- | ------------- |
| `rating`  | integer | Yes      | 1–5 inclusive |
| `comment` | string  | No       | Free text     |

**Error cases:**

- `403` — User has no completed order or reservation at this business
- `409` — User already has a review (use PATCH to update instead)

---

### 4.5 Update a Review

```
PATCH /discovery/businesses/:businessId/reviews/:reviewId
```

**Auth:** Required. Returns `403` if the review doesn't belong to the user.

**Body (all optional):**

```json
{
  "rating": 4,
  "comment": "Still great, but the wait was a bit long."
}
```

---

### 4.6 Delete a Review

```
DELETE /discovery/businesses/:businessId/reviews/:reviewId
```

**Auth:** Required. Returns `403` if the review doesn't belong to the user.

---

## Part 5 — Owner / Staff Dashboard

The business owner and staff with `REVIEWS:read` permission can view all reviews through the staff endpoints (not the discovery namespace).

### 5.1 List All Reviews (Staff)

```
GET /businesses/:businessId/reviews
```

**Auth:** Required (staff JWT + `REVIEWS:read` permission)

**Query params:** `page`, `limit`, `rating`

**Response:** Same shape as the public list, paginated.

### 5.2 Review Stats (Staff)

```
GET /businesses/:businessId/reviews/stats
```

**Auth:** Required (staff JWT + `REVIEWS:read` permission)

**Response:** Same shape as the public stats endpoint — `average`, `total`, `distribution`.

### 5.3 Remove a Review (Moderation)

```
DELETE /businesses/:businessId/reviews/:reviewId
```

**Auth:** Required (staff JWT + `REVIEWS:delete` permission)

Use this to moderate abusive or fake reviews from the dashboard.

---

## Part 6 — UI Implementation Guide

### Business Card (Search / Discovery List)

- Read `rating` and `reviewCount` directly from the search result item.
- If `rating === null` → show "No reviews" chip instead of stars.
- If `rating` is set → render filled stars + the number (e.g. `★ 4.3 (128)`).

---

### Business Profile Page — Header

The profile response includes `rating`, `reviewCount`, and `reviewDistribution`. Use these to build the header rating widget on initial render without an extra request:

```
rating           → large score display (e.g. "4.3 / 5")
reviewCount      → subtitle (e.g. "128 reviews")
reviewDistribution → horizontal bar chart, 5 bars top-to-bottom
```

---

### Business Profile Page — New Tabs

#### "Your Orders" tab (logged-in users only)

1. Fetch `GET .../my-orders?status=completed` on tab open.
2. Each order card: date, items summary, total amount.
3. **"Reorder"** button on each card → `POST .../reorder` with no body → navigate to new order tracking on success.
4. Clicking a card opens a detail sheet → `GET .../my-orders/:orderId`.

#### "Your Reservations" tab (logged-in users only)

1. Fetch `GET .../my-reservations` on tab open.
2. Each card: date/time, party size, status badge.
3. Future reservations (`pending` / `confirmed`) show a **"Cancel"** button.
4. Clicking a card opens timeline sheet → `GET .../my-reservations/:reservationId/timeline`.

#### Reviews Section (visible to everyone)

1. On page mount, run these in parallel:
   - `GET .../reviews` (first page)
   - `GET .../reviews/mine` (if logged in)
2. The profile response already gave you `rating`, `reviewCount`, `reviewDistribution` for the summary widget — no extra fetch needed.
3. Render review list with first name + last initial, stars, comment, date.
4. **Review CTA logic:**

```
Logged in?
├─ No  → hide CTA
└─ Yes → call GET .../reviews/mine
         ├─ data === null → show "Write a review" button
         └─ data exists  → show "Edit your review" button (pre-fill form)
```

#### Review Form

Fields:

- Star picker (1–5, required)
- Comment textarea (optional, placeholder: _"Share your experience..."_)

On submit:

- Creating → `POST .../reviews`
- Editing → `PATCH .../reviews/:reviewId`
- After success → re-fetch `GET .../reviews/stats` and update the header widget live.

Error handling:
| HTTP | Toast message |
|------|--------------|
| `403` | "You can only review businesses you've visited." |
| `409` | "You already have a review — opening edit mode." + switch form to edit |
| `404` | "Review not found." |

---

### Owner Dashboard — Reviews Tab

1. Fetch `GET /businesses/:businessId/reviews/stats` for the summary widget.
2. Fetch `GET /businesses/:businessId/reviews` for the paginated list (supports `?rating=` filter to drill into a specific star).
3. Each review row: user name, star rating, comment, date + a **"Remove"** button (calls `DELETE /businesses/:businessId/reviews/:reviewId`, confirm dialog first).

---

## Part 7 — Request Sequence on Page Load

```
User opens business page
│
├─ Always (parallel)
│   ├─ GET /discovery/businesses/:id         → profile + rating + distribution
│   └─ GET /discovery/businesses/:id/reviews → first page of comments
│
└─ If logged in (parallel, after auth check)
    ├─ GET /discovery/businesses/:id/reviews/mine
    ├─ GET /discovery/businesses/:id/my-orders?status=completed&limit=5
    └─ GET /discovery/businesses/:id/my-reservations?limit=5
```
