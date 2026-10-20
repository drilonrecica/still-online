// The screensaver overlay: a full-screen canvas running the chosen saver until the first input,
// which it swallows. Reduced motion gets a still black screen with a slow fade instead.
import { useEffect, useRef } from 'react';
import { useT } from '@/i18n/useT';
import { APP_NAME } from '@/os/brand/brand';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { mulberry32 } from '@/os/random';
import { useAnimationFrame } from '@/os/useAnimationFrame';
import { useReducedMotion } from '@/os/useReducedMotion';
import { createDismissal, swallowNextClick } from './dismiss';
import { SAVERS } from './savers';
import type { SlideSource } from './savers/types';
import { useScreensaverStore, type ScreensaverRun } from './store';
import styles from './Screensaver.module.css';

/** Pictures directly in My Pictures, in folder order. */
function myPictures(): SlideSource[] {
  return useFsStore
    .getState()
    .list(FS_FOLDERS.pics)
    .flatMap((n): SlideSource[] => {
      if (n.type !== 'image') return [];
      if (n.photo) return [{ kind: 'photo', photo: n.photo }];
      return n.blobKey ? [{ kind: 'blob', blobKey: n.blobKey }] : [];
    });
}

/** Runs the saver on the canvas; pauses while the tab is hidden. */
function useSaverLoop(
  ref: React.RefObject<HTMLCanvasElement | null>,
  run: ScreensaverRun,
  enabled: boolean,
) {
  const frameRef = useRef<((dtMs: number) => void) | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = enabled ? canvas?.getContext('2d') : null;
    if (!canvas || !ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    const saver = SAVERS[run.id]({
      w,
      h,
      rand: mulberry32((Date.now() ^ 0x5a7e) >>> 0),
      text: run.text,
      slides: run.id === 'slideshow' ? myPictures() : [],
    });
    frameRef.current = (dtMs: number) => {
      // Cap the step so a long stall doesn't jump the animation.
      saver.frame(ctx, dtMs === 0 ? 16 : Math.min(dtMs, 100));
    };
    return () => {
      frameRef.current = null;
      saver.dispose?.();
    };
  }, [ref, run, enabled]);
  useAnimationFrame((_time, dt) => frameRef.current?.(dt), enabled);
}

/** Stops the saver on the first real input and keeps that input from reaching the desktop. */
function useDismiss(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stop = () => useScreensaverStore.getState().stop();
    const shouldStop = createDismissal(performance.now());
    const previousFocus = document.activeElement;
    ref.current?.focus({ preventScroll: true });

    const onMove = (e: PointerEvent) => {
      const time = performance.now();
      if (shouldStop({ kind: 'move', x: e.clientX, y: e.clientY, time }))
        stop();
    };
    // A finger stops it too: `touchstart` and its `pointerdown` both arrive, only the first counts.
    let stopped = false;
    const onDown = (e: PointerEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (stopped || !shouldStop({ kind: 'down', time: performance.now() }))
        return;
      stopped = true;
      swallowNextClick();
      stop();
    };
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      if (shouldStop({ kind: 'key', time: performance.now() })) stop();
    };
    const onWheel = () => {
      if (shouldStop({ kind: 'wheel', time: performance.now() })) stop();
    };
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('touchstart', onDown, {
      capture: true,
      passive: false,
    });
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('touchstart', onDown, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('wheel', onWheel, true);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [ref]);
}

function RunningSaver({ run }: { run: ScreensaverRun }) {
  const reduced = useReducedMotion();
  const t = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDismiss(rootRef);
  useSaverLoop(canvasRef, run, !reduced);
  return (
    <div
      ref={rootRef}
      className={styles.saver}
      role="dialog"
      aria-modal="true"
      aria-label={t('screensaver.label')}
      tabIndex={-1}
      data-saver={run.id}
      data-reduced={reduced || undefined}
    >
      {reduced ? (
        <p className={styles.still}>{APP_NAME}</p>
      ) : (
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
      )}
    </div>
  );
}

export function Screensaver() {
  const run = useScreensaverStore((s) => s.running);
  return run ? <RunningSaver run={run} /> : null;
}
