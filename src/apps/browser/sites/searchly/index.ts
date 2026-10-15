// searchly.example: the search engine for every fictional page (see ./search.ts).
import { lazy } from 'react';
import type { SiteDefinition } from '@/content/sites/types';

export const SEARCHLY_SITE: SiteDefinition = {
  host: 'searchly.example',
  title: 'Searchly',
  description:
    'Searchly: the fastest way to find anything on the World Wide Web. Search every page, or feel lucky.',
  keywords: ['search', 'find', 'web', 'engine', 'lucky', 'toolbar'],
  pages: {
    '/': {
      title: 'Searchly - Find it Fast!',
      keywords: ['home', 'searchly'],
      component: lazy(() => import('./Home')),
    },
    '/search': {
      title: 'Searchly Search Results',
      keywords: ['results'],
      component: lazy(() => import('./Results')),
    },
  },
};
