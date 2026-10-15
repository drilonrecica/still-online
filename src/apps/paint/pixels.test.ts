import { describe, expect, it } from 'vitest';
import { createHistory } from './history';
import {
  BLACK,
  clampSide,
  cloneBuffer,
  createBuffer,
  getPixel,
  hexToRgba,
  rectFrom,
  resizeBuffer,
  rgbaToHex,
  sameBuffer,
  setPixel,
  stamp,
  WHITE,
  type Rgba,
} from './pixels';
import { PALETTE } from './palette';
import { painted } from './test-helpers';

const RED: Rgba = [255, 0, 0, 255];

describe('pixel buffer', () => {
  it('starts white and reads/writes pixels, ignoring out-of-bounds', () => {
    const buf = createBuffer(4, 3);
    expect(buf.data).toHaveLength(48);
    expect(getPixel(buf, 3, 2)).toEqual(WHITE);
    setPixel(buf, 1, 1, RED);
    setPixel(buf, -1, 0, RED);
    setPixel(buf, 4, 0, RED);
    expect(getPixel(buf, 1, 1)).toEqual(RED);
    expect(getPixel(buf, 9, 9)).toBeNull();
    expect(painted(buf, RED)).toEqual(['1,1']);
  });

  it('clones independently and compares by content', () => {
    const a = createBuffer(2, 2);
    const b = cloneBuffer(a);
    expect(sameBuffer(a, b)).toBe(true);
    setPixel(b, 0, 0, BLACK);
    expect(sameBuffer(a, b)).toBe(false);
    expect(getPixel(a, 0, 0)).toEqual(WHITE);
  });

  it('stamps square and round dabs centred on the point', () => {
    const buf = createBuffer(9, 9);
    stamp(buf, 4, 4, 3, BLACK);
    expect(painted(buf)).toHaveLength(9);
    const round = createBuffer(9, 9);
    stamp(round, 4, 4, 7, BLACK, true);
    expect(getPixel(round, 4, 4)).toEqual(BLACK);
    expect(getPixel(round, 1, 1)).toEqual(WHITE); // corner trimmed
    expect(painted(round).length).toBeLessThan(49);
  });

  it('resizes by cropping or extending with white (Image → Attributes)', () => {
    const buf = createBuffer(3, 3);
    setPixel(buf, 0, 0, RED);
    setPixel(buf, 2, 2, RED);
    const small = resizeBuffer(buf, 2, 2);
    expect(painted(small, RED)).toEqual(['0,0']);
    const big = resizeBuffer(buf, 5, 4);
    expect([big.w, big.h]).toEqual([5, 4]);
    expect(painted(big, RED)).toEqual(['0,0', '2,2']);
    expect(getPixel(big, 4, 3)).toEqual(WHITE);
    expect(clampSide(0)).toBe(1);
    expect(clampSide(99999)).toBe(1600);
    expect(clampSide(Number.NaN)).toBe(1);
  });

  it('normalises corner points into an inclusive rect', () => {
    expect(rectFrom({ x: 5, y: 1 }, { x: 2, y: 3 })).toEqual({
      x: 2,
      y: 1,
      w: 4,
      h: 3,
    });
  });

  it('converts colours and has a 28-colour palette', () => {
    expect(hexToRgba('#ff8040')).toEqual([255, 128, 64, 255]);
    expect(hexToRgba('nope')).toEqual(BLACK);
    expect(rgbaToHex([0, 128, 255, 255])).toBe('#0080ff');
    expect(PALETTE).toHaveLength(28);
    expect(new Set(PALETTE).size).toBe(28);
  });
});

describe('undo history', () => {
  it('undoes and redoes snapshots, and a new change clears redo', () => {
    const h = createHistory<number>();
    expect(h.undo(0)).toBeNull();
    h.push(0);
    h.push(1);
    expect(h.undo(2)).toBe(1);
    expect(h.undo(1)).toBe(0);
    expect(h.canUndo()).toBe(false);
    expect(h.redo(0)).toBe(1);
    expect(h.canRedo()).toBe(true);
    h.push(1);
    expect(h.canRedo()).toBe(false);
  });

  it('keeps at most 20 steps', () => {
    const h = createHistory<number>();
    for (let i = 0; i < 25; i++) h.push(i);
    let undone = 0;
    let state = 25;
    for (let s = h.undo(state); s !== null; s = h.undo(state)) {
      state = s;
      undone++;
    }
    expect(undone).toBe(20);
    expect(state).toBe(5);
  });
});
