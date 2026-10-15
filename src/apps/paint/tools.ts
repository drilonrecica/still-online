// The drawing tools as pure stroke logic: pointer down/move/up → changes to a PixelBuffer.
// Select, text, colour picker and magnifier are interactive and live in the component.
import type { MessageKey } from '@/i18n/types';
import { mulberry32 } from '@/os/random';
import { AIRBRUSH_RADII, floodFill, spray } from './fill';
import { cloneBuffer, type PixelBuffer, type Point, type Rgba } from './pixels';
import { drawLine, drawShape, shapeStyle, type ShapeMode } from './shapes';

export type ToolId =
  | 'select'
  | 'eraser'
  | 'fill'
  | 'picker'
  | 'magnifier'
  | 'pencil'
  | 'brush'
  | 'airbrush'
  | 'text'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'roundrect';

/** Toolbox order (two columns, read left to right). */
export const TOOLS: readonly { id: ToolId; labelKey: MessageKey }[] = [
  { id: 'select', labelKey: 'paint.tools.select' },
  { id: 'eraser', labelKey: 'paint.tools.eraser' },
  { id: 'fill', labelKey: 'paint.tools.fill' },
  { id: 'picker', labelKey: 'paint.tools.picker' },
  { id: 'magnifier', labelKey: 'paint.tools.magnifier' },
  { id: 'pencil', labelKey: 'paint.tools.pencil' },
  { id: 'brush', labelKey: 'paint.tools.brush' },
  { id: 'airbrush', labelKey: 'paint.tools.airbrush' },
  { id: 'text', labelKey: 'paint.tools.text' },
  { id: 'line', labelKey: 'paint.tools.line' },
  { id: 'rect', labelKey: 'paint.tools.rect' },
  { id: 'ellipse', labelKey: 'paint.tools.ellipse' },
  { id: 'roundrect', labelKey: 'paint.tools.roundrect' },
];

export const BRUSH_SIZES = [2, 4, 7] as const;
export const ERASER_SIZES = [4, 6, 8, 10] as const;
export const LINE_WIDTHS = [1, 2, 3, 4, 5] as const;
export const ZOOMS = [1, 2, 4] as const;
export type Zoom = (typeof ZOOMS)[number];

export interface ToolOptions {
  brushSize: number;
  eraserSize: number;
  airbrushRadius: number;
  lineWidth: number;
  shapeMode: ShapeMode;
}

export const DEFAULT_OPTIONS: ToolOptions = {
  brushSize: BRUSH_SIZES[1],
  eraserSize: ERASER_SIZES[1],
  airbrushRadius: AIRBRUSH_RADII[1],
  lineWidth: LINE_WIDTHS[0],
  shapeMode: 'outline',
};

/** Tools that draw by dragging and go through `beginStroke`. */
export type StrokeTool = Exclude<
  ToolId,
  'select' | 'picker' | 'magnifier' | 'text'
>;

export function isStrokeTool(tool: ToolId): tool is StrokeTool {
  return !['select', 'picker', 'magnifier', 'text'].includes(tool);
}

export interface Stroke {
  tool: StrokeTool;
  /** The image before the stroke: shapes redraw over it, undo restores it. */
  base: PixelBuffer;
  start: Point;
  last: Point;
  /** The drawing colour (left button primary, right button secondary). */
  color: Rgba;
  /** The other colour: shape fill, and what the eraser paints with. */
  other: Rgba;
  options: ToolOptions;
  rand: () => number;
}

let puffSeed = 1;

/** Starts a stroke at `at` and applies its first dab. */
export function beginStroke(
  buf: PixelBuffer,
  tool: StrokeTool,
  at: Point,
  color: Rgba,
  other: Rgba,
  options: ToolOptions,
): Stroke {
  const stroke: Stroke = {
    tool,
    base: cloneBuffer(buf),
    start: at,
    last: at,
    color,
    other,
    options,
    rand: mulberry32(puffSeed++),
  };
  if (tool === 'fill') floodFill(buf, at, color);
  else continueStroke(buf, stroke, at);
  return stroke;
}

/** Pointer moved (or, for the airbrush, time passed) with the button held. */
export function continueStroke(
  buf: PixelBuffer,
  stroke: Stroke,
  to: Point,
): void {
  const { options: o, last } = stroke;
  switch (stroke.tool) {
    case 'pencil':
      drawLine(buf, last, to, stroke.color);
      break;
    case 'brush':
      drawLine(buf, last, to, stroke.color, o.brushSize, true);
      break;
    case 'eraser':
      drawLine(buf, last, to, stroke.other, o.eraserSize);
      break;
    case 'airbrush':
      spray(buf, to, o.airbrushRadius, stroke.color, stroke.rand);
      break;
    case 'line':
      buf.data.set(stroke.base.data);
      drawLine(buf, stroke.start, to, stroke.color, o.lineWidth);
      break;
    case 'rect':
    case 'ellipse':
    case 'roundrect':
      buf.data.set(stroke.base.data);
      drawShape(
        buf,
        stroke.tool,
        stroke.start,
        to,
        shapeStyle(o.shapeMode, stroke.color, stroke.other, o.lineWidth),
      );
      break;
    case 'fill':
      break;
  }
  stroke.last = to;
}
