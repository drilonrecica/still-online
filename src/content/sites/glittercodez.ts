// glittercodez.example: "GlitterCodez – free layouts 4 ur profile!!" (P1-04). Each layout's code is
// generated from its `extras` by `layoutCodeFor` (P1-03), so every published code parses back.
// Sample data for now: P3-04 writes the twelve real layouts.
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
        { id: 'skateboard', pos: 'top-left' },
        { id: 'skull', pos: 'bottom-right' },
      ],
    },
  },
];
