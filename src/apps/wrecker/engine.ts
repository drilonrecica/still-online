// Desktop Wrecker engine: the tool state machine. Pointer input and time go in; marks to paint,
// particles, light effects, sounds and shakes come out. Pure TS with a seeded Rand, so it runs
// in tests.
//
// Phases: idle ⇄ using (pointer held with a tool) → repairing (Repair's wipe) → idle.
// Click tools (Hammer, Stamp) act once on press; hold tools (Chainsaw, Flamethrower, Machine
// Gun) act on press and keep acting while held. Nothing happens while repairing.
import type { MessageKey } from '@/i18n/types';
import type { SoundName } from '@/os/sound';
import { mulberry32, type Rand } from '@/os/random';
import {
  bulletHole,
  hammerHit,
  sawCut,
  scorchPuff,
  spreadPoint,
  stampMark,
  type Mark,
  type Point,
} from './damage';
import {
  addFx,
  flash,
  glow,
  muzzle,
  ring,
  stepFx,
  tracer,
  type Fx,
} from './fx';
import {
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
  type Particle,
} from './particles';
import { flamePose, gunPose, local, sawExhaust } from './pose';

export const TOOL_IDS = [
  'hammer',
  'chainsaw',
  'flamethrower',
  'machinegun',
  'stamp',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export interface ToolInfo {
  labelKey: MessageKey;
  /** `click`: one hit per press. `hold`: keeps going while the pointer is down. */
  mode: 'click' | 'hold';
  hintKey: MessageKey;
}

export const TOOLS: Readonly<Record<ToolId, ToolInfo>> = {
  hammer: {
    labelKey: 'wrecker.tool.hammer.label',
    mode: 'click',
    hintKey: 'wrecker.tool.hammer.hint',
  },
  chainsaw: {
    labelKey: 'wrecker.tool.chainsaw.label',
    mode: 'hold',
    hintKey: 'wrecker.tool.chainsaw.hint',
  },
  flamethrower: {
    labelKey: 'wrecker.tool.flamethrower.label',
    mode: 'hold',
    hintKey: 'wrecker.tool.flamethrower.hint',
  },
  machinegun: {
    labelKey: 'wrecker.tool.machinegun.label',
    mode: 'hold',
    hintKey: 'wrecker.tool.machinegun.hint',
  },
  stamp: {
    labelKey: 'wrecker.tool.stamp.label',
    mode: 'click',
    hintKey: 'wrecker.tool.stamp.hint',
  },
};

export type Phase = 'idle' | 'using' | 'repairing';

/** Seconds between repeats of a held tool. */
export const RATE = {
  bullet: 0.075,
  scorch: 0.03,
  chainsawSound: 0.16,
  flameSound: 0.14,
} as const;

/** Seconds a hammer swing / stamp press / muzzle flash shows on the cursor. */
export const CURSOR_KICK = 0.14;

/** Every this many shots the machine gun jolts the screen a little. */
export const JOLT_EVERY = 4;

export interface Engine {
  rand: Rand;
  tool: ToolId;
  phase: Phase;
  /** Last pointer position, or null while the pointer is off the overlay. */
  pointer: Point | null;
  /** Viewport size in CSS px; casings bounce on the bottom edge. */
  w: number;
  h: number;
  particles: Particle[];
  /** Light effects (flashes, tracers, rings, cooling glow). */
  fx: Fx[];
  /** Reduced motion: half the particles and no jolts. Set by the loop. */
  reduced: boolean;
  shots: number;
  /** Countdown to the next repeat of the held tool, and of its looping sound. */
  next: number;
  nextSound: number;
  stamps: number;
  /** Seconds left of the cursor's hit animation. */
  kick: number;
  /** Repair wipe: seconds elapsed and total; the sweep is at `w * elapsed / duration`. */
  repair: { elapsed: number; duration: number } | null;
  // Pending output, collected by `drain`.
  marks: Mark[];
  sounds: SoundName[];
  shake: boolean;
  jolt: boolean;
  cleared: boolean;
}

export interface Output {
  marks: Mark[];
  sounds: SoundName[];
  /** A heavy hit: shake the screen. */
  shake: boolean;
  /** A light jolt (machine-gun bursts). */
  jolt: boolean;
  /** The damage canvas must be wiped (Repair finished). */
  cleared: boolean;
}

export function createEngine(seed: number, w: number, h: number): Engine {
  return {
    rand: mulberry32(seed),
    tool: 'hammer',
    phase: 'idle',
    pointer: null,
    w,
    h,
    particles: [],
    fx: [],
    reduced: false,
    shots: 0,
    next: 0,
    nextSound: 0,
    stamps: 0,
    kick: 0,
    repair: null,
    marks: [],
    sounds: [],
    shake: false,
    jolt: false,
    cleared: false,
  };
}

/** Adds particles; under reduced motion only every other one. */
function emit(e: Engine, added: Particle[]): void {
  addParticles(
    e.particles,
    e.reduced ? added.filter((_, i) => i % 2 === 0) : added,
  );
}

function times<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

export function resize(e: Engine, w: number, h: number): void {
  e.w = w;
  e.h = h;
}

/** Switching tools lets go of the current one. */
export function selectTool(e: Engine, tool: ToolId): void {
  e.tool = tool;
  if (e.phase === 'using') e.phase = 'idle';
}

export function pointerMove(e: Engine, x: number, y: number): void {
  const from = e.pointer;
  e.pointer = { x, y };
  if (e.phase !== 'using' || e.tool !== 'chainsaw' || !from) return;
  if (Math.hypot(x - from.x, y - from.y) < 2) {
    e.pointer = from;
    return;
  }
  const r = e.rand;
  e.marks.push(sawCut(r, from, { x, y }));
  const len = Math.hypot(x - from.x, y - from.y);
  // The chain flings sawdust and sparks out behind the cut, against the drag.
  const back = Math.atan2(from.y - y, from.x - x);
  const dust = Math.min(18, Math.ceil(len / 4));
  emit(e, [
    ...times(dust, () => sawdustSpray(r, x, y, back)),
    ...times(Math.min(6, Math.ceil(len / 12)), () => spark(r, x, y, back, 1.2)),
    ...(r() < 0.25 ? [smoke(r, x, y, 0.6)] : []),
  ]);
}

export function pointerDown(e: Engine, x: number, y: number): void {
  if (e.phase === 'repairing') return;
  e.pointer = { x, y };
  e.phase = 'using';
  e.next = 0;
  e.nextSound = 0;
  const r = e.rand;
  if (e.tool === 'hammer') {
    e.marks.push(hammerHit(r, x, y));
    e.sounds.push('hammer');
    e.shake = true;
    e.kick = CURSOR_KICK;
    addFx(e.fx, [flash(x, y, 46, 0.09), ring(x, y, 95, 0.35)]);
    emit(e, [
      ...times(14, () => glassBurst(r, x, y)),
      ...times(8, () => chip(r, x, y)),
      ...times(6, () => spark(r, x, y, -Math.PI / 2, Math.PI * 1.4)),
      ...times(5, () => smoke(r, x, y, 1)),
    ]);
  } else if (e.tool === 'stamp') {
    const m = stampMark(r, e.stamps++, x, y);
    e.marks.push(m);
    e.sounds.push('boing');
    e.kick = CURSOR_KICK;
    addFx(e.fx, [ring(x, y, 120, 0.3)]);
    emit(
      e,
      times(8, () => smoke(r, x + (r() - 0.5) * 160, y + (r() - 0.5) * 40, 1)),
    );
    if (m.kind === 'stamp' && m.stamp === 'boom') {
      addFx(e.fx, [flash(x, y, 90, 0.12)]);
      emit(
        e,
        times(12, () => spark(r, x, y)),
      );
    }
  } else {
    // Hold tools fire straight away, then repeat from `update`.
    holdTick(e, 0);
  }
}

export function pointerUp(e: Engine): void {
  if (e.phase === 'using') e.phase = 'idle';
}

/** The pointer left the overlay: hide the cursor (a held tool stays held under capture). */
export function pointerLeave(e: Engine): void {
  if (e.phase !== 'using') e.pointer = null;
}

/** Starts Repair's wipe; `duration` 0 (reduced motion) clears at once. */
export function startRepair(e: Engine, duration: number): void {
  if (e.phase === 'repairing') return;
  e.phase = 'repairing';
  e.sounds.push('sweep');
  e.repair = { elapsed: 0, duration };
  if (duration <= 0) finishRepair(e);
}

function finishRepair(e: Engine): void {
  e.repair = null;
  // Swept clean: only the glass shards knocked loose by the sweep keep flying.
  e.particles = e.particles.filter((p) => p.kind === 'shard');
  e.fx = [];
  e.phase = 'idle';
  e.cleared = true;
}

/** Where Repair's sweep line is (CSS px from the left), or null when not repairing. */
export function sweepX(e: Engine): number | null {
  if (!e.repair) return null;
  return (
    e.w * Math.min(1, e.repair.elapsed / Math.max(1e-6, e.repair.duration))
  );
}

/** Runs the held tool's repeats that are due within this `dt`. */
function holdTick(e: Engine, dt: number): void {
  const p = e.pointer;
  if (!p) return;
  e.next -= dt;
  e.nextSound -= dt;
  const r = e.rand;
  if (e.tool === 'chainsaw') {
    if (e.nextSound <= 0) {
      e.sounds.push('chainsaw');
      e.nextSound += RATE.chainsawSound;
      // Held still it still chews: dust and sparks at the tip, smoke from the exhaust.
      const exhaust = sawExhaust(p.x, p.y);
      emit(e, [
        sawdust(r, p.x, p.y),
        sawdust(r, p.x, p.y),
        spark(r, p.x, p.y),
        smoke(r, exhaust.x, exhaust.y, 0.2),
      ]);
    }
  } else if (e.tool === 'flamethrower') {
    const nozzle = flamePose(p.x, p.y).tip;
    while (e.next <= 0) {
      const puff = scorchPuff(r, p.x, p.y);
      e.marks.push(puff);
      // The stream: flames shot from the nozzle so that they reach the target and spill past.
      const flames = times(5, () => {
        const tx = p.x + (r() - 0.5) * 24;
        const ty = p.y + (r() - 0.5) * 24;
        const speed = 4.2 + r() * 1.6;
        return flame(
          r,
          nozzle.x,
          nozzle.y,
          (tx - nozzle.x) * speed,
          (ty - nozzle.y) * speed,
        );
      });
      emit(e, [
        ...flames,
        flame(r, p.x, p.y),
        ...(r() < 0.45 ? [ember(r, p.x, p.y)] : []),
        ...(r() < 0.2 ? [smoke(r, p.x, p.y - 10)] : []),
      ]);
      if (r() < 0.3 && puff.kind === 'scorch') {
        addFx(e.fx, [glow(puff.x, puff.y, puff.r * 0.75)]);
      }
      e.next += RATE.scorch;
    }
    if (e.nextSound <= 0) {
      e.sounds.push('flame');
      e.nextSound += RATE.flameSound;
    }
  } else if (e.tool === 'machinegun') {
    while (e.next <= 0) {
      const hit = spreadPoint(r, p.x, p.y);
      const pose = gunPose(p.x, p.y);
      const port = local(pose, 30, -10);
      e.marks.push(bulletHole(r, hit.x, hit.y));
      addFx(e.fx, [
        muzzle(pose.tip.x, pose.tip.y, pose.angle, 26 + r() * 16),
        tracer(pose.tip.x, pose.tip.y, hit.x, hit.y),
        flash(hit.x, hit.y, 14 + r() * 8, 0.06),
      ]);
      const bounce = Math.atan2(pose.y - hit.y, pose.x - hit.x);
      emit(e, [
        casing(r, port.x, port.y),
        ...times(6, () => spark(r, hit.x, hit.y, bounce, 2.2)),
        chip(r, hit.x, hit.y),
        ...(r() < 0.5 ? [smoke(r, hit.x, hit.y, 0.9)] : []),
        ...(r() < 0.3 ? [smoke(r, pose.tip.x, pose.tip.y, 0.3)] : []),
      ]);
      e.sounds.push('gunfire');
      e.kick = CURSOR_KICK / 2;
      e.shots++;
      if (e.shots % JOLT_EVERY === 0 && !e.reduced) e.jolt = true;
      e.next += RATE.bullet;
    }
  }
}

/** Advances time by `dt` seconds. */
export function update(e: Engine, dt: number): void {
  e.kick = Math.max(0, e.kick - dt);
  if (e.phase === 'using' && TOOLS[e.tool].mode === 'hold') holdTick(e, dt);
  if (e.repair) {
    e.repair.elapsed += dt;
    const x = sweepX(e) ?? 0;
    addParticles(
      e.particles,
      Array.from({ length: 3 }, () => shard(e.rand, x, e.rand() * e.h)),
    );
    if (e.repair.elapsed >= e.repair.duration) finishRepair(e);
  }
  stepParticles(e.particles, dt, e.h - 3);
  stepFx(e.fx, dt);
}

/** Takes the pending output; a frame plays each distinct sound once. */
export function drain(e: Engine): Output {
  const out: Output = {
    marks: e.marks,
    sounds: [...new Set(e.sounds)],
    shake: e.shake,
    jolt: e.jolt,
    cleared: e.cleared,
  };
  e.marks = [];
  e.sounds = [];
  e.shake = false;
  e.jolt = false;
  e.cleared = false;
  return out;
}
