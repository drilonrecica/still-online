import { describe, expect, it } from 'vitest';
import { translate } from '@/i18n/t';
import { LOCALES, type Locale } from '@/i18n/types';
import {
  DISPLAY_CHARS,
  displayLines,
  lineOffsets,
  messageText,
  statusLine,
} from './display';
import { GLYPH_W, displayText, missingGlyphs, textDots } from './font';
import { BALLS, RANKS, createGame, type MessageId } from './sim';

const MESSAGES: MessageId[] = [
  'ball',
  'tilt',
  'warning',
  'saved',
  'lost',
  'over',
  'rankUp',
  'admiralBonus',
  'multiplier',
  'ramp',
];
/** The biggest score a display line has to hold. */
const BIG_SCORE = 9_999_999_999;

/** Every line the display can show in `locale`, as drawn. */
function allLines(locale: Locale): string[] {
  const lines: string[] = [];
  const g = createGame(1, { attract: true });
  lines.push(...displayLines(g, true, locale));
  g.score = BIG_SCORE;
  lines.push(...displayLines(g, true, locale));
  for (const id of MESSAGES)
    for (let n = 0; n <= 4; n++)
      lines.push(displayText(messageText({ id, n, ttl: 1 }, locale)));
  for (let ball = 1; ball <= BALLS; ball++)
    for (let rank = 0; rank < RANKS.length; rank++)
      for (const mult of [1, 2])
        lines.push(displayText(statusLine(ball, rank, mult, locale)));
  const over = createGame(1);
  over.message = null;
  over.over = true;
  over.score = BIG_SCORE;
  lines.push(...displayLines(over, false, locale));
  return lines;
}

describe('dot-matrix font', () => {
  it('has umlaut glyphs with their dots on the top row', () => {
    for (const ch of ['Ä', 'Ö', 'Ü']) {
      const { dots, width } = textDots(ch);
      expect(width).toBe(GLYPH_W);
      const top = dots.filter(([, row]) => row === 0).map(([col]) => col);
      expect(top).toEqual([1, 3]);
    }
    expect(textDots('ä').dots).toEqual(textDots('Ä').dots);
    // Ä is not A: the umlaut changes the letter.
    expect(textDots('Ä').dots).not.toEqual(textDots('A').dots);
  });

  it('spells ß as SS', () => {
    expect(displayText('Straße')).toBe('STRASSE');
    expect(textDots('ß')).toEqual(textDots('SS'));
    expect(missingGlyphs('ß')).toEqual([]);
  });

  it.each(LOCALES)(
    'has a glyph for every character the display shows (%s)',
    (locale) => {
      const missing = new Set(allLines(locale).flatMap(missingGlyphs));
      expect([...missing]).toEqual([]);
    },
  );
});

describe('display text', () => {
  it.each(LOCALES)('fits every line in 21 characters (%s)', (locale) => {
    expect(DISPLAY_CHARS).toBe(21);
    const long = allLines(locale).filter((l) => l.length > DISPLAY_CHARS);
    expect(long).toEqual([]);
  });

  it('shows the German texts', () => {
    const g = createGame(1, { attract: true });
    expect(displayLines(g, true, 'de')).toEqual([
      'STERNEN-FLIPPER',
      'START DRÜCKEN',
    ]);
    g.score = 1234;
    expect(displayLines(g, true, 'de')[1]).toBe('LETZTE 1.234');
    const play = createGame(1);
    play.message = { id: 'rankUp', n: 1, ttl: 1 };
    expect(displayLines(play, false, 'de')[0]).toBe('BEFÖRDERT: FÄHNRICH');
    play.message = null;
    play.over = true;
    expect(displayLines(play, false, 'de')[0]).toBe('SPIEL AUS');
    expect(translate('de', 'pinball.printed.shootAgain')).toBe('NOCHMAL');
  });

  it('keeps the same number of ranks in both locales', () => {
    for (const locale of LOCALES)
      for (const id of RANKS)
        expect(translate(locale, `pinball.rank.${id}`)).not.toBe(
          `pinball.rank.${id}`,
        );
    expect(RANKS).toHaveLength(5);
  });
});

describe('marquee', () => {
  it('centres a line that fits', () => {
    expect(lineOffsets(5, 3)).toEqual([61]);
  });

  it('scrolls a line that is too long, starting at its beginning', () => {
    const width = textDots('X'.repeat(30)).width;
    expect(lineOffsets(width, 0)).toEqual([0, width + 12]);
    const [x] = lineOffsets(width, 1);
    expect(x).toBeLessThan(0);
  });
});
