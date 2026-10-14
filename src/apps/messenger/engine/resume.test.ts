// Reload/resume: a new store hydrates from localStorage and a new engine continues the scripts.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { storageKey } from '@/os/persist';
import { contactContent, line, say, setup } from './test-helpers';

const chat: Script = {
  id: 'chat',
  trigger: { type: 'onSignIn' },
  start: 'a',
  nodes: {
    a: {
      lines: [line('one', 1000), line('two', 1000), line('three', 1000)],
      choices: [
        { text: 'left', next: 'l' },
        { text: 'right', next: 'r' },
      ],
    },
    l: { lines: [line('went left', 500)], end: true },
    r: { lines: [line('went right', 500)], end: true },
  },
};
const lena = () => contactContent('lena', [chat], { signInAfterMs: 2000 });

/** Simulates a page reload: drop the engine, hydrate a fresh store, sign in again. */
function reload(previous: ReturnType<typeof setup>) {
  previous.engine.dispose();
  const next = setup([lena()]);
  next.engine.signIn();
  return next;
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('resume after reload', () => {
  it('persists progress but not runtime presence', () => {
    const t = setup([lena()]);
    t.engine.signIn();
    vi.advanceTimersByTime(2000 + 1000 + 120);
    const saved = JSON.parse(localStorage.getItem(storageKey('messenger'))!);
    expect(Object.keys(saved.state)).toEqual(['progress']);
    expect(saved.state.progress.contacts.lena.active).toMatchObject({
      scriptId: 'chat',
      lineIndex: 1,
    });
  });

  it('continues with the next undelivered line and never repeats a message', () => {
    const t1 = setup([lena()]);
    t1.engine.signIn();
    vi.advanceTimersByTime(2000 + 1000 + 120); // "one" delivered
    vi.advanceTimersByTime(1000 + 60); // mid-typing "two"
    expect(t1.said('lena')).toEqual(['< one']);

    const t2 = reload(t1);
    expect(t2.said('lena')).toEqual(['< one']);
    expect(t2.store.getState().online.lena).toBeUndefined(); // offline again until signInAfterMs
    vi.advanceTimersByTime(2000);
    expect(t2.take()).toEqual(['signedIn lena online toast']); // no new "start": resumed, not restarted
    vi.advanceTimersByTime(10_000);
    expect(t2.said('lena')).toEqual(['< one', '< two', '< three']);
    expect(t2.engine.getChoices('lena')?.map((c) => c.text)).toEqual([
      'left',
      'right',
    ]);
  });

  it('re-offers pending choices after reload and continues the chosen branch', () => {
    const t1 = setup([lena()]);
    t1.engine.signIn();
    vi.advanceTimersByTime(20_000);
    expect(t1.progress('lena').active?.awaitingChoice).toBe(true);

    const t2 = reload(t1);
    expect(t2.engine.getChoices('lena')).not.toBeNull();
    vi.advanceTimersByTime(2000);
    expect(t2.take()).toEqual([
      'signedIn lena online toast',
      'choices lena left|right',
    ]);
    t2.engine.choose('lena', 1);
    vi.advanceTimersByTime(5000);
    expect(t2.said('lena')).toEqual([
      '< one',
      '< two',
      '< three',
      '> right',
      '< went right',
    ]);

    // A finished non-repeat script doesn't run again on the next reload.
    const t3 = reload(t2);
    vi.advanceTimersByTime(60_000);
    expect(t3.said('lena')).toEqual([
      '< one',
      '< two',
      '< three',
      '> right',
      '< went right',
    ]);
    expect(t3.log).not.toContain('start lena/chat');
  });

  it('keeps queued triggers across reloads without duplicating them', () => {
    const content = () =>
      contactContent('a', [
        {
          ...say('first', { type: 'onSignIn' }, []),
          nodes: { only: { lines: [line('first', 2 * 60_000)], end: true } },
        },
        say('later', { type: 'afterMinutes', minutes: 1 }, ['later!']),
      ]);
    const t1 = setup([content()]);
    t1.engine.signIn();
    vi.advanceTimersByTime(90_000); // "later" fired while "first" is active → queued
    expect(t1.progress('a').queue).toEqual([
      { scriptId: 'later', context: {} },
    ]);
    t1.engine.dispose();

    const t2 = setup([content()]);
    t2.engine.signIn();
    // The new afterMinutes countdown fires again but "later" is already queued.
    vi.advanceTimersByTime(10 * 60_000);
    expect(t2.said('a')).toEqual(['< first', '< later!']);
    expect(t2.progress('a').queue).toEqual([]);
    expect(t2.progress('a').scripts.later?.runs).toBe(1);
  });

  it('drops progress that no longer matches the content', () => {
    const t1 = setup([lena()]);
    t1.store.setState({
      progress: {
        ...t1.store.getState().progress,
        contacts: {
          lena: {
            ...t1.store.getState().progress.contacts.lena!,
            ...{
              everSignedIn: true,
              status: 'away',
              personalMessage: 'pm',
              active: {
                scriptId: 'gone',
                nodeId: 'x',
                lineIndex: 0,
                awaitingChoice: false,
                context: {},
              },
              queue: [{ scriptId: 'also-gone', context: {} }],
              scripts: {},
              transcript: [],
              unread: 0,
            },
          },
        },
      },
    });
    t1.engine.signIn();
    vi.advanceTimersByTime(2000);
    // Returning contacts sign in with their last status.
    expect(t1.take()).toEqual(['signedIn lena away toast', 'start lena/chat']);
    expect(t1.progress('lena').queue).toEqual([]);
  });
});
