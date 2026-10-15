// The fictional web: every registered site, and URL → page resolution.
// See docs/architecture-v0.2.md → "Web (P4)". Later tasks append their sites to SITES.
import type {
  ResolvedPage,
  SiteDefinition,
  SitePage,
} from '@/content/sites/types';
import { parseUrl } from '../url';
import { ABOUT_SITE } from './about';
import { GOSSIP_SITE } from './celebgossip07';
import { SEARCHLY_SITE } from './searchly';
import { SPACEPORT_SITE } from './spaceport';
import { TINFOIL_SITE } from './tinfoilcomets';
import { VIRUSGUARD_SITE } from './virusguard';
import { WESTFIELD_SITE } from './westfieldhigh';

export const SITES: readonly SiteDefinition[] = [
  SEARCHLY_SITE,
  TINFOIL_SITE,
  SPACEPORT_SITE,
  WESTFIELD_SITE,
  GOSSIP_SITE,
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
  const page: SitePage | undefined =
    site.pages[parsed.path] ??
    (segments.length === 1 ? site.pages['/*'] : undefined);
  if (!page) return null;
  return { site, page, ...parsed };
}
