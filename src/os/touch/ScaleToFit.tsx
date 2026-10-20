// Renders a fixed-size stage (a game) zoomed to fit its parent, keeping the aspect ratio, and
// centred. CSS `zoom`, not `transform`, so native hit-testing keeps working. See docs/touch.md.
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { fitScale } from './scaleToFit';
import styles from './ScaleToFit.module.css';

export { fitScale, toStage } from './scaleToFit';

export interface ScaleToFitProps {
  /** The stage's own size in CSS px. */
  width: number;
  height: number;
  /** Off: the children render as they are, with no wrapper (the desktop layout). */
  active?: boolean;
  /** False: only shrink a stage that doesn't fit, never enlarge it. */
  grow?: boolean;
  children: ReactNode;
}

export function ScaleToFit({
  width,
  height,
  active = true,
  grow = true,
  children,
}: ScaleToFitProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // The zoom follows the box (rotation, the keyboard, a window resize).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!active || !el) return;
    const update = () =>
      setScale(
        fitScale(el.clientWidth, el.clientHeight, width, height, { grow }),
      );
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, width, height, grow]);

  if (!active) return <>{children}</>;
  return (
    <div ref={boxRef} className={styles.box} data-scale-to-fit="">
      <div
        className={styles.stage}
        data-testid="scale-stage"
        data-scale={scale}
        // `--stage-scale` lets a game keep a control finger-sized on screen:
        // `calc(36px / var(--stage-scale))` inside the stage is 36 px after the zoom.
        style={
          {
            width,
            height,
            zoom: scale,
            '--stage-scale': scale,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
