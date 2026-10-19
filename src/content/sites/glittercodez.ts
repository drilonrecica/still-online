// glittercodez.example: "GlitterCodez – free layouts 4 ur profile!!" (P1-04). Each layout's code is
// generated from its `extras` by `layoutCodeFor` (P1-03), so every published code parses back.
// The twelve layouts (six per side) are the real ones (P3-04).
import type { Gender } from '@/os/types';
import type {
  CursorId,
  LayoutExtras,
  StickerId,
} from '../friendspace/layoutSets';
import type { SiteMeta } from './types';

export const GLITTERCODEZ_HOST = 'glittercodez.example';

export const SITE_META: SiteMeta = {
  title: 'GlitterCodez – free layouts 4 ur profile!!',
  description:
    'FREE profile layouts, glitter, stickers and cursors 4 ur Friendspace!! Just copy the code and paste it. 1.337.420 layouts copied!!',
  keywords: [
    'layouts',
    'glitter',
    'codes',
    'profile',
    'friendspace',
    'stickers',
    'cursors',
    'backgrounds',
    'free',
  ],
  pages: {
    '/': {
      title: 'GlitterCodez – free layouts 4 ur profile!!',
      keywords: ['gallery', 'copy', 'paste', 'themes'],
    },
    '/glitter': {
      title: 'GlitterCodez – Glitter Codez',
      keywords: ['glitter', 'sparkle', 'shiny', 'headline'],
    },
    '/stickers': {
      title: 'GlitterCodez – Sticker Codez',
      keywords: ['stickers', 'graphics', 'pics', 'decorations'],
    },
    '/cursors': {
      title: 'GlitterCodez – Cursor Codez',
      keywords: ['cursors', 'mouse', 'trail', 'pointer'],
    },
  },
};

/** Ids of the glitter-page codes (colours live in the page); names are text. */
export const GLITTER_IDS = ['pink', 'gold', 'cyan', 'lime', 'off'] as const;
export type GlitterId = (typeof GLITTER_IDS)[number];

export const GLITTERCODEZ_TEXT = {
  logo: 'GlitterCodez',
  tagline: 'free layouts 4 ur profile!!',
  newBadge: 'NEW!!',
  counterLabel: 'layouts copied!!',
  counter: '1.337.420',
  nav: {
    label: 'GlitterCodez',
    layouts: 'LAYOUTZ',
    glitter: 'GLITTER',
    stickers: 'STICKERZ',
    cursors: 'CURSORZ',
  },
  howTo:
    'how 2: hit "Copy code!!" then paste it in ur Friendspace "Layout code" box. thats it!!',
  hotHeading: 'hot 4 u!!',
  moreHeading: 'more layouts',
  copy: 'Copy code!!',
  copied: 'Copied!! now paste it in ur profile',
  selected: 'press Ctrl+C!!',
  codeLabel: 'Code for {name}',
  previewLabel: 'Preview of {name}',
  glitterHeading: 'Glitter Codez',
  glitterIntro: 'make ur headline SPARKLE ~*~ pick a color!!',
  stickersHeading: 'Sticker Codez',
  stickersIntro: 'slap a sticker on ur page!! (max 4 per profile)',
  cursorsHeading: 'Cursor Codez',
  cursorsIntro: 'a sparkly trail 4 ur mouse!! only works on ur profile tho',
  glitterNames: {
    pink: 'Pink Glitter',
    gold: 'Gold Glitter',
    cyan: 'Ice Glitter',
    lime: 'Toxic Glitter',
    off: 'No Glitter (plain)',
  } satisfies Record<GlitterId, string>,
  stickerNames: {
    star: 'Star',
    heart: 'Heart',
    skull: 'Skull',
    pony: 'Pony',
    music: 'Music Note',
    smiley: 'Smiley',
    flame: 'Flame',
    skateboard: 'Skateboard',
    controller: 'Controller',
  } satisfies Record<StickerId, string>,
  cursorNames: {
    sparkle: 'Sparkle Trail',
    hearts: 'Heart Trail',
    stars: 'Star Trail',
    flames: 'Flame Trail',
  } satisfies Record<CursorId, string>,
  linkBackHeading: 'link back 2 us plz!!',
  linkBack: 'like GlitterCodez? put our button on ur page ~*~',
  linkBackButton: 'GlitterCodez',
  footer:
    '© 2007 GlitterCodez · best viewed in 1024x768 · all codez FREE 4ever',
};

export interface LayoutDef {
  id: string;
  name: string;
  /** A 2007 blurb under the preview ("omg my fave!!! ~*~"). */
  blurb: string;
  /** Girly or boyish; the gallery features the player's side first. Both are always listed. */
  side: Gender;
  extras: LayoutExtras;
}

export const LAYOUTS: readonly LayoutDef[] = [
  {
    id: 'emo-black-pink',
    name: 'Emo Black/Pink',
    blurb: 'black n pink 4 ppl who feel EVERYTHING ~*~ xoxo',
    side: 'girl',
    extras: {
      background: 'emo-stripes',
      text: '#ffffff',
      accent: '#ff3399',
      panel: '#111111',
      font: 'tahoma',
      glitter: false,
      cursor: 'hearts',
      stickers: [
        { id: 'skull', pos: 'bottom-left' },
        { id: 'heart', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'pony-pastel',
    name: 'Pony Pastel',
    blurb: 'omg my fave!!! so cute i cant even ~*~ neigh!!',
    side: 'girl',
    extras: {
      background: 'pastel',
      text: '#5a2a6e',
      accent: '#d63384',
      panel: '#fff0fa',
      font: 'comic',
      glitter: true,
      cursor: 'sparkle',
      stickers: [
        { id: 'pony', pos: 'bottom-left' },
        { id: 'star', pos: 'top-right' },
        { id: 'heart', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'leopard-luxe',
    name: 'Leopard Luxe',
    blurb: 'fancy like a rockstars girlfriend. ur welcome ~*~',
    side: 'girl',
    extras: {
      background: 'leopard',
      text: '#ffffff',
      accent: '#ffd700',
      panel: '#2b1608',
      font: 'georgia',
      glitter: true,
      cursor: 'stars',
      stickers: [
        { id: 'heart', pos: 'top-right' },
        { id: 'star', pos: 'bottom-left' },
      ],
    },
  },
  {
    id: 'rainbow-glitter',
    name: 'Rainbow Glitter',
    blurb: 'ALL the colors!!! 10/10 would sparkle again ~*~*~',
    side: 'girl',
    extras: {
      background: 'rainbow',
      text: '#222222',
      accent: '#ff00aa',
      panel: '#ffffff',
      font: 'comic',
      glitter: true,
      cursor: 'sparkle',
      stickers: [
        { id: 'smiley', pos: 'bottom-left' },
        { id: 'star', pos: 'top-right' },
        { id: 'music', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'hearts-4-ever',
    name: 'Hearts 4 Ever',
    blurb: 'luv luv luv!!! 4 ur BFF n ur crush <3 <3 <3',
    side: 'girl',
    extras: {
      background: 'hearts',
      text: '#7a0033',
      accent: '#c2185b',
      panel: '#fff5fa',
      font: 'verdana',
      glitter: true,
      cursor: 'hearts',
      stickers: [
        { id: 'heart', pos: 'bottom-left' },
        { id: 'heart', pos: 'top-right' },
        { id: 'heart', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    blurb: 'sparkly stars 4 dreamers ~*~ copy it!!',
    side: 'girl',
    extras: {
      background: 'starry',
      text: '#ffffff',
      accent: '#ffcc00',
      font: 'comic',
      glitter: true,
      cursor: 'sparkle',
      stickers: [
        { id: 'star', pos: 'top-right' },
        { id: 'heart', pos: 'bottom-left' },
      ],
    },
  },
  {
    id: 'skater-grunge',
    name: 'Skater Grunge',
    blurb: 'dirty grip tape look. no glitter. ever. 4 real skaters',
    side: 'boy',
    extras: {
      background: 'grunge',
      text: '#e0e0d0',
      accent: '#ff6600',
      panel: '#222222',
      font: 'impact',
      glitter: false,
      stickers: [
        { id: 'skateboard', pos: 'bottom-left' },
        { id: 'skull', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'gamer-green',
    name: 'Gamer Green',
    blurb: 'matrix style. PWNAGE. ur profile has +50 skill',
    side: 'boy',
    extras: {
      background: 'matrix',
      text: '#33ff66',
      accent: '#00ff44',
      panel: '#031403',
      font: 'courier',
      glitter: false,
      cursor: 'stars',
      stickers: [
        { id: 'controller', pos: 'top-right' },
        { id: 'skull', pos: 'bottom-left' },
      ],
    },
  },
  {
    id: 'checkerboard-punk',
    name: 'Checkerboard Punk',
    blurb: 'sick layout bro. black n white n LOUD',
    side: 'boy',
    extras: {
      background: 'checker',
      text: '#ffffff',
      accent: '#ff2222',
      panel: '#111111',
      font: 'impact',
      glitter: false,
      stickers: [
        { id: 'skull', pos: 'bottom-left' },
        { id: 'skateboard', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'flames',
    name: 'Flames',
    blurb: 'HOT HOT HOT. ur profile is literally on fire lol',
    side: 'boy',
    extras: {
      background: 'flames',
      text: '#ffffee',
      accent: '#ffcc00',
      panel: '#1a0000',
      font: 'impact',
      glitter: false,
      cursor: 'flames',
      stickers: [
        { id: 'flame', pos: 'bottom-left' },
        { id: 'flame', pos: 'top-right' },
        { id: 'skull', pos: 'bottom-right' },
      ],
    },
  },
  {
    id: 'camo',
    name: 'Camo',
    blurb: 'stealth mode. ninja profile. u cant even see me',
    side: 'boy',
    extras: {
      background: 'camo',
      text: '#f0f0d0',
      accent: '#c8ff3c',
      panel: '#2b2e17',
      font: 'tahoma',
      glitter: false,
      stickers: [
        { id: 'skull', pos: 'top-right' },
        { id: 'controller', pos: 'bottom-left' },
      ],
    },
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    blurb: 'dark n moody n kinda epic. sick layout bro. 4 real tho',
    side: 'boy',
    extras: {
      background: 'starry',
      text: '#e8dcff',
      accent: '#b266ff',
      panel: '#1a0840',
      font: 'tahoma',
      glitter: false,
      cursor: 'stars',
      stickers: [
        { id: 'music', pos: 'top-right' },
        { id: 'controller', pos: 'bottom-left' },
      ],
    },
  },
];
