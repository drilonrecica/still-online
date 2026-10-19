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
    '/me': {
      title: 'pixlog - Meine Seite',
      keywords: ['meine seite', 'kudos', 'besucher', 'album', 'skin'],
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
  kudos: {
    count: '★ {n} Kudos',
    give: 'Kudos geben ★',
    given: 'Heute schon Kudos gegeben!',
  },
  me: {
    pictureLabel: 'Dein Bild',
    kudosReceived: 'Erhaltene Kudos: {n}',
    skinHeading: 'Mein Skin',
    albumHeading: 'Mein Album',
    albumEmpty:
      'Dein Album ist leer. Füg ein paar Fotos aus „Eigene Bilder“ hinzu!',
    addPhotos: 'Fotos hinzufügen',
    editAlbum: 'Album bearbeiten',
    done: 'Fertig',
    close: 'Schließen',
    pickerHeading: 'Eigene Bilder',
    pickerEmpty:
      'Keine neuen Bilder in „Eigene Bilder“. Mach welche in der Fotobox oder mal eins in Paint!',
    addPhoto: '{name} hinzufügen',
    albumFull: 'Dein Album ist voll (höchstens {n} Fotos).',
    captionFor: 'Bildunterschrift für Foto {n}',
    removePhoto: 'Foto {n} entfernen',
    remove: 'Entfernen',
    photoLabel: 'Foto {n}',
    surveysHeading: 'Meine Umfragen',
    surveysEmpty: 'Du hast noch keine Umfrage auf dein Profil gestellt.',
    fillIn: 'Umfrage ausfüllen',
    pickSurvey: 'Umfrage auswählen',
    post: 'Auf mein Profil stellen',
    cancel: 'Abbrechen',
    edit: '„{title}“ bearbeiten',
  },
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
