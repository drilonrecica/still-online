// Hen Hunt rendering: composes scenery, hens, feathers, popups, the HUD and the crosshair
// for one frame of a `Game`. Coordinates are logical view pixels; the caller sets the scale.
import type { Hen } from './hens';
import {
  DEPTH,
  DEPTHS,
  SCARECROW,
  VIEW_H,
  VIEW_W,
  WINDMILL,
  WINDOW_HEN,
  HAT_AWAY_SECONDS,
  layerWidth,
  toScreenX,
  type Depth,
} from './layout';
import { drawHat, drawSails, windowFrame } from './props';
import type { Ctx, Scenery } from './scene';
import { drawCrosshair, drawHud, drawPopups } from './hud';
import type { Game } from './sim';

/** A cartoon hen with its body centre at (0, 0), facing right, radius `r`. */
export function drawHen(
  c: Ctx,
  r: number,
  flap: number,
  pose: 'fly' | 'stand' | 'peck' | 'fall',
  golden: boolean,
) {
  const body = golden ? '#f6c928' : '#fbf3df';
  const shade = golden ? '#c9940f' : '#d9c7a0';
  const line = golden ? '#8a6408' : '#8c7550';
  c.lineWidth = Math.max(1, r / 14);
  c.strokeStyle = line;
  // Tail feathers.
  c.fillStyle = shade;
  for (const a of [-0.9, -0.5, -0.1]) {
    c.beginPath();
    c.ellipse(-r * 0.95, -r * 0.35, r * 0.5, r * 0.2, a, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  if (pose !== 'fly') {
    c.strokeStyle = '#e08a1e';
    c.lineWidth = Math.max(1.5, r / 9);
    for (const lx of [-0.2, 0.15]) {
      c.beginPath();
      c.moveTo(r * lx, r * 0.7);
      c.lineTo(r * lx, r * 1.12);
      c.lineTo(r * (lx + 0.22), r * 1.12);
      c.stroke();
    }
    c.lineWidth = Math.max(1, r / 14);
    c.strokeStyle = line;
  }
  c.fillStyle = body;
  c.beginPath();
  c.ellipse(0, 0, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  // Wing: flaps in flight, folded on the ground.
  const wing =
    pose === 'fly' ? Math.sin(flap) * 0.9 : pose === 'fall' ? -1.2 : 0.15;
  c.save();
  c.translate(-r * 0.1, -r * 0.1);
  c.rotate(-wing);
  c.fillStyle = shade;
  c.beginPath();
  c.ellipse(-r * 0.25, 0, r * 0.62, r * 0.32, -0.25, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.restore();
  // Head, lowered to the ground while pecking.
  const dip = pose === 'peck' ? Math.max(0, Math.sin(flap)) : 0;
  const hx = r * (0.85 + dip * 0.25);
  const hy = -r * 0.55 + dip * r * 0.85;
  const hr = r * 0.48;
  c.fillStyle = '#d9271c';
  for (const [dx, dy, cr] of [
    [-0.35, -0.95, 0.3],
    [0, -1.1, 0.34],
    [0.35, -0.9, 0.28],
  ] as const) {
    c.beginPath();
    c.arc(hx + dx * hr, hy + dy * hr, cr * hr, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = body;
  c.beginPath();
  c.arc(hx, hy, hr, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = '#f2a11f';
  c.beginPath();
  c.moveTo(hx + hr * 0.8, hy - hr * 0.2);
  c.lineTo(hx + hr * 1.6, hy + hr * 0.1);
  c.lineTo(hx + hr * 0.8, hy + hr * 0.35);
  c.closePath();
  c.fill();
  c.fillStyle = '#d9271c';
  c.beginPath();
  c.ellipse(
    hx + hr * 0.7,
    hy + hr * 0.7,
    hr * 0.18,
    hr * 0.32,
    0,
    0,
    Math.PI * 2,
  );
  c.fill();
  // Eye: a dot, or a dizzy cross once hit.
  const ex = hx + hr * 0.3;
  const ey = hy - hr * 0.2;
  const er = Math.max(1, hr * 0.2);
  c.fillStyle = c.strokeStyle = '#1b1b1b';
  if (pose === 'fall') {
    c.lineWidth = Math.max(1, hr / 6);
    c.beginPath();
    c.moveTo(ex - er, ey - er);
    c.lineTo(ex + er, ey + er);
    c.moveTo(ex + er, ey - er);
    c.lineTo(ex - er, ey + er);
    c.stroke();
  } else {
    c.beginPath();
    c.arc(ex, ey, er, 0, Math.PI * 2);
    c.fill();
  }
}

function henPose(h: Hen): 'fly' | 'stand' | 'peck' | 'fall' {
  if (h.state === 'fall') return 'fall';
  if (h.state === 'peck') return 'peck';
  if (h.state === 'descend' || h.state === 'takeoff') return 'stand';
  return 'fly';
}

function drawHens(c: Ctx, g: Game, depth: Depth) {
  const r = DEPTH[depth].radius;
  for (const h of g.hens) {
    if (h.depth !== depth) continue;
    const x = toScreenX(h.x, depth, g.camX);
    if (x < -r * 3 || x > VIEW_W + r * 3) continue;
    c.save();
    c.translate(x, h.y);
    if (h.vx < 0) c.scale(-1, 1);
    if (h.state === 'fall') c.rotate(h.spin);
    drawHen(c, r, h.flap, henPose(h), h.golden);
    c.restore();
  }
}

function drawFeathers(c: Ctx, g: Game, depth: Depth) {
  const scale = DEPTH[depth].radius / 17;
  c.fillStyle = '#ffffff';
  c.strokeStyle = '#c9b88f';
  c.lineWidth = 0.8;
  for (const f of g.feathers) {
    if (f.depth !== depth) continue;
    c.save();
    c.globalAlpha = Math.min(1, f.life * 1.5);
    c.translate(toScreenX(f.x, depth, g.camX), f.y);
    c.rotate(f.angle);
    c.beginPath();
    c.ellipse(0, 0, 6 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
  }
}

/** Blits a pre-painted layer at its parallax offset. */
function blit(c: Ctx, img: HTMLCanvasElement, depth: Depth, camX: number) {
  c.drawImage(img, toScreenX(0, depth, camX), 0, layerWidth(depth), VIEW_H);
}

export interface FrameView {
  /** Windmill sail angle (radians). */
  sails: number;
  /** HUD and crosshair (off on the menu backdrop). */
  hud: boolean;
}

export function drawFrame(c: Ctx, g: Game, s: Scenery, view: FrameView) {
  c.drawImage(s.sky, 0, 0, VIEW_W, VIEW_H);
  for (const depth of DEPTHS) {
    blit(c, s.layers[depth], depth, g.camX);
    const ox = toScreenX(0, depth, g.camX);
    if (depth === 'far') {
      c.save();
      c.translate(ox, 0);
      if (g.windowHen.showing > 0) drawWindowHen(c, g.windowHen.showing);
      drawSails(c, view.sails);
      c.restore();
    }
    if (depth === 'mid') {
      c.save();
      c.translate(ox, 0);
      drawScarecrowHat(c, g.hatAway);
      c.restore();
    }
    drawHens(c, g, depth);
    drawFeathers(c, g, depth);
  }
  drawPopups(c, g);
  if (view.hud) {
    drawHud(c, g);
    if (g.pointer) drawCrosshair(c, g.pointer.x, g.pointer.y);
  }
}

function drawWindowHen(c: Ctx, showing: number) {
  const { x, y } = WINDMILL.window;
  windowFrame(c, true);
  // Pops up out of the sill, then ducks back down at the end.
  const rise = Math.min(1, (WINDOW_HEN.showSeconds - showing) * 6, showing * 6);
  c.save();
  c.beginPath();
  c.rect(x - 9, y - 9, 18, 18);
  c.clip();
  c.translate(x - 1, y + 4 + (1 - rise) * 14);
  drawHen(c, WINDOW_HEN.radius * 0.8, 0, 'stand', false);
  c.restore();
}

function drawScarecrowHat(c: Ctx, away: number) {
  const { x, y } = SCARECROW.hat;
  if (away === 0) {
    drawHat(c, x, y, 0);
    return;
  }
  // Knocked off: spins up and away, then drops back on in the last half-second.
  const t = HAT_AWAY_SECONDS - away;
  if (away < 0.5) {
    drawHat(c, x, y - away * 120, 0);
  } else if (t < 1.2) {
    drawHat(c, x + t * 70, y - t * 140 + t * t * 60, t * 8);
  }
}
