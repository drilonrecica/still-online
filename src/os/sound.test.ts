import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const created = vi.hoisted(() => ({ oscillators: 0, contexts: 0, resumed: 0 }));

class FakeAudioContext {
  currentTime = 0;
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
    return {
      gain: {
        value: 1,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
    };
  }
  createOscillator() {
    created.oscillators++;
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect() {},
      start() {},
      stop() {},
    };
  }
}
vi.stubGlobal('AudioContext', FakeAudioContext);
(window as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

const { SOUND_DEFS, SOUND_NAMES, playSound, resetSoundForTests, unlockAudio } =
  await import('./sound');
const { useSettingsStore } = await import('@/os/store/settings');

describe('sound service', () => {
  beforeEach(() => {
    created.oscillators = 0;
    created.contexts = 0;
    created.resumed = 0;
    resetSoundForTests();
    useSettingsStore.setState({ muted: false, volume: 0.7 });
  });
  afterEach(() => resetSoundForTests());

  it('defines every sound name, each short enough', () => {
    for (const name of SOUND_NAMES) {
      const notes = SOUND_DEFS[name];
      expect(notes.length).toBeGreaterThan(0);
      const end = Math.max(...notes.map((n) => n.at + n.dur));
      expect(end).toBeLessThanOrEqual(name === 'startup' ? 4 : 2);
    }
  });

  it('is a no-op before a user gesture', () => {
    playSound('click');
    expect(created.oscillators).toBe(0);
    expect(created.contexts).toBe(0);
  });

  it('creates and resumes the context lazily on gesture', () => {
    unlockAudio();
    expect(created.contexts).toBe(1);
    expect(created.resumed).toBe(1);
  });

  it('plays one oscillator per note after a gesture', () => {
    unlockAudio();
    for (const name of SOUND_NAMES) {
      created.oscillators = 0;
      playSound(name);
      expect(created.oscillators).toBe(SOUND_DEFS[name].length);
    }
  });

  it('plays nothing when muted or volume is zero', () => {
    unlockAudio();
    useSettingsStore.setState({ muted: true });
    playSound('notify');
    useSettingsStore.setState({ muted: false, volume: 0 });
    playSound('notify');
    expect(created.oscillators).toBe(0);
  });
});
