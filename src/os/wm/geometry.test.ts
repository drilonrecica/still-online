import { describe, expect, it } from 'vitest';
import { resizeRect, type Rect } from '@/os/wm/geometry';

const START: Rect = { x: 100, y: 100, w: 400, h: 300 };
const MIN = { w: 240, h: 140 };

describe('resizeRect', () => {
  it('grows east/south edges without moving the origin', () => {
    expect(resizeRect(START, 'se', 50, 20, MIN)).toEqual({
      x: 100,
      y: 100,
      w: 450,
      h: 320,
    });
  });

  it('moves the origin for west/north edges and keeps the opposite edge fixed', () => {
    expect(resizeRect(START, 'nw', -30, -40, MIN)).toEqual({
      x: 70,
      y: 60,
      w: 430,
      h: 340,
    });
  });

  it('stops at the min size with the opposite edge fixed', () => {
    const r = resizeRect(START, 'nw', 1000, 1000, MIN);
    expect(r).toEqual({ x: 260, y: 260, w: 240, h: 140 });
    expect(r.x + r.w).toBe(START.x + START.w);
    expect(r.y + r.h).toBe(START.y + START.h);
  });

  it('enforces the min size on east/south edges', () => {
    expect(resizeRect(START, 'e', -1000, 0, MIN).w).toBe(240);
    expect(resizeRect(START, 's', 0, -1000, MIN).h).toBe(140);
  });

  it('never moves the top edge above 0', () => {
    expect(resizeRect(START, 'n', 0, -500, MIN)).toEqual({
      x: 100,
      y: 0,
      w: 400,
      h: 400,
    });
  });

  it('single edges only change their own axis', () => {
    expect(resizeRect(START, 'e', 10, 99, MIN)).toEqual({ ...START, w: 410 });
    expect(resizeRect(START, 's', 99, 10, MIN)).toEqual({ ...START, h: 310 });
  });
});
