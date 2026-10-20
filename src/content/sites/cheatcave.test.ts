// Shape checks for CheatCave in both languages and genders (the text lint runs in content.test.ts).
import { describe, expect, it } from 'vitest';
import { GENDERS } from '../gender';
import { getSiteText } from '../locale';
import { LOCALES } from '@/i18n/types';
import { contentDays } from '../storyDays';
import { CHEATCAVE_HOST } from './cheatcave';

const days = contentDays('sites');
const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);

describe.each(COMBOS)('cheatcave content (%s, %s)', (locale, gender) => {
  const site = getSiteText(CHEATCAVE_HOST, locale, gender);
  const en = getSiteText(CHEATCAVE_HOST, 'en', gender);

  it('posts 1-2 news items on each written day', () => {
    for (const day of days) {
      const n = site.CHEATCAVE_NEWS.filter((p) => p.day === day).length;
      expect(n, `day ${day}`).toBeGreaterThanOrEqual(1);
      expect(n, `day ${day}`).toBeLessThanOrEqual(2);
    }
    expect(site.CHEATCAVE_NEWS.map((p) => p.day)).toEqual(
      en.CHEATCAVE_NEWS.map((p) => p.day),
    );
  });

  it('has cheats for 6 invented games plus Mines, Hen Hunt and Star Pinball', () => {
    const ids = site.CHEATCAVE_GAMES.map((g) => g.id);
    expect(ids).toEqual(en.CHEATCAVE_GAMES.map((g) => g.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.slice(-3)).toEqual(['mines', 'henhunt', 'pinball']);
    expect(ids.length - 3).toBeGreaterThanOrEqual(6);
    for (const game of site.CHEATCAVE_GAMES) {
      expect(game.cheats.length, game.id).toBeGreaterThanOrEqual(2);
      expect(game.joke.code, game.id).not.toBe('');
    }
  });

  it('keeps clip ids, days, views and scenes across languages', () => {
    const shape = (s: typeof site) =>
      s.CHEATCAVE_CLIPS.map((c) => [c.id, c.day, c.views, c.photo.scene]);
    expect(shape(site)).toEqual(shape(en));
    expect(site.CHEATCAVE_CLIPS.filter((c) => c.day <= 1)).toHaveLength(10);
  });

  it('has 3 threads with the same days and authors in every language', () => {
    const shape = (s: typeof site) =>
      s.CHEATCAVE_THREADS.map((t) => [
        t.id,
        t.posts.map((p) => [p.day, p.user]),
      ]);
    expect(site.CHEATCAVE_THREADS).toHaveLength(3);
    expect(shape(site)).toEqual(shape(en));
    for (const thread of site.CHEATCAVE_THREADS) {
      const postDays = thread.posts.map((p) => p.day);
      expect(postDays).toEqual([...postDays].sort((a, b) => a - b));
    }
  });

  it('ties the forum to the story: Theo asks shyly, Dex posts late and from the Jam, Marco is dry', () => {
    const posts = site.CHEATCAVE_THREADS.flatMap((t) => t.posts);
    const by = (user: string) => posts.filter((p) => p.user === user);
    const theo = by('theo_k');
    expect(theo[0]?.day).toBe(1);
    expect(theo[0]?.text).toMatch(
      locale === 'de' ? /dumme frage/ : /dumb question/,
    );
    expect(by('dex.kickflip').map((p) => p.day)).toEqual([5, 9]);
    for (const p of by('dex.kickflip'))
      expect(p.text).toBe(p.text.toLowerCase());
    const marco = by('marco.bassline');
    expect(marco.length).toBeGreaterThanOrEqual(2);
    for (const p of marco) {
      expect(p.text).not.toContain('!');
      expect(p.text).toBe(p.text.toLowerCase());
    }
  });
});

describe('cheatcave per gender', () => {
  it('greets a girl and a boy differently and keeps everything else the same', () => {
    const girl = getSiteText(CHEATCAVE_HOST, 'en', 'girl');
    const boy = getSiteText(CHEATCAVE_HOST, 'en', 'boy');
    expect(girl.CHEATCAVE_TEXT.welcome).toMatch(/gamer girl/);
    expect(boy.CHEATCAVE_TEXT.welcome).toMatch(/^hey dude/);
    expect(boy.CHEATCAVE_TEXT.welcome).not.toMatch(/girl/);
    expect(boy.CHEATCAVE_NEWS).toBe(girl.CHEATCAVE_NEWS);
    const marco = (s: typeof boy) =>
      s.CHEATCAVE_THREADS[1]?.posts.find((p) => p.day === 3)?.text;
    expect(marco(girl)).toMatch(/she doesnt/);
    expect(marco(boy)).toMatch(/he doesnt/);
    const de = (gender: 'girl' | 'boy') =>
      getSiteText(CHEATCAVE_HOST, 'de', gender);
    expect(marco(de('girl'))).toMatch(/meine kleine cousine/);
    expect(marco(de('boy'))).toMatch(/mein kleiner cousin/);
    expect(de('boy').CHEATCAVE_TEXT.welcome).toMatch(/^hey alter/);
  });
});
