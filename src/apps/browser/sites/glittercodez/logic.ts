// GlitterCodez gallery data: every published code is `layoutCodeFor(extras, name)`, so it always
// parses back (P1-03). The single-tag pages (`/glitter`, `/stickers`, `/cursors`) build their entries
// from the fixed layout sets.
import {
  CURSOR_IDS,
  STICKER_IDS,
  type LayoutExtras,
} from '@/content/friendspace/layoutSets';
import type { ProfileTheme } from '@/content/friendspace/profiles/types';
import {
  GLITTER_IDS,
  type GLITTERCODEZ_TEXT,
  type GlitterId,
  type LayoutDef,
} from '@/content/sites/glittercodez';
import type { Gender } from '@/os/types';
import { layoutCodeFor } from '../friendspace/layoutCode';

export interface CodeEntry {
  id: string;
  name: string;
  blurb?: string;
  extras: LayoutExtras;
}

type Text = typeof GLITTERCODEZ_TEXT;

/** The dark purple base every gallery preview sits on (the layout's own extras go on top). */
export const PREVIEW_THEME: ProfileTheme = {
  background: '#2a0a4a',
  text: '#ffffff',
  accent: '#ff3399',
  glitter: false,
  font: 'Verdana, Tahoma, sans-serif',
  panel: 'transparent',
};

const GLITTER_ACCENT: Record<GlitterId, string | undefined> = {
  pink: '#ff66cc',
  gold: '#ffcc00',
  cyan: '#66e0ff',
  lime: '#99ff33',
  off: undefined,
};

export const layoutEntries = (layouts: readonly LayoutDef[]): CodeEntry[] =>
  layouts.map(({ id, name, blurb, extras }) => ({ id, name, blurb, extras }));

export function glitterEntries(text: Text): CodeEntry[] {
  return GLITTER_IDS.map((id) => {
    const accent = GLITTER_ACCENT[id];
    return {
      id,
      name: text.glitterNames[id],
      extras: {
        glitter: accent !== undefined,
        ...(accent && { accent }),
        stickers: [],
      },
    };
  });
}

export const stickerEntries = (text: Text): CodeEntry[] =>
  STICKER_IDS.map((id) => ({
    id,
    name: text.stickerNames[id],
    extras: { stickers: [{ id, pos: 'top-right' }] },
  }));

export const cursorEntries = (text: Text): CodeEntry[] =>
  CURSOR_IDS.map((id) => ({
    id,
    name: text.cursorNames[id],
    extras: { cursor: id, stickers: [] },
  }));

export const codeFor = (entry: CodeEntry): string =>
  layoutCodeFor(entry.extras, entry.name);

/** The player's side first ("hot 4 u!!"), then the rest; nothing is hidden. */
export function splitBySide(
  layouts: readonly LayoutDef[],
  gender: Gender | null,
): { hot: LayoutDef[]; more: LayoutDef[] } {
  const side = gender ?? 'girl';
  return {
    hot: layouts.filter((l) => l.side === side),
    more: layouts.filter((l) => l.side !== side),
  };
}
