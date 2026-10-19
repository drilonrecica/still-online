// Week-two scenes for `renderPhoto` (v0.5): the rec hall show, Mr Dalton's classroom and a living
// room at night. Never call Math.random here, or photos stop being identical.
import { pick, randInt } from '@/os/random';
import {
  between,
  crowd,
  ellipse,
  poly,
  rect,
  vertical,
  type Ctx,
  type Painter,
} from './photoShapes';

/** A soft round light that fades out at `r`. */
function glow(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  rgb: string,
  a: number,
) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  rect(ctx, g, x - r, y - r, r * 2, r * 2);
}

export const stage: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h, ['#1c161a', '#0a080c']), 0, 0, w, h);
  // The low ceiling: cheap tiles in a grid.
  rect(ctx, '#2c262a', 0, 0, w, h * 0.14);
  for (let x = between(rand, 0, w * 0.1); x < w; x += w * 0.14)
    rect(ctx, 'rgba(0,0,0,0.4)', x, 0, 1.5, h * 0.14);
  rect(ctx, 'rgba(0,0,0,0.4)', 0, h * 0.07, w, 1.5);
  // The stage wash behind the band.
  const tint = pick(rand, ['255,170,90', '255,110,150', '150,140,255']);
  glow(ctx, w * between(rand, 0.4, 0.6), h * 0.45, w * 0.55, tint, 0.45);
  // Two sagging strands of string lights under the ceiling.
  for (let s = 0; s < 2; s++) {
    const y0 = h * (0.17 + s * 0.08);
    const sag = h * between(rand, 0.04, 0.08);
    const at = (x: number) => y0 + sag * Math.sin((Math.PI * x) / w);
    ctx.strokeStyle = '#3a3238';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const x = (i / 16) * w;
      if (i) ctx.lineTo(x, at(x));
      else ctx.moveTo(x, at(x));
    }
    ctx.stroke();
    for (let x = between(rand, 0, w * 0.06); x < w; x += w * 0.07) {
      const bulb = pick(rand, ['255,232,160', '255,244,210', '255,200,112']);
      glow(ctx, x, at(x) + h * 0.015, h * 0.05, bulb, 0.5);
      ellipse(ctx, `rgb(${bulb})`, x, at(x) + h * 0.015, h * 0.008, h * 0.012);
    }
  }
  // Amps, the riser and its dark front edge.
  for (const ax of [0.12, 0.8])
    rect(ctx, '#18141a', w * ax, h * 0.48, w * 0.1, h * 0.14);
  rect(ctx, '#3a2a22', 0, h * 0.62, w, h * 0.04);
  rect(ctx, '#1a120e', 0, h * 0.66, w, h * 0.06);
  // The band: three silhouettes, a mic stand in the middle, a guitar on the left.
  for (let i = 0; i < 3; i++) {
    const x = w * (0.3 + i * 0.2) + between(rand, -w * 0.02, w * 0.02);
    const tall = between(rand, 0.95, 1.1);
    ellipse(ctx, '#050406', x, h * (0.62 - 0.21 * tall), h * 0.032, h * 0.038);
    rect(
      ctx,
      '#050406',
      x - h * 0.03,
      h * (0.62 - 0.17 * tall),
      h * 0.06,
      h * 0.17 * tall,
    );
    if (i === 0) {
      ellipse(ctx, '#050406', x + h * 0.03, h * 0.53, h * 0.04, h * 0.03);
      ctx.strokeStyle = '#050406';
      ctx.lineWidth = Math.max(1.5, h * 0.01);
      ctx.beginPath();
      ctx.moveTo(x + h * 0.03, h * 0.53);
      ctx.lineTo(x + h * 0.14, h * 0.46);
      ctx.stroke();
    }
    if (i === 1) {
      ctx.strokeStyle = '#08070a';
      ctx.lineWidth = Math.max(1, h * 0.006);
      ctx.beginPath();
      ctx.moveTo(x - h * 0.05, h * 0.62);
      ctx.lineTo(x - h * 0.05, h * 0.42);
      ctx.lineTo(x - h * 0.02, h * 0.42);
      ctx.stroke();
    }
  }
  // The bucket, stage left.
  poly(ctx, '#2a2a30', [
    [w * 0.88, h * 0.62],
    [w * 0.94, h * 0.62],
    [w * 0.95, h * 0.56],
    [w * 0.87, h * 0.56],
  ]);
  crowd(ctx, rand, w, h, h * 0.78, ['#000000', '#0a080c', '#120e14']);
  // A raised hand in front, holding up a pick.
  const hx = between(rand, w * 0.25, w * 0.75);
  const hy = h * between(rand, 0.5, 0.58);
  poly(ctx, '#0c0a0c', [
    [hx - w * 0.03, h],
    [hx - w * 0.015, hy + h * 0.04],
    [hx + w * 0.02, hy + h * 0.04],
    [hx + w * 0.035, h],
  ]);
  ellipse(ctx, '#0c0a0c', hx, hy, w * 0.03, h * 0.05);
  ellipse(ctx, '#0c0a0c', hx - w * 0.008, hy - h * 0.06, w * 0.01, h * 0.035);
  const pickColor = pick(rand, ['#f0e0a0', '#e04040', '#f8f8f8', '#60a0f0']);
  poly(ctx, pickColor, [
    [hx + w * 0.004, hy - h * 0.11],
    [hx + w * 0.03, hy - h * 0.1],
    [hx + w * 0.015, hy - h * 0.065],
  ]);
};

export const classroom: Painter = (ctx, rand, w, h) => {
  rect(ctx, pick(rand, ['#e8e0c8', '#d8e0d0', '#e0d8c0']), 0, 0, w, h * 0.66);
  rect(ctx, '#f8f8f0', w * 0.1, 0, w * 0.3, h * 0.025);
  rect(ctx, '#f8f8f0', w * 0.6, 0, w * 0.3, h * 0.025);
  rect(ctx, '#9a9078', 0, h * 0.62, w, h * 0.04);
  rect(
    ctx,
    pick(rand, ['#a89070', '#b0a088', '#8a8a80']),
    0,
    h * 0.66,
    w,
    h * 0.34,
  );
  // The whiteboard, with marker scribbles and a big cell in the middle.
  const bx = w * 0.06;
  const by = h * 0.12;
  const bw = w * 0.5;
  const bh = h * 0.32;
  rect(ctx, '#8a8a8a', bx - 3, by - 3, bw + 6, bh + 6);
  rect(ctx, '#f4f6f4', bx, by, bw, bh);
  rect(ctx, '#8a8a8a', bx, by + bh + 3, bw, h * 0.015);
  ctx.lineWidth = Math.max(1, h * 0.006);
  for (let i = 0; i < randInt(rand, 3, 5); i++) {
    ctx.strokeStyle = pick(rand, ['#2040b0', '#c02020', '#208040', '#202020']);
    const y = by + bh * between(rand, 0.15, 0.85);
    const x0 = bx + bw * between(rand, 0.05, 0.2);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let x = x0; x < x0 + bw * between(rand, 0.15, 0.3); x += w * 0.01)
      ctx.lineTo(x, y + between(rand, -h * 0.008, h * 0.008));
    ctx.stroke();
  }
  ctx.strokeStyle = '#208040';
  ctx.beginPath();
  ctx.ellipse(
    bx + bw * 0.7,
    by + bh * 0.5,
    bw * 0.16,
    bh * 0.32,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ellipse(ctx, '#7040a0', bx + bw * 0.7, by + bh * 0.5, bw * 0.04, bh * 0.08);
  // Cell drawings taped to the wall, each a little crooked.
  for (let i = 0; i < 3; i++) {
    const px = w * (0.62 + i * 0.12);
    const py = h * (0.14 + (i % 2) * 0.1);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(between(rand, -0.12, 0.12));
    rect(ctx, '#fbf8ee', 0, 0, w * 0.1, h * 0.16);
    rect(
      ctx,
      'rgba(240,230,170,0.8)',
      w * 0.035,
      -h * 0.01,
      w * 0.03,
      h * 0.02,
    );
    const cell = pick(rand, ['#40a060', '#a050c0', '#3070d0', '#e08030']);
    ellipse(ctx, cell, w * 0.05, h * 0.08, w * 0.035, h * 0.055);
    ellipse(ctx, '#fbf8ee', w * 0.05, h * 0.08, w * 0.028, h * 0.045);
    ellipse(
      ctx,
      cell,
      w * 0.05 + between(rand, -4, 4),
      h * 0.08,
      w * 0.01,
      h * 0.016,
    );
    for (let j = 0; j < 4; j++)
      ellipse(
        ctx,
        cell,
        w * 0.05 + between(rand, -w * 0.02, w * 0.02),
        h * 0.08 + between(rand, -h * 0.03, h * 0.03),
        1.2,
        1.2,
      );
    ctx.restore();
  }
  // Two rows of desks, the near row bigger.
  for (const [row, y, size] of [
    [0, 0.7, 0.16],
    [1, 0.84, 0.24],
  ] as const) {
    for (let x = row ? -w * 0.05 : w * 0.05; x < w; x += w * size * 1.4) {
      const dw = w * size;
      rect(ctx, '#5a4a3a', x + dw * 0.1, h * y, dw * 0.05, h * size * 0.6);
      rect(ctx, '#5a4a3a', x + dw * 0.85, h * y, dw * 0.05, h * size * 0.6);
      rect(
        ctx,
        pick(rand, ['#c8a878', '#b89868', '#d0b088']),
        x,
        h * y,
        dw,
        h * size * 0.12,
      );
      rect(
        ctx,
        '#3a5a8a',
        x + dw * 0.3,
        h * (y + size * 0.3),
        dw * 0.4,
        h * size * 0.25,
      );
    }
  }
};

export const livingroom: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h, ['#161220', '#0a0810']), 0, 0, w, h);
  // A window with the blinds down, a little streetlight through the slats.
  const wx = w * between(rand, 0.65, 0.75);
  for (let y = h * 0.1; y < h * 0.4; y += h * 0.03)
    rect(ctx, 'rgba(220,180,120,0.18)', wx, y, w * 0.18, h * 0.015);
  // The TV on its stand, glowing into the dark room.
  const tx = w * between(rand, 0.25, 0.4);
  const ty = h * 0.36;
  const tw = w * 0.24;
  const screen = pick(rand, ['120,170,255', '140,220,200', '200,160,255']);
  glow(ctx, tx + tw / 2, ty + tw * 0.3, w * 0.55, screen, 0.35);
  rect(ctx, '#2a2020', tx - w * 0.06, ty + tw * 0.75, tw + w * 0.12, h * 0.2);
  rect(ctx, '#1a1a1c', tx, ty, tw, tw * 0.75);
  rect(
    ctx,
    `rgb(${screen})`,
    tx + tw * 0.08,
    ty + tw * 0.07,
    tw * 0.7,
    tw * 0.56,
  );
  for (let y = ty + tw * 0.07; y < ty + tw * 0.63; y += 3)
    rect(ctx, 'rgba(0,0,0,0.2)', tx + tw * 0.08, y, tw * 0.7, 1);
  for (let i = 0; i < 2; i++)
    ellipse(
      ctx,
      '#404048',
      tx + tw * 0.89,
      ty + tw * (0.2 + i * 0.15),
      tw * 0.03,
      tw * 0.03,
    );
  // A stack of VHS tapes next to it.
  const vx = tx + tw + w * 0.07;
  for (let i = 0; i < randInt(rand, 3, 6); i++) {
    const vy = ty + tw * 0.75 - (i + 1) * h * 0.035;
    const off = between(rand, -w * 0.008, w * 0.008);
    rect(ctx, '#0c0c0e', vx + off, vy, w * 0.11, h * 0.032);
    rect(
      ctx,
      pick(rand, ['#e8e8e0', '#f0d060', '#e06060', '#80b0e0']),
      vx + off + w * 0.015,
      vy + h * 0.008,
      w * 0.07,
      h * 0.014,
    );
  }
  // The couch in front, its top edge lit by the TV.
  const cy = h * 0.72;
  rect(ctx, '#1c1418', 0, cy, w, h - cy);
  rect(ctx, '#251a20', w * 0.04, cy - h * 0.12, w * 0.92, h * 0.14);
  rect(
    ctx,
    `rgba(${screen},0.25)`,
    w * 0.04,
    cy - h * 0.12,
    w * 0.92,
    h * 0.012,
  );
  ellipse(ctx, '#1c1418', w * 0.04, cy, w * 0.06, h * 0.12);
  ellipse(ctx, '#1c1418', w * 0.96, cy, w * 0.06, h * 0.12);
  for (let i = 0; i < 3; i++)
    rect(
      ctx,
      'rgba(0,0,0,0.3)',
      w * (0.33 + i * 0.32),
      cy - h * 0.1,
      1.5,
      h * 0.12,
    );
  // A cushion, sometimes.
  if (rand() < 0.6)
    ellipse(
      ctx,
      pick(rand, ['#5a2a3a', '#2a4a5a', '#5a5a2a']),
      w * between(rand, 0.2, 0.8),
      cy - h * 0.03,
      w * 0.07,
      h * 0.05,
    );
};
