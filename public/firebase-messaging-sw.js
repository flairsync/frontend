importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBuKThmFYg-fz2zGQkKsN_c9Zt_rZ2YezA",
  authDomain: "flairsync-dev.firebaseapp.com",
  projectId: "flairsync-dev",
  storageBucket: "flairsync-dev.firebasestorage.app",
  messagingSenderId: "342901545608",
  appId: "1:342901545608:web:737ddf64937126503d9d3d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title ?? 'New notification';
  const body = payload.data?.body ?? '';
  self.registration.showNotification(title, {
    body,
    icon: '/images/logo.png',
    data: payload.data,
  });
});

// Keep in sync with the in-app switch in components/notifications/NotificationBubble.tsx
function resolveNotificationUrl(data) {
  const businessId = data?.businessId;

  switch (data?.type) {
    case 'SHIFT_PUBLISHED':
    case 'SHIFT_CREATED':
    case 'SHIFT_UPDATED':
    case 'SHIFT_NO_SHOW':
      return businessId ? `/manage/${businessId}/staff/shifts?tab=schedule` : '/notifications';
    case 'SHIFT_SWAP_REQUEST':
    case 'TIME_OFF_APPROVED':
      return businessId ? `/manage/${businessId}/staff/shifts?tab=requests` : '/notifications';
    case 'INVENTORY_LOW_STOCK':
      return businessId ? `/manage/${businessId}/owner/inventory?tab=low-stock` : '/notifications';
    case 'RESERVATION':
      if (businessId && data?.reservationId) {
        return `/manage/${businessId}/owner/reservations?reservationId=${data.reservationId}`;
      }
      return businessId ? `/manage/${businessId}/owner/reservations` : '/notifications';
    case 'ORDER':
      return businessId ? `/diner/${businessId}/order` : '/notifications';
    default:
      return '/notifications';
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = resolveNotificationUrl(event.notification.data);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('navigate' in client && 'focus' in client) {
          return client.navigate(url).then((c) => c && c.focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
