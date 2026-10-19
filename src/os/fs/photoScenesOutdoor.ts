// Outdoor scenes for `renderPhoto`. Never call Math.random here, or photos stop being identical.
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

/** A board seen from the side: deck, two trucks with wheels. Tilted by `angle` around its middle. */
function board(
  ctx: Ctx,
  deck: string,
  x: number,
  y: number,
  len: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  rect(ctx, deck, -len / 2, -len * 0.05, len, len * 0.07);
  ellipse(ctx, deck, -len / 2, -len * 0.04, len * 0.06, len * 0.035);
  ellipse(ctx, deck, len / 2, -len * 0.04, len * 0.06, len * 0.035);
  for (const side of [-0.3, 0.3]) {
    rect(
      ctx,
      '#9a9a9a',
      len * side - len * 0.05,
      len * 0.02,
      len * 0.1,
      len * 0.03,
    );
    ellipse(
      ctx,
      '#f0ead8',
      len * side - len * 0.06,
      len * 0.07,
      len * 0.04,
      len * 0.04,
    );
    ellipse(
      ctx,
      '#f0ead8',
      len * side + len * 0.06,
      len * 0.07,
      len * 0.04,
      len * 0.04,
    );
  }
  ctx.restore();
}

export const skatepark: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h * 0.35, ['#7aa0c8', '#c8d8e0']), 0, 0, w, h);
  // The back wall, tagged.
  rect(ctx, '#9a9890', 0, h * 0.22, w, h * 0.33);
  for (let x = 0; x < w; x += w * 0.16)
    rect(ctx, 'rgba(0,0,0,0.12)', x, h * 0.22, 2, h * 0.33);
  for (let i = 0; i < randInt(rand, 4, 7); i++) {
    ctx.strokeStyle = pick(rand, [
      '#d03030',
      '#2050c0',
      '#20a040',
      '#e0a020',
      '#202020',
    ]);
    ctx.lineWidth = Math.max(2, h * 0.015);
    ctx.beginPath();
    let x = between(rand, 0, w * 0.85);
    const y = between(rand, h * 0.27, h * 0.45);
    ctx.moveTo(x, y);
    for (let j = 0; j < randInt(rand, 4, 7); j++) {
      x += between(rand, w * 0.015, w * 0.04);
      ctx.lineTo(x, y + between(rand, -h * 0.05, h * 0.05));
    }
    ctx.stroke();
  }
  // Concrete, with cracks.
  rect(
    ctx,
    vertical(ctx, h * 0.55, h, ['#b8b4aa', '#8c887e']),
    0,
    h * 0.55,
    w,
    h * 0.45,
  );
  ctx.strokeStyle = 'rgba(40,40,40,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const x = between(rand, 0, w);
    ctx.beginPath();
    ctx.moveTo(x, h * 0.6);
    ctx.lineTo(x + between(rand, -w * 0.1, w * 0.1), h);
    ctx.stroke();
  }
  // The quarter pipe on the right: a curve up to a coping rail and a deck.
  const qx = between(rand, w * 0.58, w * 0.68);
  ctx.fillStyle = vertical(ctx, h * 0.3, h * 0.8, ['#7c786e', '#a09c92']);
  ctx.beginPath();
  ctx.moveTo(qx, h * 0.8);
  ctx.quadraticCurveTo(w * 0.92, h * 0.8, w * 0.95, h * 0.3);
  ctx.lineTo(w, h * 0.3);
  ctx.lineTo(w, h * 0.8);
  ctx.closePath();
  ctx.fill();
  rect(ctx, '#c0c0c8', w * 0.93, h * 0.28, w * 0.07, h * 0.025);
  // The kid mid-fall, smeared by the slow shutter: the same figure three times, fading.
  const kx = between(rand, w * 0.25, w * 0.45);
  const shirt = pick(rand, ['#c03030', '#2a4a8a', '#3a7a3a', '#202020']);
  for (let ghost = 2; ghost >= 0; ghost--) {
    ctx.save();
    ctx.globalAlpha = ghost === 0 ? 0.95 : 0.25;
    ctx.translate(kx - ghost * w * 0.035, h * 0.55 - ghost * h * 0.02);
    ctx.rotate(-0.9);
    ellipse(ctx, shirt, 0, 0, w * 0.045, h * 0.09);
    ellipse(ctx, '#d8a878', 0, -h * 0.12, h * 0.045, h * 0.045);
    rect(ctx, '#2a3a5a', -w * 0.03, h * 0.07, w * 0.022, h * 0.1);
    rect(ctx, '#2a3a5a', w * 0.008, h * 0.07, w * 0.022, h * 0.1);
    rect(ctx, shirt, w * 0.03, -h * 0.06, w * 0.08, h * 0.025);
    ctx.restore();
  }
  board(
    ctx,
    pick(rand, ['#e0c040', '#3070c0', '#c04040']),
    kx + w * 0.16,
    h * 0.78,
    w * 0.2,
    between(rand, -0.5, 0.5),
  );
};

export const ramp: Painter = (ctx, rand, w, h) => {
  rect(ctx, vertical(ctx, 0, h * 0.5, ['#5a98d8', '#c0dcec']), 0, 0, w, h);
  for (let i = 0; i < 3; i++)
    ellipse(
      ctx,
      'rgba(255,255,255,0.75)',
      between(rand, 0, w),
      between(rand, h * 0.05, h * 0.25),
      w * 0.09,
      h * 0.035,
    );
  // A tree behind the fence.
  const tx = between(rand, w * 0.05, w * 0.3);
  rect(ctx, '#4a3420', tx - w * 0.015, h * 0.15, w * 0.03, h * 0.3);
  ellipse(ctx, '#3a6a2a', tx, h * 0.15, w * 0.13, h * 0.14);
  // The wooden fence.
  const fenceTop = h * 0.32;
  rect(ctx, '#8a6a44', 0, fenceTop, w, h * 0.26);
  for (let x = 0; x < w; x += w * 0.06) {
    rect(
      ctx,
      pick(rand, ['#9a7850', '#8a6840', '#a08058']),
      x,
      fenceTop - between(rand, 0, h * 0.02),
      w * 0.055,
      h * 0.27,
    );
    rect(ctx, 'rgba(0,0,0,0.25)', x + w * 0.055, fenceTop, w * 0.005, h * 0.26);
  }
  rect(ctx, 'rgba(0,0,0,0.15)', 0, fenceTop + h * 0.06, w, h * 0.015);
  rect(ctx, 'rgba(0,0,0,0.15)', 0, fenceTop + h * 0.19, w, h * 0.015);
  // Grass, worn down where the ramp lands.
  rect(
    ctx,
    vertical(ctx, h * 0.58, h, ['#5a8a3a', '#3a6a28']),
    0,
    h * 0.58,
    w,
    h * 0.42,
  );
  ellipse(ctx, '#8a7a50', w * 0.35, h * 0.85, w * 0.2, h * 0.06);
  // The ramp: a plywood wedge with plank lines and a dark side.
  const rx = between(rand, w * 0.45, w * 0.55);
  const rw = w * 0.38;
  const top = h * between(rand, 0.48, 0.55);
  poly(ctx, '#6a4a28', [
    [rx + rw, top],
    [rx + rw, h * 0.86],
    [rx + rw * 1.04, h * 0.84],
    [rx + rw * 1.04, top + h * 0.02],
  ]);
  poly(ctx, '#c8a068', [
    [rx, h * 0.86],
    [rx + rw, top],
    [rx + rw, h * 0.86],
  ]);
  ctx.strokeStyle = 'rgba(90,60,30,0.6)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const x = rx + (rw * i) / 5;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.86);
    ctx.lineTo(x, h * 0.86 - ((h * 0.86 - top) * i) / 5);
    ctx.stroke();
  }
  // Dex's board, against the ramp, grip tape up.
  board(
    ctx,
    '#202020',
    rx + rw * 0.35,
    h * 0.9,
    w * 0.22,
    between(rand, -0.15, 0.05),
  );
};
