// Web Explorer's persisted `web` store: favorites, counters, guestbooks, votes, the Friendspace
// profile and (v0.4) bulletins, Top 8 wall and Pixlog. See docs/architecture-v0.2.md → "Stores"
// and docs/architecture-v0.4.md → "Saved state"; the v0.4 sanitizers live in ./webSanitize.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedPlayerProfile } from '@/content/friendspace/profiles/types';
import type { PixlogSkinId } from '@/content/pixlog/types';
import type {
  Favorite,
  PixlogState,
  PlayerGuestbookEntry,
  Top8WallEntry,
  WebState,
} from '@/content/sites/types';
import type { ContactId, FavoriteRecord } from '@/content/types';
import { getGender } from '@/i18n/settingsText';
import { translate } from '@/i18n/t';
import type { Locale, MessageKey } from '@/i18n/types';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import type { Gender } from '@/os/types';
import { LEGACY_DEFAULT_FAVORITE_NAMES } from './legacyHosts';
import {
  isV04DefaultAboutMe,
  isV04DefaultHeadline,
  isV04DefaultMood,
} from './legacyProfile';
import { savedTop8Contacts, top8Diff } from './top8Drama';
import { normalizeUrl } from './url';
import {
  PIXLOG_DEFAULTS,
  WEB_LIMITS,
  cleanSurveyAnswers,
  isContactId,
  isPixlogSkin,
  sanitizeAlbum,
  sanitizeAutoplay,
  sanitizeBulletinsSeen,
  sanitizeLayoutCode,
  sanitizeMoodHistory,
  sanitizePixlog,
  sanitizeTop8,
  sanitizeTop8Wall,
} from './webSanitize';

/** The default favorites' names, by url. */
const DEFAULT_FAVORITE_KEYS: Readonly<Record<string, MessageKey>> = {
  'http://searchly.example/': 'browser.defaultFavorites.searchly',
  'http://tinfoilcomets.example/': 'browser.defaultFavorites.tinfoilcomets',
  'http://friendspace.example/': 'browser.defaultFavorites.friendspace',
  'http://westfield-high.example/': 'browser.defaultFavorites.westfield-high',
  'http://celebgossip07.example/': 'browser.defaultFavorites.celebgossip07',
  'http://cheatcave.example/': 'browser.defaultFavorites.cheatcave',
  'http://kickflipkings.example/': 'browser.defaultFavorites.kickflipkings',
};

/**
 * Each gender's default favorites, by url. Both share Searchly, Friendspace and Westfield High;
 * the girl list is the v0.2/v0.3 default list unchanged, the boy list puts his two sites first.
 */
const DEFAULT_FAVORITE_URLS: Readonly<Record<Gender, readonly string[]>> = {
  girl: [
    'http://searchly.example/',
    'http://tinfoilcomets.example/',
    'http://friendspace.example/',
    'http://westfield-high.example/',
    'http://celebgossip07.example/',
  ],
  boy: [
    'http://searchly.example/',
    'http://cheatcave.example/',
    'http://kickflipkings.example/',
    'http://friendspace.example/',
    'http://westfield-high.example/',
  ],
};

/** Earlier default lists a save may still hold untouched: the v0.4 boy order. */
const LEGACY_DEFAULT_FAVORITE_URLS: readonly (readonly string[])[] = [
  [
    'http://searchly.example/',
    'http://cheatcave.example/',
    'http://friendspace.example/',
    'http://westfield-high.example/',
    'http://kickflipkings.example/',
  ],
];

/** Stored without a title: they are named in the current language (`favoriteTitle`). */
export const defaultFavoritesFor = (gender: Gender): FavoriteRecord[] =>
  DEFAULT_FAVORITE_URLS[gender].map((url) => ({ url }));

/** The girl defaults, which are also what v0.2/v0.3 saved and what a fresh store holds. */
export const DEFAULT_FAVORITES: readonly FavoriteRecord[] =
  defaultFavoritesFor('girl');

/**
 * Favorites the player never changed: exactly one gender's default list (which covers the old
 * v0.3 list, the girl one) or a legacy default list. They follow the gender; any add, rename,
 * removal or reorder makes them custom.
 */
export function isUntouchedFavorites(
  favorites: readonly FavoriteRecord[],
): boolean {
  return [
    ...Object.values(DEFAULT_FAVORITE_URLS),
    ...LEGACY_DEFAULT_FAVORITE_URLS,
  ].some(
    (urls) =>
      urls.length === favorites.length &&
      urls.every(
        (url, i) =>
          favorites[i]?.url === url && favorites[i]?.title === undefined,
      ),
  );
}

/** The favorites to show and edit for `gender`: untouched defaults become that gender's list. */
export const effectiveFavorites = (
  favorites: readonly FavoriteRecord[],
  gender: Gender,
): readonly FavoriteRecord[] =>
  isUntouchedFavorites(favorites) ? defaultFavoritesFor(gender) : favorites;

/** A favorite's title: the one the player added it with, else the default's name in `locale`. */
export function favoriteTitle(f: FavoriteRecord, locale: Locale): string {
  if (f.title !== undefined) return f.title;
  const key = DEFAULT_FAVORITE_KEYS[f.url];
  return key ? translate(locale, key) : f.url;
}

/** The favorites as the Favorites menu shows them, for `gender` and in `locale`. */
export const renderFavorites = (
  favorites: readonly FavoriteRecord[],
  locale: Locale,
  gender: Gender,
): Favorite[] =>
  effectiveFavorites(favorites, gender).map((f) => ({
    url: f.url,
    title: favoriteTitle(f, locale),
  }));

export const WEB_DEFAULTS: WebState = {
  favorites: [...DEFAULT_FAVORITES],
  counters: {},
  guestbook: {},
  votes: {},
  myProfile: null,
};

export interface WebStore extends WebState {
  /** Adds (or renames) the favorite for `url`. */
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (url: string) => void;
  /** Counts one visit to `host` and returns its new total. */
  hit: (host: string) => number;
  /** Appends a player entry to `host`'s guestbook. */
  signGuestbook: (host: string, entry: PlayerGuestbookEntry) => void;
  /**
   * Saves the player's Friendspace `/me` profile (only what they typed, `savedProfile`). Friends
   * it drops from or adds to the Top 8 go out as one `web:top8Changed` (Messenger's Top 8 drama, P0-03).
   */
  saveProfile: (profile: SavedPlayerProfile) => void;
  /** Records the player's answer to poll `pollId`; the first vote sticks ("u already voted!!"). */
  vote: (pollId: string, option: number) => void;
  /** Friendspace `/bulletins` was opened on `day` (the unread dot clears until a later day). */
  markBulletinsSeen: (day: number) => void;
  /** A friend reacted to a Top 8 drop or re-add (P0-03). */
  appendTop8Wall: (entry: Top8WallEntry) => void;
  setPixlogSkin: (skin: PixlogSkinId) => void;
  /** Replaces the player's Pixlog album (deduped, captions capped, max 24). */
  setAlbum: (album: PixlogState['album']) => void;
  saveSurvey: (surveyId: string, answers: readonly string[]) => void;
  /** One kudo per friend per day; returns false if already given that day. */
  giveKudos: (contactId: ContactId, day: number) => boolean;
}

const str = (v: unknown): v is string => typeof v === 'string';
const count = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;

/**
 * Favorites from untrusted data. A v0.2 favorite with a default's English url and name was never
 * renamed: it drops its title, so it follows the language. Renamed sites' urls redirect, and their
 * old default name counts as untouched too.
 */
function sanitizeFavorites(v: unknown): FavoriteRecord[] | null {
  if (!Array.isArray(v)) return null;
  const seen = new Set<string>();
  const out: FavoriteRecord[] = [];
  for (const f of v) {
    if (!isRecord(f) || !str(f.url) || f.url === '') continue;
    if (f.title !== undefined && !str(f.title)) continue;
    const url = normalizeUrl(f.url);
    if (seen.has(url)) continue;
    seen.add(url);
    const isDefaultName =
      f.title !== undefined &&
      url in DEFAULT_FAVORITE_KEYS &&
      (f.title === favoriteTitle({ url }, 'en') ||
        f.title === LEGACY_DEFAULT_FAVORITE_NAMES[f.url]);
    out.push(
      f.title === undefined || isDefaultName
        ? { url }
        : { url, title: f.title },
    );
  }
  return out;
}

function sanitizeCounts(v: unknown): Record<string, number> | null {
  if (!isRecord(v)) return null;
  const out: Record<string, number> = {};
  for (const [key, n] of Object.entries(v)) if (count(n)) out[key] = n;
  return out;
}

function sanitizeGuestbook(v: unknown): WebState['guestbook'] | null {
  if (!isRecord(v)) return null;
  const out: WebState['guestbook'] = {};
  for (const [host, entries] of Object.entries(v)) {
    if (!Array.isArray(entries)) continue;
    out[host] = entries.flatMap((e) =>
      isRecord(e) && str(e.name) && str(e.message)
        ? [
            {
              name: e.name,
              message: e.message,
              ...(str(e.homepage) ? { homepage: e.homepage } : {}),
              ...(count(e.day) && e.day >= 1 ? { day: e.day } : {}),
            },
          ]
        : [],
    );
  }
  return out;
}

/**
 * A saved `/me` profile. The default fields (headline, mood, about me, theme) are optional: absent
 * resolves to the defaults at render, and a v0.4 save's default text is migrated to absent.
 */
export function sanitizeProfile(v: unknown): SavedPlayerProfile | null {
  if (!isRecord(v)) return null;
  const { headline, mood, aboutMe, songTrackId, themePreset, customColors } = v;
  if (!(songTrackId === null || str(songTrackId))) return null;
  const colors =
    isRecord(customColors) &&
    str(customColors.background) &&
    str(customColors.text)
      ? { background: customColors.background, text: customColors.text }
      : null;
  const moodValue =
    isRecord(mood) && str(mood.text) && str(mood.emoticon)
      ? { text: mood.text, emoticon: mood.emoticon }
      : undefined;
  return {
    ...defined(
      'headline',
      str(headline) && !isV04DefaultHeadline(headline) ? headline : undefined,
    ),
    ...defined(
      'mood',
      moodValue && !isV04DefaultMood(moodValue) ? moodValue : undefined,
    ),
    ...defined(
      'aboutMe',
      str(aboutMe) && !isV04DefaultAboutMe(aboutMe) ? aboutMe : undefined,
    ),
    songTrackId,
    ...defined('themePreset', str(themePreset) ? themePreset : undefined),
    customColors: colors,
    top8: sanitizeTop8(v.top8),
    ...defined('layoutCode', sanitizeLayoutCode(v.layoutCode)),
    ...defined('autoplay', sanitizeAutoplay(v.autoplay)),
    ...defined('moodHistory', sanitizeMoodHistory(v.moodHistory)),
  };
}

/** `{ [key]: value }`, or nothing when `value` is undefined (optional fields stay absent). */
const defined = <K extends string, V>(key: K, value: V | undefined) =>
  (value === undefined ? {} : { [key]: value }) as Partial<Record<K, V>>;

/** An optional field: kept as is when absent from the save, else sanitized (dropped if bad). */
const optional = <K extends keyof WebState>(
  key: K,
  persisted: Record<string, unknown>,
  current: WebState,
  sanitize: (v: unknown) => WebState[K] | undefined,
) =>
  defined(
    key,
    persisted[key] === undefined ? current[key] : sanitize(persisted[key]),
  );

export function sanitizeWeb(persisted: unknown, current: WebState): WebState {
  if (!isRecord(persisted)) return current;
  return {
    favorites: sanitizeFavorites(persisted.favorites) ?? current.favorites,
    counters: sanitizeCounts(persisted.counters) ?? current.counters,
    guestbook: sanitizeGuestbook(persisted.guestbook) ?? current.guestbook,
    votes: sanitizeCounts(persisted.votes) ?? current.votes,
    myProfile:
      persisted.myProfile === undefined
        ? current.myProfile
        : sanitizeProfile(persisted.myProfile),
    ...optional('bulletinsSeen', persisted, current, sanitizeBulletinsSeen),
    ...optional('top8Wall', persisted, current, sanitizeTop8Wall),
    ...optional('pixlog', persisted, current, sanitizePixlog),
  };
}

const pixlogOf = (s: WebState): PixlogState => s.pixlog ?? PIXLOG_DEFAULTS;

export const useWebStore = create<WebStore>()(
  persist(
    (set, get) => ({
      ...WEB_DEFAULTS,
      hit: (host) => {
        const n = (get().counters[host] ?? 0) + 1;
        set((s) => ({ counters: { ...s.counters, [host]: n } }));
        return n;
      },
      signGuestbook: (host, entry) =>
        set((s) => ({
          guestbook: {
            ...s.guestbook,
            [host]: [...(s.guestbook[host] ?? []), entry],
          },
        })),
      saveProfile: (profile) => {
        const change = top8Diff(
          savedTop8Contacts(get().myProfile?.top8),
          profile.top8,
        );
        set({ myProfile: profile });
        if (change.dropped.length > 0 || change.added.length > 0)
          events.emit('web:top8Changed', change);
      },
      markBulletinsSeen: (day) =>
        set((s) =>
          Number.isInteger(day) && day > (s.bulletinsSeen ?? 0)
            ? { bulletinsSeen: day }
            : s,
        ),
      appendTop8Wall: (entry) =>
        set((s) => ({
          top8Wall: [...(s.top8Wall ?? []), entry].slice(-WEB_LIMITS.top8Wall),
        })),
      setPixlogSkin: (skin) =>
        set((s) =>
          isPixlogSkin(skin) ? { pixlog: { ...pixlogOf(s), skin } } : s,
        ),
      setAlbum: (album) =>
        set((s) => ({
          pixlog: { ...pixlogOf(s), album: sanitizeAlbum(album) },
        })),
      saveSurvey: (surveyId, answers) =>
        set((s) => {
          const p = pixlogOf(s);
          return {
            pixlog: {
              ...p,
              surveys: {
                ...p.surveys,
                [surveyId]: cleanSurveyAnswers(answers),
              },
            },
          };
        }),
      giveKudos: (contactId, day) => {
        const p = pixlogOf(get());
        const given = p.kudosGiven[contactId] ?? [];
        if (!isContactId(contactId) || !Number.isInteger(day) || day < 1)
          return false;
        if (given.includes(day)) return false;
        set({
          pixlog: {
            ...p,
            kudosGiven: { ...p.kudosGiven, [contactId]: [...given, day] },
          },
        });
        return true;
      },
      vote: (pollId, option) =>
        set((s) =>
          pollId in s.votes || !count(option)
            ? s
            : { votes: { ...s.votes, [pollId]: option } },
        ),
      // Edits start from what the player sees, so untouched defaults become this gender's list.
      addFavorite: ({ title, url }) =>
        set((s) => {
          const shown = effectiveFavorites(s.favorites, getGender());
          const key = normalizeUrl(url);
          const name = title.trim() || key;
          const at = shown.findIndex((f) => f.url === key);
          if (at === -1)
            return { favorites: [...shown, { title: name, url: key }] };
          const favorites = [...shown];
          favorites[at] = { title: name, url: key };
          return { favorites };
        }),
      removeFavorite: (url) =>
        set((s) => {
          const key = normalizeUrl(url);
          const shown = effectiveFavorites(s.favorites, getGender());
          return { favorites: shown.filter((f) => f.url !== key) };
        }),
    }),
    persistOptions<WebStore, WebState>({
      name: 'web',
      partialize: ({
        favorites,
        counters,
        guestbook,
        votes,
        myProfile,
        bulletinsSeen,
        top8Wall,
        pixlog,
      }) => ({
        favorites,
        counters,
        guestbook,
        votes,
        myProfile,
        bulletinsSeen,
        top8Wall,
        pixlog,
      }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeWeb(persisted, current),
      }),
    }),
  ),
);
