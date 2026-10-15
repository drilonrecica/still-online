// Amplifier playback store: one HTMLAudioElement behind a Zustand store.
// Persisted under `still-online:v1:amplifier` (volume, shuffle, repeat, skin, eq).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import { useSettingsStore } from '@/os/store/settings';
import { PLAYLIST, type PlaylistTrack } from '@/content/playlist';
import {
  clampDb,
  DEFAULT_EQ,
  EQ_PRESET_NAMES,
  presetSettings,
  sanitizeEq,
  type EqPresetName,
  type EqSettings,
} from './eq';

export type RepeatMode = 'off' | 'all' | 'one';
export type PlaybackStatus = 'stopped' | 'playing' | 'paused';
export type AmplifierSkin = 'metal' | 'neon' | 'bubblegum';

export const SKINS: readonly AmplifierSkin[] = ['metal', 'neon', 'bubblegum'];

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
  skin: AmplifierSkin;
  eq: EqSettings;

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
  setSkin: (skin: AmplifierSkin) => void;
  cycleSkin: () => void;
  toggleEq: () => void;
  setPreamp: (db: number) => void;
  setBand: (band: number, db: number) => void;
  applyPreset: (name: EqPresetName) => void;
}

interface PersistedAmplifier {
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  skin: AmplifierSkin;
  eq: EqSettings;
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
      skin: 'metal',
      eq: DEFAULT_EQ,

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

      setSkin: (skin) => {
        if (SKINS.includes(skin)) set({ skin });
      },

      cycleSkin: () =>
        set((s) => ({
          skin: SKINS[(SKINS.indexOf(s.skin) + 1) % SKINS.length],
        })),

      toggleEq: () => set((s) => ({ eq: { ...s.eq, on: !s.eq.on } })),

      setPreamp: (db) => set((s) => ({ eq: { ...s.eq, preamp: clampDb(db) } })),

      setBand: (band, db) => {
        if (band < 0 || band >= get().eq.bands.length) return;
        set((s) => ({
          eq: {
            ...s.eq,
            bands: s.eq.bands.map((b, i) => (i === band ? clampDb(db) : b)),
          },
        }));
      },

      applyPreset: (name) => {
        if (EQ_PRESET_NAMES.includes(name)) set({ eq: presetSettings(name) });
      },
    };
  };
}

function withPersist(deps: AmplifierDeps) {
  return persist(
    createCreator(deps),
    persistOptions<AmplifierStore, PersistedAmplifier>({
      name: 'amplifier',
      partialize: ({ volume, shuffle, repeat, skin, eq }) => ({
        volume,
        shuffle,
        repeat,
        skin,
        eq,
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
        const skin = SKINS.includes(persisted.skin as AmplifierSkin)
          ? (persisted.skin as AmplifierSkin)
          : current.skin;
        return {
          ...current,
          volume,
          repeat,
          skin,
          eq: sanitizeEq(persisted.eq),
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
audio.preload = 'none';
/** The app's one audio element, for the visualizer's analyser. */
export const amplifierAudio: HTMLAudioElement = audio;
export const useAmplifierStore = create<AmplifierStore>()(
  withPersist({ audio }),
);
bindVolume(useAmplifierStore, audio);

// `amplifier:enqueue`: add the track to the playlist if it's missing, then play it on request.
// Opening the window is `os/amplifierRouter.ts`' job.
events.on('amplifier:enqueue', ({ trackId, play }) => {
  const state = useAmplifierStore.getState();
  let index = state.playlist.findIndex((t) => t.id === trackId);
  if (index < 0) {
    const track = PLAYLIST.find((t) => t.id === trackId);
    if (!track) return;
    useAmplifierStore.setState({ playlist: [...state.playlist, track] });
    index = state.playlist.length;
  }
  if (play) useAmplifierStore.getState().playIndex(index);
});
