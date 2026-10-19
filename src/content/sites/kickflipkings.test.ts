// Shape checks for Kickflip Kings in both languages and genders (the text lint runs in content.test.ts).
import { describe, expect, it } from 'vitest';
import { GENDERS } from '../gender';
import { getContacts, getSiteText } from '../locale';
import { LOCALES } from '@/i18n/types';
import { contentDays } from '../storyDays';
import { KICKFLIP_HOST } from './kickflipkings';

const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);

describe.each(COMBOS)('kickflipkings content (%s, %s)', (locale, gender) => {
  const site = getSiteText(KICKFLIP_HOST, locale, gender);
  const en = getSiteText(KICKFLIP_HOST, 'en', gender);

  it('posts news every written day and keeps days, authors and handles across languages', () => {
    for (const day of contentDays())
      expect(
        site.KICKFLIP_NEWS.some((p) => p.day === day),
        `day ${day}`,
      ).toBe(true);
    const shape = (s: typeof site) => ({
      news: s.KICKFLIP_NEWS.map((p) => [p.day, p.author]),
      shouts: s.KICKFLIP_SHOUTS.map((p) => [p.day, p.user]),
      crew: s.KICKFLIP_CREW.map((m) => [m.handle, m.name, m.after?.day]),
      tricks: s.KICKFLIP_TRICKS.map((t) => [t.id, t.name, t.steps.length]),
      gigs: s.KICKFLIP_GIGS.map((g) => [
        g.id,
        g.day,
        g.band,
        g.updates?.map((u) => u.day),
        g.after?.day,
      ]),
      video: [
        s.KICKFLIP_VIDEO.premiereDay,
        s.KICKFLIP_VIDEO.length,
        s.KICKFLIP_VIDEO.teasers.map((t) => t.day),
        s.KICKFLIP_VIDEO.timeline.map((t) => t.at),
      ],
      story: [s.DEX_STORY.day, s.DEX_STORY.lines.length],
    });
    expect(shape(site)).toEqual(shape(en));
  });

  it('follows the story: Dex lands it on day 4, the video premieres on day 5', () => {
    expect(site.DEX_STORY.day).toBe(4);
    expect(site.KICKFLIP_VIDEO.premiereDay).toBe(5);
    expect(site.KICKFLIP_CREW.map((m) => m.handle)).toContain('dex.kickflip');
    expect(site.KICKFLIP_CREW).toHaveLength(4);
    expect(site.KICKFLIP_TRICKS.map((t) => t.id)).toEqual([
      'ollie',
      'shove-it',
      'kickflip',
    ]);
    const dexShouts = site.KICKFLIP_SHOUTS.filter(
      (s) => s.user === 'dex.kickflip',
    );
    for (const s of dexShouts) expect(s.text).toBe(s.text.toLowerCase());
    expect(
      site.KICKFLIP_GIGS.filter((g) => g.band === 'Velvet Lantern').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Dex's day-5 chat links the video page", () => {
    const dex = getContacts(locale, gender).find((c) => c.contact.id === 'dex');
    const premiere = dex?.scripts.find((s) => s.id === 'day5')?.nodes.premiere;
    expect(
      premiere?.lines.some((l) =>
        l.text?.includes('kickflipkings.example/video'),
      ),
    ).toBe(true);
  });
});

describe('kickflipkings per gender', () => {
  it('greets a girl and a boy differently and keeps everything else the same', () => {
    const girl = getSiteText(KICKFLIP_HOST, 'en', 'girl');
    const boy = getSiteText(KICKFLIP_HOST, 'en', 'boy');
    expect(girl.KICKFLIP_TEXT.welcome).toMatch(/^yo skater girl/);
    expect(boy.KICKFLIP_TEXT.welcome).toMatch(/^yo dude/);
    expect(boy.KICKFLIP_TEXT.welcome).not.toMatch(/girl/);
    expect(boy.KICKFLIP_NEWS).toEqual(girl.KICKFLIP_NEWS);
    expect(
      getSiteText(KICKFLIP_HOST, 'de', 'boy').KICKFLIP_TEXT.welcome,
    ).toMatch(/^jo alter/);
    expect(
      getSiteText(KICKFLIP_HOST, 'de', 'girl').KICKFLIP_TEXT.welcome,
    ).toMatch(/^jo skatergirl/);
  });
});
