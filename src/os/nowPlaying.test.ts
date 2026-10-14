import { beforeEach, describe, expect, it } from 'vitest';
import { events } from './events';
import { useNowPlayingStore } from './nowPlaying';

const track = {
  trackId: 't1',
  artist: 'Band',
  title: 'Song',
  durationSec: 120,
};

describe('now playing store', () => {
  beforeEach(() => useNowPlayingStore.setState({ track: null }));

  it('follows track changes and clears on stop', () => {
    events.emit('amplifier:trackChanged', track);
    expect(useNowPlayingStore.getState().track).toEqual({
      trackId: 't1',
      artist: 'Band',
      title: 'Song',
    });

    events.emit('amplifier:stopped', { trackId: 't1' });
    expect(useNowPlayingStore.getState().track).toBeNull();
  });
});
