# Frontend Implementation Guide — Overtime, Payroll & Absence

> Backend branch: `Reservations-and-orders`
> All responses follow the existing wrapper: `{ success: true, message: string, data: T }`
> All timestamps are ISO 8601. All monetary values are decimals (not cents).
> All endpoints require the session cookie (JwtCookieGuard). No token in headers needed.

---

## 1. New Enums & Types

Add these to your shared types file.

```ts
// ── Time-Off ──────────────────────────────────────────────────────────────
export type LeaveType =
  | 'VACATION'
  | 'SICK_LEAVE'
  | 'PERSONAL'
  | 'EMERGENCY'
  | 'UNPAID_LEAVE';

// ── Absence Record ────────────────────────────────────────────────────────
export type AbsenceType =
  | 'SICK_LEAVE'
  | 'UNAUTHORIZED'
  | 'PERSONAL_EMERGENCY'
  | 'APPROVED_LEAVE';

// ── Payroll ───────────────────────────────────────────────────────────────
export type PayrollStatus = 'DRAFT' | 'FINALIZED';
export type PayPeriodType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
```

---

## 2. Updated Entity Shapes

### 2.1 Attendance (updated — new fields after checkout)

```ts
interface Attendance {
  id: string;
  businessId: string;
  employmentId: string;
  shiftId: string | null;
  checkInTime: string;         // ISO
  checkOutTime: string | null; // ISO
  breaks: { start: string; end: string | null; type: 'PAID' | 'UNPAID' }[];
  status: 'PRESENT' | 'LATE' | 'NO_SHOW' | 'ON_BREAK';
  notes: string | null;
  checkInLocation: { lat: number; lng: number } | null;
  checkOutLocation: { lat: number; lng: number } | null;
  isOutOfGeofence: boolean;
  lifecycleStatus: 'ONGOING' | 'FINISHED' | 'VALIDATED';

  // ── NEW: set automatically on checkout ──
  workedMinutes: number | null;    // total minutes worked (excl. unpaid breaks)
  regularMinutes: number | null;   // workedMinutes minus daily overtime
  overtimeMinutes: number | null;  // minutes beyond daily threshold
  regularPay: number | null;       // regularMinutes/60 * hourlyRate
  overtimePay: number | null;      // overtimeMinutes/60 * hourlyRate * multiplier
  totalPay: number | null;         // regularPay + overtimePay (daily estimate)

  isValidated: boolean;
  validatedAt: string | null;
  validatedById: string | null;
  createdAt: string;
  updatedAt: string;
}
```

> **Note:** `regularPay`/`overtimePay`/`totalPay` on the attendance record are **daily estimates** using the daily threshold. The payroll preview/generate endpoints apply the **weekly** threshold which may override these and is the authoritative pay figure.

---

### 2.2 TimeOffRequest (updated — new `leaveType` field)

```ts
interface TimeOffRequest {
  id: string;
  businessId: string;
  employmentId: string;
  startDate: string;  // ISO
  endDate: string;    // ISO
  reason: string | null;
  leaveType: LeaveType;   // ← NEW — previously missing
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId: string | null;
  documentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.3 AbsenceRecord (new entity)

```ts
interface AbsenceRecord {
  id: string;
  businessId: string;
  employmentId: string;
  attendanceId: string | null;      // linked attendance record if available
  shiftId: string | null;           // the missed shift
  date: string;                     // 'YYYY-MM-DD'
  type: AbsenceType;
  notes: string | null;
  documentUrl: string | null;       // e.g. doctor's note URL
  timeOffRequestId: string | null;  // links to pre-approved time-off
  recordedById: string | null;      // manager who recorded it
  createdAt: string;
  updatedAt: string;

  // relations (when loaded)
  employment?: { id: string; professionalProfile: { firstName: string; lastName: string } };
  shift?: { id: string; startTime: string; endTime: string };
}
```

---

### 2.4 PayrollEntry (new entity)

```ts
interface PayrollEntry {
  id: string;
  businessId: string;
  employmentId: string;
  periodStart: string;              // 'YYYY-MM-DD'
  periodEnd: string;                // 'YYYY-MM-DD'
  regularMinutes: number;
  overtimeMinutes: number;
  totalWorkedMinutes: number;
  hourlyRateSnapshot: number;       // rate locked at generation time
  overtimeMultiplierSnapshot: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  currency: string;                 // e.g. 'USD'
  attendanceCount: number;
  attendanceIds: string[];
  status: PayrollStatus;
  createdAt: string;
  updatedAt: string;

  // relation (when loaded)
  employment?: { id: string; professionalProfile: { firstName: string; lastName: string } };
}
```

---

### 2.5 Business Settings (new fields)

These fields are now returned on the business object. Expose them in the **Labor Settings** section of the business settings form.

```ts
interface BusinessLaborSettings {
  // existing
  maxWeeklyHours: number;
  minGapBetweenShiftsHours: number;
  splitShiftGapHours: number;

  // ── NEW ──
  overtimeDailyThresholdHours: number;   // default 8 — hours in a day before OT starts
  overtimeWeeklyThresholdHours: number;  // default 40 — total weekly hours before OT starts
  overtimeMultiplier: number;            // default 1.5 — pay multiplier for OT hours
  payPeriodType: PayPeriodType;          // default 'WEEKLY'
}
```

---

## 3. Payroll API

Base URL: `/payroll`

---

### 3.1 Preview Payroll (no DB write)

Use this before generating — shows what the payroll would look like for a period.

```
GET /payroll/preview
  ?businessId=<uuid>
  &startDate=2025-04-01      ← YYYY-MM-DD
  &endDate=2025-04-07
  [&employmentId=<uuid>]     ← optional: filter to one employee
```

**Response `data`:**
```ts
{
  businessId: string;
  periodStart: string;
  periodEnd: string;
  payPeriodType: PayPeriodType;
  currency: string;
  entries: PayrollSummaryEntry[];  // one per employee
  totals: {
    totalWorkedHours: number;
    totalOvertimeHours: number;
    totalRegularPay: number;
    totalOvertimePay: number;
    totalPay: number;
  };
}

interface PayrollSummaryEntry {
  employmentId: string;
  employeeName: string;        // "First Last"
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

### 3.2 Generate Payroll (saves as DRAFT)

Persists entries to the database. Re-running overwrites existing DRAFT entries for the same period.

```
POST /payroll/generate
Content-Type: application/json

{
  "businessId": "<uuid>",
  "startDate": "2025-04-01",
  "endDate": "2025-04-07",
  "employmentId": "<uuid>"   // optional — omit to generate for all staff
}
```

**Response `data`:** `PayrollEntry[]`

---

### 3.3 Finalize Payroll (DRAFT → FINALIZED)

Locks the entries. Finalized entries cannot be overwritten by generate again.

```
PATCH /payroll/finalize
Content-Type: application/json

{
  "businessId": "<uuid>",
  "startDate": "2025-04-01",
  "endDate": "2025-04-07"
}
```

**Response `data`:** `PayrollEntry[]` (all now with `status: 'FINALIZED'`)

---

### 3.4 List Saved Payroll Entries

```
GET /payroll
  ?businessId=<uuid>
  [&startDate=2025-04-01]
  [&endDate=2025-04-07]
  [&employmentId=<uuid>]
  [&status=DRAFT|FINALIZED]
```

**Response `data`:** `PayrollEntry[]`

---

### 3.5 Export CSV

Triggers a file download — use `window.open()` or an `<a download>` link. Does not go through the standard JSON wrapper.

```
GET /payroll/export/csv
  ?businessId=<uuid>
  &startDate=2025-04-01
  &endDate=2025-04-07
```

**Response:** `text/csv` file download named `payroll_2025-04-01_2025-04-07.csv`

CSV columns:
```
Employee, Employment ID, Period Start, Period End, Hourly Rate,
Regular Hours, Overtime Hours, Total Hours,
Regular Pay, Overtime Pay, Total Pay, Currency, Attendance Count
```

Last row is a TOTALS summary row.

**Frontend trigger example:**
```ts
const url = `/payroll/export/csv?businessId=${businessId}&startDate=${start}&endDate=${end}`;
window.open(url, '_blank');
// or
const a = document.createElement('a');
a.href = url;
a.click();
```

---

## 4. Attendance Summary API (new endpoint)

Returns per-employee OT + pay breakdown for any date range. Uses **weekly** OT threshold (authoritative). Useful for a quick labor cost view without persisting payroll.

```
GET /attendance/summary
  ?businessId=<uuid>
  &startDate=2025-04-01
  &endDate=2025-04-07
  [&employmentId=<uuid>]
```

**Response `data`:** `PayrollSummaryEntry[]` (same shape as payroll preview entries)

> Only includes `VALIDATED` attendance records. Records that are still `ONGOING` or `FINISHED` but not yet validated are excluded.

---

## 5. Absence Record API

Base URL: `/attendance/absences`

---

### 5.1 Create Absence Record (manager action)

Called when a manager categorises a missed shift. Can be linked to an existing attendance record (e.g. a NO_SHOW) or a shift alone.

```
POST /attendance/absences
Content-Type: application/json

{
  "businessId": "<uuid>",
  "employmentId": "<uuid>",
  "date": "2025-04-05",           // YYYY-MM-DD
  "type": "SICK_LEAVE",           // AbsenceType enum
  "attendanceId": "<uuid>",       // optional — link to existing attendance
  "shiftId": "<uuid>",            // optional — the missed shift
  "timeOffRequestId": "<uuid>",   // optional — link to approved time-off
  "recordedById": "<uuid>",       // optional — manager's employmentId
  "notes": "Staff called in sick",
  "documentUrl": "https://..."    // optional — doctor's note, uploaded separately
}
```

**Response `data`:** `AbsenceRecord`

---

### 5.2 List Absences (business-wide)

```
GET /attendance/absences
  ?businessId=<uuid>
  [&employmentId=<uuid>]    ← filter to one employee
```

**Response `data`:** `AbsenceRecord[]`

---

### 5.3 List My Absences (staff-facing)

```
GET /attendance/absences/me
  ?employmentId=<uuid>
```

**Response `data`:** `AbsenceRecord[]`

---

### 5.4 Update Absence Record

```
PATCH /attendance/absences/:id

{
  "type": "UNAUTHORIZED",         // optional
  "notes": "Updated note",        // optional
  "documentUrl": "https://..."    // optional
}
```

**Response `data`:** `AbsenceRecord`

---

### 5.5 Delete Absence Record

```
DELETE /attendance/absences/:id
```

**Response `data`:** `null`

---

## 6. Updated Time-Off Request — leaveType Field

When **creating** a time-off request, include `leaveType`. The existing create endpoint (`POST /shifts/time-off`) now accepts this field.

```
POST /shifts/time-off
Content-Type: application/json

{
  "businessId": "<uuid>",
  "employmentId": "<uuid>",
  "startDate": "2025-04-10T00:00:00.000Z",
  "endDate": "2025-04-12T23:59:59.000Z",
  "leaveType": "SICK_LEAVE",    // ← NEW — required going forward
  "reason": "Not feeling well",
  "documentUrl": null
}
```

Update the time-off request form to include a `leaveType` dropdown. Default to `'PERSONAL'` if not selected.

LeaveType display labels:
| Value | Label |
|---|---|
| `VACATION` | Vacation |
| `SICK_LEAVE` | Sick Leave |
| `PERSONAL` | Personal Day |
| `EMERGENCY` | Emergency |
| `UNPAID_LEAVE` | Unpaid Leave |

---

## 7. UI Screens to Build

### 7.1 Payroll Page (`/manager/payroll`)

**Period picker:**
- Date range selector (start / end). Default to the current pay period based on `business.payPeriodType`:
  - `WEEKLY`: Mon–Sun of current week
  - `BIWEEKLY`: last 14 days
  - `MONTHLY`: 1st–last of current month

**Preview panel (before generating):**
- Call `GET /payroll/preview` on date range change
- Show a table with columns: Employee | Regular Hrs | OT Hrs | Total Hrs | Regular Pay | OT Pay | Total Pay
- Show totals row at the bottom
- "Generate Payroll" button → `POST /payroll/generate`

**Generated entries panel:**
- Call `GET /payroll` with the selected period and `status=DRAFT`
- Same table, with a status badge (`DRAFT` / `FINALIZED`)
- "Finalize" button (visible when DRAFT entries exist) → `PATCH /payroll/finalize`
- "Export CSV" button → opens `/payroll/export/csv?...`

**States to handle:**
- No validated attendance for the period → empty state with message
- Mix of validated and non-validated → show info banner "X attendance records are pending validation and are not included"

---

### 7.2 Attendance Summary Widget

Add to existing staff management / shift overview. Shows for any selected week:

| Employee | Hrs Worked | OT Hrs | Est. Pay |
|---|---|---|---|

Source: `GET /attendance/summary`

Show `—` for pay if `hourlyRate` is 0 (not configured).

---

### 7.3 Absence Log Panel (manager view)

Add a new tab "Absences" to the staff detail page or to the attendance manager page.

**List view:** Call `GET /attendance/absences?businessId=...`

Columns: Date | Employee | Type | Linked Shift | Notes | Document | Actions (Edit / Delete)

**AbsenceType display labels:**
| Value | Label | Badge color |
|---|---|---|
| `SICK_LEAVE` | Sick Leave | yellow |
| `UNAUTHORIZED` | Unauthorized | red |
| `PERSONAL_EMERGENCY` | Personal Emergency | orange |
| `APPROVED_LEAVE` | Approved Leave | green |

**Create absence modal:**
Triggered from the attendance list when a record has `status: 'NO_SHOW'` — show a "Categorise Absence" button.

Fields:
- Type (dropdown — AbsenceType)
- Date (pre-filled from shift/attendance)
- Notes (textarea)
- Document URL (text input or upload)
- Linked time-off request ID (optional — show a picker from approved time-off requests)

---

### 7.4 Business Settings — Labor & Payroll Tab

Add these fields to the business settings form under a new "Labor & Payroll" section:

```
Overtime daily threshold (hours)   [number input, default 8]
Overtime weekly threshold (hours)  [number input, default 40]
Overtime multiplier                [decimal input, default 1.5, step 0.1]
Pay period type                    [select: Weekly / Biweekly / Monthly]
```

Submit via the existing business PATCH endpoint (these are standard business fields).

---

### 7.5 Time-Off Request Form — leaveType Field

Add a required `leaveType` dropdown to the existing time-off request creation form.

Position: between "Date Range" and "Reason" fields.

---

## 8. Attendance Record — Display Updates

Wherever attendance records are shown (manager validation screen, staff history), display the new computed fields when `checkOutTime` is set:

```
Worked: 8h 30m
Regular: 8h 0m  |  Overtime: 0h 30m
Est. Pay: $127.50  (of which OT: $11.25)
```

Helper:
```ts
function minutesToHoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
```

Show `—` when `workedMinutes` is null (attendance still ONGOING or hourlyRate is 0).

> For the authoritative weekly pay figure, use the payroll preview/generate flow — not the per-attendance `totalPay` field, which is a daily estimate.

---

## 9. Workflow Summary

```
Staff checks out
  → workedMinutes, overtimeMinutes, regularPay, totalPay auto-calculated (daily basis)
  → stored on attendance record

Manager validates attendance
  → figures recomputed if times were corrected

Manager opens Payroll page
  → selects period (e.g. Mon–Sun)
  → Preview: sees weekly OT applied across all validated attendance
  → Generate: saves DRAFT entries per employee
  → Finalize: locks entries (status → FINALIZED)
  → Export CSV: downloads payroll file

Manager opens Absences tab
  → sees NO_SHOW attendance records
  → clicks "Categorise Absence"
  → selects type (SICK_LEAVE / UNAUTHORIZED / etc.)
  → absence record created, linked to shift and attendance

Staff submits time-off request
  → selects leaveType (VACATION / SICK_LEAVE / etc.)
  → manager approves → TimeOffRequest.status = APPROVED
  → if staff then doesn't show up, manager can link the absence record
    to that TimeOffRequest via timeOffRequestId
```

---

## 10. Key Validation Rules to Enforce on Frontend

| Rule | Where |
|---|---|
| `startDate` must be before `endDate` on all date range inputs | Payroll, Absence, Time-off |
| `leaveType` is required when creating a time-off request | Time-off form |
| `type` (AbsenceType) is required when creating an absence record | Absence modal |
| `businessId` and `employmentId` are required for all absence endpoints | Absence form |
| Payroll export requires at least `startDate` and `endDate` | Export button guard |
| Finalize is irreversible — show a confirmation dialog | Finalize button |
| Do not show pay figures if employee `hourlyRate === 0` — show a "Set hourly rate" prompt instead | Payroll preview, attendance cards |
