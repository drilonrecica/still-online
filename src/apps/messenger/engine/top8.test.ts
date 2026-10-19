// P0-03: Top 8 drama. A dropped friend reacts on their first sign-in on a later day; putting them
// back after that fires the readded script once. Bookkeeping lives in `progress.top8`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { sanitizeProgress } from './progress';
import { contactContent, line, say, setup } from './test-helpers';

const dropped = say('top8-dropped', { type: 'onTop8Dropped' }, ['wow. ok']);
const readded = say('top8-readded', { type: 'onTop8Readded' }, ['yay <3']);

let day = 1;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  day = 1;
});
afterEach(() => vi.useRealTimers());

function drama(extra: Script[] = []) {
  const t = setup([contactContent('kay', [dropped, readded, ...extra])], {
    getDay: () => day,
  });
  const top8 = () => t.store.getState().progress.top8;
  /** Sign out, then back in on `next` (a new boot) and let everything play. */
  const nextSession = (next = day) => {
    t.engine.signOut();
    day = next;
    t.engine.signIn();
    vi.advanceTimersByTime(10_000);
  };
  return { ...t, top8, nextSession };
}

describe('Top 8 drama: onTop8Dropped', () => {
  it('records a drop and does not react the same day', () => {
    const t = drama();
    t.engine.signIn();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession();
    expect(t.top8()).toEqual({ kay: { state: 'dropped', day: 1 } });
    expect(t.log).not.toContain('start kay/top8-dropped');
  });

  it('reacts once on the next day’s sign-in, then the record is reacted', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    expect(t.said('kay')).toEqual(['< wow. ok']);
    expect(t.top8()).toEqual({ kay: { state: 'reacted', day: 1 } });
    expect(t.log).toContain('top8Reacted kay dropped');
    t.nextSession(2);
    t.nextSession(3);
    expect(t.said('kay')).toEqual(['< wow. ok']);
    expect(t.log.filter((l) => l === 'start kay/top8-dropped')).toHaveLength(1);
  });

  it('a missed day still reacts (any later day)', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(4);
    expect(t.said('kay')).toEqual(['< wow. ok']);
  });

  it('a second drop while one is pending keeps the first day', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    day = 2;
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    expect(t.top8()).toEqual({ kay: { state: 'dropped', day: 1 } });
  });

  it('ignores unknown contacts', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['nobody'], added: ['nobody'] });
    expect(t.top8()).toBeUndefined();
  });

  it('runs after a script that is already playing', () => {
    const chat: Script = {
      id: 'chat',
      trigger: { type: 'onSignIn' },
      start: 'n',
      nodes: { n: { lines: [line('hiii', 1000)], end: true } },
    };
    const t = drama([chat]);
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    expect(t.said('kay')).toEqual(['< hiii', '< wow. ok']);
  });
});

describe('Top 8 drama: re-adding', () => {
  it('before the reaction: forgets the drop, nothing runs', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    expect(t.top8()).toBeUndefined();
    t.nextSession(2);
    expect(t.said('kay')).toEqual([]);
  });

  it('before a queued reaction starts: the reaction is skipped', () => {
    const chat: Script = {
      id: 'chat',
      trigger: { type: 'onSignIn' },
      start: 'n',
      nodes: { n: { lines: [line('hiii', 5000)], end: true } },
    };
    const t = drama([chat]);
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.engine.signOut();
    day = 2;
    t.engine.signIn();
    vi.advanceTimersByTime(100);
    expect(t.progress('kay').queue.map((q) => q.scriptId)).toEqual([
      'top8-dropped',
    ]);
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    vi.advanceTimersByTime(10_000);
    expect(t.said('kay')).toEqual(['< hiii']);
    expect(t.log).not.toContain('top8Reacted kay dropped');
  });

  it('after the reaction: runs readded at once while online, once', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    t.take();
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    vi.advanceTimersByTime(5000);
    expect(t.said('kay')).toEqual(['< wow. ok', '< yay <3']);
    expect(t.log).toContain('top8Reacted kay readded');
    expect(t.top8()).toBeUndefined();
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    t.nextSession(3);
    expect(t.said('kay')).toEqual(['< wow. ok', '< yay <3']);
  });

  it('after the reaction, signed out: queued for the next sign-in', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    t.engine.signOut();
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    expect(t.said('kay')).toEqual(['< wow. ok']);
    expect(t.progress('kay').queue).toEqual([
      { scriptId: 'top8-readded', context: {} },
    ]);
    t.nextSession(2);
    expect(t.said('kay')).toEqual(['< wow. ok', '< yay <3']);
  });

  it('a queued readded is skipped if the friend was dropped again', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    t.engine.signOut();
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    expect(t.said('kay')).toEqual(['< wow. ok']);
    expect(t.top8()).toEqual({ kay: { state: 'dropped', day: 2 } });
  });

  it('a new drop after a re-add reacts again (repeatable by record)', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(2);
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    vi.advanceTimersByTime(5000);
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.nextSession(3);
    t.engine.top8Changed({ dropped: [], added: ['kay'] });
    vi.advanceTimersByTime(5000);
    expect(t.said('kay')).toEqual([
      '< wow. ok',
      '< yay <3',
      '< wow. ok',
      '< yay <3',
    ]);
  });
});

describe('Top 8 drama: persistence', () => {
  it('sanitizes records and omits an empty top8', () => {
    expect(sanitizeProgress({ player: {}, contacts: {} })).not.toHaveProperty(
      'top8',
    );
    expect(
      sanitizeProgress({
        top8: {
          kay: { state: 'reacted', day: 2 },
          a: { state: 'angry', day: 2 },
          b: { state: 'dropped', day: 0 },
          c: { state: 'dropped', day: 1.5 },
          d: 'dropped',
        },
      }).top8,
    ).toEqual({ kay: { state: 'reacted', day: 2 } });
  });

  it('survives a reload between the drop and the reaction', () => {
    const t = drama();
    t.engine.top8Changed({ dropped: ['kay'], added: [] });
    t.engine.dispose();
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:messenger') ?? '{}',
    ) as { state: { progress: unknown } };
    expect(sanitizeProgress(saved.state.progress).top8).toEqual({
      kay: { state: 'dropped', day: 1 },
    });
    day = 2;
    const again = drama();
    again.engine.signIn();
    vi.advanceTimersByTime(10_000);
    expect(again.said('kay')).toEqual(['< wow. ok']);
  });
});
