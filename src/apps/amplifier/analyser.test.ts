import { beforeEach, describe, expect, it, vi } from 'vitest';

const counts = vi.hoisted(() => ({ contexts: 0, sources: 0, resumed: 0 }));

interface FakeNode {
  kind: string;
  next: FakeNode[];
  connect(n: FakeNode): void;
}

const param = (value: number) => ({
  value,
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
});

function node<T extends object>(kind: string, extra: T): FakeNode & T {
  const n: FakeNode = {
    kind,
    next: [],
    connect(to) {
      n.next.push(to);
    },
  };
  return Object.assign(n, extra);
}

class FakeAudioContext {
  state = 'suspended';
  destination = node('destination', {});
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
    return node('gain', { gain: param(1) });
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
  createBiquadFilter() {
    return node('biquad', {
      type: 'lowpass',
      frequency: param(350),
      Q: param(1),
      gain: param(0),
    });
  }
  createAnalyser() {
    return node('analyser', { fftSize: 2048, smoothingTimeConstant: 0.8 });
  }
  createMediaElementSource(el: HTMLMediaElement) {
    // Like real browsers: a second capture of one element throws.
    if ((el as { captured?: boolean }).captured) {
      throw new DOMException('already connected', 'InvalidStateError');
    }
    (el as { captured?: boolean }).captured = true;
    counts.sources++;
    return node('source', {});
  }
}
(window as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

const { getAnalyser, getAudioGraph, setEqualizer } = await import('./analyser');
const { getAudioContext, playSound, unlockAudio } = await import('@/os/sound');
const { DEFAULT_EQ, EQ_FREQUENCIES, presetSettings } = await import('./eq');

type Biquad = ReturnType<FakeAudioContext['createBiquadFilter']>;
type Gain = ReturnType<FakeAudioContext['createGain']>;

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

describe('EQ chain', () => {
  beforeEach(() => {
    counts.sources = 0;
  });

  /** Follows the single `next` edge from `start` to the end of the chain. */
  function walk(start: FakeNode): FakeNode[] {
    const out = [start];
    let n = start;
    while (n.next.length > 0) {
      expect(n.next).toHaveLength(1);
      n = n.next[0] as FakeNode;
      out.push(n);
    }
    return out;
  }

  it('routes source → preamp → 10 peaking filters → analyser → destination', () => {
    const el = new Audio();
    const graph = getAudioGraph(el);
    expect(graph).not.toBeNull();
    const preamp = graph?.preamp as unknown as Gain;
    // The source is the only node feeding the preamp; walk on from the preamp.
    const chain = walk(preamp).map((n) => n.kind);
    expect(chain).toEqual([
      'gain',
      ...EQ_FREQUENCIES.map(() => 'biquad'),
      'analyser',
      'destination',
    ]);
    const filters = graph?.filters as unknown as Biquad[];
    expect(filters.map((f) => f.frequency.value)).toEqual([...EQ_FREQUENCIES]);
    for (const f of filters) {
      expect(f.type).toBe('peaking');
      expect(f.Q.value).toBe(1.4);
      expect(f.gain.value).toBe(0);
    }
    expect(graph?.analyser).toBe(getAnalyser(el));
  });

  it('builds the chain once per element', () => {
    const el = new Audio();
    const graph = getAudioGraph(el);
    setEqualizer(el, presetSettings('Rock'), true);
    getAnalyser(el);
    expect(getAudioGraph(el)).toBe(graph);
    expect(counts.sources).toBe(1);
  });

  it('applies the curve, bypasses when off, and waits for the graph without building it', () => {
    const el = new Audio();
    const rock = presetSettings('Rock');
    setEqualizer(el, rock, false);
    expect(counts.sources).toBe(0);

    // The visualizer builds the graph later: it picks up the stored curve.
    const graph = getAudioGraph(el);
    const gains = () =>
      (graph?.filters as unknown as Biquad[]).map((f) => f.gain.value);
    expect(gains()).toEqual(rock.bands);

    setEqualizer(el, { ...rock, on: false }, false);
    expect(gains()).toEqual(EQ_FREQUENCIES.map(() => 0));
    expect((graph?.preamp as unknown as Gain).gain.value).toBe(1);

    setEqualizer(el, { ...DEFAULT_EQ, on: true, preamp: 6 }, false);
    expect((graph?.preamp as unknown as Gain).gain.value).toBeCloseTo(1.995, 3);
  });

  it('builds the graph when asked to (EQ on while playing)', () => {
    const el = new Audio();
    setEqualizer(el, presetSettings('Pop'), true);
    expect(counts.sources).toBe(1);
  });
});
