// German Friendspace bulletins, same ids, days and order as `src/content/friendspace/bulletins`.
// P4 replaces this with German.
import { BULLETINS as EN_BULLETINS } from '../../friendspace/bulletins';
import type { Bulletin } from '../../friendspace/types';

export const BULLETINS: readonly Bulletin[] = structuredClone(EN_BULLETINS);
