// Week two on the sites (bible §5, §8): every site keeps its days 1–5 rate on days 6–10, and the
// cross-links the friends' chats point at are there on their day. Structure in every language and
// gender; story text in English (German shows English placeholders until W3).
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { GENDERS } from '../gender';
import { getSiteText } from '../locale';
import { contentDays } from '../storyDays';
import { CHEATCAVE_HOST } from './cheatcave';
import { GOSSIP_HOST } from './celebgossip07';
import { KICKFLIP_HOST } from './kickflipkings';
import { TINFOIL_HOST } from './tinfoilcomets';
import { WESTFIELD_HOST } from './westfieldhigh';

const WEEK2 = contentDays('sites').filter((d) => d > 5);
const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);
const count = <T extends { day: number }>(items: readonly T[], day: number) =>
  items.filter((i) => i.day === day).length;
const onDay = <T extends { day: number }>(items: readonly T[], day: number) =>
  items.filter((i) => i.day === day);

it('week two is days 6–10', () => {
  expect(WEEK2).toEqual([6, 7, 8, 9, 10]);
});

describe.each(COMBOS)('week-two posting rate (%s, %s)', (locale, gender) => {
  const gossip = getSiteText(GOSSIP_HOST, locale, gender);
  const school = getSiteText(WESTFIELD_HOST, locale, gender);
  const tinfoil = getSiteText(TINFOIL_HOST, locale, gender);
  const cave = getSiteText(CHEATCAVE_HOST, locale, gender);
  const kings = getSiteText(KICKFLIP_HOST, locale, gender);

  it.each(WEEK2)('day %i', (day) => {
    expect(count(gossip.GOSSIP_POSTS, day), 'gossip posts').toBe(2);
    expect(count(gossip.GOSSIP_POLLS, day), 'gossip poll').toBe(1);
    expect(count(school.WESTFIELD_NEWS, day), 'school news').toBe(2);
    const marquee = count(tinfoil.TINFOIL_NEWS, day);
    expect(marquee, 'tinfoil news').toBeGreaterThanOrEqual(1);
    expect(marquee, 'tinfoil news').toBeLessThanOrEqual(2);
    expect(count(tinfoil.TINFOIL_GUESTBOOK, day), 'guestbook').toBe(2);
    const caveNews = count(cave.CHEATCAVE_NEWS, day);
    expect(caveNews, 'cheatcave news').toBeGreaterThanOrEqual(1);
    expect(caveNews, 'cheatcave news').toBeLessThanOrEqual(2);
    expect(count(kings.KICKFLIP_NEWS, day), 'kickflip news').toBe(1);
    const shouts = count(kings.KICKFLIP_SHOUTS, day);
    expect(shouts, 'shouts').toBeGreaterThanOrEqual(3);
    expect(shouts, 'shouts').toBeLessThanOrEqual(4);
  });

  it('keeps the same week-two shape as English', () => {
    expect(gossip.GOSSIP_POSTS.map((p) => [p.id, p.day, p.tags])).toEqual(
      getSiteText(GOSSIP_HOST, 'en', gender).GOSSIP_POSTS.map((p) => [
        p.id,
        p.day,
        p.tags,
      ]),
    );
    expect(tinfoil.TINFOIL_PICS.map((p) => [p.day, p.seed, p.scene])).toEqual(
      getSiteText(TINFOIL_HOST, 'en', gender).TINFOIL_PICS.map((p) => [
        p.day,
        p.seed,
        p.scene,
      ]),
    );
    expect(cave.CHEATCAVE_CLIPS.map((c) => [c.id, c.day, c.views])).toEqual(
      getSiteText(CHEATCAVE_HOST, 'en', gender).CHEATCAVE_CLIPS.map((c) => [
        c.id,
        c.day,
        c.views,
      ]),
    );
  });
});

describe.each(GENDERS)('week-two story on the sites (en, %s)', (gender) => {
  const text = (items: readonly { day: number }[], day: number) =>
    JSON.stringify(onDay(items, day));

  it('Westfield High: the art wall, the election, the show listing (X11, X13–X15, X18, X35)', () => {
    const { WESTFIELD_NEWS: news } = getSiteText(WESTFIELD_HOST, 'en', gender);
    expect(text(news, 6)).toMatch(/Theo K\..*Room 12|Room 12.*Theo K\./);
    expect(text(news, 6)).toMatch(/Sign-Ups Tomorrow/);
    expect(text(news, 7)).toMatch(/Kayla and Brianna/);
    expect(text(news, 7)).toMatch(/east hallway/);
    const board = onDay(news, 8).find((n) => n.title.includes('Rec Hall'));
    expect(board?.author).toMatch(/Mr Pruitt/);
    for (const fact of [
      'Velvet Lantern',
      'Saturday',
      'Doors open at 6',
      'All ages',
      'The Grip Tapes',
      'Mr Dalton',
      'Theo K.',
    ])
      expect(board?.body).toContain(fact);
    expect(text(news, 9)).toMatch(/61 votes/);
    expect(text(news, 9)).toMatch(/Mystery Loaf/);
    const coreps = onDay(news, 10).find((n) => n.title.includes('Co-Rep'));
    expect(coreps?.body).toMatch(/Kayla and Brianna/);
    expect(text(news, 10)).toMatch(
      /I poked the bucket\. It is a paint bucket\./,
    );
  });

  it('Tinfoil Comets: the contest, Lakeview sold out, the winners, the pick (X3, X5, X6, X8, X9)', () => {
    const site = getSiteText(TINFOIL_HOST, 'en', gender);
    const pia = 'pia (L) ponies (L)';
    const jess = 'xX~JeSs~Xx :D';
    expect(
      onDay(site.TINFOIL_GUESTBOOK, 6).find((e) => e.name === pia)?.message,
    ).toMatch(/i am getting one \(maybe\)/);
    expect(text(site.TINFOIL_NEWS, 7)).toMatch(/FAN ART CONTEST/);
    expect(
      onDay(site.TINFOIL_GUESTBOOK, 7).find((e) => e.name === jess)?.message,
    ).toMatch(/glitter collage/i);
    expect(text(site.TINFOIL_NEWS, 8)).toMatch(/SOLD OUT in 9 MIN/);
    const lakeview = site.TINFOIL_TOUR.find((t) =>
      t.venue.startsWith('Lakeview'),
    );
    expect(lakeview?.soldOut?.day).toBe(8);
    expect(lakeview?.soldOut?.note).toMatch(/SOLD OUT\. 9 minutes/);
    expect(lakeview?.after?.day).toBe(10);
    expect(text(site.TINFOIL_NEWS, 9)).toMatch(/CONTEST WINNERS/);
    const winners = onDay(site.TINFOIL_PICS, 9);
    expect(winners.map((p) => p.caption)).toEqual([
      expect.stringMatching(/^1ST.*macaroni keytar/),
      expect.stringMatching(/^2ND.*jess/),
      expect.stringMatching(/^3RD.*kevin the robot/),
    ]);
    expect(
      onDay(site.TINFOIL_GUESTBOOK, 9).find((e) => e.name === jess)?.message,
    ).toMatch(/^2ND!!! I LOST TO PASTA AND IM OK/);
    expect(text(site.TINFOIL_NEWS, 10)).toMatch(/lakeview was TONIGHT/);
    const marco = onDay(site.TINFOIL_GUESTBOOK, 10).find(
      (e) => e.name === 'marco',
    );
    expect(marco?.message).toMatch(/the pick was mine/);
    for (const e of site.TINFOIL_GUESTBOOK.filter(
      (e) => e.name === jess && e.day > 5,
    ))
      expect(e.message.replace(/\(L\)/g, '')).toBe(
        e.message.replace(/\(L\)/g, '').toUpperCase(),
      );
  });

  it('Celeb Gossip 07: bangs season, Lakeview in 9 minutes, the hat (X6, X11)', () => {
    const { GOSSIP_POSTS: posts } = getSiteText(GOSSIP_HOST, 'en', gender);
    expect(text(posts, 7)).toMatch(/BANGS SEASON/);
    expect(text(posts, 8)).toMatch(/Lakeview Fairgrounds in 9 MINUTES/);
    expect(text(posts, 9)).toMatch(/TIE/);
    expect(text(posts, 10)).toMatch(/hat BLOWS AWAY/);
  });

  it('CheatCave: Marco, Theo, Dex and Kev on their days; the upside-down mic is #1 on day 10 (X23, X33)', () => {
    const site = getSiteText(CHEATCAVE_HOST, 'en', gender);
    const posts = site.CHEATCAVE_THREADS.flatMap((t) => t.posts);
    const by = (user: string, day: number) =>
      posts.find((p) => p.user === user && p.day === day)?.text;
    expect(by('marco.bassline', 7)).toBe(
      'lan rematch tonight. pc. so pc wins this week',
    );
    expect(by('theo_k', 8)).toMatch(/drawing a poster for a band\. sorry$/);
    expect(by('dex.kickflip', 9)).toMatch(/on tape this time\. kev has it/);
    expect(by('Kickflip_Kev', 10)).toMatch(/i was there/);
    const mic = site.CHEATCAVE_CLIPS.find((c) => c.id === 'upside-down-mic');
    expect(mic).toMatchObject({ day: 10, uploader: 'derek_drums' });
    expect(mic?.photo.scene).toBe('stage');
    const top = Math.max(...site.CHEATCAVE_CLIPS.map((c) => c.views));
    expect(mic?.views).toBe(top);
  });

  it('Kickflip Kings: views, the Jam, 3rd place, the rec hall (X4, X24, X30, X31, X33)', () => {
    const site = getSiteText(KICKFLIP_HOST, 'en', gender);
    expect(site.KICKFLIP_VIDEO.views).toEqual([
      { day: 6, views: 41 },
      { day: 7, views: 58 },
      { day: 8, views: 77 },
      { day: 9, views: 140 },
      { day: 10, views: 212 },
    ]);
    expect(site.KICKFLIP_VIDEO.clip).toMatchObject({ day: 9, length: '0:06' });
    expect(text(site.KICKFLIP_NEWS, 6)).toMatch(/41 VIEWS/);
    expect(text(site.KICKFLIP_NEWS, 7)).toMatch(/THE WESTFIELD JAM/);
    expect(text(site.KICKFLIP_NEWS, 9)).toMatch(
      /sam 1st, big mike 2nd, DEX 3RD/,
    );
    expect(
      onDay(site.KICKFLIP_SHOUTS, 8).find((s) => s.user === 'dex.kickflip')
        ?.text,
    ).toBe('practicing. dont shout at me');
    const dex = site.KICKFLIP_CREW.find((m) => m.handle === 'dex.kickflip');
    expect(dex?.after?.day).toBe(4);
    expect(dex?.later).toEqual({
      day: 9,
      bestTrick: 'kickflip. LANDED. on tape. 3rd at the jam',
    });
    const next = site.KICKFLIP_GIGS.find((g) => g.id === 'velvet-lantern-next');
    expect(next?.moved).toMatchObject({
      day: 6,
      venue: 'the westfield rec hall',
    });
    expect(next?.updates?.map((u) => u.day)).toEqual([6, 8]);
    expect(next?.updates?.[1]?.text).toMatch(/The Grip Tapes open/);
    expect(next?.after).toMatchObject({ day: 10 });
    expect(next?.after?.note).toMatch(/83 ppl/);
  });
});
