// Visualizer drawing: pure functions over a minimal analyser + 2D-context surface,
// so they can be unit-tested with fakes (jsdom has no canvas or Web Audio).

export type VisualizerMode = 'bars' | 'scope' | 'off';

export const VISUALIZER_MODES: readonly VisualizerMode[] = [
  'bars',
  'scope',
  'off',
];

/** Canvas size in pixels; drawn 1:1 and scaled with `image-rendering: pixelated`. */
export const VIS_WIDTH = 76;
export const VIS_HEIGHT = 16;
export const BAR_COUNT = 19;
/** Pixels a falling peak drops per frame (~15px/s at 30fps). */
export const PEAK_FALL = 0.5;
export const FPS = 30;

const BG = '#07170b';
const PEAK = '#e8f4ff';
const SCOPE = '#4cff6a';

/** The subset of AnalyserNode the visualizer reads. */
export interface AnalyserLike {
  readonly frequencyBinCount: number;
  getByteFrequencyData(array: Uint8Array<ArrayBuffer>): void;
  getByteTimeDomainData(array: Uint8Array<ArrayBuffer>): void;
}

/** The subset of CanvasRenderingContext2D the visualizer draws with. */
export interface Ctx2DLike {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
}

export interface VisualizerState {
  /** Peak height per bar, in pixels (fractional while falling). */
  peaks: number[];
  /** Scratch buffer reused between frames. */
  buffer: Uint8Array<ArrayBuffer>;
}

export function createVisualizerState(binCount = 0): VisualizerState {
  return {
    peaks: new Array<number>(BAR_COUNT).fill(0),
    buffer: new Uint8Array(binCount),
  };
}

export function nextMode(mode: VisualizerMode): VisualizerMode {
  return VISUALIZER_MODES[
    (VISUALIZER_MODES.indexOf(mode) + 1) % VISUALIZER_MODES.length
  ] as VisualizerMode;
}

/** Bar colour by row from the bottom: green, then yellow, then orange at the top. */
export function rowColor(row: number, height = VIS_HEIGHT): string {
  const f = row / height;
  if (f < 0.5) return '#2fd04a';
  if (f < 0.75) return '#b8e030';
  return '#f0a020';
}

/**
 * Buckets frequency bins into `count` bars on a log scale (bass gets its own bars)
 * and scales each bucket's max to 0..height pixels.
 */
export function computeBars(
  freq: ArrayLike<number>,
  count = BAR_COUNT,
  height = VIS_HEIGHT,
): number[] {
  const bins = freq.length;
  const bars: number[] = [];
  if (bins === 0) return new Array<number>(count).fill(0);
  // Skip bin 0 (DC); stop around 80% of Nyquist, where music has little energy.
  const lo = 1;
  const hi = Math.max(lo + count, Math.floor(bins * 0.8));
  let start = lo;
  for (let i = 0; i < count; i++) {
    const edge = Math.round(lo * (hi / lo) ** ((i + 1) / count));
    const end = Math.min(bins, Math.max(start + 1, edge));
    let max = 0;
    for (let b = start; b < end; b++) max = Math.max(max, freq[b] ?? 0);
    bars.push(Math.round((max / 255) * height));
    start = Math.min(end, bins - 1);
  }
  return bars;
}

/** Peaks jump up to the bar, otherwise fall by `fall` pixels. Mutates `peaks`. */
export function updatePeaks(
  peaks: number[],
  bars: readonly number[],
  fall = PEAK_FALL,
): void {
  bars.forEach((h, i) => {
    peaks[i] = Math.max(h, (peaks[i] ?? 0) - fall);
  });
}

function clear(ctx: Ctx2DLike, w: number, h: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
}

function ensureBuffer(state: VisualizerState, analyser: AnalyserLike) {
  if (state.buffer.length !== analyser.frequencyBinCount) {
    state.buffer = new Uint8Array(analyser.frequencyBinCount);
  }
  return state.buffer;
}

export function drawBars(
  ctx: Ctx2DLike,
  analyser: AnalyserLike,
  state: VisualizerState,
  w = VIS_WIDTH,
  h = VIS_HEIGHT,
): void {
  const buf = ensureBuffer(state, analyser);
  analyser.getByteFrequencyData(buf);
  const bars = computeBars(buf, state.peaks.length, h);
  updatePeaks(state.peaks, bars);
  clear(ctx, w, h);
  const slot = Math.floor(w / bars.length);
  const barW = Math.max(1, slot - 1);
  bars.forEach((barH, i) => {
    const x = i * slot;
    for (let row = 0; row < barH; row++) {
      ctx.fillStyle = rowColor(row, h);
      ctx.fillRect(x, h - 1 - row, barW, 1);
    }
    const peak = Math.round(state.peaks[i] ?? 0);
    if (peak > 0) {
      ctx.fillStyle = PEAK;
      ctx.fillRect(x, h - peak, barW, 1);
    }
  });
}

export function drawScope(
  ctx: Ctx2DLike,
  analyser: AnalyserLike,
  state: VisualizerState,
  w = VIS_WIDTH,
  h = VIS_HEIGHT,
): void {
  const buf = ensureBuffer(state, analyser);
  analyser.getByteTimeDomainData(buf);
  clear(ctx, w, h);
  ctx.fillStyle = SCOPE;
  const yAt = (x: number) => {
    const i = Math.floor((x / w) * buf.length);
    // 128 is silence; map 0..255 onto the rows, top = loud positive.
    return Math.min(
      h - 1,
      Math.max(0, Math.round(((255 - (buf[i] ?? 128)) / 255) * (h - 1))),
    );
  };
  let prev = yAt(0);
  for (let x = 0; x < w; x++) {
    const y = yAt(x);
    // Fill the vertical gap to the previous sample so the line stays connected.
    const top = Math.min(prev, y);
    ctx.fillRect(x, top, 1, Math.abs(y - prev) + 1);
    prev = y;
  }
}

/** Resting frame: empty background, plus a flat line in scope mode. */
export function drawIdle(
  ctx: Ctx2DLike,
  mode: VisualizerMode,
  state: VisualizerState,
  w = VIS_WIDTH,
  h = VIS_HEIGHT,
): void {
  state.peaks.fill(0);
  clear(ctx, w, h);
  if (mode === 'scope') {
    ctx.fillStyle = SCOPE;
    ctx.fillRect(0, Math.floor(h / 2), w, 1);
  }
}

/** Draws one frame for `mode`; idle when there's no analyser. */
export function drawFrame(
  ctx: Ctx2DLike,
  mode: VisualizerMode,
  analyser: AnalyserLike | null,
  state: VisualizerState,
  w = VIS_WIDTH,
  h = VIS_HEIGHT,
): void {
  if (mode === 'off' || !analyser) drawIdle(ctx, mode, state, w, h);
  else if (mode === 'bars') drawBars(ctx, analyser, state, w, h);
  else drawScope(ctx, analyser, state, w, h);
}
