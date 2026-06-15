# Frontend Notification System — Integration Guide

Base URL: `https://api.flairsync.com/api/v1`

---

## Overview

The notification system uses two mutually exclusive channels per web client:

| Client type | Channel | Works when app is closed? |
|---|---|---|
| Mobile (iOS / Android) | FCM only | Yes |
| Web — permission granted | FCM only | Yes (via service worker) |
| Web — permission denied / blocked | SSE only | No (foreground only) |

The backend always fans out to both channels simultaneously. The frontend decides which one to set up — never both at the same time.

---

## 1. Install Firebase JS SDK

```bash
npm install firebase
```

---

## 2. Initialize Firebase

Create `src/lib/firebase.ts` with the client config from Firebase Console:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

---

## 3. Service Worker (required for background FCM delivery)

Create `public/firebase-messaging-sw.js` at the root of your web app. The browser runs this script when the tab is closed or not in focus.

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    data: payload.data, // contains notificationId and type
  });
});
```

> The service worker **must** be served from the root of your domain (`/firebase-messaging-sw.js`), not a subdirectory. Place it in `public/`.

---

## 4. Decision Logic — which channel to open

Run this once on app startup, after the user is authenticated:

```typescript
import { messaging } from './lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = 'YOUR_VAPID_KEY'; // Firebase Console → Project Settings → Cloud Messaging → Web Push certificates

async function initNotifications(authToken: string) {
  const permission = Notification.permission;

  if (permission === 'granted') {
    await setupFcm(authToken);
  } else if (permission === 'default') {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await setupFcm(authToken);
    } else {
      setupSse(authToken);
    }
  } else {
    // 'denied' — user blocked notifications, use SSE
    setupSse(authToken);
  }
}
```

---

## 5. FCM Setup

### 5.1 Get the VAPID key

Firebase Console → Project Settings → **Cloud Messaging** tab → Web Push certificates → copy the public key.

### 5.2 Generate a stable deviceId

`deviceId` is a UUID you generate once per browser and store in `localStorage`. It lets the backend upsert your FCM token when Firebase rotates it, without creating duplicates.

```typescript
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('fcm_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('fcm_device_id', deviceId);
  }
  return deviceId;
}
```

### 5.3 Register the token with the backend

```typescript
async function setupFcm(authToken: string) {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return;

    const deviceId = getOrCreateDeviceId();

    await fetch('/api/v1/notifications/device-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token, deviceType: 'WEB', deviceId }),
    });

    // Handle foreground messages (tab is open and focused)
    onMessage(messaging, (payload) => {
      handleIncomingNotification({
        id: payload.data?.notificationId,
        type: payload.data?.type,
        title: payload.notification?.title ?? '',
        message: payload.notification?.body ?? '',
      });
    });
  } catch (err) {
    console.error('FCM setup failed:', err);
  }
}
```

### 5.4 Handle token rotation

Firebase can silently rotate the FCM token. Listen for this and re-register:

```typescript
import { onTokenRefresh } from 'firebase/messaging';

onTokenRefresh(messaging, async () => {
  const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
  const deviceId = getOrCreateDeviceId();
  const authToken = getCurrentAuthToken(); // however you store the JWT

  await fetch('/api/v1/notifications/device-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token: newToken, deviceType: 'WEB', deviceId }),
  });
});
```

---

## 6. SSE Setup

When the user has denied (or never granted) notification permission, open an SSE connection instead. No library needed — SSE is a native browser API.

```typescript
let sseConnection: EventSource | null = null;

function setupSse(authToken: string) {
  // EventSource does not support custom headers — pass the JWT as a query param
  const url = `/api/v1/notifications/stream?token=${authToken}`;
  sseConnection = new EventSource(url);

  sseConnection.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    handleIncomingNotification(notification);
  };

  sseConnection.onerror = () => {
    // EventSource reconnects automatically — no manual retry needed
  };
}

function closeSse() {
  sseConnection?.close();
  sseConnection = null;
}
```

> `EventSource` reconnects automatically on connection drop. No retry logic needed.

> SSE is foreground-only — if the user closes the tab, no notifications are delivered. Expected behaviour since they chose not to grant permission.

---

## 7. Handle Incoming Notifications (shared handler)

Both FCM foreground messages and SSE events feed into the same handler. Implement it once and use it for both:

```typescript
interface IncomingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  createdAt?: string;
}

function handleIncomingNotification(notification: IncomingNotification) {
  // Show a toast, update the bell badge count, prepend to notification list, etc.
  // UI implementation is entirely up to you.
}
```

---

## 8. Notification Payload Shapes

### SSE — `event.data` (parsed JSON)

```json
{
  "id": "uuid",
  "type": "ORDER",
  "title": "Your order is ready",
  "message": "Table 4 — your items are ready to be served.",
  "payload": {},
  "createdAt": "2026-05-15T19:45:00.000Z"
}
```

### FCM foreground — `onMessage` payload

```typescript
payload.notification.title  // "Your order is ready"
payload.notification.body   // "Table 4 — your items are ready to be served."
payload.data.notificationId // "uuid"
payload.data.type           // "ORDER"
```

### FCM background — shown automatically as a system notification

The service worker calls `showNotification(title, { body })` automatically. No frontend code needed for this case.

---

## 9. Notification `type` Values

| Value | When it fires |
|---|---|
| `ALERT` | General system alert |
| `SECURITY` | Account security event |
| `RESERVATION` | Reservation status change |
| `PROMO` | Promotional message |
| `ORDER` | Order status change |
| `SHIFT_PUBLISHED` | Staff shift schedule published |
| `SHIFT_CREATED` | New shift assigned to staff member |
| `SHIFT_UPDATED` | Existing shift modified |
| `SHIFT_SWAP_REQUEST` | Shift swap request received |
| `SHIFT_SWAP_APPROVED` | Shift swap approved |
| `TIME_OFF_REQUEST` | Time-off request received |
| `TIME_OFF_APPROVED` | Time-off request approved |
| `INVENTORY_LOW_STOCK` | Inventory item below threshold |
| `TASK_ASSIGNED` | Task assigned to user |
| `TASK_STATUS_CHANGED` | Task status updated |

---

## 10. Logout Cleanup

```typescript
async function onLogout(authToken: string) {
  // 1. Close SSE connection if open
  closeSse();

  // 2. Remove FCM token from backend by deviceId
  const deviceId = localStorage.getItem('fcm_device_id');
  if (deviceId) {
    await fetch(`/api/v1/notifications/device-tokens/device/${deviceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }
}
```

---

## 11. API Endpoints Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/notifications/stream` | JWT query param `?token=` | Open SSE connection |
| `GET` | `/notifications` | JWT cookie | Paginated notification history |
| `GET` | `/notifications/unread-count` | JWT cookie | Unread count for bell icon |
| `PATCH` | `/notifications/:id/read` | JWT cookie | Mark one notification as read |
| `PATCH` | `/notifications/read-all` | JWT cookie | Mark all as read |
| `POST` | `/notifications/device-tokens` | JWT cookie | Register / update FCM token |
| `DELETE` | `/notifications/device-tokens/device/:deviceId` | JWT cookie | Remove token by deviceId (use on logout) |
| `DELETE` | `/notifications/device-tokens/:token` | JWT cookie | Remove token by FCM token value (fallback) |

---

## 12. Mobile (React Native)

Use `@react-native-firebase/messaging` instead of the web Firebase SDK. The token registration and logout flows are identical — call `POST /notifications/device-tokens` with `deviceType: 'IOS'` or `deviceType: 'ANDROID'`. No SSE needed on mobile.
