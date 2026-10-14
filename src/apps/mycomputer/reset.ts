import { STORAGE_PREFIX } from '@/os/persist';

export { STORAGE_PREFIX };

/** Removes every persisted still-online key. Returns how many were removed. */
export function clearStillOnlineStorage(storage: Storage): number {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
  return keys.length;
}
