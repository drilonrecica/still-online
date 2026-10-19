// German Top 8 wall lines, same contact ids and order as `src/content/friendspace/top8Reactions`.
// P4 replaces this with German.
import { TOP8_REACTIONS as EN_TOP8_REACTIONS } from '../../friendspace/top8Reactions';
import type { Top8Reaction } from '../../friendspace/types';

export const TOP8_REACTIONS: readonly Top8Reaction[] =
  structuredClone(EN_TOP8_REACTIONS);
