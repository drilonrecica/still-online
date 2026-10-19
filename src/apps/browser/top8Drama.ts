// Friendspace's half of the Top 8 drama (P0-03): which friends a saved Top 8 dropped or added.
// `saveProfile` sends the diff as `web:top8Changed`. See docs/architecture-v0.4.md → "Events".
import { contacts } from '@/content/contacts';
import type { PlayerTopEntry } from '@/content/friendspace/types';
import type { ContactId } from '@/content/types';
import { WEB_LIMITS } from './webSanitize';

/**
 * The friends in the Top 8 shown before the player first saves one: every friend, like
 * `effectiveProfile` (friendspace/logic.ts) shows them.
 */
export const DEFAULT_TOP8_CONTACTS: readonly ContactId[] = contacts
  .map((c) => c.contact.id)
  .slice(0, WEB_LIMITS.top8);

const contactIds = (top8: readonly PlayerTopEntry[]): ContactId[] =>
  top8.flatMap((e) => (e.kind === 'contact' ? [e.id] : []));

/** Friends in `before` but not `after` (dropped) and the other way round (added), in order. */
export function top8Diff(
  before: readonly ContactId[],
  after: readonly PlayerTopEntry[],
): { dropped: ContactId[]; added: ContactId[] } {
  const now = contactIds(after);
  return {
    dropped: before.filter((id) => !now.includes(id)),
    added: now.filter((id, i) => !before.includes(id) && now.indexOf(id) === i),
  };
}

/** The friends in a saved Top 8 (`undefined` = never saved: the default one). */
export const savedTop8Contacts = (
  top8: readonly PlayerTopEntry[] | undefined,
): readonly ContactId[] => (top8 ? contactIds(top8) : DEFAULT_TOP8_CONTACTS);
