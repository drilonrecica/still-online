// Friendspace profile content: one per contact, valid Top 8s and songs, day-gated comments.
import { describe, expect, it } from 'vitest';
import { contacts } from '../contacts';
import { PLAYLIST } from '../playlist';
import { PROFILES } from '.';

const ids = contacts.map((c) => c.contact.id);

describe('Friendspace profiles', () => {
  it('has exactly one profile per contact', () => {
    expect(PROFILES.map((p) => p.contactId).sort()).toEqual([...ids].sort());
  });

  it.each(PROFILES.map((p) => [p.contactId, p] as const))(
    '%s: Top 8 is the player, the 5 other friends and 2 extras',
    (id, p) => {
      expect(p.top8).toHaveLength(8);
      expect(p.top8.filter((t) => t.kind === 'player')).toHaveLength(1);
      expect(p.top8.filter((t) => t.kind === 'extra')).toHaveLength(2);
      const friends = p.top8.flatMap((t) =>
        t.kind === 'contact' ? [t.id] : [],
      );
      expect(friends.sort()).toEqual(ids.filter((c) => c !== id).sort());
    },
  );

  it.each(PROFILES.map((p) => [p.contactId, p] as const))(
    '%s: song, comments and player comments are valid',
    (_id, p) => {
      expect(PLAYLIST.some((t) => t.id === p.songTrackId)).toBe(true);
      expect(p.interests.length).toBeGreaterThan(0);
      for (const c of p.comments) {
        expect(c.day).toBeGreaterThanOrEqual(1);
        expect(c.day).toBeLessThanOrEqual(5);
        if (c.contactId) {
          expect(ids).toContain(c.contactId);
          expect(c.contactId).not.toBe(p.contactId);
        }
      }
      // Something new on the wall every story day.
      for (let day = 1; day <= 5; day++)
        expect(
          p.comments.some((c) => c.day === day),
          `day ${day}`,
        ).toBe(true);
      expect(p.commentsOnPlayer.length).toBeGreaterThan(0);
      for (const c of p.commentsOnPlayer) {
        expect(c.day).toBeGreaterThanOrEqual(2);
        expect(c.day).toBeLessThanOrEqual(5);
      }
    },
  );

  it('Marco never uses exclamation marks in his own words', () => {
    const marco = PROFILES.find((p) => p.contactId === 'marco')!;
    const own = [
      marco.headline,
      marco.aboutMe,
      marco.wantToMeet,
      marco.mood.text,
      ...marco.interests.map((i) => i.text),
      ...marco.commentsOnPlayer.map((c) => c.text),
      ...PROFILES.flatMap((p) =>
        p.comments.filter((c) => c.contactId === 'marco').map((c) => c.text),
      ),
    ];
    for (const text of own) expect(text, text).not.toContain('!');
  });
});
