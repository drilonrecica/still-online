// Site components read their text through this hook, so a language or gender switch re-renders
// them.
import {
  getSiteText,
  type SiteTextHost,
  type SiteTexts,
} from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import { useLocale } from '@/i18n/useT';

/** The text module of a content-backed site in the current language and gender. */
export function useSiteText<H extends SiteTextHost>(host: H): SiteTexts[H] {
  return getSiteText(host, useLocale(), useGender());
}
