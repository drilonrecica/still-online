import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const created = vi.hoisted(() => ({
  sources: 0,
  contexts: 0,
  resumed: 0,
  convolvers: 0,
  glides: 0,
}));

const param = () => ({
  value: 0,
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
});
const node = () => ({ connect() {}, disconnect() {} });

class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'suspended';
  destination = {};
  constructor() {
    created.contexts++;
  }
  resume() {
    created.resumed++;
    this.state = 'running';
    return Promise.resolve();
  }
  createGain() {
    return { ...node(), gain: param() };
  }
  createOscillator() {
    created.sources++;
    return {
      ...node(),
      type: 'sine',
      frequency: {
        ...param(),
        linearRampToValueAtTime() {
          created.glides++;
        },
      },
      detune: param(),
      start() {},
      stop() {},
    };
  }
  createBiquadFilter() {
    return { ...node(), type: 'lowpass', frequency: param(), Q: param() };
  }
  createStereoPanner() {
    return { ...node(), pan: param() };
  }
  createConvolver() {
    created.convolvers++;
    return { ...node(), buffer: null };
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    created.sources++;
    return { ...node(), buffer: null, start() {}, stop() {} };
  }
}
vi.stubGlobal('AudioContext', FakeAudioContext);
(window as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

const {
  SOUND_DEFS,
  SOUND_NAMES,
  playSound,
  resetSoundForTests,
  scheduleSound,
  soundLength,
  unlockAudio,
} = await import('./sound');

const MAX_SECONDS: Partial<Record<(typeof SOUND_NAMES)[number], number>> = {
  startup: 4,
  dialup: 7,
};
const { useSettingsStore } = await import('@/os/store/settings');

/** Oscillators/buffer sources a sound should start: detuned tones 2, bells 2 (FM), noise 1. */
const expectedSources = (name: (typeof SOUND_NAMES)[number]) =>
  SOUND_DEFS[name].voices.reduce(
    (n, v) =>
      n + (v.kind === 'noise' ? 1 : v.kind === 'bell' ? 2 : v.detune ? 2 : 1),
    0,
  );

describe('sound service', () => {
  beforeEach(() => {
    created.sources = 0;
    created.contexts = 0;
    created.resumed = 0;
    created.convolvers = 0;
    created.glides = 0;
    resetSoundForTests();
    useSettingsStore.setState({ muted: false, volume: 0.7 });
  });
  afterEach(() => resetSoundForTests());

  it('defines every sound name, each short enough', () => {
    for (const name of SOUND_NAMES) {
      expect(SOUND_DEFS[name].voices.length).toBeGreaterThan(0);
      expect(soundLength(name), name).toBeLessThanOrEqual(
        MAX_SECONDS[name] ?? 2,
      );
    }
  });

  it('is a no-op before a user gesture', () => {
    playSound('click');
    expect(created.sources).toBe(0);
    expect(created.contexts).toBe(0);
  });

  it('creates and resumes the context lazily on gesture', () => {
    unlockAudio();
    expect(created.contexts).toBe(1);
    expect(created.resumed).toBe(1);
  });

  it('starts the right sources for every voice after a gesture', () => {
    unlockAudio();
    for (const name of SOUND_NAMES) {
      created.sources = 0;
      playSound(name);
      expect(created.sources, name).toBe(expectedSources(name));
    }
  });

  it('builds the shared reverb once', () => {
    unlockAudio();
    playSound('startup');
    playSound('notify');
    playSound('logon');
    expect(created.convolvers).toBe(1);
  });

  it('still plays tones and bells where filters, panners and reverb are missing', () => {
    const proto = FakeAudioContext.prototype as unknown as Record<
      string,
      unknown
    >;
    const saved = [
      'createBiquadFilter',
      'createStereoPanner',
      'createConvolver',
    ].map((k) => [k, proto[k]] as const);
    for (const [k] of saved) proto[k] = undefined;
    try {
      unlockAudio();
      expect(() => playSound('startup')).not.toThrow();
      expect(created.sources).toBe(expectedSources('startup'));
    } finally {
      for (const [k, v] of saved) proto[k] = v;
    }
  });

  it('defines the dial-up handshake as a ~6s sequence that ends in a click', () => {
    const voices = SOUND_DEFS.dialup.voices;
    expect(soundLength('dialup')).toBeGreaterThan(5.5);
    const last = voices.reduce((a, b) => (b.at > a.at ? b : a));
    expect(last).toMatchObject({ kind: 'noise' });
    expect(last.dur).toBeLessThan(0.1);
    // Dial tone first: 350 + 440 Hz together at t = 0.
    const first = voices.filter((v) => v.at === 0);
    expect(first).toHaveLength(2);
    expect(voices.some((v) => v.kind === 'tone' && v.glideTo)).toBe(true);
  });

  it('renders the dial-up handshake on a context without a gesture (offline render)', () => {
    const offline = new FakeAudioContext() as unknown as BaseAudioContext;
    const master = scheduleSound(offline, 'dialup', 1);
    expect(master).toBeTruthy();
    expect(created.sources).toBe(expectedSources('dialup'));
    const glides = SOUND_DEFS.dialup.voices.filter(
      (v) => v.kind === 'tone' && v.glideTo !== undefined,
    ).length;
    expect(created.glides).toBe(glides);
  });

  it('returns a stopper that silences a playing sound', () => {
    unlockAudio();
    const stop = playSound('dialup');
    expect(() => stop()).not.toThrow();
    // Before a gesture there is nothing to stop.
    resetSoundForTests();
    expect(() => playSound('dialup')()).not.toThrow();
  });

  it('plays nothing when muted or volume is zero', () => {
    unlockAudio();
    useSettingsStore.setState({ muted: true });
    playSound('notify');
    useSettingsStore.setState({ muted: false, volume: 0 });
    playSound('notify');
    expect(created.sources).toBe(0);
  });
});
