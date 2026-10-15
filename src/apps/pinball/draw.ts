// Draws one frame of Star Pinball over the static backdrop: planets (bumpers), lights,
// slingshots, S-T-A-R targets, flippers, plunger and the ball, then the dot-matrix display.
import { t } from '@/i18n/t';
import { FONT, LADDER, MULT_LIGHT, NEON, SAVE_LIGHT } from './backdrop';
import {
  TABLE_X,
  TABLE_Y,
  VIEW_H,
  VIEW_W,
  displayLines,
  drawDisplay,
} from './display';
import { BALL_R, flipperTip, type Flipper } from './physics';
import { RANKS, type Game } from './sim';
import {
  BUMPERS,
  BUMPER_R,
  LANE_X,
  PLUNGER_REST,
  PLUNGER_TRAVEL,
  RAMP,
  ROLLOVER_X,
  SLINGS,
  TARGETS,
  TARGET_X,
  TH,
} from './table';

type Ctx = CanvasRenderingContext2D;

const PLANETS = [
  { body: ['#ffd27a', '#c2621c'], ring: '#ffe7b0' },
  { body: ['#8ff0d0', '#1d6f8f'], ring: null },
  { body: ['#ff9a8a', '#8f1d3a'], ring: null },
] as const;
/** The drop-target letters: the S-T-A-R bank, the same in every language. */
const STAR = 'STAR';

export interface FrameOptions {
  /** Seconds, for blinking lights (frozen under reduced motion). */
  clock: number;
  /** The menu backdrop: chasing lights, no ball. */
  attract: boolean;
}

function lamp(
  c: Ctx,
  x: number,
  y: number,
  r: number,
  on: boolean,
  hue: string,
) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (on) {
    c.shadowColor = hue;
    c.shadowBlur = 10;
    c.fillStyle = hue;
  } else {
    c.fillStyle = 'rgb(255 255 255 / 10%)';
  }
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = on ? '#fff' : 'rgb(255 255 255 / 30%)';
  c.lineWidth = 1;
  c.stroke();
}

function planets(c: Ctx, g: Game) {
  BUMPERS.forEach((p, i) => {
    const look = PLANETS[i]!;
    const hit = (g.flash[`bumper:${i}`] ?? 0) > 0;
    if (hit) {
      c.shadowColor = '#fff6c0';
      c.shadowBlur = 22;
    }
    const grad = c.createRadialGradient(
      p.x - 7,
      p.y - 7,
      2,
      p.x,
      p.y,
      BUMPER_R,
    );
    grad.addColorStop(0, hit ? '#ffffff' : look.body[0]);
    grad.addColorStop(1, look.body[1]);
    c.fillStyle = grad;
    c.beginPath();
    c.arc(p.x, p.y, BUMPER_R, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;
    if (look.ring) {
      c.strokeStyle = look.ring;
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(p.x, p.y, BUMPER_R + 9, 6, -0.35, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = hit ? '#fff' : NEON;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(p.x, p.y, BUMPER_R + 2, 0, Math.PI * 2);
    c.stroke();
  });
}

function slings(c: Ctx, g: Game) {
  SLINGS.forEach(([top, , inner], i) => {
    const hit = (g.flash[`sling:${i}`] ?? 0) > 0;
    c.strokeStyle = hit ? '#ffffff' : '#ff4fb0';
    c.shadowColor = '#ff4fb0';
    c.shadowBlur = hit ? 16 : 6;
    c.lineWidth = hit ? 5 : 3.5;
    c.beginPath();
    c.moveTo(top.x, top.y);
    c.lineTo(inner.x, inner.y);
    c.stroke();
    c.shadowBlur = 0;
  });
}

function targets(c: Ctx, g: Game) {
  TARGETS.forEach((t, i) => {
    const down = g.targets[i];
    const y = (t.y0 + t.y1) / 2;
    if (down) {
      c.strokeStyle = 'rgb(255 255 255 / 25%)';
      c.lineWidth = 1;
      c.strokeRect(TARGET_X - 1, t.y0, 4, t.y1 - t.y0);
    } else {
      const flash = (g.flash[`target:${i}`] ?? 0) > 0;
      c.fillStyle = flash ? '#fff' : '#ffcf3f';
      c.fillRect(TARGET_X - 4, t.y0, 7, t.y1 - t.y0);
    }
    // The letter lamp beside the bank lights when its target is down.
    c.font = `bold 12px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = down ? '#ffcf3f' : 'rgb(255 207 63 / 30%)';
    if (down) {
      c.shadowColor = '#ffcf3f';
      c.shadowBlur = 8;
    }
    c.fillText(STAR[i]!, TARGET_X - 16, y);
    c.shadowBlur = 0;
  });
}

function lights(c: Ctx, g: Game, o: FrameOptions) {
  const blink = Math.floor(o.clock * 4) % 2 === 0;
  const chase = Math.floor(o.clock * 6);
  ROLLOVER_X.forEach((x, i) => {
    const on = o.attract
      ? chase % 3 === i
      : g.lanes[i] || (g.flash[`rollover:${i}`] ?? 0) > 0;
    lamp(c, x, 81, 5, !!on, '#7dff6a');
  });
  RANKS.forEach((_, i) => {
    const y = LADDER.y + (RANKS.length - 1 - i) * LADDER.row;
    const on = o.attract ? chase % RANKS.length === i : i <= g.rank;
    lamp(c, LADDER.x + 4, y, 4.5, on, '#ffcf3f');
  });
  lamp(
    c,
    MULT_LIGHT.x,
    MULT_LIGHT.y,
    9,
    !o.attract && g.multiplier > 1,
    '#ff4fb0',
  );
  c.font = `bold 9px ${FONT}`;
  c.fillStyle = '#fff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('2X', MULT_LIGHT.x, MULT_LIGHT.y + 0.5);
  const saving = !o.attract && !g.saveUsed && g.saveUntil > g.time;
  lamp(c, SAVE_LIGHT.x, SAVE_LIGHT.y, 5, saving && blink, '#ff5a4a');
  // The ramp arrow: lit briefly on a hit, blinking in attract mode.
  const rampOn = (g.flash.ramp ?? 0) > 0 || (o.attract && blink);
  const ax = (RAMP.x0 + RAMP.x1) / 2;
  c.fillStyle = rampOn ? '#7dff6a' : 'rgb(125 255 106 / 20%)';
  c.beginPath();
  c.moveTo(ax, RAMP.bottom - 26);
  c.lineTo(ax + 9, RAMP.bottom - 12);
  c.lineTo(ax - 9, RAMP.bottom - 12);
  c.closePath();
  c.fill();
}

function flipper(c: Ctx, f: Flipper, dead: boolean) {
  const tip = flipperTip(f);
  c.lineCap = 'round';
  c.strokeStyle = dead ? '#555' : f.pressed ? '#ffffff' : '#e8f4ff';
  c.shadowColor = NEON;
  c.shadowBlur = dead ? 0 : 10;
  c.lineWidth = f.radius * 2;
  c.beginPath();
  c.moveTo(f.pivot.x, f.pivot.y);
  c.lineTo(tip.x, tip.y);
  c.stroke();
  c.shadowBlur = 0;
  c.strokeStyle = dead ? '#333' : '#1aa8d8';
  c.lineWidth = f.radius * 0.8;
  c.beginPath();
  c.moveTo(f.pivot.x, f.pivot.y);
  c.lineTo(tip.x, tip.y);
  c.stroke();
}

function plunger(c: Ctx, g: Game) {
  const top = PLUNGER_REST + g.plunger.pull * PLUNGER_TRAVEL;
  c.fillStyle = '#c9d6e3';
  c.fillRect(LANE_X - 10, top, 20, 4);
  c.strokeStyle = '#8fa3b8';
  c.lineWidth = 1.5;
  c.beginPath();
  const coils = 6;
  const h = TH - (top + 4);
  for (let i = 0; i <= coils * 2; i++) {
    const y = top + 4 + (i / (coils * 2)) * h;
    const x = LANE_X + (i % 2 ? 6 : -6);
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
}

function ball(c: Ctx, g: Game) {
  const b = g.ball;
  if (!b) return;
  const grad = c.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BALL_R);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#c8d2dc');
  grad.addColorStop(1, '#4a5868');
  c.fillStyle = grad;
  c.beginPath();
  c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
  c.fill();
}

export function drawFrame(
  c: Ctx,
  g: Game,
  backdrop: CanvasImageSource,
  o: FrameOptions,
) {
  c.drawImage(backdrop, 0, 0, VIEW_W, VIEW_H);
  c.save();
  c.translate(TABLE_X, TABLE_Y);
  slings(c, g);
  lights(c, g, o);
  targets(c, g);
  planets(c, g);
  plunger(c, g);
  for (const f of g.flippers) flipper(c, f, g.tilted);
  ball(c, g);
  if (g.tilted) {
    c.font = `bold 48px ${FONT}`;
    c.textAlign = 'center';
    c.fillStyle = 'rgb(255 60 60 / 75%)';
    c.fillText(t('pinball.printed.tilt'), 206, 330);
  }
  c.restore();
  drawDisplay(c, displayLines(g, o.attract), o.clock);
}
