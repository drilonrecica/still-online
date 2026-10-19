import { describe, expect, it } from 'vitest';
import { resolveGender } from '@/content/gender';
import type { PlayerProfile, ProfileContent } from '@/content/profiles/types';
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
  moveTop8,
  normalizeTop8,
  playerTheme,
  playerWall,
  profileName,
  shortDate,
  trackLabel,
  visibleComments,
} from './logic';

const base: PlayerProfile = {
  ...resolveGender(DEFAULT_PLAYER_PROFILE, 'girl'),
  top8: ['jess', 'pia'],
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
      normalizeTop8(['pia', 'ghost', 'pia', 'jess'], ['jess', 'pia', 'dex']),
    ).toEqual(['pia', 'jess', 'dex']);
    expect(moveTop8(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveTop8(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveTop8(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('falls back to the starting profile until the player saves one', () => {
    expect(effectiveProfile(null, ['jess', 'dex'])).toEqual({
      ...resolveGender(DEFAULT_PLAYER_PROFILE, 'girl'),
      top8: ['jess', 'dex'],
    });
    expect(effectiveProfile(base, ['dex', 'pia', 'jess']).top8).toEqual([
      'jess',
      'pia',
      'dex',
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
