import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import type { Gender } from '@/os/types';
import { contactContent, line, say, setup } from './test-helpers';

const MIN = 60_000;

const opening = say('opening', { type: 'onSignIn' }, ['hi']);
const forBoy = (trigger: Script['trigger'], id = 'boyThread'): Script => ({
  ...say(id, trigger, ['dude']),
  forGender: 'boy',
});
/** A boy thread that waits for a reply, so a gender switch can happen mid-run. */
const asking: Script = {
  id: 'asking',
  forGender: 'boy',
  trigger: { type: 'afterMinutes', minutes: 1 },
  start: 'q',
  nodes: {
    q: {
      lines: [line('lan party?', 0)],
      choices: [
        { text: 'in', next: 'done' },
        { text: 'out', next: 'done' },
      ],
    },
    done: { lines: [line('cool', 0)], end: true },
  },
};

let gender: Gender = 'girl';
const run = (scripts: Script[], day = 1) =>
  setup([contactContent('marco', scripts)], {
    getGender: () => gender,
    getDay: () => day,
  });

beforeEach(() => {
  localStorage.clear();
  gender = 'girl';
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('Script.forGender', () => {
  it.each([
    ['onDay', { type: 'onDay', day: 2 }],
    ['afterScript', { type: 'afterScript', scriptId: 'opening', minutes: 2 }],
    ['onSignIn', { type: 'onSignIn' }],
  ] as const)('a boy %s script runs for a boy only', (_, trigger) => {
    for (const g of ['boy', 'girl'] as const) {
      localStorage.clear();
      gender = g;
      const t = run([opening, forBoy(trigger)], 2);
      t.engine.signIn();
      vi.advanceTimersByTime(5 * MIN);
      const ran = t.log.includes('end marco/boyThread');
      expect(ran, g).toBe(g === 'boy');
      t.engine.dispose();
    }
  });

  it('a girl-only script never arms for a boy', () => {
    gender = 'boy';
    const girlOnly: Script = {
      ...forBoy({ type: 'onSignIn' }),
      forGender: 'girl',
    };
    const t = run([girlOnly]);
    t.engine.signIn();
    vi.advanceTimersByTime(MIN);
    expect(t.log).not.toContain('start marco/boyThread');
  });

  it('a switch mid-run lets the active script finish and keeps runs', () => {
    gender = 'boy';
    const t = run([asking]);
    t.engine.signIn();
    vi.advanceTimersByTime(MIN + 5000);
    expect(t.engine.getChoices('marco')).toHaveLength(2);

    gender = 'girl';
    expect(t.engine.choose('marco', 0)).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(t.log).toContain('end marco/asking');
    expect(t.progress('marco').scripts.asking?.runs).toBe(1);
  });

  it('a queued thread is dropped after a switch and arms again for a boy later', () => {
    gender = 'boy';
    const t = run([asking, forBoy({ type: 'afterMinutes', minutes: 2 })]);
    t.engine.signIn();
    vi.advanceTimersByTime(3 * MIN); // `asking` waits for a reply; boyThread is queued
    expect(t.progress('marco').queue.map((q) => q.scriptId)).toEqual([
      'boyThread',
    ]);

    gender = 'girl';
    t.engine.choose('marco', 0);
    vi.advanceTimersByTime(MIN);
    expect(t.log).not.toContain('start marco/boyThread');
    expect(t.progress('marco').queue).toEqual([]);
    expect(t.progress('marco').scripts.boyThread).toBeUndefined();

    // Back to a boy: the next sign-in arms it again (it never ran).
    gender = 'boy';
    t.engine.signOut();
    t.engine.signIn();
    vi.advanceTimersByTime(3 * MIN);
    expect(t.log).toContain('end marco/boyThread');
  });
});
