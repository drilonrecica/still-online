// celebgossip07.example: "Celeb Gossip 07 ★ OMG!!", a gossip blog about invented celebrities.
import { lazy } from 'react';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import type { SiteDefinition } from '@/content/sites/types';

export const GOSSIP_SITE: SiteDefinition = {
  host: GOSSIP_HOST,
  title: 'Celeb Gossip 07 ★ OMG!!',
  description:
    'The hottest celeb gossip, updated like 2x a day!!! Starla Vance, 4Ever Boulevard, Bianca Goldcrest, Rex Hammerton, Tinfoil Comets and MORE. Vote HOT or NOT!!!',
  keywords: [
    'celeb',
    'celebrity',
    'gossip',
    'blog',
    'rumors',
    'hot or not',
    'starla',
    'tinfoil comets',
  ],
  pages: {
    '/': {
      title: 'Celeb Gossip 07 ★ OMG!!',
      keywords: ['latest', 'posts', 'poll'],
      component: lazy(() => import('./Home')),
    },
    '/post': {
      title: 'Celeb Gossip 07 - Post + Comments',
      keywords: ['post', 'comments'],
      component: lazy(() => import('./Post')),
    },
    '/tag': {
      title: 'Celeb Gossip 07 - Tags',
      keywords: ['tags', 'tag cloud'],
      component: lazy(() => import('./Tag')),
    },
    '/celebs': {
      title: "Celeb Gossip 07 - Who's Who",
      keywords: ['celebs', 'stars', 'who', 'famous'],
      component: lazy(() => import('./Celebs')),
    },
  },
};
