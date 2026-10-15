// spaceport.example: the social-network homage. A page per friend profile (so Searchly finds
// them), the player's editable `/me`, and a `/*` catch-all for profiles lost in orbit.
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { PROFILES } from '@/content/profiles';
import { SPACEPORT_HOST } from '@/content/sites/spaceport';
import type { SitePage, SiteDefinition } from '@/content/sites/types';
import { interpolate } from '@/i18n/t';
import { profileName } from './logic';

const profile = lazy(() => import('./Profile'));
const friendPaths = PROFILES.map((p) => `/${p.contactId}`);

export const SPACEPORT_SITE: SiteDefinition = {
  host: SPACEPORT_HOST,
  meta: (locale) => {
    const { SITE_META, PROFILE_PAGE } = getSiteText(SPACEPORT_HOST, locale);
    const friendPages = Object.fromEntries(
      PROFILES.map((p) => [
        `/${p.contactId}`,
        {
          title: interpolate(PROFILE_PAGE.title, {
            name: profileName(p.contactId),
          }),
          keywords: [p.contactId, ...PROFILE_PAGE.keywords],
        },
      ]),
    );
    return { ...SITE_META, pages: { ...SITE_META.pages, ...friendPages } };
  },
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/me': { component: lazy(() => import('./Me')) },
    ...Object.fromEntries(
      friendPaths.map((path): [string, SitePage] => [
        path,
        { component: profile },
      ]),
    ),
    '/*': { component: profile },
  },
};
