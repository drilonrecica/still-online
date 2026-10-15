// The six winks: catalog keys for their names and how long each plays over the chat.
import { WINK_IDS, type WinkId } from '@/content/types';
import type { MessageKey } from '@/i18n/types';

export interface WinkInfo {
  nameKey: MessageKey;
  /** Full animation length; every wink stays at or under WINK_MAX_MS. */
  durationMs: number;
}

export const WINK_MAX_MS = 4000;
/** With reduced motion a wink shows its still frame this long instead of animating. */
export const WINK_STILL_MS = 1500;

export const WINKS: Readonly<Record<WinkId, WinkInfo>> = {
  kiss: { nameKey: 'messenger.winks.kiss', durationMs: 3200 },
  hamster: { nameKey: 'messenger.winks.hamster', durationMs: 3600 },
  hearts: { nameKey: 'messenger.winks.hearts', durationMs: 3600 },
  pickle: { nameKey: 'messenger.winks.pickle', durationMs: 3600 },
  fireworks: { nameKey: 'messenger.winks.fireworks', durationMs: 3600 },
  snowball: { nameKey: 'messenger.winks.snowball', durationMs: 3800 },
};

/** Menu order (3×2 grid). */
export const WINK_ORDER: readonly WinkId[] = WINK_IDS;

/** How long the overlay stays for `wink`. */
export const winkPlayMs = (wink: WinkId, reduced: boolean) =>
  reduced ? WINK_STILL_MS : WINKS[wink].durationMs;
