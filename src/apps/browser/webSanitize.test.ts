import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_PROFILE } from '@/content/sites/friendspace';
import { V04_PROFILE_DEFAULTS } from './legacyProfile';
import {
  DEFAULT_FAVORITES,
  WEB_DEFAULTS,
  sanitizeWeb,
  useWebStore,
} from './store';
import {
  PIXLOG_DEFAULTS,
  pixlogSkinFor,
  WEB_LIMITS,
  sanitizeAlbum,
  sanitizeAutoplay,
  sanitizeBulletinsSeen,
  sanitizeLayoutCode,
  sanitizeMoodHistory,
  sanitizePixlog,
  sanitizeTop8,
  sanitizeTop8Wall,
} from './webSanitize';

const web = () => useWebStore.getState();
const profile = { ...DEFAULT_PLAYER_PROFILE, top8: ['jess'] };

beforeEach(() => {
  localStorage.clear();
  useWebStore.setState({
    ...WEB_DEFAULTS,
    favorites: [...DEFAULT_FAVORITES],
    bulletinsSeen: undefined,
    top8Wall: undefined,
    pixlog: undefined,
  });
});

describe('sanitizeTop8', () => {
  it('migrates v0.3 contact ids to typed entries', () => {
    expect(sanitizeTop8(['pia', 'jess'])).toEqual([
      { kind: 'contact', id: 'pia' },
      { kind: 'contact', id: 'jess' },
    ]);
  });

  it('keeps bands and extras, drops unknown kinds and ids, dedupes', () => {
    expect(
      sanitizeTop8([
        'ghost',
        { kind: 'contact', id: 'kayla' },
        'kayla',
        { kind: 'band', id: 'tinfoil-comets' },
        { kind: 'band', id: 'no-such-band' },
        { kind: 'extra', name: 'Lexi', seed: 'lexi' },
        { kind: 'extra', name: 'Lexi again', seed: 'lexi' },
        { kind: 'extra', name: '', seed: 'x' },
        { kind: 'player' },
        { kind: 'robot', id: 'jess' },
        42,
        null,
      ]),
    ).toEqual([
      { kind: 'contact', id: 'kayla' },
      { kind: 'band', id: 'tinfoil-comets' },
      { kind: 'extra', name: 'Lexi', seed: 'lexi' },
    ]);
  });

  it('keeps at most 8 entries and tolerates non-arrays', () => {
    const extras = Array.from({ length: 12 }, (_, i) => ({
      kind: 'extra',
      name: `x${i}`,
      seed: `x${i}`,
    }));
    expect(sanitizeTop8(extras)).toHaveLength(WEB_LIMITS.top8);
    expect(sanitizeTop8('jess')).toEqual([]);
    expect(sanitizeTop8(undefined)).toEqual([]);
  });
});

describe('profile extras', () => {
  it('layoutCode: strings capped at 2000 chars, anything else dropped', () => {
    expect(sanitizeLayoutCode('[cursor sparkle]')).toBe('[cursor sparkle]');
    expect(sanitizeLayoutCode('x'.repeat(5000))).toHaveLength(2000);
    expect(sanitizeLayoutCode(7)).toBeUndefined();
  });

  it('autoplay: booleans only', () => {
    expect(sanitizeAutoplay(false)).toBe(false);
    expect(sanitizeAutoplay('no')).toBeUndefined();
  });

  it('moodHistory: valid entries, newest first, at most 5', () => {
    const m = (day: number) => ({ text: `m${day}`, emoticon: ':)', day });
    expect(
      sanitizeMoodHistory([
        m(5),
        { text: 'x', emoticon: ':)', day: 0 },
        { text: 1, emoticon: ':)', day: 2 },
        m(4),
        m(3),
        m(2),
        m(1),
        m(1),
      ]),
    ).toEqual([m(5), m(4), m(3), m(2), m(1)]);
    expect(sanitizeMoodHistory({})).toBeUndefined();
  });

  it('sanitizeWeb keeps valid extras on the profile and drops bad ones', () => {
    const out = sanitizeWeb(
      {
        myProfile: {
          ...profile,
          layoutCode: '[layout bg=starry]',
          autoplay: 'yes',
          moodHistory: [{ text: 'hi', emoticon: ':D', day: 2 }],
        },
      },
      WEB_DEFAULTS,
    );
    expect(out.myProfile).toEqual({
      ...DEFAULT_PLAYER_PROFILE,
      top8: [{ kind: 'contact', id: 'jess' }],
      layoutCode: '[layout bg=starry]',
      moodHistory: [{ text: 'hi', emoticon: ':D', day: 2 }],
    });
  });

  it('a profile without a top8 keeps the rest with an empty Top 8', () => {
    const { top8: _, ...noTop8 } = profile;
    void _;
    expect(
      sanitizeWeb({ myProfile: noTop8 }, WEB_DEFAULTS).myProfile?.top8,
    ).toEqual([]);
  });
});

describe('profile default text (v0.4.1 migration)', () => {
  // What v0.4 saved for each side (girl/boy × en/de) when only a layout was pasted.
  const V04_SAVES = [0, 1, 2, 3].map((i) => ({
    headline: V04_PROFILE_DEFAULTS.headline[i],
    mood: V04_PROFILE_DEFAULTS.mood[i],
    aboutMe: V04_PROFILE_DEFAULTS.aboutMe[i],
    songTrackId: null,
    themePreset: 'glitter',
    customColors: null,
    top8: [],
    layoutCode: '[layout bg=starry]',
  }));

  it('v0.4 defaults are the shipped ones', () => {
    // F-02 may change today's defaults; this table must keep what v0.4 actually saved.
    expect(V04_SAVES[0]).toMatchObject({
      headline: 'new 2 Friendspace!! ~*sparkle*~ <3',
      mood: { text: 'giggly', emoticon: ':D' },
    });
    expect(V04_SAVES[3]).toMatchObject({
      headline: 'neu auf Friendspace. skaten bis zum umfallen',
      mood: { text: 'voll motiviert', emoticon: '(8)' },
    });
  });

  it('drops a saved headline, mood or about me equal to any default (girl/boy × en/de)', () => {
    for (const save of V04_SAVES) {
      const out = sanitizeWeb({ myProfile: save }, WEB_DEFAULTS).myProfile;
      for (const k of ['headline', 'mood', 'aboutMe'])
        expect(out, save.headline).not.toHaveProperty(k);
      expect(out).toMatchObject({ layoutCode: '[layout bg=starry]' });
    }
  });

  it('keeps typed text and a changed mood emoticon', () => {
    const out = sanitizeWeb(
      {
        myProfile: {
          ...V04_SAVES[0],
          headline: 'still online',
          mood: { text: 'giggly', emoticon: ':)' },
          aboutMe: 'hi its me',
        },
      },
      WEB_DEFAULTS,
    ).myProfile;
    expect(out).toMatchObject({
      headline: 'still online',
      mood: { text: 'giggly', emoticon: ':)' },
      aboutMe: 'hi its me',
      themePreset: 'glitter',
    });
  });
});

describe('bulletinsSeen', () => {
  it('accepts a day, drops anything else', () => {
    expect(sanitizeBulletinsSeen(3)).toBe(3);
    for (const bad of [0, -1, 2.5, '3', null])
      expect(sanitizeBulletinsSeen(bad)).toBeUndefined();
    expect(
      sanitizeWeb({ bulletinsSeen: 'x' }, WEB_DEFAULTS),
    ).not.toHaveProperty('bulletinsSeen');
    expect(sanitizeWeb({ bulletinsSeen: 4 }, WEB_DEFAULTS).bulletinsSeen).toBe(
      4,
    );
  });

  it('markBulletinsSeen only moves forward', () => {
    web().markBulletinsSeen(2);
    web().markBulletinsSeen(1);
    expect(web().bulletinsSeen).toBe(2);
    web().markBulletinsSeen(4);
    expect(web().bulletinsSeen).toBe(4);
  });
});

describe('top8Wall', () => {
  it('keeps valid entries for known friends, oldest first, capped', () => {
    expect(
      sanitizeTop8Wall([
        { contactId: 'kayla', kind: 'dropped', day: 2 },
        { contactId: 'ghost', kind: 'dropped', day: 2 },
        { contactId: 'kayla', kind: 'sulked', day: 2 },
        { contactId: 'kayla', kind: 'readded', day: 0 },
        { contactId: 'kayla', kind: 'readded', day: 3 },
      ]),
    ).toEqual([
      { contactId: 'kayla', kind: 'dropped', day: 2 },
      { contactId: 'kayla', kind: 'readded', day: 3 },
    ]);
    const many = Array.from({ length: 60 }, (_, i) => ({
      contactId: 'jess',
      kind: 'dropped',
      day: (i % 5) + 1,
    }));
    expect(sanitizeTop8Wall(many)).toHaveLength(WEB_LIMITS.top8Wall);
    expect(sanitizeTop8Wall('x')).toBeUndefined();
  });

  it('appendTop8Wall appends and persists', () => {
    web().appendTop8Wall({ contactId: 'kayla', kind: 'dropped', day: 2 });
    web().appendTop8Wall({ contactId: 'kayla', kind: 'readded', day: 3 });
    expect(web().top8Wall?.map((e) => e.kind)).toEqual(['dropped', 'readded']);
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:web') ?? '{}',
    );
    expect(saved.state.top8Wall).toHaveLength(2);
  });
});

describe('pixlog', () => {
  it('sanitizes each part on its own with defaults', () => {
    expect(sanitizePixlog('x')).toBeUndefined();
    expect(sanitizePixlog({})).toEqual(PIXLOG_DEFAULTS);
    expect(
      sanitizePixlog({
        skin: 'plaid',
        album: [{ fsNodeId: 'seed:camp', caption: 'camp!!' }, { fsNodeId: 3 }],
        surveys: { 'this-or-that': ['a', 4, 'x'.repeat(200)], bad: 'nope' },
        kudosGiven: { jess: [3, 1, 3, 0, 'x'], ghost: [1], pia: 'x' },
      }),
    ).toEqual({
      album: [{ fsNodeId: 'seed:camp', caption: 'camp!!' }],
      surveys: { 'this-or-that': ['a', '', 'x'.repeat(80)] },
      kudosGiven: { jess: [1, 3] },
    });
    expect(sanitizePixlog({ skin: 'night' })?.skin).toBe('night');
  });

  it('an unpicked skin follows the gender; a picked one stays', () => {
    expect(pixlogSkinFor(undefined, 'girl')).toBe('bubblegum');
    expect(pixlogSkinFor(undefined, 'boy')).toBe('night');
    expect(pixlogSkinFor({ ...PIXLOG_DEFAULTS }, 'boy')).toBe('night');
    expect(pixlogSkinFor({ ...PIXLOG_DEFAULTS, skin: 'lime' }, 'boy')).toBe(
      'lime',
    );
  });

  it('album: deduped by file, captions ≤ 80, at most 24', () => {
    const album = Array.from({ length: 30 }, (_, i) => ({
      fsNodeId: `f:${i % 26}`,
      caption: 'c'.repeat(100),
    }));
    const out = sanitizeAlbum(album);
    expect(out).toHaveLength(WEB_LIMITS.album);
    expect(new Set(out.map((e) => e.fsNodeId)).size).toBe(24);
    expect(out[0]?.caption).toHaveLength(80);
  });

  it('setPixlogSkin, setAlbum and saveSurvey update and persist', () => {
    web().setPixlogSkin('lime');
    web().setPixlogSkin('plaid' as never);
    web().setAlbum([
      { fsNodeId: 'f:1', caption: 'me' },
      { fsNodeId: 'f:1', caption: 'dupe' },
    ]);
    web().saveSurvey('this-or-that', ['pizza', 'x'.repeat(90)]);
    expect(web().pixlog).toEqual({
      skin: 'lime',
      album: [{ fsNodeId: 'f:1', caption: 'me' }],
      surveys: { 'this-or-that': ['pizza', 'x'.repeat(80)] },
      kudosGiven: {},
    });
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:web') ?? '{}',
    );
    expect(saved.state.pixlog.skin).toBe('lime');
  });

  it('giveKudos: once per friend per day', () => {
    expect(web().giveKudos('jess', 2)).toBe(true);
    expect(web().giveKudos('jess', 2)).toBe(false);
    expect(web().giveKudos('jess', 3)).toBe(true);
    expect(web().giveKudos('pia', 2)).toBe(true);
    expect(web().giveKudos('ghost', 2)).toBe(false);
    expect(web().giveKudos('pia', 0)).toBe(false);
    expect(web().pixlog?.kudosGiven).toEqual({ jess: [2, 3], pia: [2] });
  });
});
