// Layout codes (P1-03): a made-up markup the player pastes from glittercodez.example. Never CSS or
// HTML. `parseLayoutCode` is total: whatever comes in, the result only holds ids from the fixed
// sets in layoutSets.ts and `#rgb`/`#rrggbb` colours. See docs/architecture-v0.4.md → "Layout codes".
//
//   <!-- anything in comments is ignored -->
//   [layout bg=starry text=#fff accent=#fc0 panel=none font=comic glitter=on]
//   [cursor sparkle]
//   [sticker star top-right]        (repeatable, max 4)
import {
  BACKGROUND_IDS,
  CURSOR_IDS,
  FONT_IDS,
  MAX_STICKERS,
  STICKER_IDS,
  STICKER_POSITIONS,
  type LayoutExtras,
  type StickerId,
  type StickerPos,
} from '@/content/friendspace/layoutSets';

/** Longer input is cut before parsing (the same cap as `web.myProfile.layoutCode`). */
export const LAYOUT_CODE_MAX = 2000;

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/;

const oneOf =
  <T extends string>(set: readonly T[]) =>
  (v: string | undefined): v is T =>
    v !== undefined && (set as readonly string[]).includes(v);

const isBackground = oneOf(BACKGROUND_IDS);
const isFont = oneOf(FONT_IDS);
const isCursor = oneOf(CURSOR_IDS);
const isSticker = oneOf(STICKER_IDS);
const isPos = oneOf(STICKER_POSITIONS);

/** A lowercase `#rgb`/`#rrggbb` colour, or undefined. */
export function layoutColor(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.toLowerCase();
  return COLOR.test(c) ? c : undefined;
}

type Mutable = { -readonly [K in keyof LayoutExtras]: LayoutExtras[K] };

function applyLayoutKey(out: Mutable, key: string, value: string) {
  switch (key) {
    case 'bg':
      if (isBackground(value)) out.background = value;
      return;
    case 'text':
    case 'accent': {
      const c = layoutColor(value);
      if (c) out[key] = c;
      return;
    }
    case 'panel': {
      const c = value === 'none' ? 'none' : layoutColor(value);
      if (c) out.panel = c;
      return;
    }
    case 'font':
      if (isFont(value)) out.font = value;
      return;
    case 'glitter':
      if (value === 'on' || value === 'off') out.glitter = value === 'on';
      return;
  }
}

/** Reads a layout code. Never throws; unknown tags, keys and values are ignored, the last valid value wins. */
export function parseLayoutCode(text: unknown): LayoutExtras {
  const out: Mutable = { stickers: [] };
  if (typeof text !== 'string') return out;
  const stickers: { id: StickerId; pos: StickerPos }[] = [];
  // An unclosed comment swallows the rest, like a browser would.
  const code = text
    .slice(0, LAYOUT_CODE_MAX)
    .replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
    .toLowerCase();
  for (const match of code.matchAll(/\[([^[\]]*)\]/g)) {
    const [tag, ...args] = (match[1] ?? '').trim().split(/\s+/);
    if (tag === 'layout') {
      for (const arg of args) {
        const eq = arg.indexOf('=');
        if (eq > 0) applyLayoutKey(out, arg.slice(0, eq), arg.slice(eq + 1));
      }
    } else if (tag === 'cursor') {
      if (isCursor(args[0])) out.cursor = args[0];
    } else if (tag === 'sticker') {
      const [id, pos] = args;
      if (isSticker(id) && isPos(pos) && stickers.length < MAX_STICKERS)
        stickers.push({ id, pos });
    }
  }
  out.stickers = stickers;
  return out;
}

/** The canonical code for `extras`; `parseLayoutCode(layoutCodeFor(x))` deep-equals a valid `x`. */
export function layoutCodeFor(extras: LayoutExtras, name?: string): string {
  // `--` would end the header comment early.
  const title = name
    ?.replace(/-{2,}/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .trim();
  const lines = [
    title
      ? `<!-- GlitterCodez.example layout: ${title} -->`
      : '<!-- GlitterCodez.example layout -->',
  ];
  const text = layoutColor(extras.text);
  const accent = layoutColor(extras.accent);
  const panel = extras.panel === 'none' ? 'none' : layoutColor(extras.panel);
  const keys = [
    isBackground(extras.background) && `bg=${extras.background}`,
    text && `text=${text}`,
    accent && `accent=${accent}`,
    panel && `panel=${panel}`,
    isFont(extras.font) && `font=${extras.font}`,
    extras.glitter !== undefined && `glitter=${extras.glitter ? 'on' : 'off'}`,
  ].filter((k): k is string => typeof k === 'string');
  if (keys.length > 0) lines.push(`[layout ${keys.join(' ')}]`);
  if (isCursor(extras.cursor)) lines.push(`[cursor ${extras.cursor}]`);
  for (const s of extras.stickers
    .filter((s) => isSticker(s.id) && isPos(s.pos))
    .slice(0, MAX_STICKERS))
    lines.push(`[sticker ${s.id} ${s.pos}]`);
  return lines.join('\n');
}
