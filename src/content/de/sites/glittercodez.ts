// German glittercodez.example, same exports and ids as `src/content/sites/glittercodez`. The site
// talks like a 2007 teen layout site: klein, „ur“ → „dein“, viele „!!“. P4 replaces the sample
// layouts with the real twelve in German.
import {
  GLITTERCODEZ_HOST as EN_HOST,
  LAYOUTS as EN_LAYOUTS,
  type GlitterId,
  type LayoutDef,
} from '../../sites/glittercodez';
import type { CursorId, StickerId } from '../../friendspace/layoutSets';
import type { SiteMeta } from '../../sites/types';

export { GLITTER_IDS } from '../../sites/glittercodez';

export const GLITTERCODEZ_HOST = EN_HOST;

export const SITE_META: SiteMeta = {
  title: 'GlitterCodez – gratis Layouts für dein Profil!!',
  description:
    'GRATIS Profil-Layouts, Glitzer, Sticker und Cursor für dein Friendspace!! Code kopieren, einfügen, fertig. 1.337.420 Layouts kopiert!!',
  keywords: [
    'layouts',
    'glitzer',
    'codes',
    'profil',
    'friendspace',
    'sticker',
    'cursor',
    'hintergründe',
    'gratis',
  ],
  pages: {
    '/': {
      title: 'GlitterCodez – gratis Layouts für dein Profil!!',
      keywords: ['galerie', 'kopieren', 'einfügen', 'designs'],
    },
    '/glitter': {
      title: 'GlitterCodez – Glitzer-Codes',
      keywords: ['glitzer', 'funkeln', 'glänzend', 'überschrift'],
    },
    '/stickers': {
      title: 'GlitterCodez – Sticker-Codes',
      keywords: ['sticker', 'aufkleber', 'grafiken', 'bilder'],
    },
    '/cursors': {
      title: 'GlitterCodez – Cursor-Codes',
      keywords: ['cursor', 'maus', 'spur', 'mauszeiger'],
    },
  },
};

export const GLITTERCODEZ_TEXT = {
  logo: 'GlitterCodez',
  tagline: 'gratis Layouts für dein Profil!!',
  newBadge: 'NEU!!',
  counterLabel: 'Layouts kopiert!!',
  counter: '1.337.420',
  nav: {
    label: 'GlitterCodez',
    layouts: 'LAYOUTS',
    glitter: 'GLITZER',
    stickers: 'STICKER',
    cursors: 'CURSOR',
  },
  howTo:
    'so gehts: auf „Code kopieren!!“ klicken und in dein Friendspace-Feld „Layout-Code“ einfügen. fertig!!',
  hotHeading: 'heiß für dich!!',
  moreHeading: 'mehr Layouts',
  copy: 'Code kopieren!!',
  copied: 'Kopiert!! jetzt in dein Profil einfügen',
  selected: 'drück Strg+C!!',
  codeLabel: 'Code für {name}',
  previewLabel: 'Vorschau von {name}',
  glitterHeading: 'Glitzer-Codes',
  glitterIntro: 'lass deine Überschrift FUNKELN ~*~ such dir eine Farbe aus!!',
  stickersHeading: 'Sticker-Codes',
  stickersIntro: 'klatsch einen Sticker auf deine Seite!! (max. 4 pro Profil)',
  cursorsHeading: 'Cursor-Codes',
  cursorsIntro:
    'eine glitzernde Spur für deine Maus!! klappt aber nur auf deinem Profil',
  glitterNames: {
    pink: 'Pinker Glitzer',
    gold: 'Goldglitzer',
    cyan: 'Eisglitzer',
    lime: 'Giftglitzer',
    off: 'Kein Glitzer (schlicht)',
  } satisfies Record<GlitterId, string>,
  stickerNames: {
    star: 'Stern',
    heart: 'Herz',
    skull: 'Totenkopf',
    pony: 'Pony',
    music: 'Note',
    smiley: 'Smiley',
    flame: 'Flamme',
    skateboard: 'Skateboard',
    controller: 'Controller',
  } satisfies Record<StickerId, string>,
  cursorNames: {
    sparkle: 'Funkelspur',
    hearts: 'Herzspur',
    stars: 'Sternenspur',
    flames: 'Flammenspur',
  } satisfies Record<CursorId, string>,
  linkBackHeading: 'verlink uns bitte!!',
  linkBack: 'gefällt dir GlitterCodez? pack unseren Button auf deine Seite ~*~',
  linkBackButton: 'GlitterCodez',
  footer:
    '© 2007 GlitterCodez · optimiert für 1024x768 · alle Codes GRATIS für immer',
};

export const LAYOUTS: readonly LayoutDef[] = structuredClone(EN_LAYOUTS);
