# Frontend Agent: Reservation System V2 — Full Implementation Guide

## Agent Description (for spawning)
"Implement the reservation system V2 on the staff dashboard frontend. This covers: a real-time dashboard view, strict state machine UI enforcement, walk-in creation, table assignment, a reservation event timeline, customer-late recording, new business settings controls, and in-app notification handling for reservation events. All API contracts, state rules, and UI task lists are fully specified in this document."

---

## Context & What Changed

The backend reservation system has been fully rebuilt. The changes break into five areas:

1. **New endpoints** — dashboard, walk-in, table assign, events, customer-late
2. **Strict state machine** — the backend now **rejects** invalid transitions with a 400. The UI must only offer valid next actions.
3. **New business settings** — max party size, booking window, buffer, grace period, auto-no-show
4. **Event log** — every state change is recorded with source + visibility; the frontend can now show an audit timeline
5. **Notifications** — in-app notifications fire on confirmation, table-ready, cancellation, reminder (30 min before)

Base URL for all business-scoped endpoints: `GET|POST|PATCH /api/v1/businesses/:businessId/reservations`

---

## 1. State Machine — UI MUST enforce this

The backend will throw a `400 Bad Request` for any illegal transition. Never offer a button that would trigger one.

```
PENDING   → CONFIRMED  ✓
PENDING   → CANCELLED  ✓
CONFIRMED → SEATED     ✓
CONFIRMED → CANCELLED  ✓
CONFIRMED → NO_SHOW    ✓
SEATED    → COMPLETED  ✓

Any other combination → BLOCKED (do not render the action)
```

Additional terminal states (read-only, no actions available):
- `EXPIRED` — timed out while pending
- `COMPLETED` — finished
- `CANCELLED` — cancelled
- `NO_SHOW` — marked no-show

**Visual guide per status:**

| Status | Badge Color | Available Staff Actions |
|---|---|---|
| `pending` | Yellow | Confirm, Cancel |
| `confirmed` | Blue | Seat, Cancel, Mark No-Show, Assign Table |
| `seated` | Green | Complete |
| `completed` | Gray | (none) |
| `cancelled` | Red | (none) |
| `no_show` | Orange | (none) |
| `expired` | Gray | (none) |
| `waitlist` | Purple | Confirm, Cancel |

**Implementation note:** Build a `getAvailableActions(status)` helper that returns the allowed action buttons for a given status. Use it to gate every action button render.

---

## 2. Dashboard Endpoint

### `GET /api/v1/businesses/:businessId/reservations/dashboard`

Returns a single aggregated snapshot. Call this on page load and poll every 60 seconds (or use WebSocket invalidation).

**Response shape:**
```typescript
{
  data: {
    todayReservations: ReservationSummary[],   // all non-terminal for today
    currentlySeated:   ReservationSummary[],   // status === 'seated' right now
    upcoming:          ReservationSummary[],   // confirmed & starting in next 2 hours
    noShowsToday:      ReservationSummary[],   // no_show today
    stats: {
      totalToday:  number,
      confirmed:   number,
      seated:      number,
      completed:   number,
      noShow:      number,
      cancelled:   number,
    }
  }
}
```

**Dashboard UI requirements:**

- **Stats bar** at the top: 6 tiles showing `stats.*` values. Clicking a tile filters the list below.
- **"Currently Seated" section**: Live list of seated reservations with elapsed time (calculate from `reservationTime`). Show table name/number and a "Complete" button.
- **"Upcoming (next 2h)" section**: Compact cards with customer name, time, party size, table. Quick-action buttons: Seat, Cancel.
- **"All Today" section**: Full paginated table (use `GET /reservations` with today's date range for pagination). Columns: Time, Name, Party, Table, Status, Actions.
- **"No-shows today" section**: Read-only list with `noShowMarkedAt`.

---

## 3. Walk-in Creation

### `POST /api/v1/businesses/:businessId/reservations/walk-in`

Creates a reservation in `SEATED` status immediately. No date/time picker needed — it uses the current server time.

**Request payload:**
```typescript
{
  customerName:    string,         // required
  customerEmail?:  string,         // optional
  customerPhone?:  string,         // optional
  guestCount:      number,         // required, min 1
  tableId:         string,         // required (UUID) — must select a table
  notes?:          string,
  durationMinutes?: number,        // defaults to business default
}
```

**Error cases to handle:**
- `table.not_found` — show "Table not found"
- `table.occupied` — show "Table is currently occupied or has an active reservation"
- `table.capacity_exceeded` — show "Party size exceeds table capacity (X)"
- `reservation.party_too_large` — show "Exceeds maximum party size (X)"

**UI:**
- Add a **"Walk-in"** button on the dashboard (prominent, top-right area).
- Opens a slide-over/modal with a minimal form: Name (required), Phone (optional), Email (optional), Party size, Table selector (shows only AVAILABLE tables), Notes.
- Table selector should call `GET /availability?date=<now>&guestCount=<N>` when party size changes to show only viable tables.
- On success: dismiss modal, flash success toast, immediately refresh the dashboard.

---

## 4. Table Assignment / Reassignment

### `PATCH /api/v1/businesses/:businessId/reservations/:id/table`

**Request payload:**
```typescript
{ tableId: string }
```

**Behavior:**
- Backend validates no overlap (with buffer), capacity, and table existence.
- Old table is freed automatically.
- If the table is already assigned, this is a *reassignment* — treat it the same way in the UI.

**Error cases:**
- `table.not_found`
- `table.capacity_exceeded`
- `table.out_of_service`
- `reservation.overlap` — "Another reservation is using this table at this time"

**UI:**
- On the reservation detail card/row, show a **"Assign Table"** button when `status` is `pending` or `confirmed` and no table is assigned.
- Show a **"Reassign Table"** button when a table is already assigned.
- Clicking opens a table picker: call `GET /availability?date=<reservationTime>&guestCount=<guestCount>` to populate the list.
- After success, update the reservation in local state with the new table info.

---

## 5. Quick-Action Transitions

All transitions go through `PATCH /api/v1/businesses/:businessId/reservations/:id` with a `status` body field, except Cancel and No-show which have dedicated endpoints.

### Confirm
`PATCH /:id` → `{ status: "confirmed" }`  
Only render when current status is `pending` or `waitlist`.

### Seat
`PATCH /:id` → `{ status: "seated" }`  
Only render when current status is `confirmed`.  
On success: update table badge to OCCUPIED in floor-plan view if shown.

### Complete
`PATCH /:id` → `{ status: "completed" }`  
Only render when current status is `seated`.

### Cancel
`PATCH /:id/cancel` → `{ cancelReason?: string }`  
Only render when current status is `pending`, `confirmed`, or `waitlist`.  
Show a confirmation dialog with an optional text field for the cancel reason.

### Mark No-Show
`PATCH /:id/no-show`  
Only render when current status is `confirmed`.  
Show a confirmation dialog: "Mark this reservation as a no-show?"

**Error handling for all transitions:**
```
400 "Cannot transition reservation from '...' to '...'" 
→ Show: "This action is no longer available. Please refresh."
  Then refresh the reservation data.
```

---

## 6. Customer-Late Recording

### `PATCH /api/v1/businesses/:businessId/reservations/:id/customer-late`

Records a delay event without changing reservation status. Append-only.

**Request payload:**
```typescript
{
  estimatedDelayMinutes?: number,  // 1–120
  notes?: string,
}
```

**UI:**
- Add a **"Customer Running Late"** button on confirmed reservation cards (visible only when `status === 'confirmed'` and `reservationTime < now + 15min`).
- Opens a small popover: optional "Estimated delay (minutes)" number input + optional notes.
- On success: show a brief toast "Delay noted". No state change needed — just an event appended.

---

## 7. Reservation Event Timeline

### `GET /api/v1/businesses/:businessId/reservations/:id/events`

Returns the full, immutable audit log of a reservation.

**Response item shape:**
```typescript
{
  id:           string,
  type:         'created' | 'confirmed' | 'updated' | 'cancelled' | 'rejected'
              | 'seated' | 'completed' | 'no_show' | 'expired'
              | 'table_assigned' | 'table_reassigned'
              | 'reminder_sent' | 'customer_late' | 'delay_noticed',
  source:       'staff' | 'customer' | 'system',
  visibility:   'staff_only' | 'customer_visible',
  createdById:  string | null,
  createdBy:    { id, firstName, lastName } | null,
  metadata:     Record<string, any>,
  createdAt:    string,
}
```

**UI:**
- Add a **"Timeline"** tab or collapsible section inside the reservation detail view.
- Render a vertical timeline with an icon and label per event type.
- Show `source` as a small badge: 🟢 System | 🔵 Staff | 🟣 Customer.
- Show `createdBy.firstName` if available, else show source.
- `visibility: 'staff_only'` events can show a small lock icon to indicate they are not visible to customers.
- Format `createdAt` in the business timezone.

**Event type → label + icon mapping (suggested):**

| type | Label | Icon |
|---|---|---|
| `created` | Reservation created | 📅 |
| `confirmed` | Confirmed | ✅ |
| `seated` | Seated | 🪑 |
| `completed` | Completed | 🏁 |
| `cancelled` | Cancelled | ❌ |
| `no_show` | No-show | 🚫 |
| `expired` | Expired | ⏰ |
| `updated` | Details updated | ✏️ |
| `table_assigned` | Table assigned | 🪑 |
| `table_reassigned` | Table reassigned | 🔄 |
| `reminder_sent` | Reminder sent | 🔔 |
| `customer_late` | Customer running late | 🏃 |

---

## 8. Create Reservation — Updated Validations

`POST /api/v1/businesses/:businessId/reservations`

The backend now enforces additional rules. Show these errors clearly:

| Error code | User-facing message |
|---|---|
| `reservation.not_allowed` | "This business is not accepting reservations." |
| `reservation.too_far_ahead` | "Reservations can only be made up to X days in advance." |
| `reservation.past_time` | "Reservation time must be in the future." |
| `reservation.party_too_large` | "Party size exceeds the maximum allowed for this business (X guests)." |
| `reservation.outside_hours` | "The selected time is outside business opening hours." |
| `reservation.overlap` | "This table is already reserved at the requested time." |
| `table.capacity_exceeded` | "The selected table cannot accommodate X guests (capacity: Y)." |
| `table.out_of_service` | "This table is currently out of service." |

**Pre-validation in the form (before API call):**
- Read `business.maxPartySize` from the business profile and cap the guest count input.
- Read `business.reservationBookingWindowDays` and set the date picker's `maxDate` to `today + N days`.
- When picking a date/time, call `GET /availability?date=<selected>&guestCount=<N>` to populate only available tables.

**Auto-confirm feedback:**
- If `business.requireReservationConfirmation === false`, show a note on the form: "Reservations are auto-confirmed for this business."
- After creation, if the returned reservation has `status === 'confirmed'`, show "Reservation confirmed!" instead of "Reservation pending."

---

## 9. New Business Settings (Settings Page)

Add the following fields to the Reservation Settings section of the Business Settings page. All values read from `GET /businesses/:businessId` and saved via `PATCH /businesses/:businessId`.

| Field | Type | Label | Description |
|---|---|---|---|
| `maxPartySize` | number input | Max party size | Maximum guests per reservation (default 20) |
| `reservationBookingWindowDays` | number input | Booking window (days) | How far ahead customers can book (default 60) |
| `reservationBufferMinutes` | number input | Buffer between reservations (min) | Gap added between back-to-back table slots (default 0) |
| `autoNoShow` | toggle | Auto no-show | Automatically mark confirmed reservations as no-show after grace period |
| `gracePeriodMinutes` | number input (shown only when `autoNoShow` is on) | Grace period (min) | Minutes past reservation time before auto no-show triggers (default 30) |
| `requireReservationConfirmation` | toggle (existing) | Require manual confirmation | If off, reservations are auto-confirmed |
| `reservationTimeoutMinutes` | number input (existing) | Pending timeout (min) | Auto-expire pending reservations after this many minutes (default 15) |

---

## 10. In-App Notification Handling

The backend now fires `RESERVATION` type notifications for:
- **Confirmation** — "Your reservation for N on [date] has been confirmed."
- **Table ready / Seated** — "Your table is ready. Please proceed to be seated."
- **Cancellation** — "Your reservation on [date] has been cancelled."
- **Completion** — "Thanks for dining with us."
- **30-min reminder** — "Reminder: your table for N is in about 30 minutes."

These arrive via the existing in-app WebSocket notification system (`NotificationType.RESERVATION`).

**Staff dashboard:**
- Show these notifications in the existing notification bell/drawer.
- For `RESERVATION` type notifications, include a deep-link to the relevant reservation detail: `href="/businesses/:businessId/reservations/:reservationId"` (use `payload.reservationId`).

**Guest app (if applicable):**
- Surface reservation notifications as cards in the notification center.
- Show a "View reservation" CTA that navigates to the reservation detail.

---

## 11. Availability Endpoint — Updated Behaviour

`GET /api/v1/businesses/:businessId/reservations/availability?date=<ISO>&guestCount=<N>`

The backend now uses:
- Business `defaultReservationDurationMinutes` for the duration window (not hardcoded 120 min)
- `reservationBufferMinutes` to expand occupied windows
- Excludes tables with status `OUT_OF_SERVICE`

**No frontend changes required for the endpoint call itself.** Just ensure you re-fetch availability when `durationMinutes` changes on the create form (if you expose that field).

---

## 12. API Type Definitions

Update your TypeScript types/interfaces to include:

```typescript
// reservation-event.entity additions
export type EventSource = 'staff' | 'customer' | 'system';
export type EventVisibility = 'staff_only' | 'customer_visible';

export type ReservationEventType =
  | 'created' | 'confirmed' | 'updated' | 'cancelled' | 'rejected'
  | 'seated' | 'completed' | 'no_show' | 'expired'
  | 'table_assigned' | 'table_reassigned'
  | 'reminder_sent' | 'customer_late' | 'delay_noticed';

export interface ReservationEvent {
  id: string;
  reservationId: string;
  type: ReservationEventType;
  source: EventSource;
  visibility: EventVisibility;
  createdById: string | null;
  createdBy: { id: string; firstName: string; lastName: string } | null;
  metadata: Record<string, any>;
  createdAt: string;
}

// new business settings fields
interface BusinessReservationSettings {
  maxPartySize: number;
  reservationBookingWindowDays: number;
  reservationBufferMinutes: number;
  autoNoShow: boolean;
  gracePeriodMinutes: number;
  // existing fields:
  requireReservationConfirmation: boolean;
  defaultReservationDurationMinutes: number;
  reservationTimeoutMinutes: number;
  reservationCancellationWindow: number;
}

// new DTOs
interface WalkInReservationDto {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  guestCount: number;
  tableId: string;
  notes?: string;
  durationMinutes?: number;
}

interface AssignTableDto {
  tableId: string;
}

interface CustomerLateDto {
  estimatedDelayMinutes?: number;
  notes?: string;
}

// Dashboard response
interface DashboardResponse {
  todayReservations: ReservationSummary[];
  currentlySeated: ReservationSummary[];
  upcoming: ReservationSummary[];
  noShowsToday: ReservationSummary[];
  stats: {
    totalToday: number;
    confirmed: number;
    seated: number;
    completed: number;
    noShow: number;
    cancelled: number;
  };
}
```

---

## 13. Implementation Priority Order

Execute in this order to unblock other work early:

1. **Types** — update all TS interfaces/types (quick, unlocks everything else)
2. **State machine helper** — `getAvailableActions(status)` utility
3. **Dashboard page** — new page/route, stats bar, the three sections, 60s polling
4. **Walk-in modal** — button + modal + API call
5. **Table assign/reassign** — table picker on reservation card
6. **Quick actions** — Seat, Complete buttons (Confirm/Cancel already exist — update to use guard)
7. **Customer-late button** — small addition to confirmed reservation card
8. **Event timeline** — tab inside reservation detail
9. **Business settings** — new fields on settings page
10. **Notification deep-links** — update notification handler

---

## 14. Timezone Reminder (Unchanged from V1)

All dates from the backend are UTC `timestamptz`. Format using the `business.timezone` string:

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const formatted = dayjs(reservation.reservationTime)
  .tz(business.timezone)
  .format('ddd MMM D, YYYY h:mm A');
```

Apply this to `reservationTime`, `cancelledAt`, `noShowMarkedAt`, and all `ReservationEvent.createdAt` fields.
