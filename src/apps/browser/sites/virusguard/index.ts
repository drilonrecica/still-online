// virusguard.example: the scareware parody the "subscription has expired!" balloon opens (P1-04).
import { lazy } from 'react';
import { getSiteText } from '@/content/locale';
import { getGender } from '@/i18n/settingsText';
import type { SiteDefinition } from '@/content/sites/types';
import { VIRUSGUARD_HOST } from '@/content/sites/virusguard';

export const VIRUSGUARD_SITE: SiteDefinition = {
  host: VIRUSGUARD_HOST,
  meta: (locale) => getSiteText(VIRUSGUARD_HOST, locale, getGender()).SITE_META,
  pages: {
    '/': { component: lazy(() => import('./Home')) },
  },
};
