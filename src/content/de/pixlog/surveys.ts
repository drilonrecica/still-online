// German Pixlog surveys, same ids, question counts and order as `src/content/pixlog/surveys`.
// P4 replaces this with German.
import { SURVEYS as EN_SURVEYS } from '../../pixlog/surveys';
import type { Survey } from '../../pixlog/types';

export const SURVEYS: readonly Survey[] = structuredClone(EN_SURVEYS);
