import { describe, expect, it } from 'vitest';
import {
  CHEATCAVE_CLIPS,
  CHEATCAVE_GAMES,
  CHEATCAVE_THREADS,
} from '@/content/sites/cheatcave';
import {
  CHART_SIZE,
  cheatsHref,
  findGame,
  onlineCount,
  threadHref,
  topClips,
  visibleThreads,
  visitorCount,
} from './logic';

describe('cheatcave logic', () => {
  it('counts 13,370 visitors on the first visit of day 3, plus one per view', () => {
    expect(visitorCount(3, 1)).toBe(13_370);
    expect(visitorCount(3, 0)).toBe(13_370);
    expect(visitorCount(3, 5)).toBe(13_374);
    expect(visitorCount(4, 1)).toBeGreaterThan(visitorCount(3, 1));
  });

  it('has a made-up "online now" number that stays the same all day', () => {
    expect(onlineCount(2)).toBe(onlineCount(2));
    for (const day of [1, 2, 3, 4, 5, 9]) {
      expect(onlineCount(day)).toBeGreaterThanOrEqual(23);
      expect(onlineCount(day)).toBeLessThan(83);
    }
  });

  it('charts the 10 most-viewed clips; the puddle takes #1 on day 5', () => {
    const day1 = topClips(CHEATCAVE_CLIPS, 1);
    expect(day1).toHaveLength(CHART_SIZE);
    expect(day1[0]?.id).toBe('cat-vs-fan');
    expect(day1.map((c) => c.id)).not.toContain('puddle-ollie');
    const day5 = topClips(CHEATCAVE_CLIPS, 5);
    expect(day5).toHaveLength(CHART_SIZE);
    expect(day5[0]?.id).toBe('puddle-ollie');
    expect(day5[1]?.id).toBe('cat-vs-fan');
    const views = day5.map((c) => c.views);
    expect(views).toEqual([...views].sort((a, b) => b - a));
  });

  it('finds games by id, ignoring case and spaces', () => {
    expect(findGame(CHEATCAVE_GAMES, 'mines')?.name).toBe('Mines');
    expect(findGame(CHEATCAVE_GAMES, ' Thunder-Kart ')?.name).toBe(
      'Thunder Kart',
    );
    expect(findGame(CHEATCAVE_GAMES, 'nope')).toBeUndefined();
    expect(findGame(CHEATCAVE_GAMES, null)).toBeUndefined();
    expect(cheatsHref('hen hunt')).toBe('/cheats?game=hen%20hunt');
    expect(threadHref('ntk-level-4')).toBe('/forum?t=ntk-level-4');
  });

  it('shows threads from their first day, replies by day, latest activity first', () => {
    const day1 = visibleThreads(CHEATCAVE_THREADS, 1);
    expect(day1.map((s) => s.thread.id)).toEqual([
      'ntk-level-4',
      'best-trick-irl',
    ]);
    expect(day1[0]?.posts).toHaveLength(3);
    const day5 = visibleThreads(CHEATCAVE_THREADS, 5);
    expect(day5).toHaveLength(3);
    expect(day5.every((s) => s.lastDay === 5)).toBe(true);
    const trick = day5.find((s) => s.thread.id === 'best-trick-irl');
    expect(trick?.posts.at(-1)?.user).toBe('dex.kickflip');
    expect(
      visibleThreads(CHEATCAVE_THREADS, 4)
        .find((s) => s.thread.id === 'best-trick-irl')
        ?.posts.some((p) => p.user === 'dex.kickflip'),
    ).toBe(false);
  });
});
