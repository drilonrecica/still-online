// German band pages, same ids and order as `src/content/friendspace/bands`.
// P4 replaces this with German.
import { BANDS as EN_BANDS } from '../../friendspace/bands';
import type { Band } from '../../friendspace/types';

export const BANDS: readonly Band[] = structuredClone(EN_BANDS);
