// The page area. On a phone (v0.6) the page lays out at PAGE_VIRTUAL_WIDTH: Fit to screen scales
// it to the area's width with CSS `zoom` (so hit-testing and scrolling stay native), Actual size
// leaves it at 800 px and the area scrolls sideways. A tablet and a desktop are unchanged.
import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import styles from './Browser.module.css';
import { fitZoom } from './zoom';

export interface PageViewProps {
  viewportRef: RefObject<HTMLDivElement>;
  /** Lay the page out at the 800 px virtual width (a phone). */
  virtual: boolean;
  /** Scale it to fit (Fit to screen); only with `virtual`. */
  fit: boolean;
  busy: boolean;
  children: ReactNode;
}

export function PageView({
  viewportRef,
  virtual,
  fit,
  busy,
  children,
}: PageViewProps) {
  const [zoom, setZoom] = useState(1);
  const fitted = virtual && fit;

  // The zoom follows the area's width (rotation, the keyboard, a window resize).
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!fitted || !el) return;
    const update = () => setZoom(fitZoom(el.clientWidth));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitted, viewportRef]);

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-testid="browser-viewport"
      data-view={virtual ? (fit ? 'fit' : 'actual') : undefined}
      aria-busy={busy}
    >
      {virtual ? (
        <div
          className={styles.virtualPage}
          data-testid="browser-page"
          style={fitted ? { zoom } : undefined}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
