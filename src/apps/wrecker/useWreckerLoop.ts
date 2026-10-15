// Drives the engine from requestAnimationFrame: paints new marks onto the damage canvas, plays
// sounds, redraws particles and the cursor. Paused while the tab is hidden. Without a 2D context
// (jsdom) the engine still runs, nothing is drawn.
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { playSound } from '@/os/sound';
import { drawCursor } from './cursors';
import type { Mark } from './damage';
import { drawParticles, drawSweep, paintMark } from './draw';
import {
  CURSOR_KICK,
  drain,
  resize,
  sweepX,
  update,
  type Engine,
} from './engine';
import { useAnimationFrame } from '@/os/useAnimationFrame';

/** Marks kept for repainting after a resize (resizing a canvas wipes it). */
const MAX_HISTORY = 6000;

export interface LoopOptions {
  /** Hidden (window minimized): skip drawing. */
  paused: boolean;
  /** Reduced motion: no shake, no cursor wobble. */
  reduced: boolean;
  onShake: () => void;
  /** Repair finished and the damage is gone. */
  onCleared: () => void;
}

/** Matches the canvas backing store to its CSS size; true when it changed (and was wiped). */
function fit(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  dpr: number,
): boolean {
  const bw = Math.round(w * dpr);
  const bh = Math.round(h * dpr);
  if (canvas.width === bw && canvas.height === bh) return false;
  canvas.width = bw;
  canvas.height = bh;
  return true;
}

export function useWreckerLoop(
  damageRef: RefObject<HTMLCanvasElement | null>,
  fxRef: RefObject<HTMLCanvasElement | null>,
  engineRef: MutableRefObject<Engine>,
  opts: LoopOptions,
): void {
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });

  const tickRef = useRef<((time: number, dtMs: number) => void) | null>(null);

  useEffect(() => {
    const damage = damageRef.current;
    const fx = fxRef.current;
    if (!damage || !fx) return;
    const dctx = damage.getContext('2d');
    const fctx = fx.getContext('2d');
    const history: Mark[] = [];
    let clock = 0;

    const tick = (_time: number, dtMs: number) => {
      const o = optsRef.current;
      const e = engineRef.current;
      const dt = Math.min(dtMs / 1000, 0.1);
      if (!o.reduced) clock += dt;

      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== e.w || h !== e.h) resize(e, w, h);
      update(e, dt);
      const out = drain(e);
      for (const name of out.sounds) playSound(name);
      if (out.shake && !o.reduced) o.onShake();
      if (out.cleared) {
        history.length = 0;
        o.onCleared();
      }
      history.push(...out.marks);
      if (history.length > MAX_HISTORY)
        history.splice(0, history.length - MAX_HISTORY);

      if (!dctx || !fctx || o.paused) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const base = [dpr, 0, 0, dpr, 0, 0] as const;

      dctx.setTransform(...base);
      if (fit(damage, w, h, dpr)) {
        dctx.setTransform(...base);
        for (const m of history) paintMark(dctx, m);
      } else {
        for (const m of out.marks) paintMark(dctx, m);
      }
      if (out.cleared) dctx.clearRect(0, 0, w, h);
      const sweep = sweepX(e);
      // The wipe clears everything behind the sweep line as it passes.
      if (sweep !== null) dctx.clearRect(0, 0, sweep, h);

      fit(fx, w, h, dpr);
      fctx.setTransform(...base);
      fctx.clearRect(0, 0, w, h);
      if (sweep !== null) drawSweep(fctx, sweep, h);
      drawParticles(fctx, e.particles);
      if (e.pointer && e.phase !== 'repairing')
        drawCursor(fctx, {
          tool: e.tool,
          x: e.pointer.x,
          y: e.pointer.y,
          held: e.phase === 'using',
          kick: e.kick / CURSOR_KICK,
          clock,
        });
    };

    tickRef.current = tick;
    return () => {
      tickRef.current = null;
    };
  }, [damageRef, fxRef, engineRef]);
  useAnimationFrame((time, dt) => tickRef.current?.(time, dt), !opts.paused);
}
