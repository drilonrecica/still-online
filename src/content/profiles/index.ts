// Spaceport profiles (P4-04), one per Messenger contact, in sign-in order.
import { dexProfile } from './dex';
import { jessProfile } from './jess';
import { kaylaProfile } from './kayla';
import { marcoProfile } from './marco';
import { piaProfile } from './pia';
import { theoProfile } from './theo';
import type { ProfileContent } from './types';

export const PROFILES: readonly ProfileContent[] = [
  jessProfile,
  piaProfile,
  kaylaProfile,
  marcoProfile,
  theoProfile,
  dexProfile,
];
