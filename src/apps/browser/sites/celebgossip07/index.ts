// celebgossip07.example: "Celeb Gossip 07 ★ OMG!!", a gossip blog about invented celebrities.
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import type { SiteDefinition } from '@/content/sites/types';

export const GOSSIP_SITE: SiteDefinition = {
  host: GOSSIP_HOST,
  meta: (locale) => getSiteText(GOSSIP_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/post': { component: lazy(() => import('./Post')) },
    '/tag': { component: lazy(() => import('./Tag')) },
    '/celebs': { component: lazy(() => import('./Celebs')) },
  },
};
