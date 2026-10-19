// pixlog.example: the photo-sharing homage. A page per friend (so Searchly finds them), the album
// page, and a `/*` catch-all for addresses with nothing behind them.
import { lazy } from 'react';
import { getPixlogProfiles, getSiteText } from '@/content/locale';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import type { SiteDefinition, SitePage } from '@/content/sites/types';
import { getGender } from '@/i18n/settingsText';
import { interpolate } from '@/i18n/t';
import { profileName } from '../friendspace/logic';

const friend = lazy(() => import('./Friend'));

export const PIXLOG_SITE: SiteDefinition = {
  host: PIXLOG_HOST,
  meta: (locale) => {
    const gender = getGender();
    const { SITE_META, PROFILE_PAGE } = getSiteText(
      PIXLOG_HOST,
      locale,
      gender,
    );
    const friendPages = Object.fromEntries(
      getPixlogProfiles(locale, gender).map((p) => [
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
    '/album': { component: lazy(() => import('./Album')) },
    ...Object.fromEntries(
      getPixlogProfiles('en', null).map((p): [string, SitePage] => [
        `/${p.contactId}`,
        { component: friend },
      ]),
    ),
    '/*': { component: friend },
  },
};
