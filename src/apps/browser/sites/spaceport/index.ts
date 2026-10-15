// spaceport.example: the social-network homage. A page per friend profile (so Searchly finds
// them), the player's editable `/me`, and a `/*` catch-all for profiles lost in orbit.
import { lazy } from 'react';
import { PROFILES } from '@/content/profiles';
import { SPACEPORT_HOST } from '@/content/sites/spaceport';
import type { SitePage, SiteDefinition } from '@/content/sites/types';
import { profileName } from './logic';

const profile = lazy(() => import('./Profile'));

const friendPages: Record<string, SitePage> = Object.fromEntries(
  PROFILES.map((p) => [
    `/${p.contactId}`,
    {
      title: `${profileName(p.contactId)} on Spaceport`,
      keywords: [p.contactId, 'profile', 'top 8', 'comments'],
      component: profile,
    },
  ]),
);

export const SPACEPORT_SITE: SiteDefinition = {
  host: SPACEPORT_HOST,
  title: 'Spaceport: a place for friends in orbit',
  description:
    'Spaceport is the place for friends: profiles, Top 8, comments, moods and a song on your page. Join for free!',
  keywords: [
    'spaceport',
    'friends',
    'profile',
    'social',
    'top 8',
    'comments',
    'music',
  ],
  pages: {
    '/': {
      title: 'Spaceport - a place for friends in orbit',
      keywords: ['sign up', 'log in', 'cool new people'],
      component: lazy(() => import('./Home')),
    },
    '/me': {
      title: 'Spaceport - My Profile',
      keywords: ['my profile', 'edit', 'me'],
      component: lazy(() => import('./Me')),
    },
    ...friendPages,
    '/*': {
      title: 'Spaceport - Lost in orbit',
      component: profile,
    },
  },
};
