import { beforeEach, describe, expect, it } from 'vitest';
import { events } from './events';
import { NOW_PLAYING_IDLE, useNowPlayingStore } from './nowPlaying';

const track = {
  trackId: 't1',
  artist: 'Band',
  title: 'Song',
  durationSec: 120,
};

describe('now playing store', () => {
  beforeEach(() => useNowPlayingStore.setState({ ...NOW_PLAYING_IDLE }));

  it('follows track changes and clears on stop', () => {
    events.emit('amplifier:trackChanged', track);
    expect(useNowPlayingStore.getState()).toEqual({
      track: { trackId: 't1', artist: 'Band', title: 'Song' },
      playing: true,
      position: 0,
      duration: 120,
    });

    events.emit('amplifier:stopped', { trackId: 't1' });
    expect(useNowPlayingStore.getState()).toEqual(NOW_PLAYING_IDLE);
  });

  it('takes position and pause state from progress for the current track', () => {
    events.emit('amplifier:trackChanged', track);
    events.emit('amplifier:progress', {
      trackId: 't1',
      position: 42,
      duration: 118,
      playing: false,
    });
    expect(useNowPlayingStore.getState()).toMatchObject({
      track: { trackId: 't1' },
      playing: false,
      position: 42,
      duration: 118,
    });

    events.emit('amplifier:progress', {
      trackId: 'other',
      position: 5,
      duration: 60,
      playing: true,
    });
    expect(useNowPlayingStore.getState().position).toBe(42);
  });

  it('ignores progress before any track was announced', () => {
    events.emit('amplifier:progress', {
      trackId: 't1',
      position: 3,
      duration: 120,
      playing: true,
    });
    expect(useNowPlayingStore.getState()).toEqual(NOW_PLAYING_IDLE);
  });
});
