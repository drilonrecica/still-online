// glittercodez.example: "GlitterCodez", a 2007 free-layouts site (gallery, glitter, stickers, cursors).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import type { SiteDefinition } from '@/content/sites/types';
import { getGender } from '@/i18n/settingsText';

export const GLITTERCODEZ_SITE: SiteDefinition = {
  host: GLITTERCODEZ_HOST,
  meta: (locale) =>
    getSiteText(GLITTERCODEZ_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/glitter': { component: lazy(() => import('./Glitter')) },
    '/stickers': { component: lazy(() => import('./Stickers')) },
    '/cursors': { component: lazy(() => import('./Cursors')) },
  },
};
