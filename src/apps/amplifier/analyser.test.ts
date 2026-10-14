import { beforeEach, describe, expect, it, vi } from 'vitest';

const counts = vi.hoisted(() => ({ contexts: 0, sources: 0, resumed: 0 }));

class FakeAudioContext {
  state = 'suspended';
  destination = {};
  constructor() {
    counts.contexts++;
  }
  resume() {
    counts.resumed++;
    this.state = 'running';
    return Promise.resolve();
  }
  currentTime = 0;
  createGain() {
    const param = {
      value: 1,
      setValueAtTime() {},
      linearRampToValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };
    return { gain: param, connect() {} };
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect() {},
      start() {},
      stop() {},
    };
  }
  createAnalyser() {
    return { fftSize: 2048, smoothingTimeConstant: 0.8, connect() {} };
  }
  createMediaElementSource(el: HTMLMediaElement) {
    // Like real browsers: a second capture of one element throws.
    if ((el as { captured?: boolean }).captured) {
      throw new DOMException('already connected', 'InvalidStateError');
    }
    (el as { captured?: boolean }).captured = true;
    counts.sources++;
    return { connect() {} };
  }
}
(window as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

const { getAnalyser } = await import('./analyser');
const { getAudioContext, playSound, unlockAudio } = await import('@/os/sound');

describe('getAnalyser', () => {
  beforeEach(() => {
    counts.sources = 0;
  });

  it('shares one AudioContext with the sound service', () => {
    const el = new Audio();
    getAnalyser(el);
    unlockAudio();
    playSound('click');
    getAnalyser(new Audio());
    expect(getAudioContext()).toBe(getAudioContext());
    expect(counts.contexts).toBe(1);
  });

  it('reuses the analyser when the same element is visualized again', () => {
    const el = new Audio();
    const first = getAnalyser(el);
    expect(first).not.toBeNull();
    expect(() => getAnalyser(el)).not.toThrow();
    expect(getAnalyser(el)).toBe(first);
    expect(counts.sources).toBe(1);
    // Routed audio is silent while suspended, so capturing resumes the context.
    expect(counts.resumed).toBeGreaterThan(0);
  });

  it('returns null instead of throwing for an element captured elsewhere', () => {
    const el = new Audio();
    (el as { captured?: boolean }).captured = true;
    expect(getAnalyser(el)).toBeNull();
    expect(getAnalyser(el)).toBeNull();
  });
});
