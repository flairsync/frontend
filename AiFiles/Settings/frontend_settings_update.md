# Business Settings Page — Frontend Implementation Guide

## Overview

Two categories of changes are needed:

1. **Settings page cleanup** — remove three placeholder sections and fix one field constraint
2. **Tax Configuration redesign** — replace the single tax fields with a full multi-tax system (library + groups)

---

## Part 1 — Settings Page Cleanup

### 1.1 Remove these three sections entirely

Delete the following expandable sections from the settings page. They have no backend support.

| Section | Items inside |
|---|---|
| **Staff Alerts & Management** | Notify Staff When Late, Auto-Assign Shifts, Roles input |
| **Operations Automation** | Auto-Open Business (duplicate), Notifications input, Inventory Alerts input |
| **Payments & Invoicing** | Accepted Payment Methods, Receipt Template |

The settings page should have exactly **6 sections** after cleanup:
1. General Information
2. Location & Address
3. Open Periods
4. Labor & Compliance Defaults
5. Tax Configuration *(redesigned — see Part 2)*
6. Reservations & Orders

### 1.2 Fix Business Name max length

In Section 1 (General Information), the Business Name input currently has `maxLength={20}`. Change it to `maxLength={100}`. Update both the input prop and any Zod/Yup/form validation schema.

---

## Part 2 — Tax Configuration Redesign

### What changed on the backend

The old `taxRate`, `taxName`, and `taxIncluded` fields on the business object are now:
- `taxRate` and `taxName` **removed** from the business object
- `taxIncluded` **kept** as a business-level toggle (EU vs US display)
- Taxes are now managed as a **separate list** via dedicated endpoints

### 2.1 New data model

```ts
interface BusinessTax {
  id: string
  businessId: string
  name: string        // e.g. "VAT", "IGI", "State Tax"
  rate: number        // e.g. 8.5 for 8.5%
  isDefault: boolean  // exactly one per business is true
  createdAt: string
  updatedAt: string
}

interface BusinessTaxGroup {
  id: string
  businessId: string
  name: string           // e.g. "Merch", "Alcohol"
  taxes: BusinessTax[]   // stacked — all rates apply together
  createdAt: string
  updatedAt: string
}
```

### 2.2 API endpoints

All endpoints require the owner/manager cookie session and `BUSINESS_SETTINGS` permission.

#### Taxes

| Method | URL | Body | Description |
|---|---|---|---|
| `GET` | `/business/my/:businessId/taxes` | — | List all taxes |
| `POST` | `/business/my/:businessId/taxes` | `{ name, rate, isDefault? }` | Create a tax |
| `PATCH` | `/business/my/:businessId/taxes/:taxId` | `{ name?, rate?, isDefault? }` | Update a tax |
| `PATCH` | `/business/my/:businessId/taxes/:taxId/set-default` | — | Make this the default |
| `DELETE` | `/business/my/:businessId/taxes/:taxId` | — | Delete (blocked if default) |

#### Tax Groups

| Method | URL | Body | Description |
|---|---|---|---|
| `GET` | `/business/my/:businessId/taxes/groups` | — | List all groups with taxes |
| `POST` | `/business/my/:businessId/taxes/groups` | `{ name, taxIds: string[] }` | Create a group |
| `PATCH` | `/business/my/:businessId/taxes/groups/:groupId` | `{ name?, taxIds?: string[] }` | Update group |
| `DELETE` | `/business/my/:businessId/taxes/groups/:groupId` | — | Delete group |

#### Business-level tax display setting

The `taxIncluded` boolean is still updated via the existing business PATCH endpoint:

```
PATCH /business/my/:businessId
Body: { taxIncluded: boolean }
```

---

### 2.3 UI: Tax Configuration section layout

Replace the old Tax Rate / Tax Label / Pricing Model fields with the following layout inside the Tax Configuration expandable section.

---

#### Tax Display Mode (top of section)

A single toggle or radio that maps to `taxIncluded` on the business:

```
Pricing Model
○ Tax included in price  (EU style — tax is baked into displayed prices)
● Tax added on top       (US style — tax is shown as a separate line at checkout)
```

Save via `PATCH /business/my/:businessId` with `{ taxIncluded: boolean }`.

---

#### Tax Library

A list of the business's taxes. Each row shows name, rate, and a "Default" badge.

```
┌─────────────────────────────────────────────────────┐
│ Tax Library                              [+ Add Tax] │
├──────────────┬──────────┬───────────────────────────┤
│ VAT          │  20.00%  │ [Default] [Edit] [Delete]  │
│ State Tax    │   8.50%  │           [Edit] [Delete]  │
│ City Tax     │   1.25%  │           [Edit] [Delete]  │
└──────────────┴──────────┴───────────────────────────┘
```

**Behaviours:**
- Exactly one row always has the **Default** badge. Clicking "Set as Default" on another row moves the badge (calls `PATCH /:taxId/set-default`).
- **Delete** is disabled/hidden on the default tax. Show a tooltip: *"Set another tax as default before deleting this one."*
- **Add Tax** opens an inline form or modal with fields: `Name` (max 30 chars), `Rate %` (0–100, 2 decimal precision), `Set as default` checkbox (only shown if no default exists yet, or as an explicit option).
- **Edit** opens the same form pre-filled.

---

#### Tax Groups

A list of named bundles. Each group shows which taxes it contains and their combined rate.

```
┌─────────────────────────────────────────────────────────┐
│ Tax Groups                              [+ Add Group]    │
├───────────┬────────────────────────────┬────────────────┤
│ Merch     │ State Tax + City Tax       │  9.75% total   │
│           │                            │ [Edit][Delete] │
├───────────┼────────────────────────────┼────────────────┤
│ Alcohol   │ VAT + State Tax + City Tax │ 29.75% total   │
│           │                            │ [Edit][Delete] │
└───────────┴────────────────────────────┴────────────────┘
```

**Behaviours:**
- **Combined rate** = sum of all taxes in the group. Compute on the frontend from the group's `taxes` array.
- **Add Group** opens a modal/inline form:
  - `Group name` (max 50 chars)
  - Multi-select of taxes from the tax library (checkboxes or tags)
  - At least one tax must be selected (validate before submit)
- **Edit** opens the same form pre-filled with the current taxes selected.
- **Delete** asks for confirmation before calling the DELETE endpoint.
- If the tax library is empty, show an empty state inside Tax Groups: *"Add taxes to the library above before creating groups."* and disable the Add Group button.

---

#### Empty states

When the tax library is empty (new business, no taxes yet):

```
No taxes configured yet.
Add your first tax to apply it to all orders by default.
[+ Add Tax]
```

When groups section is empty but taxes exist:

```
No tax groups yet.
Groups let you stack multiple taxes for specific items (e.g. Merch, Alcohol).
[+ Add Group]
```

---

### 2.4 Menu item tax assignment (separate task — menu editor)

The `MenuItem` entity now has a `taxGroupId` (nullable). This is **not** part of the settings page — it belongs in the menu item edit form.

When editing a menu item, add a **Tax Group** selector:

```
Tax Override
○ Use business default  (applies the default tax from the tax library)
○ Use tax group:  [Select group ▼]  — shows groups from the tax library
```

- Default state for all existing items: `taxGroupId = null` (uses business default).
- If the owner selects a group, `PATCH` the menu item with `{ taxGroupId: string }`.
- If they revert to default, `PATCH` with `{ taxGroupId: null }`.

> **Note:** Do not implement this in the settings page. It belongs in the menu item editor. It is listed here for awareness — implement it as part of the menu management work.

---

## Part 3 — Loading data

When the Tax Configuration section mounts (lazy-load on expand), fetch both:

```
GET /business/my/:businessId/taxes
GET /business/my/:businessId/taxes/groups
```

Fetch in parallel. Show a spinner while loading. The `taxIncluded` value is already available from the main business details fetch that populates the rest of the settings page.

---

## Part 4 — Validation rules

| Field | Rule |
|---|---|
| Tax name | Required, max 30 characters |
| Tax rate | Required, number, 0–100, up to 2 decimal places |
| Group name | Required, max 50 characters |
| Group taxes | At least 1 tax selected |
| Business Name | Max 100 characters *(was 20)* |

---

## Part 5 — Error handling

| Scenario | Message to show |
|---|---|
| Deleting the default tax | *"Set another tax as default before deleting this one."* (disable button) |
| Creating a group with invalid tax IDs | *"One or more selected taxes are invalid."* |
| Creating a tax with rate > 100 | *"Tax rate cannot exceed 100%."* |
| Group with no taxes selected | *"Select at least one tax for this group."* |

---

## Summary of files likely to change

- Business settings page component (remove 3 sections, fix name maxLength)
- Tax Configuration section component (full rewrite)
- Tax library sub-component (new)
- Tax groups sub-component (new)
- Menu item edit form (add tax group selector — separate task)
- API service layer for taxes and tax groups (new)
- TypeScript types/interfaces for `BusinessTax` and `BusinessTaxGroup` (new)
