// What the player is listening to, kept by the OS from the Amplifier's events so any app can
// read it at any time (events alone are missed by apps that weren't listening yet).
import { create } from 'zustand';
import { events } from './events';

export interface NowPlaying {
  trackId: string;
  artist: string;
  title: string;
}

export interface NowPlayingState {
  /** A paused track still counts as "listening"; only a stop (or closing the player) clears it. */
  track: NowPlaying | null;
  /** Audio is actually running (false while paused or stopped). */
  playing: boolean;
  /** Seconds into `track`, from `amplifier:progress`. */
  position: number;
  /** Seconds; the playlist length until the file's metadata says otherwise. */
  duration: number;
}

export const NOW_PLAYING_IDLE: NowPlayingState = {
  track: null,
  playing: false,
  position: 0,
  duration: 0,
};

export const useNowPlayingStore = create<NowPlayingState>()(() => ({
  ...NOW_PLAYING_IDLE,
}));

events.on('amplifier:trackChanged', ({ trackId, artist, title, durationSec }) =>
  useNowPlayingStore.setState({
    track: { trackId, artist, title },
    playing: true,
    position: 0,
    duration: durationSec,
  }),
);
events.on('amplifier:stopped', () =>
  useNowPlayingStore.setState({ ...NOW_PLAYING_IDLE }),
);
events.on('amplifier:progress', ({ trackId, position, duration, playing }) => {
  // Progress for a track we never heard start (the mirror loaded late) is ignored.
  if (useNowPlayingStore.getState().track?.trackId !== trackId) return;
  useNowPlayingStore.setState({ playing, position, duration });
});
