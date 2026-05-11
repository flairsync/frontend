# Delete Business — Frontend Integration Guide

## Endpoint

```
DELETE /business/my/:businessId
```

**Auth**: JWT cookie required (`JwtCookieGuard`).  
**Who can call it**: Only the business creator/owner.

---

## Pre-conditions (enforced server-side)

Before the business can be deleted, **two hard conditions** must be met:

| Condition | Error code | User-facing message |
|---|---|---|
| `isPublished` must be `false` | `business.delete.still_published` | Unpublish the business before deleting it |
| No ACTIVE or PENDING staff (INVITED type) | `business.delete.has_staff` | Remove all staff members before deleting the business |

The frontend should ideally gate access to the delete action based on these conditions, but the API enforces them regardless.

---

## Success Response

```json
{
  "code": "BUSINESS_DELETED",
  "data": { "deleted": true }
}
```

HTTP 200.

---

## Error Responses

### Still published
```json
{
  "code": "business.delete.still_published",
  "message": "Unpublish the business before deleting it"
}
```

### Has active / pending staff
```json
{
  "code": "business.delete.has_staff",
  "message": "Remove all staff members before deleting the business"
}
```

### Business not found / not owner
HTTP 404 — `NotFoundException`.

---

## What gets deleted

When a business is deleted, the following data is permanently removed:

**Deleted from DB (cascade):**
- Opening hours & periods
- Menus, categories, items
- Shifts, shift templates, recurring rules
- Shift swap & time-off requests
- Jobs, tasks
- Payroll entries
- Stations & pairing codes
- Attendance & absence records
- User favorites
- Reviews
- Inventory (cascade from business)

**Deleted from storage (R2/S3):**
- Business logo
- All gallery images

**Set to NULL (orphaned, not deleted):**
- Orders
- Reservations
- Roles
- Floors / floor plans
- Marketplace items
- Business invitations
- Employment records

> The owner's employment record is also set to NULL (not deleted). The user's account and professional profile remain intact.

---

## Frontend Implementation

### 1. Determine if delete is available

Fetch business details (`GET /business/my/:businessId`) and check:

```ts
const canDelete =
  !business.isPublished &&
  business.counts.employees === 0; // employees excludes the owner
```

`counts.employees` already excludes the OWNER employment — it only counts INVITED + ACTIVE staff.

### 2. UI flow

Recommended flow (use a confirmation dialog with typed confirmation for destructive actions):

```
[Settings page] → "Danger Zone" section
  → "Delete Business" button (disabled with tooltip if canDelete is false)
  → Confirmation modal:
      "Type the business name to confirm deletion"
      [Text input] [Cancel] [Delete permanently]
```

Show inline hints when the button is disabled:

```ts
if (business.isPublished) {
  hint = "Unpublish the business first";
} else if (business.counts.employees > 0) {
  hint = `Remove all ${business.counts.employees} staff member(s) first`;
}
```

### 3. API call

```ts
async function deleteBusiness(businessId: string): Promise<void> {
  const res = await fetch(`/business/my/${businessId}`, {
    method: 'DELETE',
    credentials: 'include', // send JWT cookie
  });

  const json = await res.json();

  if (!res.ok || json.code !== 'BUSINESS_DELETED') {
    // handle known error codes
    if (json.code === 'business.delete.still_published') {
      throw new Error('Unpublish the business before deleting it.');
    }
    if (json.code === 'business.delete.has_staff') {
      throw new Error('Remove all staff members before deleting the business.');
    }
    throw new Error(json.message ?? 'Failed to delete business');
  }
}
```

### 4. Post-deletion

After a successful deletion:
- Remove the business from local state / cache
- Redirect to `/my-businesses` (or wherever the business list lives)
- Optionally show a toast: "Business deleted successfully"

---

## Example Confirmation Modal (pseudocode)

```tsx
function DeleteBusinessModal({ business, onDeleted }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = input === business.name;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteBusiness(business.id);
      onDeleted();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Delete Business" variant="danger">
      <p>
        This action is <strong>permanent and cannot be undone</strong>.
        All menus, shifts, schedules, and media will be deleted.
      </p>
      <p>Type <strong>{business.name}</strong> to confirm:</p>
      <input value={input} onChange={e => setInput(e.target.value)} />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <Button
        variant="danger"
        disabled={!confirmed || loading}
        onClick={handleDelete}
      >
        {loading ? 'Deleting...' : 'Delete permanently'}
      </Button>
    </Modal>
  );
}
```

---

## Checklist

- [ ] "Delete Business" button in Settings → Danger Zone
- [ ] Button disabled + tooltip when `isPublished` or `counts.employees > 0`
- [ ] Confirmation modal with name-typing gate
- [ ] Call `DELETE /business/my/:businessId`
- [ ] Handle `business.delete.still_published` and `business.delete.has_staff` errors gracefully
- [ ] Redirect to business list on success
- [ ] Invalidate / remove the business from all caches / stores
