// Shared Zustand `persist` options. See docs/architecture.md → "Persistence".
import type { PersistOptions, PersistStorage } from 'zustand/middleware';
import type { PersistedStoreName } from '@/os/types';

export const STORAGE_PREFIX = 'still-online:v1:';
export const STORAGE_VERSION = 1;

export function storageKey(name: PersistedStoreName): string {
  return `${STORAGE_PREFIX}${name}`;
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** localStorage that never throws: unreadable or corrupt data reads as "nothing stored". */
function createSafeStorage<S>(): PersistStorage<S> {
  const store = (): Storage | null => {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  };
  return {
    getItem(name) {
      try {
        const raw = store()?.getItem(name);
        if (raw == null) return null;
        const parsed: unknown = JSON.parse(raw);
        if (
          !isRecord(parsed) ||
          !isRecord(parsed.state) ||
          typeof parsed.version !== 'number'
        ) {
          return null;
        }
        return parsed as unknown as { state: S; version: number };
      } catch {
        return null;
      }
    },
    setItem(name, value) {
      try {
        store()?.setItem(name, JSON.stringify(value));
      } catch {
        // Quota exceeded or storage blocked: the game keeps running unsaved.
      }
    },
    removeItem(name) {
      try {
        store()?.removeItem(name);
      } catch {
        // Nothing to remove.
      }
    },
  };
}

interface PersistConfig<S, P> {
  name: PersistedStoreName;
  /** Data only: never actions or derived values. */
  partialize: (state: S) => P;
  /**
   * Builds the state from untrusted persisted data. Must tolerate any shape and fall back to
   * `current` for anything missing or invalid.
   */
  sanitize: (persisted: unknown, current: S) => S;
  skipHydration?: boolean;
}

/** Options for `persist(...)` with the `still-online:v1:<name>` key and reset-on-mismatch. */
export function persistOptions<S, P = S>(
  config: PersistConfig<S, P>,
): PersistOptions<S, P> {
  return {
    name: storageKey(config.name),
    version: STORAGE_VERSION,
    storage: createSafeStorage<P>(),
    partialize: config.partialize,
    skipHydration: config.skipHydration,
    // A version mismatch discards the old data: an empty object sanitizes to defaults.
    migrate: () => ({}) as P,
    merge: (persisted, current) => config.sanitize(persisted, current),
  };
}
