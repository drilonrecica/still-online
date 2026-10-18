// tinfoilcomets.example: the lovingly awful 2003 fan page (hamsters, guestbook, webring, MIDI).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import type { SiteDefinition } from '@/content/sites/types';

export const TINFOIL_SITE: SiteDefinition = {
  host: TINFOIL_HOST,
  meta: (locale) => getSiteText(TINFOIL_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
    '/band': { component: lazy(() => import('./Band')) },
    '/guestbook': { component: lazy(() => import('./Guestbook')) },
    '/pics': { component: lazy(() => import('./Pics')) },
  },
};
