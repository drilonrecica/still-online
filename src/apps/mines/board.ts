// Mines board logic: pure and immutable. Mines are placed on the first reveal, so that click is
// always safe, using a seeded RNG so a game replays identically.
import { mulberry32, type Rand } from '@/os/random';

export type Mark = 'none' | 'flag' | 'question';
export type Status = 'ready' | 'playing' | 'won' | 'lost';

export interface Cell {
  mine: boolean;
  revealed: boolean;
  mark: Mark;
  /** Mines among the eight neighbours. Valid once mines are placed. */
  adjacent: number;
  /** The mine that was stepped on. */
  exploded: boolean;
}

export interface Board {
  width: number;
  height: number;
  mines: number;
  seed: number;
  status: Status;
  cells: readonly Cell[];
}

export const LEVELS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
} as const;

export const CUSTOM_LIMITS = {
  minWidth: 9,
  maxWidth: 30,
  minHeight: 9,
  maxHeight: 24,
  minMines: 10,
} as const;

export interface Config {
  width: number;
  height: number;
  mines: number;
}

const clampInt = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)));

/** A playable size and mine count: 9–30 wide, 9–24 high, 10 to (w−1)(h−1) mines. */
export function clampConfig(c: Config): Config {
  const width = clampInt(
    c.width,
    CUSTOM_LIMITS.minWidth,
    CUSTOM_LIMITS.maxWidth,
  );
  const height = clampInt(
    c.height,
    CUSTOM_LIMITS.minHeight,
    CUSTOM_LIMITS.maxHeight,
  );
  const mines = clampInt(
    c.mines,
    CUSTOM_LIMITS.minMines,
    (width - 1) * (height - 1),
  );
  return { width, height, mines };
}

const EMPTY: Cell = {
  mine: false,
  revealed: false,
  mark: 'none',
  adjacent: 0,
  exploded: false,
};

export function createBoard(config: Config, seed: number): Board {
  const { width, height, mines } = clampConfig(config);
  return {
    width,
    height,
    mines,
    seed,
    status: 'ready',
    cells: Array.from({ length: width * height }, () => EMPTY),
  };
}

export const indexOf = (b: Board, x: number, y: number) => y * b.width + x;

function neighbours(b: Board, i: number): number[] {
  const x = i % b.width;
  const y = Math.floor(i / b.width);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < b.width && ny < b.height) {
        out.push(ny * b.width + nx);
      }
    }
  }
  return out;
}

/**
 * Places the mines away from `safe` and its neighbours (just `safe` when the board is too
 * crowded for that), so the first click opens an area whenever it can.
 */
function placeMines(b: Board, safe: number): Cell[] {
  const rand: Rand = mulberry32(b.seed);
  const total = b.cells.length;
  const exclude = new Set([safe, ...neighbours(b, safe)]);
  if (total - exclude.size < b.mines) {
    exclude.clear();
    exclude.add(safe);
  }
  const candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!exclude.has(i)) candidates.push(i);
  // Partial Fisher–Yates: the first `mines` entries are the mine cells.
  for (let i = 0; i < b.mines; i++) {
    const j = i + Math.floor(rand() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  const isMine = new Set(candidates.slice(0, b.mines));
  const cells = b.cells.map((c, i) => ({ ...c, mine: isMine.has(i) }));
  return cells.map((c, i) => ({
    ...c,
    adjacent: neighbours(b, i).filter((n) => cells[n]!.mine).length,
  }));
}

/** Reveals `start` and flood-fills through zero cells. Mutates `cells` (a private copy). */
function flood(b: Board, cells: Cell[], start: number): void {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const c = cells[i]!;
    if (c.revealed || c.mark === 'flag') continue;
    cells[i] = { ...c, revealed: true, mark: 'none' };
    if (c.adjacent === 0 && !c.mine) stack.push(...neighbours(b, i));
  }
}

function settle(b: Board, cells: Cell[], hit: number | null): Board {
  if (hit !== null) {
    // Lost: show every mine; wrong flags keep their flag so the UI can cross them out.
    return {
      ...b,
      status: 'lost',
      cells: cells.map((c, i) =>
        i === hit
          ? { ...c, revealed: true, exploded: true }
          : c.mine && c.mark !== 'flag'
            ? { ...c, revealed: true }
            : c,
      ),
    };
  }
  const won = cells.every((c) => c.mine || c.revealed);
  if (!won) return { ...b, status: 'playing', cells };
  return {
    ...b,
    status: 'won',
    cells: cells.map((c) => (c.mine ? { ...c, mark: 'flag' as const } : c)),
  };
}

function open(b: Board, cells: Cell[], targets: number[]): Board {
  let hit: number | null = null;
  for (const i of targets) {
    const c = cells[i]!;
    if (c.revealed || c.mark === 'flag') continue;
    if (c.mine) {
      hit ??= i;
      continue;
    }
    flood(b, cells, i);
  }
  return settle(b, cells, hit);
}

const finished = (b: Board) => b.status === 'won' || b.status === 'lost';

/** Left-click. Flagged and revealed cells are ignored; the first reveal places the mines. */
export function reveal(board: Board, i: number): Board {
  const c = board.cells[i];
  if (!c || finished(board) || c.revealed || c.mark === 'flag') return board;
  const cells =
    board.status === 'ready' ? placeMines(board, i) : [...board.cells];
  return open(board, cells, [i]);
}

/** Right-click: none → flag → ? → none. */
export function cycleMark(board: Board, i: number): Board {
  const c = board.cells[i];
  if (!c || finished(board) || c.revealed) return board;
  const next: Mark =
    c.mark === 'none' ? 'flag' : c.mark === 'flag' ? 'question' : 'none';
  const cells = [...board.cells];
  cells[i] = { ...c, mark: next };
  return { ...board, cells };
}

/** Touch flagging (flag mode, long-press): a hidden cell's flag on or off, skipping "?". */
export function toggleFlag(board: Board, i: number): Board {
  const c = board.cells[i];
  if (!c || finished(board) || c.revealed) return board;
  const cells = [...board.cells];
  cells[i] = { ...c, mark: c.mark === 'flag' ? 'none' : 'flag' };
  return { ...board, cells };
}

/**
 * Chord on a revealed number: when the flags around it match the number, reveals the other
 * neighbours (a wrong flag means this can hit a mine). Otherwise nothing happens.
 */
export function chord(board: Board, i: number): Board {
  const c = board.cells[i];
  if (!c || finished(board) || !c.revealed || c.adjacent === 0) return board;
  const around = neighbours(board, i);
  const flags = around.filter((n) => board.cells[n]!.mark === 'flag').length;
  if (flags !== c.adjacent) return board;
  return open(board, [...board.cells], around);
}

export function flagCount(board: Board): number {
  return board.cells.filter((c) => c.mark === 'flag').length;
}

/** The counter value: mines minus flags, never below −99. */
export function minesLeft(board: Board): number {
  return Math.max(-99, board.mines - flagCount(board));
}

/** A flag on a cell that isn't a mine, shown crossed out after a loss. */
export function isWrongFlag(board: Board, i: number): boolean {
  const c = board.cells[i]!;
  return board.status === 'lost' && c.mark === 'flag' && !c.mine;
}
