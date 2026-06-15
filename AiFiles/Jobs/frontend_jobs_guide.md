# Jobs Feature — Frontend Implementation Guide

**Base URL:** `https://api.flairsync.com/api/v1`

This document covers everything needed to implement the full Jobs feature: the public job board, the shareable job detail page, the professional apply flow (with resume support), the application status timeline, and the owner dashboard.

---

## 1. TypeScript Interfaces

Define these before starting any component work.

```typescript
// ─── Enums ────────────────────────────────────────────────────────────────────

type JobStatus = "draft" | "open" | "closed";

type JobType = "full_time" | "part_time" | "contract" | "temporary";

type JobCategory =
  | "server"
  | "chef"
  | "bartender"
  | "host"
  | "dishwasher"
  | "manager"
  | "cashier"
  | "delivery"
  | "barista"
  | "other";

type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "accepted"
  | "rejected";

type ResumeType = "url" | "file";

type ApplicationEventType =
  | "submitted"
  | "reviewed"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "resume_added"
  | "note_updated";

type ApplicationEventSource = "applicant" | "owner" | "system";

// ─── Core models ──────────────────────────────────────────────────────────────

interface JobBusiness {
  id: string;
  name: string;
  city?: string;
  state?: string;
  logo?: string;
}

interface Job {
  id: string;
  slug: string;
  businessId: string;
  business?: JobBusiness; // present on public endpoints, absent on owner endpoints
  title: string;
  description: string;
  location: string | null;
  type: JobType;
  category: JobCategory;
  salaryRange: string | null;
  status: JobStatus;
  closesAt: string | null; // ISO date string
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProfessionalProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  workEmail?: string;
}

interface JobApplicationEvent {
  id: string;
  applicationId: string;
  type: ApplicationEventType;
  source: ApplicationEventSource;
  fromStatus: ApplicationStatus | null; // null on the first SUBMITTED event
  toStatus: ApplicationStatus;
  note: string | null;
  triggeredById: string | null;
  triggeredBy?: { id: string; firstName?: string; lastName?: string };
  createdAt: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  job?: Job; // present on professional "my applications" view
  professionalProfileId: string;
  professionalProfile?: ProfessionalProfile; // present on owner applicants view
  coverLetter: string | null;
  resumeUrl: string | null; // URL to PDF or external link
  resumeType: ResumeType | null; // 'file' = uploaded PDF, 'url' = external link
  status: ApplicationStatus;
  ownerNote: string | null; // internal, only visible to owner
  events?: JobApplicationEvent[]; // present when fetching a single application detail
  createdAt: string;
  updatedAt: string;
}

// ─── API envelope ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  code: string;
  success: boolean;
  message: string | null;
  data: T;
}

interface PaginatedData<T> {
  data: T[];
  current: number;
  pages: number;
}
```

---

## 2. Display Helpers

Use these consistently across all job-related UI.

```typescript
const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
};

const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  server: "Server",
  chef: "Chef",
  bartender: "Bartender",
  host: "Host / Hostess",
  dishwasher: "Dishwasher",
  manager: "Manager",
  cashier: "Cashier",
  delivery: "Delivery",
  barista: "Barista",
  other: "Other",
};

// User-facing label shown to the applicant themselves
const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Application received",
  reviewed: "Being reviewed",
  shortlisted: "You've been shortlisted!",
  accepted: "You've been accepted! 🎉",
  rejected: "Not selected",
};

const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "gray",
  reviewed: "blue",
  shortlisted: "yellow",
  accepted: "green",
  rejected: "red",
};

// Concise label for owner-facing tables/dropdowns
const APPLICATION_STATUS_OWNER_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

// Human-readable event descriptions shown in the timeline
const EVENT_TYPE_LABELS: Record<ApplicationEventType, string> = {
  submitted: "Application submitted",
  reviewed: "Application reviewed",
  shortlisted: "Moved to shortlist",
  accepted: "Offer accepted — congratulations!",
  rejected: "Application closed",
  resume_added: "Resume attached",
  note_updated: "Note updated",
};
```

---

## 3. Pages Overview

| Page                    | Route                                                 | Who           | Auth          |
| ----------------------- | ----------------------------------------------------- | ------------- | ------------- |
| Public Job Board        | `/jobs`                                               | Everyone      | None          |
| Public Job Detail       | `/jobs/:slug`                                         | Everyone      | None          |
| Apply (modal)           | `/jobs/:slug` → modal                                 | Professionals | Required (PP) |
| My Applications         | `/jobs/my-applications`                               | Professionals | Required (PP) |
| Application Detail      | `/jobs/:id/my-application`                            | Professionals | Required (PP) |
| Owner: Job Dashboard    | `/dashboard/:businessId/jobs`                         | Owner/staff   | Required      |
| Owner: Create Job       | `/dashboard/:businessId/jobs/new`                     | Owner/staff   | Required      |
| Owner: Edit Job         | `/dashboard/:businessId/jobs/:id/edit`                | Owner/staff   | Required      |
| Owner: Applicant List   | `/dashboard/:businessId/jobs/:id/applications`        | Owner/staff   | Required      |
| Owner: Applicant Detail | `/dashboard/:businessId/jobs/:id/applications/:appId` | Owner/staff   | Required      |

---

## 4. Public Job Board — `/jobs`

Fully public. No login required.

### API Call

```
GET /api/v1/jobs
```

| Param      | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| `page`     | number      | Default: 1                |
| `limit`    | number      | Default: 10, max 100      |
| `type`     | JobType     | Filter by employment type |
| `category` | JobCategory | Filter by role            |
| `location` | string      | Partial match on location |

**Response:**

```json
{
  "code": "JOBS_FETCH_SUCCESS",
  "success": true,
  "data": {
    "data": [
      /* Job[] with business.name, business.logo, business.city */
    ],
    "current": 1,
    "pages": 4
  }
}
```

### What to build

- **Filter bar:** dropdowns for `type` and `category`, text input for `location`. Sync to URL query params on change.
- **Job cards** showing: business logo (fallback initials), business name + city, job title, type/category badges, salary range, applicant count, "X days ago", closing warning if `closesAt` is within 3 days.
- Clicking a card navigates to `/jobs/:slug`.
- **Pagination** at the bottom.
- **Empty state:** "No open positions found. Try adjusting your filters."

### URL sync pattern

```typescript
function updateFilter(key: string, value: string | undefined) {
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(key, value);
  else params.delete(key);
  params.set("page", "1");
  router.push(`/jobs?${params.toString()}`);
}
```

---

## 5. Public Job Detail — `/jobs/:slug`

**The shareable link.** Must look clean for unauthenticated visitors — this is the page owners paste on Facebook/WhatsApp.

### API Call

```
GET /api/v1/jobs/:slug
```

**404 handling:** If the API returns an error or the job is a `draft`, show "This position is no longer available." — not a generic error page.

### What to build

**Header:** Business logo + name, job title (large), location, type/category badges, salary, posted date, closes date, applicant count.

**Description:** Render `job.description` preserving newlines at minimum.

**Sticky "Apply Now" CTA** — use the guard logic from Section 12 to decide what to render.

**Share button:** Copies the current URL. Toast: "Link copied!"

**Back link:** "← Browse all positions" → `/jobs`

---

## 6. Apply Modal

Opened from the Job Detail page. Keep it as a modal — do not navigate away.

### Step 1 — Submit the application

```
POST /api/v1/jobs/:id/apply
```

> Use `job.id` (UUID), **not** `job.slug`.

**Request body (JSON):**

```json
{
  "coverLetter": "I have 5 years of experience...", // optional, max 2000 chars
  "resumeUrl": "https://linkedin.com/in/johndoe" // optional — use this OR upload a file, not both
}
```

**Success response:**

```json
{
  "code": "APPLICATION_SUBMIT_SUCCESS",
  "success": true,
  "data": {
    /* JobApplication (no events yet) */
  }
}
```

### Modal UI layout

```
┌──────────────────────────────────────────────────────────┐
│  Apply for: [Job Title] at [Business Name]               │
│                                                          │
│  Cover Letter (optional)                                 │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Tell them why you're a good fit...               │    │
│  └──────────────────────────────────────────────────┘    │
│  0 / 2000 characters                                     │
│                                                          │
│  Resume (optional)                                       │
│  ┌─────────────────────────────────┐                     │
│  │ ○ Paste a link                  │                     │
│  │   https://linkedin.com/in/...   │                     │
│  │                                 │                     │
│  │ ○ Upload a PDF  [Choose file]   │                     │
│  └─────────────────────────────────┘                     │
│                                                          │
│               [Cancel]    [Submit Application]           │
└──────────────────────────────────────────────────────────┘
```

**Resume section logic:**

- Two radio options: "Paste a link" and "Upload a PDF"
- Only one can be active at a time
- If "Paste a link" is selected: show a URL text input. Send `resumeUrl` in the JSON body.
- If "Upload a PDF" is selected: **do not upload on submit**. First submit the application (JSON), then immediately call the file upload endpoint (Section 7) with the chosen file.
- If neither is filled in: that's fine — resume is fully optional.

**On success:**

1. Close modal
2. Show toast "Application submitted!"
3. Update the Apply button to "Applied ✓" (disabled)
4. If a file was selected, trigger the resume upload call (Section 7)

**Error codes:**

| Code                    | What to show                                    |
| ----------------------- | ----------------------------------------------- |
| `application.duplicate` | "You've already applied to this position."      |
| `job.not_available`     | "This job is no longer accepting applications." |
| `job.closed`            | "The application deadline has passed."          |

---

## 7. Resume Management (after applying)

The applicant can attach or update their resume at any time after submitting. Two separate endpoints depending on whether they have a file or a URL.

### Upload a PDF file

```
POST /api/v1/jobs/:id/my-application/resume/file
Content-Type: multipart/form-data
```

| Field    | Type | Notes              |
| -------- | ---- | ------------------ |
| `resume` | File | PDF only, max 5 MB |

**Success response:**

```json
{
  "code": "RESUME_UPLOAD_SUCCESS",
  "success": true,
  "data": {
    /* Updated JobApplication with resumeUrl and resumeType: 'file' */
  }
}
```

### Set or replace with a URL link

```
PUT /api/v1/jobs/:id/my-application/resume/url
Content-Type: application/json
```

**Request body:**

```json
{
  "resumeUrl": "https://drive.google.com/file/d/..."
}
```

**Success response:**

```json
{
  "code": "RESUME_URL_SET_SUCCESS",
  "success": true,
  "data": {
    /* Updated JobApplication with resumeType: 'url' */
  }
}
```

### Resume display rules

| `resumeType` | `resumeUrl`   | What to show                              |
| ------------ | ------------- | ----------------------------------------- |
| `'file'`     | R2 PDF URL    | "📄 View Resume" button — open in new tab |
| `'url'`      | External link | "🔗 View Resume" button — open in new tab |
| `null`       | `null`        | "No resume attached" + option to add one  |

Calling either endpoint **replaces** any previously attached resume. Show a confirmation if one already exists: "This will replace your current resume. Continue?"

---

## 8. My Applications — `/jobs/my-applications`

List view for professionals. Shows all jobs they have applied to and the current status.

### API Call

```
GET /api/v1/jobs/my/applications
```

| Param    | Type              | Description     |
| -------- | ----------------- | --------------- |
| `page`   | number            | Default: 1      |
| `limit`  | number            | Default: 10     |
| `status` | ApplicationStatus | Optional filter |

**Response:**

```json
{
  "code": "MY_APPLICATIONS_FETCH_SUCCESS",
  "success": true,
  "data": {
    "data": [
      /* JobApplication[] with job + job.business — no events on list view */
    ],
    "current": 1,
    "pages": 2
  }
}
```

### What to build

**Status filter tabs:** All | Pending | Reviewed | Shortlisted | Accepted | Rejected

**Application cards** showing:

- Business logo + name
- Job title, type badge, category badge
- Applied on date
- Resume indicator: "📄 Resume attached" if `resumeUrl` is set, otherwise "No resume"
- Status badge using `APPLICATION_STATUS_LABELS` and `APPLICATION_STATUS_COLORS`
- "View details →" link to `/jobs/:id/my-application` (the application detail page)

**Highlight accepted applications** — give them a green border or banner so they stand out.

**Empty state:** "You haven't applied to any positions yet. Browse open jobs →"

---

## 9. Application Detail — `/jobs/:id/my-application`

The professional's view of a single application, including the full status timeline. Accessible only to the applicant.

### API Call

```
GET /api/v1/jobs/:id/my-application
```

**Response:**

```json
{
  "code": "APPLICATION_FETCH_SUCCESS",
  "success": true,
  "data": {
    "id": "uuid",
    "jobId": "uuid",
    "job": {
      /* full Job object with business */
    },
    "coverLetter": "...",
    "resumeUrl": "https://...",
    "resumeType": "file",
    "status": "shortlisted",
    "ownerNote": null,
    "events": [
      {
        "id": "uuid",
        "type": "submitted",
        "source": "applicant",
        "fromStatus": null,
        "toStatus": "pending",
        "note": null,
        "createdAt": "2025-05-01T10:00:00Z"
      },
      {
        "id": "uuid",
        "type": "reviewed",
        "source": "owner",
        "fromStatus": "pending",
        "toStatus": "reviewed",
        "note": null,
        "createdAt": "2025-05-03T14:22:00Z"
      },
      {
        "id": "uuid",
        "type": "shortlisted",
        "source": "owner",
        "fromStatus": "reviewed",
        "toStatus": "shortlisted",
        "note": null,
        "createdAt": "2025-05-05T09:10:00Z"
      }
    ],
    "createdAt": "2025-05-01T10:00:00Z",
    "updatedAt": "2025-05-05T09:10:00Z"
  }
}
```

### What to build

**Page header:**

- Job title + business name (link to `/jobs/:slug`)
- Current status badge (large, prominent, color-coded)
- Applied on date

**Resume section:**

- Show current resume with "View" button
- "Update resume" button — opens a small panel with the two options (upload PDF / paste URL)

**Cover letter section:**

- Show `coverLetter` if not null. Collapsible if long.

**Status timeline** (the core of this page):

```
Timeline — ordered chronologically (oldest at top)

  ●  Application submitted                    May 1, 2025 · 10:00 AM
     You applied for this position.

  ●  Application reviewed                     May 3, 2025 · 2:22 PM
     The employer has reviewed your application.

  ●  Moved to shortlist              ★        May 5, 2025 · 9:10 AM
     You've been shortlisted! The employer is interested in your profile.

  ○  (waiting for next update...)
```

**Timeline rendering logic:**

```typescript
function renderEventDescription(event: JobApplicationEvent): string {
  switch (event.type) {
    case "submitted":
      return "You applied for this position.";
    case "reviewed":
      return "The employer has reviewed your application.";
    case "shortlisted":
      return "You've been shortlisted! The employer is interested in your profile.";
    case "accepted":
      return "You've been accepted for this position. Congratulations!";
    case "rejected":
      return "The employer has closed your application.";
    case "resume_added":
      return event.note ?? "You updated your resume.";
    default:
      return "";
  }
}
```

**Rules for the timeline:**

- Show only events where `source !== 'owner'` OR where the event is a status change visible to the applicant — **never expose `ownerNote` in the professional's view**.
- Show a "waiting" placeholder dot at the end if the current status is `pending`, `reviewed`, or `shortlisted` to signal the process is ongoing.
- If status is `accepted` or `rejected`, show a final closure message instead of the waiting dot.

---

## 10. Owner: Jobs Dashboard — `/dashboard/:businessId/jobs`

Requires `JOBS.read` permission.

### API Call

```
GET /api/v1/businesses/:businessId/jobs
```

| Param      | Type        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `page`     | number      | Default: 1                        |
| `limit`    | number      | Default: 10                       |
| `status`   | JobStatus   | Filter: `draft`, `open`, `closed` |
| `type`     | JobType     | Optional                          |
| `category` | JobCategory | Optional                          |

### What to build

**Header:** "Job Postings" + "+ Post a Job" button (requires `JOBS.create`).

**Status tabs:** All | Open | Draft | Closed

**Job table**, each row:

- Title, category badge, type badge
- Status badge: `open` → green, `draft` → gray, `closed` → red
- Application count (from `job.applicationCount`)
- Posted date, closes on
- **Actions:** "View Applicants" | "Edit" | "Copy Link" | "Close" | "Delete"

**Copy Link:** copies `https://app.flairsync.com/jobs/:slug`. Toast: "Link copied! Share it on social media."

---

## 11. Owner: Create Job — `/dashboard/:businessId/jobs/new`

### API Call

```
POST /api/v1/businesses/:businessId/jobs
```

**Request body:**

```json
{
  "title": "Head Server",
  "description": "We are looking for an experienced...",
  "type": "full_time",
  "category": "server",
  "location": "Downtown, New York",
  "salaryRange": "$18-22/hr",
  "status": "open",
  "closesAt": "2025-06-30T00:00:00Z"
}
```

### Form fields

| Field                | Required | Notes                                                 |
| -------------------- | -------- | ----------------------------------------------------- |
| Job Title            | Yes      | 3–100 chars                                           |
| Description          | Yes      | min 20 chars                                          |
| Employment Type      | Yes      | `JobType` select                                      |
| Category / Role      | Yes      | `JobCategory` select                                  |
| Location             | No       | Pre-fill with `business.city + ', ' + business.state` |
| Salary Range         | No       | Free text: "$15-18/hr", "Negotiable"                  |
| Application Deadline | No       | Date picker, must be future date                      |
| Status               | No       | Toggle: "Publish now" vs "Save as draft"              |

**Two submit buttons:** "Save as Draft" and "Publish". After success, show a prominent "Share your job post" banner with the Copy Link button.

---

## 12. Owner: Edit Job — `/dashboard/:businessId/jobs/:id/edit`

```
GET  /api/v1/businesses/:businessId/jobs/:id     ← pre-fill form
PATCH /api/v1/businesses/:businessId/jobs/:id    ← save changes
```

**PATCH body** — send only changed fields:

```json
{
  "title": "Updated Title",
  "status": "closed",
  "closesAt": null
}
```

**Slug regeneration:** If `title` changes, the API regenerates the slug. Read the new slug from the response and update the Copy Link button. The old slug stops working.

---

## 13. Owner: Applicant List — `/dashboard/:businessId/jobs/:id/applications`

### API Calls

**List:**

```
GET /api/v1/businesses/:businessId/jobs/:id/applications
```

| Param    | Type              | Description     |
| -------- | ----------------- | --------------- |
| `page`   | number            | Default: 1      |
| `limit`  | number            | Default: 10     |
| `status` | ApplicationStatus | Optional filter |

**Response includes** `professionalProfile` on each item but **no `events`** — events are loaded only on the detail view.

**Update status:**

```
PATCH /api/v1/businesses/:businessId/jobs/:id/applications/:applicationId
```

**Request body:**

```json
{
  "status": "accepted",
  "ownerNote": "Great candidate, call Monday"
}
```

### What to build

**Filter tabs:** All | Pending | Reviewed | Shortlisted | Accepted | Rejected

**Applicant cards**, each showing:

- Display name + work email (mailto link)
- Applied on date
- Resume indicator — if `resumeUrl` is set, show "📄 View Resume" (open in new tab)
- Cover letter — collapsed, first 100 chars + "Read more"
- Status badge
- Owner note (if set) — in a subtle internal-note box
- **Action buttons:** Mark as Reviewed | Shortlist | Accept | Reject | Add/Edit Note
- "View full application →" → `/dashboard/:businessId/jobs/:id/applications/:applicationId`

**Accepting behavior:** When the owner clicks "Accept", show a confirmation: "Accept this applicant? They will see their status updated." This is a meaningful action — confirm before firing.

**Optimistic update pattern:**

```typescript
async function updateStatus(
  applicationId: string,
  status: ApplicationStatus,
  ownerNote?: string,
) {
  const snapshot = [...applications];
  setApplications((prev) =>
    prev.map((app) =>
      app.id === applicationId
        ? { ...app, status, ownerNote: ownerNote ?? app.ownerNote }
        : app,
    ),
  );
  try {
    await api.patch(
      `/businesses/${businessId}/jobs/${jobId}/applications/${applicationId}`,
      { status, ownerNote },
    );
  } catch {
    setApplications(snapshot);
    showErrorToast("Failed to update. Please try again.");
  }
}
```

---

## 14. Owner: Applicant Detail — `/dashboard/:businessId/jobs/:id/applications/:appId`

Full view of a single application, including timeline.

### API Call

```
GET /api/v1/businesses/:businessId/jobs/:id/applications/:appId
```

**Response:** Same shape as the professional's `my-application` endpoint, but includes `ownerNote` and loads `professionalProfile` instead of `job`.

```json
{
  "code": "APPLICATION_FETCH_SUCCESS",
  "success": true,
  "data": {
    "id": "uuid",
    "professionalProfile": {
      /* name, email */
    },
    "coverLetter": "...",
    "resumeUrl": "https://...",
    "resumeType": "file",
    "status": "shortlisted",
    "ownerNote": "Call for interview on Thursday",
    "events": [
      {
        "type": "submitted",
        "source": "applicant",
        "toStatus": "pending",
        "createdAt": "..."
      },
      {
        "type": "reviewed",
        "source": "owner",
        "toStatus": "reviewed",
        "createdAt": "..."
      },
      {
        "type": "resume_added",
        "source": "applicant",
        "toStatus": "reviewed",
        "note": "Resume file uploaded",
        "createdAt": "..."
      },
      {
        "type": "shortlisted",
        "source": "owner",
        "toStatus": "shortlisted",
        "createdAt": "..."
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### What to build

**Left column — applicant info:**

- Name, email, resume button
- Cover letter (full, not collapsed)
- Status change actions (same as list view)
- Owner note editor (inline save)

**Right column — timeline:**

```
Activity timeline

  ●  Application submitted          May 1, 10:00 AM  [applicant]
  ●  Application reviewed           May 3, 2:22 PM   [you]
  ●  Resume attached                May 4, 11:05 AM  [applicant]
     "Resume file uploaded"
  ●  Moved to shortlist             May 5, 9:10 AM   [you]
```

**Timeline rendering for owner:**

- Show ALL events (owners see everything including `resume_added` and `note_updated`)
- Label source: "applicant" → show their name; "owner" → show "you" or the triggering user's name; "system" → "Flairsync"
- Show `event.note` when present (e.g. the ownerNote at time of status change, or "Resume file uploaded")

---

## 15. Guard Logic (Frontend Auth)

```typescript
function canApply(
  job: Job,
  user: AuthUser | null,
): "apply" | "login" | "need_profile" | "closed" | "already_applied" {
  if (job.status === "closed") return "closed";
  if (job.closesAt && new Date(job.closesAt) < new Date()) return "closed";
  if (!user) return "login";
  if (!user.pro) return "need_profile";
  if (hasApplied(job.id)) return "already_applied";
  return "apply";
}
```

```tsx
const state = canApply(job, currentUser);

{
  state === "apply" && <button onClick={openApplyModal}>Apply Now</button>;
}
{
  state === "login" && (
    <button onClick={() => redirectToLogin(`/jobs/${job.slug}`)}>
      Sign in to Apply
    </button>
  );
}
{
  state === "need_profile" && (
    <button onClick={() => router.push("/profile/setup")}>
      Complete Profile to Apply
    </button>
  );
}
{
  state === "closed" && <button disabled>Position Closed</button>;
}
{
  state === "already_applied" && (
    <button onClick={() => router.push(`/jobs/${job.id}/my-application`)}>
      View My Application →
    </button>
  );
}
```

> When `already_applied`, link to the application detail page rather than just showing a disabled button — it's more useful.

---

## 16. Shareable Link Strategy

The public job URL is `https://app.flairsync.com/jobs/:slug`.

```typescript
async function copyJobLink(slug: string) {
  await navigator.clipboard.writeText(`https://app.flairsync.com/jobs/${slug}`);
  showToast(
    "Link copied! Share it on Facebook, WhatsApp, or wherever you recruit.",
  );
}
```

Show the Copy Link button: on each job card in the owner dashboard, as a banner after job creation, on the edit page, and on the public detail page.

---

## 17. Error Codes Reference

| Code                    | HTTP | Where                         | What to show                               |
| ----------------------- | ---- | ----------------------------- | ------------------------------------------ |
| `job.not_found`         | 404  | Fetch single job              | "This position is no longer available."    |
| `application.duplicate` | 409  | Apply                         | "You've already applied to this position." |
| `job.not_available`     | 400  | Apply                         | "This job is not accepting applications."  |
| `job.closed`            | 400  | Apply                         | "The application deadline has passed."     |
| `application.not_found` | 404  | Resume upload / status update | "Application not found."                   |
