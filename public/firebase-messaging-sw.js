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
  const title = payload.notification?.title ?? 'New notification';
  const body = payload.notification?.body ?? '';
  self.registration.showNotification(title, {
    body,
    icon: '/images/logo.png',
    data: payload.data,
  });
});
