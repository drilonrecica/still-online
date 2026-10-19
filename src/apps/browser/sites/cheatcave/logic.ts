// Pure helpers for cheatcave.example: the fake counters, the clip chart, games and forum threads.
import type {
  CheatGame,
  ForumPost,
  ForumThread,
  FunnyClip,
} from '@/content/sites/types';
import { mulberry32, seedFrom } from '@/os/random';

export const CHART_SIZE = 10;

/**
 * The "u r visitor #" number: grows by 40 a day (13,370 on the first visit of day 3, as
 * CheatCave Weekly #12 brags) plus one per page view.
 */
export function visitorCount(day: number, hits: number): number {
  return 13_250 + 40 * Math.max(1, day) + Math.max(0, hits - 1);
}

/** "gamers online now": a made-up number, the same all day. */
export function onlineCount(day: number): number {
  return 23 + Math.floor(mulberry32(seedFrom(`cheatcave:${day}`))() * 60);
}

/** The 10 most-viewed clips out by `day`, most views first. */
export function topClips(
  clips: readonly FunnyClip[],
  day: number,
): FunnyClip[] {
  return clips
    .filter((c) => c.day <= day)
    .sort((a, b) => b.views - a.views)
    .slice(0, CHART_SIZE);
}

export const findGame = (
  games: readonly CheatGame[],
  id: string | null,
): CheatGame | undefined =>
  id === null ? undefined : games.find((g) => g.id === id.trim().toLowerCase());

export interface ShownThread {
  thread: ForumThread;
  /** The posts out by today, oldest first. */
  posts: readonly ForumPost[];
  lastDay: number;
}

/** Threads whose first post is out by `day`, with only today's posts; latest activity first. */
export function visibleThreads(
  threads: readonly ForumThread[],
  day: number,
): ShownThread[] {
  return threads
    .map((thread) => {
      const posts = thread.posts.filter((p) => p.day <= day);
      return { thread, posts, lastDay: posts.at(-1)?.day ?? 0 };
    })
    .filter(({ posts }) => posts.length > 0)
    .sort((a, b) => b.lastDay - a.lastDay);
}

export const cheatsHref = (id: string) =>
  `/cheats?game=${encodeURIComponent(id)}`;
export const threadHref = (id: string) => `/forum?t=${encodeURIComponent(id)}`;
