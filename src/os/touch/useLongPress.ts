// Long-press: the touch path to every context menu. A held finger (or pen) fires the same
// handler a right-click does. See docs/touch.md.
import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

/** Hold time. A human gesture, so not scaled by `scaleMs`. */
export const LONG_PRESS_MS = 500;
/** A move further than this (px) is a pan or a drag, not a press. */
export const LONG_PRESS_SLOP = 10;
/** How long after the lift the click that ends a long-press is still swallowed. */
const CLICK_SWALLOW_MS = 400;

export interface LongPressPoint {
  clientX: number;
  clientY: number;
  target: EventTarget;
}

export interface LongPressHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  onContextMenu: (e: MouseEvent<HTMLElement>) => void;
}

interface Press {
  pointerId: number;
  x: number;
  y: number;
  timer: number;
}

interface Swallow {
  el: HTMLElement;
  listener: (e: Event) => void;
  timer: number;
}

/** Native pointerdowns a nested long-press already took, so an ancestor doesn't fire too. */
const claimed = new WeakSet<Event>();

const isTouchType = (type: string | undefined) =>
  type === 'touch' || type === 'pen';

/**
 * Returns a binder: spread `press(arg)` on the element. A touch or pen held for
 * `LONG_PRESS_MS` calls `handler(point, arg)`; a mouse right-click (or the menu key) calls
 * it from `contextmenu`. Both `preventDefault` the native menu.
 */
export function useLongPress<A = void>(
  handler: (point: LongPressPoint, arg: A) => void,
): (arg: A) => LongPressHandlers {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const press = useRef<Press | null>(null);
  /** True between a touch pointerdown and its lift: Android's own `contextmenu` lands then. */
  const touchDown = useRef(false);
  const swallow = useRef<Swallow | null>(null);

  const cancel = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };
  const stopSwallowing = () => {
    const s = swallow.current;
    if (!s) return;
    s.el.removeEventListener('click', s.listener, true);
    window.clearTimeout(s.timer);
    swallow.current = null;
  };
  useEffect(
    () => () => {
      cancel();
      stopSwallowing();
    },
    [],
  );

  /**
   * Swallows the click the lift produces. React handles clicks at the root, so stopping
   * the native click in the capture phase here keeps it from every React `onClick`.
   */
  function startSwallowing(el: HTMLElement) {
    stopSwallowing();
    const listener = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      stopSwallowing();
    };
    el.addEventListener('click', listener, true);
    swallow.current = { el, listener, timer: 0 };
  }

  function end() {
    touchDown.current = false;
    cancel();
    // A lift with no click after it (Chrome often sends none) must not eat a later tap.
    const s = swallow.current;
    if (s) {
      window.clearTimeout(s.timer);
      s.timer = window.setTimeout(stopSwallowing, CLICK_SWALLOW_MS);
    }
  }

  return (arg: A) => ({
    onPointerDown(e) {
      cancel();
      stopSwallowing();
      if (!isTouchType(e.pointerType)) return;
      touchDown.current = true;
      if (!e.isPrimary || claimed.has(e.nativeEvent)) return;
      claimed.add(e.nativeEvent);
      const el = e.currentTarget;
      const point = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      };
      press.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        timer: window.setTimeout(() => {
          press.current = null;
          navigator.vibrate?.(10);
          startSwallowing(el);
          handlerRef.current(point, arg);
        }, LONG_PRESS_MS),
      };
    },
    onPointerMove(e) {
      const p = press.current;
      if (p?.pointerId !== e.pointerId) return;
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > LONG_PRESS_SLOP) {
        cancel();
      }
    },
    onPointerUp: end,
    onPointerCancel: end,
    onContextMenu(e) {
      e.preventDefault();
      const type = (e.nativeEvent as Partial<globalThis.PointerEvent>)
        .pointerType;
      // A touch long-press fires its own `contextmenu`; the timer handles it, once.
      if (isTouchType(type) || touchDown.current) return;
      handlerRef.current(
        { clientX: e.clientX, clientY: e.clientY, target: e.target },
        arg,
      );
    },
  });
}
