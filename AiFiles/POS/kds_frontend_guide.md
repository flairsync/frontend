# FlairSync KDS — Frontend Implementation Guide

> **Applies to:** KDS tablet app (React/Next.js or Electron)  
> **Base URL:** `https://your-api-domain`  
> **Last updated:** 2026-05-07  
> **Backend readiness:** ✅ 100% — all KDS endpoints are live.

---

## Table of Contents

1. [What is the KDS?](#1-what-is-the-kds)
2. [Authentication Model](#2-authentication-model)
3. [Setup Flow](#3-setup-flow)
4. [App Bootstrap](#4-app-bootstrap)
5. [The KDS Order Feed](#5-the-kds-order-feed)
6. [Bumping Items](#6-bumping-items)
7. [Station Status Management](#7-station-status-management)
8. [Real-time Strategy](#8-real-time-strategy)
9. [UI Patterns & Ticket Design](#9-ui-patterns--ticket-design)
10. [Complete API Reference](#10-complete-api-reference)

---

## 1. What is the KDS?

A KDS (Kitchen Display System) is a screen mounted in the kitchen that shows only the items relevant to one cooking station (e.g. Grill, Fryer, Cold Station). Chefs **bump** items as they complete them. When all items across all stations are bumped, the order auto-advances to READY and the POS is notified.

Each KDS device is a `Station` of type `kds` linked to a logical `KitchenStation` record. The `KitchenStation` defines the cooking area; the `Station` is the physical device.

```
Owner dashboard
  └── Creates KitchenStation "Grill"
  └── Pairs a tablet → type: kds
  └── Assigns kitchenStationId = "Grill" ID
        ↓
KDS tablet
  └── Authenticates with device token
  └── GET /station/kds-orders  →  only items for "Grill"
  └── PATCH …/bump             →  chef marks item done
```

---

## 2. Authentication Model

The KDS uses the **same two-token model** as the POS:

| Token | Header | Who needs it |
|---|---|---|
| Device token | `Authorization: Bearer <token>` | All KDS endpoints |
| Staff short token | `X-Staff-Token: <token>` | Bump only |

Most KDS read operations need only the device token. The bump action requires a staff token (so there's accountability for who marked what done). If your kitchen prefers to skip PIN for speed, you can make the staff token optional — but the default requires it.

```ts
function kdsHeaders(includeStaff = false): HeadersInit {
  const h: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('pos_device_token')}`,
  };
  if (includeStaff && staffShortToken) {
    h['X-Staff-Token'] = staffShortToken;
  }
  return h;
}
```

---

## 3. Setup Flow

### Step 1 — Owner creates kitchen stations (dashboard)

```
POST /businesses/:businessId/kitchen-stations
Auth: full user JWT (cookie)
Body: { "name": "Grill" }

Response: { "data": { "id": "uuid", "name": "Grill", "status": "offline", "active": true } }
```

```
GET  /businesses/:businessId/kitchen-stations   → list all
PATCH /businesses/:businessId/kitchen-stations/:ksId
  Body: { "name": "Hot Line", "status": "ready", "active": true }
DELETE /businesses/:businessId/kitchen-stations/:ksId
```

### Step 2 — Owner pairs the KDS tablet

Same pairing code flow as the POS, but with `type: "kds"`:

```
POST /station/link
Body: { "code": "ABCD1234", "deviceUuid": "...", "name": "Grill Screen", "type": "kds" }
```

### Step 3 — Owner assigns the kitchen station to the device

```
PATCH /station/businesses/:businessId/stations/:stationId
Auth: full user JWT (cookie)
Body: { "kitchenStationId": "<uuid-of-Grill-kitchen-station>" }
```

This is the link that makes `GET /station/kds-orders` know which items to show. The guard reads `kitchenStationId` live from the DB on every request, so updates take effect immediately without re-pairing.

### Step 4 — Owner assigns menu items to kitchen stations (menu management)

Each `MenuItem` has a `kitchenStationId` field. When orders are created, the station ID is snapshotted onto each `OrderItem` as `kitchenStationIdSnapshot`. The KDS feed filters on this snapshot.

---

## 4. App Bootstrap

```ts
async function bootstrap() {
  const token = localStorage.getItem('pos_device_token');
  if (!token) { showPairingScreen(); return; }

  const meRes = await fetch('/station/me', { headers: kdsHeaders() });
  if (!meRes.ok) {
    localStorage.removeItem('pos_device_token');
    showPairingScreen();
    return;
  }

  const { data: station } = await meRes.json();

  // KDS must have a kitchen station assigned
  if (!station.kitchenStationId) {
    showError('No kitchen station assigned to this device. Ask an owner to configure it in the dashboard.');
    return;
  }

  setStation(station);

  // Heartbeat every 60s
  setInterval(() => {
    fetch('/station/heartbeat', { method: 'POST', headers: kdsHeaders() });
  }, 60_000);

  // Mark station as online
  await fetch('/station/kds-station/status', {
    method: 'PATCH',
    headers: kdsHeaders(),
    body: JSON.stringify({ status: 'ready' }),
  });

  startOrderFeed();
}
```

---

## 5. The KDS Order Feed

```
GET /station/kds-orders
Auth: device token only
```

Returns only orders in `accepted` or `preparing` or `ready` status that have at least one active item for this station's `kitchenStationId`.

### Response shape

```ts
interface KdsOrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  selectedModifiers: { modifierItemId: string; name: string; price: number }[] | null;
  notes: string | null;
  status: 'pending' | 'sent' | 'ready' | 'served' | 'cancelled' | 'voided';
  kitchenStationIdSnapshot: string;
  createdAt: string;
}

interface KdsOrder {
  id: string;
  status: 'accepted' | 'preparing' | 'ready';
  type: 'dine_in' | 'takeaway' | 'delivery';
  tableId: string | null;
  tableName: string | null;
  createdAt: string;
  stationItems: KdsOrderItem[];   // items for THIS station only
  otherItemsCount: number;        // items from other stations (for progress context)
  allItemsDone: boolean;          // true when every item across all stations is READY+
}
```

### What each field means for the UI

| Field | Use |
|---|---|
| `stationItems` | The tickets to display on this KDS |
| `otherItemsCount` | Show "3 more items from other stations" indicator |
| `allItemsDone` | Show a green "ORDER COMPLETE" flash when true |
| `tableName` | Show table label on the ticket |
| `createdAt` | Age timer (how long since the order was placed) |

### Item statuses on the KDS

Items arrive as `sent` (set when the POS moves the order to `preparing`). The KDS only interacts with `sent` items — those are the ones to bump.

```
pending  →  sent  →  READY  (bumped by KDS)
                 ↘  voided / cancelled
```

Filter the display to show only `sent` items — `pending` means the order hasn't been confirmed to the kitchen yet.

---

## 6. Bumping Items

The core KDS action: chef finishes a dish and bumps the item.

```
PATCH /station/kds-orders/:orderId/items/:itemId/bump
Auth: device token + staff token

No body required.

Response:
{
  "data": {
    "item": { "id": "...", "status": "ready", ... },
    "orderStatus": "ready",      // "preparing" | "ready" — updated if all items done
    "allItemsReady": true        // true = every item across all stations is READY
  }
}
```

When `allItemsReady` is `true`, the order has auto-advanced to `ready` — play a sound or flash a banner to signal the server to pick up the food.

```ts
async function bumpItem(orderId: string, itemId: string) {
  const res = await fetch(`/station/kds-orders/${orderId}/items/${itemId}/bump`, {
    method: 'PATCH',
    headers: kdsHeaders(true),  // requires staff token
  });

  const { data } = await res.json();

  if (data.allItemsReady) {
    playReadySound();
    showOrderReadyBanner(orderId);
  }

  return data;
}
```

### Bump rules

- Only `sent` items can be bumped. `pending` items cannot (order not confirmed to kitchen yet).
- The bump is idempotent in intent — if an item is already `ready`, the API returns an error; handle gracefully by refreshing the feed.
- Auto-advance only triggers when the order is in `preparing` status. If it's already `ready` or `completed`, no state change occurs.

---

## 7. Station Status Management

The KDS device can update its own kitchen station's operational status. Use this to signal to the POS that a station is temporarily down.

```
PATCH /station/kds-station/status
Auth: device token only
Body: { "status": "ready" }   // "getting_ready" | "ready" | "broken" | "offline"
```

```ts
// Called on app open
await setKdsStatus('ready');

// Called on app close / device sleep
window.addEventListener('beforeunload', () => setKdsStatus('offline'));

async function setKdsStatus(status: string) {
  await fetch('/station/kds-station/status', {
    method: 'PATCH',
    headers: kdsHeaders(),
    body: JSON.stringify({ status }),
  });
}
```

| Status | Meaning |
|---|---|
| `getting_ready` | Station is warming up / starting shift |
| `ready` | Active and accepting items |
| `broken` | Hardware issue — items should be rerouted |
| `offline` | Screen off / app closed |

---

## 8. Real-time Strategy

Poll `GET /station/kds-orders` every **5–8 seconds**. This is tighter than the POS because kitchen responsiveness is critical.

```ts
let feedInterval: ReturnType<typeof setInterval>;

function startOrderFeed() {
  refreshFeed();
  feedInterval = setInterval(refreshFeed, 6_000);
}

async function refreshFeed() {
  const res = await fetch('/station/kds-orders', { headers: kdsHeaders() });
  if (!res.ok) return;
  const { data } = await res.json();
  reconcileFeed(data);
}

// Reconcile: diff old vs new orders to trigger sounds/animations
function reconcileFeed(incoming: KdsOrder[]) {
  const currentIds = new Set(orders.map(o => o.id));
  const newOrders = incoming.filter(o => !currentIds.has(o.id));

  if (newOrders.length > 0) {
    playNewOrderSound();
  }

  setOrders(incoming);
}
```

### Optimistic bump

Apply the bump locally immediately for instant feedback, then let the next poll sync:

```ts
async function bumpItemOptimistic(orderId: string, itemId: string) {
  // Optimistic local update
  setOrders(prev => prev.map(order => {
    if (order.id !== orderId) return order;
    return {
      ...order,
      stationItems: order.stationItems.map(item =>
        item.id === itemId ? { ...item, status: 'ready' } : item
      ),
    };
  }));

  try {
    const { data } = await bumpItem(orderId, itemId);
    if (data.allItemsReady) {
      playReadySound();
      // Remove from feed after a short delay
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }, 3000);
    }
  } catch {
    // Next poll will correct the state
  }
}
```

---

## 9. UI Patterns & Ticket Design

### Ticket card layout

```
┌─────────────────────────────────┐
│  TABLE 5      dine_in   12:34   │  ← header: table, type, age timer
│  ORDER #a3f8                    │
├─────────────────────────────────┤
│  ● Margherita Pizza  ×2         │  ← item row
│    + Extra Cheese               │  ← modifier
│    "No basil"                   │  ← notes
│                                 │
│  ● Caesar Salad      ×1         │
├─────────────────────────────────┤
│  3 items from other stations    │  ← otherItemsCount
│           [BUMP ALL]            │  ← action button
└─────────────────────────────────┘
```

### Age timer — colour coding

```ts
function ticketAgeColor(createdAt: string): string {
  const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  if (ageMinutes < 5) return 'green';
  if (ageMinutes < 10) return 'amber';
  return 'red';
}
```

### Bump All

Bump every `sent` item on the ticket in sequence:

```ts
async function bumpAll(order: KdsOrder) {
  const sentItems = order.stationItems.filter(i => i.status === 'sent');
  for (const item of sentItems) {
    await bumpItemOptimistic(order.id, item.id);
  }
}
```

### Column layout

Display tickets in a grid sorted by `createdAt ASC` (oldest first = highest priority):

```ts
const sorted = [...orders].sort(
  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
);
```

---

## 10. Complete API Reference

### Owner dashboard (full user JWT cookie)

| Method | Path | Description |
|---|---|---|
| `POST` | `/businesses/:businessId/kitchen-stations` | Create kitchen station |
| `GET` | `/businesses/:businessId/kitchen-stations` | List all kitchen stations |
| `PATCH` | `/businesses/:businessId/kitchen-stations/:ksId` | Update name / status / active |
| `DELETE` | `/businesses/:businessId/kitchen-stations/:ksId` | Delete kitchen station |
| `PATCH` | `/station/businesses/:businessId/stations/:stationId` | Assign `kitchenStationId` to device |

### KDS device — device token only (`Authorization: Bearer <device_token>`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/station/link` | Pair device (type: "kds") |
| `GET` | `/station/me` | Validate token, get station + kitchenStationId |
| `POST` | `/station/heartbeat` | Update lastSeenAt |
| `GET` | `/station/kds-orders` | Active orders filtered to this station's items |
| `PATCH` | `/station/kds-station/status` | Update kitchen station status |

### KDS device — device + staff token

| Method | Path | Description |
|---|---|---|
| `POST` | `/station/staff/pin-login` | Staff PIN → short token |
| `POST` | `/station/staff/pin-logout` | Clear staff session |
| `PATCH` | `/station/kds-orders/:orderId/items/:itemId/bump` | Mark item READY; auto-advances order if all done |

---

## Error Handling

| Error | Meaning | Action |
|---|---|---|
| `401` on device token | Token revoked | Show pairing screen |
| `401` on staff token | Session expired | Show PIN overlay |
| `400 — no kitchen station assigned` | Device not configured | Show setup prompt |
| `order_item.invalid_status` on bump | Item already bumped or not sent | Refresh feed — state is stale |
| `order.not_found` | Order was completed/cancelled | Refresh feed |

---

## Common Response Shape

```json
{ "success": true, "code": "station.kds.item_bumped", "data": { ... } }
```

Errors:
```json
{ "success": false, "code": "order_item.invalid_status", "message": "Can only bump SENT items..." }
```
