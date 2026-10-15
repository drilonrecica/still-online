import { describe, expect, it } from 'vitest';
import { postedLabel, upToDay } from './daily';

describe('upToDay', () => {
  const items = [
    { day: 1, id: 'a' },
    { day: 1, id: 'b' },
    { day: 2, id: 'c' },
    { day: 3, id: 'd' },
  ];

  it('keeps days up to today, newest first, later entries first within a day', () => {
    expect(upToDay(items, 2).map((x) => x.id)).toEqual(['c', 'b', 'a']);
    expect(upToDay(items, 9).map((x) => x.id)).toEqual(['d', 'c', 'b', 'a']);
    expect(upToDay(items, 0)).toEqual([]);
  });
});

describe('postedLabel', () => {
  it('says today, yesterday or N days ago', () => {
    expect(postedLabel(3, 3)).toBe('today');
    expect(postedLabel(2, 3)).toBe('yesterday');
    expect(postedLabel(1, 4)).toBe('3 days ago');
    expect(postedLabel(5, 4)).toBe('today');
  });
});
