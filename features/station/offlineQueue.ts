import axios from 'axios';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { useStaffSession } from '@/features/pos/useStaffSession';

export type StationOpType =
  | 'create_order' | 'accept_order' | 'reject_order' | 'start_preparing'
  | 'mark_ready' | 'mark_served' | 'complete_order' | 'cancel_order' | 'add_items'
  | 'add_payment' | 'void_item' | 'bump_item' | 'recall_item';

export interface QueuedOperation {
  idempotencyKey: string;
  type: StationOpType;
  orderId?: string;
  itemId?: string;
  payload?: Record<string, any>;
  clientTimestamp: string;
  // Staff token of whoever performed the action, so the server attributes it to them and
  // checks *their* permissions — not those of whoever is signed in when the queue drains.
  staffToken?: string;
}

export interface ReconcileResult {
  idempotencyKey: string;
  status: 'applied' | 'already_applied' | 'conflict' | 'error';
  data?: any;
  error?: string;
}

export interface RejectedOperation extends QueuedOperation {
  error: string;
  rejectedAt: string;
}

const DB_NAME = 'flairsync_station_v1';
const STORE = 'offline_queue';
// Operations the server refused (a 4xx: no permission, invalid transition, …). Kept rather
// than deleted so nothing queued is lost silently, and kept out of the queue so they stop
// being retried — retrying a refusal only repeats it.
const REJECTED_STORE = 'rejected_operations';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'idempotencyKey' });
      }
      if (!req.result.objectStoreNames.contains(REJECTED_STORE)) {
        req.result.createObjectStore(REJECTED_STORE, { keyPath: 'idempotencyKey' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Queues as the staff member currently signed in on this device unless the caller says
// otherwise. `put`, not `add`: re-queuing the same key (e.g. a retry after a network
// failure) must not throw.
export async function enqueueOperation(op: QueuedOperation): Promise<void> {
  const staffToken = op.staffToken ?? useStaffSession.getState().session?.shortToken;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...op, staffToken });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getAllPending(): Promise<QueuedOperation[]> {
  const db = await openDb();
  const result = await new Promise<QueuedOperation[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedOperation[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function removeOperations(keys: string[]): Promise<void> {
  if (!keys.length) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    keys.forEach((k) => store.delete(k));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

// Moves refused operations out of the queue into the rejected store, in one transaction.
export async function markOperationsRejected(rejected: { op: QueuedOperation; error: string }[]): Promise<void> {
  if (!rejected.length) return;
  const rejectedAt = new Date().toISOString();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, REJECTED_STORE], 'readwrite');
    for (const { op, error } of rejected) {
      tx.objectStore(STORE).delete(op.idempotencyKey);
      tx.objectStore(REJECTED_STORE).put({ ...op, error, rejectedAt } satisfies RejectedOperation);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function generateIdempotencyKey(): string {
  return uuidv4();
}

// Order ids are generated on the device (time-ordered UUIDv7), so an order created offline
// can be referenced by the actions queued after it, and a create that reached the server
// but lost its response is recognised on replay instead of producing a second order.
export function generateOrderId(): string {
  return uuidv7();
}

// True when a request never got an answer (no network, DNS failure, timeout). That is the
// usual outage: the WiFi is up so navigator.onLine stays true, but the Internet is down.
// Server errors (any response at all) are not queued — retrying those won't help.
export function isNetworkFailure(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response && err.code !== 'ERR_CANCELED';
}
