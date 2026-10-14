// Player-uploaded bytes (photos, wallpapers). IndexedDB `still-online` → `blobs`, with an
// in-memory fallback when IndexedDB is unavailable (jsdom, private mode). See docs/architecture-v0.2.md.
import { useEffect, useState } from 'react';

const DB_NAME = 'still-online';
const STORE = 'blobs';

const memory = new Map<string, Blob>();
let warned = false;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function warnOnce(reason: unknown): void {
  if (warned) return;
  warned = true;
  console.warn(
    'still-online: IndexedDB unavailable, blobs are kept in memory for this session.',
    reason,
  );
}

function openDb(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no indexedDB');
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        warnOnce(req.error);
        resolve(null);
      };
      req.onblocked = () => {
        warnOnce('blocked');
        resolve(null);
      };
    } catch (e) {
      warnOnce(e);
      resolve(null);
    }
  });
  return dbPromise;
}

/** Runs one request on the object store; null when IndexedDB isn't usable. */
async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<{ value: T } | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise((resolve, reject) => {
      const req = run(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve({ value: req.result });
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    warnOnce(e);
    return null;
  }
}

function newKey(): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `blob:${id}`;
}

export async function putBlob(blob: Blob): Promise<string> {
  const key = newKey();
  const stored = await withStore('readwrite', (s) => s.put(blob, key));
  if (!stored) memory.set(key, blob);
  return key;
}

export async function getBlob(key: string): Promise<Blob | null> {
  const mem = memory.get(key);
  if (mem) return mem;
  const found = await withStore<unknown>('readonly', (s) => s.get(key));
  return found?.value instanceof Blob ? found.value : null;
}

export async function deleteBlob(key: string): Promise<void> {
  memory.delete(key);
  await withStore('readwrite', (s) => s.delete(key));
}

export async function clearBlobs(): Promise<void> {
  memory.clear();
  await withStore('readwrite', (s) => s.clear());
}

/** An object URL for the stored blob, revoked when `key` changes or the component unmounts. */
export function useBlobUrl(key: string | null): string | null {
  const [state, setState] = useState<{ key: string; url: string } | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    let url: string | null = null;
    void getBlob(key).then((blob) => {
      if (cancelled || !blob) return;
      url = URL.createObjectURL(blob);
      setState({ key, url });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key]);

  return key && state?.key === key ? state.url : null;
}
