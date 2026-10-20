import { describe, expect, it } from 'vitest';
import {
  COUNTER_START,
  TINFOIL_GUESTBOOK,
  TINFOIL_TOUR,
} from '@/content/sites/tinfoilcomets';
import type { GuestbookEntry } from '@/content/sites/types';
import {
  counterDigits,
  counterValue,
  guestbookEntries,
  signedLabel,
  tourRow,
  validateEntry,
  webring,
} from './logic';

const entry = (day: number, name: string): GuestbookEntry => ({
  day,
  name,
  message: `${name} says hi`,
});

describe('guestbookEntries', () => {
  const content = [entry(1, 'a'), entry(1, 'b'), entry(3, 'c'), entry(5, 'd')];

  it('shows only entries up to the current day, newest first', () => {
    expect(guestbookEntries(content, [], 3).map((e) => e.name)).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it("puts the player's entries above that day's friends, newest first", () => {
    const mine = [
      { name: 'me1', message: 'x', day: 1 },
      { name: 'me3', message: 'y', day: 3 },
      { name: 'me3b', message: 'z', day: 3 },
      { name: 'old', message: 'no day' },
    ];
    const shown = guestbookEntries(content, mine, 5);
    expect(shown.map((e) => e.name)).toEqual([
      'd',
      'me3b',
      'me3',
      'c',
      'old',
      'me1',
      'b',
      'a',
    ]);
    expect(shown.find((e) => e.name === 'old')).toMatchObject({
      day: 1,
      mine: true,
    });
  });

  it('friends sign on their story days', () => {
    const at = (day: number) =>
      guestbookEntries(TINFOIL_GUESTBOOK, [], day).map((e) => e.name);
    const jess = 'xX~JeSs~Xx :D';
    const pia = 'pia (L) ponies (L)';
    expect(at(1).filter((n) => n === jess)).toHaveLength(1);
    expect(at(2)).not.toContain(pia);
    expect(at(3)).toContain(pia);
    expect(at(3)).not.toContain('marco');
    expect(at(4)).toContain('marco');
    expect(at(5).filter((n) => n === jess)).toHaveLength(2);
    expect(at(6)).toContain(pia);
    expect(at(9).filter((n) => n === jess)).toHaveLength(5);
    expect(at(10).filter((n) => n === 'marco')).toHaveLength(2);
    expect(
      TINFOIL_GUESTBOOK.find((e) => e.day === 3 && e.name === pia)?.message,
    ).toContain('this band is ok but PONIES r better');
    expect(
      TINFOIL_GUESTBOOK.filter((e) => e.name === 'marco').every(
        (e) => !e.message.includes('!'),
      ),
    ).toBe(true);
  });
});

describe('signedLabel', () => {
  it('says today, yesterday or N days ago', () => {
    expect(signedLabel(4, 4)).toBe('today');
    expect(signedLabel(3, 4)).toBe('yesterday');
    expect(signedLabel(1, 4)).toBe('3 days ago');
  });
});

describe('validateEntry', () => {
  it('trims fields and stamps the day', () => {
    expect(
      validateEntry({ name: ' Ada ', message: ' cool site ', homepage: '' }, 2),
    ).toEqual({
      ok: true,
      entry: { name: 'Ada', message: 'cool site', day: 2 },
    });
    expect(
      validateEntry({ name: 'Ada', message: 'hi', homepage: ' x.example ' }, 1),
    ).toMatchObject({ ok: true, entry: { homepage: 'x.example' } });
  });

  it('needs a name and a message', () => {
    expect(
      validateEntry({ name: ' ', message: 'hi', homepage: '' }, 1),
    ).toEqual({ ok: false, error: 'noName' });
    expect(validateEntry({ name: 'A', message: '', homepage: '' }, 1)).toEqual({
      ok: false,
      error: 'noMessage',
    });
  });
});

describe('tourRow', () => {
  const lakeview = TINFOIL_TOUR.find((t) => t.venue.startsWith('Lakeview'))!;
  const riverside = TINFOIL_TOUR[0]!;

  it('reads Lakeview as listed, sold out from day 8 and played from day 10', () => {
    expect(tourRow(lakeview, 7)).toEqual({
      date: 'next saturday',
      note: lakeview.note,
      past: false,
    });
    expect(tourRow(lakeview, 8).note).toMatch(/^SOLD OUT\. 9 minutes/);
    expect(tourRow(lakeview, 8).past).toBe(false);
    expect(tourRow(lakeview, 10)).toMatchObject({
      date: 'saturday',
      past: true,
    });
    expect(tourRow(lakeview, 10).note).toMatch(/radio/);
  });

  it('keeps Riverside as before: played from day 5', () => {
    expect(tourRow(riverside, 4).past).toBe(false);
    expect(tourRow(riverside, 5)).toMatchObject({
      date: 'last friday',
      past: true,
    });
  });
});

describe('hit counter', () => {
  it('starts at 004,203 and adds one per visit', () => {
    expect(counterDigits(counterValue(0))).toBe('004,203');
    expect(counterDigits(counterValue(1))).toBe('004,203');
    expect(counterDigits(counterValue(2))).toBe('004,204');
    expect(counterValue(10)).toBe(COUNTER_START + 9);
    expect(counterDigits(counterValue(2), 'de')).toBe('004.204');
    expect(counterDigits(1_234_567)).toBe('1,234,567');
  });
});

describe('webring', () => {
  it('wraps around the alphabetical ring of hosts', () => {
    const hosts = ['b.example', 'c.example', 'a.example'];
    expect(webring(hosts, 'b.example')).toEqual({
      prev: 'a.example',
      next: 'c.example',
      others: ['a.example', 'c.example'],
    });
    expect(webring(hosts, 'c.example').next).toBe('a.example');
    expect(webring(hosts, 'a.example').prev).toBe('c.example');
  });
});
