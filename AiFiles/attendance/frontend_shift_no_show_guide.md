# Frontend Implementation Guide — Shift No-Show Detection & Manual Resolution

> Backend branch: `master`
> Base API prefix: `/attendance` (new endpoint) — existing `/attendance` and `/shifts` types are unchanged otherwise.
> Auth: session cookie (JwtCookieGuard). No token in headers needed.
> All responses follow the existing wrapper: `{ success: true, message: string, data: T }`

---

## 0. Problem This Closes

Previously, if a staff member accepted a shift and then never clocked in (offline all day, forgot, etc.), nothing happened — the shift just sat at `SCHEDULED` forever with no alert to the owner. Two things now exist to fix that:

1. **Automatic detection** — a cron flags it: shift → `NO_SHOW`, an unauthorized absence is logged, owner gets notified.
2. **Manager fallback** — if the story turns out to be legitimate ("I was there but forgot to clock in", "no signal"), the manager can resolve it by entering the real times, which converts it into a normal validated worked shift and removes the unauthorized mark.

Nothing about existing clock-in/out, validation, or absence endpoints changed — this is additive.

---

## 1. New Notification Type

Add to your notification type union and to whatever switch/map renders notification icons/labels:

```ts
type NotificationType =
  | /* ...existing values... */
  | 'SHIFT_NO_SHOW';
```

| Type | When it fires | Recipients | Suggested icon |
|---|---|---|---|
| `SHIFT_NO_SHOW` | An employee accepted a shift, never clocked in, and the grace period (`business.attendanceGraceMinutes`, default 15 min) has elapsed past the shift's start time | Business owner | red/warning, e.g. a "user-x" or "alert-triangle" icon |

`payload` shape on this notification:
```ts
{
  shiftId: string;
  businessId: string;
  employmentId: string;
}
```

Clicking/tapping the notification should navigate to the manager attendance or schedule view, scoped to that shift (e.g. `/manager/attendance?shiftId=...` or open the shift detail panel directly via `shiftId`).

---

## 2. `Shift.status` — `NO_SHOW` Is Now Live

`ShiftStatus` already included `NO_SHOW` in your types, but the backend never actually set it before now. It does now:

```ts
type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VALIDATED' | 'CANCELLED' | 'SICK' | 'NO_SHOW' | 'OPEN';
```

Wherever shift status badges are rendered (schedule calendar, shift list, shift detail), add a badge for `NO_SHOW`:

| Status | Badge color | Label |
|---|---|---|
| `NO_SHOW` | red | "No-show" |

When a shift flips to `NO_SHOW`, an `AbsenceRecord` is auto-created with `type: 'UNAUTHORIZED'`, `isPaid: false`, and `shiftId` set to that shift — it will show up in the existing absence log (`GET /attendance/absences`) exactly like a manually-created one. No new absence UI is required for this; the existing "Absences" tab/page already handles `UNAUTHORIZED` (see `frontend_attendance_guide.md` section 3.5/3.6).

**Important nuance for the schedule/shift views:** a `NO_SHOW` shift can be reopened — see section 3 below. After resolution it becomes `VALIDATED`, not back to `SCHEDULED`/`COMPLETED`, so make sure your status badge map also handles `VALIDATED` for shifts (it already exists in `ShiftStatus`, just confirm it's not falling through to an "unknown status" default anywhere).

---

## 3. New Endpoint — Manager Resolves a No-Show

```
POST /attendance/:shiftId/log-worked

Body:
{
  businessId:   string (UUID, required)
  checkInTime:  string (ISO 8601, required)
  checkOutTime: string (ISO 8601, required) — must be after checkInTime
  notes?:       string — optional; defaults to a system-generated note if omitted
}

Returns: Attendance (already validated — see fields below)
```

**Permission required:** same tier as editing shifts (`STAFF` / `update`). Hide or disable the action in the UI for roles that don't have shift-edit permission — the backend will 403 anyway, but don't surface a dead button.

**What it does server-side** (for context — no frontend action needed beyond calling it):
- Creates the `Attendance` record with the given times
- Computes `workedMinutes`/`regularMinutes`/`overtimeMinutes`/`regularPay`/`overtimePay`/`totalPay` exactly like a normal checkout
- Sets `isValidated: true`, `lifecycleStatus: 'VALIDATED'` immediately (no separate validation step — the manager is asserting the times directly)
- Sets the shift's `status` to `'VALIDATED'`
- Deletes the auto-created `UNAUTHORIZED` absence record tied to that shift, if one exists

**Possible errors to handle:**

| Status | Message | UI handling |
|---|---|---|
| 404 | `Shift not found` | Shouldn't normally happen from the UI flow; show generic error |
| 400 | `This shift has no assigned employee.` | N/A for accepted shifts — defensive only |
| 400 | `Cannot log worked time for a cancelled shift.` | Don't show the action for cancelled shifts |
| 400 | `Check-out time must be after check-in time.` | Validate client-side before submit, show inline field error |
| 400 | `This shift already has an attendance record — use the validate/correct flow instead.` | Means the shift isn't actually a no-show anymore (e.g. cron and a real clock-in raced) — refetch the shift/attendance and route to the existing validate modal instead |
| 403 | permission error | Don't show the action button for this role |

---

## 4. UI to Build

### 4.1 "Log as Worked" Action

**Where it appears:** anywhere a `NO_SHOW` shift is shown to a manager — the shift detail panel/modal, the schedule view's shift card, and the manager attendance overview row (if you surface shifts there). Show it whenever `shift.status === 'NO_SHOW'`. It's also safe to show on any past `SCHEDULED` shift that has no linked attendance yet (i.e. before the cron has caught up) — but the primary trigger is the `NO_SHOW` status.

Button label: **"Log as Worked"** (or "Mark as Worked" / "Resolve No-Show" — pick whichever matches your existing action-button vocabulary).

### 4.2 "Log as Worked" Modal

Triggered by the action above. Pre-fill from the shift:

| Field | Type | Pre-fill | Required |
|---|---|---|---|
| Check-in time | datetime-local | `shift.startTime` | Yes |
| Check-out time | datetime-local | `shift.endTime` | Yes |
| Notes | textarea | empty (placeholder: "e.g. confirmed by phone call, forgot to clock in") | No |

**Client-side validation:**
- `checkOutTime` must be after `checkInTime`
- Both required

**Submit:** `POST /attendance/:shiftId/log-worked` with `businessId`, `checkInTime`, `checkOutTime`, `notes`.

**On success:**
- Close modal, show success toast (e.g. "Shift marked as worked")
- Refetch the shift (status is now `VALIDATED`) and the attendance list/detail for that employee
- Refetch the absences list if it's open/cached — the `UNAUTHORIZED` entry for this shift will be gone
- Show the resulting `Attendance` like any other validated record (worked hours, pay estimate) — reuse the existing attendance summary card component from `frontend_attendance_guide.md` section 3.1's checkout summary

**On error:** see the error table in section 3 — surface the message inline, and for the "already has an attendance record" case, redirect into the existing validate flow instead of leaving the user stuck.

### 4.3 Manager Attendance / Schedule Views — No-Show Visibility

- In the manager attendance overview filters (`frontend_attendance_guide.md` section 3.3), the existing `status` filter already includes `NO_SHOW` for `AttendanceStatus` — that's a separate, still-unused enum value on `Attendance` itself (not the same as `Shift.status`). Don't confuse the two:
  - `Shift.status === 'NO_SHOW'` — **this is the real, now-live signal.** Filter/badge on this.
  - `Attendance.status === 'NO_SHOW'` — still never set by the backend; ignore for this feature.
- Add a "No-shows" quick filter or count badge to the schedule/roster view if useful (e.g. a small red counter on the week view showing how many shifts are currently `NO_SHOW` and unresolved), driven by counting `shift.status === 'NO_SHOW'` from whatever shift-list endpoint you already use (`GET /shifts`, `GET /shifts/manager-roster`, etc.) — no new endpoint needed for this, it's just a client-side filter on the existing shift status field.

---

## 5. Suggested API Client Addition

```ts
const api = {
  // ...existing attendance api functions...
  logShiftWorked: (
    shiftId: string,
    payload: { businessId: string; checkInTime: string; checkOutTime: string; notes?: string },
  ) => post(`/attendance/${shiftId}/log-worked`, payload),
};
```

---

## 6. Workflow Summary

```
Employee accepts a shift, never clocks in, goes dark for the day
  → cron (every 15 min) detects: shift.startTime + attendanceGraceMinutes has passed, no Attendance exists
  → Shift.status → 'NO_SHOW'
  → AbsenceRecord created (type: UNAUTHORIZED, isPaid: false)
  → Owner gets a SHIFT_NO_SHOW notification

Owner/manager investigates
  Case A — genuinely unauthorized:
    → leave it as is, or edit the absence (PATCH /attendance/absences/:id) to add notes /
      change isPaid, or delete it if no penalty should apply
  Case B — turns out the employee did work (forgot to clock in / no signal / etc.):
    → open the shift → "Log as Worked" → enter real check-in/out times
    → POST /attendance/:shiftId/log-worked
    → Shift.status → 'VALIDATED', Attendance created + validated with computed pay,
      the UNAUTHORIZED absence record is deleted automatically
```
