// High-score names: the games store `Anonymous` when nobody typed a name (and may hold it from
// an older save). The display shows the localized stand-in instead, so the default follows the
// language.
import type { TFunction } from './types';

export function scoreName(name: string | undefined, t: TFunction): string {
  return !name || name === 'Anonymous' ? t('highScores.anonymous') : name;
}
