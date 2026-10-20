import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/os/random';
import { drawCursor } from './cursors';
import {
  bulletHole,
  crackPattern,
  hammerHit,
  jaggedCut,
  sawCut,
  scorchPuff,
  spreadPoint,
  stampMark,
  type Mark,
} from './damage';
import { drawFx, drawParticles, drawSweep, paintMark } from './draw';
import { addFx, flash, glow, MAX_FX, muzzle, ring, stepFx, tracer } from './fx';
import { flamePose, gunPose, local, sawExhaust } from './pose';
import { TOOL_IDS } from './engine';
import {
  MAX_PARTICLES,
  addParticles,
  casing,
  chip,
  ember,
  flame,
  glassBurst,
  sawdust,
  sawdustSpray,
  shard,
  smoke,
  spark,
  stepParticles,
} from './particles';

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** A 2D context that records method names and accepts any property. */
function recordingCtx() {
  const calls: string[] = [];
  const gradient = { addColorStop: () => {} };
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'calls') return calls;
      return () => {
        calls.push(String(key));
        return key.toString().startsWith('create') ? gradient : undefined;
      };
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe('damage generators', () => {
  it('are deterministic for a seed', () => {
    const a = crackPattern(mulberry32(7), 100, 100);
    const b = crackPattern(mulberry32(7), 100, 100);
    expect(a).toEqual(b);
    expect(crackPattern(mulberry32(8), 100, 100)).not.toEqual(a);
  });

  it('cracks radiate from the impact and stay near the radius', () => {
    for (let seed = 1; seed < 20; seed++) {
      const lines = crackPattern(mulberry32(seed), 200, 150, 90);
      const fromCentre = lines.filter(
        (l) => l[0]?.x === 200 && l[0]?.y === 150,
      );
      expect(fromCentre.length).toBeGreaterThanOrEqual(7);
      expect(fromCentre.length).toBeLessThanOrEqual(11);
      for (const line of lines) {
        expect(line.length).toBeGreaterThanOrEqual(2);
        // A ray's last step may overshoot by one step (≤ 18 px).
        for (const p of line)
          expect(dist(p, { x: 200, y: 150 })).toBeLessThan(90 + 18 + 1);
      }
    }
  });

  it('chainsaw cuts join exactly at their endpoints and stay near the line', () => {
    const from = { x: 10, y: 10 };
    const to = { x: 110, y: 10 };
    const pts = jaggedCut(mulberry32(3), from, to);
    expect(pts[0]).toEqual(from);
    expect(pts.at(-1)).toEqual(to);
    expect(pts.length).toBe(21);
    for (const p of pts) expect(Math.abs(p.y - 10)).toBeLessThanOrEqual(3);
    // Zero length still yields a drawable segment.
    expect(jaggedCut(mulberry32(3), from, from)).toEqual([from, from]);
  });

  it('bullets land within the spread and leave a hole with cracks', () => {
    const rand = mulberry32(11);
    for (let i = 0; i < 200; i++) {
      const p = spreadPoint(rand, 50, 50, 22);
      expect(dist(p, { x: 50, y: 50 })).toBeLessThanOrEqual(22 * 1.15 + 1e-9);
    }
    const hole = bulletHole(rand, 5, 6);
    expect(hole.kind).toBe('hole');
    if (hole.kind !== 'hole') return;
    expect(hole.r).toBeGreaterThanOrEqual(3);
    expect(hole.r).toBeLessThanOrEqual(5);
    expect(hole.cracks.length).toBeGreaterThanOrEqual(3);
    expect(hole.cracks.length).toBeLessThanOrEqual(5);
  });

  it('scorch puffs sit under the nozzle', () => {
    const m = scorchPuff(mulberry32(2), 300, 300);
    expect(m.kind).toBe('scorch');
    if (m.kind !== 'scorch') return;
    expect(dist(m, { x: 300, y: 300 })).toBeLessThanOrEqual(Math.SQRT2 * 5);
    expect(m.r).toBeGreaterThanOrEqual(22);
  });

  it('stamps alternate tread and BOOM!', () => {
    const rand = mulberry32(5);
    const kinds = [0, 1, 2, 3].map((n) => {
      const m = stampMark(rand, n, 0, 0);
      return m.kind === 'stamp' ? m.stamp : null;
    });
    expect(kinds).toEqual(['tread', 'boom', 'tread', 'boom']);
  });
});

describe('particles', () => {
  it('casings bounce on the floor and come to rest there', () => {
    const list = [casing(mulberry32(1), 100, 400)];
    let maxBounces = 0;
    for (let t = 0; t < 2; t += 1 / 60) {
      stepParticles(list, 1 / 60, 500);
      const c = list[0];
      if (!c) break;
      expect(c.y).toBeLessThanOrEqual(500);
      maxBounces = c.bounces;
    }
    expect(maxBounces).toBeGreaterThanOrEqual(1);
    expect(maxBounces).toBeLessThan(10);
    expect(list[0]?.y).toBe(500);
    expect(Math.abs(list[0]?.vy ?? 1)).toBe(0);
  });

  it('flames rise, sawdust falls, and everything dies', () => {
    const rand = mulberry32(4);
    const f = flame(rand, 0, 0);
    const s = sawdust(rand, 0, 0);
    const list = [f, s, shard(rand, 0, 0)];
    for (let i = 0; i < 20; i++) stepParticles(list, 0.01, 1e6);
    expect(f.y).toBeLessThan(0);
    expect(s.vy).toBeGreaterThan(-200 + 700 * 0.2 - 1);
    for (let i = 0; i < 400; i++) stepParticles(list, 0.01, 1e6);
    expect(list).toHaveLength(0);
  });

  it('caps the particle count, dropping the oldest', () => {
    const list = [sawdust(mulberry32(1), 0, 0)];
    const first = list[0];
    addParticles(
      list,
      Array.from({ length: MAX_PARTICLES }, () => sawdust(mulberry32(2), 0, 0)),
    );
    expect(list).toHaveLength(MAX_PARTICLES);
    expect(list).not.toContain(first);
  });
});

describe('drawing', () => {
  it('paints every mark, particle and cursor without a real canvas', () => {
    const { ctx, calls } = recordingCtx();
    const rand = mulberry32(9);
    const marks: Mark[] = [
      { kind: 'crack', x: 10, y: 10, lines: crackPattern(rand, 10, 10) },
      { kind: 'cut', points: jaggedCut(rand, { x: 0, y: 0 }, { x: 30, y: 0 }) },
      scorchPuff(rand, 5, 5),
      bulletHole(rand, 5, 5),
      stampMark(rand, 0, 5, 5),
      stampMark(rand, 1, 5, 5),
      hammerHit(rand, 40, 40),
      sawCut(rand, { x: 0, y: 0 }, { x: 40, y: 10 }),
    ];
    for (const m of marks) paintMark(ctx, m);
    expect(calls.filter((c) => c === 'stroke').length).toBeGreaterThan(10);
    expect(calls).toContain('fillText');

    drawParticles(ctx, [
      sawdust(rand, 0, 0),
      flame(rand, 0, 0),
      casing(rand, 0, 0),
      shard(rand, 0, 0),
      spark(rand, 0, 0),
      smoke(rand, 0, 0),
      smoke(rand, 0, 0, 1),
      ember(rand, 0, 0),
      chip(rand, 0, 0),
    ]);
    for (const reduced of [false, true])
      drawFx(
        ctx,
        [
          muzzle(0, 0, 1, 30),
          tracer(0, 0, 50, 50),
          flash(5, 5, 20),
          ring(5, 5, 60),
          glow(5, 5, 20),
        ],
        reduced,
      );
    drawSweep(ctx, 100, 200);
    for (const tool of TOOL_IDS)
      for (const held of [false, true])
        drawCursor(ctx, { tool, x: 1, y: 2, held, kick: 1, clock: 0.5 });
    // Every save is balanced by a restore.
    expect(calls.filter((c) => c === 'save').length).toBe(
      calls.filter((c) => c === 'restore').length,
    );
  });
});

describe('new particles and effects', () => {
  it('sparks fall, smoke and embers rise, chips and burst glass fall', () => {
    const rand = mulberry32(5);
    const rising = [smoke(rand, 0, 0), ember(rand, 0, 0)];
    // Thrown straight up, so gravity shows despite a spark's air drag.
    const falling = [
      spark(rand, 0, 0, -Math.PI / 2, 0),
      chip(rand, 0, 0),
      glassBurst(rand, 0, 0),
    ];
    const v0 = falling.map((p) => p.vy);
    const list = [...rising, ...falling];
    stepParticles(list, 0.1, 1e6);
    falling.forEach((p, i) => expect(p.vy).toBeGreaterThan(v0[i] ?? 0));
    for (const p of rising) expect(p.vy).toBeLessThan(0);
    for (let i = 0; i < 300; i++) stepParticles(list, 0.01, 1e6);
    expect(list).toHaveLength(0);
  });

  it('sprayed sawdust flies along the angle it is thrown', () => {
    const rand = mulberry32(6);
    for (let i = 0; i < 20; i++) {
      expect(sawdustSpray(rand, 0, 0, Math.PI).vx).toBeLessThan(0);
    }
  });

  it('effects age out, and the list is capped', () => {
    const list = [flash(0, 0, 10, 0.1), glow(0, 0, 10, 1)];
    stepFx(list, 0.2);
    expect(list.map((f) => f.kind)).toEqual(['glow']);
    addFx(
      list,
      Array.from({ length: MAX_FX }, () => ring(0, 0, 5)),
    );
    expect(list).toHaveLength(MAX_FX);
    expect(list.some((f) => f.kind === 'glow')).toBe(false);
  });

  it('cuts carry torn fibres and hammer hits a crater around the impact', () => {
    const rand = mulberry32(2);
    const cut = sawCut(rand, { x: 0, y: 0 }, { x: 100, y: 0 });
    expect(cut.kind === 'cut' && cut.tears?.length).toBeGreaterThan(2);
    const hit = hammerHit(rand, 50, 50);
    if (hit.kind !== 'crack' || !hit.crater) throw new Error('no crater');
    for (const p of hit.crater) {
      const d = dist(p, { x: 50, y: 50 });
      expect(d).toBeGreaterThanOrEqual(9);
      expect(d).toBeLessThanOrEqual(17);
    }
  });
});

describe('tool poses', () => {
  it('the gun sits below-right of the pointer and its muzzle points at it', () => {
    const pose = gunPose(300, 200);
    expect(pose.x).toBeGreaterThan(300);
    expect(pose.y).toBeGreaterThan(200);
    const toPointer = Math.atan2(200 - pose.tip.y, 300 - pose.tip.x);
    expect(toPointer).toBeCloseTo(pose.angle, 6);
    // Aiming left: the model is mirrored so its magazine hangs down.
    expect(pose.flip).toBe(-1);
    // Recoil pulls the muzzle back towards the grip.
    const kicked = gunPose(300, 200, 1);
    expect(dist(kicked.tip, kicked)).toBeLessThan(dist(pose.tip, pose));
  });

  it('local points follow the pose and its mirroring', () => {
    const pose = flamePose(100, 100);
    expect(local(pose, 0, 0)).toEqual({ x: pose.x, y: pose.y });
    const ahead = local(pose, 70, 0);
    expect(ahead.x).toBeCloseTo(pose.tip.x);
    expect(ahead.y).toBeCloseTo(pose.tip.y);
    // "Down" on a mirrored model is still below the barrel on screen.
    expect(local(pose, 0, 10).y).toBeGreaterThan(pose.y);
    // The chainsaw's exhaust is up and to the right of its bar tip.
    const exhaust = sawExhaust(0, 0);
    expect(exhaust.x).toBeGreaterThan(40);
    expect(exhaust.y).toBeLessThan(0);
  });
});
