// about.example: Web Explorer's built-in welcome site. It proves the site framework.
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { ABOUT_HOST } from '@/content/sites/about';
import type { SiteDefinition } from '@/content/sites/types';

export const ABOUT_SITE: SiteDefinition = {
  host: ABOUT_HOST,
  meta: (locale) => getSiteText(ABOUT_HOST, locale).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/tips': { component: lazy(() => import('./Tips')) },
  },
};
