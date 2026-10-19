// German searchly.example, same exports as `src/content/sites/searchly`. A company, so „Sie“.
import { g } from '../../gender';
import type { HotSite } from '../../sites/searchly';
import type { SiteMeta } from '../../sites/types';

export const SEARCHLY_HOST = 'searchly.example';

export const SITE_META: SiteMeta = {
  title: 'Searchly',
  description:
    'Searchly: der schnellste Weg, alles im World Wide Web zu finden. Durchsuchen Sie jede Seite, oder versuchen Sie Ihr Glück.',
  keywords: [
    'suche',
    'suchen',
    'finden',
    'web',
    'suchmaschine',
    'glück',
    'toolbar',
  ],
  pages: {
    '/': {
      title: 'Searchly - Schneller finden!',
      keywords: ['startseite', 'searchly'],
    },
    '/search': {
      title: 'Searchly Suchergebnisse',
      keywords: ['ergebnisse', 'treffer'],
    },
  },
};

export const SEARCHLY_TEXT = {
  tagline: 'Durchsuchen Sie {every} Seite im ganzen World Wide Web!',
  taglineEvery: 'jede',
  toolbarLink: 'Searchly Toolbar — jetzt herunterladen!',
  tryLabel: 'Probieren Sie:',
  examples: ['fan', 'klatsch', 'tipps'],
  footer: '© 2007 Searchly Inc. · Machen Sie Searchly zu Ihrer Startseite!',
  setupTitle: 'Searchly Toolbar Setup',
  setupProgress: 'Searchly Toolbar wird installiert… 3%',
  setupNote: 'Bitte schließen Sie dieses Fenster nicht.',
  noResults:
    'Oh nein! Searchly hat keine Seiten gefunden, die {query} enthalten.',
  hotSitesIntro: g(
    'Für Sie ausgewählt: Klatsch, Glitzer und die angesagtesten Bands!',
    'Für Sie ausgewählt: Spiele, Skaten und lustige Clips!',
  ),
  noResultsTips: [
    'Überprüfen Sie die Schreibweise (auch verrutschte Leertasten zählen).',
    'Versuchen Sie andere Wörter, oder weniger davon.',
    'Versuchen Sie allgemeinere Wörter, zum Beispiel „fan“ oder „tipps“.',
  ],
};

export const SEARCHLY_HOT_SITES: readonly HotSite[] = [
  {
    url: 'http://celebgossip07.example/',
    title: 'Celeb Gossip 07',
    note: 'Wer trug es besser? Der heißeste Klatsch, täglich neu.',
    side: 'girl',
  },
  {
    url: 'http://tinfoilcomets.example/',
    title: 'Tinfoil Comets Fanseite',
    note: 'Die Band, von der alle reden. Tragen Sie sich ins Gästebuch ein!',
    side: 'girl',
  },
  {
    url: 'http://cheatcave.example/',
    title: 'CheatCave',
    note: 'Cheats, Codes und die Top 10 der lustigsten Clips. Täglich neu!',
    side: 'boy',
  },
  {
    url: 'http://kickflipkings.example/',
    title: 'Kickflip Kings',
    note: 'Skatetricks vom Ollie bis zum Kickflip, die Crew und eine Shoutbox.',
    side: 'boy',
  },
  {
    url: 'http://friendspace.example/',
    title: 'Friendspace',
    note: g(
      'Lassen Sie Ihr Profil glitzern und wählen Sie Ihre Top 8!',
      'Peppen Sie Ihr Profil auf und wählen Sie Ihre Top 8!',
    ),
    side: 'both',
  },
];
