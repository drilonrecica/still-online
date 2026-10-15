// Every locale's catalog. No store imports, so stores can read catalogs without a cycle.
// English is bundled; German is loaded on demand (`loadLocale`, src/i18n/load.ts) and stands in
// as English until then, so `translate` never sees a missing catalog.
import type { Locale, Messages } from '../types';
import { en } from './en';

export const MESSAGES: Record<Locale, Messages> = { en, de: en };

/** Installs a lazily loaded catalog. */
export function installCatalog(locale: Locale, catalog: Messages): void {
  MESSAGES[locale] = catalog;
}
