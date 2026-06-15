# Business Plan Visibility — Frontend Integration Guide

**Base URL:** `https://api.flairsync.com/api/v1`  
**Auth:** All endpoints require the session cookie (sent automatically by the browser).

---

## Context & Problem Solved

Previously, subscription limits (max employees, menus, etc.) were enforced against the **logged-in user's** own subscription. This caused a critical bug: a manager or staff member employed at a business would hit their own personal Free plan limits (e.g. 1 employee max) when trying to perform actions like inviting new staff — even though the **business itself** was on a Pro or Enterprise plan.

**What changed on the backend:**

1. All usage/limit enforcement now resolves against the **business owner's** subscription when the action is scoped to a specific business. Staff no longer need their own subscription to operate within a business.
2. A new endpoint lets any active staff member (or the owner) query the subscription plan of a business they belong to.

---

## New Endpoint

### `GET /business/my/:businessId/plan`

Returns the subscription plan limits and current usage for a given business, using the **business owner's** subscription — not the logged-in user's.

**Who can call this:**
- The business owner (creator)
- Any staff member with an **ACTIVE** employment at the business

**Who cannot call this:**
- Unauthenticated users
- Users who are not the owner and have no active employment at that business (returns `403`)

---

### Response Shape

```json
{
  "status": "success",
  "message": "BUSINESS_PLAN_FETCH_SUCCESS",
  "data": {
    "allowed": {
      "businesses": 3,
      "menus": 50,
      "products": 200,
      "employees": 20
    },
    "current": {
      "businesses": 1,
      "menus": 4,
      "products": 38,
      "employees": 7
    },
    "canCreateBusiness": true,
    "canCreateMenu": true,
    "canCreateProduct": true,
    "canAddEmployee": true
  }
}
```

| Field | Type | Description |
|---|---|---|
| `allowed.employees` | number | Max staff the business's plan permits |
| `allowed.menus` | number | Max menus the plan permits |
| `allowed.products` | number | Max menu items the plan permits |
| `allowed.businesses` | number | Max businesses the owner's plan permits |
| `current.employees` | number | How many staff are currently employed |
| `current.menus` | number | How many menus exist |
| `current.products` | number | How many menu items exist |
| `current.businesses` | number | How many businesses the owner has |
| `canAddEmployee` | boolean | `true` if inviting another employee is still allowed |
| `canCreateMenu` | boolean | `true` if creating another menu is still allowed |
| `canCreateProduct` | boolean | `true` if adding another menu item is still allowed |

---

## Where to Use This

### 1. Staff Management / Invite Button

When a manager opens the **Staff** or **Team** section of a business, call this endpoint on mount and use `canAddEmployee` to gate the "Invite Staff" button.

```
GET /business/my/{businessId}/plan
```

```tsx
// Example usage
const { data } = await api.get(`/business/my/${businessId}/plan`);
const plan = data.data;

// Disable invite button when limit is reached
<Button disabled={!plan.canAddEmployee}>
  Invite Staff
</Button>

// Optionally show usage indicator
<span>{plan.current.employees} / {plan.allowed.employees} staff</span>
```

If `canAddEmployee` is `false`, show a message like:
> *"The business plan allows up to X employees. The owner needs to upgrade to add more."*

Note: Do **not** say "you need to upgrade" to a staff/manager — they don't own the subscription. Always frame it around the business's plan.

### 2. Menu Section

Use `canCreateMenu` and `canCreateProduct` to disable "Add Menu" / "Add Item" buttons when limits are reached.

### 3. Plan Overview Banner (optional)

On the business dashboard, show a summary card for managers so they understand what the business can and cannot do:

```
Business Plan: Pro
Employees: 7 / 20
Menus: 4 / 50
Menu Items: 38 / 200
```

---

## Error Responses

| Status | When |
|---|---|
| `401 Unauthorized` | No valid session cookie |
| `403 Forbidden` | User has no active employment at the business and is not the owner |
| `404 Not Found` | `businessId` does not exist |

---

## Important: Do Not Use `GET /subscriptions/usage` for Staff

The existing `GET /subscriptions/usage` endpoint returns limits for the **logged-in user's own** subscription. Do not use it to render UI for staff members acting within a business — they likely have no subscription and will always appear to be on the Free plan. Always use `GET /business/my/:businessId/plan` instead for any business-scoped UI.

---

## Behavior Change: Limit Enforcement is Now Business-Owner-Scoped

On the backend, the `UsageGuard` (which blocks actions when limits are exceeded) now automatically resolves against the **business owner's subscription** whenever the request contains a `businessId` route param. This means:

- A manager trying to invite staff to business `XYZ` will be checked against the **owner of XYZ's** plan, not their own.
- There is no frontend change needed to trigger this — it is automatic.
- If the backend returns `403 Limit reached`, the error message will reference the owner's plan limits (e.g. *"You can only add up to 20 employees on your current plan"*). Display this message to the user as-is.
