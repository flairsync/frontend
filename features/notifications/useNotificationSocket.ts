import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getJwtToken } from '@/misc/SecureStorage';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NotificationPayload } from './types';

// Let's create a singleton socket connection to avoid multiple connections
let socket: Socket | null = null;

export const useNotificationSocket = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = getJwtToken();

        if (!token) {
            return;
        }

        // Connect to the specific namespace and authenticate
        if (!socket) {
            // API_URL might be defined in import.meta.env, let's derive it from the frontend URL or VITE_API_URL
            // Since flairapi uses BASE_URL for api, we'll try to extract the origin.
            // Often, VITE_API_URL or similar is used:
            const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

            socket = io(`${apiUrl}/notifications`, {
                auth: {
                    token
                },
                transports: ['websocket', 'polling'] // Try WebSocket first
            });

            socket.on('connect', () => {
                console.log('Connected to notifications socket namespace');
            });

            socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });
        }

        const handleNewNotification = (notification: NotificationPayload) => {
            // Invalidate queries so unread count and notification list refresh
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Optionally show a toast for new notifications based on type
            if (notification.type === 'ALERT' || notification.type === 'SECURITY') {
                toast.error(notification.title, { description: notification.message });
            } else {
                toast.info(notification.title, { description: notification.message });
            }
        };

        socket.on('new-notification', handleNewNotification);

        return () => {
            if (socket) {
                socket.off('new-notification', handleNewNotification);
            }
        };
    }, [queryClient]);
};
