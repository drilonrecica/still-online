// Pixlog content volume per friend (P3-02/P3-03 spec), the "NEW PICS" bulletins pointing at a day
// with an album, and the player-directed variants for a girl and a boy.
import { describe, expect, it } from 'vitest';
import { getBulletins, getPixlogProfiles } from '../locale';
import { PIXLOG_PROFILES } from '.';
import { SURVEYS } from './surveys';
import { photoDateStamp } from '@/os/fs/photos';
import { contentDays } from '../storyDays';

const DAYS = contentDays();

describe.each(PIXLOG_PROFILES.map((p) => [p.contactId, p] as const))(
  'pixlog content: %s',
  (_, p) => {
    it('has 2–3 albums (one in week two) of 4–6 photos with 0–3 comments each', () => {
      expect(p.albums.length).toBeGreaterThanOrEqual(2);
      expect(p.albums.length).toBeLessThanOrEqual(3);
      expect(p.albums.filter((a) => a.day > 5)).toHaveLength(1);
      for (const a of p.albums) {
        expect(a.photos.length).toBeGreaterThanOrEqual(4);
        expect(a.photos.length).toBeLessThanOrEqual(6);
        for (const ph of a.photos) {
          expect(ph.comments.length).toBeLessThanOrEqual(3);
          expect(ph.photo.caption).toBeTruthy();
        }
      }
    });

    it('has 4–6 blog posts on different days, 2 in week two', () => {
      expect(p.blog.length).toBeGreaterThanOrEqual(4);
      expect(p.blog.length).toBeLessThanOrEqual(6);
      expect(p.blog.filter((b) => b.day > 5)).toHaveLength(2);
      expect(new Set(p.blog.map((b) => b.day)).size).toBe(p.blog.length);
    });

    it('shouts 1–2 times on each written day', () => {
      for (const day of DAYS) {
        const n = p.shouts.filter((s) => s.day === day).length;
        expect(n, `day ${day}`).toBeGreaterThanOrEqual(1);
        expect(n, `day ${day}`).toBeLessThanOrEqual(2);
      }
    });

    it('gives kudos on 2–4 days and has 5–8 guestbook entries', () => {
      expect(p.kudosToPlayer.length).toBeGreaterThanOrEqual(2);
      expect(p.kudosToPlayer.length).toBeLessThanOrEqual(4);
      expect(p.kudosToPlayer.filter((d) => d > 5)).toHaveLength(1);
      expect(p.guestbook.length).toBeGreaterThanOrEqual(5);
      expect(p.guestbook.length).toBeLessThanOrEqual(8);
      expect(p.guestbook.filter((g) => g.day > 5)).toHaveLength(2);
    });

    it('answers every question of its survey', () => {
      const survey = SURVEYS.find((s) => s.id === p.survey.surveyId);
      expect(survey).toBeDefined();
      expect(p.survey.answers).toHaveLength(survey!.questions.length);
      for (const a of p.survey.answers) expect(a.trim()).not.toBe('');
    });
  },
);

describe('pixlog content and the story', () => {
  it('has an album on the day of every "NEW PICS on pixlog" bulletin', () => {
    const profiles = getPixlogProfiles('en', 'girl');
    const newPics = getBulletins('en', 'girl').filter((b) =>
      b.link?.startsWith('http://pixlog.example/'),
    );
    for (const b of newPics) {
      const id = b.link!.slice('http://pixlog.example/'.length);
      const profile = profiles.find((p) => p.contactId === id);
      expect(profile, `${b.id} → ${id}`).toBeDefined();
      expect(
        profile!.albums.some((a) => a.day === b.day),
        `${b.id} → ${id} on day ${b.day}`,
      ).toBe(true);
    }
  });

  it('dates story photos: the concert on day 4, never after the album appears', () => {
    for (const locale of ['en', 'de'] as const) {
      const profiles = getPixlogProfiles(locale, 'girl');
      const show = profiles
        .find((p) => p.contactId === 'jess')!
        .albums.find((a) => a.id === 'jess-comets-show')!;
      for (const { photo } of show.photos) {
        expect(photoDateStamp(photo.seed, photo.day)).toBe("'07 10 11");
      }
      for (const a of profiles.flatMap((p) => p.albums)) {
        for (const { photo } of a.photos) {
          // Theo's camp pics are from last summer and keep the seeded stamp.
          if (a.id === 'theo-camp') expect(photo.day, a.id).toBeUndefined();
          else expect(photo.day, a.id).toBeLessThanOrEqual(a.day);
        }
      }
    }
  });

  it('has a profile for every friend', () => {
    expect(PIXLOG_PROFILES.map((p) => p.contactId)).toEqual([
      'jess',
      'pia',
      'kayla',
      'marco',
      'theo',
      'dex',
    ]);
  });

  it('defines ~3 surveys', () => {
    expect(SURVEYS.length).toBeGreaterThanOrEqual(3);
  });

  it('words what Pia writes about the player per gender', () => {
    const pia = (gender: 'girl' | 'boy') =>
      getPixlogProfiles('en', gender).find((p) => p.contactId === 'pia')!;
    expect(pia('girl').about).toContain('my big sister');
    expect(pia('boy').about).toContain('my big brother');
    expect(pia('boy').about).not.toContain('sister');
    const boyText = JSON.stringify(pia('boy'));
    expect(boyText).not.toMatch(/\bsister\b|\bshe didnt\b/);
    expect(boyText).toContain('says he didnt take her');
  });

  it('gives a boy no hearts in shouts about the player', () => {
    const shouts = (gender: 'girl' | 'boy') =>
      getPixlogProfiles('en', gender).flatMap((p) =>
        p.shouts.filter((s) => s.text.includes('u know who u r')),
      );
    expect(shouts('girl').length).toBeGreaterThan(0);
    for (const s of shouts('girl')) expect(s.text).toContain('(L)');
    for (const s of shouts('boy')) {
      expect(s.text).toContain('(Y)');
      expect(s.text).not.toContain('(L)');
    }
  });

  it('gives a boy no crush on Theo and his own jokes from Marco and Dex', () => {
    const text = (id: string, gender: 'girl' | 'boy') =>
      JSON.stringify(
        getPixlogProfiles('en', gender).find((p) => p.contactId === id)!,
      );
    expect(text('theo', 'girl')).toContain(':$');
    expect(text('theo', 'boy')).not.toContain(':$');
    expect(text('theo', 'boy')).toContain('we r a good team (Y)');
    expect(text('marco', 'girl')).toContain('too much glitter');
    expect(text('marco', 'boy')).not.toContain('glitter');
    expect(text('dex', 'boy')).toContain('next video ur in it. bring a board');
    expect(text('dex', 'girl')).not.toContain('bring a board');
  });
});
