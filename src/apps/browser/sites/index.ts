// The fictional web: every registered site, and URL → page resolution.
// See docs/architecture-v0.2.md → "Web (P4)". Later tasks append their sites to SITES.
import type { ResolvedPage, SiteDefinition } from '@/content/sites/types';
import type { Locale } from '@/i18n/types';
import { parseUrl } from '../url';
import { ABOUT_SITE } from './about';
import { CHEATCAVE_SITE } from './cheatcave';
import { GOSSIP_SITE } from './celebgossip07';
import { KICKFLIP_SITE } from './kickflipkings';
import { SEARCHLY_SITE } from './searchly';
import { FRIENDSPACE_SITE } from './friendspace';
import { TINFOIL_SITE } from './tinfoilcomets';
import { VIRUSGUARD_SITE } from './virusguard';
import { WESTFIELD_SITE } from './westfieldhigh';

export const SITES: readonly SiteDefinition[] = [
  SEARCHLY_SITE,
  TINFOIL_SITE,
  FRIENDSPACE_SITE,
  WESTFIELD_SITE,
  GOSSIP_SITE,
  CHEATCAVE_SITE,
  KICKFLIP_SITE,
  VIRUSGUARD_SITE,
  ABOUT_SITE,
];

/** Exact path first, then `/*` for a single extra segment. Null for unknown hosts or paths. */
export function resolve(
  url: string,
  sites: readonly SiteDefinition[] = SITES,
): ResolvedPage | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  const site = sites.find((s) => s.host === parsed.host);
  if (!site) return null;
  const segments = parsed.path.split('/').filter(Boolean);
  const key = site.pages[parsed.path]
    ? parsed.path
    : segments.length === 1 && site.pages['/*']
      ? '/*'
      : null;
  const page = key === null ? undefined : site.pages[key];
  if (key === null || !page) return null;
  return { site, page, key, ...parsed };
}

/** The resolved page's title in `locale` (the site's title if the page has none). */
export function pageTitle(resolved: ResolvedPage, locale: Locale): string {
  const meta = resolved.site.meta(locale);
  return meta.pages[resolved.key]?.title ?? meta.title;
}
