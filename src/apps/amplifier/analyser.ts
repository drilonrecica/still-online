// Routes the player's audio element through the EQ and an AnalyserNode on the shared
// AudioContext: source → preamp → 10 peaking filters → analyser → destination.
// createMediaElementSource throws if called twice for one element, so the whole chain
// is built once per element, cached, and reused by every visualizer mount and the EQ.
import { getAudioContext } from '@/os/sound';
import { DEFAULT_EQ, EQ_FREQUENCIES, EQ_Q, effectiveGains } from './eq';
import type { EqSettings } from './eq';

const FFT_SIZE = 512;

export interface AudioGraph {
  analyser: AnalyserNode;
  preamp: GainNode;
  filters: BiquadFilterNode[];
}

const graphs = new WeakMap<HTMLMediaElement, AudioGraph | null>();
/** Latest EQ per element, applied when the graph is (re)used. */
const eqs = new WeakMap<HTMLMediaElement, EqSettings>();

function applyEq(graph: AudioGraph, eq: EqSettings) {
  const gains = effectiveGains(eq);
  graph.preamp.gain.value = gains.preamp;
  graph.filters.forEach((f, i) => {
    f.gain.value = gains.bands[i] ?? 0;
  });
}

/** The graph for `el`, built on first call; null when Web Audio isn't available. */
export function getAudioGraph(el: HTMLMediaElement): AudioGraph | null {
  if (graphs.has(el)) return graphs.get(el) ?? null;
  const ctx = getAudioContext();
  if (!ctx) return null;
  let graph: AudioGraph | null;
  try {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.6;
    const preamp = ctx.createGain();
    const filters = EQ_FREQUENCIES.map((hz) => {
      const f = ctx.createBiquadFilter();
      f.type = 'peaking';
      f.frequency.value = hz;
      f.Q.value = EQ_Q;
      f.gain.value = 0;
      return f;
    });
    const source = ctx.createMediaElementSource(el);
    let tail: AudioNode = preamp;
    source.connect(preamp);
    for (const f of filters) {
      tail.connect(f);
      tail = f;
    }
    tail.connect(analyser);
    analyser.connect(ctx.destination);
    graph = { analyser, preamp, filters };
    applyEq(graph, eqs.get(el) ?? DEFAULT_EQ);
  } catch {
    // Already captured elsewhere or unsupported: play on without a visualizer/EQ.
    graph = null;
  }
  graphs.set(el, graph);
  // Once routed through Web Audio, a suspended context would silence the music.
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return graph;
}

/** The analyser for `el`, building the graph on first call. */
export function getAnalyser(el: HTMLMediaElement): AnalyserNode | null {
  return getAudioGraph(el)?.analyser ?? null;
}

/**
 * Sets the EQ for `el`. The graph is only built when `build` is set (EQ on while
 * playing, i.e. after a user gesture); otherwise the curve waits for the graph.
 */
export function setEqualizer(
  el: HTMLMediaElement,
  eq: EqSettings,
  build: boolean,
): void {
  eqs.set(el, eq);
  const graph = build ? getAudioGraph(el) : graphs.get(el);
  if (graph) applyEq(graph, eq);
}
