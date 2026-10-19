// kickflipkings.example: "Kickflip Kings", a 2007 skate crew site (news + shoutbox, crew, trick
// tips, Dex's skate video, local shows).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import type { SiteDefinition } from '@/content/sites/types';

export const KICKFLIP_SITE: SiteDefinition = {
  host: KICKFLIP_HOST,
  meta: (locale) => getSiteText(KICKFLIP_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/crew': { component: lazy(() => import('./Crew')) },
    '/tricks': { component: lazy(() => import('./Tricks')) },
    '/video': { component: lazy(() => import('./Video')) },
    '/gigs': { component: lazy(() => import('./Gigs')) },
  },
};
