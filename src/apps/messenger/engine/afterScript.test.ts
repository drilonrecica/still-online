import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { contactContent, line, say, setup } from './test-helpers';

const MIN = 60_000;

const opening = say('opening', { type: 'onSignIn' }, ['hi']);
const followup = say(
  'followup',
  { type: 'afterScript', scriptId: 'opening', minutes: 2 },
  ['me again'],
);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('afterScript trigger', () => {
  it('starts N minutes after the target script ends, not before', () => {
    const t = setup([contactContent('lena', [opening, followup])]);
    t.engine.signIn();
    vi.advanceTimersByTime(80); // "hi": typing 80ms, then the opening ends
    expect(t.take()).toContain('end lena/opening');

    vi.advanceTimersByTime(2 * MIN - 1);
    expect(t.take()).not.toContain('start lena/followup');
    vi.advanceTimersByTime(1);
    expect(t.take()).toContain('start lena/followup');
  });

  it('waits for a busy contact, then runs', () => {
    const busy: Script = {
      id: 'busy',
      trigger: { type: 'afterMinutes', minutes: 1 },
      start: 'q',
      nodes: {
        q: {
          lines: [line('question?', 0)],
          choices: [
            { text: 'a', next: 'done' },
            { text: 'b', next: 'done' },
          ],
        },
        done: { lines: [line('ok', 0)], end: true },
      },
    };
    const t = setup([contactContent('lena', [opening, followup, busy])]);
    t.engine.signIn();
    vi.advanceTimersByTime(3 * MIN); // busy started at 1 min and waits for a reply
    const log = t.take();
    expect(log).toContain('start lena/busy');
    expect(log).not.toContain('start lena/followup');
    expect(t.progress('lena').queue.map((q) => q.scriptId)).toEqual([
      'followup',
    ]);

    t.engine.choose('lena', 0);
    vi.advanceTimersByTime(1000);
    expect(t.take()).toContain('start lena/followup');
  });

  it('re-arms on a later sign-in when the target already ran', () => {
    const t = setup([contactContent('lena', [opening, followup])]);
    t.engine.signIn();
    vi.advanceTimersByTime(80);
    t.engine.signOut(); // before the follow-up's timer fires: it is cleared
    vi.advanceTimersByTime(10 * MIN);
    expect(t.take()).not.toContain('start lena/followup');
    expect(t.progress('lena').scripts.followup?.runs ?? 0).toBe(0);

    t.engine.signIn();
    vi.advanceTimersByTime(2 * MIN);
    expect(t.take()).toContain('start lena/followup');
  });

  it('runs at most once when not repeat', () => {
    const t = setup([contactContent('lena', [opening, followup])]);
    t.engine.signIn();
    vi.advanceTimersByTime(80 + 2 * MIN + 1000);
    expect(t.progress('lena').scripts.followup?.runs).toBe(1);
    t.engine.signOut();
    t.take();

    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    expect(t.take()).not.toContain('start lena/followup');
    expect(t.progress('lena').scripts.followup?.runs).toBe(1);
  });

  it('chains: a follow-up of a follow-up', () => {
    const second = say(
      'second',
      { type: 'afterScript', scriptId: 'followup', minutes: 3 },
      ['and again'],
    );
    const t = setup([contactContent('lena', [opening, followup, second])]);
    t.engine.signIn();
    vi.advanceTimersByTime(80 + 2 * MIN + 1000);
    expect(t.progress('lena').scripts.followup?.runs).toBe(1);
    vi.advanceTimersByTime(3 * MIN);
    expect(t.take()).toContain('start lena/second');
  });
});

describe('afterScript: stale follow-ups (F-04)', () => {
  const day2 = say('day2', { type: 'onDay', day: 2 }, ['day two'], false);
  let day = 1;
  const run = (scripts: Script[]) =>
    setup([contactContent('lena', scripts)], { getDay: () => day });
  beforeEach(() => {
    day = 1;
  });

  it('expires a day-1 follow-up when the day-2 script starts', () => {
    let t = run([opening, followup, day2]);
    t.engine.signIn();
    vi.advanceTimersByTime(80);
    t.engine.signOut(); // skipped: the follow-up never started on day 1
    t.engine.dispose();

    day = 2;
    t = run([opening, followup, day2]);
    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    const log = t.take();
    expect(log).toContain('end lena/day2');
    expect(log).not.toContain('start lena/followup');
    expect(t.progress('lena').scripts.followup?.runs ?? 0).toBe(0);
    expect(t.progress('lena').queue).toEqual([]);
  });

  it('expires the rest of a chain that started on an earlier day', () => {
    const second = say(
      'second',
      { type: 'afterScript', scriptId: 'followup', minutes: 3 },
      ['and again'],
    );
    let t = run([opening, followup, second, day2]);
    t.engine.signIn();
    vi.advanceTimersByTime(80 + 2 * MIN + 1000);
    expect(t.progress('lena').scripts.followup?.runs).toBe(1);
    t.engine.signOut();
    t.engine.dispose();

    day = 2;
    t = run([opening, followup, second, day2]);
    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    expect(t.take()).not.toContain('start lena/second');
  });

  it('keeps a same-day chain: the follow-up runs after that day script', () => {
    day = 2; // first sign-in on day 2: opening and its follow-up are today's
    const t = run([opening, followup, day2]);
    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    const log = t.take();
    expect(log).toContain('end lena/day2');
    expect(log).toContain('start lena/followup');
  });

  it('keeps an old follow-up while no later onDay script has started', () => {
    let t = run([opening, followup]);
    t.engine.signIn();
    vi.advanceTimersByTime(80);
    t.engine.signOut();
    t.engine.dispose();

    day = 2;
    t = run([opening, followup]);
    t.engine.signIn();
    vi.advanceTimersByTime(2 * MIN);
    expect(t.take()).toContain('start lena/followup');
  });

  it('keeps a follow-up of the day script itself', () => {
    const thread = say(
      'thread',
      { type: 'afterScript', scriptId: 'day2', minutes: 6 },
      ['later on day two'],
    );
    day = 2;
    const t = run([day2, thread]);
    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    expect(t.take()).toContain('end lena/thread');
    expect(t.progress('lena').scripts.day2?.day).toBe(2);
  });

  it('dates an old save by the onDay target when the day is missing', () => {
    const thread = say(
      'thread',
      { type: 'afterScript', scriptId: 'day2', minutes: 6 },
      ['later on day two'],
    );
    const day3 = say('day3', { type: 'onDay', day: 3 }, ['day three']);
    let t = run([day2, thread, day3]);
    day = 2;
    t.engine.signIn();
    vi.advanceTimersByTime(80);
    t.engine.signOut();
    t.engine.dispose();
    // A pre-F-04 save: no start day stored.
    const raw = JSON.parse(
      localStorage.getItem('still-online:v1:messenger') ?? '{}',
    );
    delete raw.state.progress.contacts.lena.scripts.day2.day;
    localStorage.setItem('still-online:v1:messenger', JSON.stringify(raw));

    day = 3;
    t = run([day2, thread, day3]);
    t.engine.signIn();
    vi.advanceTimersByTime(10 * MIN);
    const log = t.take();
    expect(log).toContain('end lena/day3');
    expect(log).not.toContain('start lena/thread');
  });
});
