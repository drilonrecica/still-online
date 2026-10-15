// Web Explorer's persisted `web` store: favorites now; counters, guestbooks, votes and the
// Spaceport profile for the site tasks (P4-03…P4-05). See docs/architecture-v0.2.md → "Stores".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerProfile } from '@/content/profiles/types';
import type {
  Favorite,
  PlayerGuestbookEntry,
  WebState,
} from '@/content/sites/types';
import { isRecord, persistOptions } from '@/os/persist';
import { normalizeUrl } from './url';

export const DEFAULT_FAVORITES: readonly Favorite[] = [
  { title: 'Searchly', url: 'http://searchly.example/' },
  { title: 'Tinfoil Comets', url: 'http://tinfoilcomets.example/' },
  { title: 'Spaceport', url: 'http://spaceport.example/' },
  { title: 'Westfield High', url: 'http://westfield-high.example/' },
  { title: 'Celeb Gossip 07', url: 'http://celebgossip07.example/' },
];

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
  /** Saves the player's Spaceport `/me` profile. */
  saveProfile: (profile: PlayerProfile) => void;
}

const str = (v: unknown): v is string => typeof v === 'string';
const count = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;

function sanitizeFavorites(v: unknown): Favorite[] | null {
  if (!Array.isArray(v)) return null;
  const seen = new Set<string>();
  const out: Favorite[] = [];
  for (const f of v) {
    if (!isRecord(f) || !str(f.title) || !str(f.url) || f.url === '') continue;
    const url = normalizeUrl(f.url);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title: f.title, url });
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

export function sanitizeProfile(v: unknown): PlayerProfile | null {
  if (!isRecord(v)) return null;
  const { headline, mood, aboutMe, songTrackId, themePreset, customColors } = v;
  if (
    !str(headline) ||
    !isRecord(mood) ||
    !str(mood.text) ||
    !str(mood.emoticon) ||
    !str(aboutMe) ||
    !(songTrackId === null || str(songTrackId)) ||
    !str(themePreset) ||
    !Array.isArray(v.top8)
  ) {
    return null;
  }
  const colors =
    isRecord(customColors) &&
    str(customColors.background) &&
    str(customColors.text)
      ? { background: customColors.background, text: customColors.text }
      : null;
  return {
    headline,
    mood: { text: mood.text, emoticon: mood.emoticon },
    aboutMe,
    songTrackId,
    themePreset,
    customColors: colors,
    top8: v.top8.filter(str),
  };
}

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
  };
}

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
      saveProfile: (profile) => set({ myProfile: profile }),
      addFavorite: ({ title, url }) =>
        set((s) => {
          const key = normalizeUrl(url);
          const name = title.trim() || key;
          const at = s.favorites.findIndex((f) => f.url === key);
          if (at === -1)
            return { favorites: [...s.favorites, { title: name, url: key }] };
          const favorites = [...s.favorites];
          favorites[at] = { title: name, url: key };
          return { favorites };
        }),
      removeFavorite: (url) =>
        set((s) => {
          const key = normalizeUrl(url);
          return { favorites: s.favorites.filter((f) => f.url !== key) };
        }),
    }),
    persistOptions<WebStore, WebState>({
      name: 'web',
      partialize: ({ favorites, counters, guestbook, votes, myProfile }) => ({
        favorites,
        counters,
        guestbook,
        votes,
        myProfile,
      }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeWeb(persisted, current),
      }),
    }),
  ),
);
