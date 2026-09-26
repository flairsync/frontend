import { useCallback, useEffect, useRef, useState } from 'react';
import { staffApi } from './station-api';
import { useStaffSession } from '@/features/pos/useStaffSession';
import {
  getAllPending,
  markOperationsRejected,
  removeOperations,
  type ReconcileResult,
} from './offlineQueue';

const RETRY_INTERVAL_MS = 30_000;

export interface ReconcileOutcome {
  synced: number;
  rejected: number;
}

interface Options {
  onOutcome: (outcome: ReconcileOutcome) => void;
  onSessionExpired?: () => void;
  onSettled?: () => void;
}

// Drains this device's offline queue through POST /station/reconcile.
//
// Replays on the `online` event, when a staff member signs in, on mount, and every 30s
// while anything is pending. The `online` event alone missed the usual outage (WiFi up,
// Internet down) and any replay that failed because the staff PIN session had expired.
// Only one replay runs at a time.
export function useOfflineReconcile({ onOutcome, onSessionExpired, onSettled }: Options) {
  const [pendingCount, setPendingCount] = useState(0);
  const running = useRef(false);
  const callbacks = useRef({ onOutcome, onSessionExpired, onSettled });
  callbacks.current = { onOutcome, onSessionExpired, onSettled };
  const hasSession = useStaffSession((s) => Boolean(s.session));

  const refreshPendingCount = useCallback(() => {
    getAllPending()
      .then((pending) => setPendingCount(pending.length))
      .catch(() => {});
  }, []);

  const reconcileNow = useCallback(async () => {
    if (running.current || !useStaffSession.getState().session) return;
    running.current = true;
    let attempted = false;
    try {
      const pending = await getAllPending();
      if (!pending.length) return;
      attempted = true;

      const res = await staffApi.post('/station/reconcile', { operations: pending });
      const results: ReconcileResult[] = res.data?.data ?? res.data ?? [];
      const byKey = new Map(pending.map((op) => [op.idempotencyKey, op]));

      const done = results
        .filter((r) => r.status === 'applied' || r.status === 'already_applied')
        .map((r) => r.idempotencyKey);
      // 'conflict' is a refusal (4xx) and will be refused again; 'error' is a server
      // failure and stays queued for the next attempt.
      const refused = results
        .filter((r) => r.status === 'conflict' && byKey.has(r.idempotencyKey))
        .map((r) => ({ op: byKey.get(r.idempotencyKey)!, error: r.error ?? 'Refused by server' }));

      await removeOperations(done);
      await markOperationsRejected(refused);
      if (refused.length) console.warn('[offline-sync] operations refused by server', refused);

      if (done.length || refused.length) {
        callbacks.current.onOutcome({ synced: done.length, rejected: refused.length });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) callbacks.current.onSessionExpired?.();
    } finally {
      running.current = false;
      refreshPendingCount();
      if (attempted) callbacks.current.onSettled?.();
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();
    window.addEventListener('online', reconcileNow);
    return () => window.removeEventListener('online', reconcileNow);
  }, [reconcileNow, refreshPendingCount]);

  // A new PIN session is the moment an expired-session replay can finally succeed.
  useEffect(() => {
    if (hasSession) void reconcileNow();
  }, [hasSession, reconcileNow]);

  useEffect(() => {
    if (!pendingCount) return;
    const id = window.setInterval(() => {
      if (navigator.onLine) void reconcileNow();
    }, RETRY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pendingCount, reconcileNow]);

  return { pendingCount, refreshPendingCount, reconcileNow };
}
