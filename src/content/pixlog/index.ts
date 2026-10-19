// Pixlog profiles, one per friend, in sign-in order. Sample data for now: P3-02/P3-03 add the
// rest (and P2-02 the seeded stranger names for the visitors box).
import { jessPixlog } from './jess';
import type { PixlogProfile } from './types';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [jessPixlog];
