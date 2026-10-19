import { describe, expect, it } from 'vitest';
import { contentFor } from '@/content/locale';
import { PIXLOG_PROFILES, STRANGERS } from '@/content/pixlog';
import type { PixlogProfile } from '@/content/pixlog/types';
import {
  MAX_VISITORS,
  recentVisitors,
  shoutsFeed,
  visitorCount,
  visitors,
} from './logic';

const jess = PIXLOG_PROFILES[0]!;
const photo = { photo: { scene: 'party', seed: 1 }, comments: [] } as const;

/** A bare profile with only the given items. */
function profile(
  contactId: string,
  over: Partial<PixlogProfile> = {},
): PixlogProfile {
  return {
    ...jess,
    contactId,
    albums: [],
    blog: [],
    shouts: [],
    guestbook: [],
    ...over,
  };
}

const kayla = profile('kayla', {
  shouts: [
    { day: 2, text: 'shout two' },
    { day: 3, text: 'shout three' },
  ],
  albums: [{ id: 'k-a', day: 3, title: 'Sleepover', photos: [photo, photo] }],
  blog: [{ id: 'k-b', day: 2, title: 'ugh', body: '…' }],
});
const dex = profile('dex', {
  shouts: [{ day: 3, text: 'dex three' }],
  guestbook: [{ day: 4, from: 'kayla', text: 'hi' }],
});

describe('shoutsFeed', () => {
  it('lists shouts, albums and posts out by the day, newest day first', () => {
    const feed = shoutsFeed([kayla, dex], 3);
    expect(feed.map((i) => [i.day, i.contactId, i.kind])).toEqual([
      [3, 'kayla', 'shout'],
      [3, 'kayla', 'album'],
      [3, 'dex', 'shout'],
      [2, 'kayla', 'shout'],
      [2, 'kayla', 'blog'],
    ]);
    expect(feed[1]).toEqual({
      day: 3,
      contactId: 'kayla',
      kind: 'album',
      albumId: 'k-a',
      title: 'Sleepover',
      count: 2,
    });
    expect(feed[4]).toMatchObject({ postId: 'k-b', title: 'ugh' });
  });

  it('day-gates', () => {
    expect(shoutsFeed([kayla, dex], 1)).toEqual([]);
    expect(shoutsFeed([kayla], 2)).toHaveLength(2);
  });

  it('is deterministic per day and locale', () => {
    for (const locale of ['en', 'de'] as const) {
      const profiles = contentFor(locale, 'girl').pixlog;
      for (let day = 1; day <= 6; day++)
        expect(shoutsFeed(profiles, day)).toEqual(shoutsFeed(profiles, day));
    }
    // Same structure in both languages; only the text differs.
    const strip = (locale: 'en' | 'de') =>
      shoutsFeed(contentFor(locale, 'girl').pixlog, 5).map(
        ({ day, contactId, kind }) => [day, contactId, kind],
      );
    expect(strip('de')).toEqual(strip('en'));
  });
});

describe('visitors', () => {
  it('has every friend active that day plus 1–3 strangers', () => {
    for (let day = 1; day <= 30; day++) {
      const list = visitors([kayla, dex], day, STRANGERS);
      const friends = list.filter((v) => v.kind === 'friend');
      const strangers = list.filter((v) => v.kind === 'stranger');
      expect(list.length).toBeLessThanOrEqual(MAX_VISITORS);
      expect(strangers.length).toBeGreaterThanOrEqual(1);
      expect(strangers.length).toBeLessThanOrEqual(3);
      const names = strangers.map((s) => s.kind === 'stranger' && s.name);
      for (const name of names) expect(STRANGERS).toContain(name);
      expect(new Set(names).size).toBe(names.length);
      const ids = friends.map((f) => f.kind === 'friend' && f.contactId);
      const expected = { 2: ['kayla'], 3: ['dex', 'kayla'], 4: ['kayla'] };
      expect(ids.sort()).toEqual(expected[day as keyof typeof expected] ?? []);
    }
  });

  it('counts guestbook entries and photo comments a friend wrote', () => {
    // Day 4: kayla only wrote in dex's guestbook.
    expect(visitors([kayla, dex], 4, STRANGERS)).toContainEqual({
      kind: 'friend',
      contactId: 'kayla',
    });
  });

  it('caps at 8', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      profile(`f${i}`, { shouts: [{ day: 1, text: 'hi' }] }),
    );
    const list = visitors(many, 1, STRANGERS);
    expect(list).toHaveLength(MAX_VISITORS);
    expect(list.every((v) => v.kind === 'friend')).toBe(true);
  });

  it('is deterministic per day and locale, and varies by day', () => {
    for (const locale of ['en', 'de'] as const) {
      const c = contentFor(locale, 'boy');
      for (let day = 1; day <= 8; day++)
        expect(visitors(c.pixlog, day, c.pixlogStrangers)).toEqual(
          visitors(c.pixlog, day, c.pixlogStrangers),
        );
    }
    const days = Array.from({ length: 6 }, (_, i) =>
      JSON.stringify(visitors([], i + 1, STRANGERS)),
    );
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it('copes with no strangers', () => {
    expect(visitors([], 1, [])).toEqual([]);
  });
});

describe('recentVisitors', () => {
  it('keeps each visitor once, newest day first, at most 8', () => {
    const list = recentVisitors([kayla, dex], 5, STRANGERS);
    expect(list.length).toBeLessThanOrEqual(MAX_VISITORS);
    const keys = list.map((v) => (v.kind === 'friend' ? v.contactId : v.name));
    expect(new Set(keys).size).toBe(keys.length);
    expect(list.map((v) => v.day)).toEqual(
      [...list.map((v) => v.day)].sort((a, b) => b - a),
    );
    expect(
      list.find((v) => v.kind === 'friend' && v.contactId === 'kayla'),
    ).toMatchObject({ day: 4 });
    expect(recentVisitors([kayla, dex], 5, STRANGERS)).toEqual(list);
  });
});

describe('visitorCount', () => {
  it('grows every day and is the same for the same day', () => {
    let last = visitorCount(0);
    for (let day = 1; day <= 60; day++) {
      const n = visitorCount(day);
      expect(n).toBeGreaterThan(last);
      expect(n - last).toBeGreaterThanOrEqual(3);
      expect(n - last).toBeLessThanOrEqual(14);
      expect(visitorCount(day)).toBe(n);
      last = n;
    }
  });
});
