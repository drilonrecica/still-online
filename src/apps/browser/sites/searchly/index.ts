// searchly.example: the search engine for every fictional page (see ./search.ts).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { SEARCHLY_HOST } from '@/content/sites/searchly';
import type { SiteDefinition } from '@/content/sites/types';

export const SEARCHLY_SITE: SiteDefinition = {
  host: SEARCHLY_HOST,
  meta: (locale) => getSiteText(SEARCHLY_HOST, locale).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/search': { component: lazy(() => import('./Results')) },
  },
};
