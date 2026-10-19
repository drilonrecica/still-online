import { describe, expect, it } from 'vitest';
import { resolveGender } from '@/content/gender';
import type {
  PlayerProfile,
  ProfileContent,
} from '@/content/friendspace/profiles/types';
import {
  DEFAULT_PLAYER_PROFILE,
  THEME_PRESETS,
} from '@/content/sites/friendspace';
import {
  cleanProfile,
  dayLabel,
  effectiveProfile,
  extraColors,
  fillName,
  hasUnreadBulletins,
  moveTop8,
  cleanTop8,
  mergeWall,
  normalizeTop8,
  top8Candidates,
  top8WallComments,
  playerTheme,
  playerWall,
  profileName,
  savedProfile,
  shortDate,
  trackLabel,
  visibleBulletins,
  visibleComments,
} from './logic';

const c = (id: string) => ({ kind: 'contact' as const, id });

const base: PlayerProfile = {
  ...resolveGender(DEFAULT_PLAYER_PROFILE, 'girl'),
  top8: [c('jess'), c('pia')],
};

describe('friendspace logic', () => {
  it('shows comments up to the current day, newest first', () => {
    const comments = [
      { day: 1, from: 'a', text: '1a' },
      { day: 3, from: 'b', text: '3' },
      { day: 1, from: 'c', text: '1b' },
      { day: 2, from: 'd', text: '2' },
    ];
    expect(visibleComments(comments, 2).map((c) => c.text)).toEqual([
      '2',
      '1b',
      '1a',
    ]);
    expect(visibleComments(comments, 9).map((c) => c.text)).toEqual([
      '3',
      '2',
      '1b',
      '1a',
    ]);
  });

  it('collects friends comments on the player by day', () => {
    const p = (id: string, days: number[]) =>
      ({
        contactId: id,
        commentsOnPlayer: days.map((d) => ({ day: d, text: `${id}${d}` })),
      }) as unknown as ProfileContent;
    const wall = playerWall([p('jess', [2, 4]), p('dex', [3])], 3);
    expect(wall.map((c) => c.text)).toEqual(['dex3', 'jess2']);
    expect(wall[0]).toMatchObject({ contactId: 'dex', from: 'dex' });
    expect(playerWall([p('jess', [2])], 1)).toEqual([]);
  });

  it('labels days and dates', () => {
    expect(dayLabel(3, 3)).toBe('today');
    expect(dayLabel(2, 3)).toBe('yesterday');
    expect(dayLabel(1, 4)).toBe('3 days ago');
    expect(shortDate(new Date(2007, 9, 5))).toBe('10/5/2007');
    expect(profileName('kayla')).toBe('Kayla');
    expect(fillName('hi {name} {name}', 'Ada')).toBe('hi Ada Ada');
  });

  it('labels playlist tracks only', () => {
    expect(trackLabel('cool-rock')).toBe('Kevin MacLeod - Cool Rock');
    expect(trackLabel('nope')).toBeNull();
    expect(trackLabel(null)).toBeNull();
  });

  it('gives extras stable colours', () => {
    expect(extraColors('biscuit')).toEqual(extraColors('biscuit'));
    expect(extraColors('biscuit')).not.toEqual(extraColors('stardust'));
  });

  it('normalises the Top 8 and moves entries', () => {
    expect(
      normalizeTop8(
        [c('pia'), c('ghost'), c('pia'), c('jess')],
        ['jess', 'pia', 'dex'],
      ),
    ).toEqual([c('pia'), c('jess'), c('dex')]);
    const band = { kind: 'band' as const, id: 'tinfoil-comets' };
    const extra = { kind: 'extra' as const, name: 'Lexi', seed: 'lexi' };
    expect(
      normalizeTop8(
        [band, c('jess'), extra, band, { ...extra }],
        ['jess', 'pia'],
      ),
    ).toEqual([band, c('jess'), extra, c('pia')]);
    expect(
      normalizeTop8(
        Array.from({ length: 8 }, (_, i) => ({
          kind: 'extra' as const,
          name: `x${i}`,
          seed: `x${i}`,
        })),
        ['jess'],
      ),
    ).toHaveLength(8);
    expect(moveTop8(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveTop8(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveTop8(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('falls back to the starting profile until the player saves one', () => {
    expect(effectiveProfile(null, ['jess', 'dex'])).toEqual({
      ...resolveGender(DEFAULT_PLAYER_PROFILE, 'girl'),
      top8: [c('jess'), c('dex')],
    });
    // A saved Top 8 keeps its order and is not refilled, so friends can be removed (P1-05).
    expect(effectiveProfile(base, ['dex', 'pia', 'jess']).top8).toEqual([
      c('jess'),
      c('pia'),
    ]);
    expect(cleanTop8([c('pia'), c('ghost'), c('pia')], ['pia'])).toEqual([
      c('pia'),
    ]);
  });

  it('starts a girl on pink glitter and a boy on midnight', () => {
    const girl = effectiveProfile(null, [], 'en', 'girl');
    const boy = effectiveProfile(null, [], 'en', 'boy');
    expect(girl).toMatchObject({
      themePreset: 'glitter',
      headline: 'new 2 Friendspace!! ~*sparkle*~ <3',
      mood: { text: 'giggly', emoticon: ':D' },
    });
    expect(boy).toMatchObject({
      themePreset: 'midnight',
      headline: 'new to Friendspace. skate all day',
      mood: { text: 'pumped', emoticon: '(8)' },
    });
    expect(effectiveProfile(null, [], 'de', 'boy')).toMatchObject({
      themePreset: 'midnight',
      headline: 'neu auf Friendspace. skaten bis zum umfallen',
      mood: { text: 'voll motiviert' },
    });
    // A saved profile wins over the gender's preset.
    expect(effectiveProfile(base, [], 'en', 'boy').themePreset).toBe('glitter');
  });

  it('saves only what the player typed; absent fields follow the language and gender', () => {
    const girlEn = effectiveProfile(null, ['jess'], 'en', 'girl');
    const defaults = { ...girlEn, top8: undefined };
    // Untouched defaults (only a layout pasted) are left out of the save.
    const pasted = savedProfile(
      { ...girlEn, layoutCode: '[layout bg=starry]' },
      defaults,
    );
    for (const k of ['headline', 'mood', 'aboutMe', 'themePreset'])
      expect(pasted).not.toHaveProperty(k);
    expect(pasted.layoutCode).toBe('[layout bg=starry]');
    expect(effectiveProfile(pasted, ['jess'], 'de', 'boy')).toMatchObject({
      headline: 'neu auf Friendspace. skaten bis zum umfallen',
      mood: { text: 'voll motiviert', emoticon: '(8)' },
      themePreset: 'midnight',
      layoutCode: '[layout bg=starry]',
    });
    // Typed fields stay, whatever the language and gender.
    const typed = savedProfile(
      { ...girlEn, headline: 'mine', mood: { text: 'giggly', emoticon: ':)' } },
      defaults,
    );
    expect(typed).toMatchObject({
      headline: 'mine',
      mood: { text: 'giggly', emoticon: ':)' },
    });
    expect(typed).not.toHaveProperty('aboutMe');
    expect(effectiveProfile(typed, [], 'de', 'boy')).toMatchObject({
      headline: 'mine',
      mood: { text: 'giggly', emoticon: ':)' },
    });
  });

  it('cleans edits before saving', () => {
    const cleaned = cleanProfile({
      ...base,
      headline: '  hi  ',
      mood: { text: 'x'.repeat(50), emoticon: ':P' },
      songTrackId: 'missing',
      themePreset: 'custom',
      customColors: { background: 'red', text: '#000000' },
    });
    expect(cleaned.headline).toBe('hi');
    expect(cleaned.mood.text).toHaveLength(24);
    expect(cleaned.songTrackId).toBeNull();
    expect(cleaned.themePreset).toBe('default');
    expect(cleaned.customColors).toBeNull();
    expect(cleanProfile({ ...base, themePreset: 'bogus' }).themePreset).toBe(
      'default',
    );
    const extras = {
      layoutCode: '[layout bg=starry]',
      autoplay: false,
      moodHistory: [{ text: 'meh', emoticon: ':(', day: 2 }],
    };
    expect(cleanProfile({ ...base, ...extras })).toMatchObject(extras);
    expect(cleanProfile(base)).not.toHaveProperty('layoutCode');
  });

  it('resolves presets and custom colours to a theme', () => {
    expect(THEME_PRESETS).toHaveLength(6);
    expect(playerTheme({ ...base, themePreset: 'midnight' }).background).toBe(
      '#0b0b0b',
    );
    const custom = playerTheme({
      ...base,
      themePreset: 'custom',
      customColors: { background: '#112233', text: '#ffeedd' },
    });
    expect(custom).toMatchObject({ background: '#112233', text: '#ffeedd' });
  });
});

describe('bulletins', () => {
  const b = (id: string, day: number) => ({
    id,
    day,
    from: { extra: 'x', seed: 'x' },
    subject: id,
    body: id,
  });
  const list = [b('a', 1), b('b', 2), b('c', 2), b('d', 3)];

  it('day-gates and lists newest day first, content order within a day', () => {
    expect(visibleBulletins(list, 2).map((x) => x.id)).toEqual(['b', 'c', 'a']);
    expect(visibleBulletins(list, 0)).toEqual([]);
  });

  it('shows the dot only for an unseen day that has a bulletin', () => {
    expect(hasUnreadBulletins(list, 2, undefined)).toBe(true);
    expect(hasUnreadBulletins(list, 2, 1)).toBe(true);
    expect(hasUnreadBulletins(list, 2, 2)).toBe(false);
    expect(hasUnreadBulletins(list, 4, 3)).toBe(false); // nothing posted on day 4
    expect(hasUnreadBulletins([], 1, undefined)).toBe(false);
  });

  it('turns Top 8 wall entries into comments and merges them newest first', () => {
    const reactions = [{ contactId: 'kayla', dropped: 'd', readded: 'r' }];
    const wall = top8WallComments(
      [
        { contactId: 'kayla', kind: 'dropped', day: 2 },
        { contactId: 'kayla', kind: 'readded', day: 3 },
        { contactId: 'ghost', kind: 'dropped', day: 3 },
      ],
      reactions,
    );
    expect(wall.map((w) => [w.day, w.text])).toEqual([
      [2, 'd'],
      [3, 'r'],
    ]);
    const other = { day: 3, from: 'jess', contactId: 'jess', text: 'hi' };
    expect(mergeWall([other], wall).map((w) => w.text)).toEqual([
      'r',
      'hi',
      'd',
    ]);
  });

  it('offers friends, then bands, then distinct extras', () => {
    const out = top8Candidates(['jess'], ['b1'], [
      {
        top8: [
          { kind: 'extra', name: 'Lexi', seed: 'lexi' },
          { kind: 'player' },
        ],
      },
      { top8: [{ kind: 'extra', name: 'Lexi', seed: 'lexi' }] },
    ] as never);
    expect(out.map((e) => e.kind)).toEqual(['contact', 'band', 'extra']);
  });
});
