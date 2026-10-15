// tinfoilcomets.example: the lovingly awful 2003 fan page (hamsters, guestbook, webring, MIDI).
import { lazy } from 'react';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import type { SiteDefinition } from '@/content/sites/types';

export const TINFOIL_SITE: SiteDefinition = {
  host: TINFOIL_HOST,
  title: 'The OFFICIAL UNOFFICIAL Tinfoil Comets Fan Page!!!1',
  description:
    'The #1 Tinfoil Comets fan page by xX_CometGirl_Xx: band news, tour dates, concert pics and a guestbook. Sign it!!!',
  keywords: ['tinfoil', 'comets', 'band', 'fan', 'music', 'concert', 'ziggy'],
  pages: {
    '/': {
      title: 'Tinfoil Comets Fan Page - HOME',
      keywords: ['hamsters', 'news', 'webring', 'midi'],
      component: lazy(() => import('./Home')),
    },
    '/band': {
      title: 'Tinfoil Comets Fan Page - The Band',
      keywords: ['members', 'albums', 'tour', 'dates', 'robot'],
      component: lazy(() => import('./Band')),
    },
    '/guestbook': {
      title: 'Tinfoil Comets Fan Page - Guestbook',
      keywords: ['guestbook', 'sign'],
      component: lazy(() => import('./Guestbook')),
    },
    '/pics': {
      title: 'Tinfoil Comets Fan Page - Pics',
      keywords: ['pics', 'photos', 'gallery'],
      component: lazy(() => import('./Pics')),
    },
  },
};
