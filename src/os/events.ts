// Typed event bus. The only channel for cross-app communication.
import type { GameId } from '@/os/types';

/** Event name → payload. Namespace names as `<app>:<event>`; add new events here. */
export interface OsEventMap {
  'amplifier:trackChanged': {
    trackId: string;
    artist: string;
    title: string;
    durationSec: number;
  };
  'amplifier:stopped': { trackId: string | null };
  // v0.2 (docs/architecture-v0.2.md → "Events")
  /** Open Web Explorer at `url` (`http://<host>.example/...`). Handled by `os/browserRouter.ts`. */
  'browser:open': { url: string };
  /** Add a playlist track if missing; `play` also starts it and opens the Amplifier. */
  'amplifier:enqueue': { trackId: string; play?: boolean };
  /** A finished game. Mines: `score` = seconds, `detail` = level. */
  'game:score': { game: GameId; score: number; detail?: string };
  /** The day advanced (at most +1 per boot). */
  'world:dayChanged': { day: number };
  /** An unlock id was added for the first time. */
  'world:unlock': { id: string };
  'network:connected': { kbps: number };
  'network:disconnected': Record<string, never>;
  /** The player has been idle for a threshold registered through `onIdle`. */
  'os:idle': { minutes: number };
  /** First input after an `os:idle`. */
  'os:active': Record<string, never>;
  /** fs nodes created, changed, moved or removed. */
  'fs:changed': { ids: string[] };
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
