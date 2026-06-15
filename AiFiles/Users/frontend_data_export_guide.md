# Frontend Data Export Guide (GDPR Article 20)

Base URL: `https://api.flairsync.com/api/v1`

All endpoints require the user to be authenticated (JWT cookie).

---

## Overview

Users have the right to download a copy of all their personal data (GDPR Article 20 — Right to Data Portability). The flow is:

1. User requests an export → job is queued immediately
2. The server processes and uploads a JSON file to R2 (takes seconds to a few minutes)
3. User receives an email with a download link
4. User can also poll the status endpoint to check if it's ready and get the URL
5. Rate limit: **one request per 30 days**

The downloaded file is a **ZIP archive** containing separate JSON files per data category, plus a README. This is the standard format used by Google Takeout, Facebook, etc.

---

## 1. Request a data export

**Endpoint:** `POST /users/me/data-export`

**Request body:** none

**Success response (202-style):**
```json
{
  "status": "success",
  "message": "DATA_EXPORT_REQUESTED"
}
```

The export is processing in the background. The user will receive an email when it's ready. Show them a confirmation message and tell them to check their inbox.

**Error responses:**

| HTTP | Message | What to show |
|------|---------|--------------|
| 400 | `You can only request a data export once every 30 days. Next available in X day(s).` | Show the message directly — it includes the days remaining |
| 404 | `User not found` | Should not happen in normal flow |

---

## 2. Check export status

Use this to show a live status indicator after the user requests an export, or to surface a download button if their export is already ready.

**Endpoint:** `GET /users/me/data-export/status`

**Success response:**

```json
{
  "status": "success",
  "message": "DATA_EXPORT_STATUS",
  "data": {
    "status": "none" | "pending" | "ready",
    "requestedAt": "2026-05-06T14:32:00.000Z",   // present if pending or ready
    "downloadUrl": "https://cdn.flairsync.com/..."  // present only when ready
  }
}
```

### Status values

| `data.status` | Meaning | What to show |
|---------------|---------|--------------|
| `"none"` | Never requested | Show the "Request my data" button |
| `"pending"` | Job queued, processing | Show a spinner / "Your export is being prepared..." |
| `"ready"` | Done, download link available | Show "Download my data" button linking to `downloadUrl` |

---

## 3. UI flow

### Settings page — Privacy section

```
[ Request a copy of my data ]   ← button
```

On click → call `POST /users/me/data-export` → on success, show:

```
"Your data export has been requested. You will receive an email 
 with a download link shortly. You can also check the status below."
```

Then poll `GET /users/me/data-export/status` every 10 seconds until `status === "ready"`, at which point show the download button.

---

### On page load (Privacy / Account section)

Always call `GET /users/me/data-export/status` on load to render the right state:

```
none    → [ Request my data ]
pending → ⏳ Your export is being prepared... (spinner, poll every 10s)
ready   → ✅ Your data export is ready. [ Download ] (link to downloadUrl)
           "Link expires 7 days after the export was generated."
```

---

### 30-day cooldown

When the user tries to request again within 30 days, the API returns a clear error message including days remaining. Surface it directly:

```
"You can only request a data export once every 30 days.
 Next available in 12 day(s)."
```

In the UI, if `status === "ready"` or `status === "pending"`, disable / hide the request button.

---

## 4. What's in the export ZIP

The downloaded file is `flairsync-data-export.zip`. When unzipped it contains:

```
flairsync-data-export.zip
├── README.txt            ← explains the export and each file
├── profile.json          ← account and profile info
├── social-accounts.json  ← linked social login providers
└── subscriptions.json    ← subscription history
```

**`profile.json`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "language": "en",
  "marketingEmails": true,
  "emailVerified": true,
  "accountCreatedAt": "2024-01-01T00:00:00.000Z"
}
```

**`social-accounts.json`**
```json
[
  { "provider": "google", "email": "user@gmail.com", "linkedAt": "2024-01-02T00:00:00.000Z" }
]
```

**`subscriptions.json`**
```json
[
  {
    "id": "uuid",
    "plan": "Pro",
    "status": "active",
    "price": "29.99",
    "currency": "USD",
    "isAutoRenew": true,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "trialEndsAt": null,
    "renewsAt": "2025-01-01T00:00:00.000Z",
    "endsAt": null,
    "subscribedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 5. The email

When the export is ready, the user receives an automated email with a "Download My Data" button. The download link:
- Points directly to the ZIP file on R2 storage
- Is private (UUID-based URL — not guessable, but also not behind auth)
- **Expires in 7 days** — mention this in the UI so users know to download promptly

You do **not** need to do anything special to handle the download — clicking the link downloads the file directly from R2.

---

## 6. Edge cases

**User requests export then requests again before it's ready:**
- The API will reject it with a 30-day cooldown error
- Disable the "Request" button if `status !== "none"` to prevent this from the UI

**User requests export, cancels account deletion, then requests export again:**
- These are independent features — deletion and data export do not block each other

**Export link is already ready but user requests again after 30 days:**
- On a new request, the old `downloadUrl` is cleared and a new export is generated
- The old R2 file becomes orphaned (not a problem — it's just a JSON file)
