// westfield-high.example: the school's official site (a template bought in 2001, never updated).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import type { SiteDefinition } from '@/content/sites/types';
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';

export const WESTFIELD_SITE: SiteDefinition = {
  host: WESTFIELD_HOST,
  meta: (locale) => getSiteText(WESTFIELD_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/news': { component: lazy(() => import('./News')) },
    '/staff': { component: lazy(() => import('./Staff')) },
    '/cafeteria': { component: lazy(() => import('./Cafeteria')) },
  },
};
