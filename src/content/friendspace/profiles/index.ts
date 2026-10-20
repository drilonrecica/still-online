// Friendspace profiles (P4-04), one per Messenger contact, in sign-in order. Each module holds days
// 1–5; `week2.ts` adds the walls of days 6–10 (W2-03).
import { dexProfile } from './dex';
import { jessProfile } from './jess';
import { kaylaProfile } from './kayla';
import { marcoProfile } from './marco';
import { piaProfile } from './pia';
import { theoProfile } from './theo';
import { withWallWeek, type ProfileContent } from './types';
import {
  DEX_WEEK2,
  JESS_WEEK2,
  KAYLA_WEEK2,
  MARCO_WEEK2,
  PIA_WEEK2,
  THEO_WEEK2,
} from './week2';

export const PROFILES: readonly ProfileContent[] = [
  withWallWeek(jessProfile, JESS_WEEK2),
  withWallWeek(piaProfile, PIA_WEEK2),
  withWallWeek(kaylaProfile, KAYLA_WEEK2),
  withWallWeek(marcoProfile, MARCO_WEEK2),
  withWallWeek(theoProfile, THEO_WEEK2),
  withWallWeek(dexProfile, DEX_WEEK2),
];
