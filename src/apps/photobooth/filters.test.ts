import { describe, expect, it } from 'vitest';
import { applyFilter, createFrame, FILTER_IDS, type Frame } from './filters';

function solid(w: number, h: number, rgb: [number, number, number]): Frame {
  const f = createFrame(w, h);
  for (let i = 0; i < f.data.length; i += 4) {
    f.data[i] = rgb[0];
    f.data[i + 1] = rgb[1];
    f.data[i + 2] = rgb[2];
    f.data[i + 3] = 255;
  }
  return f;
}

/** Left half red, right half blue. */
function split(w: number, h: number): Frame {
  const f = solid(w, h, [255, 0, 0]);
  for (let y = 0; y < h; y++) {
    for (let x = w / 2; x < w; x++) {
      const i = (y * w + x) * 4;
      f.data[i] = 0;
      f.data[i + 2] = 255;
    }
  }
  return f;
}

const px = (f: Frame, x: number, y: number) =>
  Array.from(f.data.slice((y * f.w + x) * 4, (y * f.w + x) * 4 + 4));

describe('photobooth filters', () => {
  it('keep the frame size and leave the source untouched', () => {
    const src = split(32, 24);
    const copy = new Uint8ClampedArray(src.data);
    for (const id of FILTER_IDS) {
      const out = applyFilter(id, src);
      expect([out.w, out.h, out.data.length]).toEqual([32, 24, 32 * 24 * 4]);
      expect(out.data).not.toBe(src.data);
    }
    expect(src.data).toEqual(copy);
  });

  it('normal is a copy', () => {
    const src = split(8, 8);
    expect(applyFilter('normal', src).data).toEqual(src.data);
  });

  it('sepia warms a grey pixel (r > g > b)', () => {
    const [r, g, b] = px(
      applyFilter('sepia', solid(4, 4, [128, 128, 128])),
      1,
      1,
    );
    expect(r!).toBeGreaterThan(g!);
    expect(g!).toBeGreaterThan(b!);
  });

  it('thermal maps dark to blue-ish and bright to hot', () => {
    const dark = px(applyFilter('thermal', solid(4, 4, [0, 0, 0])), 0, 0);
    const bright = px(
      applyFilter('thermal', solid(4, 4, [255, 255, 255])),
      0,
      0,
    );
    expect(dark[2]!).toBeGreaterThan(dark[0]!);
    expect(bright[0]!).toBeGreaterThan(200);
    expect(bright[1]!).toBeGreaterThan(200);
  });

  it('mirror reflects the left half onto the right', () => {
    const out = applyFilter('mirror', split(16, 4));
    expect(px(out, 15, 1)).toEqual(px(out, 0, 1));
    expect(px(out, 15, 1).slice(0, 3)).toEqual([255, 0, 0]);
  });

  it('comic posterizes and inks edges', () => {
    const out = applyFilter('comic', split(16, 8));
    expect(px(out, 1, 4).slice(0, 3)).toEqual([255, 0, 0]);
    const edge = px(out, 8, 4);
    expect(edge[0]! + edge[1]! + edge[2]!).toBeLessThan(100);
  });

  it('bulge keeps the corners and the centre of a flat colour', () => {
    const out = applyFilter('bulge', solid(16, 16, [10, 200, 30]));
    expect(px(out, 0, 0)).toEqual([10, 200, 30, 255]);
    expect(px(out, 8, 8)).toEqual([10, 200, 30, 255]);
  });

  it('glow lifts pixels next to bright areas', () => {
    const src = solid(24, 24, [40, 40, 40]);
    for (let y = 8; y < 16; y++) {
      for (let x = 8; x < 16; x++) {
        const i = (y * 24 + x) * 4;
        src.data[i] = src.data[i + 1] = src.data[i + 2] = 255;
      }
    }
    const out = applyFilter('glow', src);
    expect(px(out, 6, 12)[0]!).toBeGreaterThan(40);
    expect(px(out, 0, 0)[0]!).toBeGreaterThanOrEqual(40);
  });

  it('old webcam is deterministic per seed, grainy, and stamps a red LIVE tag', () => {
    const src = solid(160, 120, [120, 120, 120]);
    const a = applyFilter('oldcam', src, 7);
    expect(applyFilter('oldcam', src, 7).data).toEqual(a.data);
    expect(applyFilter('oldcam', src, 8).data).not.toEqual(a.data);
    let red = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      if (a.data[i] === 235 && a.data[i + 1] === 40) red++;
    }
    expect(red).toBeGreaterThan(20);
  });
});
