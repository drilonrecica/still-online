import { describe, expect, it } from 'vitest';
import { formatTime, nowPlayingText } from './format';

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [59.9, '0:59'],
    [60, '1:00'],
    [125, '2:05'],
    [3600, '60:00'],
    [-3, '0:00'],
    [NaN, '0:00'],
    [Infinity, '0:00'],
  ])('%s → %s', (input, out) => {
    expect(formatTime(input)).toBe(out);
  });
});

describe('nowPlayingText', () => {
  it('numbers from 1 and appends the duration', () => {
    const t = {
      id: 'a',
      title: 'Song',
      artist: 'Band',
      file: 'x.mp3',
      durationSec: 187,
      license: 'CC BY 4.0' as const,
    };
    expect(nowPlayingText(t, 2)).toBe('3. Band - Song (3:07)');
  });
});
