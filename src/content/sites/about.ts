// about.example: Web Explorer's built-in welcome site (getting started, surfing tips, cool sites).
import type { SiteMeta } from './types';

export const ABOUT_HOST = 'about.example';

export const SITE_META: SiteMeta = {
  title: 'Welcome to Web Explorer',
  description:
    'Your first stop on the World Wide Web: getting started, surfing tips and cool sites to visit.',
  keywords: ['welcome', 'web explorer', 'help', 'getting started', 'tips'],
  pages: {
    '/': { title: 'Welcome to Web Explorer', keywords: ['welcome', 'start'] },
    '/tips': {
      title: 'Web Explorer Surfing Tips',
      keywords: ['tips', 'favorites', 'back', 'surfing'],
    },
  },
};

export const ABOUT_TEXT = {
  banner: 'Web Explorer',
  bannerTagline: 'Your window on the World Wide Web',
  ticker:
    '*** NEW! Add your favorite pages to the Favorites menu *** Tip: a 56K modem loads most pages in under a minute! ***',
  coolSitesTitle: 'Cool Sites',
  footer: 'Best viewed at 800x600 · This page is stored on your computer',
  welcomeTitle: 'Welcome to Web Explorer!',
  welcome: [
    'Congratulations, you are on the Internet! Type an address in the Address bar and press Enter, or pick one of the cool sites on the left.',
    'Lost? The Back button takes you to the page you were just on, and Home brings you back to your homepage.',
  ],
  tipsLink: 'Surfing Tips »',
  tipsTitle: 'Surfing Tips',
  tips: [
    {
      label: 'Favorites:',
      text: 'found a page you love? Open the Favorites menu and click Add to Favorites so you can find it again.',
    },
    {
      label: 'Refresh:',
      text: 'if a page looks stuck, click Refresh to load it again. Stop gives up on a page that takes too long.',
    },
    {
      label: 'Stay safe:',
      text: 'never tell strangers your real name, address or school. Ask a grown-up before you sign up for anything.',
    },
  ],
  backLink: '« Back to the welcome page',
};

/** The sidebar of cool sites: what each site calls itself, and its address. */
export const COOL_SITES: readonly { label: string; url: string }[] = [
  { label: 'Searchly', url: 'http://searchly.example/' },
  { label: 'Tinfoil Comets', url: 'http://tinfoilcomets.example/' },
  { label: 'Spaceport', url: 'http://spaceport.example/' },
  { label: 'Westfield High', url: 'http://westfield-high.example/' },
  { label: 'Celeb Gossip 07', url: 'http://celebgossip07.example/' },
];
