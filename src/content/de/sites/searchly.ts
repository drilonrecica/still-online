// German searchly.example, same exports as `src/content/sites/searchly`. A company, so „Sie“.
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
  noResultsTips: [
    'Überprüfen Sie die Schreibweise (auch verrutschte Leertasten zählen).',
    'Versuchen Sie andere Wörter, oder weniger davon.',
    'Versuchen Sie allgemeinere Wörter, zum Beispiel „fan“ oder „tipps“.',
  ],
};
