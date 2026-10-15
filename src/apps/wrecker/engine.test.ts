import { describe, expect, it } from 'vitest';
import {
  RATE,
  createEngine,
  drain,
  pointerDown,
  pointerLeave,
  pointerMove,
  pointerUp,
  selectTool,
  startRepair,
  sweepX,
  update,
  type ToolId,
} from './engine';

function engine(tool: ToolId = 'hammer') {
  const e = createEngine(42, 800, 600);
  selectTool(e, tool);
  return e;
}

const kinds = (e: ReturnType<typeof engine>) =>
  drain(e).marks.map((m) => m.kind);

describe('wrecker tool state machine', () => {
  it('starts idle with the hammer', () => {
    const e = createEngine(1, 800, 600);
    expect(e.tool).toBe('hammer');
    expect(e.phase).toBe('idle');
  });

  it('goes idle → using → idle on press and release', () => {
    const e = engine('chainsaw');
    pointerDown(e, 10, 10);
    expect(e.phase).toBe('using');
    pointerUp(e);
    expect(e.phase).toBe('idle');
  });

  it('switching tools lets go of the held one', () => {
    const e = engine('machinegun');
    pointerDown(e, 10, 10);
    selectTool(e, 'stamp');
    expect(e.phase).toBe('idle');
    drain(e);
    update(e, 0.5);
    expect(drain(e).marks).toHaveLength(0);
  });

  it('hammer: one crack, a thud and a shake per click', () => {
    const e = engine('hammer');
    pointerDown(e, 100, 100);
    const out = drain(e);
    expect(out.marks.map((m) => m.kind)).toEqual(['crack']);
    expect(out.sounds).toEqual(['hammer']);
    expect(out.shake).toBe(true);
    update(e, 1);
    expect(drain(e).marks).toHaveLength(0);
  });

  it('stamp: alternates tread and BOOM! with a boing', () => {
    const e = engine('stamp');
    const stamps: string[] = [];
    for (let i = 0; i < 3; i++) {
      pointerDown(e, 50, 50);
      pointerUp(e);
      const out = drain(e);
      expect(out.sounds).toEqual(['boing']);
      for (const m of out.marks) if (m.kind === 'stamp') stamps.push(m.stamp);
    }
    expect(stamps).toEqual(['tread', 'boom', 'tread']);
  });

  it('chainsaw: cuts along the drag, buzzes while held, throws sawdust', () => {
    const e = engine('chainsaw');
    pointerMove(e, 0, 0);
    expect(kinds(e)).toEqual([]);
    pointerDown(e, 0, 0);
    expect(drain(e).sounds).toEqual(['chainsaw']);
    pointerMove(e, 40, 0);
    pointerMove(e, 40, 1); // under 2 px: ignored
    pointerMove(e, 80, 30);
    expect(kinds(e)).toEqual(['cut', 'cut']);
    expect(e.particles.some((p) => p.kind === 'sawdust')).toBe(true);
    update(e, RATE.chainsawSound);
    expect(drain(e).sounds).toEqual(['chainsaw']);
    pointerUp(e);
    pointerMove(e, 200, 200);
    update(e, 1);
    const out = drain(e);
    expect(out.marks).toHaveLength(0);
    expect(out.sounds).toHaveLength(0);
  });

  it('flamethrower: scorch accumulates while held, with flames and crackle', () => {
    const e = engine('flamethrower');
    pointerDown(e, 300, 300);
    update(e, 0.3);
    const out = drain(e);
    // One on press, then one per RATE.scorch.
    expect(out.marks.length).toBe(1 + Math.floor(0.3 / RATE.scorch));
    expect(out.marks.every((m) => m.kind === 'scorch')).toBe(true);
    expect(out.sounds).toEqual(['flame']);
    expect(e.particles.some((p) => p.kind === 'flame')).toBe(true);
  });

  it('machine gun: a bullet hole, a casing and a shot every RATE.bullet', () => {
    const e = engine('machinegun');
    pointerDown(e, 400, 300);
    update(e, RATE.bullet * 4 + 0.001);
    const out = drain(e);
    expect(out.marks).toHaveLength(5);
    expect(out.marks.every((m) => m.kind === 'hole')).toBe(true);
    expect(out.sounds).toEqual(['gunfire']);
    expect(e.particles.filter((p) => p.kind === 'casing')).toHaveLength(5);
  });

  it('casings end up on the bottom edge of the screen', () => {
    const e = engine('machinegun');
    pointerDown(e, 400, 300);
    pointerUp(e);
    for (let i = 0; i < 120; i++) update(e, 1 / 60);
    const c = e.particles.find((p) => p.kind === 'casing');
    expect(c?.y).toBeCloseTo(600 - 3, 5);
  });

  it('repair: sweeps left to right, ignores tools meanwhile, then clears', () => {
    const e = engine('machinegun');
    pointerDown(e, 10, 10);
    pointerUp(e);
    drain(e);
    expect(e.particles.some((p) => p.kind === 'casing')).toBe(true);
    startRepair(e, 1);
    expect(e.phase).toBe('repairing');
    expect(drain(e).sounds).toEqual(['sweep']);
    update(e, 0.5);
    expect(sweepX(e)).toBeCloseTo(400);
    pointerDown(e, 50, 50);
    expect(e.phase).toBe('repairing');
    expect(drain(e).marks).toHaveLength(0);
    update(e, 0.6);
    const out = drain(e);
    expect(out.cleared).toBe(true);
    expect(e.particles.every((p) => p.kind === 'shard')).toBe(true);
    expect(e.phase).toBe('idle');
    expect(sweepX(e)).toBeNull();
    expect(drain(e).cleared).toBe(false);
  });

  it('repair with no duration (reduced motion) clears at once', () => {
    const e = engine();
    startRepair(e, 0);
    expect(e.phase).toBe('idle');
    expect(drain(e).cleared).toBe(true);
  });

  it('hides the cursor when the pointer leaves, unless a tool is held', () => {
    const e = engine('flamethrower');
    pointerMove(e, 5, 5);
    pointerLeave(e);
    expect(e.pointer).toBeNull();
    pointerDown(e, 5, 5);
    pointerLeave(e);
    expect(e.pointer).not.toBeNull();
  });

  it('is deterministic for a seed', () => {
    const run = () => {
      const e = engine('machinegun');
      pointerDown(e, 100, 100);
      update(e, 0.4);
      return drain(e).marks;
    };
    expect(run()).toEqual(run());
  });
});
