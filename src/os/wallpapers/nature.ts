// Close-to-nature homages: Tulip Field, Crystal Peaks, Violet Bloom.
import type { Rand } from '@/os/random';
import type { Painter } from './types';
import {
  cloud,
  disc,
  ellipse,
  fillRidge,
  fillVertical,
  glow,
  rgba,
  ridge,
  type Rgb,
  vignette,
} from './paint';

const TULIPS: readonly [Rgb, ...Rgb[]] = [
  [220, 30, 45],
  [250, 205, 30],
  [240, 110, 170],
  [235, 70, 35],
];

/** Rows of red, yellow and pink tulips receding to the horizon. */
export const paintTulips: Painter = (ctx, w, h, rand) => {
  const hy = h * 0.38;
  const vx = w * 0.5;
  fillVertical(ctx, w, 0, hy + 1, [
    [0, '#3f86dc'],
    [1, '#cde6f8'],
  ]);
  for (let i = 0; i < 4; i++) {
    cloud(
      ctx,
      rand() * w,
      h * (0.08 + rand() * 0.18),
      w * (0.1 + rand() * 0.1),
      rand,
      0.8,
    );
  }
  // A dark tree line on the horizon.
  fillRidge(
    ctx,
    w,
    ridge(rand, 80, hy - h * 0.012, h * 0.008, 0.9),
    hy + 2,
    '#2c4a22',
  );
  fillVertical(ctx, w, hy, h, [
    [0, '#4c7a2e'],
    [1, '#2e5a1a'],
  ]);

  // Coloured stripes fanning out from the vanishing point, with green gaps between.
  const stripes = 18;
  const spread = w * 3;
  for (let i = 0; i < stripes; i++) {
    const x0 = vx - spread / 2 + (i / stripes) * spread;
    const x1 = vx - spread / 2 + ((i + 0.78) / stripes) * spread;
    const c = TULIPS[i % TULIPS.length] ?? TULIPS[0];
    const g = ctx.createLinearGradient(0, hy, 0, h);
    g.addColorStop(0, rgba(c, 0.7));
    g.addColorStop(1, rgba(c, 0.95));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(vx, hy);
    ctx.lineTo(x0, h);
    ctx.lineTo(x1, h);
    ctx.closePath();
    ctx.fill();
  }

  // Individual flower heads in the nearer half, bigger towards the viewer.
  const depthRows = 26;
  for (let k = 0; k < depthRows; k++) {
    const t = ((k + 1) / depthRows) ** 2;
    const y = hy + (h - hy) * t;
    const size = Math.max(1.2, h * 0.03 * t);
    if (size < 2) continue;
    for (let i = 0; i < stripes; i++) {
      const c = TULIPS[i % TULIPS.length] ?? TULIPS[0];
      const stripeX = vx - spread / 2 + ((i + 0.39) / stripes) * spread;
      const across = 3;
      for (let j = 0; j < across; j++) {
        const x =
          vx +
          (stripeX - vx) * t +
          ((j - 1) * spread * 0.012 + (rand() - 0.5) * 6) * t;
        if (x < -size || x > w + size) continue;
        ctx.strokeStyle = '#2f6b1f';
        ctx.lineWidth = Math.max(1, size * 0.15);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + size * 1.6);
        ctx.stroke();
        tulipHead(ctx, x, y, size, c, rand);
      }
    }
  }
};

function tulipHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  c: Rgb,
  rand: Rand,
): void {
  const light = rgba(
    [
      Math.min(255, c[0] + 40),
      Math.min(255, c[1] + 40),
      Math.min(255, c[2] + 40),
    ],
    1,
  );
  ctx.fillStyle = rgba(c, 1);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y - s * 0.6);
  ctx.lineTo(x - s * 0.2, y - s * 0.35 - rand() * s * 0.1);
  ctx.lineTo(x, y - s * 0.7);
  ctx.lineTo(x + s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.5, y - s * 0.6);
  ctx.quadraticCurveTo(x + s * 0.55, y + s * 0.1, x, y + s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.55, y + s * 0.1, x - s * 0.5, y - s * 0.6);
  ctx.fill();
  ellipse(ctx, x - s * 0.15, y - s * 0.2, s * 0.12, s * 0.25, light);
}

/** A mountain range across the width: a few distinct peaks, roughened by midpoint displacement. */
function peaks(
  rand: Rand,
  base: number,
  height: number,
  count: number,
): number[] {
  const n = 128;
  const noise = new Array<number>(n + 1).fill(0);
  for (let step = n; step > 1; step /= 2) {
    const amp = (step / n) ** 0.6;
    for (let i = step / 2; i < n; i += step) {
      const mid = ((noise[i - step / 2] ?? 0) + (noise[i + step / 2] ?? 0)) / 2;
      noise[i] = mid + (rand() - 0.5) * amp;
    }
  }
  const tops = Array.from({ length: count }, (_, k) => ({
    at: (k + 0.2 + rand() * 0.6) / count,
    tall: 0.45 + rand() * 0.55,
    wide: 0.12 + rand() * 0.18,
  }));
  return noise.map((jag, i) => {
    const t = i / n;
    let y = 0;
    for (const { at, tall, wide } of tops) {
      y = Math.max(y, tall * Math.max(0, 1 - Math.abs(t - at) / wide) ** 1.15);
    }
    return Math.min(base, base - height * (y + jag * 0.28 + 0.06));
  });
}

/** Snowy mountains reflected in a still lake. */
export const paintPeaks: Painter = (ctx, w, h, rand) => {
  const hy = h * 0.55;
  const far = peaks(rand, hy, h * 0.4, 5);
  const near = peaks(rand, hy, h * 0.24, 4);
  const shore = ridge(rand, 160, hy - h * 0.01, h * 0.004, 1.4);

  const scene = (dim: number) => {
    fillVertical(ctx, w, 0, hy, [
      [0, '#2a64c4'],
      [0.6, '#7fb3e6'],
      [1, '#dcecf8'],
    ]);
    const top = Math.min(...far);
    const snow = ctx.createLinearGradient(0, top, 0, hy);
    snow.addColorStop(0, '#ffffff');
    snow.addColorStop(0.35, '#e3ecf6');
    snow.addColorStop(0.6, '#8ea3be');
    snow.addColorStop(1, '#4e6079');
    fillRidge(ctx, w, far, hy + 1, snow);
    const nearTop = Math.min(...near);
    const rock = ctx.createLinearGradient(0, nearTop, 0, hy);
    rock.addColorStop(0, '#f4f8fc');
    rock.addColorStop(0.25, '#b9c8da');
    rock.addColorStop(0.55, '#55667e');
    rock.addColorStop(1, '#2c3a4a');
    fillRidge(ctx, w, near, hy + 1, rock);
    fillRidge(ctx, w, shore, hy + 1, '#1f3524');
    if (dim > 0) {
      ctx.fillStyle = `rgba(20, 50, 80, ${dim})`;
      ctx.fillRect(0, 0, w, hy);
    }
  };

  scene(0);
  // Shadowed gullies on the near range.
  for (let i = 0; i < 40; i++) {
    const idx = Math.floor(rand() * near.length);
    const x = (idx / (near.length - 1)) * w;
    const y = near[idx] ?? hy;
    ctx.strokeStyle = 'rgba(40, 55, 75, 0.25)';
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + (rand() - 0.5) * w * 0.03,
      y + (hy - y) * (0.4 + rand() * 0.5),
    );
    ctx.stroke();
  }

  // The lake: the same scene mirrored, darker, with fine ripple lines.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hy, w, h - hy);
  ctx.clip();
  ctx.translate(0, hy * 2);
  ctx.scale(1, -1);
  scene(0.3);
  ctx.restore();
  for (let i = 0; i < 70; i++) {
    const y = hy + (h - hy) * rand() ** 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + rand() * 0.08})`;
    ctx.fillRect(rand() * w, y, w * (0.05 + rand() * 0.2), 1);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(0, hy, w, 1);
};

const BOKEH: readonly [Rgb, ...Rgb[]] = [
  [255, 170, 230],
  [200, 140, 255],
  [255, 255, 255],
  [150, 90, 220],
];

function petal(
  ctx: CanvasRenderingContext2D,
  len: number,
  width: number,
  inner: string,
  outer: string,
): void {
  const g = ctx.createRadialGradient(0, 0, len * 0.05, 0, 0, len);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(width, -len * 0.3, width * 0.9, -len * 0.9, 0, -len);
  ctx.bezierCurveTo(-width * 0.9, -len * 0.9, -width, -len * 0.3, 0, 0);
  ctx.fill();
}

/** A big soft purple flower, close up, with bokeh behind. */
export const paintBloom: Painter = (ctx, w, h, rand) => {
  const bg = ctx.createRadialGradient(
    w * 0.45,
    h * 0.5,
    0,
    w * 0.45,
    h * 0.5,
    Math.hypot(w, h) * 0.6,
  );
  bg.addColorStop(0, '#5c2a7e');
  bg.addColorStop(0.6, '#2c1040');
  bg.addColorStop(1, '#12061c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 45; i++) {
    const c = BOKEH[Math.floor(rand() * BOKEH.length)] ?? BOKEH[0];
    const r = Math.min(w, h) * (0.02 + rand() * 0.07);
    const x = rand() * w;
    const y = rand() * h;
    disc(ctx, x, y, r, rgba(c, 0.06 + rand() * 0.12));
    ctx.strokeStyle = rgba(c, 0.12);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const cx = w * 0.42;
  const cy = h * 0.55;
  const size = Math.min(w, h) * 0.55;
  const layers = [
    { n: 7, len: 1.0, wid: 0.42, inner: '#d9a8f0', outer: '#4a1670', turn: 0 },
    {
      n: 6,
      len: 0.8,
      wid: 0.38,
      inner: '#efd2ff',
      outer: '#7a33a8',
      turn: 0.4,
    },
    {
      n: 5,
      len: 0.55,
      wid: 0.3,
      inner: '#fbefff',
      outer: '#a45fd0',
      turn: 0.9,
    },
  ];
  for (const layer of layers) {
    for (let i = 0; i < layer.n; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(
        layer.turn + (i / layer.n) * Math.PI * 2 + (rand() - 0.5) * 0.15,
      );
      petal(
        ctx,
        size * layer.len * (0.9 + rand() * 0.15),
        size * layer.wid,
        layer.inner,
        layer.outer,
      );
      ctx.restore();
    }
  }
  glow(ctx, cx, cy, size * 0.18, [255, 230, 140], 0.8);
  for (let i = 0; i < 30; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * size * 0.09;
    disc(
      ctx,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
      size * 0.008,
      '#ffe27a',
    );
  }
  vignette(ctx, w, h, 0.5);
};
