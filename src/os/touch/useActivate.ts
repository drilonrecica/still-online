// Activate ("open"): a mouse double-click, a touch tap or Enter. A mouse single click keeps
// whatever the site gives it (usually select). See docs/touch.md.
import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';

/** Two taps on the same element within this (ms) are one double-tap. */
export const DOUBLE_TAP_MS = 400;

export type ActivateVia = 'mouse' | 'touch' | 'key';

export interface ActivateOptions {
  /**
   * Taps that activate by touch: 1 (default; a second quick tap is ignored, so a habitual
   * double-tap opens once) or 2 (a double-tap, for a title bar where one tap must not act).
   */
  touchTaps?: 1 | 2;
  /** Enter activates (default). Off where Enter belongs to controls inside, like a title bar. */
  enter?: boolean;
}

export interface ActivateHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onClick: (e: MouseEvent<HTMLElement>) => void;
  onDoubleClick: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

const isTouchType = (type: string | undefined) =>
  type === 'touch' || type === 'pen';

/**
 * Returns a binder: spread `activate(arg)` on the element. Activation calls
 * `onActivate(arg, via, target)`, where `target` is the event's target.
 */
export function useActivate<A = void>(
  onActivate: (arg: A, via: ActivateVia, target: EventTarget) => void,
  { touchTaps = 1, enter = true }: ActivateOptions = {},
): (arg: A) => ActivateHandlers {
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;
  /** The pointer type of the last pointerdown: a click doesn't reliably carry its own. */
  const pointerType = useRef('');
  const lastTap = useRef<{ el: EventTarget; at: number } | null>(null);

  return (arg: A) => ({
    onPointerDown(e) {
      pointerType.current = e.pointerType;
    },
    onClick(e) {
      if (!isTouchType(pointerType.current)) return;
      const now = Date.now();
      const prev = lastTap.current;
      const again =
        prev?.el === e.currentTarget && now - prev.at < DOUBLE_TAP_MS;
      if (touchTaps === 1) {
        lastTap.current = { el: e.currentTarget, at: now };
        if (!again) onActivateRef.current(arg, 'touch', e.target);
      } else if (again) {
        lastTap.current = null;
        onActivateRef.current(arg, 'touch', e.target);
      } else {
        lastTap.current = { el: e.currentTarget, at: now };
      }
    },
    onDoubleClick(e) {
      // Touch went through the taps above; some browsers also send a `dblclick` for them.
      if (isTouchType(pointerType.current)) return;
      e.stopPropagation();
      onActivateRef.current(arg, 'mouse', e.target);
    },
    onKeyDown(e) {
      if (!enter || e.key !== 'Enter') return;
      e.preventDefault();
      onActivateRef.current(arg, 'key', e.target);
    },
  });
}
