// Desktop Wrecker engine: the tool state machine. Pointer input and time go in; marks to paint,
// particles, sounds and shakes come out. Pure TS with a seeded Rand, so it runs in tests.
//
// Phases: idle ⇄ using (pointer held with a tool) → repairing (Repair's wipe) → idle.
// Click tools (Hammer, Stamp) act once on press; hold tools (Chainsaw, Flamethrower, Machine
// Gun) act on press and keep acting while held. Nothing happens while repairing.
import type { MessageKey } from '@/i18n/types';
import type { SoundName } from '@/os/sound';
import { mulberry32, type Rand } from '@/os/random';
import {
  bulletHole,
  crackPattern,
  jaggedCut,
  scorchPuff,
  spreadPoint,
  stampMark,
  type Mark,
  type Point,
} from './damage';
import {
  addParticles,
  casing,
  flame,
  sawdust,
  shard,
  stepParticles,
  type Particle,
} from './particles';

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
  cleared: boolean;
}

export interface Output {
  marks: Mark[];
  sounds: SoundName[];
  shake: boolean;
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
    next: 0,
    nextSound: 0,
    stamps: 0,
    kick: 0,
    repair: null,
    marks: [],
    sounds: [],
    shake: false,
    cleared: false,
  };
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
  e.marks.push({ kind: 'cut', points: jaggedCut(e.rand, from, { x, y }) });
  const dust = Math.min(12, Math.ceil(Math.hypot(x - from.x, y - from.y) / 6));
  addParticles(
    e.particles,
    Array.from({ length: dust }, () => sawdust(e.rand, x, y)),
  );
}

export function pointerDown(e: Engine, x: number, y: number): void {
  if (e.phase === 'repairing') return;
  e.pointer = { x, y };
  e.phase = 'using';
  e.next = 0;
  e.nextSound = 0;
  if (e.tool === 'hammer') {
    e.marks.push({ kind: 'crack', x, y, lines: crackPattern(e.rand, x, y) });
    e.sounds.push('hammer');
    e.shake = true;
    e.kick = CURSOR_KICK;
  } else if (e.tool === 'stamp') {
    e.marks.push(stampMark(e.rand, e.stamps++, x, y));
    e.sounds.push('boing');
    e.kick = CURSOR_KICK;
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
      // A little dust even when the saw is held still.
      addParticles(e.particles, [sawdust(r, p.x, p.y), sawdust(r, p.x, p.y)]);
    }
  } else if (e.tool === 'flamethrower') {
    while (e.next <= 0) {
      e.marks.push(scorchPuff(r, p.x, p.y));
      addParticles(e.particles, [
        flame(r, p.x, p.y),
        flame(r, p.x, p.y),
        flame(r, p.x, p.y),
      ]);
      e.next += RATE.scorch;
    }
    if (e.nextSound <= 0) {
      e.sounds.push('flame');
      e.nextSound += RATE.flameSound;
    }
  } else if (e.tool === 'machinegun') {
    while (e.next <= 0) {
      const hit = spreadPoint(r, p.x, p.y);
      e.marks.push(bulletHole(r, hit.x, hit.y));
      addParticles(e.particles, [casing(r, p.x, p.y)]);
      e.sounds.push('gunfire');
      e.kick = CURSOR_KICK / 2;
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
}

/** Takes the pending output; a frame plays each distinct sound once. */
export function drain(e: Engine): Output {
  const out: Output = {
    marks: e.marks,
    sounds: [...new Set(e.sounds)],
    shake: e.shake,
    cleared: e.cleared,
  };
  e.marks = [];
  e.sounds = [];
  e.shake = false;
  e.cleared = false;
  return out;
}
