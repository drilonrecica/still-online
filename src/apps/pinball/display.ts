// The dot-matrix score display above the table: what it says (pure) and how it's drawn.
import { getLocale, translate } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import { GLYPH_H, GLYPH_W, displayText, formatScore, textDots } from './font';
import { BALLS, RANKS, type Game } from './sim';

/** The logical view: the display on top, the table below it. */
export const VIEW_W = 460;
export const VIEW_H = 620;
export const DMD = { x: 12, y: 4, w: 436, h: 54 };
export const TABLE_X = 10;
export const TABLE_Y = 62;
const COLS = 128;
const ROWS = 16;

/** Characters that fit on one line (6 dot columns each, the last one without a gap). */
export const DISPLAY_CHARS = Math.floor((COLS + 1) / (GLYPH_W + 1));
/** Marquee speed in dot columns per second, and the blank run between two passes. */
const SCROLL_SPEED = 24;
const SCROLL_GAP = 12;

/** A rank's name in `locale`. */
export function rankName(rank: number, locale: Locale = getLocale()): string {
  return translate(locale, `pinball.rank.${RANKS[rank] ?? RANKS[0]}`);
}

/** The display text of the message over the score. */
export function messageText(
  m: NonNullable<Game['message']>,
  locale: Locale = getLocale(),
): string {
  switch (m.id) {
    case 'ball':
      return translate(locale, 'pinball.display.ball', { n: m.n });
    case 'warning':
      return translate(locale, 'pinball.display.warning', { n: m.n });
    case 'multiplier':
      return translate(locale, 'pinball.display.multiplier', { n: m.n });
    case 'rankUp':
      return translate(locale, 'pinball.display.rankUp', {
        rank: rankName(m.n, locale),
      });
    default:
      return translate(locale, `pinball.display.${m.id}`);
  }
}

/** The line under the score while playing: ball, rank and multiplier. */
export function statusLine(
  ball: number,
  rank: number,
  multiplier: number,
  locale: Locale = getLocale(),
): string {
  const parts = [
    translate(locale, 'pinball.display.ball', { n: Math.min(ball, BALLS) }),
    rankName(rank, locale),
    ...(multiplier > 1 ? [`${multiplier}X`] : []),
  ];
  // Two spaces between the parts read best; one if that would overflow the line.
  const wide = parts.join('  ');
  return displayText(wide).length <= DISPLAY_CHARS ? wide : parts.join(' ');
}

/** The display's two lines in `locale`, as drawn (uppercase, ß spelled SS). */
export function displayLines(
  g: Game,
  attract: boolean,
  locale: Locale = getLocale(),
): [string, string] {
  const [a, b] = rawLines(g, attract, locale);
  return [displayText(a), displayText(b)];
}

function rawLines(g: Game, attract: boolean, locale: Locale): [string, string] {
  if (attract)
    return [
      translate(locale, 'pinball.display.title'),
      g.score > 0
        ? translate(locale, 'pinball.display.last', {
            score: formatScore(g.score, locale),
          })
        : translate(locale, 'pinball.display.pressPlay'),
    ];
  const score = formatScore(g.score, locale);
  if (g.message) return [messageText(g.message, locale), score];
  if (g.over) return [translate(locale, 'pinball.display.over'), score];
  return [score, statusLine(g.ballNo, g.rank, g.multiplier, locale)];
}

/**
 * Left dot columns for a line `width` dots wide: centred when it fits, otherwise a marquee
 * scrolling left (two copies, `SCROLL_GAP` apart). At `clock` 0 (reduced motion freezes the
 * clock) the line's start is shown.
 */
export function lineOffsets(width: number, clock: number): number[] {
  if (width <= COLS) return [Math.floor((COLS - width) / 2)];
  const period = width + SCROLL_GAP;
  const x = 0 - Math.floor((clock * SCROLL_SPEED) % period);
  return [x, x + period];
}

/** Draws the display: a dark panel of dots with the two lines lit in amber. */
export function drawDisplay(
  c: CanvasRenderingContext2D,
  lines: [string, string],
  clock = 0,
) {
  const pitch = DMD.w / COLS;
  c.fillStyle = '#120804';
  c.beginPath();
  c.roundRect(DMD.x - 4, DMD.y - 2, DMD.w + 8, DMD.h + 4, 6);
  c.fill();
  c.strokeStyle = '#5a3a20';
  c.lineWidth = 2;
  c.stroke();

  const lit = new Set<number>();
  lines.forEach((text, i) => {
    const { dots, width } = textDots(text);
    const oy = i === 0 ? 0 : GLYPH_H + 2;
    for (const ox of lineOffsets(width, clock))
      for (const [x, y] of dots)
        if (ox + x >= 0 && ox + x < COLS) lit.add((oy + y) * COLS + ox + x);
  });
  const r = pitch * 0.38;
  for (const on of [false, true]) {
    c.fillStyle = on ? '#ff9a2e' : '#3b1d0b';
    if (on) {
      c.shadowColor = '#ff7a10';
      c.shadowBlur = 4;
    }
    c.beginPath();
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++) {
        if (lit.has(row * COLS + col) !== on) continue;
        const x = DMD.x + (col + 0.5) * pitch;
        const y = DMD.y + 3 + ((row + 0.5) * (DMD.h - 6)) / ROWS;
        c.moveTo(x + r, y);
        c.arc(x, y, r, 0, Math.PI * 2);
      }
    c.fill();
    c.shadowBlur = 0;
  }
}
