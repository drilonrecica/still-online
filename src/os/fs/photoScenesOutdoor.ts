// Outdoor scenes for `renderPhoto`. Never call Math.random here, or photos stop being identical.
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

export const camp: Painter = (ctx, rand, w, h) => {
  rect(
    ctx,
    vertical(ctx, 0, h * 0.6, ['#1d2a4a', '#4a4a6a', '#b0705a']),
    0,
    0,
    w,
    h,
  );
  rect(
    ctx,
    vertical(ctx, h * 0.6, h, ['#2f3a22', '#1b2214']),
    0,
    h * 0.6,
    w,
    h * 0.4,
  );
  for (let i = 0; i < 9; i++) {
    const x = between(rand, 0, w);
    const th = between(rand, h * 0.3, h * 0.55);
    poly(ctx, '#142016', [
      [x, h * 0.62 - th],
      [x - th * 0.25, h * 0.62],
      [x + th * 0.25, h * 0.62],
    ]);
  }
  for (let i = 0; i < randInt(rand, 1, 3); i++) {
    const x = between(rand, w * 0.05, w * 0.6);
    const tw = between(rand, w * 0.18, w * 0.26);
    poly(ctx, pick(rand, ['#c4572a', '#2d6db5', '#e0a020']), [
      [x, h * 0.82],
      [x + tw / 2, h * 0.55],
      [x + tw, h * 0.82],
    ]);
    poly(ctx, '#1a1a1a', [
      [x + tw * 0.42, h * 0.82],
      [x + tw / 2, h * 0.66],
      [x + tw * 0.58, h * 0.82],
    ]);
  }
  const fx = between(rand, w * 0.62, w * 0.8);
  const glow = ctx.createRadialGradient(
    fx,
    h * 0.82,
    2,
    fx,
    h * 0.82,
    h * 0.35,
  );
  glow.addColorStop(0, 'rgba(255,190,90,0.55)');
  glow.addColorStop(1, 'rgba(255,190,90,0)');
  rect(ctx, glow, 0, 0, w, h);
  poly(ctx, '#ffb030', [
    [fx - w * 0.04, h * 0.86],
    [fx, h * 0.72],
    [fx + w * 0.04, h * 0.86],
  ]);
  poly(ctx, '#fff0a0', [
    [fx - w * 0.015, h * 0.86],
    [fx, h * 0.78],
    [fx + w * 0.015, h * 0.86],
  ]);
};

export const trip: Painter = (ctx, rand, w, h) => {
  rect(
    ctx,
    vertical(ctx, 0, h * 0.55, ['#8ab0d8', '#d0e0ea']),
    0,
    0,
    w,
    h * 0.55,
  );
  rect(ctx, '#7a7a70', 0, h * 0.55, w, h * 0.45);
  for (let i = 0; i < 5; i++) {
    rect(
      ctx,
      pick(rand, ['#b8a890', '#a0a8b0', '#c8b8a8']),
      between(rand, -w * 0.1, w),
      h * 0.2,
      w * 0.22,
      h * 0.35,
    );
  }
  const bx = between(rand, w * 0.05, w * 0.2);
  rect(ctx, '#e8c020', bx, h * 0.28, w * 0.62, h * 0.32);
  for (let x = bx + w * 0.04; x < bx + w * 0.58; x += w * 0.09) {
    rect(ctx, '#38506a', x, h * 0.32, w * 0.07, h * 0.1);
  }
  ellipse(ctx, '#202020', bx + w * 0.12, h * 0.6, w * 0.05, w * 0.05);
  ellipse(ctx, '#202020', bx + w * 0.5, h * 0.6, w * 0.05, w * 0.05);
  crowd(ctx, rand, w, h, h * 0.72, [
    '#3a2a20',
    '#6a4a30',
    '#2a3a5a',
    '#8a2a2a',
  ]);
};

export const beach: Painter = (ctx, rand, w, h) => {
  const horizon = between(rand, h * 0.4, h * 0.5);
  rect(
    ctx,
    vertical(ctx, 0, horizon, ['#3a8ad8', '#bfe0f0']),
    0,
    0,
    w,
    horizon,
  );
  rect(
    ctx,
    vertical(ctx, horizon, h * 0.7, ['#2070a8', '#40a8c0']),
    0,
    horizon,
    w,
    h * 0.7 - horizon,
  );
  rect(
    ctx,
    vertical(ctx, h * 0.7, h, ['#f0dca0', '#d8c088']),
    0,
    h * 0.7,
    w,
    h * 0.3,
  );
  ellipse(
    ctx,
    '#fff8d0',
    between(rand, w * 0.6, w * 0.9),
    horizon * 0.35,
    h * 0.06,
    h * 0.06,
  );
  for (let i = 0; i < 4; i++) {
    ellipse(
      ctx,
      'rgba(255,255,255,0.8)',
      between(rand, 0, w),
      between(rand, h * 0.08, horizon * 0.6),
      w * 0.08,
      h * 0.03,
    );
  }
  ellipse(ctx, 'rgba(255,255,255,0.7)', w / 2, h * 0.7, w * 0.6, h * 0.015);
  const ux = between(rand, w * 0.15, w * 0.45);
  poly(ctx, pick(rand, ['#e03030', '#f08020', '#3070e0']), [
    [ux - w * 0.14, h * 0.66],
    [ux, h * 0.56],
    [ux + w * 0.14, h * 0.66],
  ]);
  rect(ctx, '#f0f0f0', ux - 1, h * 0.66, 3, h * 0.2);
  rect(
    ctx,
    pick(rand, ['#30a0e0', '#e04080', '#f0d020']),
    ux + w * 0.06,
    h * 0.84,
    w * 0.18,
    h * 0.05,
  );
};

export const snow: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h * 0.6, ['#a8b8c8', '#e0e6ea']), 0, 0, w, h);
  poly(ctx, '#8090a8', [
    [0, h * 0.55],
    [w * 0.3, h * 0.25],
    [w * 0.55, h * 0.5],
    [w * 0.8, h * 0.2],
    [w, h * 0.45],
    [w, h * 0.6],
    [0, h * 0.6],
  ]);
  rect(
    ctx,
    vertical(ctx, h * 0.55, h, ['#f4f8fc', '#d8e2ec']),
    0,
    h * 0.55,
    w,
    h * 0.45,
  );
  for (let i = 0; i < 6; i++) {
    const x = between(rand, 0, w);
    const th = between(rand, h * 0.15, h * 0.3);
    poly(ctx, '#2a4a3a', [
      [x, h * 0.6 - th],
      [x - th * 0.3, h * 0.6],
      [x + th * 0.3, h * 0.6],
    ]);
  }
  const sx = between(rand, w * 0.3, w * 0.7);
  ellipse(ctx, '#ffffff', sx, h * 0.8, h * 0.1, h * 0.1);
  ellipse(ctx, '#ffffff', sx, h * 0.66, h * 0.07, h * 0.07);
  poly(ctx, '#f08020', [
    [sx, h * 0.655],
    [sx + h * 0.08, h * 0.665],
    [sx, h * 0.675],
  ]);
  for (let i = 0; i < 80; i++) {
    ellipse(
      ctx,
      'rgba(255,255,255,0.9)',
      between(rand, 0, w),
      between(rand, 0, h),
      1.5,
      1.5,
    );
  }
};
