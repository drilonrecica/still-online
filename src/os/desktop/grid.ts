// Desktop icon grid (XP's "Align to Grid"): 75×75 cells inside a 5 px margin. Pure, so the
// layout can be tested without a DOM.

export const CELL = 75;
export const PAD = 5;

export interface Cell {
  col: number;
  row: number;
}

export interface Grid {
  cols: number;
  rows: number;
}

/** The cells that fit a desktop of `width`×`height` px (at least one of each). */
export function gridSize(width: number, height: number): Grid {
  return {
    cols: Math.max(1, Math.floor((width - 2 * PAD) / CELL)),
    rows: Math.max(1, Math.floor((height - 2 * PAD) / CELL)),
  };
}

export const cellKey = ({ col, row }: Cell) => `${col},${row}`;

export const cellLeft = (cell: Cell) => PAD + cell.col * CELL;
export const cellTop = (cell: Cell) => PAD + cell.row * CELL;

export const inGrid = (cell: Cell, grid: Grid) =>
  cell.col >= 0 &&
  cell.row >= 0 &&
  cell.col < grid.cols &&
  cell.row < grid.rows;

/**
 * Where each icon goes. Saved cells that fit the grid and aren't taken win (first come, in
 * `ids` order); every other icon takes the first free cell, top to bottom and then left to
 * right, as the unarranged desktop always did. A saved cell off a smaller screen is only
 * moved here, never in the save, so the icon returns to it on a bigger one.
 */
export function layoutIcons(
  ids: readonly string[],
  saved: Readonly<Record<string, Cell>>,
  grid: Grid,
): Map<string, Cell> {
  const out = new Map<string, Cell>();
  const taken = new Set<string>();
  for (const id of ids) {
    const cell = saved[id];
    if (cell && inGrid(cell, grid) && !taken.has(cellKey(cell))) {
      out.set(id, cell);
      taken.add(cellKey(cell));
    }
  }
  let next = 0;
  for (const id of ids) {
    if (out.has(id)) continue;
    // Past the last row the columns keep going off-screen, as the old flex column wrapped.
    let cell: Cell;
    do {
      cell = { col: Math.floor(next / grid.rows), row: next % grid.rows };
      next++;
    } while (taken.has(cellKey(cell)));
    out.set(id, cell);
    taken.add(cellKey(cell));
  }
  return out;
}

/**
 * The free cell nearest to an icon dropped with its top-left corner at (`left`, `top`) px.
 * `occupied` holds the other icons' cells; the dropped icon's own cell counts as free.
 * Null when every cell on screen is taken.
 */
export function nearestFreeCell(
  left: number,
  top: number,
  occupied: ReadonlySet<string>,
  grid: Grid,
): Cell | null {
  const col = (left - PAD) / CELL;
  const row = (top - PAD) / CELL;
  let best: Cell | null = null;
  let bestDistance = Infinity;
  for (let c = 0; c < grid.cols; c++) {
    for (let r = 0; r < grid.rows; r++) {
      const cell = { col: c, row: r };
      if (occupied.has(cellKey(cell))) continue;
      const distance = (c - col) ** 2 + (r - row) ** 2;
      if (distance < bestDistance) {
        best = cell;
        bestDistance = distance;
      }
    }
  }
  return best;
}
