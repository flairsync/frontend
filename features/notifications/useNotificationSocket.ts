import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getJwtToken } from '@/misc/SecureStorage';
import { NotificationPayload } from './types';
import { registerDeviceTokenApiCall } from './service';
import { useDinerModeStore } from '@/features/diner-mode/DinerModeStore';
import dayjs from '@/utils/date-utils';

const fmtNotifDates = (msg: string, tz?: string) =>
    msg.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, (iso) =>
        tz
            ? dayjs.utc(iso).tz(tz).format("MMM D, YYYY h:mm A")
            : dayjs.utc(iso).local().format("MMM D, YYYY h:mm A")
    );

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;

function getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('fcm_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('fcm_device_id', deviceId);
    }
    return deviceId;
}

// Module-level singletons — one channel per browser session
let channelMode: 'fcm' | 'sse' | null = null;
let sseSource: EventSource | null = null;

async function trySetupFcm(onNotification: (n: NotificationPayload) => void): Promise<boolean> {
    try {
        const { messaging } = await import('@/lib/firebase');
        const { getToken, onMessage } = await import('firebase/messaging');

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) return false;

        const deviceId = getOrCreateDeviceId();
        await registerDeviceTokenApiCall({ token, deviceType: 'WEB', deviceId });

        // Register the service worker so Firebase can deliver background messages
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }

        onMessage(messaging, (payload) => {
            onNotification({
                id: payload.data?.notificationId ?? '',
                type: (payload.data?.type ?? 'ALERT') as NotificationPayload['type'],
                title: payload.notification?.title ?? '',
                message: payload.notification?.body ?? '',
                payload: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });

        return true;
    } catch (err) {
        console.error('FCM setup failed, falling back to SSE:', err);
        return false;
    }
}

function setupSse(onNotification: (n: NotificationPayload) => void) {
    if (sseSource) return; // already connected

    const authToken = getJwtToken();
    if (!authToken) {
        console.warn('[SSE] No auth token available — skipping notification stream connection');
        return;
    }

    // Auth is via the httpOnly `access` cookie (domain .flairsync.com, SameSite=None) —
    // EventSource doesn't send cookies cross-subdomain unless withCredentials is set.
    const apiBase = 'https://api.flairsync.com/api/v1' as string;
    sseSource = new EventSource(`${apiBase}/notifications/stream`, { withCredentials: true });

    sseSource.onopen = () => {
        console.log('[SSE] Notification stream connected');
    };

    sseSource.onmessage = (event) => {
        try {
            onNotification(JSON.parse(event.data));
        } catch (err) {
            console.warn('[SSE] Malformed notification event — could not parse payload:', event.data, err);
        }
    };

    sseSource.onerror = (event) => {
        // EventSource reconnects automatically on drop, but a readyState of CLOSED here
        // usually means the server rejected the connection (e.g. 401) and won't retry.
        console.error('[SSE] Notification stream error (readyState=' + sseSource?.readyState + '):', event);
    };
}

export const useNotificationSocket = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        function handleIncomingNotification(notification: NotificationPayload) {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            const tz = notification.payload?.timezone || notification.payload?.businessTz;
            const message = fmtNotifDates(notification.message, tz);

            if (notification.type === 'ALERT' || notification.type === 'SECURITY') {
                toast.error(notification.title, { description: message });
            } else if (notification.type === 'INVENTORY_LOW_STOCK') {
                queryClient.invalidateQueries({ queryKey: ['inventory_low_stock'] });
                queryClient.invalidateQueries({ queryKey: ['inventory_dashboard'] });
                toast.warning(notification.title, { description: message });
            } else if (notification.type === 'RESERVATION') {
                const { reservationId, businessId } = notification.payload ?? {};
                if (businessId && reservationId) {
                    queryClient.invalidateQueries({
                        queryKey: ['reservation_timeline', businessId, reservationId],
                    });
                }
                if (businessId) {
                    queryClient.invalidateQueries({ queryKey: ['reservation-dashboard', businessId] });
                    queryClient.invalidateQueries({ queryKey: ['reservations', businessId] });
                }
                queryClient.invalidateQueries({ queryKey: ['my_reservations'] });
                toast.info(notification.title, { description: message });
            } else if (notification.type === 'ORDER') {
                const { orderId, businessId } = notification.payload ?? {};
                if (orderId) {
                    if (businessId) {
                        queryClient.invalidateQueries({ queryKey: ['diner_active_order', businessId] });
                        queryClient.invalidateQueries({ queryKey: ['diner_order_detail', businessId, orderId] });
                    }
                    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                    if (currentPath.startsWith('/diner/')) {
                        useDinerModeStore.getState().setOrderReadyId(orderId);
                    } else {
                        toast.info(notification.title, { description: message });
                    }
                }
            } else {
                toast.info(notification.title, { description: message });
            }
        }

        // If SSE is already running, keep its handler up to date with the current queryClient reference
        if (sseSource) {
            sseSource.onmessage = (event) => {
                try {
                    handleIncomingNotification(JSON.parse(event.data));
                } catch (err) {
                    console.warn('[SSE] Malformed notification event — could not parse payload:', event.data, err);
                }
            };
        }

        if (channelMode !== null) return; // channel already bootstrapped

        async function init() {
            const permission = Notification.permission;
            let fcmOk = false;

            if (permission === 'granted') {
                fcmOk = await trySetupFcm(handleIncomingNotification);
            } else if (permission === 'default') {
                const result = await Notification.requestPermission();
                if (result === 'granted') {
                    fcmOk = await trySetupFcm(handleIncomingNotification);
                }
            }

            if (!fcmOk) {
                channelMode = 'sse';
                setupSse(handleIncomingNotification);
            } else {
                channelMode = 'fcm';
            }
        }

        init();
    }, [queryClient]);
};
