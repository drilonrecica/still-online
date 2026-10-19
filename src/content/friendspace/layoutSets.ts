// The fixed, original sets a layout code may pick from (P0-02 ids; P1-03 draws them and owns the
// parser in src/apps/browser/sites/friendspace/layoutCode.ts). Nothing outside these sets, plus
// `#rgb`/`#rrggbb` colours, ever reaches a style. See docs/architecture-v0.4.md → "Layout codes".

/** CSS backgrounds (gradients and repeating patterns). */
export const BACKGROUND_IDS = [
  'starry',
  'leopard',
  'pastel',
  'emo-stripes',
  'rainbow',
  'grunge',
  'matrix',
  'hearts',
  'checker',
  'clouds',
  'flames',
  'camo',
] as const;
export type BackgroundId = (typeof BACKGROUND_IDS)[number];

/** CSS font stacks; no font files. */
export const FONT_IDS = [
  'comic',
  'tahoma',
  'verdana',
  'courier',
  'impact',
  'georgia',
] as const;
export type FontId = (typeof FONT_IDS)[number];

/** Hand-written SVGs in `src/assets/stickers/`. */
export const STICKER_IDS = [
  'star',
  'heart',
  'skull',
  'pony',
  'music',
  'smiley',
  'flame',
  'skateboard',
  'controller',
] as const;
export type StickerId = (typeof STICKER_IDS)[number];

export const STICKER_POSITIONS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;
export type StickerPos = (typeof STICKER_POSITIONS)[number];

/** Pointer trails inside the profile area (off under reduced motion). */
export const CURSOR_IDS = ['sparkle', 'hearts', 'stars', 'flames'] as const;
export type CursorId = (typeof CURSOR_IDS)[number];

export const MAX_STICKERS = 4;

/** What a parsed layout code switches on, over the profile's preset theme. */
export interface LayoutExtras {
  background?: BackgroundId;
  /** `#rgb` or `#rrggbb`. */
  text?: string;
  accent?: string;
  /** A colour, or `'none'` for transparent content boxes. */
  panel?: string;
  font?: FontId;
  glitter?: boolean;
  cursor?: CursorId;
  /** At most `MAX_STICKERS`. */
  stickers: readonly { id: StickerId; pos: StickerPos }[];
}
