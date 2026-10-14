// Amplifier playback store: one HTMLAudioElement behind a Zustand store.
// Persisted under `still-online:v1:amplifier` (volume, shuffle, repeat).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import { useSettingsStore } from '@/os/store/settings';
import { PLAYLIST, type PlaylistTrack } from '@/content/playlist';

export type RepeatMode = 'off' | 'all' | 'one';
export type PlaybackStatus = 'stopped' | 'playing' | 'paused';

const REPEAT_MODES: readonly RepeatMode[] = ['off', 'all', 'one'];
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export interface AmplifierStore {
  playlist: readonly PlaylistTrack[];
  /** Index into `playlist`, or -1 before anything has been selected. */
  index: number;
  status: PlaybackStatus;
  /** Seconds. */
  currentTime: number;
  /** Seconds; falls back to the playlist's `durationSec` until metadata loads. */
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;

  load: (playlist: readonly PlaylistTrack[]) => void;
  /** Starts the track at `index` from the beginning. */
  playIndex: (index: number) => void;
  /** Resumes the current track, or starts the first one (random when shuffling). */
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

interface PersistedAmplifier {
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

export interface AmplifierDeps {
  /** The one audio element. Injected by tests. */
  audio: HTMLAudioElement;
  playlist?: readonly PlaylistTrack[];
}

const trackUrl = (track: PlaylistTrack) =>
  `${import.meta.env.BASE_URL}${track.file}`;

/** Picks a random index that differs from `current` whenever there is a choice. */
function randomIndex(length: number, current: number): number {
  if (length <= 1) return 0;
  let i = Math.floor(Math.random() * (length - 1));
  if (current >= 0 && i >= current) i += 1;
  return Math.min(i, length - 1);
}

function createCreator({
  audio,
  playlist = PLAYLIST,
}: AmplifierDeps): StateCreator<AmplifierStore> {
  return (set, get) => {
    /** Indices played before the current one while shuffling, for `prev`. */
    let history: number[] = [];

    const track = () => get().playlist[get().index];

    const syncMuted = () => {
      audio.muted = useSettingsStore.getState().muted;
    };

    const startPlayback = () => {
      void Promise.resolve(audio.play()).catch(() => {
        // Autoplay blocked or the file failed: fall back to paused, keep the track.
        if (get().status === 'playing') set({ status: 'paused' });
      });
    };

    const emitStopped = (trackId: string | null) =>
      events.emit('amplifier:stopped', { trackId });

    const select = (index: number) => {
      const t = get().playlist[index];
      if (!t) return;
      audio.src = trackUrl(t);
      audio.currentTime = 0;
      set({
        index,
        status: 'playing',
        currentTime: 0,
        duration: t.durationSec,
      });
      startPlayback();
      events.emit('amplifier:trackChanged', {
        trackId: t.id,
        artist: t.artist,
        title: t.title,
        durationSec: t.durationSec,
      });
    };

    const stopAtEnd = () => {
      const id = track()?.id ?? null;
      audio.pause();
      audio.currentTime = 0;
      set({ status: 'stopped', currentTime: 0 });
      emitStopped(id);
    };

    /** Index to move to, or null when playback should end. `wrap` allows past-the-end. */
    const nextIndex = (wrap: boolean): number | null => {
      const { playlist: list, index, shuffle } = get();
      if (list.length === 0) return null;
      if (shuffle) return randomIndex(list.length, index);
      if (index + 1 < list.length) return index + 1;
      return wrap ? 0 : null;
    };

    const advance = (nextI: number) => {
      const { index, shuffle } = get();
      if (shuffle && index >= 0) history.push(index);
      select(nextI);
    };

    syncMuted();
    useSettingsStore.subscribe(syncMuted);

    audio.addEventListener('timeupdate', () => {
      set({ currentTime: audio.currentTime });
    });
    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        set({ duration: audio.duration });
      }
    });
    audio.addEventListener('ended', () => {
      const { repeat } = get();
      if (repeat === 'one') {
        select(get().index);
        return;
      }
      const i = nextIndex(repeat === 'all');
      if (i === null) stopAtEnd();
      else advance(i);
    });

    return {
      playlist,
      index: -1,
      status: 'stopped',
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      shuffle: false,
      repeat: 'off',

      load: (list) => {
        audio.pause();
        history = [];
        const hadTrack = track();
        audio.removeAttribute('src');
        set({
          playlist: list,
          index: -1,
          status: 'stopped',
          currentTime: 0,
          duration: 0,
        });
        if (hadTrack) emitStopped(hadTrack.id);
      },

      playIndex: (index) => {
        if (index < 0 || index >= get().playlist.length) return;
        const { index: current, shuffle } = get();
        if (shuffle && current >= 0 && current !== index) history.push(current);
        select(index);
      },

      play: () => {
        const { index, status, playlist: list, shuffle } = get();
        if (list.length === 0) return;
        if (index < 0) {
          select(shuffle ? randomIndex(list.length, -1) : 0);
          return;
        }
        if (status === 'playing') return;
        if (status === 'stopped') {
          select(index);
          return;
        }
        set({ status: 'playing' });
        startPlayback();
      },

      pause: () => {
        if (get().status !== 'playing') return;
        audio.pause();
        set({ status: 'paused' });
      },

      togglePlay: () => {
        if (get().status === 'playing') get().pause();
        else get().play();
      },

      stop: () => {
        if (get().status === 'stopped') return;
        stopAtEnd();
      },

      next: () => {
        const { playlist: list } = get();
        if (list.length === 0) return;
        // A manual skip always wraps, regardless of repeat mode.
        const i = nextIndex(true);
        if (i !== null) advance(i);
      },

      prev: () => {
        const { playlist: list, index, shuffle } = get();
        if (list.length === 0) return;
        // Like classic players: past 3 seconds, "previous" restarts the track.
        if (index >= 0 && get().currentTime > 3) {
          get().seek(0);
          return;
        }
        if (shuffle && history.length > 0) {
          select(history.pop() as number);
          return;
        }
        select(index <= 0 ? list.length - 1 : index - 1);
      },

      seek: (seconds) => {
        if (get().index < 0) return;
        const max = get().duration || Infinity;
        const t = Math.min(max, Math.max(0, seconds));
        audio.currentTime = t;
        set({ currentTime: t });
      },

      setVolume: (volume) => {
        set({ volume: clamp01(volume) });
      },

      toggleShuffle: () => {
        history = [];
        set((s) => ({ shuffle: !s.shuffle }));
      },

      cycleRepeat: () =>
        set((s) => ({
          repeat:
            REPEAT_MODES[
              (REPEAT_MODES.indexOf(s.repeat) + 1) % REPEAT_MODES.length
            ],
        })),
    };
  };
}

function withPersist(deps: AmplifierDeps) {
  return persist(
    createCreator(deps),
    persistOptions<AmplifierStore, PersistedAmplifier>({
      name: 'amplifier',
      partialize: ({ volume, shuffle, repeat }) => ({
        volume,
        shuffle,
        repeat,
      }),
      sanitize: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        const volume =
          typeof persisted.volume === 'number' &&
          Number.isFinite(persisted.volume)
            ? clamp01(persisted.volume)
            : current.volume;
        const repeat = REPEAT_MODES.includes(persisted.repeat as RepeatMode)
          ? (persisted.repeat as RepeatMode)
          : current.repeat;
        return {
          ...current,
          volume,
          repeat,
          shuffle:
            typeof persisted.shuffle === 'boolean'
              ? persisted.shuffle
              : current.shuffle,
        };
      },
    }),
  );
}

/** Keeps the element's volume in step with the store, including the hydrated value. */
function bindVolume(store: StoreApi<AmplifierStore>, audio: HTMLAudioElement) {
  audio.volume = store.getState().volume;
  store.subscribe((s) => {
    audio.volume = s.volume;
  });
}

/** A fresh store around the given audio element. Used by tests. */
export function createAmplifierStore(deps: AmplifierDeps) {
  const store = createStore<AmplifierStore>()(withPersist(deps));
  bindVolume(store, deps.audio);
  return store;
}

const audio = new Audio();
export const useAmplifierStore = create<AmplifierStore>()(
  withPersist({ audio }),
);
bindVolume(useAmplifierStore, audio);
