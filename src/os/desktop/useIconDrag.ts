// Dragging desktop icons. A press only becomes a drag past a few pixels, so clicks, taps,
// double-clicks and long-presses keep working. While dragging only the icon's transform
// changes; the drop commits once, through `onDrop`.
import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

/** Movement (px) before a press becomes a drag: a mouse, and a finger (as `useLongPress`). */
export const DRAG_SLOP_MOUSE = 4;
export const DRAG_SLOP_TOUCH = 10;

interface DragState {
  id: string;
  pointerId: number;
  x: number;
  y: number;
  el: HTMLElement;
  dx: number;
  dy: number;
  dragging: boolean;
}

export interface IconDragHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  onClickCapture: (e: MouseEvent<HTMLElement>) => void;
}

function reset(el: HTMLElement) {
  el.style.transform = '';
  delete el.dataset.dragging;
}

export function useIconDrag(
  onDrop: (id: string, dx: number, dy: number) => void,
): (id: string) => IconDragHandlers {
  const drag = useRef<DragState | null>(null);
  /** The click that follows a drop belongs to the drag, not to select or open. */
  const swallowClick = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  // Escape puts a dragged icon back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = drag.current;
      if (e.key !== 'Escape' || !d?.dragging) return;
      reset(d.el);
      drag.current = null;
      swallowClick.current = true;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function end(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.dragging) return;
    reset(d.el);
    swallowClick.current = true;
    if (e.type !== 'pointercancel') onDropRef.current(d.id, d.dx, d.dy);
  }

  return (id) => ({
    onPointerDown(e) {
      swallowClick.current = false;
      if (e.button !== 0 || !e.isPrimary) return;
      drag.current = {
        id,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        el: e.currentTarget,
        dx: 0,
        dy: 0,
        dragging: false,
      };
    },
    onPointerMove(e) {
      const d = drag.current;
      if (d?.pointerId !== e.pointerId) return;
      d.dx = e.clientX - d.x;
      d.dy = e.clientY - d.y;
      if (!d.dragging) {
        const slop =
          e.pointerType === 'mouse' ? DRAG_SLOP_MOUSE : DRAG_SLOP_TOUCH;
        if (Math.hypot(d.dx, d.dy) <= slop) return;
        d.dragging = true;
        d.el.dataset.dragging = 'true';
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      d.el.style.transform = `translate(${d.dx}px, ${d.dy}px)`;
    },
    onPointerUp: end,
    onPointerCancel: end,
    onClickCapture(e) {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    },
  });
}
