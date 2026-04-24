# Frontend Agent: Customer Reservation Timeline & Predefined Actions

## Agent Description (for spawning)
"Add a customer-facing reservation timeline screen to the guest app. It shows an append-only, chat-log-style event history of the reservation and presents a set of predefined action buttons the customer can tap (no free text). All API contracts, event types, action rules, and UI specifications are fully defined in this document."

---

## Overview

Every reservation now has a full event log. Customers can read their own events and respond with **predefined actions** — structured taps, not free text. Think airline status updates mixed with WhatsApp quick-reply buttons.

Two new endpoints power this feature:
- **Timeline** — read the customer-visible event history
- **Action** — post a predefined customer action

Both live under the existing discovery base URL: `/api/v1/discovery/businesses/:businessId/`

---

## 1. Timeline Endpoint

### `GET /api/v1/discovery/businesses/:businessId/my-reservations/:reservationId/timeline`

**Auth:** Required (JWT Bearer). Returns 403 if unauthenticated, 404 if the reservation doesn't belong to the logged-in user.

**Response:**
```typescript
{
  success: true,
  data: {
    reservation: ReservationSummary,      // the reservation itself (same shape as list items)
    events: ReservationEvent[],           // ordered oldest → newest, CUSTOMER_VISIBLE only
    availableActions: CustomerActionType[], // which action buttons to render right now
  }
}
```

**`ReservationEvent` shape (customer-visible subset):**
```typescript
interface ReservationEvent {
  id: string;
  type: ReservationEventType;
  source: 'staff' | 'customer' | 'system';
  createdAt: string;           // ISO UTC — format with business.timezone
  metadata: Record<string, any>;
}
```

**`availableActions`** is the authoritative list — render only the buttons that appear here. Never hard-code which actions to show based on status; always use this array.

---

## 2. Action Endpoint

### `POST /api/v1/discovery/businesses/:businessId/my-reservations/:reservationId/action`

**Auth:** Required.

**Request body:**
```typescript
{
  type: CustomerActionType,        // required — one of the enum values below
  estimatedDelayMinutes?: number,  // for RUNNING_LATE only (1–120)
  requestedTime?: string,          // for REQUEST_MODIFICATION (ISO date string)
  requestedGuestCount?: number,    // for REQUEST_MODIFICATION
  notes?: string,                  // optional free-text note (kept short — one-liner)
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    event: ReservationEvent,             // the newly created event, echoed back
    availableActions: CustomerActionType[], // updated list after the action
  }
}
```

On success: append `event` to the local timeline list, replace `availableActions` with the returned array.

**Error codes:**
| Code | Meaning | User message |
|---|---|---|
| `reservation.not_found` | Wrong ID | "Reservation not found." |
| `reservation.forbidden` | Not your reservation | "This reservation doesn't belong to your account." |
| `reservation.action_not_allowed` | Wrong state for this action | "This action is no longer available. Please refresh." |

---

## 3. Customer Action Types

```typescript
export type CustomerActionType =
  | 'confirm_attendance'
  | 'running_late'
  | 'request_cancellation'
  | 'request_modification'
  | 'acknowledge_delay';
```

### When each action is available

| Action | Available when status is | Meaning |
|---|---|---|
| `confirm_attendance` | `confirmed` | "I'll be there on time" |
| `running_late` | `confirmed` | "I'm running behind" |
| `acknowledge_delay` | `confirmed` | "Understood, I'll wait" (response to a staff delay notice) |
| `request_cancellation` | `pending`, `confirmed` | "Please cancel my reservation" (staff still confirms) |
| `request_modification` | `pending`, `confirmed` | "I'd like to change something" |

**Note on `request_cancellation`:** This does **not** auto-cancel the reservation. It appends an event and staff see it in their dashboard. The customer should be told: "Your cancellation request has been sent. A staff member will confirm shortly." The actual cancel button (which calls `PATCH /my-reservations/:id/cancel`) remains available for immediate self-cancel within the allowed window.

---

## 4. All Displayable Event Types

The timeline shows events of these types (all customer-visible):

| `type` value | Who creates it | Label to show customer | Icon |
|---|---|---|---|
| `created` | system/staff | "Reservation received" | 📅 |
| `confirmed` | staff/system | "Reservation confirmed" | ✅ |
| `seated` | staff | "You've been seated — enjoy!" | 🪑 |
| `completed` | staff | "Thank you for dining with us" | 🏁 |
| `cancelled` | staff/system | "Reservation cancelled" | ❌ |
| `reminder_sent` | system | "Reminder sent" | 🔔 |
| `customer_confirmed_attendance` | customer (you) | "You confirmed attendance" | 👍 |
| `customer_running_late` | customer (you) | "You reported running late" | 🏃 |
| `customer_requested_cancellation` | customer (you) | "You requested cancellation" | 🙋 |
| `customer_requested_modification` | customer (you) | "You requested a change" | ✏️ |
| `customer_acknowledged_delay` | customer (you) | "You acknowledged the wait" | 👋 |

Events where `source === 'customer'` should be visually right-aligned (like outgoing messages in a chat). Events where `source === 'staff'` or `source === 'system'` should be left-aligned (incoming).

---

## 5. UI Design — Chat Log Layout

The timeline should look like a messaging thread, not a table. Use a vertical list of bubbles:

```
┌─────────────────────────────────────────────┐
│  📅  Reservation received          10:02 AM  │  ← system (left)
│  ✅  Confirmed by restaurant        10:15 AM  │  ← staff  (left)
│  🔔  Reminder: 30 min away          6:30 PM  │  ← system (left)
│                   You confirmed attendance 👍  │  ← customer (right)
│                   You're running 10 min late 🏃 │  ← customer (right)
│  🪑  Your table is ready!           7:05 PM  │  ← staff  (left)
└─────────────────────────────────────────────┘
```

**Bubble styling rules:**
- Left (system/staff): light gray background, left-aligned text
- Right (customer): brand primary color, right-aligned, white text
- Timestamp below each bubble, formatted in the business timezone
- Source label optional — can be omitted for cleaner look since alignment already signals it
- `metadata` rendering per event type (see section 6)

---

## 6. Metadata Rendering in Bubbles

Some events carry extra data in `metadata`. Render it as a small sub-line inside the bubble:

| Event type | Metadata key(s) | Sub-line format |
|---|---|---|
| `customer_running_late` | `estimatedDelayMinutes` | "~{N} min behind schedule" |
| `customer_requested_modification` | `requestedTime`, `requestedGuestCount` | "New time: {date}" / "Party of {N}" |
| `customer_requested_cancellation` | `notes` | Show notes if present |
| `reminder_sent` | `minutesBefore` | "Sent {N} min before your reservation" |

---

## 7. Action Button Bar

Below the timeline, render the action buttons from `availableActions`. This bar updates after every action call — replace it with the returned `availableActions` array.

**Button specs per action:**

| `type` | Button label | Style | Extra input? |
|---|---|---|---|
| `confirm_attendance` | "I'll be there ✓" | Primary (filled) | None |
| `running_late` | "I'm running late" | Warning (outlined) | Number stepper: "About ___ minutes" (optional, 5/10/15/20/30) |
| `acknowledge_delay` | "I'll wait" | Secondary | None |
| `request_cancellation` | "Request cancellation" | Danger (outlined) | Optional: "Reason" text input (maps to `notes`) |
| `request_modification` | "Request a change" | Secondary (outlined) | Date picker + party size picker (both optional) |

**Interaction flow for actions with inputs:**
1. Tap the button → expand an inline form below it (or open a bottom sheet)
2. Fill in optional details
3. "Send" button submits the action
4. On success: form collapses, new bubble appears in timeline, buttons update

**Actions with no input:** tap → immediate POST → new bubble appears, no confirmation dialog needed.

---

## 8. Loading & Polling

- **Initial load:** call `GET /timeline` on component mount
- **After each action POST:** use the response data to update local state (no re-fetch needed)
- **Polling:** poll `GET /timeline` every 30 seconds to catch staff-initiated events (confirmations, table-ready) in near real-time. Stop polling once status is terminal (`completed`, `cancelled`, `no_show`, `expired`)
- **WebSocket alternative (preferred if available):** listen to `RESERVATION` type notifications via the existing in-app WebSocket. On receive, re-fetch the timeline. Cancel the poll if WebSocket is active.

---

## 9. Screen Entry Points

Show a "View Details" or "Track Reservation" link/button in:
1. **Reservation confirmation screen** (after `POST /reservations` succeeds)
2. **My Reservations list** (`GET /my-reservations`) — tapping any row opens the timeline
3. **Push/in-app notification** for `RESERVATION` type — deep-link via `payload.reservationId`

Navigation route: `/reservations/:reservationId` (or equivalent in your router)

---

## 10. TypeScript Types to Add

```typescript
export type CustomerActionType =
  | 'confirm_attendance'
  | 'running_late'
  | 'request_cancellation'
  | 'request_modification'
  | 'acknowledge_delay';

export type ReservationEventType =
  // existing types from V2 doc...
  | 'created' | 'confirmed' | 'updated' | 'cancelled' | 'rejected'
  | 'seated' | 'completed' | 'no_show' | 'expired'
  | 'table_assigned' | 'table_reassigned' | 'reminder_sent'
  | 'customer_late' | 'delay_noticed'
  // NEW customer action types:
  | 'customer_confirmed_attendance'
  | 'customer_running_late'
  | 'customer_requested_cancellation'
  | 'customer_requested_modification'
  | 'customer_acknowledged_delay';

export interface CustomerTimelineEvent {
  id: string;
  type: ReservationEventType;
  source: 'staff' | 'customer' | 'system';
  createdAt: string;
  metadata: Record<string, any>;
}

export interface CustomerTimelineResponse {
  reservation: ReservationSummary;
  events: CustomerTimelineEvent[];
  availableActions: CustomerActionType[];
}

export interface CustomerActionPayload {
  type: CustomerActionType;
  estimatedDelayMinutes?: number;
  requestedTime?: string;
  requestedGuestCount?: number;
  notes?: string;
}

export interface CustomerActionResponse {
  event: CustomerTimelineEvent;
  availableActions: CustomerActionType[];
}
```

---

## 11. API Service Functions to Add

```typescript
// Get the customer-visible timeline for a reservation
export const getReservationTimeline = (
  businessId: string,
  reservationId: string,
): Promise<CustomerTimelineResponse> =>
  api.get(`/discovery/businesses/${businessId}/my-reservations/${reservationId}/timeline`);

// Post a predefined customer action
export const postReservationAction = (
  businessId: string,
  reservationId: string,
  payload: CustomerActionPayload,
): Promise<CustomerActionResponse> =>
  api.post(
    `/discovery/businesses/${businessId}/my-reservations/${reservationId}/action`,
    payload,
  );
```

---

## 12. Implementation Steps (in order)

1. Add TypeScript types (section 10)
2. Add API service functions (section 11)
3. Build the timeline screen/component:
   - Fetch on mount
   - Render event bubbles (left/right alignment by source)
   - Render metadata sub-lines
4. Build the action button bar:
   - Driven entirely by `availableActions` array
   - Inline expand for inputs (running late → stepper, request modification → pickers)
5. Wire up action POST:
   - On success, append new bubble + replace action bar
6. Add 30s polling (stop when terminal status)
7. Add deep-link entry points (confirmation screen, list row, notification)
