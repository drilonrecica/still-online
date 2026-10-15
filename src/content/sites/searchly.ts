// searchly.example: the search engine's own pages (home, results) and its toolbar joke.
import type { SiteMeta } from './types';

export const SEARCHLY_HOST = 'searchly.example';

export const SITE_META: SiteMeta = {
  title: 'Searchly',
  description:
    'Searchly: the fastest way to find anything on the World Wide Web. Search every page, or feel lucky.',
  keywords: ['search', 'find', 'web', 'engine', 'lucky', 'toolbar'],
  pages: {
    '/': { title: 'Searchly - Find it Fast!', keywords: ['home', 'searchly'] },
    '/search': { title: 'Searchly Search Results', keywords: ['results'] },
  },
};

export const SEARCHLY_TEXT = {
  /** `{every}` is the bold word. */
  tagline: 'Search {every} page on the whole World Wide Web!',
  taglineEvery: 'every',
  toolbarLink: 'Searchly Toolbar — download now!',
  tryLabel: 'Try:',
  /** Example searches on the home page; each finds something in this language. */
  examples: ['fan', 'gossip', 'tips'],
  footer: '© 2007 Searchly Inc. · Make Searchly your homepage!',
  setupTitle: 'Searchly Toolbar Setup',
  setupProgress: 'Installing Searchly Toolbar… 3%',
  setupNote: 'Please do not close this window.',
  noResults: "Oh no! Searchly couldn't find any pages matching {query}.",
  noResultsTips: [
    'Check your spelling (even spacebar mishaps count).',
    'Try different words, or fewer of them.',
    'Try more general words, like "fan" or "tips".',
  ],
};
