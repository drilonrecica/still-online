// Routes the player's audio element through an AnalyserNode on the shared AudioContext.
// createMediaElementSource throws if called twice for one element, so the node is
// cached per element and reused by every visualizer mount.
import { getAudioContext } from '@/os/sound';

const FFT_SIZE = 512;

const analysers = new WeakMap<HTMLMediaElement, AnalyserNode | null>();

/** The analyser for `el`, created on first call; null when Web Audio isn't available. */
export function getAnalyser(el: HTMLMediaElement): AnalyserNode | null {
  if (analysers.has(el)) return analysers.get(el) ?? null;
  const ctx = getAudioContext();
  if (!ctx) return null;
  let analyser: AnalyserNode | null;
  try {
    const node = ctx.createAnalyser();
    node.fftSize = FFT_SIZE;
    node.smoothingTimeConstant = 0.6;
    const source = ctx.createMediaElementSource(el);
    source.connect(node);
    node.connect(ctx.destination);
    analyser = node;
  } catch {
    // Already captured elsewhere or unsupported: play on without a visualizer.
    analyser = null;
  }
  analysers.set(el, analyser);
  // Once routed through Web Audio, a suspended context would silence the music.
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return analyser;
}
