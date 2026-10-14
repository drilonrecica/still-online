// Typed event bus. The only channel for cross-app communication.

/** Event name → payload. Namespace names as `<app>:<event>`; add new events here. */
export interface OsEventMap {
  'amplifier:trackChanged': {
    trackId: string;
    artist: string;
    title: string;
    durationSec: number;
  };
  'amplifier:stopped': { trackId: string | null };
}

export type Listener<P> = (payload: P) => void;

export interface EventBus<M extends object> {
  emit: <K extends keyof M>(type: K, payload: M[K]) => void;
  /** Subscribes and returns an unsubscribe function. */
  on: <K extends keyof M>(type: K, listener: Listener<M[K]>) => () => void;
  off: <K extends keyof M>(type: K, listener: Listener<M[K]>) => void;
  /** Removes every listener. For tests and log off. */
  clear: () => void;
}

export function createEventBus<M extends object>(): EventBus<M> {
  const listeners = new Map<keyof M, Set<Listener<never>>>();

  function off<K extends keyof M>(type: K, listener: Listener<M[K]>) {
    listeners.get(type)?.delete(listener);
  }

  return {
    emit(type, payload) {
      const set = listeners.get(type);
      if (!set) return;
      // Snapshot so listeners may subscribe/unsubscribe while handling.
      for (const listener of [...set] as Listener<typeof payload>[]) {
        try {
          listener(payload);
        } catch (error) {
          // One broken listener must not stop delivery to the others.
          console.error(`[events] listener for "${String(type)}" threw`, error);
        }
      }
    },
    on(type, listener) {
      let set = listeners.get(type);
      if (!set) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(listener);
      return () => off(type, listener);
    },
    off,
    clear() {
      listeners.clear();
    },
  };
}

export const events = createEventBus<OsEventMap>();
