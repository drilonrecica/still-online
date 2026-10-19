// German friendspace.example, same exports as `src/content/sites/friendspace`: „ein Ort für Freunde im
// Orbit", says „du“. Theme ids and colours come from English; only their names are German.
import { g } from '../../gender';
import type { PlayerProfile } from '../../friendspace/profiles/types';
import {
  THEME_PRESETS as EN_THEME_PRESETS,
  type ThemePreset,
} from '../../sites/friendspace';
import type { SiteMeta } from '../../sites/types';

export const FRIENDSPACE_HOST = 'friendspace.example';

export const SITE_META: SiteMeta = {
  title: 'Friendspace: ein Ort für Freunde im Orbit',
  description:
    'Friendspace ist der Ort für Freunde: Profile, Top 8, Kommentare, Stimmungen und ein Song auf deiner Seite. Melde dich kostenlos an!',
  keywords: [
    'friendspace',
    'freunde',
    'profil',
    'profile',
    'community',
    'top 8',
    'kommentare',
    'musik',
  ],
  pages: {
    '/': {
      title: 'Friendspace - ein Ort für Freunde im Orbit',
      keywords: ['anmelden', 'einloggen', 'coole neue leute'],
    },
    '/me': {
      title: 'Friendspace - Mein Profil',
      keywords: ['mein profil', 'bearbeiten', 'ich'],
    },
    '/bulletins': {
      title: 'Friendspace - Bulletins',
      keywords: ['bulletins', 'neuigkeiten', 'freunde'],
    },
    '/*': { title: 'Friendspace - Verloren im All' },
  },
};

export const PROFILE_PAGE = {
  title: '{name} auf Friendspace',
  keywords: ['profil', 'top 8', 'kommentare'],
};

export const BAND_PAGE = {
  title: '{name} auf Friendspace Music',
  keywords: ['band', 'musik', 'songs', 'auftritte'],
};

export const FRIENDSPACE_TEXT = {
  logo: 'Friendspace',
  tagline: 'ein Ort für Freunde im Orbit',
  welcome:
    'Auf Friendspace triffst du deine Freunde, zeigst allen deine Musik und der ganzen Galaxis, wie cool du bist. Kostenlos anmelden!!',
  signUp: 'Anmelden!',
  logIn: 'Einloggen',
  coolNewPeople: 'Coole neue Leute',
  news: [
    'NEU: pack einen Song auf dein Profil!! jeder Besucher kann ihn hören',
    'Wähl deine Top 8 mit Bedacht. deine Freunde MERKEN das',
    'Friendspace hat jetzt über 4.000.000 Mitglieder im Orbit!',
  ],
  footer:
    'Über uns · FAQ · AGB · Datenschutz · ©2007 Friendspace. Alle Rechte im Orbit vorbehalten.',
  notFoundTitle: 'Verloren im All!',
  notFoundText:
    'Dieses Profil ist ins All abgedriftet. Prüf die Adresse, oder flieg zurück zur Startrampe.',
  emptyWall: `Noch keine Kommentare. ${g('Sei die Erste!!', 'Sei der Erste!!')} (sobald die Kommentare aus dem All zurück sind)`,
  myEmptyWall:
    'Noch keine Kommentare. Deine Freunde finden dich bestimmt bald!',
};

const PRESET_NAMES: Readonly<Record<string, string>> = {
  default: 'Friendspace Klassik',
  glitter: 'Pink Glitzer',
  midnight: 'Mitternacht',
  pastel: 'Pastelltraum',
  neon: 'Neon-Rave',
  'outer-space': 'Weltall',
};

export const THEME_PRESETS: readonly ThemePreset[] = EN_THEME_PRESETS.map(
  (p) => ({ ...p, label: PRESET_NAMES[p.id] ?? p.label }),
);

export const MOOD_EMOTICONS: readonly { code: string; label: string }[] = [
  { code: ':)', label: 'fröhlich' },
  { code: ':D', label: 'aufgedreht' },
  { code: ';)', label: 'frech' },
  { code: ':P', label: 'albern' },
  { code: ':(', label: 'traurig' },
  { code: ':O', label: 'geschockt' },
  { code: '(Y)', label: 'super' },
  { code: '(N)', label: 'bäh' },
  { code: '(L)', label: 'verliebt' },
  { code: '(8)', label: 'rockig' },
];

export const PROFILE_LIMITS = {
  headline: 60,
  mood: 24,
  aboutMe: 1000,
} as const;

export const DEFAULT_PLAYER_PROFILE: Omit<PlayerProfile, 'top8'> = {
  headline: g(
    'neu auf Friendspace!! ~*glitzer*~ <3',
    'neu auf Friendspace. skaten bis zum umfallen',
  ),
  mood: { text: g('kicherig', 'voll motiviert'), emoticon: g(':D', '(8)') },
  aboutMe: g(
    'Hi!! <3 Ich bin neu auf Friendspace. Klick auf „Profil bearbeiten“ und erzähl der Galaxis von dir.',
    'Hey. Ich bin neu auf Friendspace. Klick auf „Profil bearbeiten“ und erzähl der Galaxis von dir.',
  ),
  songTrackId: null,
  themePreset: g('glitter', 'midnight'),
  customColors: null,
};
