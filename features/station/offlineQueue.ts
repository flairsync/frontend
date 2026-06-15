import { v4 as uuidv4 } from 'uuid';

export type StationOpType =
  | 'create_order' | 'accept_order' | 'reject_order' | 'start_preparing'
  | 'mark_ready' | 'complete_order' | 'cancel_order' | 'add_items'
  | 'add_payment' | 'void_item';

export interface QueuedOperation {
  idempotencyKey: string;
  type: StationOpType;
  orderId?: string;
  itemId?: string;
  payload?: Record<string, any>;
  clientTimestamp: string;
}

export interface ReconcileResult {
  idempotencyKey: string;
  status: 'applied' | 'already_applied' | 'conflict' | 'error';
  data?: any;
  error?: string;
}

const DB_NAME = 'flairsync_station_v1';
const STORE = 'offline_queue';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'idempotencyKey' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueOperation(op: QueuedOperation): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(op);
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

export function generateIdempotencyKey(): string {
  return uuidv4();
}
