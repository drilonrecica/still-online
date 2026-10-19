// German Friendspace profiles, same contact ids and order as `src/content/friendspace/profiles`.
import type { ProfileContent } from '../../../friendspace/profiles/types';
import { dexProfile } from './dex';
import { jessProfile } from './jess';
import { kaylaProfile } from './kayla';
import { marcoProfile } from './marco';
import { piaProfile } from './pia';
import { theoProfile } from './theo';

export const PROFILES: readonly ProfileContent[] = [
  jessProfile,
  piaProfile,
  kaylaProfile,
  marcoProfile,
  theoProfile,
  dexProfile,
];
