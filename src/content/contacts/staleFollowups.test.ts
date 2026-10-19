// F-04: Dex's day-1 follow-ups, skipped on day 1, never arrive after his day-2 chat.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setup } from '@/apps/messenger/engine/test-helpers';
import type { Gender } from '@/os/types';
import { dex } from './dex';

const MIN = 60_000;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

/** Plays on (first reply each time) until `done` holds or `ms` have passed. */
function playUntil(
  t: ReturnType<typeof setup>,
  done: () => boolean,
  ms = 60 * MIN,
) {
  for (let left = ms; left > 0 && !done(); left -= 1000) {
    if (t.engine.getChoices('dex')) t.engine.choose('dex', 0);
    vi.advanceTimersByTime(1000);
  }
}

describe('Dex: stale day-1 follow-ups', () => {
  it.each(['girl', 'boy'] as const)(
    'skipped on day 1, they never deliver after the day-2 chat (%s)',
    (gender: Gender) => {
      let day = 1;
      const start = () =>
        setup([dex], { getDay: () => day, getGender: () => gender });

      let t = start();
      t.engine.signIn();
      playUntil(t, () => t.log.includes('end dex/opening'));
      expect(t.log).toContain('end dex/opening');
      t.engine.signOut(); // before followup1 starts: the player skips it
      t.engine.dispose();
      expect(t.progress('dex').scripts.followup1?.runs ?? 0).toBe(0);

      day = 2;
      t = start();
      t.engine.signIn();
      playUntil(t, () => false, 3 * 60 * MIN);
      const log = t.take();
      expect(log).toContain('end dex/day2');
      expect(log).not.toContain('start dex/followup1');
      expect(log).not.toContain('start dex/followup2');
      expect(t.said('dex')).not.toContain('< landed it 0 times');
      // The boy-only thread hanging off day 2 still runs on day 2.
      expect(log.includes('end dex/skateSession')).toBe(gender === 'boy');
    },
  );
});
