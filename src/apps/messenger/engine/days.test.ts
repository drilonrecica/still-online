// P2-01: onDay triggers, per-day contact presence and unlock lines.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { contactContent, line, say, setup } from './test-helpers';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

/** A setup whose world day can be changed between sign-ins. */
function world(contents: Parameters<typeof setup>[0], start = 1) {
  let day = start;
  const t = setup(contents, { getDay: () => day });
  return {
    ...t,
    setDay: (d: number) => (day = d),
    /** Sign out, then sign in again and let contacts sign in. */
    session: () => {
      t.engine.signOut();
      t.engine.signIn();
      vi.advanceTimersByTime(1000);
    },
  };
}

describe('onDay', () => {
  const contents = () => [
    contactContent('a', [
      say('d2', { type: 'onDay', day: 2 }, ['day two!']),
      say('d3', { type: 'onDay', day: 3 }, ['day three!']),
    ]),
  ];

  it('fires on sign-in once the day is reached, and only once', () => {
    const t = world(contents());
    t.session();
    expect(t.said('a')).toEqual([]);
    t.setDay(2);
    t.session();
    expect(t.said('a')).toEqual(['< day two!']);
    t.session();
    expect(t.said('a')).toEqual(['< day two!']);
  });

  it('a missed day still fires, in content order', () => {
    const t = world(contents(), 3);
    t.session();
    expect(t.said('a')).toEqual(['< day two!', '< day three!']);
  });

  it('defaults to day 1 without getDay', () => {
    const t = setup(contents());
    t.engine.signIn();
    vi.advanceTimersByTime(1000);
    expect(t.log).not.toContain('start a/d2');
  });

  it('queues until the contact signs in, after their onSignIn script', () => {
    const t = world(
      [
        contactContent(
          'a',
          [
            say('day', { type: 'onDay', day: 2 }, ['new day']),
            say('hello', { type: 'onSignIn' }, ['hi']),
          ],
          { signInAfterMs: 5000 },
        ),
      ],
      2,
    );
    t.engine.signIn();
    expect(t.progress('a').queue).toEqual([{ scriptId: 'day', context: {} }]);
    vi.advanceTimersByTime(10_000);
    expect(t.said('a')).toEqual(['< hi', '< new day']);
  });

  it('a day script cut off by sign-out resumes instead of restarting', () => {
    const script: Script = {
      id: 'd2',
      trigger: { type: 'onDay', day: 2 },
      start: 'n',
      nodes: { n: { lines: [line('one', 0), line('two', 5000)], end: true } },
    };
    const t = world([contactContent('a', [script])], 2);
    t.session();
    expect(t.said('a')).toEqual(['< one']);
    t.session();
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual(['< one', '< two']);
    expect(t.log.filter((l) => l === 'start a/d2')).toHaveLength(1);
  });
});

describe('presence per day', () => {
  const days = {
    2: { personalMessage: 'day 2 pm', status: 'busy' as const },
    4: { personalMessage: 'day 4 pm' },
  };
  const statusChange: Script = {
    id: 'brb',
    trigger: { type: 'onDay', day: 2 },
    start: 'n',
    nodes: {
      n: {
        lines: [
          line('brb', 0, {
            statusChange: 'away',
            personalMessageChange: 'gone',
          }),
        ],
        end: true,
      },
    },
  };

  it('day 1 keeps the contact defaults', () => {
    const t = world([contactContent('a', [], { days })]);
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'online',
      personalMessage: "a's pm",
      presenceDay: 1,
    });
  });

  it('applies the day entry once on the first sign-in of the day', () => {
    const t = world([contactContent('a', [], { days })]);
    t.session();
    t.setDay(2);
    t.session();
    expect(t.log).toContain('signedIn a busy');
    expect(t.progress('a')).toMatchObject({
      status: 'busy',
      personalMessage: 'day 2 pm',
      presenceDay: 2,
    });
  });

  it('a script change later that day persists across sign-ins', () => {
    const t = world([contactContent('a', [statusChange], { days })], 2);
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'away',
      personalMessage: 'gone',
      presenceDay: 2,
    });
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'away',
      personalMessage: 'gone',
    });
  });

  it('uses the highest entry at or below the day; status falls back when unset', () => {
    const t = world([contactContent('a', [], { days })], 3);
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'busy',
      personalMessage: 'day 2 pm',
      presenceDay: 3,
    });
    t.setDay(6);
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'busy',
      personalMessage: 'day 4 pm',
      presenceDay: 6,
    });
  });

  it('records the day even for a contact without days', () => {
    const t = world([contactContent('a', [])], 3);
    t.session();
    expect(t.progress('a')).toMatchObject({
      status: 'online',
      personalMessage: "a's pm",
      presenceDay: 3,
    });
  });
});

describe('unlock lines', () => {
  it('calls onUnlock after the line’s other actions', () => {
    const calls: string[] = [];
    const script: Script = {
      id: 'gift',
      trigger: { type: 'onSignIn' },
      start: 'n',
      nodes: {
        n: {
          lines: [
            line('look at ur backgrounds', 0, {
              personalMessageChange: 'gift sent',
              unlock: 'ponies',
            }),
            line('ok bye', 0),
          ],
          end: true,
        },
      },
    };
    const t = setup([contactContent('a', [script])], {
      onUnlock: (id) => calls.push(`unlock ${id} after ${t.log.at(-1)}`),
    });
    t.engine.signIn();
    vi.advanceTimersByTime(10_000);
    expect(calls).toEqual(['unlock ponies after pm a gift sent']);
    expect(t.said('a')).toEqual(['< look at ur backgrounds', '< ok bye']);
  });
});
