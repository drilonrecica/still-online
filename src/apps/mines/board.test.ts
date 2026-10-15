import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  chord,
  clampConfig,
  createBoard,
  cycleMark,
  flagCount,
  indexOf,
  isWrongFlag,
  minesLeft,
  reveal,
  type Board,
} from './board';

const small = { width: 9, height: 9, mines: 10 };

function mineIndexes(b: Board): number[] {
  return b.cells.flatMap((c, i) => (c.mine ? [i] : []));
}

/** A started board whose mines sit exactly at `mines` (all else hidden). */
function fixed(width: number, height: number, mines: number[]): Board {
  const b = createBoard({ width, height, mines: 10 }, 1);
  const set = new Set(mines);
  const cells = b.cells.map((c, i) => ({ ...c, mine: set.has(i) }));
  const withCounts = cells.map((c, i) => {
    const x = i % width;
    const y = Math.floor(i / width);
    let adjacent = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          (dx || dy) &&
          nx >= 0 &&
          ny >= 0 &&
          nx < width &&
          ny < height &&
          set.has(ny * width + nx)
        ) {
          adjacent++;
        }
      }
    }
    return { ...c, adjacent };
  });
  return { ...b, status: 'playing', cells: withCounts };
}

describe('createBoard', () => {
  it('builds a hidden, mine-free board that is ready', () => {
    const b = createBoard(LEVELS.expert, 7);
    expect(b.cells).toHaveLength(480);
    expect(b.status).toBe('ready');
    expect(mineIndexes(b)).toEqual([]);
  });

  it('clamps custom sizes and mine counts', () => {
    expect(clampConfig({ width: 2, height: 99, mines: 9999 })).toEqual({
      width: 9,
      height: 24,
      mines: 8 * 23,
    });
    expect(clampConfig({ width: 10, height: 10, mines: 1 }).mines).toBe(10);
  });
});

describe('first click', () => {
  it('is always safe and opens an area, for any seed', () => {
    for (let seed = 0; seed < 60; seed++) {
      for (const i of [0, 40, 80, 4]) {
        const b = reveal(createBoard(small, seed), i);
        expect(b.cells[i]!.mine).toBe(false);
        expect(b.cells[i]!.adjacent).toBe(0);
        expect(b.status === 'playing' || b.status === 'won').toBe(true);
        expect(mineIndexes(b)).toHaveLength(10);
        expect(b.cells.filter((c) => c.revealed).length).toBeGreaterThan(1);
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = mineIndexes(reveal(createBoard(small, 42), 10));
    const b = mineIndexes(reveal(createBoard(small, 42), 10));
    expect(a).toEqual(b);
  });

  it('still protects the clicked cell on a crowded board', () => {
    const crowded = { width: 9, height: 9, mines: 64 };
    for (let seed = 0; seed < 20; seed++) {
      const b = reveal(createBoard(crowded, seed), 40);
      expect(b.cells[40]!.mine).toBe(false);
      expect(mineIndexes(b)).toHaveLength(64);
    }
  });
});

describe('reveal', () => {
  it('floods through zeros and stops at numbers', () => {
    // One mine in the corner: the opposite corner floods everything but the mine.
    const b = fixed(9, 9, [0]);
    const after = reveal(b, 80);
    expect(after.cells.filter((c) => c.revealed)).toHaveLength(80);
    expect(after.cells[0]!.revealed).toBe(false);
    expect(after.cells[1]!.adjacent).toBe(1);
    expect(after.cells[1]!.revealed).toBe(true);
  });

  it('reveals a single numbered cell without flooding', () => {
    const b = reveal(fixed(9, 9, [0]), 1);
    expect(b.cells.filter((c) => c.revealed)).toHaveLength(1);
  });

  it('ignores flagged and already revealed cells', () => {
    const flagged = cycleMark(fixed(9, 9, [0]), 5);
    expect(reveal(flagged, 5)).toBe(flagged);
    const once = reveal(flagged, 1);
    expect(reveal(once, 1)).toBe(once);
  });

  it('flood skips flagged cells', () => {
    const b = cycleMark(fixed(9, 9, [0]), 40);
    const after = reveal(b, 80);
    expect(after.cells[40]!.revealed).toBe(false);
    expect(after.cells[40]!.mark).toBe('flag');
  });
});

describe('win and lose', () => {
  it('wins when every safe cell is revealed, flagging the mines', () => {
    const after = reveal(fixed(9, 9, [0]), 80);
    expect(after.status).toBe('won');
    expect(after.cells[0]!.mark).toBe('flag');
    expect(minesLeft(after)).toBe(9);
  });

  it('loses on a mine: reveals all mines and marks wrong flags', () => {
    let b = fixed(9, 9, [0, 80]);
    b = cycleMark(b, 40); // wrong flag
    b = cycleMark(b, 80); // right flag
    const lost = reveal(b, 0);
    expect(lost.status).toBe('lost');
    expect(lost.cells[0]).toMatchObject({ revealed: true, exploded: true });
    expect(lost.cells[80]!.revealed).toBe(false); // correctly flagged mine stays flagged
    expect(lost.cells[80]!.mark).toBe('flag');
    expect(isWrongFlag(lost, 40)).toBe(true);
    expect(isWrongFlag(lost, 80)).toBe(false);
  });

  it('shows unflagged mines on a loss', () => {
    const lost = reveal(fixed(9, 9, [0, 80]), 0);
    expect(lost.cells[80]!.revealed).toBe(true);
    expect(lost.cells[80]!.exploded).toBe(false);
  });

  it('accepts no input after the game ends', () => {
    const lost = reveal(fixed(9, 9, [0, 80]), 0);
    expect(reveal(lost, 5)).toBe(lost);
    expect(cycleMark(lost, 5)).toBe(lost);
    const won = reveal(fixed(9, 9, [0]), 80);
    expect(cycleMark(won, 5)).toBe(won);
  });
});

describe('marks', () => {
  it('cycles flag → ? → none and counts flags', () => {
    let b = fixed(9, 9, [0]);
    b = cycleMark(b, 3);
    expect(b.cells[3]!.mark).toBe('flag');
    expect(flagCount(b)).toBe(1);
    expect(minesLeft(b)).toBe(9);
    b = cycleMark(b, 3);
    expect(b.cells[3]!.mark).toBe('question');
    expect(minesLeft(b)).toBe(10);
    b = cycleMark(b, 3);
    expect(b.cells[3]!.mark).toBe('none');
  });

  it('cannot mark a revealed cell', () => {
    const b = reveal(fixed(9, 9, [0]), 1);
    expect(cycleMark(b, 1)).toBe(b);
  });

  it('lets a ? cell be revealed', () => {
    let b = fixed(9, 9, [0]);
    b = cycleMark(cycleMark(b, 1), 1);
    expect(reveal(b, 1).cells[1]!.revealed).toBe(true);
  });
});

describe('chord', () => {
  it('reveals the other neighbours when flags match', () => {
    // Mine at 0 → cell 10 (x1,y1) shows 1. Its ring is revealed except the flagged mine.
    let b = fixed(9, 9, [0]);
    b = reveal(b, 10);
    b = cycleMark(b, 0);
    const after = chord(b, 10);
    expect(after.cells[1]!.revealed).toBe(true);
    expect(after.cells[9]!.revealed).toBe(true);
    expect(after.cells[0]!.revealed).toBe(false);
  });

  it('does nothing when the flag count differs', () => {
    const b = reveal(fixed(9, 9, [0]), 10);
    expect(chord(b, 10)).toBe(b);
  });

  it('does nothing on hidden cells or zeros', () => {
    const b = fixed(9, 9, [0]);
    expect(chord(b, 10)).toBe(b);
    const opened = reveal(fixed(9, 9, [0, 8]), 40);
    expect(chord(opened, 40)).toBe(opened);
  });

  it('loses when a flag is wrong', () => {
    let b = fixed(9, 9, [0]);
    b = reveal(b, 10);
    b = cycleMark(b, 1); // wrong: the mine is at 0
    const after = chord(b, 10);
    expect(after.status).toBe('lost');
    expect(after.cells[0]!.exploded).toBe(true);
    expect(isWrongFlag(after, 1)).toBe(true);
  });

  it('can win the game', () => {
    let b = fixed(9, 9, [0]);
    b = reveal(b, 10);
    b = cycleMark(b, 0);
    expect(chord(b, 10).status).toBe('won');
  });
});

describe('indexOf', () => {
  it('maps x,y to a cell index', () => {
    const b = createBoard(small, 1);
    expect(indexOf(b, 2, 3)).toBe(29);
  });
});
