// What the player is listening to, kept by the OS from the Amplifier's events so any app can
// read it at any time (events alone are missed by apps that weren't listening yet).
import { create } from 'zustand';
import { events } from './events';

export interface NowPlaying {
  trackId: string;
  artist: string;
  title: string;
}

export const useNowPlayingStore = create<{ track: NowPlaying | null }>()(
  () => ({ track: null }),
);

// A paused track still counts as "listening"; only a stop (or closing the player) clears it.
events.on('amplifier:trackChanged', ({ trackId, artist, title }) =>
  useNowPlayingStore.setState({ track: { trackId, artist, title } }),
);
events.on('amplifier:stopped', () =>
  useNowPlayingStore.setState({ track: null }),
);
