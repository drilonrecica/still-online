// Fictional web: the site registry contract (P4-01) and site content shapes (P4-03…P4-05).
// See docs/architecture-v0.2.md → "Web".
import type { ComponentType, LazyExoticComponent } from 'react';
import type { Locale } from '@/i18n/types';
import type { PhotoSpec } from '@/os/fs/types';
import type { PlayerProfile } from '../friendspace/profiles/types';
import type { PixlogSkinId } from '../pixlog/types';
import type { ContactId, FavoriteRecord } from '../types';

/** What every site page component receives from Web Explorer. */
export interface SitePageProps {
  /** Path without the query, always starting with `/` (`/`, `/band`, `/kayla`). */
  path: string;
  query: URLSearchParams;
  /** Navigates this browser window (relative paths resolve against the current site). */
  navigate: (url: string) => void;
}

/** A page's text in one language: the window title and extra Searchly keywords. */
export interface PageMeta {
  title: string;
  keywords?: readonly string[];
}

/** What a site calls itself in one language; Searchly indexes the current language's meta. */
export interface SiteMeta {
  title: string;
  /** Searchly snippet. */
  description: string;
  keywords: readonly string[];
  /** Path → page text, for every path in `SiteDefinition.pages` (including `/*`). */
  pages: Readonly<Record<string, PageMeta>>;
}

export interface SitePage {
  /** `lazy(() => import('./Home'))`; the module default-exports the page. */
  component: LazyExoticComponent<ComponentType<SitePageProps>>;
}

export interface SiteDefinition {
  /** Lowercase, always ending in `.example` (`searchly.example`). */
  host: string;
  /** Title, snippet, keywords and page titles in `locale` (from the site's content module). */
  meta: (locale: Locale) => SiteMeta;
  /**
   * Path → page; `/` = home. A key `/*` catches any other single-segment path
   * (Friendspace `/<contactId>`); the page reads `path` to decide what to show.
   */
  pages: Readonly<Record<string, SitePage>>;
}

/** `resolve(url)` in `src/apps/browser/sites/index.ts` returns this, or null for unknown hosts/paths. */
export interface ResolvedPage {
  site: SiteDefinition;
  page: SitePage;
  /** The key the page matched in `site.pages` (`/me`, or `/*` for the catch-all). */
  key: string;
  /** Normalised `http://host/path?query`. */
  url: string;
  path: string;
  query: URLSearchParams;
}

// ---------------------------------------------------------------------------
// Site content (src/content/sites/<host-slug>.ts). Day-gated entries show when `day <= currentDay`.
// ---------------------------------------------------------------------------

export interface GuestbookEntry {
  day: number;
  name: string;
  homepage?: string;
  message: string;
}

/** A guestbook entry the player wrote; entries saved before P4-03 have no `day` (treated as day 1). */
export type PlayerGuestbookEntry = Omit<GuestbookEntry, 'day'> & {
  day?: number;
};

export interface BlogComment {
  user: string;
  text: string;
}

export interface BlogPost {
  id: string;
  day: number;
  title: string;
  body: string;
  tags: readonly string[];
  comments: readonly BlogComment[];
  /** A "paparazzi pic" drawn by `renderPhoto`; `caption` is shown under it. */
  photo?: PhotoSpec;
}

export interface NewsPost {
  day: number;
  title: string;
  author: string;
  body: string;
}

export interface Poll {
  id: string;
  /** The poll runs from this day until a newer one starts. */
  day: number;
  question: string;
  options: readonly string[];
}

/** One code on cheatcave.example's `/cheats` page: what to press, and what (supposedly) happens. */
export interface Cheat {
  code: string;
  effect: string;
}

/** A game on cheatcave.example's `/cheats?game=` page: real-ish tips plus one joke cheat. */
export interface CheatGame {
  /** The `?game=` value, the same in every language. */
  id: string;
  name: string;
  genre: string;
  blurb: string;
  cheats: readonly Cheat[];
  joke: Cheat;
}

/** A "top 10 funny clips" entry; the chart is the 10 most-viewed clips out by today. */
export interface FunnyClip {
  id: string;
  day: number;
  title: string;
  /** `m:ss`. */
  length: string;
  views: number;
  uploader: string;
  /** The thumbnail, drawn by `renderPhoto`. */
  photo: PhotoSpec;
}

export interface ForumPost {
  day: number;
  user: string;
  text: string;
}

/** A read-only forum thread; it shows from its first post's day, each reply from its own. */
export interface ForumThread {
  id: string;
  title: string;
  board: string;
  posts: readonly ForumPost[];
}

/** A line that appears from `day` on (shoutbox shouts, video teasers, gig updates). */
export interface DayLine {
  day: number;
  text: string;
}

/** A shout in kickflipkings.example's read-only shoutbox. */
export interface Shout extends DayLine {
  user: string;
}

/** A kickflipkings.example crew member; from `after.day` on the best trick reads `after.bestTrick`. */
export interface CrewMember {
  /** The handle, the same in every language (the friends' mail handles without the domain). */
  handle: string;
  name: string;
  role: string;
  bestTrick: string;
  bio: string;
  after?: { day: number; bestTrick: string };
}

/** A step-by-step trick tip on kickflipkings.example's `/tricks` page (ollie → kickflip). */
export interface Trick {
  id: string;
  name: string;
  level: string;
  steps: readonly string[];
  tip: string;
}

/** A show on kickflipkings.example's `/gigs`, listed from `day`; `after` replaces it once played. */
export interface Gig {
  id: string;
  day: number;
  band: string;
  venue: string;
  when: string;
  note: string;
  updates?: readonly DayLine[];
  after?: { day: number; when: string; note: string };
}

// ---------------------------------------------------------------------------
// Persisted `web` store (src/apps/browser/store.ts)
// ---------------------------------------------------------------------------

/** A favorite as Web Explorer shows it: a `FavoriteRecord` with its title rendered. */
export interface Favorite {
  title: string;
  url: string;
}

export interface WebState {
  /**
   * Seeded with Searchly, Tinfoil Comets, Friendspace, Westfield High, Celeb Gossip 07 as `{ url }`
   * (named in the current language at render, `favoriteTitle`).
   */
  favorites: FavoriteRecord[];
  /** Hit counters by host (+1 per visit). */
  counters: Record<string, number>;
  /** Player-signed guestbook entries by host, oldest first (`day` = the day it was signed). */
  guestbook: Record<string, PlayerGuestbookEntry[]>;
  /** Poll id → chosen option index. */
  votes: Record<string, number>;
  /** Friendspace `/me`; null until the player edits it (defaults derive from the player name). */
  myProfile: PlayerProfile | null;
  /** v0.4: the highest day the player opened Friendspace's `/bulletins`. */
  bulletinsSeen?: number;
  /** v0.4: friends' Top 8 reactions on `/me`, oldest first (text from `top8Reactions` at render). */
  top8Wall?: Top8WallEntry[];
  /** v0.4: the player's Pixlog page. */
  pixlog?: PixlogState;
}

export interface Top8WallEntry {
  contactId: ContactId;
  kind: 'dropped' | 'readded';
  /** The day the friend reacted. */
  day: number;
}

export interface PixlogState {
  /** The skin the player picked; absent = the gender's default (`pixlogSkinFor`). */
  skin?: PixlogSkinId;
  /** My Pictures files (`FsNode.id`) with the player's captions (≤ 80 chars), max 24, in order. */
  album: { fsNodeId: string; caption: string }[];
  /** Survey id → the player's answers, in question order. */
  surveys: Record<string, string[]>;
  /** Contact id → the days the player gave them a kudo. */
  kudosGiven: Record<ContactId, number[]>;
}
