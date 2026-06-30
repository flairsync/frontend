import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import fs from "fs";
import path from "path";

import { defineConfig, type Plugin } from "vite";

// Generates public/firebase-messaging-sw.js with env vars baked in at build/dev time.
// Service workers are served as static files and cannot access import.meta.env,
// so we generate the file from the env values during Vite startup.
function firebaseSwPlugin(): Plugin {
  return {
    name: "firebase-sw-generator",
    configResolved(config) {
      const env = config.env;
      const swContent = `importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${env.VITE_FIREBASE_API_KEY}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${env.VITE_FIREBASE_APP_ID}",
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
      return businessId ? \`/manage/\${businessId}/staff/shifts?tab=schedule\` : '/notifications';
    case 'SHIFT_SWAP_REQUEST':
    case 'TIME_OFF_APPROVED':
      return businessId ? \`/manage/\${businessId}/staff/shifts?tab=requests\` : '/notifications';
    case 'INVENTORY_LOW_STOCK':
      return businessId ? \`/manage/\${businessId}/owner/inventory?tab=low-stock\` : '/notifications';
    case 'RESERVATION':
      if (businessId && data?.reservationId) {
        return \`/manage/\${businessId}/owner/reservations?reservationId=\${data.reservationId}\`;
      }
      return businessId ? \`/manage/\${businessId}/owner/reservations\` : '/notifications';
    case 'ORDER':
      return businessId ? \`/diner/\${businessId}/order\` : '/notifications';
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
`;
      const outPath = path.resolve(config.root, "public/firebase-messaging-sw.js");
      fs.writeFileSync(outPath, swContent, "utf-8");
    },
  };
}

export default defineConfig({
  plugins: [firebaseSwPlugin(), vike(), react(), tailwindcss()],

  build: {
    target: "es2022",
    sourcemap: false,
  },

  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
  server: {
    host: "0.0.0.0", // Make sure the server is accessible outside the container
    watch: {
      usePolling: true, // Essential for Docker development environments
    },
    allowedHosts: ["flairsync.com"],
  },
  define: {
    "process.env": {},
  },
  ssr: {
    // Add problematic npm package here:
    noExternal: ["radar-sdk-js"],
  },
});
