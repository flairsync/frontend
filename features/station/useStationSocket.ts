import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getStationToken } from './useStationAuth';

export interface OrderUpdatePayload {
  id: string;
  status: string;
  tableId: string | null;
  updatedAt: string;
}

export function useStationSocket(onOrderUpdate: (payload: OrderUpdatePayload) => void): void {
  // Keep the latest handler in a ref so the socket listener never goes stale
  const handlerRef = useRef(onOrderUpdate);
  handlerRef.current = onOrderUpdate;

  useEffect(() => {
    const token = getStationToken();
    if (!token) return;

    // Derive the API server origin from the configured base URL
    const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL as string).origin;
    const socket: Socket = io(`${apiOrigin}/station`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10_000,
    });

    socket.on('order.update', (payload: OrderUpdatePayload) => {
      handlerRef.current(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // intentionally empty — socket is created once per mount
}
