# Frontend Implementation Guide — Attendance System

> Backend branch: `Reservations-and-orders`
> Base API prefix: `/attendance`
> Auth: session cookie (JwtCookieGuard) — no token in headers needed.
> All responses: `{ success: true, message: string, data: T }`
> All timestamps: ISO 8601 strings. All pay values: decimals (not cents).

---

## 1. Types & Enums

```ts
// ── Attendance ────────────────────────────────────────────────────────────
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'NO_SHOW' | 'ON_BREAK';
export type AttendanceLifecycleStatus = 'ONGOING' | 'FINISHED' | 'VALIDATED';

export interface BreakEntry {
  start: string;       // ISO
  end: string | null;  // null if break still in progress
  type: 'PAID' | 'UNPAID';
}

export interface Attendance {
  id: string;
  businessId: string;
  employmentId: string;
  shiftId: string | null;

  checkInTime: string;         // ISO
  checkOutTime: string | null; // ISO — null while ONGOING

  breaks: BreakEntry[];

  status: AttendanceStatus;
  lifecycleStatus: AttendanceLifecycleStatus;

  notes: string | null;

  checkInLocation: { lat: number; lng: number } | null;
  checkOutLocation: { lat: number; lng: number } | null;
  isOutOfGeofence: boolean;

  // Computed on checkout (null while ONGOING)
  workedMinutes: number | null;
  regularMinutes: number | null;
  overtimeMinutes: number | null;
  regularPay: number | null;
  overtimePay: number | null;
  totalPay: number | null;

  isValidated: boolean;
  validatedAt: string | null;
  validatedById: string | null;

  createdAt: string;
  updatedAt: string;

  // Relations (when loaded)
  employment?: {
    id: string;
    hourlyRate: number;
    professionalProfile: { firstName: string; lastName: string };
  };
  shift?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  validatedBy?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
}

// Paginated list response shape
export interface AttendancePage {
  data: Attendance[];
  total: number;
  page: number;
  limit: number;
}

// ── Absence ───────────────────────────────────────────────────────────────
export type AbsenceType =
  | 'SICK_LEAVE'
  | 'UNAUTHORIZED'
  | 'PERSONAL_EMERGENCY'
  | 'APPROVED_LEAVE';

export interface AbsenceRecord {
  id: string;
  businessId: string;
  employmentId: string;
  attendanceId: string | null;
  shiftId: string | null;
  date: string;          // 'YYYY-MM-DD'
  type: AbsenceType;
  notes: string | null;
  documentUrl: string | null;
  timeOffRequestId: string | null;
  recordedById: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (when loaded)
  employment?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
  shift?: { id: string; startTime: string; endTime: string };
  recordedBy?: {
    id: string;
    professionalProfile: { firstName: string; lastName: string };
  };
}

// ── Attendance Summary (per employee, for a period) ───────────────────────
export interface AttendanceSummaryEntry {
  employmentId: string;
  employeeName: string;
  hourlyRate: number;
  totalWorkedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  currency: string;
  attendanceCount: number;
  attendanceIds: string[];
}
```

---

## 2. API Reference

### 2.1 Clock In

```
POST /attendance/check-in

Body:
{
  businessId:   string (UUID, required)
  employmentId: string (UUID, required)
  shiftId:      string (UUID, optional) — link to the shift being worked
  location:     { lat: number; lng: number } (optional, required if business.requireGpsForAttendance)
}

Returns: Attendance
```

**Possible errors:**
- `400 Already checked in` — user has an active attendance
- `400 GPS location is required` — business enforces GPS
- `400 Clock-in rejected: You are Xm away` — outside geofence (strict mode)
- `400 This shift does not belong to you`
- `400 You cannot clock into a cancelled shift`

---

### 2.2 Clock Out

```
POST /attendance/check-out

Body:
{
  businessId:   string (UUID, required)
  employmentId: string (UUID, required)
  location:     { lat: number; lng: number } (optional)
}

Returns: Attendance (with workedMinutes, regularMinutes, overtimeMinutes, regularPay, overtimePay, totalPay populated)
```

After checkout, `lifecycleStatus` becomes `'FINISHED'` and all computed pay fields are set.

---

### 2.3 Start Break

```
POST /attendance/break/start

Body:
{
  businessId:   string (UUID, required)
  employmentId: string (UUID, required)
  type:         'PAID' | 'UNPAID' (optional, default 'UNPAID')
}

Returns: Attendance (status becomes 'ON_BREAK')
```

---

### 2.4 End Break

```
POST /attendance/break/end

Body:
{
  businessId:   string (UUID, required)
  employmentId: string (UUID, required)
}

Returns: Attendance (status returns to 'PRESENT')
```

---

### 2.5 Get Today's Status (Staff View)

Primary endpoint for the staff clock-in widget. Returns today's shifts and current attendance.

```
GET /attendance/today?businessId=<uuid>[&date=YYYY-MM-DD]

Returns:
{
  shifts: Shift[]      — today's shifts for the user
  attendance: Attendance | null  — active or most recent attendance record today
}
```

---

### 2.6 Get My Attendance History (Staff)

```
GET /attendance/me
  ?businessId=<uuid>       (required)
  [&startDate=YYYY-MM-DD]
  [&endDate=YYYY-MM-DD]
  [&lifecycleStatus=ONGOING|FINISHED|VALIDATED]
  [&page=1]
  [&limit=50]              (max 200)

Returns: AttendancePage { data, total, page, limit }
```

---

### 2.7 Get All Attendance — Manager View

```
GET /attendance/business/:businessId
  [?startDate=YYYY-MM-DD]
  [&endDate=YYYY-MM-DD]
  [&employmentId=<uuid>]
  [&lifecycleStatus=ONGOING|FINISHED|VALIDATED]
  [&status=PRESENT|LATE|NO_SHOW|ON_BREAK]
  [&page=1]
  [&limit=50]

Returns: AttendancePage { data, total, page, limit }
```

Also available as `GET /attendance?businessId=<uuid>&...` (same params, same response).

---

### 2.8 Get Single Attendance Record

```
GET /attendance/:id

Returns: Attendance (with employment, shift, and validatedBy relations)
```

---

### 2.9 Validate Attendance — Manager

```
POST /attendance/:id/validate

Body:
{
  adminId:    string (UUID, required) — manager's employmentId
  updateData: {                        — optional corrections before locking
    checkInTime?:  string (ISO)
    checkOutTime?: string (ISO)
    notes?:        string
  }
}

Returns: Attendance (lifecycleStatus = 'VALIDATED', pay fields recomputed if times changed)
```

**Note:** Validation is irreversible. Show a confirmation dialog before calling.

---

### 2.10 Attendance Summary (OT + Pay Breakdown)

Only includes `VALIDATED` records. Uses weekly OT threshold — this is the authoritative pay figure.

```
GET /attendance/summary
  ?businessId=<uuid>      (required)
  &startDate=YYYY-MM-DD   (required)
  &endDate=YYYY-MM-DD     (required)
  [&employmentId=<uuid>]

Returns: AttendanceSummaryEntry[]
```

---

### 2.11 Create Absence Record — Manager

```
POST /attendance/absences

Body:
{
  businessId:        string (UUID, required)
  employmentId:      string (UUID, required)
  date:              string ('YYYY-MM-DD', required)
  type:              AbsenceType (required)
  attendanceId?:     string (UUID) — link to the NO_SHOW attendance record
  shiftId?:          string (UUID) — the missed shift
  timeOffRequestId?: string (UUID) — if absence was pre-approved via time-off request
  recordedById?:     string (UUID) — manager's employmentId
  notes?:            string
  documentUrl?:      string — e.g. uploaded doctor's note
}

Returns: AbsenceRecord
```

---

### 2.12 List Absences — Manager

```
GET /attendance/absences
  ?businessId=<uuid>      (required)
  [&employmentId=<uuid>]

Returns: AbsenceRecord[]
```

---

### 2.13 My Absences — Staff

```
GET /attendance/absences/me
  ?employmentId=<uuid>    (required)

Returns: AbsenceRecord[]
```

---

### 2.14 Single Absence Record

```
GET /attendance/absences/:id

Returns: AbsenceRecord (with employment, shift, recordedBy relations)
```

---

### 2.15 Update Absence Record

```
PATCH /attendance/absences/:id

Body (all optional):
{
  type?:        AbsenceType
  notes?:       string
  documentUrl?: string
}

Returns: AbsenceRecord
```

---

### 2.16 Delete Absence Record

```
DELETE /attendance/absences/:id

Returns: null
```

---

## 3. Pages & Screens to Build

---

### 3.1 Staff Clock-In Widget

**Used by:** individual staff on their own dashboard.

**Primary data source:** `GET /attendance/today?businessId=...`

**States to render:**

| State | Condition | UI |
|---|---|---|
| Not clocked in | `attendance === null` or `attendance.checkOutTime !== null` | Show shift info + "Clock In" button |
| Clocked in / on shift | `attendance.lifecycleStatus === 'ONGOING'` and `attendance.status !== 'ON_BREAK'` | Show elapsed time + "Start Break" + "Clock Out" buttons |
| On break | `attendance.status === 'ON_BREAK'` | Show break elapsed time + "End Break" button |
| Finished (not validated) | `attendance.lifecycleStatus === 'FINISHED'` | Show summary card (hours worked, pay estimate) |
| Validated | `attendance.lifecycleStatus === 'VALIDATED'` | Show locked summary card with validated badge |

**Elapsed time display:**
```ts
// Poll or update via setInterval every second while ONGOING
function getElapsed(checkInTime: string): string {
  const diff = dayjs().diff(dayjs(checkInTime), 'second');
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}
```

**Clock in flow:**
1. Fetch today shifts → let user pick a shift (optional) or clock in free
2. If `business.requireGpsForAttendance`, call `navigator.geolocation.getCurrentPosition()` first
3. `POST /attendance/check-in` with location if available
4. On success: refetch `GET /attendance/today`

**Break flow:**
- Start: show dropdown to select PAID or UNPAID (default UNPAID) → `POST /attendance/break/start`
- End: `POST /attendance/break/end`
- Live break timer resets from break `start` time

**Clock out flow:**
1. Optionally get GPS
2. `POST /attendance/check-out`
3. Show checkout summary card:
   - Worked: `minutesToHoursLabel(workedMinutes)`
   - Regular: `minutesToHoursLabel(regularMinutes)` | Overtime: `minutesToHoursLabel(overtimeMinutes)`
   - Est. Pay: `{currency} {totalPay}` (or `—` if hourlyRate is 0)

```ts
function minutesToHoursLabel(minutes: number | null): string {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
```

---

### 3.2 Staff Attendance History Page

**Route:** `/staff/attendance`

**Data:** `GET /attendance/me?businessId=...&page=1&limit=30`

**Filters (UI):**
- Date range picker (sets `startDate` / `endDate`)
- Status filter: All / Ongoing / Finished / Validated (`lifecycleStatus`)

**Table columns:**
| Date | Clock In | Clock Out | Status | Worked | Est. Pay | Lifecycle |

- Date: `dayjs(checkInTime).format('MMM D, YYYY')`
- Worked: `minutesToHoursLabel(workedMinutes)` — show `—` if null
- Est. Pay: `{currency} {totalPay}` — show `—` if null or hourlyRate = 0
- Lifecycle badge:
  - `ONGOING` → green dot + "Active"
  - `FINISHED` → yellow + "Pending validation"
  - `VALIDATED` → blue + "Validated"

**Row click:** open detail drawer/modal calling `GET /attendance/:id`

**Pagination:** show `page X of Y` with prev/next using `total / limit`

---

### 3.3 Manager Attendance Overview Page

**Route:** `/manager/attendance`

**Data:** `GET /attendance/business/:businessId` with filters

**Filters:**
- Date range picker (required — default to current week)
- Employee dropdown (optional — `employmentId`)
- Lifecycle status tabs: All | Pending Validation | Validated
- Attendance status filter: All | Present | Late | No Show

**Table columns:**
| Employee | Date | Clock In | Clock Out | Status | Worked | OT | Pay Estimate | Lifecycle | Actions |

**Lifecycle badge colors:**
- `ONGOING` → green
- `FINISHED` → amber (pending validation)
- `VALIDATED` → blue/indigo

**Status badge colors:**
- `PRESENT` → green
- `LATE` → amber
- `NO_SHOW` → red
- `ON_BREAK` → purple

**Out of geofence indicator:** show a location warning icon if `isOutOfGeofence: true`

**Actions per row:**
- View detail → `GET /attendance/:id`
- Validate → opens validation modal (see 3.4)
- Categorise Absence → shown only when `status === 'NO_SHOW'` (opens absence modal, see 3.6)

---

### 3.4 Attendance Validation Modal

Opened from the manager overview. Calls `GET /attendance/:id` to pre-fill data.

**Fields:**
- Clock In Time (datetime-local, pre-filled from `checkInTime`, editable)
- Clock Out Time (datetime-local, pre-filled from `checkOutTime`, editable — disabled if null)
- Notes (textarea, optional)

**Preview section** (computed client-side as user edits times, confirmed server-side on save):
- Worked: `(checkOut - checkIn) minutes - unpaid break minutes`
- Show estimated pay using `employment.hourlyRate`

**Submit:** `POST /attendance/:id/validate` with `adminId` and `updateData` if changed

**UX rules:**
- Show confirmation dialog: "This will lock the record and cannot be undone."
- Disable form if `isValidated: true`
- Show `validatedBy` name and `validatedAt` time if already validated

---

### 3.5 Absence Log Page

**Route:** `/manager/absences`

**Data:** `GET /attendance/absences?businessId=...`

**Filters:**
- Employee dropdown
- Absence type filter (multi-select)
- Date range picker

**Table columns:**
| Employee | Date | Type | Linked Shift | Notes | Document | Recorded By | Actions |

**Type badges:**
| Value | Label | Color |
|---|---|---|
| `SICK_LEAVE` | Sick Leave | yellow |
| `UNAUTHORIZED` | Unauthorized | red |
| `PERSONAL_EMERGENCY` | Personal Emergency | orange |
| `APPROVED_LEAVE` | Approved Leave | green |

**Actions:** Edit (PATCH) | Delete | View linked shift

**Create button:** Opens the absence creation modal (3.6)

---

### 3.6 Create / Edit Absence Modal

**Used when:** manager clicks "Categorise Absence" on a NO_SHOW attendance record, OR "Add Absence" from the absence log.

**Form fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Employee | lookup | Yes | pre-filled from attendance row |
| Date | date picker | Yes | pre-filled from attendance date |
| Absence Type | select | Yes | AbsenceType enum |
| Linked Shift | read-only | No | show shift time if `shiftId` is available |
| Linked Attendance | read-only | No | show check-in time if `attendanceId` is available |
| Linked Time-Off Request | UUID text / picker | No | optional — for APPROVED_LEAVE |
| Notes | textarea | No | |
| Document URL | text input | No | URL to uploaded document (e.g. doctor's note) |

**Submit (create):** `POST /attendance/absences`

**Submit (edit):** `PATCH /attendance/absences/:id` (only type, notes, documentUrl are editable)

---

### 3.7 Staff Absence History (Self-View)

**Route:** `/staff/absences`

**Data:** `GET /attendance/absences/me?employmentId=...`

Read-only view. Columns: Date | Type | Notes | Document.

---

## 4. Business Config Flags Affecting the UI

Read these from the business object and conditionally show/hide UI elements:

| Field | Type | Default | UI Impact |
|---|---|---|---|
| `requireGpsForAttendance` | boolean | false | Request geolocation before clock-in/out; show error if denied |
| `attendanceGeofenceRadiusMeters` | number | 100 | Show "must be within Xm" hint |
| `strictGeofenceBlock` | boolean | true | If false: show "you're outside the zone (warning only)" toast instead of blocking |
| `overtimeDailyThresholdHours` | number | 8 | Used in pay display labels: "OT after 8h" |
| `overtimeWeeklyThresholdHours` | number | 40 | Used in summary/payroll labels |
| `overtimeMultiplier` | number | 1.5 | Display as "1.5× for overtime" |
| `timezone` | string | 'UTC' | Use for all date display and period pickers |
| `currency` | string | 'USD' | Prefix all monetary values |

---

## 5. Breaks Display

Show breaks inline within an attendance detail:

```
Break 1:  10:30 – 10:45  (UNPAID, 15m)
Break 2:  13:00 – 13:30  (UNPAID, 30m)
```

If `end === null`, the break is currently in progress — show a live timer.

Total paid break time and total unpaid break time can be summed from the `breaks` array.

> Only UNPAID breaks are deducted from `workedMinutes`. PAID breaks are tracked but don't reduce pay.

---

## 6. Out-of-Geofence Handling

If `isOutOfGeofence: true` on a record, show a location warning indicator.

Differentiate by `strictGeofenceBlock` business setting:
- **Strict (blocked):** user could not clock in at all outside geofence. If the flag is set, it means the business changed to non-strict after the record was created. Show warning.
- **Warning-only:** user was allowed in but flagged. Show amber warning: "Clocked in/out outside the allowed zone."

---

## 7. Validation Rules to Enforce in the Frontend

| Rule | Where |
|---|---|
| `checkOutTime` must be after `checkInTime` in validation modal | Validation modal |
| `date` in absence form must be a valid calendar date in `YYYY-MM-DD` format | Absence modal |
| `type` (AbsenceType) is required on absence creation | Absence modal |
| `businessId` and `employmentId` are required for all clock-in/out | Clock-in widget |
| Request geolocation before clock-in if `requireGpsForAttendance: true` | Clock-in widget |
| Do not show pay figures if `employment.hourlyRate === 0` — show "Hourly rate not set" | All pay displays |
| Validation is irreversible — show a confirm dialog | Validation modal |
| Disable validate button if `lifecycleStatus !== 'FINISHED'` | Manager table |
| `GET /attendance/summary` only returns VALIDATED records — show a note if some records are FINISHED | Summary view |

---

## 8. Suggested API Client Functions

```ts
const api = {
  // Clock actions
  checkIn: (payload) => post('/attendance/check-in', payload),
  checkOut: (payload) => post('/attendance/check-out', payload),
  startBreak: (payload) => post('/attendance/break/start', payload),
  endBreak: (payload) => post('/attendance/break/end', payload),

  // Queries
  getToday: (businessId, date?) => get('/attendance/today', { businessId, date }),
  getMyAttendance: (businessId, params?) => get('/attendance/me', { businessId, ...params }),
  getBusinessAttendance: (businessId, params?) =>
    get(`/attendance/business/${businessId}`, params),
  getAttendanceById: (id) => get(`/attendance/${id}`),
  getAttendanceSummary: (businessId, startDate, endDate, employmentId?) =>
    get('/attendance/summary', { businessId, startDate, endDate, employmentId }),

  // Validation
  validateAttendance: (id, adminId, updateData?) =>
    post(`/attendance/${id}/validate`, { adminId, updateData }),

  // Absences
  createAbsence: (payload) => post('/attendance/absences', payload),
  getAbsences: (businessId, employmentId?) =>
    get('/attendance/absences', { businessId, employmentId }),
  getMyAbsences: (employmentId) => get('/attendance/absences/me', { employmentId }),
  getAbsenceById: (id) => get(`/attendance/absences/${id}`),
  updateAbsence: (id, payload) => patch(`/attendance/absences/${id}`, payload),
  deleteAbsence: (id) => del(`/attendance/absences/${id}`),
};
```

---

## 9. User Flow Summary

```
STAFF FLOW
──────────
Open dashboard
  → GET /attendance/today
  → See today's shifts + current attendance state
  → Clock in (optionally tied to a shift)
  → Start/end breaks during the shift
  → Clock out → see computed hours + estimated pay
  → View attendance history at /staff/attendance

MANAGER FLOW
────────────
Open attendance overview
  → GET /attendance/business/:businessId?lifecycleStatus=FINISHED (pending validation queue)
  → See all FINISHED records waiting for validation
  → Open a record → GET /attendance/:id
  → Correct times if needed → POST /attendance/:id/validate
  → For NO_SHOW records → POST /attendance/absences (categorise)

Absence log
  → GET /attendance/absences?businessId=...
  → Filter by employee / type / date
  → Edit or delete records as needed

Labor summary
  → GET /attendance/summary?startDate=...&endDate=...
  → See weekly OT + pay per employee
  → Hand off to payroll module (see payroll guide)
```
