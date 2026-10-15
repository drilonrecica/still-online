import { describe, expect, it } from 'vitest';
import { floodFill, pickColor, spray } from './fill';
import {
  BLACK,
  createBuffer,
  getPixel,
  setPixel,
  WHITE,
  type Rgba,
} from './pixels';
import { painted } from './test-helpers';
import {
  clearSelection,
  containsPoint,
  copyRegion,
  lift,
  moveTo,
  select,
} from './selection';
import { drawLine, drawShape, linePoints } from './shapes';
import {
  beginStroke,
  continueStroke,
  DEFAULT_OPTIONS,
  isStrokeTool,
  TOOLS,
  type ToolOptions,
} from './tools';
import { mulberry32 } from '@/os/random';

const RED: Rgba = [255, 0, 0, 255];
const opts = (o: Partial<ToolOptions> = {}) => ({ ...DEFAULT_OPTIONS, ...o });

describe('lines (Bresenham)', () => {
  it('walks every pixel between the end points, both included', () => {
    expect(linePoints({ x: 0, y: 0 }, { x: 3, y: 0 })).toHaveLength(4);
    const diag = linePoints({ x: 0, y: 0 }, { x: 4, y: 2 });
    expect(diag[0]).toEqual({ x: 0, y: 0 });
    expect(diag.at(-1)).toEqual({ x: 4, y: 2 });
    expect(diag).toHaveLength(5);
    expect(linePoints({ x: 2, y: 2 }, { x: 2, y: 2 })).toEqual([
      { x: 2, y: 2 },
    ]);
  });

  it('draws thick lines with square dabs and clips at the edges', () => {
    const buf = createBuffer(10, 10);
    drawLine(buf, { x: -5, y: 5 }, { x: 15, y: 5 }, BLACK, 3);
    expect(painted(buf)).toHaveLength(30);
  });
});

describe('shapes', () => {
  it('rectangle outline leaves the inside alone; fill paints it', () => {
    const buf = createBuffer(10, 10);
    drawShape(
      buf,
      'rect',
      { x: 1, y: 1 },
      { x: 5, y: 4 },
      { stroke: BLACK, fill: null, width: 1 },
    );
    expect(painted(buf)).toHaveLength(2 * 5 + 2 * 2);
    expect(getPixel(buf, 3, 2)).toEqual(WHITE);
    drawShape(
      buf,
      'rect',
      { x: 1, y: 1 },
      { x: 5, y: 4 },
      { stroke: BLACK, fill: RED, width: 1 },
    );
    expect(painted(buf, RED)).toHaveLength(3 * 2);
  });

  it('ellipse touches its box edges and stays hollow in outline mode', () => {
    const buf = createBuffer(21, 11);
    drawShape(
      buf,
      'ellipse',
      { x: 0, y: 0 },
      { x: 20, y: 10 },
      { stroke: BLACK, fill: null, width: 1 },
    );
    expect(getPixel(buf, 10, 0)).toEqual(BLACK);
    expect(getPixel(buf, 0, 5)).toEqual(BLACK);
    expect(getPixel(buf, 20, 5)).toEqual(BLACK);
    expect(getPixel(buf, 10, 5)).toEqual(WHITE);
    expect(getPixel(buf, 0, 0)).toEqual(WHITE);
  });

  it('filled ellipse covers the centre but not the corners', () => {
    const buf = createBuffer(11, 11);
    drawShape(
      buf,
      'ellipse',
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { stroke: null, fill: RED, width: 1 },
    );
    expect(getPixel(buf, 5, 5)).toEqual(RED);
    expect(getPixel(buf, 0, 0)).toEqual(WHITE);
    expect(painted(buf, RED).length).toBeGreaterThan(70);
  });

  it('rounded rectangle has rounded corners but straight sides', () => {
    const buf = createBuffer(40, 40);
    drawShape(
      buf,
      'roundrect',
      { x: 0, y: 0 },
      { x: 39, y: 39 },
      { stroke: BLACK, fill: null, width: 1 },
    );
    expect(getPixel(buf, 0, 0)).toEqual(WHITE);
    expect(getPixel(buf, 20, 0)).toEqual(BLACK);
    expect(getPixel(buf, 0, 20)).toEqual(BLACK);
    expect(getPixel(buf, 20, 20)).toEqual(WHITE);
  });
});

describe('fill, airbrush and picker', () => {
  it('flood fills only the connected area of exactly the same colour', () => {
    const buf = createBuffer(7, 5);
    for (let y = 0; y < 5; y++) setPixel(buf, 3, y, BLACK); // a wall
    setPixel(buf, 1, 1, [254, 255, 255, 255]); // near-white is not white
    expect(floodFill(buf, { x: 0, y: 0 }, RED)).toBe(3 * 5 - 1);
    expect(getPixel(buf, 1, 1)).toEqual([254, 255, 255, 255]);
    expect(getPixel(buf, 5, 2)).toEqual(WHITE);
    expect(floodFill(buf, { x: 0, y: 0 }, RED)).toBe(0);
    expect(floodFill(buf, { x: 99, y: 0 }, RED)).toBe(0);
  });

  it('sprays dots inside the radius, deterministically per seed', () => {
    const a = createBuffer(30, 30);
    const b = createBuffer(30, 30);
    spray(a, { x: 15, y: 15 }, 5, BLACK, mulberry32(7), 40);
    spray(b, { x: 15, y: 15 }, 5, BLACK, mulberry32(7), 40);
    expect(painted(a)).toEqual(painted(b));
    expect(painted(a).length).toBeGreaterThan(10);
    for (const p of painted(a)) {
      const [x, y] = p.split(',').map(Number) as [number, number];
      expect(Math.hypot(x - 15, y - 15)).toBeLessThanOrEqual(5.8);
    }
  });

  it('picks the colour under the point', () => {
    const buf = createBuffer(3, 3);
    setPixel(buf, 2, 1, RED);
    expect(pickColor(buf, { x: 2, y: 1 })).toEqual(RED);
    expect(pickColor(buf, { x: 3, y: 1 })).toBeNull();
  });
});

describe('selection', () => {
  it('lifts a region, moves it and fills the hole with the background', () => {
    const buf = createBuffer(10, 10);
    setPixel(buf, 1, 1, RED);
    let sel = select(buf, { x: 0, y: 0, w: 3, h: 3 });
    expect(sel).not.toBeNull();
    sel = lift(buf, sel!, BLACK);
    sel = moveTo(buf, sel, 5, 5);
    expect(getPixel(buf, 6, 6)).toEqual(RED);
    expect(getPixel(buf, 1, 1)).toEqual(BLACK);
    expect(sel.rect).toEqual({ x: 5, y: 5, w: 3, h: 3 });
    expect(containsPoint(sel.rect, 7, 7)).toBe(true);
    expect(containsPoint(sel.rect, 8, 7)).toBe(false);
  });

  it('deletes a marquee or a lifted selection', () => {
    const buf = createBuffer(5, 5, RED);
    const sel = select(buf, { x: 3, y: 3, w: 9, h: 9 })!;
    expect(sel.rect).toEqual({ x: 3, y: 3, w: 2, h: 2 });
    clearSelection(buf, sel, WHITE);
    expect(painted(buf, WHITE)).toHaveLength(4);
    expect(select(buf, { x: 9, y: 9, w: 2, h: 2 })).toBeNull();
    expect(copyRegion(buf, { x: 0, y: 0, w: 1, h: 1 }).data[0]).toBe(255);
  });
});

describe('stroke tools', () => {
  it('lists 13 tools; only drawing tools are strokes', () => {
    expect(TOOLS).toHaveLength(13);
    expect(TOOLS.filter((t) => isStrokeTool(t.id)).map((t) => t.id)).toEqual([
      'eraser',
      'fill',
      'pencil',
      'brush',
      'airbrush',
      'line',
      'rect',
      'ellipse',
      'roundrect',
    ]);
  });

  it('pencil draws a 1px trail in the drawing colour', () => {
    const buf = createBuffer(10, 10);
    const s = beginStroke(buf, 'pencil', { x: 0, y: 0 }, BLACK, WHITE, opts());
    continueStroke(buf, s, { x: 4, y: 0 });
    continueStroke(buf, s, { x: 4, y: 3 });
    expect(painted(buf)).toHaveLength(8);
  });

  it('brush paints a wider stroke at the chosen size', () => {
    const buf = createBuffer(20, 20);
    const s = beginStroke(
      buf,
      'brush',
      { x: 2, y: 10 },
      BLACK,
      WHITE,
      opts({ brushSize: 4 }),
    );
    continueStroke(buf, s, { x: 17, y: 10 });
    expect(getPixel(buf, 10, 9)).toEqual(BLACK);
    expect(getPixel(buf, 10, 11)).toEqual(BLACK);
    expect(getPixel(buf, 10, 13)).toEqual(WHITE);
  });

  it('eraser paints the secondary colour in squares of its size', () => {
    const buf = createBuffer(20, 20, BLACK);
    beginStroke(
      buf,
      'eraser',
      { x: 10, y: 10 },
      BLACK,
      WHITE,
      opts({ eraserSize: 8 }),
    );
    expect(painted(buf, WHITE)).toHaveLength(64);
  });

  it('airbrush keeps adding dots while held', () => {
    const buf = createBuffer(40, 40);
    const s = beginStroke(
      buf,
      'airbrush',
      { x: 20, y: 20 },
      RED,
      WHITE,
      opts(),
    );
    const first = painted(buf, RED).length;
    for (let i = 0; i < 10; i++) continueStroke(buf, s, { x: 20, y: 20 });
    expect(painted(buf, RED).length).toBeGreaterThan(first);
  });

  it('fill bucket floods on press', () => {
    const buf = createBuffer(5, 5);
    beginStroke(buf, 'fill', { x: 2, y: 2 }, RED, WHITE, opts());
    expect(painted(buf, RED)).toHaveLength(25);
  });

  it('line and shapes rubber-band: only the last position stays', () => {
    const buf = createBuffer(20, 20);
    const s = beginStroke(buf, 'line', { x: 0, y: 0 }, BLACK, WHITE, opts());
    continueStroke(buf, s, { x: 19, y: 19 });
    continueStroke(buf, s, { x: 9, y: 0 });
    expect(painted(buf)).toHaveLength(10);
    expect(getPixel(buf, 19, 19)).toEqual(WHITE);

    const rect = createBuffer(20, 20);
    const r = beginStroke(
      rect,
      'rect',
      { x: 0, y: 0 },
      BLACK,
      RED,
      opts({ shapeMode: 'both' }),
    );
    continueStroke(rect, r, { x: 15, y: 15 });
    continueStroke(rect, r, { x: 4, y: 4 });
    expect(painted(rect)).toHaveLength(16);
    expect(painted(rect, RED)).toHaveLength(9);
  });

  it('ellipse and rounded rectangle honour fill-only mode and line width', () => {
    const buf = createBuffer(30, 30);
    const e = beginStroke(
      buf,
      'ellipse',
      { x: 0, y: 0 },
      RED,
      BLACK,
      opts({ shapeMode: 'fill' }),
    );
    continueStroke(buf, e, { x: 29, y: 29 });
    expect(getPixel(buf, 15, 15)).toEqual(RED);
    expect(painted(buf)).toHaveLength(0);

    const rr = createBuffer(30, 30);
    const s = beginStroke(
      rr,
      'roundrect',
      { x: 0, y: 0 },
      BLACK,
      WHITE,
      opts({ lineWidth: 3 }),
    );
    continueStroke(rr, s, { x: 29, y: 29 });
    expect(getPixel(rr, 15, 2)).toEqual(BLACK);
    expect(getPixel(rr, 15, 3)).toEqual(WHITE);
  });

  it('keeps the pre-stroke image as the undo base', () => {
    const buf = createBuffer(5, 5);
    const s = beginStroke(buf, 'pencil', { x: 1, y: 1 }, BLACK, WHITE, opts());
    expect(painted(buf)).toHaveLength(1);
    expect(painted(s.base)).toHaveLength(0);
  });
});
