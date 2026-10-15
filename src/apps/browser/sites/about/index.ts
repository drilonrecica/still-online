// about.example: Web Explorer's built-in welcome site. It proves the site framework.
import { lazy } from 'react';
import type { SiteDefinition } from '@/content/sites/types';

export const ABOUT_SITE: SiteDefinition = {
  host: 'about.example',
  title: 'Welcome to Web Explorer',
  description:
    'Your first stop on the World Wide Web: getting started, surfing tips and cool sites to visit.',
  keywords: ['welcome', 'web explorer', 'help', 'getting started', 'tips'],
  pages: {
    '/': {
      title: 'Welcome to Web Explorer',
      keywords: ['welcome', 'start'],
      component: lazy(() => import('./Home')),
    },
    '/tips': {
      title: 'Web Explorer Surfing Tips',
      keywords: ['tips', 'favorites', 'back', 'surfing'],
      component: lazy(() => import('./Tips')),
    },
  },
};
