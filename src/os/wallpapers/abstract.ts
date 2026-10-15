// Abstract and space homages: Blue Ripple, Home Orbit.
import type { Painter } from './types';
import { ellipse, glow, rgba, stars } from './paint';

/** Abstract blue water ripples, lit from the top left. */
export const paintRipple: Painter = (ctx, w, h, rand) => {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#6fb6f2');
  bg.addColorStop(0.4, '#1d6fd0');
  bg.addColorStop(1, '#03215c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  glow(ctx, w * 0.12, h * 0.08, Math.max(w, h) * 0.55, [200, 235, 255], 0.55);

  // Rings spreading from a drop off to the lower right.
  const cx = w * (0.7 + rand() * 0.1);
  const cy = h * (0.75 + rand() * 0.1);
  const span = Math.hypot(w, h);
  for (let i = 0; i < 26; i++) {
    const r = span * (0.03 + i * 0.035 + rand() * 0.01);
    const fade = 1 - i / 26;
    ctx.lineWidth = span * (0.004 + rand() * 0.01) * (0.5 + fade);
    ctx.strokeStyle = rgba(
      i % 2 ? [3, 30, 90] : [190, 230, 255],
      0.08 + fade * 0.18,
    );
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.55, -0.25, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Long soft caustic waves sweeping across.
  for (let i = 0; i < 18; i++) {
    const y0 = rand() * h;
    const amp = h * (0.02 + rand() * 0.05);
    const freq = 1 + rand() * 2.5;
    const phase = rand() * Math.PI * 2;
    ctx.lineWidth = 1 + rand() * h * 0.012;
    ctx.strokeStyle = rgba([220, 240, 255], 0.04 + rand() * 0.1);
    ctx.beginPath();
    for (let s = 0; s <= 64; s++) {
      const x = (s / 64) * w;
      const y =
        y0 +
        Math.sin((s / 64) * freq * Math.PI * 2 + phase) * amp -
        (x / w) * h * 0.2;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Glints where the light catches.
  for (let i = 0; i < 40; i++) {
    const x = rand() * w * 0.7;
    const y = rand() * h * 0.6;
    ellipse(
      ctx,
      x,
      y,
      w * 0.01 * (1 + rand()),
      h * 0.002 * (1 + rand()),
      rgba([255, 255, 255], 0.15 + rand() * 0.2),
      -0.3,
    );
  }
};

/** The Earth's limb from orbit: ocean and cloud, a thin blue atmosphere, stars. */
export const paintOrbit: Painter = (ctx, w, h, rand) => {
  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, w, h);
  stars(ctx, w, h * 0.7, 380, rand);

  const r = Math.max(w, h) * 1.1;
  const cx = w * 0.62;
  const cy = h * 0.68 + r;

  // The planet: deep ocean, lit from the left.
  const body = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.9,
    r * 0.1,
    cx,
    cy,
    r,
  );
  body.addColorStop(0, '#2f7fd6');
  body.addColorStop(0.7, '#0c3d8c');
  body.addColorStop(1, '#0a2e6c');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.clip();
  // Wispy cloud streaks near the limb, flattened by perspective.
  for (let i = 0; i < 90; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 1.6;
    const d = r * (0.9 + rand() * 0.1);
    const near = (d - r * 0.88) / (r * 0.12);
    const len = w * (0.02 + rand() * 0.07) * near;
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * len * 0.5;
      const x = cx + Math.cos(a) * d - Math.sin(a) * off;
      const y = cy + Math.sin(a) * d + Math.cos(a) * off;
      ellipse(
        ctx,
        x,
        y,
        len * (0.6 + rand() * 0.4),
        len * 0.07,
        rgba([240, 248, 255], 0.06 + rand() * 0.12),
        a + Math.PI / 2,
      );
    }
  }
  // Night side to the right.
  const night = ctx.createLinearGradient(0, 0, w, 0);
  night.addColorStop(0, 'rgba(0, 0, 10, 0)');
  night.addColorStop(0.6, 'rgba(0, 0, 10, 0.25)');
  night.addColorStop(1, 'rgba(0, 0, 10, 0.8)');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // The atmosphere: a thin glowing shell just outside the limb.
  const air = ctx.createRadialGradient(cx, cy, r * 0.985, cx, cy, r * 1.03);
  air.addColorStop(0, 'rgba(150, 210, 255, 0)');
  air.addColorStop(0.35, 'rgba(160, 215, 255, 0.85)');
  air.addColorStop(0.55, 'rgba(70, 130, 255, 0.45)');
  air.addColorStop(1, 'rgba(10, 20, 80, 0)');
  ctx.fillStyle = air;
  ctx.fillRect(0, 0, w, h);
  // A dark sky fading back over the right of the shell (the night side has no glow).
  const fade = ctx.createLinearGradient(w * 0.55, 0, w, 0);
  fade.addColorStop(0, 'rgba(2, 3, 10, 0)');
  fade.addColorStop(1, 'rgba(2, 3, 10, 0.7)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);
  // Sunrise glare on the limb at the left.
  const gx = w * 0.12;
  const gy = cy - Math.sqrt(r * r - (gx - cx) ** 2);
  glow(ctx, gx, gy, w * 0.14, [255, 248, 230], 0.85);
  ellipse(ctx, gx, gy, w * 0.22, h * 0.004, 'rgba(255, 250, 235, 0.5)');
};
