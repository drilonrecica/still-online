// German pixlog.example, same exports and ids as `src/content/sites/pixlog`.
import { PIXLOG_HOST as EN_HOST } from '../../sites/pixlog';
import type { PixlogSkinId } from '../../pixlog/types';
import type { SiteMeta } from '../../sites/types';

export const PIXLOG_HOST = EN_HOST;

export const SITE_META: SiteMeta = {
  title: 'pixlog: zeig deine Bilder',
  description:
    'pixlog ist der Ort für deine Fotos: Alben, Kommentare, Blogs und Umfragen. Zeig deinen Freunden, was du am Wochenende gemacht hast!',
  keywords: [
    'pixlog',
    'fotos',
    'bilder',
    'alben',
    'freunde',
    'blog',
    'umfragen',
    'gästebuch',
  ],
  pages: {
    '/': {
      title: 'pixlog - zeig deine Bilder',
      keywords: ['einloggen', 'anmelden', 'shouts'],
    },
    '/album': {
      title: 'pixlog - Fotoalbum',
      keywords: ['album', 'fotos', 'kommentare', 'bilder'],
    },
    '/*': { title: 'pixlog - Seite nicht gefunden' },
  },
};

export const PROFILE_PAGE = {
  title: '{name} auf pixlog',
  keywords: ['profil', 'fotos', 'alben', 'blog', 'umfragen', 'gästebuch'],
};

export const PIXLOG_TEXT = {
  logo: 'pixlog',
  tagline: 'zeig deine Bilder',
  nav: { label: 'pixlog', home: 'Start', login: 'einloggen' },
  splashHeading: 'Deine Bilder. Deine Freunde. Dein pixlog.',
  splashText:
    'Lade deine Fotos hoch, kommentiere die Alben deiner Freunde und finde heraus, was alle am Wochenende gemacht haben. Kostenlos!',
  loginButton: 'einloggen',
  loginHint: 'Dein pixlog wartet auf dich.',
  feedHeading: 'Was deine Freunde machen',
  tabsLabel: 'Seiten dieses pixlogs',
  tabs: {
    profile: 'Profil',
    photos: 'Fotos',
    blog: 'Blog',
    surveys: 'Umfragen',
    guestbook: 'Gästebuch',
  },
  pictureLabel: 'Bild von {name}',
  skinLabel: 'Skin: {skin}',
  aboutHeading: 'Über mich',
  latestAlbumsHeading: 'Neueste Alben',
  noAlbums: 'Noch keine Alben.',
  photosOne: '1 Foto',
  photosMany: '{n} Fotos',
  albumsHeading: 'Fotoalben',
  blogHeading: 'Blog',
  noBlog: 'Noch keine Blogeinträge.',
  surveysHeading: 'Umfragen',
  surveyBy: '{name} hat „{title}“ ausgefüllt',
  noSurveys: 'Noch keine Umfragen.',
  guestbookHeading: 'Gästebuch',
  noGuestbook: 'Noch hat niemand ins Gästebuch geschrieben.',
  guestbookFrom: '{name} schrieb {when}:',
  postedWhen: 'geschrieben {when}',
  albumBack: 'Zurück zu den Fotos von {name}',
  albumBy: 'Album von {name}',
  photoOf: 'Foto {n} von {total}',
  prev: '« Zurück',
  next: 'Weiter »',
  commentsHeading: 'Kommentare',
  noComments: 'Noch keine Kommentare.',
  commentFrom: '{name} schrieb {when}:',
  notFoundTitle: 'Seite nicht gefunden',
  notFoundText: 'Unter dieser Adresse gibt es auf pixlog nichts.',
  backHome: 'Zurück zu pixlog',
  skins: {
    orange: 'Orange',
    ocean: 'Ozean',
    bubblegum: 'Kaugummi',
    lime: 'Limette',
    night: 'Nacht',
    sunset: 'Sonnenuntergang',
  } satisfies Record<PixlogSkinId, string>,
  footer: '© 2007 pixlog · zeig deine Bilder',
};
