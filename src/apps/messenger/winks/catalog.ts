// The six winks: display names and how long each plays over the chat.
import { WINK_IDS, type WinkId } from '@/content/types';

export interface WinkInfo {
  name: string;
  /** Full animation length; every wink stays at or under WINK_MAX_MS. */
  durationMs: number;
}

export const WINK_MAX_MS = 4000;
/** With reduced motion a wink shows its still frame this long instead of animating. */
export const WINK_STILL_MS = 1500;

export const WINKS: Readonly<Record<WinkId, WinkInfo>> = {
  kiss: { name: 'Kiss', durationMs: 3200 },
  hamster: { name: 'Hamster', durationMs: 3600 },
  hearts: { name: 'Hearts', durationMs: 3600 },
  pickle: { name: 'Pickle', durationMs: 3600 },
  fireworks: { name: 'Fireworks', durationMs: 3600 },
  snowball: { name: 'Snowball', durationMs: 3800 },
};

/** Menu order (3×2 grid). */
export const WINK_ORDER: readonly WinkId[] = WINK_IDS;

/** How long the overlay stays for `wink`. */
export const winkPlayMs = (wink: WinkId, reduced: boolean) =>
  reduced ? WINK_STILL_MS : WINKS[wink].durationMs;
