import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const audio = vi.hoisted(() => ({ oscillators: 0, disconnects: 0 }));

const param = () => ({
  value: 0,
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
});
const node = () => ({
  connect() {},
  disconnect() {
    audio.disconnects++;
  },
});

class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'running';
  destination = {};
  resume() {
    return Promise.resolve();
  }
  createGain() {
    return { ...node(), gain: param() };
  }
  createOscillator() {
    audio.oscillators++;
    return {
      ...node(),
      type: 'sine',
      frequency: param(),
      detune: param(),
      start() {},
      stop() {},
    };
  }
  createBiquadFilter() {
    return { ...node(), type: 'lowpass', frequency: param(), Q: param() };
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { ...node(), buffer: null, start() {}, stop() {} };
  }
}
vi.stubGlobal('AudioContext', FakeAudioContext);
(window as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

const {
  BARS,
  LOOP_SECONDS,
  chiptuneVoices,
  isChiptunePlaying,
  playChiptune,
  stopChiptune,
  subscribeChiptune,
} = await import('./chiptune');
const { resetSoundForTests } = await import('./sound');
const { useSettingsStore } = await import('./store/settings');

describe('chiptune', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    audio.oscillators = 0;
    audio.disconnects = 0;
    resetSoundForTests();
    useSettingsStore.setState({ muted: false, volume: 0.7 });
  });
  afterEach(() => {
    stopChiptune();
    vi.useRealTimers();
  });

  it('is an 8-bar loop whose voices all fit inside it', () => {
    expect(BARS).toBe(8);
    const voices = chiptuneVoices();
    const lead = voices.filter((v) => v.kind === 'tone' && v.wave === 'square');
    expect(lead.length).toBeGreaterThan(30);
    for (const v of voices) {
      expect(v.at).toBeGreaterThanOrEqual(0);
      expect(v.at + v.dur).toBeLessThanOrEqual(LOOP_SECONDS + 1e-9);
    }
    // The melody fills the loop: its last note starts in the final bar.
    const end = Math.max(...lead.map((v) => v.at));
    expect(end).toBeGreaterThan(LOOP_SECONDS * (7 / 8));
  });

  it('does nothing when muted or at volume 0', () => {
    useSettingsStore.setState({ muted: true });
    expect(playChiptune()).toBe(false);
    useSettingsStore.setState({ muted: false, volume: 0 });
    expect(playChiptune()).toBe(false);
    expect(isChiptunePlaying()).toBe(false);
  });

  it('plays, loops, notifies and stops', () => {
    const listener = vi.fn();
    const off = subscribeChiptune(listener);
    expect(playChiptune()).toBe(true);
    expect(isChiptunePlaying()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    const first = audio.oscillators;
    expect(first).toBeGreaterThan(0);

    vi.advanceTimersByTime(LOOP_SECONDS * 1000);
    expect(audio.oscillators).toBe(first * 2);

    stopChiptune();
    expect(isChiptunePlaying()).toBe(false);
    expect(audio.disconnects).toBeGreaterThan(0);
    vi.advanceTimersByTime(LOOP_SECONDS * 3000);
    expect(audio.oscillators).toBe(first * 2);
    expect(listener).toHaveBeenCalledTimes(2);
    off();
  });

  it('stops when the player mutes', () => {
    playChiptune();
    useSettingsStore.setState({ muted: true });
    expect(isChiptunePlaying()).toBe(false);
  });
});
