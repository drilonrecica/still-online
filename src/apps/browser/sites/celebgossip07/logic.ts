// Pure helpers for celebgossip07.example: the tag cloud, tag/post lookups and the poll tally.
import type { BlogPost, Poll } from '@/content/sites/types';
import { mulberry32, seedFrom } from '@/os/random';

export interface CloudTag {
  tag: string;
  count: number;
  /** 1 (smallest) … 5 (biggest) font step. */
  size: number;
}

/** Every tag on `posts` with its count, alphabetical; the most-used tag gets size 5. */
export function tagCloud(posts: readonly BlogPost[]): CloudTag[] {
  const counts = new Map<string, number>();
  for (const post of posts)
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const max = Math.max(1, ...counts.values());
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, count]) => ({
      tag,
      count,
      size: 1 + Math.round(((count - 1) / Math.max(1, max - 1)) * 4),
    }));
}

export const tagHref = (tag: string) => `/tag?t=${encodeURIComponent(tag)}`;
export const postHref = (id: string) => `/post?id=${encodeURIComponent(id)}`;

export function postsWithTag(
  posts: readonly BlogPost[],
  tag: string,
): BlogPost[] {
  const want = tag.trim().toLowerCase();
  return posts.filter((p) => p.tags.includes(want));
}

/** The newest poll that has started by `day`, or null before day 1. */
export function currentPoll(polls: readonly Poll[], day: number): Poll | null {
  let best: Poll | null = null;
  for (const poll of polls)
    if (poll.day <= day && (!best || poll.day >= best.day)) best = poll;
  return best;
}

export interface PollResult {
  option: string;
  votes: number;
  percent: number;
}

/**
 * The poll's results: seeded "other readers" (deterministic per poll id) plus the player's vote.
 * Percentages are rounded and may not add up to exactly 100, just like a real 2007 poll.
 */
export function pollTally(poll: Poll, vote: number | undefined): PollResult[] {
  const rand = mulberry32(seedFrom(poll.id));
  const votes = poll.options.map(
    (_, i) => 40 + Math.floor(rand() * 400) + (vote === i ? 1 : 0),
  );
  const total = votes.reduce((a, b) => a + b, 0);
  return poll.options.map((option, i) => {
    const n = votes[i] ?? 0;
    return { option, votes: n, percent: Math.round((n / total) * 100) };
  });
}
