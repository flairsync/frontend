# Jobs — Hub & Staff Invite Update

**Base URL:** `https://api.flairsync.com/api/v1`

This document covers two additions on top of the existing Jobs feature:
1. **Professional Job Hub** — a dedicated section where professionals can browse all jobs they've applied to and view application details.
2. **Staff Invite** — a business owner action to send a staff invitation to an accepted applicant, with status-freeze logic once an invite is sent.

---

## 1. Updated TypeScript Interfaces

Update the existing `JobApplication` and `ApplicationEventType` types:

```typescript
// Add 'invited' to the event type union
type ApplicationEventType =
  | 'submitted'
  | 'reviewed'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'resume_added'
  | 'note_updated'
  | 'invited';          // NEW

// JobApplication now carries invitedAt
interface JobApplication {
  id: string;
  jobId: string;
  professionalProfileId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  resumeType: 'url' | 'file' | null;
  status: ApplicationStatus;
  ownerNote: string | null;
  invitedAt: string | null;   // NEW — ISO timestamp, null until invite is sent
  job?: Job;
  professionalProfile?: ProfessionalProfile;
  events?: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. New Professional Endpoints (Job Hub)

These are called from the professional/applicant side.

### List all my applications
```
GET /jobs/my/applications
```
Already existed — no change. Returns paginated list with `job` and `job.business` loaded.

Query params: `page`, `limit`, `status` (filter by application status)

### Get a single application by application ID ✨ NEW
```
GET /jobs/my/applications/:applicationId
```
Returns the full application with `job`, `job.business`, and the complete `events` timeline.

Use this to navigate from the hub list to a detail view using the application's own `id` (rather than the job ID).

**Response shape:**
```json
{
  "code": "APPLICATION_FETCH_SUCCESS",
  "data": {
    "id": "uuid",
    "status": "accepted",
    "invitedAt": "2026-05-13T10:00:00Z",
    "job": { "id": "...", "title": "...", "business": { "name": "..." } },
    "events": [
      { "type": "submitted", "source": "applicant", "createdAt": "..." },
      { "type": "accepted",  "source": "owner",     "createdAt": "..." },
      { "type": "invited",   "source": "owner",     "createdAt": "..." }
    ]
  }
}
```

---

## 3. New Owner Endpoint — Send Staff Invite ✨ NEW

```
POST /businesses/:businessId/jobs/:jobId/applications/:applicationId/invite
```

**Auth:** Business owner/manager cookie session with `JOBS:update` permission.

**No request body needed.**

**What it does:**
- Sends a `BusinessInvitation` email to the applicant's work email (same as the normal staff invite flow).
- Sets `invitedAt` on the application.
- Appends an `invited` event to the application's audit trail.
- Returns the updated `JobApplication` with full event history.

**Constraints — the API will reject if:**
| Condition | Status | Code |
|---|---|---|
| Application status is not `accepted` | 400 | `application.not_accepted` |
| Invite already sent (`invitedAt` is set) | 409 | `application.already_invited` |
| Applicant has no work email on profile | 400 | `application.no_email` |

---

## 4. Status-Freeze Behavior (Owner Side)

Once `invitedAt` is set on an application, calling `PATCH /businesses/:businessId/jobs/:jobId/applications/:applicationId` to change the status will return:

```
409 Conflict — application.invite_sent
"Cannot change the status after a staff invite has been sent"
```

**Frontend impact:** On the owner's application detail / board view, once `invitedAt` is non-null:
- Hide or disable the status-change controls.
- Show a read-only badge like **"Invite Sent"** with the `invitedAt` timestamp.
- The "Send Staff Invite" button should also be hidden/disabled once `invitedAt` is set.

---

## 5. Pages & Components to Add or Update

### Professional Side

#### New page: Job Hub (`/dashboard/jobs` or `/my-applications`)
- Calls `GET /jobs/my/applications` on mount.
- Renders a list of application cards, each showing:
  - Job title, business name, location, type
  - Application status badge (`pending`, `reviewed`, `shortlisted`, `accepted`, `rejected`)
  - If `invitedAt` is set, show a secondary **"Staff Invite Sent"** badge
  - Applied date
- On card click, navigate to the detail page using `application.id`.

#### New page: Application Detail (`/my-applications/:applicationId`)
- Calls `GET /jobs/my/applications/:applicationId`.
- Shows full job info, cover letter, resume link/download.
- Renders the event timeline in chronological order:
  - `submitted` → "You applied"
  - `reviewed` → "Application reviewed"
  - `shortlisted` → "You've been shortlisted"
  - `accepted` → "Application accepted"
  - `rejected` → "Application not selected"
  - `invited` → "Staff invite sent — check your email"
  - `resume_added` → "Resume added"
- If status is `accepted` and `invitedAt` is set, show a prominent banner: **"You've been invited to join the team — check your email."**

### Business Owner Side

#### Update: Application Detail / Board Card
- Add a **"Send Staff Invite"** button, visible only when:
  - `application.status === 'accepted'`
  - `application.invitedAt === null`
- On click, call `POST .../invite` and refresh the application data.
- While loading, disable the button and show a spinner.
- On success, replace the button with an **"Invite Sent"** chip showing the `invitedAt` date.
- Once `invitedAt` is set, disable the status-change dropdown/select entirely.

---

## 6. Event Timeline Display Reference

| `type` | `source` | Label to show |
|---|---|---|
| `submitted` | `applicant` | Applied |
| `reviewed` | `owner` | Reviewed by employer |
| `shortlisted` | `owner` | Shortlisted |
| `accepted` | `owner` | Accepted |
| `rejected` | `owner` | Not selected |
| `resume_added` | `applicant` | Resume added |
| `note_updated` | `owner` | Note updated |
| `invited` | `owner` | Staff invite sent |
