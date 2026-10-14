import { useRef, type PointerEvent } from 'react';
import { useWindowsStore } from '@/os/store/windows';
import type { Size } from '@/os/types';
import {
  RESIZE_EDGES,
  resizeRect,
  type Rect,
  type ResizeEdge,
} from './geometry';
import styles from './Window.module.css';

interface ResizeStart {
  pointerId: number;
  edge: ResizeEdge;
  pointerX: number;
  pointerY: number;
  rect: Rect;
}

interface ResizeHandlesProps {
  windowId: string;
  minSize: Size;
}

/** Eight invisible grips (4 edges, 4 corners) around a framed window. */
export function ResizeHandles({ windowId, minSize }: ResizeHandlesProps) {
  const resize = useRef<ResizeStart | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>, edge: ResizeEdge) {
    if (e.button !== 0) return;
    const win = useWindowsStore
      .getState()
      .windows.find((w) => w.id === windowId);
    if (!win) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    resize.current = {
      pointerId: e.pointerId,
      edge,
      pointerX: e.clientX,
      pointerY: e.clientY,
      rect: { x: win.x, y: win.y, w: win.w, h: win.h },
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const start = resize.current;
    if (start?.pointerId !== e.pointerId) return;
    useWindowsStore
      .getState()
      .resizeWindow(
        windowId,
        resizeRect(
          start.rect,
          start.edge,
          e.clientX - start.pointerX,
          e.clientY - start.pointerY,
          minSize,
        ),
      );
  }

  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    if (resize.current?.pointerId !== e.pointerId) return;
    resize.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <>
      {RESIZE_EDGES.map((edge) => (
        <div
          key={edge}
          aria-hidden="true"
          data-resize={edge}
          className={`${styles.resize} ${styles[`resize-${edge}`] ?? ''}`}
          onPointerDown={(e) => onPointerDown(e, edge)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />
      ))}
    </>
  );
}
