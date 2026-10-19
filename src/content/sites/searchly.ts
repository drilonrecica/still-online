// searchly.example: the search engine's own pages (home, results) and its toolbar joke.
import type { Gender } from '@/os/types';
import { g } from '../gender';
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
  hotSitesIntro: g(
    'Hand-picked for you: gossip, glitter and the hottest bands!',
    'Hand-picked for you: games, skating and funny clips!',
  ),
  noResultsTips: [
    'Check your spelling (even spacebar mishaps count).',
    'Try different words, or fewer of them.',
    'Try more general words, like "fan" or "tips".',
  ],
};

export interface HotSite {
  url: string;
  title: string;
  note: string;
  /** Whose side of 2007 it is: the box lists the player's side first (`hotSitesFor`). */
  side: Gender | 'both';
}

/** The home page's "hot sites this week" box; every site is listed for both genders. */
export const SEARCHLY_HOT_SITES: readonly HotSite[] = [
  {
    url: 'http://celebgossip07.example/',
    title: 'Celeb Gossip 07',
    note: 'Who wore it best? The hottest gossip, updated daily.',
    side: 'girl',
  },
  {
    url: 'http://tinfoilcomets.example/',
    title: 'Tinfoil Comets Fan Page',
    note: 'The band everyone is talking about. Sign the guestbook!',
    side: 'girl',
  },
  {
    url: 'http://cheatcave.example/',
    title: 'CheatCave',
    note: 'Cheats, codes and the top 10 funny clips. Updated daily!',
    side: 'boy',
  },
  {
    url: 'http://kickflipkings.example/',
    title: 'Kickflip Kings',
    note: 'Skate tricks from ollie to kickflip, plus a brand-new skate video.',
    side: 'boy',
  },
  {
    url: 'http://friendspace.example/',
    title: 'Friendspace',
    note: g(
      'Glitter up your profile and pick your Top 8!',
      'Pimp your profile and pick your Top 8!',
    ),
    side: 'both',
  },
];
