# Inventory Management System — Frontend Implementation Guide

Base URL: `https://api.flairsync.com/api/v1`

All endpoints require the user to be authenticated (JWT cookie) and to have an `INVENTORY` permission on the business. Replace `:businessId` with the active business UUID throughout.

---

## Overview of What Was Built

The inventory system is now **ledger-based**. Every stock change (purchase, sale, waste, manual fix) creates an immutable `InventoryMovement` record. The frontend must never imply that stock is simply "set" — it is always changed *by a typed reason*.

Two tracking modes are now fully supported on `MenuItem`:

| Mode | What it means |
|---|---|
| `none` | No inventory tracked for this item |
| `direct_item` | One inventory item is deducted by `quantityPerSale` per unit sold |
| `ingredients` | A recipe (multiple inventory items) is deducted per unit sold |

---

## 1. Inventory Units (Reference Data)

Fetch once on app load and cache. Used to label all inventory items.

**Endpoint:** `GET /inventory/units?system=metric`

**Query params:** `system` = `metric` | `imperial` | `all`

**Response:**
```json
[
  { "id": 1, "name": "Kilogram", "abbreviation": "kg", "system": "metric" },
  { "id": 11, "name": "Piece", "abbreviation": "pcs", "system": "metric" }
]
```

> Default unit is **Piece (id: 11)**. Show this pre-selected when creating a new item.

---

## 2. Inventory Groups (Organizers)

Groups let staff categorize items (e.g., "Produce", "Dairy", "Beverages").

### Create group
**`POST /businesses/:businessId/inventory/groups`**
```json
{ "name": "Produce" }
```

### List all groups
**`GET /businesses/:businessId/inventory/groups`**
```json
[
  { "id": "uuid", "businessId": "uuid", "name": "Produce" }
]
```

### Update / Delete
- **`PATCH /businesses/:businessId/inventory/groups/:groupId`** → `{ "name": "Fresh Produce" }`
- **`DELETE /businesses/:businessId/inventory/groups/:groupId`**

> Show a group selector when creating/editing inventory items. Auto-create a "Default" group server-side if none selected.

---

## 3. Inventory Items (Stock Items)

### 3.1 Create an item

**`POST /businesses/:businessId/inventory/items`**

```json
{
  "name": "Whole Milk",
  "description": "Fresh full-fat milk",
  "barcode": "5000112637922",
  "unitId": 3,
  "quantity": 50,
  "lowStockThreshold": 10,
  "groupId": "uuid-of-group"
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Display name |
| `unitId` | No | Defaults to 11 (Piece) |
| `quantity` | No | Opening stock — creates a `PURCHASE` movement automatically |
| `lowStockThreshold` | No | Alert fires when stock ≤ this value. Set `0` to disable. |
| `groupId` | No | Falls back to "Default" group |

### 3.2 List items

**`GET /businesses/:businessId/inventory/items`**

Supports filters as query params:

| Param | Type | Description |
|---|---|---|
| `page` | number | Default 1 |
| `limit` | number | Default 10, max 100 |
| `search` | string | Fuzzy match on name or barcode |
| `groupId` | uuid | Filter by group |
| `unitId` | number | Filter by unit |
| `lowStock` | boolean | `true` = only below-threshold items |
| `barcode` | string | Exact barcode match |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Whole Milk",
      "quantity": 42.5,
      "lowStockThreshold": 10,
      "unitId": 3,
      "group": { "id": "uuid", "name": "Dairy" }
    }
  ],
  "page": 1,
  "totalPages": 3,
  "total": 28
}
```

### 3.3 Autocomplete (for linking to menu items)

**`GET /businesses/:businessId/inventory/autocomplete?q=milk`**

Returns up to 10 matches. Use this for search-as-you-type when a user links a menu item to an inventory item or builds a recipe.

### 3.4 Single item

**`GET /businesses/:businessId/inventory/items/:itemId`**

### 3.5 Update item

**`PATCH /businesses/:businessId/inventory/items/:itemId`**

Send only the fields you want to change. Same shape as create. **Do not use this to change stock quantity** — use the Adjust endpoint below.

### 3.6 Delete item

**`DELETE /businesses/:businessId/inventory/items/:itemId`**

---

## 4. Stock Adjustments (Manual Operations)

All manual stock changes go through this single endpoint. The backend creates an immutable `InventoryMovement` record for every call.

**`POST /businesses/:businessId/inventory/items/:itemId/adjust`**

```json
{
  "type": "add",
  "amount": 24,
  "notes": "Weekly delivery from supplier"
}
```

### Adjustment types

| `type` | What it does | Use case |
|---|---|---|
| `add` | `currentStock + amount` | Stock received / purchase |
| `subtract` | `currentStock - amount` | Manual removal |
| `set` | Sets stock to exact `amount` | Stock count correction |
| `waste` | `currentStock - amount` (tagged as WASTE) | Spoilage / breakage |

> **`notes` is strongly recommended** for all non-add operations. Make the `notes` field prominent in the UI for `waste` and `subtract` types (show a placeholder like "Reason for removal…").

### Error responses to handle

| Code | Meaning |
|---|---|
| `inventory.negative_stock` | Would result in negative stock — show a validation warning |
| `inventory.item.notfound` | Item doesn't exist or belongs to another business |

---

## 5. Low-Stock Items

**`GET /businesses/:businessId/inventory/items/low-stock`**

Returns all items where `quantity ≤ lowStockThreshold` (threshold must be > 0).

```json
[
  {
    "id": "uuid",
    "name": "Whole Milk",
    "quantity": 3,
    "lowStockThreshold": 10,
    "group": { "name": "Dairy" }
  }
]
```

> Show a badge or banner in the inventory dashboard when this list is non-empty. Items are sorted by quantity ascending (most urgent first).

---

## 6. Inventory Dashboard

**`GET /businesses/:businessId/inventory/dashboard`**

```json
{
  "totalItems": 58,
  "lowStockItems": 4,
  "totalStockUnits": 1420.5
}
```

Use this to populate a summary card at the top of the inventory page.

---

## 7. Top Consumed Ingredients

**`GET /businesses/:businessId/inventory/top-consumed`**

Optional query params: `limit` (default 10), `startDate`, `endDate` (ISO date strings).

```json
[
  {
    "itemId": "uuid",
    "itemName": "Whole Milk",
    "totalConsumed": 312.5,
    "currentQuantity": 42
  }
]
```

> Show as a ranked table or bar chart in the inventory analytics section.

---

## 8. Movement History (per item)

Full audit trail for a single inventory item, most recent first.

**`GET /businesses/:businessId/inventory/items/:itemId/movements`**

Query params: `page`, `limit`

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "SALE_CONSUMPTION",
      "sourceType": "ORDER",
      "quantity": 0.25,
      "quantityAfter": 42.5,
      "referenceType": "order",
      "referenceId": "order-uuid",
      "notes": null,
      "createdBy": null,
      "metadata": { "menuItemId": "uuid", "orderItemId": "uuid" },
      "createdAt": "2026-04-23T14:22:00Z"
    }
  ]
}
```

### Movement type labels for the UI

| `type` | Display label | Color |
|---|---|---|
| `PURCHASE` | Stock Added | green |
| `SALE_CONSUMPTION` | Sold / Consumed | blue |
| `WASTE` | Waste Recorded | orange |
| `ADJUSTMENT` | Manual Adjustment | grey |
| `RETURN` | Returned (order cancelled) | teal |
| `IN` | Stock Added (legacy) | green |
| `OUT` | Consumed (legacy) | blue |

| `sourceType` | Label |
|---|---|
| `ORDER` | Order |
| `MANUAL` | Manual |
| `SYSTEM` | System |

---

## 9. Movement Timeline (Cross-Item)

Paginated feed of all movements across all inventory items. Useful for a global audit log page.

**`GET /businesses/:businessId/inventory/timeline`**

Query params (all optional):

| Param | Type | Description |
|---|---|---|
| `page` | number | |
| `limit` | number | |
| `itemId` | uuid | Filter to one item |
| `type` | string | Filter by movement type enum |
| `sourceType` | string | `ORDER` \| `MANUAL` \| `SYSTEM` |
| `startDate` | ISO string | e.g. `2026-04-01` |
| `endDate` | ISO string | |

Response structure is the same as per-item movements, but each record includes the nested `item` object with the item name.

---

## 10. Recipe Management (Menu Item → Ingredients)

This is the core of the `ingredients` tracking mode. A **recipe** is a list of inventory items consumed per unit of a menu item sold.

> **Where to surface this in the UI:** On the menu item edit page/drawer, add an "Inventory" or "Recipe" tab. Show it only when `inventoryTrackingMode` is `ingredients`.

### 10.1 Set (replace) a menu item's full recipe

This is a **PUT-style** operation — it deletes all existing recipe rows and inserts the new ones atomically. Send the complete list each time.

**`POST /businesses/:businessId/menu/items/:menuItemId/recipes`**

```json
{
  "ingredients": [
    {
      "inventoryItemId": "uuid-of-whole-milk",
      "quantityRequired": 0.25,
      "unit": "L"
    },
    {
      "inventoryItemId": "uuid-of-espresso-shot",
      "quantityRequired": 2,
      "unit": "shots"
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `inventoryItemId` | Yes | Must belong to the same business |
| `quantityRequired` | Yes | Positive number. How much is consumed per 1 unit of this menu item ordered. Supports 4 decimal places. |
| `unit` | No | Informational label only — does not affect calculations |

Send `{ "ingredients": [] }` to clear the recipe entirely.

**Success response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "menuItemId": "uuid",
      "inventoryItemId": "uuid",
      "quantityRequired": "0.2500",
      "unit": "L",
      "inventoryItem": { "id": "uuid", "name": "Whole Milk" }
    }
  ]
}
```

### 10.2 Get a menu item's recipe

**`GET /businesses/:businessId/menu/items/:menuItemId/recipes`**

Returns the same array as above. Returns empty array if no recipe is set.

### 10.3 Remove a single recipe ingredient

**`DELETE /businesses/:businessId/inventory/recipes/:recipeId`**

> Prefer using the **Set** endpoint with a new full list. Use this only for a "remove one ingredient" quick action.

---

## 11. Linking Menu Items to Inventory

The `MenuItem` already has `inventoryTrackingMode`, `inventoryItemId`, and `quantityPerSale` fields. Update them via the existing menu item PATCH endpoint:

**`PATCH /businesses/:businessId/menus/:menuId/categories/:categoryId/items/:itemId`**

### For `direct_item` mode:
```json
{
  "inventoryTrackingMode": "direct_item",
  "inventoryItemId": "uuid-of-inventory-item",
  "quantityPerSale": 1
}
```

`quantityPerSale` = how many units of the linked inventory item are consumed per 1 unit sold (e.g., `0.5` if half a bottle is used per serving).

### For `ingredients` (recipe) mode:
```json
{
  "inventoryTrackingMode": "ingredients"
}
```

Then POST the recipe separately (section 10.1 above).

### To disable tracking:
```json
{
  "inventoryTrackingMode": "none",
  "inventoryItemId": null,
  "quantityPerSale": null
}
```

---

## 12. Low-Stock Notifications

A new notification type `INVENTORY_LOW_STOCK` is now emitted automatically when any stock deduction (from an order or manual operation) causes an item to fall to or below its `lowStockThreshold`.

The notification system is already wired up — the frontend just needs to **display it**:

- Add `INVENTORY_LOW_STOCK` to the list of notification types in your notification renderer
- Suggested display: icon 📦 or ⚠️, title "Low Stock Alert", message shows item name and current quantity
- The `payload` object on the notification contains:
  ```json
  {
    "itemId": "uuid",
    "businessId": "uuid",
    "currentQuantity": 3,
    "threshold": 10
  }
  ```
- Tapping the notification should navigate to the inventory item detail page

---

## 13. Error Codes Reference

| Code | When it appears |
|---|---|
| `inventory.insufficient_stock` | Order acceptance blocked — not enough stock for a menu item or ingredient |
| `inventory.negative_stock` | Manual subtract/waste would result in negative stock |
| `inventory.item.notfound` | Item UUID not found or wrong business |
| `inventory.group.notfound` | Group UUID not found |
| `inventory.recipe.notfound` | Recipe ingredient UUID not found |

---

## 14. Recommended UI Pages / Components

### 14.1 Inventory Dashboard Page
- Summary card: total items, low-stock count, total stock units
- Tabs or sections: **All Items** | **Low Stock** | **Movement Timeline**
- "Low Stock" tab shows the red-flagged items with quick-adjust buttons
- Top Consumed widget (bar chart or ranked list) with date range picker

### 14.2 Inventory Item List
- Search bar + Group filter + Unit filter + "Low Stock only" toggle
- Table columns: Name, Group, Unit, Current Stock (highlight red if low), Threshold, Actions
- Actions per row: Edit · Adjust Stock · View History

### 14.3 Adjust Stock Drawer/Modal
Fields:
- Type selector (tabs or radio): **Add** | **Subtract** | **Set** | **Waste**
- Amount input (positive number)
- Notes textarea (label it "Reason" for Subtract/Waste)
- Preview: "After adjustment: X units"

### 14.4 Movement History Page/Drawer
- Timeline list sorted newest first
- Each entry shows: type badge (colored), quantity change (+ / −), quantity after, source (Order / Manual / System), reference link (order ID if `sourceType: ORDER`), timestamp, notes

### 14.5 Menu Item – Inventory Tab
On the menu item editor, add a **Tracking** section with three states:

**State: None**
- "This item does not affect inventory"
- Button: "Enable tracking"

**State: Direct Item**
- Search-as-you-type for inventory item (uses autocomplete endpoint)
- Number input: "Units consumed per sale" (maps to `quantityPerSale`)
- Shows current stock of linked item

**State: Ingredients (Recipe)**
- Ingredient table: Item name | Qty per sale | Unit | Remove
- "Add ingredient" button → opens search-as-you-type + qty + unit inputs
- Save action calls the Set Recipes endpoint with the full list

### 14.6 Recipe Builder UX Notes
- `quantityRequired` should accept decimal input (allow 4 decimal places)
- `unit` is freeform text — it is informational only and does not map to the inventory unit system
- Show the inventory item's current stock next to its name in the recipe list
- When a recipe is missing for a menu item in `ingredients` mode, show a warning: "No recipe defined — inventory will not be deducted for orders"

---

## 15. Order Acceptance — Stock Error Handling

When staff tap "Accept Order", the backend now checks stock for **all** tracked menu items (both `direct_item` and `ingredients` mode) under a database lock.

If any item has insufficient stock the API returns **HTTP 422** with:
```json
{
  "code": "inventory.insufficient_stock",
  "message": "Insufficient stock for ingredient \"Whole Milk\" (used in \"Flat White\"). Available: 1.5, required: 2."
}
```

**Frontend must:**
1. Catch this error on the "Accept" action
2. Display the exact message to the staff member (it already contains the item name and quantities)
3. Offer options: "Mark item as out-of-stock" or "Reject order" or "Go to inventory"
4. Do **not** retry automatically — staff must take a deliberate action

---

## 16. Full API Route Summary

```
# Units
GET    /inventory/units

# Groups
POST   /businesses/:id/inventory/groups
GET    /businesses/:id/inventory/groups
PATCH  /businesses/:id/inventory/groups/:groupId
DELETE /businesses/:id/inventory/groups/:groupId

# Items
POST   /businesses/:id/inventory/items
GET    /businesses/:id/inventory/items
GET    /businesses/:id/inventory/autocomplete?q=
GET    /businesses/:id/inventory/items/low-stock
GET    /businesses/:id/inventory/items/:itemId
PATCH  /businesses/:id/inventory/items/:itemId
DELETE /businesses/:id/inventory/items/:itemId
POST   /businesses/:id/inventory/items/:itemId/adjust
GET    /businesses/:id/inventory/items/:itemId/movements

# Dashboard & Analytics
GET    /businesses/:id/inventory/dashboard
GET    /businesses/:id/inventory/top-consumed
GET    /businesses/:id/inventory/timeline

# Recipes
POST   /businesses/:id/menu/items/:menuItemId/recipes
GET    /businesses/:id/menu/items/:menuItemId/recipes
DELETE /businesses/:id/inventory/recipes/:recipeId
```
