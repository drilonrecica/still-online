// cheatcave.example: "CheatCave", a 2007 games portal (cheats, flash-game news, clips, forum).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import type { SiteDefinition } from '@/content/sites/types';

export const CHEATCAVE_SITE: SiteDefinition = {
  host: CHEATCAVE_HOST,
  meta: (locale) => getSiteText(CHEATCAVE_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/cheats': { component: lazy(() => import('./Cheats')) },
    '/clips': { component: lazy(() => import('./Clips')) },
    '/forum': { component: lazy(() => import('./Forum')) },
  },
};
