// First-start language detection. See docs/i18n.md → "Locale state, detection, live switching".
import type { Locale } from './types';

/**
 * The locale for a browser's language list (`navigator.languages`): `'de'` if the first entry
 * whose primary subtag we support is German, else `'en'`. Only the first match counts, so
 * `['en-GB', 'de']` stays English.
 */
export function detectLocale(
  languages: readonly (string | null | undefined)[] | null | undefined,
): Locale {
  for (const tag of languages ?? []) {
    const primary = tag?.split(/[-_]/)[0]?.toLowerCase();
    if (primary === 'de') return 'de';
    if (primary === 'en') return 'en';
  }
  return 'en';
}

/** `detectLocale` on this browser; `'en'` where there is no `navigator`. */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  return detectLocale(navigator.languages ?? [navigator.language]);
}
