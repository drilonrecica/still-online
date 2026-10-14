// Nudges on the UI side: the player's rate limit and incoming-nudge shake requests.
import type { ContactId } from '@/content/types';

/** The player may nudge each contact once per this many ms. */
export const NUDGE_INTERVAL_MS = 10_000;
/** How long a chat window shakes for an incoming nudge. */
export const SHAKE_MS = 500;

export interface NudgeLimiter {
  /** Records a nudge and returns true, or returns false if it's too soon. */
  tryNudge: (contactId: ContactId) => boolean;
  reset: () => void;
}

export function createNudgeLimiter(
  intervalMs = NUDGE_INTERVAL_MS,
  now: () => number = () => Date.now(),
): NudgeLimiter {
  const last = new Map<ContactId, number>();
  return {
    tryNudge(contactId) {
      const t = now();
      const prev = last.get(contactId);
      if (prev !== undefined && t - prev < intervalMs) return false;
      last.set(contactId, t);
      return true;
    },
    reset: () => last.clear(),
  };
}

/** Shared by every chat window, so closing and reopening a chat doesn't reset the limit. */
export const nudgeLimiter = createNudgeLimiter();

// --- shake requests ----------------------------------------------------------
// The runtime requests a shake and opens the chat; a window that mounts a moment later still
// gets it, because unclaimed requests wait briefly.

type ShakeListener = () => void;

const PENDING_TTL_MS = 2000;
const listeners = new Map<ContactId, Set<ShakeListener>>();
const pending = new Map<ContactId, number>();

export function requestShake(contactId: ContactId): void {
  const set = listeners.get(contactId);
  if (set && set.size > 0) set.forEach((fn) => fn());
  else pending.set(contactId, Date.now());
}

/** Subscribes a chat window; a pending request from the last moment fires right away. */
export function onShake(contactId: ContactId, fn: ShakeListener): () => void {
  let set = listeners.get(contactId);
  if (!set) listeners.set(contactId, (set = new Set()));
  set.add(fn);
  const at = pending.get(contactId);
  pending.delete(contactId);
  if (at !== undefined && Date.now() - at <= PENDING_TTL_MS) fn();
  return () => set.delete(fn);
}
