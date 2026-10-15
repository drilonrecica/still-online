import { describe, expect, it } from 'vitest';
import { dragTo, grab, release } from './drag';
import {
  baa,
  rest,
  SLEEP_AFTER_MS,
  spawn,
  tick,
  TICK_MS,
  WALK_SPEED,
  type PetState,
  type PetWorld,
} from './machine';
import { computeSurfaces, type Surface } from './surfaces';

/** Middle of every range, never a random turn (TURN_CHANCE is far below 0.5). */
const mid = () => 0.5;
const always = (v: number) => () => v;

function worldWith(
  windows: Parameters<typeof computeSurfaces>[0]['windows'] = [],
): PetWorld {
  const viewport = { w: 1000, h: 700 };
  return {
    surfaces: computeSurfaces({ windows, viewport, taskbarHeight: 30 }),
    width: viewport.w,
    height: viewport.h,
  };
}

const win = (id: string, x: number, y: number, w = 200, z = 1) => ({
  id,
  x,
  y,
  w,
  h: 150,
  z,
  minimized: false,
  maximized: false,
});

function run(
  state: PetState,
  world: PetWorld,
  ms: number,
  rng = mid,
): PetState {
  let s = state;
  for (let t = 0; t < ms; t += TICK_MS) s = tick(s, world, TICK_MS, rng);
  return s;
}

/** Ticks until `done`, failing after `maxMs`. */
function runUntil(
  state: PetState,
  world: PetWorld,
  done: (s: PetState) => boolean,
  maxMs = 20_000,
  rng = mid,
): PetState {
  let s = state;
  for (let t = 0; t < maxMs && !done(s); t += TICK_MS) {
    s = tick(s, world, TICK_MS, rng);
  }
  expect(done(s)).toBe(true);
  return s;
}

/** Fluff standing on `surface` at x, walking `dir`. */
function standing(surface: Surface, x: number, dir: 1 | -1 = 1): PetState {
  return {
    ...spawn({ surfaces: [surface], width: 1000, height: 700 }, mid),
    mode: 'walk',
    x,
    y: surface.y,
    dir,
    anchor: { owner: surface.owner, ox: surface.ox, oy: surface.oy },
    modeMs: 0,
    modeLimit: 60_000,
  };
}

describe('pet state machine', () => {
  it('spawns falling from the top and lands on the taskbar', () => {
    const world = worldWith();
    const pet = spawn(world, mid);
    expect(pet.mode).toBe('fall');
    const landed = runUntil(pet, world, (s) => s.mode !== 'fall', 3000);
    expect(landed.mode).toBe('walk');
    expect(landed.y).toBe(670);
    expect(landed.anchor?.owner).toBe('taskbar');
  });

  it('walks at 30 px/s along its surface', () => {
    const world = worldWith();
    const start = standing(world.surfaces[0]!, 500, 1);
    const after = run(start, world, 1000);
    expect(after.x).toBeCloseTo(500 + WALK_SPEED, 5);
    expect(after.y).toBe(670);
  });

  it('turns around at the screen edges', () => {
    const world = worldWith();
    const after = run(standing(world.surfaces[0]!, 985, 1), world, 1000);
    expect(after.dir).toBe(-1);
    expect(after.x).toBeLessThanOrEqual(980);
  });

  it('walk → edge → fall → land on the next surface below', () => {
    const world = worldWith([
      win('top', 300, 100, 200, 2),
      win('below', 450, 300, 300, 1),
    ]);
    const top = world.surfaces.find((s) => s.owner === 'top')!;
    let pet = standing(top, 490, 1);
    pet = runUntil(pet, world, (s) => s.mode === 'fall', 2000);
    expect(pet.x).toBeGreaterThan(500);
    expect(pet.vx).toBeGreaterThan(0);
    pet = runUntil(pet, world, (s) => s.mode !== 'fall', 3000);
    expect(pet.mode).toBe('walk');
    expect(pet.anchor?.owner).toBe('below');
    expect(pet.y).toBe(300);
  });

  it('falls to the taskbar when nothing is below', () => {
    const world = worldWith([win('w', 100, 100)]);
    const w = world.surfaces.find((s) => s.owner === 'w')!;
    let pet = run(standing(w, 299, 1), world, 200);
    expect(pet.mode).toBe('fall');
    pet = runUntil(pet, world, (s) => s.mode !== 'fall', 3000);
    expect(pet.anchor?.owner).toBe('taskbar');
  });

  it('moves with the window it stands on and falls when it goes away', () => {
    let world = worldWith([win('w', 100, 100)]);
    const pet = { ...standing(world.surfaces[1]!, 200), mode: 'sit' as const };
    world = worldWith([win('w', 160, 140)]);
    const moved = tick(pet, world, TICK_MS, mid);
    expect([moved.x, moved.y, moved.mode]).toEqual([260, 140, 'sit']);
    const gone = tick(moved, worldWith(), TICK_MS, mid);
    expect(gone.mode).toBe('fall');
  });

  it('dozes off after 30 s of sitting still', () => {
    const world = worldWith();
    // rng 0.99: a long sit (up to 40 s), so the sleep timer wins.
    const sitting = {
      ...standing(world.surfaces[0]!, 500),
      mode: 'sit' as const,
    };
    const s = { ...sitting, modeLimit: 39_600 };
    const before = run(s, world, SLEEP_AFTER_MS - TICK_MS, always(0.99));
    expect(before.mode).toBe('sit');
    const after = run(before, world, TICK_MS * 2, always(0.99));
    expect(after.mode).toBe('sleep');
  });

  it('a short sit gets up and walks again', () => {
    const world = worldWith();
    const s = {
      ...standing(world.surfaces[0]!, 500),
      mode: 'sit' as const,
      modeLimit: 2000,
    };
    expect(run(s, world, 2100).mode).toBe('walk');
  });

  it('bleats on a click and goes back to what it was doing', () => {
    const world = worldWith();
    const grazing = {
      ...standing(world.surfaces[0]!, 500),
      mode: 'graze' as const,
    };
    const bleat = baa(grazing, mid);
    expect(bleat.mode).toBe('baa');
    expect(run(bleat, world, 1000).mode).toBe('graze');
    // A sleeping sheep wakes up and walks.
    const sleepy = baa({ ...grazing, mode: 'sleep' }, mid);
    expect(run(sleepy, world, 1000).mode).toBe('walk');
  });

  it('grab without moving is a click', () => {
    const world = worldWith();
    const pet = standing(world.surfaces[0]!, 500);
    const held = grab(pet, 505, 660, 0);
    expect(held.mode).toBe('drag');
    const after = release(dragTo(held, 506, 661, 30, world), 60, mid);
    expect(after.mode).toBe('baa');
    expect(after.anchor?.owner).toBe('taskbar');
  });

  it('drag follows the pointer and a release throws Fluff in an arc', () => {
    const world = worldWith();
    let pet = grab(standing(world.surfaces[0]!, 500), 500, 660, 0);
    pet = dragTo(pet, 520, 560, 50, world);
    pet = dragTo(pet, 560, 460, 100, world);
    expect([pet.x, pet.y]).toEqual([560, 470]);
    pet = release(pet, 120, mid);
    expect(pet.mode).toBe('fall');
    expect(pet.vx).toBeGreaterThan(0);
    expect(pet.vy).toBeLessThan(0);
    // Up first, then down, landing to the right of the release point.
    const up = tick(pet, world, TICK_MS, mid);
    expect(up.y).toBeLessThan(470);
    const landed = runUntil(up, world, (s) => s.mode !== 'fall', 5000);
    expect(landed.anchor?.owner).toBe('taskbar');
    expect(landed.x).toBeGreaterThan(560);
  });

  it('a slow release just drops', () => {
    const world = worldWith();
    let pet = grab(standing(world.surfaces[0]!, 500), 500, 660, 0);
    pet = dragTo(pet, 600, 400, 50, world);
    pet = release(pet, 2000, mid);
    expect([pet.mode, pet.vx, pet.vy]).toEqual(['fall', 0, 0]);
  });

  it('rests on the taskbar for reduced motion, and can still bleat', () => {
    const world = worldWith();
    const pet = rest(null, world, 0);
    expect([pet.mode, pet.y, pet.anchor?.owner]).toEqual([
      'sit',
      670,
      'taskbar',
    ]);
    const bleat = baa(pet, mid);
    expect(rest(bleat, world, 500).mode).toBe('baa');
    const done = rest(rest(bleat, world, 500), world, 500);
    expect([done.mode, done.x, done.t]).toEqual(['sit', pet.x, 1000]);
  });
});
