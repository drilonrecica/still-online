import { describe, expect, it } from 'vitest';
import {
  BAR_COUNT,
  computeBars,
  createVisualizerState,
  drawFrame,
  nextMode,
  updatePeaks,
  VIS_HEIGHT,
  VIS_WIDTH,
  type AnalyserLike,
  type Ctx2DLike,
} from './draw';

function fakeAnalyser(freq: number, wave: (i: number) => number = () => 128) {
  const bins = 256;
  return {
    frequencyBinCount: bins,
    getByteFrequencyData(a: Uint8Array) {
      a.fill(freq);
    },
    getByteTimeDomainData(a: Uint8Array) {
      for (let i = 0; i < a.length; i++) a[i] = wave(i);
    },
  } satisfies AnalyserLike;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

function fakeCtx() {
  const rects: Rect[] = [];
  const ctx: Ctx2DLike & { rects: Rect[] } = {
    fillStyle: '',
    rects,
    fillRect(x, y, w, h) {
      rects.push({ x, y, w, h, color: String(this.fillStyle) });
    },
  };
  return ctx;
}

/** Pixels painted in column x, excluding the full-canvas background fill. */
const columnRows = (rects: Rect[], x: number) =>
  rects.filter(
    (r) =>
      !(r.w === VIS_WIDTH && r.h === VIS_HEIGHT) && r.x <= x && x < r.x + r.w,
  );

describe('visualizer drawing', () => {
  it('cycles bars → scope → off → bars', () => {
    expect(nextMode('bars')).toBe('scope');
    expect(nextMode('scope')).toBe('off');
    expect(nextMode('off')).toBe('bars');
  });

  it('computes 19 bars scaled to the canvas height', () => {
    expect(computeBars(new Uint8Array(256).fill(255))).toEqual(
      new Array(BAR_COUNT).fill(VIS_HEIGHT),
    );
    expect(computeBars(new Uint8Array(256))).toEqual(
      new Array(BAR_COUNT).fill(0),
    );
    expect(computeBars(new Uint8Array(0))).toHaveLength(BAR_COUNT);
  });

  it('peaks jump up and then fall', () => {
    const peaks = [0, 10];
    updatePeaks(peaks, [8, 2], 0.5);
    expect(peaks).toEqual([8, 9.5]);
    updatePeaks(peaks, [0, 0], 0.5);
    expect(peaks).toEqual([7.5, 9]);
  });

  it('draws 19 full-height bars with 1px gaps for a loud signal', () => {
    const ctx = fakeCtx();
    const state = createVisualizerState();
    drawFrame(ctx, 'bars', fakeAnalyser(255), state);
    expect(ctx.rects[0]).toMatchObject({
      x: 0,
      y: 0,
      w: VIS_WIDTH,
      h: VIS_HEIGHT,
    });
    const barStarts = new Set(ctx.rects.slice(1).map((r) => r.x));
    expect(barStarts.size).toBe(BAR_COUNT);
    expect([...barStarts].every((x) => x % 4 === 0)).toBe(true);
    expect(ctx.rects.slice(1).every((r) => r.w === 3)).toBe(true);
    // Column 0: 16 bar rows + 1 peak row; the gap column 3 is untouched.
    expect(columnRows(ctx.rects, 0)).toHaveLength(VIS_HEIGHT + 1);
    expect(columnRows(ctx.rects, 3)).toHaveLength(0);
  });

  it('keeps a falling peak above a silent bar', () => {
    const ctx = fakeCtx();
    const state = createVisualizerState();
    drawFrame(ctx, 'bars', fakeAnalyser(255), state);
    ctx.rects.length = 0;
    drawFrame(ctx, 'bars', fakeAnalyser(0), state);
    const col = columnRows(ctx.rects, 0);
    expect(col).toHaveLength(1);
    expect(col[0]?.y).toBe(VIS_HEIGHT - Math.round(VIS_HEIGHT - 0.5));
  });

  it('draws a flat oscilloscope line for silence and a tall one for a square wave', () => {
    const flat = fakeCtx();
    drawFrame(flat, 'scope', fakeAnalyser(0), createVisualizerState());
    const flatRows = new Set(flat.rects.slice(1).map((r) => r.y));
    expect(flatRows.size).toBe(1);
    expect(flat.rects.slice(1)).toHaveLength(VIS_WIDTH);

    const square = fakeCtx();
    drawFrame(
      square,
      'scope',
      fakeAnalyser(0, (i) => (Math.floor(i / 32) % 2 ? 255 : 0)),
      createVisualizerState(),
    );
    const ys = square.rects.slice(1).flatMap((r) => [r.y, r.y + r.h - 1]);
    expect(Math.min(...ys)).toBe(0);
    expect(Math.max(...ys)).toBe(VIS_HEIGHT - 1);
  });

  it('draws only the background when off or without an analyser', () => {
    for (const [mode, analyser] of [
      ['off', fakeAnalyser(255)],
      ['bars', null],
    ] as const) {
      const ctx = fakeCtx();
      const state = createVisualizerState();
      state.peaks.fill(5);
      drawFrame(ctx, mode, analyser, state);
      expect(ctx.rects).toHaveLength(1);
      expect(state.peaks.every((p) => p === 0)).toBe(true);
    }
  });
});
