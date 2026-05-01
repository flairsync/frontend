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
        // We'll connect if we have a socket isn't already created.
        // The instructions suggest using HTTP-only cookies, so manual token passing is not required.

        // Connect to the specific namespace and authenticate
        if (!socket) {
            // Deriving apiUrl from BASE_URL if available
            const baseUrl = import.meta.env.BASE_URL;
            const apiUrl = baseUrl ? new URL(baseUrl).origin : window.location.origin;

            socket = io(`${apiUrl}/notifications`, {
                withCredentials: true,
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
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            if (notification.type === 'ALERT' || notification.type === 'SECURITY') {
                toast.error(notification.title, { description: notification.message });
            } else if (notification.type === 'INVENTORY_LOW_STOCK') {
                queryClient.invalidateQueries({ queryKey: ['inventory_low_stock'] });
                queryClient.invalidateQueries({ queryKey: ['inventory_dashboard'] });
                toast.warning(notification.title, { description: notification.message });
            } else if (notification.type === 'RESERVATION') {
                // Refresh the specific reservation timeline if we have the ID
                const { reservationId, businessId } = notification.payload ?? {};
                if (businessId && reservationId) {
                    queryClient.invalidateQueries({
                        queryKey: ['reservation_timeline', businessId, reservationId],
                    });
                }
                // Also refresh the reservation dashboard (staff view) and list
                if (businessId) {
                    queryClient.invalidateQueries({ queryKey: ['reservation-dashboard', businessId] });
                    queryClient.invalidateQueries({ queryKey: ['reservations', businessId] });
                }
                // Refresh the customer's personal reservations list
                queryClient.invalidateQueries({ queryKey: ['my_reservations'] });
                toast.info(notification.title, { description: notification.message });
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
