// Pipes, the simulation: pipes grow cell by cell through a 3D grid, turn now and then, end when
// boxed in, and the whole thing starts over after MAX_PIPES. Pure: same state + rand → same result.
import type { Rand } from '@/os/random';

export type Cell = readonly [number, number, number];

export const GRID: Cell = [13, 9, 9];
export const MAX_PIPES = 40;
/** The longest a pipe gets before it ends on its own. */
export const MAX_LENGTH = 48;
/** Chance a pipe keeps going straight when it could. */
export const STRAIGHT_CHANCE = 0.72;
export const PIPE_COLORS = 7;

const DIRS: readonly Cell[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

export interface PipesState {
  /** One byte per grid cell; 1 = taken. */
  taken: Uint8Array;
  /** The growing pipe's end, or null between pipes. */
  head: Cell | null;
  /** Index into the six directions. */
  dir: number;
  color: number;
  length: number;
  /** Pipes started since the last reset. */
  pipes: number;
}

/** What a step adds to the picture. */
export type PipeOp =
  | { kind: 'reset' }
  | { kind: 'joint'; at: Cell; color: number }
  | { kind: 'segment'; from: Cell; to: Cell; color: number };

export function initialPipes(): PipesState {
  return {
    taken: new Uint8Array(GRID[0] * GRID[1] * GRID[2]),
    head: null,
    dir: 0,
    color: 0,
    length: 0,
    pipes: 0,
  };
}

function index([x, y, z]: Cell): number {
  return (z * GRID[1] + y) * GRID[0] + x;
}

function inside([x, y, z]: Cell): boolean {
  return (
    x >= 0 && y >= 0 && z >= 0 && x < GRID[0] && y < GRID[1] && z < GRID[2]
  );
}

function add(a: Cell, d: Cell): Cell {
  return [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
}

function cellAt(i: number): Cell {
  const x = i % GRID[0];
  const y = Math.floor(i / GRID[0]) % GRID[1];
  const z = Math.floor(i / (GRID[0] * GRID[1]));
  return [x, y, z];
}

/** A free cell picked at random, or null when the grid is full. */
function freeCell(taken: Uint8Array, rand: Rand): Cell | null {
  const start = Math.floor(rand() * taken.length);
  for (let k = 0; k < taken.length; k++) {
    const i = (start + k) % taken.length;
    if (!taken[i]) return cellAt(i);
  }
  return null;
}

/** One growth step. Never mutates `state`. */
export function stepPipes(
  state: PipesState,
  rand: Rand,
): { state: PipesState; ops: PipeOp[] } {
  const { head } = state;

  if (!head) {
    const start = state.pipes < MAX_PIPES ? freeCell(state.taken, rand) : null;
    if (!start) return { state: initialPipes(), ops: [{ kind: 'reset' }] };
    const taken = state.taken.slice();
    taken[index(start)] = 1;
    const color = Math.floor(rand() * PIPE_COLORS);
    return {
      state: {
        taken,
        head: start,
        dir: Math.floor(rand() * DIRS.length),
        color,
        length: 0,
        pipes: state.pipes + 1,
      },
      ops: [{ kind: 'joint', at: start, color }],
    };
  }

  const open = DIRS.flatMap((d, i) => {
    const next = add(head, d);
    return inside(next) && !state.taken[index(next)] ? [i] : [];
  });
  const end = (): { state: PipesState; ops: PipeOp[] } => ({
    state: { ...state, head: null },
    ops: [{ kind: 'joint', at: head, color: state.color }],
  });
  if (open.length === 0 || state.length >= MAX_LENGTH) return end();

  const straight = open.includes(state.dir) && rand() < STRAIGHT_CHANCE;
  const dir = straight
    ? state.dir
    : (open[Math.floor(rand() * open.length)] ?? state.dir);
  const next = add(head, DIRS[dir] ?? [1, 0, 0]);
  const taken = state.taken.slice();
  taken[index(next)] = 1;
  const ops: PipeOp[] = [];
  // A ball joint where the pipe bends (or carries on after the first cell).
  if (dir !== state.dir && state.length > 0)
    ops.push({ kind: 'joint', at: head, color: state.color });
  ops.push({ kind: 'segment', from: head, to: next, color: state.color });
  return {
    state: { ...state, taken, head: next, dir, length: state.length + 1 },
    ops,
  };
}
