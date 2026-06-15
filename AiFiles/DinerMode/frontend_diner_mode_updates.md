# Diner Mode Updates — Call Waiter & Order Ready Notification

> Companion doc to [frontend_diner_mode_guide.md](./frontend_diner_mode_guide.md).
> Covers the two new backend features: the Call Waiter endpoint and the Order Ready push notification.

Base URL: `https://api.flairsync.com/api/v1`

---

## 1. Call Waiter

### Endpoint

```
POST /discovery/businesses/:businessId/call-waiter
Authorization: Bearer <token>   (required — user must be logged in)
Content-Type: application/json
```

### Request body

All fields are optional. Pass whichever context you have available in diner mode:

```json
{
  "tableId": "uuid-of-the-table",
  "reservationId": "uuid-of-the-reservation"
}
```

### Success response

```json
{
  "data": { "notified": 3 }
}
```

`notified` is the number of active staff members the notification was delivered to. No action needed on this value — it is just informational.

### Error responses

| Status | When |
|---|---|
| `401 / 403` | User is not logged in |
| `200` with `notified: 0` | Business has no active staff registered — still a success, not an error |

---

### Frontend implementation

The "Call Waiter" button lives in Diner Mode. Implement a **60-second cooldown** after each press to prevent accidental spam — the backend does not enforce this, it is frontend-only.

```typescript
const COOLDOWN_MS = 60_000;
let cooldownTimer: ReturnType<typeof setTimeout> | null = null;

async function callWaiter(businessId: string, tableId?: string, reservationId?: string) {
  const response = await fetch(`/api/v1/discovery/businesses/${businessId}/call-waiter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ tableId, reservationId }),
  });

  if (!response.ok) throw new Error('Failed to call waiter');
  return response.json();
}
```

#### Button state management

```typescript
const [cooldownActive, setCooldownActive] = useState(false);
const [secondsLeft, setSecondsLeft] = useState(0);

async function handleCallWaiter() {
  if (cooldownActive) return;

  await callWaiter(businessId, tableId, reservationId);

  // Start 60s cooldown
  setCooldownActive(true);
  setSecondsLeft(60);

  const interval = setInterval(() => {
    setSecondsLeft((s) => {
      if (s <= 1) {
        clearInterval(interval);
        setCooldownActive(false);
        return 0;
      }
      return s - 1;
    });
  }, 1000);
}
```

#### Button UI states

| State | Label | Behaviour |
|---|---|---|
| Ready | "Call Waiter" | Tappable, primary style |
| Cooldown | "Waiter notified (42s)" | Disabled, muted style, shows countdown |
| Loading | Spinner | Disabled while request is in flight |

---

## 2. Order Ready Notification

When kitchen staff mark an order as `ready`, the backend automatically fires a notification to the customer. No polling change is needed — this is a push event.

### What the customer receives

Via **SSE** (if permission was denied):

```json
{
  "id": "notification-uuid",
  "type": "ORDER",
  "title": "Your order is ready",
  "message": "Your order is ready to be served. Enjoy your meal!",
  "payload": {
    "orderId": "uuid",
    "businessId": "uuid",
    "tableId": "uuid-or-null"
  },
  "createdAt": "2026-05-15T20:10:00.000Z"
}
```

Via **FCM** (if permission was granted):

```
notification.title → "Your order is ready"
notification.body  → "Your order is ready to be served. Enjoy your meal!"
data.notificationId → "notification-uuid"
data.type           → "ORDER"
```

---

### How to handle it in Diner Mode

In your shared `handleIncomingNotification()` function (from the notification guide), add a branch for `ORDER` type that checks the payload:

```typescript
function handleIncomingNotification(notification: IncomingNotification) {
  if (notification.type === 'ORDER' && notification.payload?.orderId) {
    handleOrderNotification(notification);
    return;
  }
  // ...other types
}

function handleOrderNotification(notification: IncomingNotification) {
  const { orderId } = notification.payload;

  // 1. If the user is currently in Diner Mode for this order,
  //    highlight the active order card instead of showing a generic toast.
  if (isInDinerMode() && currentOrderId === orderId) {
    setOrderStatus('ready');       // update your local order state
    showOrderReadyBanner();        // pulse animation on the order card
    return;
  }

  // 2. If the app is open but not in Diner Mode (or different order),
  //    show a standard toast notification.
  showToast(notification.title, notification.message);
}
```

#### Recommended UI for "order ready" in Diner Mode

- **Pulse or highlight** the order card — do not navigate away from whatever the user is doing
- Show a persistent **"Your order is ready!"** banner at the top of the screen
- Optionally play a short sound cue (respect device silent mode)
- The banner should stay until the user dismisses it or the order status moves to `completed`

---

## 3. Connecting tableId and reservationId in Diner Mode

Both features need `tableId` and `reservationId`. These come from the active reservation you already fetched to enter Diner Mode.

```typescript
// When entering Diner Mode, store these from the SEATED reservation:
const {
  id: reservationId,
  tableId,
  businessId,
} = seatedReservation;

// Pass them to Call Waiter
callWaiter(businessId, tableId, reservationId);
```

If the user is in Diner Mode due to an active order (walk-in, no reservation), use `tableId` from the order object and pass `reservationId: undefined`.

---

## 4. API reference (new endpoints)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/discovery/businesses/:id/call-waiter` | JWT Bearer | Notify all active staff to assist |
