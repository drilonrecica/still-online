import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  GAME_YEAR,
  formatLongDate,
  formatTrayTime,
  msUntilNextMinute,
  now,
  toGameDate,
} from '@/os/clock';

describe('toGameDate', () => {
  it('keeps month, day and time of day but forces the year to 2007', () => {
    const game = toGameDate(new Date(2026, 9, 14, 15, 7, 42, 123));
    expect(game.getFullYear()).toBe(GAME_YEAR);
    expect(game.getMonth()).toBe(9);
    expect(game.getDate()).toBe(14);
    expect(game.getHours()).toBe(15);
    expect(game.getMinutes()).toBe(7);
    expect(game.getSeconds()).toBe(42);
    expect(game.getMilliseconds()).toBe(123);
  });

  it('maps Feb 29 to Feb 28', () => {
    const game = toGameDate(new Date(2028, 1, 29, 9, 30));
    expect(game.getFullYear()).toBe(2007);
    expect(game.getMonth()).toBe(1);
    expect(game.getDate()).toBe(28);
    expect(game.getHours()).toBe(9);
    expect(game.getMinutes()).toBe(30);
  });

  it('leaves Feb 28 and Mar 1 alone', () => {
    expect(toGameDate(new Date(2028, 1, 28)).getDate()).toBe(28);
    const march = toGameDate(new Date(2028, 2, 1));
    expect(march.getMonth()).toBe(2);
    expect(march.getDate()).toBe(1);
  });

  it('handles year boundaries', () => {
    const eve = toGameDate(new Date(2026, 11, 31, 23, 59));
    expect([eve.getFullYear(), eve.getMonth(), eve.getDate()]).toEqual([
      2007, 11, 31,
    ]);
    const newYear = toGameDate(new Date(2027, 0, 1, 0, 0));
    expect([
      newYear.getFullYear(),
      newYear.getMonth(),
      newYear.getDate(),
    ]).toEqual([2007, 0, 1]);
  });
});

describe('now', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the game date for the current real time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 1, 29, 12, 0));
    const game = now();
    expect([
      game.getFullYear(),
      game.getMonth(),
      game.getDate(),
      game.getHours(),
    ]).toEqual([2007, 1, 28, 12]);
  });
});

describe('formatTrayTime', () => {
  it.each([
    [0, 0, '12:00 AM'],
    [0, 5, '12:05 AM'],
    [9, 7, '9:07 AM'],
    [11, 59, '11:59 AM'],
    [12, 0, '12:00 PM'],
    [15, 7, '3:07 PM'],
    [23, 59, '11:59 PM'],
  ])('%i:%i → %s', (h, m, expected) => {
    expect(formatTrayTime(new Date(2007, 0, 1, h, m))).toBe(expected);
  });
});

describe('formatLongDate', () => {
  it('uses the 2007 weekday', () => {
    expect(formatLongDate(new Date(2007, 9, 14))).toBe(
      'Sunday, October 14, 2007',
    );
    expect(formatLongDate(toGameDate(new Date(2024, 1, 29)))).toBe(
      'Wednesday, February 28, 2007',
    );
  });
});

describe('msUntilNextMinute', () => {
  it('counts down to the next full minute', () => {
    expect(msUntilNextMinute(new Date(2007, 0, 1, 10, 0, 0, 0))).toBe(60_000);
    expect(msUntilNextMinute(new Date(2007, 0, 1, 10, 0, 59, 500))).toBe(500);
    expect(msUntilNextMinute(new Date(2007, 0, 1, 10, 0, 30, 250))).toBe(
      29_750,
    );
  });
});
