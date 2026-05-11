# Frontend Account Deletion Guide (GDPR)

Base URL: `https://api.flairsync.com/api/v1`

All endpoints require the user to be authenticated (JWT cookie).

---

## Overview

Account deletion follows a **30-day grace period** model:

1. User requests deletion → all sessions revoked immediately, deletion job scheduled
2. During the 30 days → user can log back in and cancel
3. After 30 days of no cancellation → account is anonymized automatically

The `deletionRequestedAt` field on the user profile drives all frontend logic.

---

## 1. Detect a pending deletion (on login / profile load)

Every time you fetch the user profile, check `deletionRequestedAt`.

**Endpoint:** `GET /users/me`

**Response (relevant fields):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "deletionRequestedAt": "2026-05-06T14:32:00.000Z",
    ...
  }
}
```

If `deletionRequestedAt` is **not null**, the account is pending deletion.

**What to do:**
- Immediately redirect the user to a "Pending Deletion" screen (block access to the rest of the app)
- Calculate and display the scheduled deletion date: `deletionRequestedAt + 30 days`
- Offer a "Cancel deletion" button

If `deletionRequestedAt` is `null`, the account is active — normal flow.

---

## 2. Request account deletion

Shown inside account/security settings. Requires a confirmation step (modal or confirm screen) before calling the endpoint.

**Endpoint:** `DELETE /users/me`

**Request body:** none

**Success response:**

```json
{
  "status": "success",
  "message": "ACCOUNT_DELETION_REQUESTED"
}
```

**What happens server-side:**
- `deletionRequestedAt` is set to now
- All existing sessions are revoked (user is effectively logged out everywhere)
- A background job is scheduled to anonymize the account in 30 days

**What to do on success:**
- Clear the local auth state / cookies (user is now logged out)
- Redirect to the login screen
- Show a toast or confirmation screen: *"Your account is scheduled for deletion on [date]. You can cancel this within 30 days by logging back in."*

**Error responses:**

| HTTP | Message | Meaning |
|------|---------|---------|
| 400 | `Account deletion already requested` | User already has a pending deletion — don't call again |
| 404 | `User not found` | Should not happen in normal flow |

---

## 3. Cancel account deletion

Shown on the "Pending Deletion" screen (the one the user sees when they log in during the 30-day window).

**Endpoint:** `POST /users/me/cancel-deletion`

**Request body:** none

**Success response:**

```json
{
  "status": "success",
  "message": "ACCOUNT_DELETION_CANCELLED"
}
```

**What to do on success:**
- Refresh the user profile (or update local state: set `deletionRequestedAt` to `null`)
- Redirect the user to the normal home/dashboard screen
- Show a toast: *"Account deletion cancelled. Welcome back!"*

**Error responses:**

| HTTP | Message | Meaning |
|------|---------|---------|
| 400 | `No pending deletion request found` | `deletionRequestedAt` was already null |
| 404 | `User not found` | Should not happen in normal flow |

---

## 4. UI flow

### Settings page — Delete account section

```
[ Delete my account ]   ← button, styled as destructive (red)
```

On click → show a confirmation modal:

```
Title:   "Delete your account?"
Body:    "Your account will be permanently deleted after 30 days.
          You can cancel this within the 30-day window by logging
          back in. Your subscription will not be refunded."
Buttons: [ Cancel ]   [ Yes, delete my account ]  ← destructive
```

On confirm → call `DELETE /users/me` → log out → show farewell screen.

---

### Login flow — Pending deletion intercept

After login, fetch `GET /users/me`. If `deletionRequestedAt` is set:

**Do not show the normal app.** Instead show a dedicated screen:

```
Title:   "Your account is scheduled for deletion"
Body:    "This account will be permanently deleted on [date].
          If this was a mistake, you can cancel the deletion below."

[ Cancel deletion ]     ← primary action
[ Log out ]             ← secondary, logs them out again
```

Compute the deletion date in the frontend:
```js
const deletionDate = new Date(
  new Date(user.deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000
);
```

---

## 5. What gets deleted vs. kept

This is useful for informing the user in the UI (e.g., in the confirmation modal):

| Data | Outcome |
|------|---------|
| Name, email, phone, date of birth | **Deleted** (anonymized) |
| Avatar | **Deleted** from storage |
| Password & 2FA | **Deleted** |
| Subscription history | **Kept** (for legal/financial records) |
| Order history | **Kept** (anonymized, user ID removed) |
| Reservation history | **Kept** (anonymized) |
| User ID | **Kept** (for referential integrity) |

---

## 6. Edge cases to handle

**User tries to use the app during the 30-day window:**
- Intercept on every protected route: if `deletionRequestedAt` is set, block and redirect to the pending deletion screen.
- Easiest way: check `deletionRequestedAt` in the auth context/store on every profile fetch and gate routing from there.

**User requests deletion twice:**
- The API returns `400 Account deletion already requested`
- Hide or disable the delete button if `deletionRequestedAt` is already set on the profile

**After successful anonymization (30 days passed):**
- The account email becomes `deleted_<uuid>@deleted.flairsync.invalid`
- Login with the original email will fail (user not found or wrong password)
- No special frontend handling needed — normal login error flow applies
