// German text for Jess's and Kayla's girl-only threads (W1-01; `src/content/contacts/jess-girl.ts`,
// `kayla-girl.ts`). Placeholders until W3: the English text, same ids and counts. One side only.
// W3 replaces this with German
import type { ContactOverlay } from '../../types';
import { jessGirlThreads as enJess } from '../../contacts/jess-girl';
import { kaylaGirlThreads as enKayla } from '../../contacts/kayla-girl';
import { placeholderScripts } from './placeholder';

export const jessGirlThreads: ContactOverlay['scripts'] =
  placeholderScripts(enJess);

export const kaylaGirlThreads: ContactOverlay['scripts'] =
  placeholderScripts(enKayla);
