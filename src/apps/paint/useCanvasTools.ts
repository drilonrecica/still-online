// Pointer handling on the canvas: turns presses and drags into tool actions on the document.
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { drawText } from './codec';
import { pickColor } from './fill';
import {
  cloneBuffer,
  rectFrom,
  sameBuffer,
  type Point,
  type Rect,
  type Rgba,
} from './pixels';
import {
  clearSelection,
  containsPoint,
  lift,
  moveTo,
  select,
  type Selection,
} from './selection';
import {
  beginStroke,
  continueStroke,
  isStrokeTool,
  type Stroke,
  type ToolId,
  type ToolOptions,
  type Zoom,
} from './tools';
import type { PaintDocument } from './useDocument';

/** Airbrush puffs per second while the button is held still. */
const AIRBRUSH_MS = 40;

export interface ToolSettings {
  tool: ToolId;
  primary: Rgba;
  secondary: Rgba;
  options: ToolOptions;
  zoom: Zoom;
  /** Colour picker result: `secondary` for the right button. */
  onPick: (color: Rgba, secondary: boolean) => void;
  /** Magnifier click. */
  onZoomToggle: () => void;
}

export interface TextBox {
  at: Point;
  value: string;
  color: Rgba;
}

type Drag =
  | { kind: 'stroke'; stroke: Stroke }
  | { kind: 'marquee'; from: Point; to: Point }
  | { kind: 'move'; grab: Point; origin: Point };

export function useCanvasTools(doc: PaintDocument, s: ToolSettings) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [text, setTextState] = useState<TextBox | null>(null);
  // Mirrors `text` so commit-on-blur never sees a stale box (blur can follow a re-render).
  const textNow = useRef<TextBox | null>(null);
  const setText = (next: TextBox | null) => {
    textNow.current = next;
    setTextState(next);
  };
  const [cursor, setCursor] = useState<Point | null>(null);
  const drag = useRef<Drag | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  // The image before the selection was lifted, until the move is committed as one undo step.
  const liftBase = useRef<ReturnType<typeof cloneBuffer> | null>(null);

  const stopTimer = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopTimer, []);

  function pointOf(e: PointerEvent<HTMLElement>): Point {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - box.left) / s.zoom),
      y: Math.floor((e.clientY - box.top) / s.zoom),
    };
  }

  /** Leaves the selection where it is (its pixels are already in the image). */
  function dropSelection() {
    setSelection(null);
    liftBase.current = null;
  }

  function commitText() {
    const box = textNow.current;
    if (!box) return;
    setText(null);
    if (!box.value.trim()) return;
    const before = cloneBuffer(doc.buf);
    if (drawText(doc.buf, box.value, box.at.x, box.at.y, box.color))
      doc.commit(before);
  }

  /** Finishes pending text and selection; call before any other edit. */
  function settle() {
    commitText();
    dropSelection();
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    const p = pointOf(e);
    const right = e.button === 2;
    const color = right ? s.secondary : s.primary;
    const other = right ? s.primary : s.secondary;
    if (s.tool === 'picker') {
      const picked = pickColor(doc.buf, p);
      if (picked) s.onPick(picked, right);
      return;
    }
    if (s.tool === 'magnifier') return s.onZoomToggle();
    if (s.tool === 'text') {
      commitText();
      setText({ at: p, value: '', color: s.primary });
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (s.tool === 'select') {
      if (selection && containsPoint(selection.rect, p.x, p.y)) {
        if (!selection.float) liftBase.current = cloneBuffer(doc.buf);
        setSelection(lift(doc.buf, selection, s.secondary));
        drag.current = {
          kind: 'move',
          grab: p,
          origin: { x: selection.rect.x, y: selection.rect.y },
        };
        return;
      }
      settle();
      drag.current = { kind: 'marquee', from: p, to: p };
      setMarquee(rectFrom(p, p));
      return;
    }
    if (!isStrokeTool(s.tool)) return;
    settle();
    const stroke = beginStroke(doc.buf, s.tool, p, color, other, s.options);
    drag.current = { kind: 'stroke', stroke };
    doc.redraw();
    if (s.tool === 'airbrush') {
      timer.current = setInterval(() => {
        continueStroke(doc.buf, stroke, stroke.last);
        doc.redraw();
      }, AIRBRUSH_MS);
    }
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const p = pointOf(e);
    setCursor(p);
    const d = drag.current;
    if (!d) return;
    if (d.kind === 'stroke') {
      continueStroke(doc.buf, d.stroke, p);
      doc.redraw();
    } else if (d.kind === 'marquee') {
      d.to = p;
      setMarquee(rectFrom(d.from, p));
    } else if (selection) {
      const x = d.origin.x + p.x - d.grab.x;
      const y = d.origin.y + p.y - d.grab.y;
      setSelection(moveTo(doc.buf, selection, x, y));
      doc.redraw();
    }
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    stopTimer();
    if (!d) return;
    if (d.kind === 'stroke') {
      if (!sameBuffer(d.stroke.base, doc.buf)) doc.commit(d.stroke.base);
    } else if (d.kind === 'marquee') {
      setMarquee(null);
      setSelection(select(doc.buf, rectFrom(d.from, d.to)));
    } else if (liftBase.current && !sameBuffer(liftBase.current, doc.buf)) {
      // One undo step per lift; later moves of the same floating selection join it.
      doc.commit(liftBase.current);
      liftBase.current = null;
    }
  }

  function selectAll() {
    settle();
    setSelection(select(doc.buf, { x: 0, y: 0, w: doc.buf.w, h: doc.buf.h }));
  }

  function deleteSelection() {
    if (!selection) return;
    const before = liftBase.current ?? cloneBuffer(doc.buf);
    clearSelection(doc.buf, selection, s.secondary);
    dropSelection();
    doc.commit(before);
  }

  return {
    selection,
    marquee,
    text,
    cursor,
    setTextValue: (value: string) => {
      if (textNow.current) setText({ ...textNow.current, value });
    },
    cancelText: () => setText(null),
    commitText,
    settle,
    selectAll,
    deleteSelection,
    clearCursor: () => setCursor(null),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
