// Site components read their text through this hook, so a language switch re-renders them.
import {
  getSiteText,
  type SiteTextHost,
  type SiteTexts,
} from '@/content/locale';
import { useLocale } from '@/i18n/useT';

/** The text module of a content-backed site in the current language. */
export function useSiteText<H extends SiteTextHost>(host: H): SiteTexts[H] {
  return getSiteText(host, useLocale());
}
