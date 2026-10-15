// Fictional web: the site registry contract (P4-01) and site content shapes (P4-03…P4-05).
// See docs/architecture-v0.2.md → "Web".
import type { ComponentType, LazyExoticComponent } from 'react';
import type { PhotoSpec } from '@/os/fs/types';
import type { PlayerProfile } from '../profiles/types';
import type { FavoriteRecord } from '../types';

/** What every site page component receives from Web Explorer. */
export interface SitePageProps {
  /** Path without the query, always starting with `/` (`/`, `/band`, `/kayla`). */
  path: string;
  query: URLSearchParams;
  /** Navigates this browser window (relative paths resolve against the current site). */
  navigate: (url: string) => void;
}

export interface SitePage {
  title: string;
  keywords?: readonly string[];
  /** `lazy(() => import('./Home'))`; the module default-exports the page. */
  component: LazyExoticComponent<ComponentType<SitePageProps>>;
}

export interface SiteDefinition {
  /** Lowercase, always ending in `.example` (`searchly.example`). */
  host: string;
  title: string;
  /** Searchly snippet. */
  description: string;
  keywords: readonly string[];
  /**
   * Path → page; `/` = home. A key `/*` catches any other single-segment path
   * (Spaceport `/<contactId>`); the page reads `path` to decide what to show.
   */
  pages: Readonly<Record<string, SitePage>>;
}

/** `resolve(url)` in `src/apps/browser/sites/index.ts` returns this, or null for unknown hosts/paths. */
export interface ResolvedPage {
  site: SiteDefinition;
  page: SitePage;
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
   * Seeded with Searchly, Tinfoil Comets, Spaceport, Westfield High, Celeb Gossip 07 as `{ url }`
   * (named in the current language at render, `favoriteTitle`).
   */
  favorites: FavoriteRecord[];
  /** Hit counters by host (+1 per visit). */
  counters: Record<string, number>;
  /** Player-signed guestbook entries by host, oldest first (`day` = the day it was signed). */
  guestbook: Record<string, PlayerGuestbookEntry[]>;
  /** Poll id → chosen option index. */
  votes: Record<string, number>;
  /** Spaceport `/me`; null until the player edits it (defaults derive from the player name). */
  myProfile: PlayerProfile | null;
}
