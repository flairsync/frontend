import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

let analyticsInstance: Analytics | null = null;

// Analytics sets its own cookies/IndexedDB entries as soon as it's created, so
// it must stay uninitialized until the user opts in via the cookie consent
// banner (see utils/cookies.ts `analytics` category) — never call this eagerly.
export async function setAnalyticsConsent(granted: boolean): Promise<void> {
    if (!granted) {
        if (analyticsInstance) setAnalyticsCollectionEnabled(analyticsInstance, false);
        return;
    }
    if (!analyticsInstance) {
        if (!(await isSupported())) return;
        analyticsInstance = getAnalytics(app);
    }
    setAnalyticsCollectionEnabled(analyticsInstance, true);
}

export function trackPageView(path: string, title?: string): void {
    if (!analyticsInstance) return;
    logEvent(analyticsInstance, 'page_view', { page_path: path, page_title: title ?? document.title });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
    if (!analyticsInstance) return;
    logEvent(analyticsInstance, name, params);
}
