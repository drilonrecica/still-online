import { describe, expect, it } from 'vitest';
import { createTouchTracker, phoneCanvasSize } from './touch';

describe('phoneCanvasSize', () => {
  it('is the work area in whole pixels', () => {
    expect(phoneCanvasSize(397.6, 607.2)).toEqual({ w: 397, h: 607 });
  });

  it('is never smaller than 200×200', () => {
    expect(phoneCanvasSize(900, 120)).toEqual({ w: 900, h: 200 });
    expect(phoneCanvasSize(0, 0)).toEqual({ w: 200, h: 200 });
  });
});

describe('createTouchTracker', () => {
  it('lets the only finger draw and never pans with it', () => {
    const t = createTouchTracker();
    expect(t.down(1, { x: 10, y: 10 })).toBe('draw');
    expect(t.panning).toBe(false);
    expect(t.move(1, { x: 50, y: 40 })).toEqual({ x: 0, y: 0 });
  });

  it('pans with the midpoint of two fingers, opposite to their movement', () => {
    const t = createTouchTracker();
    t.down(1, { x: 0, y: 0 });
    expect(t.down(2, { x: 100, y: 0 })).toBe('pan');
    expect(t.panning).toBe(true);
    // Both fingers move 20 px left and 10 px up: the midpoint moves the same.
    expect(t.move(1, { x: -20, y: -10 })).toEqual({ x: 10, y: 5 });
    expect(t.move(2, { x: 80, y: -10 })).toEqual({ x: 10, y: 5 });
    expect(t.down(3, { x: 30, y: -10 })).toBe('extra');
  });

  it('keeps panning with the last finger until all lift, then draws again', () => {
    const t = createTouchTracker();
    t.down(1, { x: 0, y: 0 });
    t.down(2, { x: 100, y: 0 });
    t.up(2);
    expect(t.count).toBe(1);
    expect(t.panning).toBe(true);
    expect(t.move(1, { x: 0, y: -30 })).toEqual({ x: 0, y: 30 });
    t.up(1);
    expect(t.panning).toBe(false);
    expect(t.down(3, { x: 5, y: 5 })).toBe('draw');
  });

  it('ignores moves of pointers it does not track', () => {
    const t = createTouchTracker();
    t.down(1, { x: 0, y: 0 });
    t.down(2, { x: 10, y: 0 });
    expect(t.move(9, { x: 99, y: 99 })).toEqual({ x: 0, y: 0 });
  });
});
