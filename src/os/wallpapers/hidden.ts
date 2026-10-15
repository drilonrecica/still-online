// The unlockable easter eggs: Pony Paradise (Pia's day-5 gift) and Retro Grid (Konami code).
import type { Painter } from './types';
import {
  cloud,
  disc,
  ellipse,
  fillVertical,
  glow,
  rgba,
  type Rgb,
  sparkle,
  stars,
} from './paint';

const RAINBOW = [
  '#ffb3c7',
  '#ffd1a6',
  '#fff1a8',
  '#c4f2b8',
  '#b5dcff',
  '#d7c2ff',
];

const PONIES: readonly [readonly [Rgb, Rgb], ...(readonly [Rgb, Rgb])[]] = [
  [
    [255, 182, 219],
    [190, 120, 230],
  ],
  [
    [200, 180, 255],
    [255, 150, 200],
  ],
  [
    [170, 235, 215],
    [120, 160, 255],
  ],
  [
    [255, 230, 160],
    [255, 140, 170],
  ],
];

/** A cartoon pony silhouette, standing at (0, 0) on its hooves, facing right; `s` ≈ body length / 2. */
function pony(
  ctx: CanvasRenderingContext2D,
  s: number,
  body: Rgb,
  mane: Rgb,
): void {
  const fill = rgba(body, 1);
  const hair = rgba(mane, 1);
  ctx.fillStyle = fill;
  for (const lx of [-0.65, -0.35, 0.35, 0.65]) {
    ctx.fillRect(lx * s - s * 0.09, -s * 0.75, s * 0.18, s * 0.75);
  }
  // Tail.
  for (let i = 0; i < 4; i++)
    disc(ctx, -s * (1.0 + i * 0.12), -s * (1.0 - i * 0.18), s * 0.2, hair);
  ellipse(ctx, 0, -s * 1.0, s, s * 0.5, fill);
  // Neck and head.
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(s * 0.45, -s * 1.3);
  ctx.lineTo(s * 0.95, -s * 2.0);
  ctx.lineTo(s * 1.25, -s * 1.75);
  ctx.lineTo(s * 0.9, -s * 0.9);
  ctx.closePath();
  ctx.fill();
  disc(ctx, s * 1.1, -s * 2.0, s * 0.38, fill);
  ellipse(ctx, s * 1.45, -s * 1.82, s * 0.28, s * 0.2, fill);
  // Ear.
  ctx.beginPath();
  ctx.moveTo(s * 0.95, -s * 2.3);
  ctx.lineTo(s * 1.02, -s * 2.62);
  ctx.lineTo(s * 1.18, -s * 2.32);
  ctx.closePath();
  ctx.fill();
  // Mane down the neck.
  for (let i = 0; i < 5; i++)
    disc(ctx, s * (0.85 - i * 0.12), -s * (2.25 - i * 0.22), s * 0.17, hair);
  disc(ctx, s * 1.22, -s * 2.05, s * 0.07, '#3b2346');
  disc(ctx, s * 1.25, -s * 2.08, s * 0.025, '#ffffff');
}

/** Pastel rainbow, clouds, cartoon ponies and sparkles. */
export const paintPonies: Painter = (ctx, w, h, rand) => {
  fillVertical(ctx, w, 0, h, [
    [0, '#ffd3ec'],
    [0.45, '#e6d6ff'],
    [1, '#c7e8ff'],
  ]);
  const cx = w * 0.5;
  const cy = h * 1.05;
  const band = h * 0.045;
  ctx.lineWidth = band + 1;
  RAINBOW.forEach((color, i) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, h * 0.85 - i * band, Math.PI, Math.PI * 2);
    ctx.stroke();
  });
  for (let i = 0; i < 6; i++) {
    cloud(
      ctx,
      (i / 5) * w,
      h * (0.25 + rand() * 0.15),
      w * (0.14 + rand() * 0.06),
      rand,
      0.95,
    );
  }
  // Soft pastel meadow.
  const meadow = ctx.createLinearGradient(0, h * 0.72, 0, h);
  meadow.addColorStop(0, '#c9f5c0');
  meadow.addColorStop(1, '#9ee0a8');
  ctx.fillStyle = meadow;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.8);
  ctx.quadraticCurveTo(w * 0.3, h * 0.7, w * 0.6, h * 0.78);
  ctx.quadraticCurveTo(w * 0.85, h * 0.84, w, h * 0.76);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const herd = [
    { x: 0.22, y: 0.93, s: 0.07, flip: false },
    { x: 0.5, y: 0.86, s: 0.05, flip: true },
    { x: 0.78, y: 0.95, s: 0.075, flip: true },
  ];
  herd.forEach(({ x, y, s, flip }, i) => {
    const [body, mane] =
      PONIES[(i + Math.floor(rand() * PONIES.length)) % PONIES.length] ??
      PONIES[0];
    ctx.save();
    ctx.translate(w * x, h * y);
    if (flip) ctx.scale(-1, 1);
    pony(ctx, h * s, body, mane);
    ctx.restore();
  });

  for (let i = 0; i < 60; i++) {
    const r = h * (0.006 + rand() * 0.014);
    sparkle(
      ctx,
      rand() * w,
      rand() * h * 0.85,
      r,
      rand() < 0.6 ? '#ffffff' : '#fff2a0',
    );
  }
};

/** A neon synthwave grid with a striped sun, and a tiny "1337" in the corner. */
export const paintRetro: Painter = (ctx, w, h, rand) => {
  const hy = h * 0.58;
  const sky = fillVertical(ctx, w, 0, hy, [
    [0, '#0a0220'],
    [0.6, '#2b0748'],
    [1, '#6a0f6e'],
  ]);
  stars(ctx, w, hy * 0.7, 120, rand);

  // The sun, cut by horizontal bands of sky in its lower half.
  const sx = w * 0.5;
  const sy = hy - h * 0.02;
  const sr = Math.min(w, h) * 0.24;
  glow(ctx, sx, sy, sr * 1.8, [255, 60, 160], 0.35);
  const sun = ctx.createLinearGradient(0, sy - sr, 0, sy + sr * 0.3);
  sun.addColorStop(0, '#ffe23d');
  sun.addColorStop(0.5, '#ff8a2a');
  sun.addColorStop(1, '#ff2a7f');
  disc(ctx, sx, sy, sr, sun);
  ctx.fillStyle = sky;
  for (let i = 0; i < 7; i++) {
    const y = sy - sr * 0.15 + i * sr * 0.16;
    ctx.fillRect(sx - sr, y, sr * 2, sr * (0.02 + i * 0.012));
  }

  // Mountains on the horizon.
  ctx.fillStyle = '#1a0533';
  ctx.strokeStyle = '#19e3ff';
  ctx.lineWidth = Math.max(1, h * 0.002);
  ctx.beginPath();
  ctx.moveTo(0, hy);
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * w;
    const away = Math.abs(x - sx) / (w / 2);
    ctx.lineTo(x, hy - (i % 2 ? h * 0.1 * rand() * away : h * 0.01));
  }
  ctx.lineTo(w, hy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // The floor and its glowing grid.
  fillVertical(ctx, w, hy, h, [
    [0, '#2a0040'],
    [1, '#0a0014'],
  ]);
  ctx.strokeStyle = '#ff2bd6';
  ctx.shadowColor = '#ff2bd6';
  ctx.shadowBlur = h * 0.01;
  ctx.lineWidth = Math.max(1, h * 0.0025);
  ctx.beginPath();
  for (let i = 1; i <= 16; i++) {
    const y = hy + (h - hy) * (i / 16) ** 2.2;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let i = -20; i <= 20; i++) {
    ctx.moveTo(sx + i * w * 0.004, hy);
    ctx.lineTo(sx + i * w * 0.12, h);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff6ae6';
  ctx.fillRect(0, hy - 1, w, 2);

  ctx.font = `${Math.max(9, Math.round(h * 0.012))}px 'Courier New', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(25, 227, 255, 0.7)';
  ctx.fillText('1337', w - h * 0.012, h - h * 0.01);
};
