// The tool models, drawn on the effects canvas at the pointer (the native cursor is hidden).
// The hammer, chainsaw and stamp have their hotspot where their damage lands; the machine gun
// and flamethrower are held below-right of the pointer and aim at it (pose.ts). Original
// shapes, shaded with gradients; no shadowBlur.
import type { ToolId } from './engine';
import {
  FLAME,
  flamePose,
  GUN,
  gunPose,
  SAW_ANGLE,
  type AimPose,
} from './pose';

type Ctx = CanvasRenderingContext2D;

export interface CursorState {
  tool: ToolId;
  x: number;
  y: number;
  /** The tool is held down. */
  held: boolean;
  /** 0..1: how fresh the last hit is (hammer swing, stamp press, gun recoil). */
  kick: number;
  /** Seconds, for idle wobble and vibration (frozen under reduced motion). */
  clock: number;
}

const INK = '#16181b';

function outline(ctx: Ctx, width = 1.4) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function roundRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** A top-to-bottom gradient across [y0, y1]: light, base, dark. */
function shade(
  ctx: Ctx,
  y0: number,
  y1: number,
  light: string,
  base: string,
  dark: string,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, light);
  g.addColorStop(0.45, base);
  g.addColorStop(1, dark);
  return g;
}

function part(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | CanvasGradient,
  line = 1.4,
) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  outline(ctx, line);
}

const steel = (ctx: Ctx, y0: number, y1: number) =>
  shade(ctx, y0, y1, '#eef2f5', '#9aa3ac', '#4d555d');
const gunmetal = (ctx: Ctx, y0: number, y1: number) =>
  shade(ctx, y0, y1, '#6b737c', '#2f343a', '#121518');

/** Claw hammer: the striking face sits on the hotspot; a fresh hit swings it down flat. */
function hammer(ctx: Ctx, s: CursorState) {
  ctx.rotate(-0.95 + s.kick * 1.05);
  ctx.scale(1.2, 1.2);
  // Handle: varnished wood with grain, then a rubber grip.
  part(
    ctx,
    6,
    -19,
    64,
    10,
    4,
    shade(ctx, -19, -9, '#e2a866', '#b0733a', '#6e4119'),
  );
  ctx.strokeStyle = 'rgba(90, 50, 18, 0.55)';
  ctx.lineWidth = 0.8;
  for (const [x0, x1, y] of [
    [12, 40, -16],
    [18, 46, -13],
    [10, 30, -11.5],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo((x0 + x1) / 2, y - 1.2, x1, y);
    ctx.stroke();
  }
  part(
    ctx,
    46,
    -20.5,
    28,
    13,
    5,
    shade(ctx, -20, -8, '#4a4f56', '#22262b', '#0b0c0e'),
  );
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  for (let x = 50; x < 72; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, -19);
    ctx.lineTo(x, -9.5);
    ctx.stroke();
  }
  // Head: a round striking face at the bottom, the eye the handle goes through, and a thin
  // split claw curling back over the handle.
  const metal = ctx.createLinearGradient(-9, 0, 9, 0);
  metal.addColorStop(0, '#4f565d');
  metal.addColorStop(0.35, '#eef2f5');
  metal.addColorStop(0.65, '#a3acb5');
  metal.addColorStop(1, '#3a4148');
  ctx.beginPath();
  ctx.moveTo(-6, -27);
  ctx.quadraticCurveTo(-7, -40, 4, -50);
  ctx.quadraticCurveTo(10, -54, 15, -53);
  ctx.quadraticCurveTo(6, -46, 5, -36);
  ctx.lineTo(6, -27);
  ctx.closePath();
  ctx.fillStyle = metal;
  ctx.fill();
  outline(ctx);
  ctx.beginPath();
  ctx.moveTo(1, -41);
  ctx.lineTo(10, -51);
  outline(ctx, 1.1);
  part(ctx, -8, -28, 16, 18, 2, metal);
  part(ctx, -10, -11, 20, 11, 3, metal);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(-9, -3, 18, 1.6);
  ctx.fillRect(-5, -26, 2, 14);
}

/** Chainsaw: the bar's tip on the hotspot, its chain running and the engine shaking. */
function chainsaw(ctx: Ctx, s: CursorState) {
  if (s.held)
    ctx.translate(Math.sin(s.clock * 95) * 1.4, Math.cos(s.clock * 80) * 1.1);
  ctx.rotate(SAW_ANGLE);
  // Guide bar with a rounded nose.
  ctx.beginPath();
  ctx.moveTo(6, -7);
  ctx.lineTo(62, -9);
  ctx.lineTo(62, 9);
  ctx.lineTo(6, 7);
  ctx.arc(6, 0, 7, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = shade(ctx, -9, 9, '#f1f4f6', '#b5bdc5', '#6d757d');
  ctx.fill();
  outline(ctx);
  ctx.fillStyle = 'rgba(40, 45, 50, 0.4)';
  ctx.fillRect(14, -1.5, 44, 3);
  // The chain: cutter teeth along both edges and around the nose, moving while it runs.
  const shift = s.held ? (s.clock * 90) % 6 : 0;
  ctx.fillStyle = '#26292d';
  for (let x = 6 + shift; x < 62; x += 6) {
    const lift = ((x - shift) / 6) % 2 < 1 ? 1 : 0;
    ctx.fillRect(x, -10.5 - lift, 3.6, 3 + lift);
    ctx.fillRect(x, 7.5, 3.6, 3 + lift);
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 2 + ((i + 0.5 + (shift / 6) * 0.5) / 4) * Math.PI;
    ctx.beginPath();
    ctx.arc(6 + Math.cos(a) * 9, Math.sin(a) * 9, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // Engine housing: orange shell, a black cover with cooling slats, the exhaust grille.
  part(
    ctx,
    52,
    -19,
    50,
    36,
    8,
    shade(ctx, -19, 17, '#ffb45c', '#f07d14', '#a54a05'),
  );
  part(
    ctx,
    72,
    -15,
    26,
    22,
    4,
    shade(ctx, -15, 7, '#3b3f45', '#1d2024', '#090a0b'),
    1,
  );
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.4;
  for (let x = 77; x < 96; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, -11);
    ctx.lineTo(x, 3);
    ctx.stroke();
  }
  part(ctx, 60, 8, 12, 7, 2, '#5d646b', 1);
  ctx.fillStyle = '#1d2024';
  for (let x = 62; x < 71; x += 3) ctx.fillRect(x, 10, 1.4, 3);
  // Wrap-around front handle and the rear handle with its trigger.
  ctx.beginPath();
  ctx.moveTo(60, -19);
  ctx.quadraticCurveTo(66, -36, 84, -34);
  ctx.quadraticCurveTo(98, -32, 96, -19);
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = '#33373c';
  ctx.stroke();
  part(
    ctx,
    100,
    -12,
    18,
    20,
    6,
    shade(ctx, -12, 8, '#4a4f56', '#22262b', '#0b0c0e'),
  );
  part(ctx, 104, 6, 6, 7, 2, '#f07d14', 1);
  // A highlight down the shell.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(56, -16, 14, 2.4);
}

/** Moves into a held tool's own frame: its grip, rotated to the aim, mirrored when aiming left. */
function enterPose(ctx: Ctx, s: CursorState, pose: AimPose) {
  ctx.translate(pose.x - s.x, pose.y - s.y);
  ctx.rotate(pose.angle);
  ctx.scale(1, pose.flip);
}

/** Flamethrower: twin tanks, a hose and a wand whose nozzle the flames shoot from. */
function flamethrower(ctx: Ctx, s: CursorState) {
  // A faint aiming ring at the target.
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(255, 140, 40, 0.55)';
  ctx.stroke();
  ctx.save();
  enterPose(ctx, s, flamePose(s.x, s.y));
  const tip = FLAME.nozzle;
  // Tanks behind the grip, strapped together.
  for (const y of [-30, -12]) {
    part(
      ctx,
      -86,
      y,
      52,
      17,
      8.5,
      shade(ctx, y, y + 17, '#ff7b6b', '#c4231b', '#6a0d08'),
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-80, y + 3, 38, 2.2);
  }
  part(ctx, -64, -32, 6, 37, 1.5, '#3a2b1d', 1);
  part(ctx, -34, -26, 8, 10, 2, steel(ctx, -26, -16), 1);
  // Hose from the valve to the wand's back.
  ctx.beginPath();
  ctx.moveTo(-26, -21);
  ctx.bezierCurveTo(-10, -30, -16, 2, 0, -2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 3.6;
  ctx.strokeStyle = '#4b4f55';
  ctx.stroke();
  // Wand, grip and trigger, the perforated heat guard and the nozzle.
  part(ctx, -2, -4, tip - 6, 8, 3, steel(ctx, -4, 4));
  part(ctx, 4, 2, 9, 18, 3, shade(ctx, 2, 20, '#5a4030', '#3a2a1e', '#1b120c'));
  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.quadraticCurveTo(18, 12, 13, 13);
  outline(ctx, 1.6);
  part(ctx, 28, -8, 30, 16, 4, gunmetal(ctx, -8, 8));
  ctx.fillStyle = '#0b0c0e';
  for (let x = 32; x < 56; x += 5) {
    for (const y of [-3.5, 2.5]) {
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.beginPath();
  ctx.moveTo(tip - 8, -5);
  ctx.lineTo(tip, -6.5);
  ctx.lineTo(tip, 6.5);
  ctx.lineTo(tip - 8, 5);
  ctx.closePath();
  ctx.fillStyle = steel(ctx, -6, 6);
  ctx.fill();
  outline(ctx);
  // Pilot light: a small blue flame idle, a bright orange one while firing.
  const r = s.held
    ? 7 + Math.sin(s.clock * 40)
    : 3.4 + Math.sin(s.clock * 12) * 0.6;
  const g = ctx.createRadialGradient(tip + 2, 0, 0, tip + 2, 0, Math.max(1, r));
  if (s.held) {
    g.addColorStop(0, 'rgba(255, 252, 220, 1)');
    g.addColorStop(0.5, 'rgba(255, 170, 40, 0.9)');
    g.addColorStop(1, 'rgba(255, 90, 20, 0)');
  } else {
    g.addColorStop(0, 'rgba(220, 240, 255, 0.95)');
    g.addColorStop(0.5, 'rgba(70, 140, 255, 0.85)');
    g.addColorStop(1, 'rgba(40, 90, 255, 0)');
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(tip + 2, 0, Math.max(1, r), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Machine gun: a crosshair at the pointer and the gun held below-right, recoiling on each shot. */
function machinegun(ctx: Ctx, s: CursorState) {
  ctx.save();
  enterPose(ctx, s, gunPose(s.x, s.y));
  ctx.translate(-s.kick * GUN.recoil, 0);
  const tip = GUN.muzzle;
  // Stock.
  ctx.beginPath();
  ctx.moveTo(-26, -9);
  ctx.lineTo(-74, -6);
  ctx.lineTo(-78, 16);
  ctx.lineTo(-62, 16);
  ctx.lineTo(-26, 6);
  ctx.closePath();
  ctx.fillStyle = shade(ctx, -9, 16, '#5b4128', '#3a2716', '#1a1009');
  ctx.fill();
  outline(ctx);
  part(ctx, -80, -7, 7, 24, 2, '#111315', 1);
  // Pistol grip and trigger guard.
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.lineTo(-6, 6);
  ctx.lineTo(-10, 30);
  ctx.lineTo(-24, 28);
  ctx.closePath();
  ctx.fillStyle = shade(ctx, 6, 30, '#3d4248', '#1d2024', '#0a0b0c');
  ctx.fill();
  outline(ctx);
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.quadraticCurveTo(4, 20, 8, 8);
  outline(ctx, 1.8);
  // Curved magazine.
  ctx.beginPath();
  ctx.moveTo(8, 7);
  ctx.lineTo(22, 7);
  ctx.quadraticCurveTo(26, 26, 34, 40);
  ctx.lineTo(21, 44);
  ctx.quadraticCurveTo(12, 28, 8, 7);
  ctx.closePath();
  ctx.fillStyle = shade(ctx, 7, 44, '#585f67', '#2a2e33', '#101214');
  ctx.fill();
  outline(ctx);
  // Receiver with its ejection port, the top rail and the rear sight.
  part(ctx, -28, -11, 64, 19, 3, gunmetal(ctx, -11, 8));
  part(ctx, 22, -9, 11, 5, 1, '#0a0b0c', 0.8);
  part(ctx, -22, -16, 54, 5, 1, gunmetal(ctx, -16, -11), 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  for (let x = -19; x < 30; x += 4) ctx.fillRect(x, -15, 2, 3);
  part(ctx, -24, -22, 7, 7, 1.5, '#1b1e21', 1);
  // Perforated barrel shroud, then the barrel and the muzzle brake.
  part(ctx, 36, -7.5, tip - 46, 14, 3, gunmetal(ctx, -7.5, 6.5));
  ctx.fillStyle = '#050606';
  for (let x = 41; x < tip - 12; x += 6) {
    ctx.beginPath();
    ctx.arc(x, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  part(ctx, tip - 10, -3, 8, 6, 1, steel(ctx, -3, 3), 1);
  part(ctx, tip - 4, -4.5, 6, 9, 1, gunmetal(ctx, -4.5, 4.5), 1);
  part(ctx, tip - 18, -13, 3, 6, 0.5, '#1b1e21', 0.8);
  // A highlight running along the top of the receiver.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(-26, -9.5, 60, 2);
  ctx.restore();
  // The crosshair: a dark underlay, then red.
  for (const [width, colour] of [
    [3.5, 'rgba(0, 0, 0, 0.55)'],
    [1.5, '#ff3b2f'],
  ] as const) {
    ctx.lineWidth = width;
    ctx.strokeStyle = colour;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      ctx.moveTo(dx * 5, dy * 5);
      ctx.lineTo(dx * 18, dy * 18);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#ff3b2f';
  ctx.fillRect(-1, -1, 2, 2);
}

/** Rubber stamp: hovers over the hotspot and squashes down onto it on a fresh press. */
function stamp(ctx: Ctx, s: CursorState) {
  ctx.translate(0, -4 + s.kick * 4 - (s.held ? 0 : 8));
  ctx.scale(1, 1 - s.kick * 0.12);
  // Red rubber pad under a wooden block.
  part(
    ctx,
    -22,
    -7,
    44,
    7,
    2,
    shade(ctx, -7, 0, '#ff6b6b', '#c3202c', '#6c0c13'),
  );
  part(
    ctx,
    -18,
    -17,
    36,
    11,
    3,
    shade(ctx, -17, -6, '#d79a5e', '#9a5f2b', '#5a3313'),
  );
  ctx.strokeStyle = 'rgba(80, 40, 12, 0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-14, -12);
  ctx.quadraticCurveTo(0, -14, 14, -11);
  ctx.stroke();
  // A turned stem and a round lacquered knob.
  part(
    ctx,
    -5,
    -38,
    10,
    22,
    3,
    shade(ctx, -38, -16, '#e0a466', '#a8693a', '#5f3815'),
  );
  const g = ctx.createRadialGradient(-4, -48, 1, 0, -44, 12);
  g.addColorStop(0, '#ff8f80');
  g.addColorStop(0.5, '#d1322a');
  g.addColorStop(1, '#6e0f0b');
  ctx.beginPath();
  ctx.arc(0, -44, 11, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx);
  ctx.beginPath();
  ctx.ellipse(-4, -48, 3.5, 2.2, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
}

const DRAW: Record<ToolId, (ctx: Ctx, s: CursorState) => void> = {
  hammer,
  chainsaw,
  flamethrower,
  machinegun,
  stamp,
};

export function drawCursor(ctx: Ctx, s: CursorState): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  DRAW[s.tool](ctx, s);
  ctx.restore();
}
