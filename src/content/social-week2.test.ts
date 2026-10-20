// Week two on Friendspace and Pixlog (bible §6, §7): the lint over days 1–10, three bulletins a day,
// one album per friend with story-dated photos (the day-10 show album on `stage`), Velvet Lantern's
// rec hall show and post, and what friends say to the player per gender. Structure in every
// language and gender; story text in English (the German text is checked in `fallback.test.ts`).
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { photoDateStamp } from '@/os/fs/photos';
import { GENDERS } from './gender';
import { lintSocial } from './lintSocial';
import { contentFor, getBands, getPixlogProfiles, getProfiles } from './locale';
import { contentDays } from './storyDays';

const WEEK2 = contentDays().filter((d) => d > 5);
const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);

describe.each(COMBOS)('week-two social content (%s, %s)', (locale, gender) => {
  const c = contentFor(locale, gender);

  it('passes lintSocial for days 1–10', () => {
    expect(lintSocial(c)).toEqual([]);
  });

  it.each(WEEK2)('day %i: three bulletins', (day) => {
    expect(c.bulletins.filter((b) => b.day === day)).toHaveLength(3);
  });

  it('gives every friend one week-two album with story-dated photos', () => {
    for (const p of c.pixlog) {
      const week2 = p.albums.filter((a) => a.day > 5);
      expect(week2, p.contactId).toHaveLength(1);
      for (const { photo } of week2[0]!.photos) {
        expect(photo.day, p.contactId).toBeGreaterThanOrEqual(6);
        expect(photo.day, p.contactId).toBeLessThanOrEqual(week2[0]!.day);
      }
    }
  });

  it('shoots the day-10 show album on the rec hall stage, stamped day 10', () => {
    const marco = c.pixlog.find((p) => p.contactId === 'marco')!;
    const show = marco.albums.find((a) => a.id === 'marco-rec-hall')!;
    expect(show.day).toBe(10);
    expect(show.photos).toHaveLength(6);
    for (const { photo } of show.photos) {
      expect(photo.scene).toBe('stage');
      expect(photoDateStamp(photo.seed, photo.day)).toBe("'07 10 17");
    }
    // Every friend comments on the show.
    const from = new Set(
      show.photos.flatMap((ph) => ph.comments.map((x) => x.from)),
    );
    for (const id of ['jess', 'kayla', 'theo', 'dex', 'pia'])
      expect(from).toContain(id);
  });

  it('uses the classroom and living room scenes where the story is', () => {
    const scenes = (id: string) =>
      c.pixlog
        .find((p) => p.contactId === id)!
        .albums.filter((a) => a.day > 5)
        .flatMap((a) => a.photos.map((ph) => ph.photo.scene));
    expect(scenes('theo')).toContain('classroom');
    expect(scenes('kayla')).toContain('classroom');
    expect(scenes('dex')).toContain('livingroom');
    expect(scenes('pia')).toContain('livingroom');
  });

  it('books Velvet Lantern at the rec hall and posts after the show', () => {
    const band = c.bands.find((b) => b.id === 'velvet-lantern')!;
    expect(band.shows.map((s) => s.day)).toEqual(
      expect.arrayContaining([6, 8, 10]),
    );
    expect(band.blog.map((b) => b.day)).toEqual(
      expect.arrayContaining([7, 8, 10]),
    );
  });

  it('has friends comment on the player in week two', () => {
    for (const p of c.profiles)
      expect(
        p.commentsOnPlayer.filter((x) => x.day > 5),
        p.contactId,
      ).toHaveLength(2);
  });
});

describe('week two to the player, by gender (en)', () => {
  const wall = (gender: 'girl' | 'boy') =>
    getProfiles('en', gender).flatMap((p) =>
      p.commentsOnPlayer.filter((x) => x.day > 5).map((x) => x.text),
    );
  const pixlog = (id: string, gender: 'girl' | 'boy') =>
    JSON.stringify(
      getPixlogProfiles('en', gender).find((p) => p.contactId === id)!,
    );

  it('words the lines to the player per gender, with no hearts for a boy', () => {
    const girl = wall('girl');
    const boy = wall('boy');
    expect(girl).toContain('see u near the back. sorry. :)');
    expect(boy).toContain('back row crew. sorry');
    expect(boy).toContain('best crew in the business. only crew');
    expect(boy.some((t) => t.includes('a guy vote'))).toBe(true);
    for (const t of boy) {
      expect(t).not.toContain('(L)');
      expect(t).not.toContain('<3');
      expect(t).not.toMatch(/outfit/i);
    }
  });

  it('gives a boy the crew and "56k", a girl a row and "lantern heart"', () => {
    expect(pixlog('marco', 'boy')).toContain('crew: the kid. carried the amp');
    expect(pixlog('marco', 'boy')).toContain('56k');
    expect(pixlog('marco', 'boy')).not.toContain('lantern heart');
    expect(pixlog('marco', 'girl')).toContain('front row: the kid');
    expect(pixlog('marco', 'girl')).toContain('lantern heart');
    const band = (gender: 'girl' | 'boy') =>
      getBands('en', gender).find((b) => b.id === 'velvet-lantern')!;
    expect(band('boy').blog.some((p) => p.body.includes('"56k"'))).toBe(true);
    expect(
      band('girl').blog.some((p) => p.body.includes('"lantern heart"')),
    ).toBe(true);
  });

  it('keeps Theo’s blush on the girl side only', () => {
    expect(pixlog('theo', 'girl')).toContain('not sorry :$');
    expect(pixlog('theo', 'boy')).not.toContain(':$');
    expect(pixlog('theo', 'boy')).toContain('marco nodded at me');
  });

  it('has Pia call a boy her big brother', () => {
    expect(pixlog('pia', 'boy')).toContain('my big brother said');
    expect(pixlog('pia', 'boy')).not.toMatch(/\bsister\b/);
  });
});
