// Indoor and night scenes for `renderPhoto`. Never call Math.random here, or photos stop being identical.
import { pick, randInt } from '@/os/random';
import {
  between,
  crowd,
  ellipse,
  poly,
  rect,
  vertical,
  type Painter,
} from './photoShapes';

export const pet: Painter = (ctx, rand, w, h) => {
  rect(ctx, pick(rand, ['#d8c8a0', '#c8d0c0', '#e0c0b0']), 0, 0, w, h * 0.55);
  const carpet = pick(rand, ['#8a3a30', '#5a4a8a', '#7a6a40']);
  rect(ctx, carpet, 0, h * 0.55, w, h * 0.45);
  for (let y = h * 0.6; y < h; y += h * 0.06)
    rect(ctx, 'rgba(0,0,0,0.08)', 0, y, w, h * 0.015);
  const fur = pick(rand, ['#2a2018', '#a0703a', '#e8e0d0', '#606060']);
  const cx = between(rand, w * 0.35, w * 0.6);
  const cy = h * 0.72;
  if (rand() < 0.5) {
    // A curled-up cat.
    ellipse(ctx, fur, cx, cy, w * 0.2, h * 0.13);
    ellipse(ctx, fur, cx + w * 0.17, cy - h * 0.08, w * 0.08, h * 0.08);
    poly(ctx, fur, [
      [cx + w * 0.11, cy - h * 0.13],
      [cx + w * 0.13, cy - h * 0.22],
      [cx + w * 0.16, cy - h * 0.14],
    ]);
    poly(ctx, fur, [
      [cx + w * 0.18, cy - h * 0.14],
      [cx + w * 0.22, cy - h * 0.22],
      [cx + w * 0.24, cy - h * 0.11],
    ]);
  } else {
    // A sitting dog.
    ellipse(ctx, fur, cx, cy, w * 0.13, h * 0.17);
    ellipse(ctx, fur, cx + w * 0.02, cy - h * 0.22, w * 0.08, h * 0.09);
    ellipse(ctx, fur, cx + w * 0.09, cy - h * 0.19, w * 0.05, h * 0.035);
    ellipse(ctx, fur, cx - w * 0.05, cy - h * 0.2, w * 0.025, h * 0.08);
  }
};

export const party: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h, ['#3a1a3a', '#1a1028']), 0, 0, w, h);
  for (let i = 0; i < 14; i++) {
    const light = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    const color = pick(rand, [
      '255,80,160',
      '80,200,255',
      '255,220,80',
      '140,255,120',
    ]);
    light.addColorStop(0, `rgba(${color},0.6)`);
    light.addColorStop(1, `rgba(${color},0)`);
    ctx.save();
    ctx.translate(between(rand, 0, w), between(rand, 0, h * 0.6));
    ctx.scale(h * 0.12, h * 0.12);
    rect(ctx, light, -1, -1, 2, 2);
    ctx.restore();
  }
  for (let i = 0; i < randInt(rand, 4, 8); i++) {
    const x = between(rand, w * 0.05, w * 0.95);
    const y = between(rand, h * 0.1, h * 0.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.09);
    ctx.lineTo(x + between(rand, -8, 8), y + h * 0.35);
    ctx.stroke();
    ellipse(
      ctx,
      pick(rand, ['#e02040', '#2060e0', '#f0c020', '#30b040', '#c040c0']),
      x,
      y,
      h * 0.06,
      h * 0.085,
    );
  }
  crowd(ctx, rand, w, h, h * 0.75, ['#140a14', '#24142a', '#1a1a2a']);
};

export const concert: Painter = (ctx, rand, w, h) => {
  rect(ctx, '#08060c', 0, 0, w, h);
  for (let i = 0; i < randInt(rand, 3, 5); i++) {
    const x = between(rand, w * 0.1, w * 0.9);
    ctx.fillStyle = `rgba(${pick(rand, ['255,60,60', '80,120,255', '255,220,120', '200,80,255'])},0.35)`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(between(rand, 0, w) - w * 0.15, h * 0.7);
    ctx.lineTo(between(rand, 0, w) + w * 0.15, h * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  rect(ctx, '#20182a', 0, h * 0.55, w, h * 0.12);
  for (let i = 0; i < 3; i++) {
    const x = w * (0.3 + i * 0.2) + between(rand, -10, 10);
    ellipse(ctx, '#000000', x, h * 0.42, h * 0.03, h * 0.035);
    rect(ctx, '#000000', x - h * 0.025, h * 0.45, h * 0.05, h * 0.1);
  }
  crowd(ctx, rand, w, h, h * 0.72, ['#000000', '#0c0a10', '#14101a']);
};

export const selfportrait: Painter = (ctx, rand, w, h, look) => {
  rect(
    ctx,
    pick(rand, ['#c8b8d8', '#d8d0b0', '#b0c8d8', '#e0b8b8']),
    0,
    0,
    w,
    h,
  );
  rect(ctx, 'rgba(255,255,255,0.4)', w * 0.65, h * 0.05, w * 0.25, h * 0.35);
  const skin = pick(rand, ['#f0c8a0', '#d8a078', '#a87050', '#704830']);
  const hair = pick(rand, [
    '#201810',
    '#5a3a20',
    '#d0a040',
    '#8a2a1a',
    '#101020',
  ]);
  const fx = between(rand, w * 0.4, w * 0.55);
  const fy = h * 0.5;
  ellipse(
    ctx,
    pick(rand, ['#303060', '#802040', '#206040', '#202020']),
    fx,
    h * 1.05,
    w * 0.32,
    h * 0.32,
  );
  // Arm reaching to the "camera" from the lower corner.
  poly(ctx, skin, [
    [w, h * 0.75],
    [w, h],
    [w * 0.72, h],
    [w * 0.8, h * 0.8],
  ]);
  if (look === 'short') {
    // Short and spiky: a cap of hair with gelled spikes on top.
    ellipse(ctx, hair, fx, fy - h * 0.09, w * 0.145, h * 0.17);
    for (let i = -2; i <= 2; i++) {
      const x = fx + i * w * 0.05;
      poly(ctx, hair, [
        [x - w * 0.035, fy - h * 0.2],
        [x + w * 0.01, fy - h * (0.33 - Math.abs(i) * 0.02)],
        [x + w * 0.035, fy - h * 0.2],
      ]);
    }
  } else {
    // Long hair falls past the shoulders; without a look it stops at the chin (v0.3).
    if (look === 'long')
      ellipse(ctx, hair, fx, fy + h * 0.14, w * 0.19, h * 0.34);
    ellipse(ctx, hair, fx, fy - h * 0.06, w * 0.17, h * 0.27);
  }
  ellipse(ctx, skin, fx, fy + h * 0.02, w * 0.13, h * 0.2);
  if (look === 'short')
    ellipse(ctx, hair, fx, fy - h * 0.17, w * 0.11, h * 0.04);
  else ellipse(ctx, hair, fx - w * 0.04, fy - h * 0.16, w * 0.12, h * 0.06);
  ellipse(ctx, '#202020', fx - w * 0.045, fy, w * 0.012, h * 0.015);
  ellipse(ctx, '#202020', fx + w * 0.045, fy, w * 0.012, h * 0.015);
  ellipse(ctx, '#a04040', fx, fy + h * 0.1, w * 0.03, h * 0.012);
};
