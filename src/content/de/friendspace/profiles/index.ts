// German Friendspace profiles, same contact ids and order as `src/content/friendspace/profiles`.
// Days 6–10 (W2-03) are the English walls as placeholders until W3.
import {
  withWallWeek,
  type ProfileContent,
} from '../../../friendspace/profiles/types';
// W3 replaces this with German
import {
  DEX_WEEK2,
  JESS_WEEK2,
  KAYLA_WEEK2,
  MARCO_WEEK2,
  PIA_WEEK2,
  THEO_WEEK2,
} from '../../../friendspace/profiles/week2';
import { dexProfile } from './dex';
import { jessProfile } from './jess';
import { kaylaProfile } from './kayla';
import { marcoProfile } from './marco';
import { piaProfile } from './pia';
import { theoProfile } from './theo';

export const PROFILES: readonly ProfileContent[] = [
  withWallWeek(jessProfile, JESS_WEEK2),
  withWallWeek(piaProfile, PIA_WEEK2),
  withWallWeek(kaylaProfile, KAYLA_WEEK2),
  withWallWeek(marcoProfile, MARCO_WEEK2),
  withWallWeek(theoProfile, THEO_WEEK2),
  withWallWeek(dexProfile, DEX_WEEK2),
];
