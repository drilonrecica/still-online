// Pointer-driven window dragging. The XP frame uses it on its titlebar; apps with
// `chrome: 'none'` spread the returned handlers on their own drag handle.
import { useRef, type PointerEvent } from 'react';
import { useWindowsStore } from '@/os/store/windows';

interface DragStart {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  winX: number;
  winY: number;
}

export interface WindowDragHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
}

/** True when the event started on a control that handles its own clicks. */
export function isFromControl(target: EventTarget): boolean {
  return (
    target instanceof Element &&
    target.closest('button, input, select, textarea, a') !== null
  );
}

export function useWindowDrag(id: string): WindowDragHandlers {
  const drag = useRef<DragStart | null>(null);

  function end(e: PointerEvent<HTMLElement>) {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return {
    onPointerDown(e) {
      if (e.button !== 0 || isFromControl(e.target)) return;
      const { windows, focusWindow } = useWindowsStore.getState();
      const win = windows.find((w) => w.id === id);
      if (!win) return;
      // No preventDefault: it would suppress the mousedown that focuses the window.
      focusWindow(id);
      if (win.maximized) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = {
        pointerId: e.pointerId,
        pointerX: e.clientX,
        pointerY: e.clientY,
        winX: win.x,
        winY: win.y,
      };
    },
    onPointerMove(e) {
      const start = drag.current;
      if (start?.pointerId !== e.pointerId) return;
      useWindowsStore
        .getState()
        .moveWindow(
          id,
          start.winX + e.clientX - start.pointerX,
          start.winY + e.clientY - start.pointerY,
        );
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
}
