import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/os/random';
import {
  closestOnArc,
  closestOnSegment,
  contact,
  type ArcShape,
} from './geometry';
import {
  BALL_R,
  MAX_SPEED,
  MAX_SUBSTEP_MOVE,
  STEP,
  flipperTip,
  makeFlipper,
  stepPhysics,
  substepsFor,
  type Ball,
  type Collider,
} from './physics';
import {
  ARCH,
  BUMPERS,
  BUMPER_R,
  DRAIN_Y,
  TW,
  buildColliders,
  makeFlippers,
} from './table';

const ball = (x: number, y: number, vx = 0, vy = 0): Ball => ({ x, y, vx, vy });
const run = (b: Ball, cols: Collider[], seconds: number, gravity = 0) => {
  for (let t = 0; t < seconds; t += STEP)
    stepPhysics(b, cols, [], STEP, gravity);
};
const wall = (x0: number, y0: number, x1: number, y1: number): Collider => ({
  id: 'wall',
  shape: { kind: 'segment', a: { x: x0, y: y0 }, b: { x: x1, y: y1 } },
  material: 'wall',
});

describe('collision geometry', () => {
  it('finds the closest point on a segment, clamped to its ends', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    expect(closestOnSegment({ x: 4, y: 5 }, a, b)).toEqual({ x: 4, y: 0 });
    expect(closestOnSegment({ x: -3, y: 2 }, a, b)).toEqual(a);
    expect(closestOnSegment({ x: 30, y: -2 }, a, b)).toEqual(b);
  });

  it('finds the closest point on an arc, or its nearer end outside the sweep', () => {
    const arc: ArcShape = {
      kind: 'arc',
      c: { x: 0, y: 0 },
      radius: 10,
      a0: Math.PI,
      a1: Math.PI * 2,
    };
    const top = closestOnArc({ x: 0, y: -3 }, arc);
    expect(top.x).toBeCloseTo(0);
    expect(top.y).toBeCloseTo(-10);
    // Below the centre is outside the upper half: the nearer end wins.
    const end = closestOnArc({ x: 8, y: 6 }, arc);
    expect(end.x).toBeCloseTo(10);
    expect(end.y).toBeCloseTo(0);
  });

  it('reports circle–segment contact with the normal towards the ball', () => {
    const c = contact({ x: 5, y: -6 }, BALL_R, wall(0, 0, 10, 0).shape);
    expect(c?.n.y).toBeCloseTo(-1);
    expect(c?.depth).toBeCloseTo(2);
    expect(
      contact({ x: 5, y: -9 }, BALL_R, wall(0, 0, 10, 0).shape),
    ).toBeNull();
  });

  it('reports circle–circle contact including both radii', () => {
    const shape = { kind: 'circle' as const, c: { x: 0, y: 0 }, radius: 20 };
    const c = contact({ x: 0, y: 25 }, BALL_R, shape);
    expect(c?.n).toEqual({ x: 0, y: 1 });
    expect(c?.depth).toBeCloseTo(3);
    expect(c?.point).toEqual({ x: 0, y: 20 });
    expect(contact({ x: 0, y: 29 }, BALL_R, shape)).toBeNull();
  });

  it('lets a one-way wall stop the ball from its solid side only', () => {
    const shape = {
      kind: 'segment' as const,
      a: { x: 0, y: 0 },
      b: { x: 20, y: 0 },
      oneWay: { x: 0, y: -1 },
    };
    expect(contact({ x: 10, y: -5 }, BALL_R, shape)?.n).toEqual({
      x: 0,
      y: -1,
    });
    expect(contact({ x: 10, y: 5 }, BALL_R, shape)).toBeNull();
  });
});

describe('ball physics', () => {
  it('bounces off a wall with the wall restitution', () => {
    const b = ball(50, 50, 0, 400);
    run(b, [wall(0, 100, 100, 100)], 0.3);
    expect(b.vy).toBeLessThan(0);
    expect(-b.vy).toBeGreaterThan(400 * 0.4);
    expect(-b.vy).toBeLessThan(400 * 0.5);
    expect(b.y).toBeLessThan(100 - BALL_R + 0.01);
  });

  it('kicks a ball off a bumper faster than it arrived', () => {
    const b = ball(0, -60, 0, 300);
    const bumper: Collider = {
      id: 'bumper:0',
      shape: { kind: 'circle', c: { x: 0, y: 0 }, radius: 20 },
      material: 'bumper',
    };
    const hits = [];
    for (let t = 0; t < 0.3; t += STEP)
      hits.push(...stepPhysics(b, [bumper], [], STEP, 0));
    expect(hits.map((h) => h.id)).toContain('bumper:0');
    expect(b.vy).toBeLessThan(-300);
  });

  it('keeps a ball inside a concave arc', () => {
    const arcCol: Collider = {
      id: 'wall',
      shape: { kind: 'arc', ...ARCH, a0: Math.PI, a1: Math.PI * 2 },
      material: 'wall',
    };
    const b = ball(ARCH.c.x + 40, ARCH.c.y - 100, 300, -MAX_SPEED);
    for (let t = 0; t < 0.15; t += STEP) {
      stepPhysics(b, [arcCol], [], STEP, 0);
      expect(Math.hypot(b.x - ARCH.c.x, b.y - ARCH.c.y)).toBeLessThan(
        ARCH.radius - BALL_R + 0.5,
      );
    }
    expect(b.vy).toBeGreaterThan(0);
  });

  it('caps the speed and picks enough substeps for it', () => {
    const b = ball(0, 0, MAX_SPEED * 3, 0);
    stepPhysics(b, [], [], STEP, 0);
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(MAX_SPEED);
    const n = substepsFor(b, [], STEP);
    expect((MAX_SPEED * STEP) / n).toBeLessThanOrEqual(MAX_SUBSTEP_MOVE);
  });
});

describe('flippers', () => {
  const flipper = () =>
    makeFlipper('left', { x: 0, y: 0 }, 52, 7, { rest: 0.5, up: -0.45 });

  it('swings up while pressed and falls back when released', () => {
    const f = flipper();
    f.pressed = true;
    for (let t = 0; t < 0.1; t += STEP)
      stepPhysics(ball(999, 999), [], [f], STEP, 0);
    expect(f.angle).toBeCloseTo(-0.45);
    f.pressed = false;
    for (let t = 0; t < 0.2; t += STEP)
      stepPhysics(ball(999, 999), [], [f], STEP, 0);
    expect(f.angle).toBeCloseTo(0.5);
  });

  it('transfers its angular velocity to the ball (an upward flip)', () => {
    const f = flipper();
    // The ball sits on the flipper, 2/3 of the way to the tip.
    const tip = flipperTip(f);
    const b = ball(tip.x * 0.66, tip.y * 0.66 - 7 - BALL_R - 0.5, 0, 0);
    let vyMin = 0;
    f.pressed = true;
    for (let t = 0; t < 0.08; t += STEP) {
      stepPhysics(b, [], [f], STEP, 0);
      vyMin = Math.min(vyMin, b.vy);
    }
    expect(vyMin).toBeLessThan(-500);
    // Further from the pivot means more speed.
    const f2 = flipper();
    const near = ball(tip.x * 0.25, tip.y * 0.25 - 7 - BALL_R - 0.5);
    f2.pressed = true;
    for (let t = 0; t < 0.08; t += STEP) stepPhysics(near, [], [f2], STEP, 0);
    expect(Math.hypot(near.vx, near.vy)).toBeLessThan(Math.abs(vyMin));
  });

  it('only bounces a ball off a resting flipper (no energy gain)', () => {
    const f = flipper();
    const tip = flipperTip(f);
    const b = ball(tip.x * 0.6, tip.y * 0.6 - 40, 0, 300);
    for (let t = 0; t < 0.3; t += STEP) stepPhysics(b, [], [f], STEP, 0);
    expect(Math.hypot(b.vx, b.vy)).toBeLessThanOrEqual(300);
  });
});

describe('no tunnelling at max speed', () => {
  it('never lets a ball through a zero-thickness wall, at any angle', () => {
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI - Math.PI; // aimed upwards at the wall
      const b = ball(100, 60, Math.cos(a) * MAX_SPEED, Math.sin(a) * MAX_SPEED);
      if (b.vy > -1) continue;
      for (let t = 0; t < 0.1; t += STEP) {
        stepPhysics(b, [wall(-1000, 0, 1000, 0)], [], STEP, 0);
        expect(b.y).toBeGreaterThan(0);
      }
    }
  });

  it('never lets a falling ball through a flipper swinging up into it', () => {
    for (let i = 0; i < 20; i++) {
      const f = makeFlipper('left', { x: 0, y: 0 }, 52, 7, {
        rest: 0.5,
        up: -0.45,
      });
      const tip = flipperTip(f);
      const t0 = 0.3 + i * 0.03;
      const b = ball(tip.x * t0, tip.y * t0 - 30, 0, MAX_SPEED);
      f.pressed = true;
      for (let t = 0; t < 0.1; t += STEP) {
        stepPhysics(b, [], [f], STEP, 0);
        // Signed side of the flipper's centre line: the ball stays above it.
        const tp = flipperTip(f);
        const cross = tp.x * b.y - tp.y * b.x;
        expect(cross).toBeLessThan(0);
      }
    }
  });

  it('keeps max-speed balls inside the table walls', () => {
    const rand = mulberry32(7);
    const cols = buildColliders();
    for (let shot = 0; shot < 40; shot++) {
      const flippers = makeFlippers();
      const a = rand() * Math.PI * 2;
      const b = ball(
        120 + rand() * 180,
        120 + rand() * 200,
        Math.cos(a) * MAX_SPEED,
        Math.sin(a) * MAX_SPEED,
      );
      for (let t = 0; t < 2 && b.y < DRAIN_Y; t += STEP) {
        flippers[0].pressed = flippers[1].pressed = rand() < 0.5;
        stepPhysics(b, cols, flippers, STEP);
        expect(b.x).toBeGreaterThan(10);
        expect(b.x).toBeLessThan(TW);
        if (b.y < ARCH.c.y)
          expect(Math.hypot(b.x - ARCH.c.x, b.y - ARCH.c.y)).toBeLessThan(
            ARCH.radius,
          );
        for (const c of BUMPERS)
          expect(Math.hypot(b.x - c.x, b.y - c.y)).toBeGreaterThan(BUMPER_R);
      }
    }
  });
});
