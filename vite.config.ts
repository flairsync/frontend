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
  const title = payload.notification?.title ?? 'New notification';
  const body = payload.notification?.body ?? '';
  self.registration.showNotification(title, {
    body,
    icon: '/images/logo.png',
    data: payload.data,
  });
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
