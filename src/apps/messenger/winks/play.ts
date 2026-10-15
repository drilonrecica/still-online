// Wink play requests: the runtime asks a contact's chat to play a wink. Like nudge shakes, a
// request made just before the chat window mounts (it was closed) still plays once it does.
import type { ContactId, WinkId } from '@/content/types';

type WinkListener = (wink: WinkId) => void;

const PENDING_TTL_MS = 2000;
const listeners = new Map<ContactId, Set<WinkListener>>();
const pending = new Map<ContactId, { wink: WinkId; at: number }>();

export function requestWink(contactId: ContactId, wink: WinkId): void {
  const set = listeners.get(contactId);
  if (set && set.size > 0) set.forEach((fn) => fn(wink));
  else pending.set(contactId, { wink, at: Date.now() });
}

/** Subscribes a chat window; a pending request from the last moment plays right away. */
export function onWink(contactId: ContactId, fn: WinkListener): () => void {
  let set = listeners.get(contactId);
  if (!set) listeners.set(contactId, (set = new Set()));
  set.add(fn);
  const p = pending.get(contactId);
  pending.delete(contactId);
  if (p && Date.now() - p.at <= PENDING_TTL_MS) fn(p.wink);
  return () => set.delete(fn);
}
