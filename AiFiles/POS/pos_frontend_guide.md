# FlairSync POS — Frontend Implementation Guide

> **Applies to:** React/Next.js web app or Electron desktop app  
> **Base URL:** `https://your-api-domain` (no `/api/v1` prefix — routes are at root)  
> **Last updated:** 2026-05-07  
> **Backend readiness:** ✅ 100% of core POS — all order, payment, attendance, menu, and receipt endpoints are live.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication Model](#2-authentication-model)
3. [Station Pairing & Setup](#3-station-pairing--setup)
4. [App Bootstrap](#4-app-bootstrap)
5. [Staff PIN Flow](#5-staff-pin-flow)
6. [Attendance — Clock In / Out / Breaks](#6-attendance--clock-in--out--breaks)
7. [Menu Browsing](#7-menu-browsing)
8. [Table Management](#8-table-management)
9. [Order Management](#9-order-management)
10. [Payment Processing](#10-payment-processing)
11. [Receipt](#11-receipt)
12. [Real-time Strategy](#12-real-time-strategy)
13. [Complete API Reference](#13-complete-api-reference)

---

## 1. Architecture Overview

The POS operates as a **standalone device application** (tablet/desktop). It communicates with the API using two tokens:

| Token | Header | Scope | TTL |
|---|---|---|---|
| **Device token** | `Authorization: Bearer <token>` | Bound to the physical device + business | 365 days |
| **Staff short token** | `X-Staff-Token: <token>` | Bound to a staff member's PIN session | 30 minutes |

The device token never changes unless the owner revokes the station. The staff short token is re-issued each time a staff member enters their PIN. Most read endpoints need only the device token; all write operations (orders, payments, attendance) require both.

```
POS Device
  ├── Device token (persistent, from pairing)
  └── Staff short token (30-min, from PIN login)
        ├── Clock in / out / breaks
        ├── Create & manage orders
        ├── Process payments
        └── View attendance status
```

---

## 2. Authentication Model

### Token storage

```ts
// Persist device token across reboots
localStorage.setItem('pos_device_token', token);

// In-memory only — expires in 30 min, cleared on logout
let staffShortToken: string | null = null;
```

### Request helper

```ts
function posHeaders(includeStaff = false): HeadersInit {
  const h: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('pos_device_token')}`,
  };
  if (includeStaff && staffShortToken) {
    h['X-Staff-Token'] = staffShortToken;
  }
  return h;
}

// Read calls (menu, tables, orders list)
fetch('/station/menu', { headers: posHeaders() });

// Write calls (create order, clock-in)
fetch('/station/orders', {
  method: 'POST',
  headers: posHeaders(true),
  body: JSON.stringify(dto),
});
```

---

## 3. Station Pairing & Setup

Pairing happens once when the device boots for the first time (no device token stored).

### Owner side — generate a pairing code

```
POST /station/businesses/:businessId/pairing-codes
Auth: JwtCookieGuard + BusinessOwnerGuard (owner dashboard, not the POS itself)

Response:
{
  "data": {
    "code": "ABCD1234",   // 8 characters, valid 5 minutes
    "expiresAt": "2026-05-07T14:00:00Z"
  }
}
```

### Device side — link with pairing code

```
POST /station/link
No auth required

Body:
{
  "code": "ABCD1234",
  "deviceUuid": "<uuid-v4-generated-on-first-launch>",
  "name": "Counter 1",
  "type": "pos"   // "pos" | "kds"
}

Response:
{
  "data": {
    "token": "<device_jwt>",
    "station": { "id": "...", "name": "Counter 1", "type": "pos", "businessId": "..." }
  }
}
```

```ts
async function pairDevice(code: string) {
  let deviceUuid = localStorage.getItem('device_uuid');
  if (!deviceUuid) {
    deviceUuid = crypto.randomUUID();
    localStorage.setItem('device_uuid', deviceUuid);
  }

  const res = await fetch('/station/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, deviceUuid, name: 'POS Terminal', type: 'pos' }),
  });

  const { data } = await res.json();
  localStorage.setItem('pos_device_token', data.token);
  localStorage.setItem('pos_station', JSON.stringify(data.station));
}
```

---

## 4. App Bootstrap

On every app launch, validate the device token and fetch base data.

```ts
async function bootstrap() {
  const token = localStorage.getItem('pos_device_token');
  if (!token) { showPairingScreen(); return; }

  const meRes = await fetch('/station/me', { headers: posHeaders() });
  if (!meRes.ok) {
    // 401 = token revoked by owner
    localStorage.removeItem('pos_device_token');
    showPairingScreen();
    return;
  }

  const { data: station } = await meRes.json();
  setStation(station);

  // Heartbeat every 60s
  setInterval(() => {
    fetch('/station/heartbeat', { method: 'POST', headers: posHeaders() });
  }, 60_000);

  // Prefetch in parallel
  const [menuRes, tablesRes, ordersRes] = await Promise.all([
    fetch('/station/menu', { headers: posHeaders() }),
    fetch('/station/tables', { headers: posHeaders() }),
    fetch('/station/orders', { headers: posHeaders() }),
  ]);

  setMenu((await menuRes.json()).data);
  setTables((await tablesRes.json()).data);
  setOrders((await ordersRes.json()).data);

  showPinLoginScreen();
}
```

---

## 5. Staff PIN Flow

A staff member must enter their PIN before doing anything. After 30 minutes of inactivity, they need to re-enter it.

### Manager sets PIN for a staff member (from dashboard, not the POS)

```
PATCH /employments/bus/:businessId/employees/:empId/pin
Auth: full user JWT (cookie)
Body: { "pin": "1234" }
```

### Staff enters PIN on POS

```
POST /station/staff/pin-login
Auth: device token only

Body: { "pin": "1234" }

Response:
{
  "data": {
    "employmentId": "...",
    "name": "Jane Doe",
    "roles": [{ "id": "...", "name": "Server" }],
    "shortToken": "<30-min-jwt>"
  }
}
```

```ts
interface StaffSession {
  employmentId: string;
  name: string;
  roles: { id: string; name: string }[];
  shortToken: string;
  expiresAt: number;
}

let activeStaff: StaffSession | null = null;

async function staffPinLogin(pin: string) {
  const res = await fetch('/station/staff/pin-login', {
    method: 'POST',
    headers: posHeaders(),
    body: JSON.stringify({ pin }),
  });

  if (!res.ok) throw new Error('Invalid PIN');

  const { data } = await res.json();
  activeStaff = { ...data, expiresAt: Date.now() + 30 * 60 * 1000 };
  staffShortToken = data.shortToken;
}

function staffPinLogout() {
  activeStaff = null;
  staffShortToken = null;
  fetch('/station/staff/pin-logout', { method: 'POST', headers: posHeaders() });
}

function requireStaff(): StaffSession {
  if (!activeStaff || Date.now() > activeStaff.expiresAt) {
    activeStaff = null;
    staffShortToken = null;
    showPinLoginOverlay();
    throw new Error('Staff session expired');
  }
  return activeStaff;
}
```

Show the PIN overlay on any API call that returns `401` with a staff token error:

```ts
async function posWrite(url: string, method = 'POST', body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: posHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const err = await res.json();
    if (err.message?.includes('staff')) {
      showPinLoginOverlay();
      return null;
    }
  }
  return res.json();
}
```

---

## 6. Attendance — Clock In / Out / Breaks

All endpoints require device token + staff short token.

### Clock in

```
POST /station/staff/attendance/clock-in
Body (all optional): { "shiftId": "uuid", "location": { "lat": 48.8, "lng": 2.3 } }
```

### Clock out

```
POST /station/staff/attendance/clock-out
Body (optional): { "location": { "lat": 48.8, "lng": 2.3 } }
```

### Break start / end

```
POST /station/staff/attendance/break/start
Body (optional): { "type": "PAID" }   // "PAID" | "UNPAID"

POST /station/staff/attendance/break/end
Body: {}
```

### Get today's status

```
GET /station/staff/attendance/status

Response:
{
  "data": {
    "attendance": {
      "id": "...",
      "checkInTime": "2026-05-07T09:00:00Z",
      "checkOutTime": null,
      "status": "PRESENT",           // PRESENT | LATE | ON_BREAK | NO_SHOW
      "lifecycleStatus": "ONGOING",  // ONGOING | FINISHED | VALIDATED
      "breaks": [
        { "start": "2026-05-07T12:00:00Z", "end": null, "type": "UNPAID" }
      ]
    },
    "shifts": [ ... ]
  }
}
```

### UI state machine

```ts
type ClockState = 'not_clocked_in' | 'clocked_in' | 'on_break';

function deriveClockState(attendance: any): ClockState {
  if (!attendance || attendance.lifecycleStatus === 'FINISHED') return 'not_clocked_in';
  if (attendance.status === 'ON_BREAK') return 'on_break';
  if (attendance.checkInTime && !attendance.checkOutTime) return 'clocked_in';
  return 'not_clocked_in';
}
```

---

## 7. Menu Browsing

```
GET /station/menu
Auth: device token only
```

### Type definitions

```ts
interface ModifierItem { id: string; name: string; price: number; isDefault: boolean; }
interface ModifierGroup { id: string; name: string; minSelections: number; maxSelections: number; items: ModifierItem[]; }
interface MenuVariant { id: string; name: string; price: number; }
interface MenuItem {
  id: string; name: string; description: string; price: number;
  imageUrl: string | null; isAvailable: boolean;
  variants: MenuVariant[]; modifierGroups: ModifierGroup[];
}
interface MenuCategory { id: string; name: string; items: MenuItem[]; }
interface Menu { id: string; name: string; categories: MenuCategory[]; }
```

### Cart model

```ts
interface CartItem {
  menuItemId: string;
  variantId?: string;
  quantity: number;
  modifiers: { modifierItemId: string }[];
  notes?: string;
  // local display helpers (not sent to API)
  _displayName: string;
  _unitPrice: number;
}
```

---

## 8. Table Management

```
GET /station/tables
Auth: device token only
```

```ts
interface Table {
  id: string; name: string; capacity: number; number: number | null;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_service';
  position: { x: number; y: number; width?: number; height?: number; shape?: 'circle' | 'rectangle' } | null;
  floorId: string;
}
```

Tables update automatically when orders are created (→ `occupied`) and completed (→ `available`). Poll every 15 seconds to keep the floor map fresh.

**Transfer an order to another table:**
```
PATCH /station/orders/:id/transfer
Auth: device + staff tokens
Body: { "tableId": "<new-table-uuid>" }
```

---

## 9. Order Management

### 9.1 Create an order

```
POST /station/orders
Auth: device + staff tokens

Body:
{
  "type": "dine_in",       // "dine_in" | "takeaway" | "delivery"
  "tableId": "uuid",       // required for dine_in
  "items": [
    {
      "menuItemId": "uuid",
      "variantId": "uuid",     // optional
      "quantity": 2,
      "modifiers": [{ "modifierItemId": "uuid" }],
      "notes": "No onions"     // optional
    }
  ],
  "discountAmount": 5.00,  // optional flat discount
  "reservationId": "uuid", // optional
  "customerId": "uuid"     // optional
}
```

### 9.2 View orders

```
GET /station/orders           → last 200 orders
GET /station/orders/:id       → single order with items + payments
```

### 9.3 State transitions

```
CREATED → ACCEPTED → PREPARING → READY → COMPLETED
    ↓           ↓         ↓         ↓
  REJECTED   CANCELED  CANCELED  CANCELED
```

| Action | Endpoint | Notes |
|---|---|---|
| Accept | `PATCH /station/orders/:id/accept` | Deducts inventory |
| Reject | `PATCH /station/orders/:id/reject` | Body: `{ "reason": "..." }` |
| Start preparing | `PATCH /station/orders/:id/prepare` | Items → SENT |
| Mark ready | `PATCH /station/orders/:id/ready` | Items → READY |
| Complete | `PATCH /station/orders/:id/complete` | Items → SERVED; table freed |
| Cancel | `PATCH /station/orders/:id/cancel` | Body: `{ "reason": "..." }` |

**Complete with unpaid balance** (force-close):
```ts
await posWrite(`/station/orders/${id}/complete`, 'PATCH', {
  force: true,
  notes: 'Complimentary — manager approved',
});
```

### 9.4 Item management

```
POST   /station/orders/:id/items            → add items (same shape as create)
PATCH  /station/orders/:id/items/:itemId    → update quantity/notes
DELETE /station/orders/:id/items/:itemId    → void item
```

### 9.5 Item statuses

```
PENDING → SENT → READY → SERVED
               ↘ CANCELLED / VOIDED
```

`SENT` is set automatically when order moves to PREPARING. `READY` when order moves to READY. `SERVED` when order completes.

---

## 10. Payment Processing

### Add a payment

```
POST /station/orders/:id/payments
Auth: device + staff tokens
Headers: Idempotency-Key: <client-uuid>   ← strongly recommended

Body:
{
  "amount": 45.00,
  "method": "cash",    // "cash" | "card" | "online" | "other"
  "tipAmount": 5.00    // optional
}
```

Generate a UUID per payment attempt and use it as the `Idempotency-Key` to safely retry on network failure.

### Split payment

Send multiple payment requests. The order's `paymentStatus` auto-updates: `unpaid` → `partially_paid` → `paid`.

```ts
// $30 cash + $20 card
await addPayment(orderId, { amount: 30, method: 'cash' });
await addPayment(orderId, { amount: 20, method: 'card', tipAmount: 5 });
```

### Refund

```
POST /station/orders/:id/payments/:paymentId/refund
Auth: device + staff tokens
Body: {}
```

### Change calculation

```ts
const change = Math.max(0, cashTendered - order.totalAmount);
```

### Order payment fields

```json
{
  "totalAmount": 50.00,
  "totalPaid": 30.00,
  "totalTip": 0.00,
  "paymentStatus": "partially_paid"
}
```

---

## 11. Receipt

```
GET /station/orders/:id/receipt
Auth: device token only

Response:
{
  "data": {
    "orderId": "uuid",
    "type": "dine_in",
    "status": "completed",
    "paymentStatus": "paid",
    "tableId": "uuid",
    "tableName": "Table 5",
    "items": [
      {
        "id": "uuid",
        "name": "Margherita Pizza",
        "quantity": 2,
        "unitPrice": 14.50,
        "modifiers": [{ "name": "Extra Cheese", "price": 1.50 }],
        "totalPrice": 32.00,
        "status": "served",
        "notes": null
      }
    ],
    "subtotal": 32.00,
    "discountAmount": 0,
    "taxAmount": 0,
    "totalAmount": 32.00,
    "totalPaid": 32.00,
    "totalTip": 3.00,
    "payments": [
      { "id": "uuid", "method": "card", "amount": 32.00, "tipAmount": 3.00, "status": "success" }
    ],
    "createdAt": "2026-05-07T19:30:00Z",
    "closedAt": "2026-05-07T20:15:00Z"
  }
}
```

Items with status `voided` or `cancelled` are excluded from the receipt automatically.

```ts
async function printReceipt(orderId: string) {
  const res = await fetch(`/station/orders/${orderId}/receipt`, {
    headers: posHeaders(),
  });
  const { data: receipt } = await res.json();

  // Browser print
  const win = window.open('', '_blank');
  win.document.write(renderReceiptHtml(receipt));
  win.print();

  // Or: Electron thermal printer
  // window.electronAPI.printReceipt(receipt);
}
```

---

## 12. Real-time Strategy

Use polling — there is no WebSocket subscription for the station.

| Resource | Interval | Reason |
|---|---|---|
| Orders | 10 seconds | Active order status changes |
| Tables | 15 seconds | Floor map freshness |
| Menu | 5 minutes | Item availability changes |
| Attendance status | On action only | Fetch after clock-in/out/break |

```ts
function startPolling() {
  setInterval(async () => {
    const { data } = await fetch('/station/orders', { headers: posHeaders() }).then(r => r.json());
    setOrders(data);
  }, 10_000);

  setInterval(async () => {
    const { data } = await fetch('/station/tables', { headers: posHeaders() }).then(r => r.json());
    setTables(data);
  }, 15_000);
}
```

**Optimistic updates** — apply state changes locally immediately, rely on the poll to sync:

```ts
async function acceptOrder(orderId: string) {
  setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));
  await posWrite(`/station/orders/${orderId}/accept`, 'PATCH');
}
```

---

## 13. Complete API Reference

### Device token only (`Authorization: Bearer <device_token>`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/station/link` | Pair device (no auth at all) |
| `GET` | `/station/me` | Station info + business |
| `POST` | `/station/heartbeat` | Update `lastSeenAt` |
| `GET` | `/station/menu` | Full active menu tree |
| `GET` | `/station/tables` | All tables with status |
| `GET` | `/station/orders` | Last 200 orders |
| `GET` | `/station/orders/:id` | Single order with items + payments |
| `GET` | `/station/orders/:id/receipt` | Structured receipt |
| `POST` | `/station/staff/pin-login` | PIN → staff short token |
| `POST` | `/station/staff/pin-logout` | Client-side clear (no server state) |

### Device token + staff token (`Authorization` + `X-Staff-Token`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/station/staff/attendance/clock-in` | Clock in |
| `POST` | `/station/staff/attendance/clock-out` | Clock out |
| `POST` | `/station/staff/attendance/break/start` | Start break |
| `POST` | `/station/staff/attendance/break/end` | End break |
| `GET` | `/station/staff/attendance/status` | Today's attendance + shifts |
| `POST` | `/station/orders` | Create order |
| `PATCH` | `/station/orders/:id/accept` | CREATED → ACCEPTED |
| `PATCH` | `/station/orders/:id/reject` | CREATED → REJECTED |
| `PATCH` | `/station/orders/:id/prepare` | ACCEPTED → PREPARING |
| `PATCH` | `/station/orders/:id/ready` | PREPARING → READY |
| `PATCH` | `/station/orders/:id/complete` | READY → COMPLETED |
| `PATCH` | `/station/orders/:id/cancel` | Any active → CANCELED |
| `PATCH` | `/station/orders/:id/transfer` | Move order to another table |
| `POST` | `/station/orders/:id/items` | Add items |
| `PATCH` | `/station/orders/:id/items/:itemId` | Update item |
| `DELETE` | `/station/orders/:id/items/:itemId` | Void item |
| `POST` | `/station/orders/:id/payments` | Add payment |
| `POST` | `/station/orders/:id/payments/:paymentId/refund` | Refund payment |

### Owner dashboard only (full user JWT cookie)

| Method | Path | Description |
|---|---|---|
| `POST` | `/station/businesses/:businessId/pairing-codes` | Generate pairing code |
| `GET` | `/station/businesses/:businessId/stations` | List stations |
| `PATCH` | `/station/businesses/:businessId/stations/:stationId` | Rename station |
| `DELETE` | `/station/businesses/:businessId/stations/:stationId` | Revoke station |
| `PATCH` | `/employments/bus/:businessId/employees/:empId/pin` | Set staff PIN |

---

## Common Response Shape

```json
{ "success": true, "code": "station.order.created", "data": { ... } }
```

Errors:
```json
{ "success": false, "code": "order.invalid_transition", "message": "Cannot transition..." }
```

- `401` on device token → show pairing screen
- `401` on staff token → show PIN overlay
