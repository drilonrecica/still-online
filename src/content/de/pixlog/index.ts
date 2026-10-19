// German Pixlog profiles, same contact ids and order as `src/content/pixlog`.
import type { PixlogProfile } from '../../pixlog/types';
import { STRANGERS as EN_STRANGERS } from '../../pixlog';
import { jessPixlog } from './jess';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [jessPixlog];

/** Same count as English. P4 replaces this with German screen names. */
export const STRANGERS: readonly string[] = [...EN_STRANGERS];
