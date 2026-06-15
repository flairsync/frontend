# Audit Log — Frontend Integration Guide

## Endpoint

```
GET /audit-logs
```

**Auth**: requires cookie-based JWT (`JwtCookieGuard`).

---

## Query Parameters

| Param | Required | Type | Description |
|---|---|---|---|
| `businessId` | Yes | UUID | Scopes all results to this business |
| `entityType` | No | string | Filter by entity category (see below) |
| `entityId` | No | UUID | Filter logs for one specific record |
| `action` | No | `CREATE` \| `UPDATE` \| `DELETE` | Filter by action type |
| `changedBy` | No | UUID | Filter by the user who made the change |
| `from` | No | ISO date string | Lower bound on `createdAt` |
| `to` | No | ISO date string | Upper bound on `createdAt` |
| `page` | No | number (default: 1) | Pagination |
| `limit` | No | number (default: 20) | Results per page |

---

## Currently Logged entityType Values

These are the **only `entityType` values that actually exist in the database right now**. Do not show filter options for anything not in this list — the query will return empty results.

### Business Settings page

| `entityType` | What it tracks |
|---|---|
| `business` | Business profile changes (name, description, contact info, etc.) |
| `business_opening_hours` | Opening hours create/update |

**Example request:**
```
GET /audit-logs?businessId=<uuid>&entityType=business
GET /audit-logs?businessId=<uuid>&entityType=business_opening_hours
```

---

### Menu page

| `entityType` | What it tracks |
|---|---|
| `menu` | Menu create / update / delete / publish / schedule |
| `menu_category` | Category create / update / delete / reorder |
| `menu_item` | Item create / update / delete / availability toggle |
| `menu_variant` | Variant create / update / delete |
| `menu_modifier_group` | Modifier group create / update / delete |
| `menu_modifier_item` | Modifier item create / update / delete |

**Example request — show all menu-related logs on the Menu page:**
```
GET /audit-logs?businessId=<uuid>&entityType=menu
GET /audit-logs?businessId=<uuid>&entityType=menu_item
```

To let the user filter by sub-category on the Menu page, use a dropdown that maps to each `entityType` individually.

---

## What is NOT logged yet

The following modules exist in the backend but have **no audit instrumentation** yet. Do **not** add audit log filters for these pages until the backend wires them up:

- Staff / Employees
- Shifts / Scheduling
- Attendance
- Teams
- Roles & Permissions
- Orders
- Reservations
- Inventory
- Floor Plan
- Notification settings

---

## Response Shape

```json
{
  "status": "AUDIT_LOGS_FETCH_SUCCESS",
  "data": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "entityType": "menu_item",
      "entityId": "uuid",
      "action": "UPDATE",
      "changedBy": "uuid",
      "reason": null,
      "changes": {
        "price": { "old": 9.99, "new": 12.99 },
        "name":  { "old": "Burger", "new": "Classic Burger" }
      },
      "createdAt": "2026-04-24T10:30:00.000Z"
    }
  ],
  "page": 1,
  "totalPages": 4
}
```

---

## Recommended UI Pattern per Page

### Business Settings page
- Show an audit log section/tab
- No `entityType` sub-filter needed — just pass both values by toggling or showing all:
  - `entityType=business`
  - `entityType=business_opening_hours`
- Optionally let the user filter by `action` (CREATE / UPDATE / DELETE) and date range (`from` / `to`)

### Menu page
- Show an audit log panel or tab
- Provide a sub-filter dropdown with these options:

```
All Menu Activity   → no entityType filter (or fetch all 6 types separately)
Menus               → entityType=menu
Categories          → entityType=menu_category
Items               → entityType=menu_item
Variants            → entityType=menu_variant
Modifier Groups     → entityType=menu_modifier_group
Modifier Items      → entityType=menu_modifier_item
```

- Also support filtering by `action` and date range
- Optionally, when the user is viewing a specific menu item detail page, pass `entityId=<itemId>` to show only that item's history

---

## Notes for the Frontend Agent

1. `entityType` is a plain string — the backend does an exact match. There is no multi-value or array support for `entityType` in a single request. To show "all menu logs", either omit the filter and let all logs show, or make parallel requests per type.
2. `changedBy` is a raw UUID. You will need to resolve it to a display name from your staff/user data on the frontend.
3. `changes` is a JSONB diff object: `{ fieldName: { old: ..., new: ... } }`. Render it as a human-readable changelog.
4. All timestamps are UTC. Convert to local time in the UI.
