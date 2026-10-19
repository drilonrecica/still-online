import { describe, expect, it } from 'vitest';
import {
  BACKGROUND_IDS,
  CURSOR_IDS,
  FONT_IDS,
  STICKER_IDS,
  STICKER_POSITIONS,
  type LayoutExtras,
} from '@/content/friendspace/layoutSets';
import { LAYOUTS } from '@/content/sites/glittercodez';
import { mulberry32 } from '@/os/random';
import { LAYOUT_CODE_MAX, layoutCodeFor, parseLayoutCode } from './layoutCode';

const EMPTY: LayoutExtras = { stickers: [] };

describe('parseLayoutCode', () => {
  it('reads a full code', () => {
    const code = `<!-- GlitterCodez.example layout: Starry Night -->
[layout bg=starry text=#fff accent=#fc0 panel=none font=comic glitter=on]
[cursor sparkle]
[sticker star top-right] [sticker heart bottom-left]`;
    expect(parseLayoutCode(code)).toEqual({
      background: 'starry',
      text: '#fff',
      accent: '#fc0',
      panel: 'none',
      font: 'comic',
      glitter: true,
      cursor: 'sparkle',
      stickers: [
        { id: 'star', pos: 'top-right' },
        { id: 'heart', pos: 'bottom-left' },
      ],
    });
  });

  it('is case-insensitive and lowercases colours', () => {
    expect(
      parseLayoutCode(
        '[LAYOUT BG=Leopard TEXT=#FFAA00 Glitter=OFF][Cursor HEARTS]',
      ),
    ).toEqual({
      background: 'leopard',
      text: '#ffaa00',
      glitter: false,
      cursor: 'hearts',
      stickers: [],
    });
  });

  it('ignores unknown tags, keys and values', () => {
    expect(
      parseLayoutCode(
        '[style color:red][layout bg=lava color=#fff text=red accent=#12 panel=#ggg font=papyrus glitter=yes onload=x]' +
          '[cursor rainbow][sticker unicorn top-left][sticker star middle][sticker star]',
      ),
    ).toEqual(EMPTY);
  });

  it('lets the last valid value win and keeps at most 4 stickers', () => {
    const code =
      '[layout bg=starry font=comic][layout bg=camo font=nope][cursor stars][cursor flames]' +
      '[sticker star top-left][sticker heart top-right][sticker skull bottom-left]' +
      '[sticker pony bottom-right][sticker music top-left]';
    const x = parseLayoutCode(code);
    expect(x.background).toBe('camo');
    expect(x.font).toBe('comic');
    expect(x.cursor).toBe('flames');
    expect(x.stickers.map((s) => s.id)).toEqual([
      'star',
      'heart',
      'skull',
      'pony',
    ]);
  });

  it('ignores comments, including an unclosed one', () => {
    expect(
      parseLayoutCode('<!-- [cursor sparkle] -->[layout bg=hearts]'),
    ).toEqual({
      background: 'hearts',
      stickers: [],
    });
    expect(parseLayoutCode('[layout bg=hearts]<!-- [cursor sparkle]')).toEqual({
      background: 'hearts',
      stickers: [],
    });
  });

  it('survives partial codes', () => {
    expect(parseLayoutCode('[layout bg=starry')).toEqual(EMPTY);
    expect(parseLayoutCode('[layout bg=]')).toEqual(EMPTY);
    expect(parseLayoutCode('[layout =starry]')).toEqual(EMPTY);
    expect(parseLayoutCode('[]')).toEqual(EMPTY);
    expect(parseLayoutCode('[[[layout bg=matrix]]]')).toEqual({
      background: 'matrix',
      stickers: [],
    });
  });

  it('treats non-strings and junk as empty', () => {
    for (const junk of [
      undefined,
      null,
      42,
      {},
      [],
      '',
      '   ',
      '<b>hi</b>',
      '{}',
      '\u0000￿',
    ]) {
      expect(parseLayoutCode(junk)).toEqual(EMPTY);
    }
  });

  it('never throws on random junk', () => {
    const rand = mulberry32(7);
    const alphabet = '[]<>!-= #abcdefglayoutcursorsticker0123456789\n\t"\'';
    for (let n = 0; n < 500; n++) {
      const len = Math.floor(rand() * 300);
      let s = '';
      for (let i = 0; i < len; i++)
        s += alphabet[Math.floor(rand() * alphabet.length)];
      const x = parseLayoutCode(s);
      expect(x.stickers.length).toBeLessThanOrEqual(4);
    }
  });

  it('caps input at 2000 characters, even 10k-character input', () => {
    const filler = 'x'.repeat(LAYOUT_CODE_MAX - 5);
    expect(parseLayoutCode(`${filler}[cursor sparkle]`).cursor).toBeUndefined();
    const huge = '[layout bg=clouds]' + '[sticker star top-left]'.repeat(500);
    expect(huge.length).toBeGreaterThan(10_000);
    const x = parseLayoutCode(huge);
    expect(x.background).toBe('clouds');
    expect(x.stickers).toHaveLength(4);
    expect(parseLayoutCode('['.repeat(10_000))).toEqual(EMPTY);
  });
});

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]!;
}

function randomExtras(rand: () => number): LayoutExtras {
  const hex = () =>
    '#' +
    Array.from({ length: rand() < 0.5 ? 3 : 6 }, () =>
      pick(rand, [...'0123456789abcdef']),
    ).join('');
  const x: { -readonly [K in keyof LayoutExtras]: LayoutExtras[K] } = {
    stickers: Array.from({ length: Math.floor(rand() * 5) }, () => ({
      id: pick(rand, STICKER_IDS),
      pos: pick(rand, STICKER_POSITIONS),
    })),
  };
  if (rand() < 0.7) x.background = pick(rand, BACKGROUND_IDS);
  if (rand() < 0.7) x.text = hex();
  if (rand() < 0.7) x.accent = hex();
  if (rand() < 0.7) x.panel = rand() < 0.3 ? 'none' : hex();
  if (rand() < 0.7) x.font = pick(rand, FONT_IDS);
  if (rand() < 0.7) x.glitter = rand() < 0.5;
  if (rand() < 0.7) x.cursor = pick(rand, CURSOR_IDS);
  return x;
}

describe('layoutCodeFor', () => {
  it('writes the header and canonical tags', () => {
    expect(
      layoutCodeFor(
        {
          background: 'starry',
          text: '#fff',
          glitter: true,
          cursor: 'sparkle',
          stickers: [{ id: 'star', pos: 'top-right' }],
        },
        'Starry Night',
      ),
    ).toBe(
      '<!-- GlitterCodez.example layout: Starry Night -->\n' +
        '[layout bg=starry text=#fff glitter=on]\n[cursor sparkle]\n[sticker star top-right]',
    );
  });

  it('round-trips random extras', () => {
    const rand = mulberry32(2007);
    for (let n = 0; n < 300; n++) {
      const x = randomExtras(rand);
      expect(parseLayoutCode(layoutCodeFor(x, `Layout #${n}`))).toEqual(x);
    }
  });

  it('round-trips every GlitterCodez layout', () => {
    for (const l of LAYOUTS)
      expect(parseLayoutCode(layoutCodeFor(l.extras, l.name))).toEqual(
        l.extras,
      );
  });

  it('keeps a hostile name inside the header comment', () => {
    const code = layoutCodeFor(EMPTY, 'x --> [cursor flames] <!--');
    expect(parseLayoutCode(code)).toEqual(EMPTY);
  });
});
