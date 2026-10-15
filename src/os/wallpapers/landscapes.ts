// Outdoor homages: Green Hill Sky, Autumn Lane, Red Moon Dunes, Stone Circle.
import type { Painter } from './types';
import {
  cloud,
  disc,
  ellipse,
  fillRidge,
  fillVertical,
  glow,
  lerp,
  ridge,
  rgba,
  stars,
  vignette,
} from './paint';

/** A painted rolling green hill under a deep blue sky with soft cumulus. */
export const paintHill: Painter = (ctx, w, h, rand) => {
  fillVertical(ctx, w, 0, h, [
    [0, '#0f48c2'],
    [0.35, '#2f73dd'],
    [0.62, '#7db6ee'],
    [0.75, '#c4e0f8'],
    [1, '#d9edfb'],
  ]);
  glow(ctx, w * 0.8, h * 0.18, h * 0.5, [255, 255, 255], 0.25);
  const clouds = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < clouds; i++) {
    const x = (i + 0.2 + rand() * 0.6) * (w / clouds);
    const y = h * (0.18 + rand() * 0.32);
    cloud(ctx, x, y, w * (0.12 + rand() * 0.12), rand, 0.75 + rand() * 0.2);
  }

  // The far hill on the right, darker and lower.
  const far = ctx.createLinearGradient(0, h * 0.58, 0, h);
  far.addColorStop(0, '#4f9a2e');
  far.addColorStop(1, '#1f5512');
  ctx.fillStyle = far;
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h);
  ctx.bezierCurveTo(w * 0.55, h * 0.66, w * 0.8, h * 0.6, w, h * 0.63);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // The main hill: a long smooth swell from the left, cresting left of centre.
  const crest = h * (0.56 + rand() * 0.04);
  const hill = ctx.createLinearGradient(0, crest, 0, h);
  hill.addColorStop(0, '#9edb52');
  hill.addColorStop(0.25, '#6cbd34');
  hill.addColorStop(0.7, '#3d8f1f');
  hill.addColorStop(1, '#2a6f14');
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  ctx.bezierCurveTo(
    w * 0.15,
    h * 0.6,
    w * 0.3,
    crest,
    w * 0.45,
    crest + h * 0.01,
  );
  ctx.bezierCurveTo(
    w * 0.65,
    crest + h * 0.03,
    w * 0.85,
    h * 0.78,
    w,
    h * 0.86,
  );
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Sunlight on the crest and soft grass streaks.
  glow(ctx, w * 0.4, crest + h * 0.05, w * 0.3, [210, 245, 120], 0.35);
  ctx.lineCap = 'round';
  for (let i = 0; i < 160; i++) {
    const x = rand() * w;
    const y = lerp(h * 0.68, h, rand());
    const len = h * (0.01 + rand() * 0.02);
    ctx.strokeStyle = rgba(rand() < 0.5 ? [40, 100, 20] : [170, 225, 90], 0.25);
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len * 0.3, y - len);
    ctx.stroke();
  }
};

const LEAF_COLORS = [
  [214, 74, 24],
  [235, 120, 30],
  [244, 168, 40],
  [178, 40, 28],
  [250, 200, 70],
  [150, 60, 20],
] as const;

/** A lane through orange and red trees, leaves falling. */
export const paintAutumn: Painter = (ctx, w, h, rand) => {
  const vx = w * 0.5;
  const vy = h * 0.5;
  fillVertical(ctx, w, 0, vy + 2, [
    [0, '#f5c27a'],
    [0.7, '#fbe3b0'],
    [1, '#fff3d6'],
  ]);
  glow(ctx, vx, vy - h * 0.04, h * 0.35, [255, 245, 210], 0.7);
  fillVertical(ctx, w, vy, h, [
    [0, '#9a6a2c'],
    [1, '#5e3a14'],
  ]);

  // The lane narrows to the vanishing point.
  const lane = ctx.createLinearGradient(0, vy, 0, h);
  lane.addColorStop(0, '#d8b98a');
  lane.addColorStop(1, '#a37b4c');
  ctx.fillStyle = lane;
  ctx.beginPath();
  ctx.moveTo(vx - w * 0.01, vy);
  ctx.lineTo(vx + w * 0.01, vy);
  ctx.lineTo(vx + w * 0.38, h);
  ctx.lineTo(vx - w * 0.38, h);
  ctx.closePath();
  ctx.fill();

  // Trees on both sides, far to near.
  const rows = 9;
  for (let i = 0; i < rows; i++) {
    const d = (i + 1) / rows;
    const s = 0.06 + d * d * 0.94;
    const baseY = vy + (h - vy) * s * 0.9;
    for (const side of [-1, 1]) {
      const x =
        vx + side * (w * 0.03 + w * 0.5 * s) + (rand() - 0.5) * w * 0.03 * s;
      const trunkH = h * 0.75 * s;
      const trunkW = Math.max(1, w * 0.025 * s);
      ctx.fillStyle = rgba([60, 36, 18], 0.95);
      ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);
      const crownY = baseY - trunkH;
      const blobs = 12;
      for (let b = 0; b < blobs; b++) {
        const c =
          LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)] ??
          LEAF_COLORS[0];
        const r = h * 0.2 * s * (0.5 + rand() * 0.6);
        const bx = x + (rand() - 0.5 - side * 0.25) * h * 0.5 * s;
        const by = crownY + (rand() - 0.3) * h * 0.3 * s;
        disc(ctx, bx, by, r, rgba(c, 0.55 + rand() * 0.35));
      }
    }
  }

  // Leaves on the lane and in the air.
  for (let i = 0; i < 220; i++) {
    const c =
      LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)] ?? LEAF_COLORS[0];
    const onGround = i < 140;
    const y = onGround ? lerp(vy, h, Math.sqrt(rand())) : rand() * h * 0.85;
    const depth = onGround ? (y - vy) / (h - vy) : 0.3 + rand() * 0.7;
    const r = Math.max(1, h * 0.012 * depth);
    ellipse(ctx, rand() * w, y, r, r * 0.55, rgba(c, 0.85), rand() * Math.PI);
  }
  vignette(ctx, w, h, 0.4);
};

/** Red desert dunes under a pale moon at dusk. */
export const paintDunes: Painter = (ctx, w, h, rand) => {
  fillVertical(ctx, w, 0, h, [
    [0, '#1d1640'],
    [0.3, '#5b3264'],
    [0.52, '#c0626a'],
    [0.65, '#f2a073'],
    [1, '#f2a073'],
  ]);
  stars(ctx, w, h * 0.35, 90, rand);
  const mx = w * (0.65 + rand() * 0.1);
  const my = h * (0.2 + rand() * 0.05);
  const mr = Math.min(w, h) * 0.055;
  glow(ctx, mx, my, mr * 5, [250, 225, 220], 0.3);
  disc(ctx, mx, my, mr, '#f5ecdc');
  // Faint maria on the moon.
  disc(
    ctx,
    mx - mr * 0.3,
    my - mr * 0.2,
    mr * 0.28,
    'rgba(200, 185, 170, 0.35)',
  );
  disc(
    ctx,
    mx + mr * 0.25,
    my + mr * 0.3,
    mr * 0.2,
    'rgba(200, 185, 170, 0.3)',
  );

  const layers = [
    { base: 0.66, amp: 0.05, top: '#a3475a', bottom: '#6d2a3e' },
    { base: 0.73, amp: 0.06, top: '#c2553f', bottom: '#7d2d2c' },
    { base: 0.82, amp: 0.07, top: '#d8673c', bottom: '#8f3522' },
    { base: 0.93, amp: 0.08, top: '#e47a42', bottom: '#9b3a1e' },
  ];
  for (const layer of layers) {
    const ys = ridge(rand, 48, h * layer.base, h * layer.amp);
    const top = Math.min(...ys);
    const g = ctx.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, layer.top);
    g.addColorStop(1, layer.bottom);
    fillRidge(ctx, w, ys, h, g);
    // The lit crest line.
    ctx.strokeStyle = 'rgba(255, 190, 150, 0.35)';
    ctx.lineWidth = Math.max(1, h * 0.003);
    ctx.beginPath();
    ys.forEach((y, i) => ctx.lineTo((i * w) / (ys.length - 1), y));
    ctx.stroke();
  }
  vignette(ctx, w, h, 0.45);
};

/** Standing-stone silhouettes against a sunset sky. */
export const paintStones: Painter = (ctx, w, h, rand) => {
  const hy = h * 0.72;
  fillVertical(ctx, w, 0, hy, [
    [0, '#26285a'],
    [0.4, '#7a4a78'],
    [0.75, '#ef8a3c'],
    [1, '#ffd77e'],
  ]);
  glow(ctx, w * 0.5, hy, h * 0.6, [255, 200, 110], 0.6);
  disc(ctx, w * 0.5, hy, h * 0.07, '#fff0c0');
  // Thin lit cloud streaks.
  for (let i = 0; i < 7; i++) {
    const y = h * (0.15 + rand() * 0.4);
    ellipse(
      ctx,
      rand() * w,
      y,
      w * (0.1 + rand() * 0.15),
      h * 0.008,
      rgba([255, 170, 120], 0.3 + rand() * 0.3),
    );
  }
  const ground = ridge(rand, 32, hy, h * 0.012);
  fillRidge(ctx, w, ground, h, '#1b1219');

  // Trilithons on an ellipse: back ones smaller and higher, drawn first.
  const count = 9;
  const groups = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.2;
    return { a, z: Math.sin(a), kind: rand() };
  }).sort((p, q) => p.z - q.z);
  ctx.fillStyle = '#140d14';
  for (const { a, z, kind } of groups) {
    if (kind < 0.12) continue; // a gap where stones have fallen
    const s = 0.7 + z * 0.3;
    const x = w * 0.5 + Math.cos(a) * w * 0.34;
    const y = hy + h * 0.05 + z * h * 0.06;
    const sh = h * 0.2 * s;
    const sw = w * 0.02 * s;
    const gap = sw * 1.3;
    const pair =
      kind < 0.3 ? [x] : [x - gap / 2 - sw / 2, x + gap / 2 + sw / 2];
    for (const px of pair)
      upright(ctx, px, y, sw, sh * (0.95 + rand() * 0.08), rand);
    if (pair.length === 2 && kind > 0.4) {
      const lh = h * 0.028 * s;
      ctx.fillRect(
        x - gap / 2 - sw * 1.15,
        y - sh - lh * 0.6,
        gap + sw * 2.3,
        lh,
      );
    }
  }
};

function upright(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sw: number,
  sh: number,
  rand: () => number,
): void {
  const lean = (rand() - 0.5) * sw * 0.3;
  ctx.beginPath();
  ctx.moveTo(x - sw / 2, y);
  ctx.lineTo(x - sw * 0.46 + lean, y - sh);
  ctx.lineTo(x + sw * 0.44 + lean, y - sh * (0.97 + rand() * 0.04));
  ctx.lineTo(x + sw / 2, y);
  ctx.closePath();
  ctx.fill();
}
