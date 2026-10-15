import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatLongDate,
  formatNumber,
  formatRelativeDay,
  formatShortDate,
  formatTime,
} from './format';

const d = new Date(2007, 9, 14, 15, 7);

describe('format (en)', () => {
  it('formats times and dates the way the game always did', () => {
    expect(formatTime(d, 'en')).toBe('3:07 PM');
    expect(formatTime(new Date(2007, 9, 14, 0, 5), 'en')).toBe('12:05 AM');
    expect(formatLongDate(d, 'en')).toBe('Sunday, October 14, 2007');
    expect(formatShortDate(d, 'en')).toBe('10/14/2007');
    expect(formatShortDate(new Date(2007, 2, 5), 'en')).toBe('3/5/2007');
    expect(formatDateTime(d, 'en')).toBe('10/14/2007 15:07');
    expect(formatDateTime(new Date(2007, 2, 5, 9, 4), 'en')).toBe(
      '3/5/2007 09:04',
    );
    expect(formatNumber(1234, 'en')).toBe('1,234');
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
  });

  it('labels relative days', () => {
    expect(formatRelativeDay(0, 'en')).toBe('today');
    expect(formatRelativeDay(1, 'en')).toBe('yesterday');
    expect(formatRelativeDay(3, 'en')).toBe('3 days ago');
  });
});

describe('format (de)', () => {
  it('formats times, dates and numbers German-style', () => {
    expect(formatTime(d, 'de')).toBe('15:07');
    expect(formatLongDate(d, 'de')).toBe('Sonntag, 14. Oktober 2007');
    expect(formatShortDate(d, 'de')).toBe('14.10.2007');
    expect(formatDateTime(d, 'de')).toBe('14.10.2007 15:07');
    expect(formatNumber(1234, 'de')).toBe('1.234');
    expect(formatNumber(1234567, 'de')).toBe('1.234.567');
  });

  it('labels relative days', () => {
    expect(formatRelativeDay(0, 'de')).toBe('heute');
    expect(formatRelativeDay(1, 'de')).toBe('gestern');
    expect(formatRelativeDay(3, 'de')).toBe('vor 3 Tagen');
  });
});
