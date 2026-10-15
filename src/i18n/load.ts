// Lazy languages: English is bundled, every other language (German) is one chunk — its UI
// catalog plus all its content — fetched the first time it is needed: before the app starts
// (src/main.tsx) or when the player switches (`setLanguage` in the settings store).
// No store or content imports here, so both can use this without a cycle.
import type { LocaleContent } from '@/content/locale';
import { installCatalog } from './messages';
import type { Locale } from './types';

const contents = new Map<Locale, LocaleContent>();
const pending = new Map<Locale, Promise<void>>();

/** A loaded language's content (`undefined` for English and not-yet-loaded languages). */
export const loadedContent = (locale: Locale): LocaleContent | undefined =>
  contents.get(locale);

/** True once `locale`'s catalog and content are in place (always for English). */
export const isLocaleLoaded = (locale: Locale): boolean =>
  locale === 'en' || contents.has(locale);

/** Loads `locale` once; concurrent calls share the request, a failed one can be retried. */
export function loadLocale(locale: Locale): Promise<void> {
  if (isLocaleLoaded(locale)) return Promise.resolve();
  let request = pending.get(locale);
  if (!request) {
    request = import('@/content/de/bundle')
      .then((bundle) => {
        installCatalog(locale, bundle.catalog);
        contents.set(locale, bundle.content);
      })
      .finally(() => pending.delete(locale));
    pending.set(locale, request);
  }
  return request;
}
