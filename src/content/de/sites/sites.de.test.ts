// German sites and profiles keep the English structure (days, ids, tags of celebs, Top 8 seeds,
// comment authors, themes) and only change text. The text lint runs in content.test.ts.
import { describe, expect, it } from 'vitest';
import { getProfiles, getSiteText } from '@/content/locale';
import { PROFILES as EN_PROFILES } from '@/content/profiles';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { SPACEPORT_HOST } from '@/content/sites/spaceport';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { VIRUSGUARD_HOST } from '@/content/sites/virusguard';
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { PROFILES } from '../profiles';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('German Celeb Gossip 07', () => {
  const en = getSiteText(GOSSIP_HOST, 'en');
  const de = getSiteText(GOSSIP_HOST, 'de');

  it('keeps post days, celeb tags and comment counts', () => {
    de.GOSSIP_POSTS.forEach((post, i) => {
      const source = en.GOSSIP_POSTS[i]!;
      expect(post.day).toBe(source.day);
      expect(post.comments).toHaveLength(source.comments.length);
      expect(post.photo?.seed).toBe(source.photo?.seed);
      for (const tag of post.tags) expect(tag).toBe(tag.toLowerCase());
      expect(post.title).not.toBe(source.title);
    });
    expect(de.CELEBS.map((c) => c.tag)).toEqual(en.CELEBS.map((c) => c.tag));
    for (const celeb of de.CELEBS)
      expect(
        de.GOSSIP_POSTS.some((p) => p.tags.includes(celeb.tag)),
        celeb.name,
      ).toBe(true);
  });

  it('runs the same polls with German options', () => {
    de.GOSSIP_POLLS.forEach((poll, i) => {
      const source = en.GOSSIP_POLLS[i]!;
      expect(poll.day).toBe(source.day);
      expect(poll.options).toHaveLength(source.options.length);
    });
    expect(de.GOSSIP_TEXT.pollHeading).toBe('TOP oder FLOP?!');
  });
});

describe('German Tinfoil Comets fan page', () => {
  const en = getSiteText(TINFOIL_HOST, 'en');
  const de = getSiteText(TINFOIL_HOST, 'de');

  it('keeps days, seeds, signers and song titles', () => {
    expect(de.TINFOIL_NEWS.map((n) => n.day)).toEqual(
      en.TINFOIL_NEWS.map((n) => n.day),
    );
    expect(de.TINFOIL_PICS.map((p) => [p.day, p.seed])).toEqual(
      en.TINFOIL_PICS.map((p) => [p.day, p.seed]),
    );
    expect(de.TINFOIL_GUESTBOOK.map((e) => [e.day, e.homepage])).toEqual(
      en.TINFOIL_GUESTBOOK.map((e) => [e.day, e.homepage]),
    );
    expect(de.TINFOIL_ALBUMS.map((a) => a.tracks)).toEqual(
      en.TINFOIL_ALBUMS.map((a) => a.tracks),
    );
    expect(de.TINFOIL_TOUR.map((t) => t.after?.day)).toEqual(
      en.TINFOIL_TOUR.map((t) => t.after?.day),
    );
  });

  it('lets Marco sign without an exclamation mark', () => {
    const marco = de.TINFOIL_GUESTBOOK.find((e) => e.name === 'marco');
    expect(marco?.message).not.toContain('!');
    expect(marco?.message).toBe(marco?.message.toLowerCase());
  });
});

describe('German school site, Spaceport and VirusGuard', () => {
  it('lists Herr Dalton: Biologie, Raum 12, same email', () => {
    const { WESTFIELD_STAFF, WESTFIELD_NEWS } = getSiteText(
      WESTFIELD_HOST,
      'de',
    );
    expect(WESTFIELD_STAFF).toContainEqual({
      name: 'Herr Dalton',
      role: 'Biologie',
      room: 'Raum 12',
      email: 'mr.dalton@westfield-high.example',
    });
    const en = getSiteText(WESTFIELD_HOST, 'en');
    expect(WESTFIELD_NEWS.map((n) => n.day)).toEqual(
      en.WESTFIELD_NEWS.map((n) => n.day),
    );
    expect(WESTFIELD_STAFF.map((s) => s.email)).toEqual(
      en.WESTFIELD_STAFF.map((s) => s.email),
    );
  });

  it('keeps Spaceport theme ids and colours, German names', () => {
    const en = getSiteText(SPACEPORT_HOST, 'en');
    const de = getSiteText(SPACEPORT_HOST, 'de');
    expect(de.THEME_PRESETS.map((t) => [t.id, t.theme])).toEqual(
      en.THEME_PRESETS.map((t) => [t.id, t.theme]),
    );
    de.THEME_PRESETS.forEach((t, i) =>
      expect(t.label).not.toBe(en.THEME_PRESETS[i]!.label),
    );
    expect(de.MOOD_EMOTICONS.map((m) => m.code)).toEqual(
      en.MOOD_EMOTICONS.map((m) => m.code),
    );
    expect(placeholders(de.PROFILE_PAGE.title)).toEqual(['{name}']);
  });

  it('VirusGuard is still an obvious parody, in euros', () => {
    const { VIRUSGUARD_TEXT } = getSiteText(VIRUSGUARD_HOST, 'de');
    expect(VIRUSGUARD_TEXT.alert).toContain('87% INFIZIERT');
    expect(VIRUSGUARD_TEXT.offer).toContain('49,95 €');
    expect(VIRUSGUARD_TEXT.fineprint).toMatch(/Scherz-Website/);
  });
});

describe('German Spaceport profiles', () => {
  it('are what getProfiles returns for de', () => {
    expect(getProfiles('de')).toBe(PROFILES);
  });

  it.each(EN_PROFILES.map((p, i) => [p.contactId, p, PROFILES[i]!] as const))(
    '%s keeps structure and translates every text',
    (_, en, de) => {
      expect(de.contactId).toBe(en.contactId);
      expect(de.songTrackId).toBe(en.songTrackId);
      expect(de.mood.emoticon).toBe(en.mood.emoticon);
      expect(de.top8.map((t) => ('seed' in t ? t.seed : t))).toEqual(
        en.top8.map((t) => ('seed' in t ? t.seed : t)),
      );
      expect(de.comments.map((c) => [c.day, c.contactId])).toEqual(
        en.comments.map((c) => [c.day, c.contactId]),
      );
      expect(de.commentsOnPlayer.map((c) => c.day)).toEqual(
        en.commentsOnPlayer.map((c) => c.day),
      );
      expect(de.interests).toHaveLength(en.interests.length);
      const { stickers: deStickers, ...deTheme } = de.theme;
      const { stickers: enStickers, ...enTheme } = en.theme;
      expect(deTheme).toEqual(enTheme);
      expect(deStickers?.length).toBe(enStickers?.length);

      const pairs: [string, string][] = [
        [en.headline, de.headline],
        [en.aboutMe, de.aboutMe],
        [en.wantToMeet, de.wantToMeet],
        ...en.comments.map((c, i): [string, string] => [
          c.text,
          de.comments[i]!.text,
        ]),
        ...en.commentsOnPlayer.map((c, i): [string, string] => [
          c.text,
          de.commentsOnPlayer[i]!.text,
        ]),
        ...en.interests.map((row, i): [string, string] => [
          row.text,
          de.interests[i]!.text,
        ]),
      ];
      for (const [source, text] of pairs) {
        expect(text, source).not.toBe(source);
        expect(placeholders(text), source).toEqual(placeholders(source));
      }
    },
  );

  it("keeps Marco's lowercase and never „!“", () => {
    const marco = PROFILES.find((p) => p.contactId === 'marco')!;
    for (const text of [
      marco.headline,
      marco.aboutMe,
      ...marco.commentsOnPlayer.map((c) => c.text),
    ]) {
      expect(text).not.toContain('!');
      expect(text).toBe(text.toLowerCase());
    }
  });
});
