// P2-01: the runtime engine reads the world day and grants unlocks through the world store.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { events } from '@/os/events';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';
import { contactContent, line, say } from './engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';

const gift: Script = {
  id: 'gift',
  trigger: { type: 'onDay', day: 5 },
  start: 'n',
  nodes: {
    n: {
      lines: [line('look at the backrounds', 0, { unlock: 'ponies' })],
      end: true,
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  useSettingsStore.setState({ playerName: 'Ann', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useWorldStore.setState({ ...WORLD_DEFAULTS });
  setMessengerContentsForTests([
    contactContent(
      'pia',
      [gift, say('d2', { type: 'onDay', day: 2 }, ['d2'])],
      {
        days: { 2: { personalMessage: 'missing: 1 pony' } },
      },
    ),
  ]);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  vi.useRealTimers();
});

function signIn() {
  getMessengerEngine().signIn();
  vi.advanceTimersByTime(10_000);
}

const pia = () => useMessengerStore.getState().progress.contacts.pia;

describe('messenger runtime: world wiring', () => {
  it('uses the world day for onDay and presence', () => {
    signIn();
    expect(pia()?.transcript).toEqual([]);
    getMessengerEngine().signOut();
    useWorldStore.setState({ day: 2 });
    signIn();
    expect(pia()?.personalMessage).toBe('missing: 1 pony');
    expect(
      pia()?.transcript.map((e) => e.kind === 'message' && e.text),
    ).toEqual(['d2']);
  });

  it('logging off signs out, so the next day starts a fresh sign-in', () => {
    useSessionStore.setState({ state: 'desktop' });
    signIn();
    expect(useMessengerStore.getState().signedIn).toBe(true);
    useSessionStore.getState().logOff();
    expect(useMessengerStore.getState().signedIn).toBe(false);
    useWorldStore.setState({ day: 2 });
    signIn();
    expect(pia()?.personalMessage).toBe('missing: 1 pony');
    useSessionStore.setState({ state: 'booting' });
  });

  it('game:score on the event bus fires onGameScore scripts', () => {
    setMessengerContentsForTests([
      contactContent('pia', [
        say('pb', { type: 'onGameScore', game: 'pinball' }, ['{score}??']),
      ]),
    ]);
    signIn();
    events.emit('game:score', { game: 'pinball', score: 9000 });
    vi.advanceTimersByTime(10_000);
    expect(
      pia()?.transcript.map((e) => e.kind === 'message' && e.text),
    ).toEqual(['9,000??']);
  });

  it('an unlock line calls world.unlock, which emits world:unlock', () => {
    const unlocked = vi.fn();
    const stop = events.on('world:unlock', unlocked);
    useWorldStore.setState({ day: 5 });
    signIn();
    stop();
    expect(useWorldStore.getState().unlocks).toEqual(['ponies']);
    expect(unlocked).toHaveBeenCalledExactlyOnceWith({ id: 'ponies' });
  });
});
