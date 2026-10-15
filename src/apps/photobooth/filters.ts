// Snapshot Booth filters: pure functions on RGBA buffers (same layout as ImageData), tested without a canvas.
import { mulberry32 } from '@/os/random';

export interface Frame {
  w: number;
  h: number;
  /** RGBA, row-major, `w * h * 4` bytes. */
  data: Uint8ClampedArray;
}

export const FILTER_IDS = [
  'normal',
  'sepia',
  'comic',
  'thermal',
  'mirror',
  'bulge',
  'glow',
  'oldcam',
] as const;
export type FilterId = (typeof FILTER_IDS)[number];

export const FILTER_LABELS: Record<FilterId, string> = {
  normal: 'Normal',
  sepia: 'Sepia',
  comic: 'Comic',
  thermal: 'Thermal',
  mirror: 'Mirror',
  bulge: 'Bulge',
  glow: 'Glow',
  oldcam: 'Old Webcam',
};

export function createFrame(w: number, h: number): Frame {
  return { w, h, data: new Uint8ClampedArray(w * h * 4) };
}

function luma(d: Uint8ClampedArray, i: number): number {
  return 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
}

function sepia(src: Frame): Frame {
  const out = createFrame(src.w, src.h);
  const s = src.data;
  const o = out.data;
  for (let i = 0; i < s.length; i += 4) {
    const r = s[i]!;
    const g = s[i + 1]!;
    const b = s[i + 2]!;
    o[i] = 0.393 * r + 0.769 * g + 0.189 * b;
    o[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
    o[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
    o[i + 3] = s[i + 3]!;
  }
  return out;
}

/** Posterize to 4 levels per channel, then ink the Sobel edges. */
function comic(src: Frame): Frame {
  const { w, h } = src;
  const out = createFrame(w, h);
  const s = src.data;
  const o = out.data;
  const lum = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) lum[p] = luma(s, p * 4);
  const at = (x: number, y: number) =>
    lum[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]!;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const gx =
        at(x + 1, y - 1) +
        2 * at(x + 1, y) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x - 1, y) -
        at(x - 1, y + 1);
      const gy =
        at(x - 1, y + 1) +
        2 * at(x, y + 1) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x, y - 1) -
        at(x + 1, y - 1);
      const edge = Math.abs(gx) + Math.abs(gy) > 150;
      for (let c = 0; c < 3; c++) {
        o[i + c] = edge ? 20 : Math.round(s[i + c]! / 85) * 85;
      }
      o[i + 3] = s[i + 3]!;
    }
  }
  return out;
}

/** Gradient stops for the false-colour map, dark → hot. */
const THERMAL: readonly (readonly [number, number, number])[] = [
  [10, 0, 60],
  [40, 20, 200],
  [200, 30, 150],
  [250, 80, 20],
  [255, 220, 40],
  [255, 255, 235],
];

function thermalColor(t: number): readonly [number, number, number] {
  const f = Math.min(1, Math.max(0, t)) * (THERMAL.length - 1);
  const i = Math.min(THERMAL.length - 2, Math.floor(f));
  const k = f - i;
  const a = THERMAL[i]!;
  const b = THERMAL[i + 1]!;
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

function thermal(src: Frame): Frame {
  const out = createFrame(src.w, src.h);
  for (let i = 0; i < src.data.length; i += 4) {
    const [r, g, b] = thermalColor(luma(src.data, i) / 255);
    out.data[i] = r;
    out.data[i + 1] = g;
    out.data[i + 2] = b;
    out.data[i + 3] = src.data[i + 3]!;
  }
  return out;
}

/** The left half is reflected onto the right half. */
function mirror(src: Frame): Frame {
  const out = createFrame(src.w, src.h);
  out.data.set(src.data);
  const { w, h } = src;
  const half = Math.floor(w / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < half; x++) {
      const from = (y * w + x) * 4;
      const to = (y * w + (w - 1 - x)) * 4;
      for (let c = 0; c < 4; c++) out.data[to + c] = src.data[from + c]!;
    }
  }
  return out;
}

/** A radial pinch-out: the centre is magnified, the edges stay put. */
function bulge(src: Frame): Frame {
  const { w, h } = src;
  const out = createFrame(w, h);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const radius = Math.min(w, h) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy) / radius;
      // Sample closer to the centre than we are: r' = r * d^0.6 inside the circle.
      const k = d < 1 && d > 0 ? Math.pow(d, 0.6) : 1;
      const sx = Math.round(cx + dx * k);
      const sy = Math.round(cy + dy * k);
      const from = (sy * w + sx) * 4;
      const to = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) out.data[to + c] = src.data[from + c]!;
    }
  }
  return out;
}

/** One separable box-blur pass over RGB (clamped edges). */
function boxBlur(data: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(data.length);
  const size = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        sum += data[(y * w + Math.min(w - 1, Math.max(0, k))) * 4 + c]!;
      }
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * 4 + c] = sum / size;
        const add = Math.min(w - 1, x + r + 1);
        const drop = Math.max(0, x - r);
        sum += data[(y * w + add) * 4 + c]! - data[(y * w + drop) * 4 + c]!;
      }
    }
  }
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        sum += tmp[(Math.min(h - 1, Math.max(0, k)) * w + x) * 4 + c]!;
      }
      for (let y = 0; y < h; y++) {
        data[(y * w + x) * 4 + c] = sum / size;
        const add = Math.min(h - 1, y + r + 1);
        const drop = Math.max(0, y - r);
        sum += tmp[(add * w + x) * 4 + c]! - tmp[(drop * w + x) * 4 + c]!;
      }
    }
  }
}

/** Bloom: blur the bright parts and screen them back over the picture. */
function glow(src: Frame): Frame {
  const { w, h } = src;
  const bright = new Float32Array(src.data.length);
  for (let i = 0; i < src.data.length; i += 4) {
    const keep = luma(src.data, i) > 140 ? 1 : 0;
    for (let c = 0; c < 3; c++) bright[i + c] = src.data[i + c]! * keep;
  }
  const r = Math.max(1, Math.round(Math.min(w, h) / 40));
  boxBlur(bright, w, h, r);
  boxBlur(bright, w, h, r);
  const out = createFrame(w, h);
  for (let i = 0; i < src.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const a = src.data[i + c]! / 255;
      const b = Math.min(1, (bright[i + c]! / 255) * 1.6);
      out.data[i + c] = (1 - (1 - a) * (1 - b)) * 255;
    }
    out.data[i + 3] = src.data[i + 3]!;
  }
  return out;
}

/** 3×5 glyphs for the "LIVE" tag, one row per number (bit 2 = left column). */
const LIVE_GLYPHS: readonly (readonly number[])[] = [
  [4, 4, 4, 4, 7], // L
  [7, 2, 2, 2, 7], // I
  [5, 5, 5, 5, 2], // V
  [7, 4, 7, 4, 7], // E
];

function stampLive(out: Frame, scale: number) {
  const left = Math.max(2, Math.round(out.w * 0.04));
  const top = Math.max(2, Math.round(out.h * 0.05));
  LIVE_GLYPHS.forEach((rows, g) => {
    rows.forEach((bits, row) => {
      for (let col = 0; col < 3; col++) {
        if (!(bits & (4 >> col))) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const x = left + (g * 4 + col) * scale + dx;
            const y = top + row * scale + dy;
            if (x >= out.w || y >= out.h) continue;
            const i = (y * out.w + x) * 4;
            out.data[i] = 235;
            out.data[i + 1] = 40;
            out.data[i + 2] = 40;
            out.data[i + 3] = 255;
          }
        }
      }
    });
  });
}

/** Low-res (¼ size, scaled back up), washed-out green-grey, grain and a red "LIVE" tag. */
function oldcam(src: Frame, seed: number): Frame {
  const { w, h } = src;
  const out = createFrame(w, h);
  const rand = mulberry32(seed);
  const lw = Math.max(1, Math.round(w / 4));
  const lh = Math.max(1, Math.round(h / 4));
  for (let y = 0; y < h; y++) {
    const sy = Math.min(h - 1, Math.floor(Math.floor((y * lh) / h) * (h / lh)));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(
        w - 1,
        Math.floor(Math.floor((x * lw) / w) * (w / lw)),
      );
      const from = (sy * w + sx) * 4;
      const to = (y * w + x) * 4;
      const l = luma(src.data, from) * 0.8 + 30;
      const grain = (rand() - 0.5) * 50;
      out.data[to] = l * 0.85 + grain;
      out.data[to + 1] = l * 1.0 + grain;
      out.data[to + 2] = l * 0.8 + grain;
      out.data[to + 3] = 255;
    }
  }
  stampLive(out, Math.max(1, Math.round(w / 160)));
  return out;
}

/** Returns a new frame; `seed` only matters for the grain of Old Webcam. */
export function applyFilter(id: FilterId, src: Frame, seed = 1): Frame {
  switch (id) {
    case 'sepia':
      return sepia(src);
    case 'comic':
      return comic(src);
    case 'thermal':
      return thermal(src);
    case 'mirror':
      return mirror(src);
    case 'bulge':
      return bulge(src);
    case 'glow':
      return glow(src);
    case 'oldcam':
      return oldcam(src, seed);
    default:
      return { w: src.w, h: src.h, data: new Uint8ClampedArray(src.data) };
  }
}
