// The dot-matrix score display above the table: what it says (pure) and how it's drawn.
import { GLYPH_H, formatScore, textDots } from './font';
import { BALLS, RANKS, type Game } from './sim';

/** The logical view: the display on top, the table below it. */
export const VIEW_W = 460;
export const VIEW_H = 620;
export const DMD = { x: 12, y: 4, w: 436, h: 54 };
export const TABLE_X = 10;
export const TABLE_Y = 62;
const COLS = 128;
const ROWS = 16;

/** The display's two lines of text. */
export function displayLines(g: Game, attract: boolean): [string, string] {
  if (attract)
    return [
      'STAR PINBALL',
      g.score > 0 ? `LAST ${formatScore(g.score)}` : 'PRESS PLAY',
    ];
  const score = formatScore(g.score);
  if (g.message) return [g.message.text, score];
  if (g.over) return ['GAME OVER', score];
  const mult = g.multiplier > 1 ? `  ${g.multiplier}X` : '';
  return [
    score,
    `BALL ${Math.min(g.ballNo, BALLS)}  ${RANKS[g.rank]!.toUpperCase()}${mult}`,
  ];
}

/** Draws the display: a dark panel of dots with the two lines lit in amber. */
export function drawDisplay(
  c: CanvasRenderingContext2D,
  lines: [string, string],
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
    const { dots, width } = textDots(text.slice(0, 21));
    const ox = Math.floor((COLS - width) / 2);
    const oy = i === 0 ? 0 : GLYPH_H + 2;
    for (const [x, y] of dots) lit.add((oy + y) * COLS + ox + x);
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
