import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contactContent, say, setup } from './test-helpers';

const MIN = 60_000;
const track = (trackId: string) => ({
  trackId,
  artist: 'The Paper Kites',
  title: 'Song ' + trackId,
});

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('onSignIn', () => {
  it('runs once ever unless repeat', () => {
    const t = setup([
      contactContent('a', [
        say('once', { type: 'onSignIn' }, ['hi']),
        say('every', { type: 'onSignIn' }, ['hey again'], true),
      ]),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(1000);
    t.engine.signOut();
    t.engine.signIn();
    vi.advanceTimersByTime(1000);
    expect(t.said('a')).toEqual(['< hi', '< hey again', '< hey again']);
  });
});

describe('afterMinutes', () => {
  it('fires N minutes after the player signs in', () => {
    const t = setup([
      contactContent('a', [
        say('later', { type: 'afterMinutes', minutes: 2 }, ['still there?']),
      ]),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(2 * MIN - 1);
    expect(t.log).not.toContain('start a/later');
    vi.advanceTimersByTime(1);
    expect(t.log).toContain('start a/later');
  });

  it('queues when the contact is not signed in yet and starts on sign-in', () => {
    const t = setup([
      contactContent(
        'a',
        [say('later', { type: 'afterMinutes', minutes: 1 }, ['finally'])],
        {
          signInAfterMs: 3 * MIN,
        },
      ),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(MIN);
    expect(t.progress('a').queue).toEqual([{ scriptId: 'later', context: {} }]);
    vi.advanceTimersByTime(2 * MIN);
    expect(t.take()).toEqual(['signedIn a online toast', 'start a/later']);
    expect(t.progress('a').queue).toEqual([]);
  });

  it('restarts its countdown per sign-in but still runs once', () => {
    const t = setup([
      contactContent('a', [
        say('later', { type: 'afterMinutes', minutes: 1 }, ['yo']),
      ]),
    ]);
    t.engine.signIn();
    vi.advanceTimersByTime(MIN / 2);
    t.engine.signOut();
    t.engine.signIn();
    vi.advanceTimersByTime(MIN / 2);
    expect(t.said('a')).toEqual([]);
    vi.advanceTimersByTime(MIN / 2 + 1000);
    t.engine.signOut();
    t.engine.signIn();
    vi.advanceTimersByTime(2 * MIN);
    expect(t.said('a')).toEqual(['< yo']);
  });
});

describe('onNowPlaying', () => {
  it('fires for any track with artist/title placeholders, once per trackId when repeatable', () => {
    const t = setup([
      contactContent('a', [
        say('np', { type: 'onNowPlaying' }, ['ooh {artist} - {title}'], true),
      ]),
    ]);
    t.engine.signIn();
    t.engine.nowPlaying(track('t1'));
    vi.advanceTimersByTime(5000);
    t.engine.nowPlaying(track('t1'));
    t.engine.nowPlaying(track('t2'));
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual([
      '< ooh The Paper Kites - Song t1',
      '< ooh The Paper Kites - Song t2',
    ]);
    expect(t.progress('a').scripts.np).toMatchObject({
      runs: 2,
      trackIds: ['t1', 't2'],
    });
  });

  it('fires only for its trackId; without repeat it runs once ever', () => {
    const t = setup([
      contactContent('a', [
        say('two', { type: 'onNowPlaying', trackId: 't2' }, [
          'i love this one',
        ]),
      ]),
    ]);
    t.engine.signIn();
    t.engine.nowPlaying(track('t1'));
    expect(t.log).not.toContain('start a/two');
    t.engine.nowPlaying(track('t2'));
    vi.advanceTimersByTime(5000);
    t.engine.nowPlaying(track('t2'));
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual(['< i love this one']);
  });

  it('is ignored while the player is signed out of Messenger', () => {
    const t = setup([
      contactContent('a', [say('np', { type: 'onNowPlaying' }, ['x'])]),
    ]);
    t.engine.nowPlaying(track('t1'));
    expect(t.store.getState().progress.contacts.a).toBeUndefined();
  });
});

describe('onPlayerNudge', () => {
  it('records the nudge, emits it and triggers a repeatable reaction', () => {
    const t = setup([
      contactContent('a', [
        say('ow', { type: 'onPlayerNudge' }, ['OW lol'], true),
      ]),
    ]);
    t.engine.signIn();
    t.take();
    t.engine.playerNudge('a');
    expect(t.take()).toEqual(['nudge player a', 'start a/ow']);
    vi.advanceTimersByTime(1000);
    t.engine.playerNudge('a');
    vi.advanceTimersByTime(1000);
    expect(t.said('a')).toEqual([
      'nudge player',
      '< OW lol',
      'nudge player',
      '< OW lol',
    ]);
  });

  it('ignores a nudge for a script that is already running or queued', () => {
    const t = setup([
      contactContent('a', [say('ow', { type: 'onPlayerNudge' }, ['OW'], true)]),
    ]);
    t.engine.signIn();
    t.engine.playerNudge('a');
    t.engine.playerNudge('a');
    vi.advanceTimersByTime(1000);
    expect(t.said('a').filter((s) => s === '< OW')).toHaveLength(1);
  });

  it('does nothing for unknown contacts or while signed out', () => {
    const t = setup([contactContent('a', [])]);
    t.engine.playerNudge('a');
    t.engine.signIn();
    t.take();
    t.engine.playerNudge('ghost');
    expect(t.log).toEqual([]);
  });
});

describe('one script per contact', () => {
  it('queues later triggers FIFO and runs them when the active script ends', () => {
    const t = setup([
      contactContent('a', [
        say('first', { type: 'onSignIn' }, ['one', 'two']),
        say('ow', { type: 'onPlayerNudge' }, ['ow'], true),
        say('np', { type: 'onNowPlaying' }, ['nice song']),
      ]),
      contactContent('b', [say('hi', { type: 'onSignIn' }, ['b here'])]),
    ]);
    t.engine.signIn();
    t.engine.playerNudge('a');
    t.engine.nowPlaying(track('t1'));
    expect(t.progress('a').queue.map((q) => q.scriptId)).toEqual(['ow', 'np']);
    vi.advanceTimersByTime(10_000);
    expect(t.said('a')).toEqual([
      'nudge player',
      '< one',
      '< two',
      '< ow',
      '< nice song',
    ]);
    // Other contacts run in parallel.
    expect(t.said('b')).toEqual(['< b here']);
    expect(t.log.filter((l) => l.startsWith('end a/'))).toEqual([
      'end a/first',
      'end a/ow',
      'end a/np',
    ]);
  });
});
