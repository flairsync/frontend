# FlairSync POS — Frontend Implementation Guide

> **Applies to:** Web App (React/Next.js) and Electron Desktop App  
> **Base URL:** `https://your-api-domain/api/v1`  
> **Last updated:** 2026-04-29  
> **Backend readiness:** ~70% — taxes, post-create discounts, receipt endpoint, split-bill, and real-time KDS are NOT yet implemented. Workarounds are documented inline.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication System](#2-authentication-system)
3. [Station Setup & Pairing](#3-station-setup--pairing)
4. [App Bootstrap](#4-app-bootstrap)
5. [Main POS Screen Layout](#5-main-pos-screen-layout)
6. [Menu Browsing & Item Selection](#6-menu-browsing--item-selection)
7. [Order Management](#7-order-management)
8. [Payment Processing](#8-payment-processing)
9. [Table Management](#9-table-management)
10. [Reservations & Walk-ins](#10-reservations--walk-ins)
11. [Staff PIN Login & Session](#11-staff-pin-login--session)
12. [Real-time Updates Strategy](#12-real-time-updates-strategy)
13. [Receipt Generation (Frontend-side)](#13-receipt-generation-frontend-side)
14. [Tax & Discount Handling](#14-tax--discount-handling)
15. [Offline Resilience](#15-offline-resilience)
16. [Electron-Specific Considerations](#16-electron-specific-considerations)
17. [Complete API Reference](#17-complete-api-reference)

---

## 1. Architecture Overview

### Dual Target: Web & Electron

The POS frontend targets two runtimes that share the same codebase:

| Concern       | Web App                               | Electron                                        |
| ------------- | ------------------------------------- | ----------------------------------------------- |
| Rendering     | Browser tab                           | Chromium window (full-screen)                   |
| Storage       | `localStorage` / `sessionStorage`     | `localStorage` + `electron-store` (encrypted)   |
| Printing      | `window.print()` + CSS `@media print` | `webContents.print()` or native printer via IPC |
| Offline       | Service Worker                        | Local SQLite via main process IPC               |
| Token storage | `localStorage`                        | `electron-store` (encrypted keychain)           |
| Startup       | Load URL                              | `app.ready` → `BrowserWindow`                   |
| Updates       | Browser refresh                       | `electron-updater` auto-update                  |

### Two Token Layers

Every POS device operates with two independent tokens:

```
┌─────────────────────────────────────────────────────────┐
│  STATION TOKEN (365-day JWT)                             │
│  Stored at device level. Identifies the hardware.        │
│  Header: Authorization: Bearer <stationToken>            │
│  Routes:  /station/*                                     │
├─────────────────────────────────────────────────────────┤
│  STAFF SHORT TOKEN (30-minute JWT)                       │
│  Obtained each shift via 4-digit PIN.                    │
│  Stored in memory / React state only.                    │
│  Routes:  /businesses/:businessId/orders/*               │
│           /businesses/:businessId/floor-plan/*           │
│           (and other business routes)                    │
└─────────────────────────────────────────────────────────┘
```

The station token is permanent and device-bound. The staff token expires every 30 minutes and must be re-entered via PIN to continue.

---

## 2. Authentication System

### Token Storage Strategy

```typescript
// Station token — persists across reboots
const STATION_TOKEN_KEY = "pos_station_token";
const BUSINESS_ID_KEY = "pos_business_id";

// Staff token — in-memory only (never persisted)
let activeStaffSession: StaffSession | null = null;

interface StaffSession {
  employmentId: string;
  name: string;
  roles: { id: string; name: string }[];
  shortToken: string;
  expiresAt: number; // Date.now() + 30 * 60 * 1000
}
```

### HTTP Client Setup

Create a single Axios (or fetch wrapper) instance with interceptors:

```typescript
import axios from "axios";

const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((config) => {
  const stationToken = localStorage.getItem(STATION_TOKEN_KEY);
  const staffToken = activeStaffSession?.shortToken;

  // Station routes use station token
  if (config.url?.startsWith("/station")) {
    if (stationToken) config.headers.Authorization = `Bearer ${stationToken}`;
  } else {
    // Business routes use staff short token
    if (staffToken) config.headers.Authorization = `Bearer ${staffToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Staff session expired — show PIN pad
      clearStaffSession();
      showPinPad();
    }
    return Promise.reject(err);
  },
);
```

---

## 3. Station Setup & Pairing

This flow runs once when the app is installed on a new device, or when the device is re-paired.

### Flow Diagram

```
Owner (web dashboard)            POS Device (first launch)
        │                                    │
        │── POST /station/businesses/:id/    │
        │   pairing-codes                    │
        │◄── { code: "ABCD1234",            │
        │      expiresAt: "..." }            │
        │                                    │
        │   Shows 8-char code on screen      │
        │                                    │
        │                 User types code ──►│
        │                                    │── POST /station/link
        │                                    │   { code, deviceUuid, name, type }
        │                                    │◄── { token, station }
        │                                    │
        │                         Store token locally
```

### Pairing Code Generation (Owner Dashboard)

```typescript
// Owner action: generate a pairing code
async function generatePairingCode(businessId: string) {
  const res = await api.post(`/station/businesses/${businessId}/pairing-codes`);
  return res.data.data; // { code: "ABCD1234", expiresAt: "..." }
}
```

Display the code prominently. It expires in 5 minutes.

### Device Linking (POS App, First Launch)

```typescript
import { v4 as uuidv4 } from "uuid";

async function linkDevice(code: string, stationName: string) {
  // Generate a stable device UUID (store it permanently)
  let deviceUuid = localStorage.getItem("device_uuid");
  if (!deviceUuid) {
    deviceUuid = uuidv4();
    localStorage.setItem("device_uuid", deviceUuid);
  }

  const res = await api.post("/station/link", {
    code: code.toUpperCase(),
    deviceUuid,
    name: stationName,
    type: "pos", // or 'kds' for kitchen display
  });

  const { token, station } = res.data.data;

  // Persist station token + business ID
  localStorage.setItem(STATION_TOKEN_KEY, token);
  localStorage.setItem(BUSINESS_ID_KEY, station.businessId);

  return station;
}
```

### Checking if Device is Paired

```typescript
function isPaired(): boolean {
  return !!localStorage.getItem(STATION_TOKEN_KEY);
}
```

On app launch, check `isPaired()`. If false → show pairing screen. If true → proceed to bootstrap.

### Heartbeat (Keep-Alive)

Send every 60 seconds while the app is open:

```typescript
setInterval(async () => {
  try {
    await api.post("/station/heartbeat");
  } catch {
    // Ignore — will retry next tick
  }
}, 60_000);
```

---

## 4. App Bootstrap

Run this once after pairing is confirmed, before showing the POS screen.

```typescript
interface BootstrapData {
  station: Station;
  menus: Menu[];
  tables: Table[];
  recentOrders: Order[];
}

async function bootstrap(): Promise<BootstrapData> {
  const [stationRes, menuRes, tableRes, ordersRes] = await Promise.all([
    api.get("/station/me"),
    api.get("/station/menu"),
    api.get("/station/tables"),
    api.get("/station/orders"),
  ]);

  return {
    station: stationRes.data.data,
    menus: menuRes.data, // Array of menus with categories + items
    tables: tableRes.data.data, // Array of tables with status
    recentOrders: ordersRes.data.data.data, // Paginated result
  };
}
```

> All four `/station/*` routes use the station token. No staff PIN is needed for this initial data load. Staff PIN is required for creating or modifying orders.

### Menu Data Structure

```typescript
interface Menu {
  id: string;
  name: string;
  isActive: boolean;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
}

interface Variant {
  id: string;
  name: string; // e.g. "Small", "Large"
  price: number; // Overrides basePrice when selected
}

interface ModifierGroup {
  id: string;
  name: string; // e.g. "Add-ons", "Sauces"
  required: boolean;
  minSelections: number;
  maxSelections: number;
  items: ModifierItem[];
}

interface ModifierItem {
  id: string;
  name: string;
  price: number; // Additional cost
}
```

---

## 5. Main POS Screen Layout

### Recommended Screen Structure

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Business name │ Station name │ Time │ Staff: [PIN?] │
├──────────────┬───────────────────────┬───────────────────────┤
│              │                       │                       │
│  TABLE MAP   │    MENU BROWSER       │    ORDER PANEL        │
│  (left col)  │    (center col)       │    (right col)        │
│              │                       │                       │
│  Floor plan  │  Category tabs        │  Active order items   │
│  Table grid  │  Item grid/list       │  Item modifiers       │
│  Status dots │  Item detail modal    │  Subtotal             │
│              │                       │  Discount (manual)    │
│              │                       │  Tax (calculated)     │
│              │                       │  Total                │
│              │                       │                       │
│              │                       │  [Pay] [Hold] [Void]  │
└──────────────┴───────────────────────┴───────────────────────┘
```

### Navigation Modes

Keep a `mode` state: `'tables' | 'new-order' | 'order-detail' | 'payment'`

- `tables` — Default view: floor plan + table status
- `new-order` — Table selected, building a new order
- `order-detail` — Reviewing/editing an existing open order
- `payment` — Processing payment for an order

---

## 6. Menu Browsing & Item Selection

### Category Tabs

Render tabs from the first active menu's categories. If multiple menus are active (e.g., lunch + drinks), show a menu switcher above the category tabs.

```typescript
const activeMenus = menus.filter((m) => m.isActive);
const [selectedMenuId, setSelectedMenuId] = useState(activeMenus[0]?.id);
const [selectedCategoryId, setSelectedCategoryId] = useState(
  activeMenus[0]?.categories[0]?.id,
);
```

### Item Card

Each item card should show:

- Name
- Base price (or "From $X.XX" if variants exist)
- Thumbnail image (first in `images[]`)
- Availability indicator (grey out if `isAvailable: false`)

### Item Detail Modal

When a user taps an item, open a modal for:

1. **Variant selection** (if `variants.length > 0`) — radio buttons, required
2. **Modifier groups** — checkboxes/radio per group rules (`minSelections`/`maxSelections`)
3. **Special notes** — free-text input
4. **Quantity** — stepper (default 1)
5. **Add to Order** button

```typescript
interface CartItem {
  menuItemId: string;
  variantId?: string;
  quantity: number;
  modifiers: { modifierItemId: string }[];
  notes?: string;

  // Derived fields for display only (not sent to API)
  _name: string;
  _basePrice: number;
  _variantPrice?: number;
  _modifierCost: number;
  _lineTotal: number;
}

function calcLineTotal(item: CartItem): number {
  const base = item._variantPrice ?? item._basePrice;
  return (base + item._modifierCost) * item.quantity;
}
```

### Adding to Cart (Local State)

Items go into a local `cart` array before the order is created or updated on the server.

**Strategy:**

- If no active order for the table → accumulate in `cart`, create order on first "Place Order" or "Send to Kitchen"
- If order already exists (status `CREATED`) → add items via `POST /businesses/:businessId/orders/:orderId/items`

---

## 7. Order Management

### Creating an Order

```typescript
async function createOrder(
  businessId: string,
  cart: CartItem[],
  tableId?: string,
  type: "dine_in" | "takeaway" | "delivery" = "dine_in",
  discountAmount = 0,
) {
  const res = await api.post(`/businesses/${businessId}/orders`, {
    type,
    tableId,
    discountAmount,
    items: cart.map((ci) => ({
      menuItemId: ci.menuItemId,
      variantId: ci.variantId,
      quantity: ci.quantity,
      modifiers: ci.modifiers,
      notes: ci.notes,
    })),
  });
  return res.data.data;
}
```

### Order Lifecycle

```
CREATED ──► ACCEPTED ──► PREPARING ──► READY ──► COMPLETED
   │                                              (terminal)
   └──► REJECTED  (terminal)
   └──► CANCELLED (terminal, from any non-terminal state)
```

| Action     | Endpoint             | When to call                                         |
| ---------- | -------------------- | ---------------------------------------------------- |
| Accept     | `PATCH .../accept`   | Kitchen/manager approves                             |
| Reject     | `PATCH .../reject`   | Out of stock, kitchen closed                         |
| Start prep | `PATCH .../prepare`  | Kitchen starts cooking — **inventory deducted here** |
| Mark ready | `PATCH .../ready`    | Food ready for pickup/service                        |
| Complete   | `PATCH .../complete` | Delivered + payment collected                        |
| Cancel     | `PATCH .../cancel`   | Before PREPARING only                                |

For a simple single-cashier flow, auto-accept immediately after creation:

```typescript
const order = await createOrder(businessId, cart, tableId);
await api.patch(`/businesses/${businessId}/orders/${order.id}/accept`);
```

### Adding Items to Existing Order

Only allowed while status is `CREATED` or `ACCEPTED`.

```typescript
async function addItemsToOrder(
  businessId: string,
  orderId: string,
  newItems: CartItem[],
) {
  await api.post(`/businesses/${businessId}/orders/${orderId}/items`, {
    items: newItems.map((ci) => ({
      menuItemId: ci.menuItemId,
      variantId: ci.variantId,
      quantity: ci.quantity,
      modifiers: ci.modifiers,
      notes: ci.notes,
    })),
  });
}
```

### Voiding an Item

```typescript
async function voidItem(
  businessId: string,
  orderId: string,
  orderItemId: string,
) {
  await api.delete(
    `/businesses/${businessId}/orders/${orderId}/items/${orderItemId}`,
  );
}
```

Only allowed before status reaches `PREPARING`.

### Transferring Order to Another Table

```typescript
async function transferOrder(
  businessId: string,
  orderId: string,
  newTableId: string,
) {
  await api.patch(`/businesses/${businessId}/orders/${orderId}/transfer`, {
    tableId: newTableId,
  });
}
```

### Fetching Active Orders for a Table

There is no "get orders by tableId" endpoint. Filter client-side from the full orders list:

```typescript
async function getTableOrders(businessId: string, tableId: string) {
  const res = await api.get(`/businesses/${businessId}/orders`, {
    params: { status: "CREATED,ACCEPTED,PREPARING,READY", limit: 50 },
  });
  return res.data.data.data.filter((o: Order) => o.tableId === tableId);
}
```

---

## 8. Payment Processing

### Adding a Payment

The API supports partial payments. Multiple payments can be added to one order (part cash + part card).

```typescript
async function addPayment(
  businessId: string,
  orderId: string,
  amount: number,
  method: "CASH" | "CARD" | "ONLINE" | "OTHER",
  tipAmount?: number,
) {
  const res = await api.post(
    `/businesses/${businessId}/orders/${orderId}/payments`,
    {
      amount,
      method,
      tipAmount: tipAmount ?? 0,
    },
  );
  return res.data.data;
}
```

### Payment Flow UI

```
1. Show order summary: items + subtotal + tax (local calc) + total
2. Cashier selects method: CASH / CARD / ONLINE
3. CASH → show "Amount tendered" input → calculate change
4. Confirm → POST .../payments
5. If fully paid → PATCH .../complete
6. Show receipt screen
```

### Calculating Change (Cash)

```typescript
function calcChange(amountTendered: number, orderTotal: number): number {
  return Math.max(0, amountTendered - orderTotal);
}
```

### Split Payment (Multiple Methods)

The backend has no split-bill endpoint yet. Use multiple `addPayment()` calls and track balance locally:

```typescript
// E.g. $20 cash + $15.50 card
await addPayment(businessId, orderId, 20.0, "CASH");
await addPayment(businessId, orderId, 15.5, "CARD");
await api.patch(`/businesses/${businessId}/orders/${orderId}/complete`);

// Track remaining balance
const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
const remaining = order.total - totalPaid;
```

### Refund

```typescript
async function refundPayment(
  businessId: string,
  orderId: string,
  paymentId: string,
  reason?: string,
) {
  await api.post(
    `/businesses/${businessId}/orders/${orderId}/payments/${paymentId}/refund`,
    { reason },
  );
}
```

---

## 9. Table Management

### Table Status Mapping

| Status      | Color  | Meaning                         |
| ----------- | ------ | ------------------------------- |
| `AVAILABLE` | Green  | Empty, ready for seating        |
| `OCCUPIED`  | Red    | Has an active open order        |
| `RESERVED`  | Yellow | Has a future reservation        |
| `CLEANING`  | Grey   | Recently vacated, being cleaned |

### Floor Plan View

```typescript
interface Table {
  id: string;
  name: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  floorId: string;
  positionX: number; // 0–100 percentage
  positionY: number;
}

interface Floor {
  id: string;
  name: string; // e.g. "Main Floor", "Patio"
  tables: Table[];
}
```

Render each floor as a tab. Render tables as absolutely positioned tiles:

```css
.table-tile {
  position: absolute;
  left: calc(var(--posX) * 1%);
  top: calc(var(--posY) * 1%);
}
```

### Getting Tables

Loaded at bootstrap via `/station/tables`. Refresh after order state changes or via 15-second polling (no push yet).

---

## 10. Reservations & Walk-ins

### Walk-in (Immediate Seating)

```typescript
async function createWalkIn(
  businessId: string,
  tableId: string,
  guestCount: number,
  guestName?: string,
) {
  const res = await api.post(`/businesses/${businessId}/reservations/walk-in`, {
    tableId,
    partySize: guestCount,
    guestName,
  });
  return res.data.data;
}
```

After creating the walk-in, create an order linked to the reservation:

```typescript
const reservation = await createWalkIn(businessId, tableId, 3, "Smith");
const order = await createOrder(businessId, [], tableId, "dine_in");
// Pass reservationId in CreateOrderDto if linking is needed
```

### Viewing Today's Reservations

```typescript
async function getTodaysReservations(businessId: string) {
  const today = new Date().toISOString().split("T")[0];
  const res = await api.get(`/businesses/${businessId}/reservations`, {
    params: { startDate: today, endDate: today, limit: 100 },
  });
  return res.data.data.data;
}
```

Show an upcoming reservations panel. When a party arrives, assign their table and open an order.

### Table Assignment

```typescript
async function assignTableToReservation(
  businessId: string,
  reservationId: string,
  tableId: string,
) {
  await api.patch(
    `/businesses/${businessId}/reservations/${reservationId}/table`,
    {
      tableId,
    },
  );
}
```

---

## 11. Staff PIN Login & Session

### PIN Pad UI

Display a numpad (0–9, backspace, submit). Show entered digits as `●` placeholders — never show the actual PIN.

The PIN pad appears:

- On app startup (before any business action)
- When the short token expires (interceptor catches 401 on business routes)
- When cashier taps "Switch Staff"

### Performing PIN Login

```typescript
async function pinLogin(pin: string): Promise<StaffSession> {
  const res = await api.post("/station/staff/pin-login", { pin });
  const { employmentId, name, roles, shortToken } = res.data.data;

  const session: StaffSession = {
    employmentId,
    name,
    roles,
    shortToken,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  };

  activeStaffSession = session; // Memory only — never persisted
  return session;
}
```

### Auto-Expiry Warning

```typescript
function getSessionWarning(session: StaffSession): string | null {
  const remaining = session.expiresAt - Date.now();
  if (remaining < 5 * 60 * 1000) {
    const minutes = Math.ceil(remaining / 60_000);
    return `Session expires in ${minutes} min — re-enter PIN to continue`;
  }
  return null;
}
```

### Logout

```typescript
async function pinLogout() {
  await api.post("/station/staff/pin-logout");
  activeStaffSession = null;
  showPinPad();
}
```

### Role-Based UI Restrictions

```typescript
function hasRole(session: StaffSession, roleName: string): boolean {
  return session.roles.some((r) =>
    r.name.toLowerCase().includes(roleName.toLowerCase()),
  );
}

const canVoidItems = hasRole(session, "manager") || hasRole(session, "owner");
const canApplyDiscount =
  hasRole(session, "manager") || hasRole(session, "owner");
const canViewReports = hasRole(session, "manager") || hasRole(session, "owner");
```

---

## 12. Real-Time Updates Strategy

The backend WebSocket (`notifications` namespace) only pushes generic user notifications, not order/table status changes. Use **polling** until dedicated POS WebSocket events are added.

### Polling Schedule

```typescript
const POLL_INTERVALS = {
  activeOrders: 10_000, // Every 10s — cashier needs fast status feedback
  tables: 15_000, // Every 15s — less time-sensitive
  reservations: 60_000, // Every minute
};

function startPolling(businessId: string) {
  setInterval(() => refreshOrders(businessId), POLL_INTERVALS.activeOrders);
  setInterval(() => refreshTables(businessId), POLL_INTERVALS.tables);
  setInterval(
    () => refreshTodaysReservations(businessId),
    POLL_INTERVALS.reservations,
  );
}
```

### Notification WebSocket (Manager Alerts)

The existing WebSocket can still deliver low-stock or system alerts:

```typescript
import { io } from "socket.io-client";

function connectNotificationSocket(staffToken: string) {
  const socket = io("/notifications", {
    auth: { token: staffToken },
    transports: ["websocket"],
  });

  socket.on("new-notification", (notification) => {
    if (notification.type === "low_stock") showLowStockAlert(notification);
  });

  return socket;
}
```

---

## 13. Receipt Generation (Frontend-side)

The backend has no receipt endpoint. Generate receipts from the order object in the frontend.

### Receipt Data

```typescript
interface ReceiptData {
  businessName: string;
  businessAddress?: string;
  stationName: string;
  cashierName: string;
  orderNumber: string; // order.id.slice(0, 8).toUpperCase()
  date: string;
  items: {
    name: string;
    variantName?: string;
    modifiers: string[];
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  tip: number;
  total: number;
  payments: { method: string; amount: number }[];
  change?: number;
}
```

### Printing — Web

```css
@media print {
  body * {
    visibility: hidden;
  }
  .receipt-container,
  .receipt-container * {
    visibility: visible;
  }
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    font-size: 12px;
  }
}
```

Call `window.print()` when the receipt screen is active.

### Printing — Electron

```typescript
// Renderer process
window.electronAPI.print({ silent: true, printerName: "Thermal_Printer" });

// Main process preload
ipcMain.handle("print", (event, options) => {
  BrowserWindow.fromWebContents(event.sender)?.webContents.print(options);
});
```

---

## 14. Tax & Discount Handling

### Tax (Frontend Calculation — Temporary)

No tax configuration endpoints exist yet. Store the tax rate locally and compute it in the frontend:

```typescript
const TAX_RATE_KEY = "pos_tax_rate"; // e.g. "0.08" = 8%

function getTaxRate(): number {
  return parseFloat(localStorage.getItem(TAX_RATE_KEY) ?? "0");
}

function calcTax(subtotal: number, discountAmount: number): number {
  const taxable = subtotal - discountAmount;
  return parseFloat((taxable * getTaxRate()).toFixed(2));
}
```

Add a manager-only "Tax Settings" screen in POS Settings where the rate can be changed (gated by PIN role check).

### Discount

The `discountAmount` field exists in `CreateOrderDto` — pass it at order creation time. There is no endpoint to apply a discount after the order is created.

```typescript
// Pre-create only
const order = await createOrder(
  businessId,
  cart,
  tableId,
  "dine_in",
  discountAmount,
);

// Display totals
const subtotal = cart.reduce((s, i) => s + i._lineTotal, 0);
const taxAmount = calcTax(subtotal, discountAmount);
const total = subtotal - discountAmount + taxAmount;
```

For post-creation discounts (manager override), cancel and re-create the order before `PREPARING`.

---

## 15. Offline Resilience

### Web App

Use a Service Worker with network-first for API calls, falling back to cached data for reads:

- Cache menu with a 5-minute TTL
- Queue failed `POST` requests in IndexedDB, replay on reconnect
- Show an "Offline — changes will sync when connected" banner

### Electron

```typescript
import Store from "electron-store";

const store = new Store({
  name: "pos-cache",
  encryptionKey: "your-encryption-key",
});

// After bootstrap
store.set("menu", menuData);
store.set("tables", tablesData);
store.set("cacheTimestamp", Date.now());

// On startup — use cache while fetching fresh
const cachedMenu = store.get("menu");
```

Queue failed API calls in a `pendingActions` array in the store and replay on reconnect.

---

## 16. Electron-Specific Considerations

### Window Configuration

```typescript
// main.ts
const win = new BrowserWindow({
  fullscreen: true,
  kiosk: true, // Locks to full-screen, no taskbar
  webPreferences: {
    contextIsolation: true,
    preload: path.join(__dirname, "preload.js"),
    nodeIntegration: false,
  },
});
```

### Idle Timeout & Auto-Lock

Lock the screen (show PIN pad) after inactivity:

```typescript
let idleTimer: ReturnType<typeof setTimeout>;
const IDLE_TIMEOUT = 3 * 60 * 1000; // 3 minutes

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    clearStaffSession();
    showPinPad();
  }, IDLE_TIMEOUT);
}

["mousemove", "keydown", "touchstart"].forEach((e) =>
  document.addEventListener(e, resetIdleTimer),
);
resetIdleTimer();
```

### Barcode Scanner Support

POS terminals often have USB barcode scanners that fire as keyboard input. Intercept rapid sequences:

```typescript
let barcodeBuffer = "";
let barcodeTimer: ReturnType<typeof setTimeout>;

document.addEventListener("keypress", (e) => {
  clearTimeout(barcodeTimer);
  barcodeBuffer += e.key;
  barcodeTimer = setTimeout(() => {
    if (barcodeBuffer.length >= 6) handleBarcodeScan(barcodeBuffer);
    barcodeBuffer = "";
  }, 100); // Barcode scanners complete within ~100ms
});
```

### Cash Drawer (Serial/USB)

```typescript
// Main process
import { SerialPort } from "serialport";

ipcMain.handle("open-cash-drawer", async () => {
  const port = new SerialPort({ path: "/dev/ttyUSB0", baudRate: 9600 });
  port.write(Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa])); // ESC/POS kick command
  port.close();
});
```

### Auto-Update

```typescript
import { autoUpdater } from "electron-updater";

autoUpdater.checkForUpdatesAndNotify();
autoUpdater.on("update-downloaded", () => {
  // Prompt manager — not during active order
  win.webContents.send("update-ready");
});
```

---

## 17. Complete API Reference

### Station Token Routes (`Authorization: Bearer <stationToken>`)

| Method | Path                        | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| `GET`  | `/station/me`               | Get current station info              |
| `POST` | `/station/heartbeat`        | Keep-alive ping (every 60s)           |
| `GET`  | `/station/menu`             | Active menus with all items/modifiers |
| `GET`  | `/station/tables`           | All tables with status                |
| `GET`  | `/station/orders`           | Last 200 orders                       |
| `POST` | `/station/staff/pin-login`  | Login staff via 4-digit PIN           |
| `POST` | `/station/staff/pin-logout` | Logout current staff session          |

### Owner Auth Routes (`Authorization: Bearer <userJwtToken>`)

| Method   | Path                                                | Description                             |
| -------- | --------------------------------------------------- | --------------------------------------- |
| `POST`   | `/station/businesses/:id/pairing-codes`             | Generate 8-char pairing code (5min TTL) |
| `GET`    | `/station/businesses/:id/stations`                  | List paired terminals                   |
| `PATCH`  | `/station/businesses/:id/stations/:sid`             | Update station name/type                |
| `DELETE` | `/station/businesses/:id/stations/:sid`             | Revoke terminal                         |
| `PATCH`  | `/employments/bus/:businessId/employees/:empId/pin` | Set staff 4-digit PIN                   |

### Public Route (No Auth)

| Method | Path            | Body                               |
| ------ | --------------- | ---------------------------------- |
| `POST` | `/station/link` | `{ code, deviceUuid, name, type }` |

### Staff Token Routes (`Authorization: Bearer <shortToken>`)

#### Orders

| Method   | Path                                                      | Description                                            |
| -------- | --------------------------------------------------------- | ------------------------------------------------------ |
| `POST`   | `/businesses/:businessId/orders`                          | Create order                                           |
| `GET`    | `/businesses/:businessId/orders`                          | List orders (query: status, startDate, endDate, limit) |
| `GET`    | `/businesses/:businessId/orders/:id`                      | Order details                                          |
| `POST`   | `/businesses/:businessId/orders/:id/items`                | Add items                                              |
| `PATCH`  | `/businesses/:businessId/orders/:id/items/:itemId`        | Update item                                            |
| `DELETE` | `/businesses/:businessId/orders/:id/items/:itemId`        | Void item                                              |
| `PATCH`  | `/businesses/:businessId/orders/:id/accept`               | Accept                                                 |
| `PATCH`  | `/businesses/:businessId/orders/:id/reject`               | Reject                                                 |
| `PATCH`  | `/businesses/:businessId/orders/:id/prepare`              | Prepare (deducts inventory)                            |
| `PATCH`  | `/businesses/:businessId/orders/:id/ready`                | Mark ready                                             |
| `PATCH`  | `/businesses/:businessId/orders/:id/complete`             | Complete                                               |
| `PATCH`  | `/businesses/:businessId/orders/:id/cancel`               | Cancel                                                 |
| `PATCH`  | `/businesses/:businessId/orders/:id/transfer`             | Transfer table                                         |
| `POST`   | `/businesses/:businessId/orders/:id/payments`             | Add payment                                            |
| `POST`   | `/businesses/:businessId/orders/:id/payments/:pid/refund` | Refund                                                 |

#### Tables & Floor Plan

| Method  | Path                                            | Description             |
| ------- | ----------------------------------------------- | ----------------------- |
| `GET`   | `/businesses/:businessId/floor-plan/floors`     | List floors             |
| `GET`   | `/businesses/:businessId/floor-plan/tables`     | List tables with status |
| `PATCH` | `/businesses/:businessId/floor-plan/tables/:id` | Update table            |

#### Reservations

| Method  | Path                                               | Description                      |
| ------- | -------------------------------------------------- | -------------------------------- |
| `GET`   | `/businesses/:businessId/reservations`             | List (query: startDate, endDate) |
| `POST`  | `/businesses/:businessId/reservations/walk-in`     | Create walk-in                   |
| `PATCH` | `/businesses/:businessId/reservations/:id/table`   | Assign table                     |
| `PATCH` | `/businesses/:businessId/reservations/:id/cancel`  | Cancel                           |
| `PATCH` | `/businesses/:businessId/reservations/:id/no-show` | Mark no-show                     |

### Key Request Shapes

#### `POST /businesses/:id/orders`

```json
{
  "type": "dine_in",
  "tableId": "uuid",
  "reservationId": "uuid",
  "discountAmount": 5.0,
  "items": [
    {
      "menuItemId": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "modifiers": [{ "modifierItemId": "uuid" }],
      "notes": "No onions"
    }
  ]
}
```

#### `POST /businesses/:id/orders/:oid/payments`

```json
{
  "amount": 45.0,
  "method": "CASH",
  "tipAmount": 5.0
}
```

Payment methods: `CASH` | `CARD` | `ONLINE` | `OTHER`

#### `POST /station/staff/pin-login`

```json
{ "pin": "1234" }
```

Response:

```json
{
  "employmentId": "uuid",
  "name": "Jane Smith",
  "roles": [{ "id": "uuid", "name": "Cashier" }],
  "shortToken": "eyJ..."
}
```

#### `POST /station/link`

```json
{
  "code": "ABCD1234",
  "deviceUuid": "stable-device-uuid",
  "name": "Counter 1",
  "type": "pos"
}
```

Response:

```json
{
  "token": "eyJ...",
  "station": { "id": "uuid", "name": "Counter 1", "businessId": "uuid" }
}
```

---

## Known Gaps & Workarounds

| Feature                     | Status          | Workaround                                                    |
| --------------------------- | --------------- | ------------------------------------------------------------- |
| Tax configuration API       | Not implemented | Store rate in `localStorage`, calculate locally               |
| Post-create discounts       | Not implemented | Apply `discountAmount` in `CreateOrderDto` only               |
| Receipt endpoint            | Not implemented | Generate receipt from order data in frontend                  |
| Split-bill endpoint         | Not implemented | Multiple `addPayment()` calls, track balance locally          |
| Real-time order push        | Not implemented | Poll `/station/orders` every 10 seconds                       |
| Guest phone lookup          | Not implemented | Take guest name as order notes manually                       |
| KDS (Kitchen Display)       | Not implemented | Second POS screen with `type: 'kds'`, filter orders by status |
| Payment gateway integration | Not implemented | Record CASH/CARD manually; no card terminal integration yet   |
