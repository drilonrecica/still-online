import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exampleContact } from '@/content/example.fixture';
import type { Script } from '@/content/types';
import { createConversationEngine } from './engine';
import { contactContent, line, say, setup } from './test-helpers';
import { typingMs } from './text';
import type { Scheduler } from './types';

const opening: Script = {
  id: 'opening',
  trigger: { type: 'onSignIn' },
  start: 'a',
  nodes: {
    a: {
      lines: [
        line('hey {name}', 1000),
        line('x'.repeat(100), 500),
        line(undefined, 200, {
          nudge: true,
          statusChange: 'away',
          personalMessageChange: 'missing {name}',
        }),
      ],
      choices: [
        { text: 'yes {name}!', label: 'Yes', next: 'y' },
        { text: 'no', next: 'n' },
      ],
    },
    y: { lines: [line('yay', 100)], end: true },
    n: { lines: [line('aw', 100)], end: true },
  },
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('typingMs', () => {
  it('is 40ms per character, capped at 2500ms', () => {
    expect(typingMs('')).toBe(0);
    expect(typingMs('hello')).toBe(200);
    expect(typingMs('x'.repeat(62))).toBe(2480);
    expect(typingMs('x'.repeat(63))).toBe(2500);
    expect(typingMs('x'.repeat(500))).toBe(2500);
  });
});

describe('line ordering and timing', () => {
  it('waits delayMs, shows typing for min(len*40, 2500), then delivers', () => {
    const t = setup([contactContent('lena', [opening])]);
    t.engine.signIn();
    expect(t.take()).toEqual(['signedIn lena online', 'start lena/opening']);

    vi.advanceTimersByTime(999);
    expect(t.take()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(t.take()).toEqual(['typing lena']);
    expect(t.store.getState().typing.lena).toBe(true);

    // "hey Ann" is 7 chars → 280ms (placeholders resolve before timing).
    vi.advanceTimersByTime(279);
    expect(t.take()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(t.take()).toEqual(['typingStop lena', '< lena: hey Ann']);
    expect(t.store.getState().typing.lena).toBe(false);

    // Second line: 500ms delay, then the typing indicator is capped at 2500ms.
    vi.advanceTimersByTime(500);
    expect(t.take()).toEqual(['typing lena']);
    vi.advanceTimersByTime(2499);
    expect(t.take()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(t.take()).toEqual(['typingStop lena', `< lena: ${'x'.repeat(100)}`]);
  });

  it('plays a text-less line as pure actions: nudge, status, personal message, in order', () => {
    const t = setup([contactContent('lena', [opening])]);
    t.engine.signIn();
    vi.advanceTimersByTime(1000 + 280 + 500 + 2500);
    t.take();
    vi.advanceTimersByTime(200);
    expect(t.take()).toEqual([
      'nudge contact lena',
      'status lena away',
      'pm lena missing Ann',
      'choices lena Yes|no',
    ]);
    const p = t.progress('lena');
    expect(p.status).toBe('away');
    expect(p.personalMessage).toEqual({
      kind: 'line',
      scriptId: 'opening',
      nodeId: 'a',
      lineIndex: 2,
    });
    expect(t.pm('lena')).toBe('missing Ann');
    expect(t.said('lena')).toEqual([
      '< hey Ann',
      `< ${'x'.repeat(100)}`,
      'nudge contact',
    ]);
  });

  it('stamps transcript entries with scheduler time', () => {
    const t = setup([
      contactContent('lena', [say('s', { type: 'onSignIn' }, ['hi'])]),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(80);
    expect(t.progress('lena').transcript[0]?.at).toBe(
      new Date('2026-10-14T12:00:00.080Z').getTime(),
    );
  });

  it('works with a manually injected scheduler', () => {
    const queue: { at: number; fn: () => void }[] = [];
    let clock = 0;
    const scheduler: Scheduler = {
      setTimeout: (fn, ms) => {
        const job = { at: clock + ms, fn };
        queue.push(job);
        return job;
      },
      clearTimeout: (h) => {
        const i = queue.indexOf(h as (typeof queue)[number]);
        if (i >= 0) queue.splice(i, 1);
      },
      now: () => clock,
    };
    const t = setup(
      [contactContent('lena', [say('s', { type: 'onSignIn' }, ['hi'])])],
      {
        scheduler,
      },
    );
    t.engine.signIn();
    while (queue.length) {
      queue.sort((a, b) => a.at - b.at);
      const job = queue.shift()!;
      clock = job.at;
      job.fn();
    }
    expect(t.progress('lena').transcript).toEqual([
      {
        kind: 'line',
        from: 'contact',
        scriptId: 's',
        nodeId: 'only',
        lineIndex: 0,
        at: 80,
      },
    ]);
  });
});

describe('sign-in', () => {
  it('signs contacts in on their delay; 0 = already online without a toast', () => {
    const t = setup([
      contactContent('now', []),
      contactContent('later', [], {
        signInAfterMs: 10_000,
        initialStatus: 'busy',
      }),
    ]);
    t.engine.signIn();
    expect(t.take()).toEqual(['signedIn now online']);
    expect(t.store.getState().online).toEqual({ now: true });
    vi.advanceTimersByTime(10_000);
    expect(t.take()).toEqual(['signedIn later busy toast']);
    expect(t.progress('later')).toMatchObject({
      everSignedIn: true,
      status: 'busy',
    });
  });

  it('"appear offline" signs in silently and still runs onSignIn scripts', () => {
    const t = setup([
      contactContent('sam', [say('hi', { type: 'onSignIn' }, ['psst'])], {
        initialStatus: 'offline',
        signInAfterMs: 5000,
      }),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(5000);
    expect(t.take()).toEqual(['signedIn sam offline', 'start sam/hi']);
    vi.advanceTimersByTime(1000);
    expect(t.said('sam')).toEqual(['< psst']);
  });

  it('statusChange offline signs the contact out; a later status signs them back in with a toast', () => {
    const script: Script = {
      id: 's',
      trigger: { type: 'onSignIn' },
      start: 'a',
      nodes: {
        a: {
          lines: [
            line(undefined, 100, { statusChange: 'offline' }),
            line(undefined, 100, { statusChange: 'away' }),
          ],
          end: true,
        },
      },
    };
    const t = setup([contactContent('lena', [script])]);
    t.engine.signIn();
    t.take();
    vi.advanceTimersByTime(100);
    expect(t.take()).toEqual(['status lena offline', 'signedOut lena']);
    expect(t.store.getState().online.lena).toBe(false);
    vi.advanceTimersByTime(100);
    expect(t.take()).toEqual([
      'status lena away',
      'signedIn lena away toast',
      'end lena/s',
    ]);
    expect(t.store.getState().online.lena).toBe(true);
  });

  it('signOut stops every timer; signIn is idempotent', () => {
    const t = setup([
      contactContent('lena', [opening], { signInAfterMs: 1000 }),
    ]);
    t.engine.signIn();
    t.engine.signIn();
    vi.advanceTimersByTime(1500);
    t.engine.signOut();
    expect(t.take()).toEqual([
      'signedIn lena online toast',
      'start lena/opening',
      'player signedOut',
    ]);
    vi.advanceTimersByTime(60_000);
    expect(t.take()).toEqual([]);
    expect(t.store.getState()).toMatchObject({
      signedIn: false,
      online: {},
      typing: {},
    });
  });

  it('counts unread messages unless the chat is focused', () => {
    let focused = false;
    const t = setup(
      [contactContent('lena', [say('s', { type: 'onSignIn' }, ['a', 'b'])])],
      {
        isChatFocused: () => focused,
      },
    );
    t.engine.signIn();
    vi.advanceTimersByTime(40);
    focused = true;
    vi.advanceTimersByTime(40);
    expect(t.progress('lena').unread).toBe(1);
    t.store.getState().markRead('lena');
    expect(t.progress('lena').unread).toBe(0);
  });
});

describe('branching', () => {
  const reachChoices = () => {
    const t = setup([contactContent('lena', [opening])]);
    t.engine.signIn();
    vi.advanceTimersByTime(1000 + 280 + 500 + 2500 + 200);
    t.take();
    return t;
  };

  it('offers resolved choices once all lines are delivered', () => {
    const t = reachChoices();
    expect(t.progress('lena').active).toMatchObject({
      nodeId: 'a',
      lineIndex: 3,
      awaitingChoice: true,
    });
    expect(t.engine.getChoices('lena')).toEqual([
      { text: 'yes Ann!', label: 'Yes', next: 'y' },
      { text: 'no', label: 'no', next: 'n' },
    ]);
  });

  it.each([
    [0, 'y', '< lena: yay', '> yes Ann!'],
    [1, 'n', '< lena: aw', '> no'],
  ])('choice %i goes to node %s', (index, node, reply, sent) => {
    const t = reachChoices();
    expect(t.engine.choose('lena', index)).toBe(true);
    expect(t.engine.getChoices('lena')).toBeNull();
    vi.advanceTimersByTime(100 + 120);
    expect(t.take()).toEqual([
      `> lena: ${sent.slice(2)}`,
      'typing lena',
      'typingStop lena',
      reply,
      'end lena/opening',
    ]);
    expect(t.said('lena').at(-2)).toBe(sent);
    const p = t.progress('lena');
    expect(p.active).toBeNull();
    expect(p.scripts.opening).toEqual({
      runs: 1,
      visited: ['a', node],
      trackIds: [],
      day: 1,
    });
  });

  it('rejects choices when nothing is pending or the index is out of range', () => {
    const t = setup([
      contactContent('lena', [opening]),
      contactContent('idle', []),
    ]);
    t.engine.signIn();
    expect(t.engine.choose('lena', 0)).toBe(false); // still playing lines
    expect(t.engine.choose('idle', 0)).toBe(false);
    expect(t.engine.choose('nobody', 0)).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(t.engine.choose('lena', 5)).toBe(false);
    expect(t.engine.choose('lena', 1)).toBe(true);
    expect(t.engine.choose('lena', 1)).toBe(false);
  });

  it('plays the documented example end to end', () => {
    const t = setup([exampleContact]);
    t.engine.signIn();
    vi.advanceTimersByTime(20_000 + 10_000);
    expect(t.engine.getChoices('mika')?.map((c) => c.label)).toEqual([
      'Yes!',
      'Grounded',
    ]);
    t.engine.choose('mika', 1);
    vi.advanceTimersByTime(10_000);
    expect(t.said('mika')).toEqual([
      '< heyyy Ann!!',
      'nudge contact',
      '< r u coming 2 the lake on saturday? :D',
      '> cant, grounded :(',
      '< nooo :( thats so unfair',
    ]);
    expect(t.pm('mika')).toBe('lake trip minus Ann :(');
  });
});

describe('engine without fake-timer helpers', () => {
  it('dispose clears timers and listeners', () => {
    const t = setup([contactContent('lena', [opening])]);
    t.engine.signIn();
    t.engine.dispose();
    t.take();
    vi.advanceTimersByTime(60_000);
    expect(t.log).toEqual([]);
    expect(t.progress('lena').transcript).toEqual([]);
  });

  it('can be created directly with defaults', () => {
    const contents = [
      contactContent('a', [say('s', { type: 'onSignIn' }, ['hi {name}'])]),
    ];
    const t = setup(contents);
    t.engine.dispose();
    const engine = createConversationEngine({ contents, store: t.store });
    engine.signIn();
    vi.advanceTimersByTime(1000);
    // `{name}` is the player's name at render time, not at delivery.
    expect(t.said('a')).toEqual(['< hi Ann']);
  });
});
