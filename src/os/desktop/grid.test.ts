import { describe, expect, it } from 'vitest';
import {
  cellKey,
  gridSize,
  layoutIcons,
  nearestFreeCell,
  type Cell,
} from './grid';

const ids = ['a', 'b', 'c', 'd', 'e'];
const cells = (layout: Map<string, Cell>) =>
  Object.fromEntries([...layout].map(([id, c]) => [id, cellKey(c)]));

describe('desktop grid', () => {
  it('fits 75 px cells inside a 5 px margin, at least one each way', () => {
    expect(gridSize(1280, 770)).toEqual({ cols: 16, rows: 10 });
    expect(gridSize(412, 835)).toEqual({ cols: 5, rows: 11 });
    expect(gridSize(0, 0)).toEqual({ cols: 1, rows: 1 });
  });

  it('lays icons out top to bottom, then left to right, with nothing saved', () => {
    expect(cells(layoutIcons(ids, {}, { cols: 4, rows: 2 }))).toEqual({
      a: '0,0',
      b: '0,1',
      c: '1,0',
      d: '1,1',
      e: '2,0',
    });
  });

  it('keeps saved cells and flows the rest around them', () => {
    const saved = { c: { col: 0, row: 0 }, e: { col: 3, row: 1 } };
    expect(cells(layoutIcons(ids, saved, { cols: 4, rows: 2 }))).toEqual({
      c: '0,0',
      e: '3,1',
      a: '0,1',
      b: '1,0',
      d: '1,1',
    });
  });

  it('reflows a saved cell off a smaller screen without losing it, and the first claim wins', () => {
    const saved = {
      a: { col: 9, row: 9 },
      b: { col: 1, row: 0 },
      c: { col: 1, row: 0 },
    };
    const small = layoutIcons(ids, saved, { cols: 2, rows: 2 });
    expect(cells(small)).toEqual({
      b: '1,0',
      a: '0,0',
      c: '0,1',
      d: '1,1',
      // Past the last cell the columns keep going, as the old wrapped column did.
      e: '2,0',
    });
    expect(saved.a).toEqual({ col: 9, row: 9 });
    expect(cells(layoutIcons(ids, saved, { cols: 10, rows: 10 })).a).toBe(
      '9,9',
    );
  });

  it('drops onto the nearest free cell', () => {
    const grid = { cols: 4, rows: 3 };
    // Right on cell 2,1 (left 155, top 80).
    expect(nearestFreeCell(155, 80, new Set(), grid)).toEqual({
      col: 2,
      row: 1,
    });
    // Slightly off: snaps.
    expect(nearestFreeCell(170, 60, new Set(), grid)).toEqual({
      col: 2,
      row: 1,
    });
    // Taken: the next-nearest one (ties go to the earlier column).
    expect(nearestFreeCell(155, 80, new Set(['2,1']), grid)).toEqual({
      col: 1,
      row: 1,
    });
    // Off the edge: clamped into the grid.
    expect(nearestFreeCell(5000, -300, new Set(), grid)).toEqual({
      col: 3,
      row: 0,
    });
  });

  it('finds no cell on a full screen', () => {
    const grid = { cols: 1, rows: 2 };
    expect(nearestFreeCell(5, 5, new Set(['0,0', '0,1']), grid)).toBeNull();
  });
});
