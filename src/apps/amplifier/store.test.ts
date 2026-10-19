import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import type { PlaylistTrack } from '@/content/playlist';
import { PLAYLIST } from '@/content/playlist';
import { applyControl, createAmplifierStore } from './store';

const track = (n: number): PlaylistTrack => ({
  id: `t${n}`,
  title: `Title ${n}`,
  artist: 'Artist',
  file: `music/t${n}.mp3`,
  durationSec: 100 + n,
  license: 'CC BY 4.0',
});
const LIST = [track(0), track(1), track(2)];

/** A minimal audio element: records calls, lets tests fire media events. */
function fakeAudio() {
  const target = new EventTarget();
  const audio = Object.assign(target, {
    src: '',
    currentTime: 0,
    duration: NaN,
    volume: 1,
    muted: false,
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    removeAttribute: vi.fn(),
  });
  return audio as unknown as HTMLAudioElement & {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  };
}

function setup() {
  const audio = fakeAudio();
  const store = createAmplifierStore({ audio, playlist: LIST });
  return { audio, store, get: store.getState };
}

describe('amplifier store', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ muted: false });
  });
  afterEach(() => {
    events.clear();
    vi.restoreAllMocks();
  });

  it('plays the first track and emits trackChanged', () => {
    const changed = vi.fn();
    events.on('amplifier:trackChanged', changed);
    const { audio, get } = setup();

    get().play();

    expect(get().status).toBe('playing');
    expect(get().index).toBe(0);
    expect(audio.src).toMatch(/music\/t0\.mp3$/);
    expect(audio.play).toHaveBeenCalled();
    expect(changed).toHaveBeenCalledWith({
      trackId: 't0',
      artist: 'Artist',
      title: 'Title 0',
      durationSec: 100,
    });
  });

  it('pauses and resumes without re-emitting trackChanged', () => {
    const changed = vi.fn();
    const { audio, get } = setup();
    get().play();
    events.on('amplifier:trackChanged', changed);

    get().pause();
    expect(get().status).toBe('paused');
    expect(audio.pause).toHaveBeenCalled();

    get().togglePlay();
    expect(get().status).toBe('playing');
    expect(changed).not.toHaveBeenCalled();
  });

  it('stop resets to 0, emits stopped, and play restarts the track', () => {
    const stopped = vi.fn();
    events.on('amplifier:stopped', stopped);
    const { audio, get } = setup();
    get().playIndex(1);
    audio.currentTime = 40;

    get().stop();

    expect(get().status).toBe('stopped');
    expect(get().currentTime).toBe(0);
    expect(audio.currentTime).toBe(0);
    expect(stopped).toHaveBeenCalledWith({ trackId: 't1' });

    get().play();
    expect(get().index).toBe(1);
    expect(get().status).toBe('playing');
  });

  it('next and prev move through the list and wrap', () => {
    const { get } = setup();
    get().playIndex(2);
    get().next();
    expect(get().index).toBe(0);
    get().prev();
    expect(get().index).toBe(2);
    get().prev();
    expect(get().index).toBe(1);
  });

  it('prev restarts the track after 3 seconds', () => {
    const { audio, get, store } = setup();
    get().playIndex(1);
    store.setState({ currentTime: 10 });

    get().prev();

    expect(get().index).toBe(1);
    expect(audio.currentTime).toBe(0);
  });

  it('seek clamps to the duration and updates currentTime', () => {
    const { audio, get } = setup();
    get().playIndex(0);
    get().seek(30);
    expect(audio.currentTime).toBe(30);
    expect(get().currentTime).toBe(30);
    get().seek(9999);
    expect(get().currentTime).toBe(100);
    get().seek(-5);
    expect(get().currentTime).toBe(0);
  });

  it('volume is clamped, applied to the element, and persisted', () => {
    const { audio, get } = setup();
    get().setVolume(0.3);
    expect(audio.volume).toBe(0.3);
    get().setVolume(4);
    expect(get().volume).toBe(1);

    get().setVolume(0.25);
    const restored = setup();
    expect(restored.get().volume).toBe(0.25);
    expect(restored.audio.volume).toBe(0.25);
  });

  it('persists shuffle and repeat, ignoring junk', () => {
    const { get } = setup();
    get().toggleShuffle();
    get().cycleRepeat();
    expect(setup().get()).toMatchObject({ shuffle: true, repeat: 'all' });

    localStorage.setItem(
      'still-online:v1:amplifier',
      JSON.stringify({
        version: 1,
        state: { volume: 'x', repeat: 'bogus', shuffle: 3 },
      }),
    );
    expect(setup().get()).toMatchObject({
      volume: 0.7,
      repeat: 'off',
      shuffle: false,
    });
  });

  it('EQ actions clamp, presets apply, and the curve persists', () => {
    const { get } = setup();
    expect(get().eq).toEqual({
      on: false,
      preamp: 0,
      bands: Array(10).fill(0),
    });
    get().toggleEq();
    get().setPreamp(30);
    get().setBand(2, -5);
    get().setBand(10, 5);
    expect(get().eq).toEqual({
      on: true,
      preamp: 12,
      bands: [0, 0, -5, 0, 0, 0, 0, 0, 0, 0],
    });
    expect(setup().get().eq).toEqual(get().eq);

    get().toggleEq();
    get().applyPreset('Bass Boost');
    expect(get().eq).toEqual({
      on: true,
      preamp: -2,
      bands: [9, 8, 6, 3, 0, 0, 0, 0, 0, 0],
    });
    get().applyPreset('Nope' as 'Rock');
    expect(get().eq.preamp).toBe(-2);
    expect(setup().get().eq.bands[0]).toBe(9);

    localStorage.setItem(
      'still-online:v1:amplifier',
      JSON.stringify({
        version: 1,
        state: { eq: { on: 1, preamp: 'x', bands: [99] } },
      }),
    );
    expect(setup().get().eq).toEqual({
      on: false,
      preamp: 0,
      bands: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
  });

  it('cycles repeat off → all → one → off', () => {
    const { get } = setup();
    get().cycleRepeat();
    expect(get().repeat).toBe('all');
    get().cycleRepeat();
    expect(get().repeat).toBe('one');
    get().cycleRepeat();
    expect(get().repeat).toBe('off');
  });

  describe('auto-advance on ended', () => {
    it('advances to the next track', () => {
      const changed = vi.fn();
      const { audio, get } = setup();
      get().playIndex(0);
      events.on('amplifier:trackChanged', changed);

      audio.dispatchEvent(new Event('ended'));

      expect(get().index).toBe(1);
      expect(get().status).toBe('playing');
      expect(changed).toHaveBeenCalledWith(
        expect.objectContaining({ trackId: 't1' }),
      );
    });

    it('stops after the last track when repeat is off', () => {
      const stopped = vi.fn();
      const { audio, get } = setup();
      get().playIndex(2);
      events.on('amplifier:stopped', stopped);

      audio.dispatchEvent(new Event('ended'));

      expect(get().status).toBe('stopped');
      expect(stopped).toHaveBeenCalledWith({ trackId: 't2' });
    });

    it('wraps with repeat all and replays with repeat one', () => {
      const { audio, get } = setup();
      get().playIndex(2);
      get().cycleRepeat();
      audio.dispatchEvent(new Event('ended'));
      expect(get().index).toBe(0);

      get().cycleRepeat();
      audio.dispatchEvent(new Event('ended'));
      expect(get().index).toBe(0);
      expect(get().status).toBe('playing');
    });
  });

  it('shuffle never repeats the current track immediately', () => {
    const { get } = setup();
    get().toggleShuffle();
    get().playIndex(0);
    for (let i = 0; i < 200; i++) {
      const before = get().index;
      get().next();
      expect(get().index).not.toBe(before);
    }
  });

  it('shuffle prev walks back through played tracks', () => {
    const { get } = setup();
    get().toggleShuffle();
    get().playIndex(0);
    get().next();
    const second = get().index;
    get().next();
    get().prev();
    expect(get().index).toBe(second);
    get().prev();
    expect(get().index).toBe(0);
  });

  it('mirrors timeupdate and loadedmetadata from the element', () => {
    const { audio, get } = setup();
    get().playIndex(0);
    audio.currentTime = 12;
    audio.dispatchEvent(new Event('timeupdate'));
    expect(get().currentTime).toBe(12);

    Object.assign(audio, { duration: 98.5 });
    audio.dispatchEvent(new Event('loadedmetadata'));
    expect(get().duration).toBe(98.5);
  });

  it('follows the global mute setting', () => {
    const { audio } = setup();
    expect(audio.muted).toBe(false);
    useSettingsStore.getState().setMuted(true);
    expect(audio.muted).toBe(true);
    useSettingsStore.getState().setMuted(false);
    expect(audio.muted).toBe(false);
  });

  it('falls back to paused when play() is rejected', async () => {
    const { audio, get } = setup();
    audio.play.mockRejectedValueOnce(new Error('NotAllowedError'));
    get().play();
    await Promise.resolve();
    await Promise.resolve();
    expect(get().status).toBe('paused');
  });

  it('load replaces the playlist and emits stopped for the current track', () => {
    const stopped = vi.fn();
    const { get } = setup();
    get().playIndex(1);
    events.on('amplifier:stopped', stopped);

    get().load([track(9)]);

    expect(get().index).toBe(-1);
    expect(get().status).toBe('stopped');
    expect(get().playlist).toHaveLength(1);
    expect(stopped).toHaveBeenCalledWith({ trackId: 't1' });
  });

  describe('playlist editing', () => {
    it('removeAt drops a row and keeps the current track selected', () => {
      const { get } = setup();
      get().playIndex(2);
      get().removeAt(0);
      expect(get().playlist.map((t) => t.id)).toEqual(['t1', 't2']);
      expect(get().index).toBe(1);
      expect(get().status).toBe('playing');
    });

    it('removing the playing track stops it', () => {
      const stopped = vi.fn();
      events.on('amplifier:stopped', stopped);
      const { audio, get } = setup();
      get().playIndex(1);
      get().removeAt(1);
      expect(get().index).toBe(-1);
      expect(get().status).toBe('stopped');
      expect(audio.pause).toHaveBeenCalled();
      expect(stopped).toHaveBeenCalledWith({ trackId: 't1' });
    });

    it('moveTrack reorders and follows the current track', () => {
      const { get } = setup();
      get().playIndex(0);
      get().moveTrack(0, 2);
      expect(get().playlist.map((t) => t.id)).toEqual(['t1', 't2', 't0']);
      expect(get().index).toBe(2);
      get().moveTrack(0, 1);
      expect(get().playlist.map((t) => t.id)).toEqual(['t2', 't1', 't0']);
      expect(get().index).toBe(2);
      get().moveTrack(2, 0);
      expect(get().index).toBe(0);
      get().moveTrack(0, 9);
      expect(get().playlist.map((t) => t.id)).toEqual(['t0', 't2', 't1']);
    });

    it('addTrack appends once and returns the index', () => {
      const { get } = setup();
      const extra = track(7);
      expect(get().addTrack(extra)).toBe(3);
      expect(get().addTrack(extra)).toBe(3);
      expect(get().addTrack(LIST[0] as PlaylistTrack)).toBe(0);
      expect(get().playlist).toHaveLength(4);
    });

    it('persists the edited playlist as track ids', () => {
      const [a, b] = PLAYLIST as [PlaylistTrack, PlaylistTrack];
      const first = createAmplifierStore({
        audio: fakeAudio(),
        playlist: [a, b],
      });
      first.getState().removeAt(0);
      const raw = JSON.parse(
        localStorage.getItem('still-online:v1:amplifier') as string,
      );
      expect(raw.state.playlist).toEqual([b.id]);

      const second = createAmplifierStore({
        audio: fakeAudio(),
        playlist: [a, b],
      });
      expect(second.getState().playlist.map((t) => t.id)).toEqual([b.id]);
    });

    it('drops unknown and duplicate ids when hydrating', () => {
      localStorage.setItem(
        'still-online:v1:amplifier',
        JSON.stringify({
          version: 1,
          state: {
            playlist: [
              (PLAYLIST[1] as PlaylistTrack).id,
              'nope',
              (PLAYLIST[1] as PlaylistTrack).id,
              7,
            ],
          },
        }),
      );
      const store = createAmplifierStore({ audio: fakeAudio() });
      expect(store.getState().playlist.map((t) => t.id)).toEqual([
        (PLAYLIST[1] as PlaylistTrack).id,
      ]);
    });
  });

  describe('amplifier:progress and amplifier:control (P1-02)', () => {
    it('emits progress once per whole second and on pause/resume', () => {
      const progress = vi.fn();
      events.on('amplifier:progress', progress);
      const { audio, get } = setup();

      get().playIndex(1);
      expect(progress).toHaveBeenLastCalledWith({
        trackId: 't1',
        position: 0,
        duration: 101,
        playing: true,
      });
      const calls = progress.mock.calls.length;

      audio.currentTime = 0.4;
      audio.dispatchEvent(new Event('timeupdate'));
      expect(progress).toHaveBeenCalledTimes(calls);
      audio.currentTime = 1.2;
      audio.dispatchEvent(new Event('timeupdate'));
      expect(progress).toHaveBeenCalledTimes(calls + 1);
      expect(progress).toHaveBeenLastCalledWith(
        expect.objectContaining({ position: 1, playing: true }),
      );

      get().pause();
      expect(progress).toHaveBeenLastCalledWith(
        expect.objectContaining({ position: 1, playing: false }),
      );
      get().play();
      expect(progress).toHaveBeenLastCalledWith(
        expect.objectContaining({ playing: true }),
      );

      const before = progress.mock.calls.length;
      get().stop();
      expect(progress).toHaveBeenCalledTimes(before);
    });

    it('pauses, resumes and stops on control actions', () => {
      const stopped = vi.fn();
      events.on('amplifier:stopped', stopped);
      const { store, get } = setup();

      applyControl(store, 'resume');
      expect(get().status).toBe('stopped'); // resume never starts from scratch

      get().playIndex(0);
      applyControl(store, 'pause');
      expect(get().status).toBe('paused');
      applyControl(store, 'resume');
      expect(get().status).toBe('playing');
      expect(get().index).toBe(0);
      applyControl(store, 'stop');
      expect(get().status).toBe('stopped');
      expect(stopped).toHaveBeenCalledWith({ trackId: 't0' });
    });
  });
});
