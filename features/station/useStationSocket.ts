import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getStationToken } from './useStationAuth';
import { API_URL } from "@/lib/flairapi";

export interface OrderUpdatePayload {
  id: string;
  status: string;
  tableId: string | null;
  updatedAt: string;
}

// 'connected': live updates are flowing. 'connecting': initial handshake or a
// reconnection attempt in progress — order pushes may be delayed or missed.
// 'disconnected': no live channel at all (dropped, auth failure, no token).
export type StationSocketStatus = 'connected' | 'connecting' | 'disconnected';

export function useStationSocket(onOrderUpdate: (payload: OrderUpdatePayload) => void): StationSocketStatus {
  // Keep the latest handler in a ref so the socket listener never goes stale
  const handlerRef = useRef(onOrderUpdate);
  handlerRef.current = onOrderUpdate;

  const [status, setStatus] = useState<StationSocketStatus>('connecting');

  useEffect(() => {
    const token = getStationToken();
    if (!token) {
      setStatus('disconnected');
      return;
    }

    // Derive the API server origin from the configured base URL
    const apiOrigin = new URL(API_URL).origin;
    const socket: Socket = io(`${apiOrigin}/station`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10_000,
    });

    setStatus(socket.connected ? 'connected' : 'connecting');

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('disconnected'));
    socket.io.on('reconnect_attempt', () => setStatus('connecting'));

    socket.on('order.update', (payload: OrderUpdatePayload) => {
      handlerRef.current(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // intentionally empty — socket is created once per mount

  return status;
}
