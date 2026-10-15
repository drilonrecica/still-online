// Drives a Star Pinball `Game` at the fixed physics step from requestAnimationFrame and draws
// it, letterboxed into the canvas at device resolution. Without canvas 2D it steps but doesn't draw.
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { buildBackdrop } from './backdrop';
import { VIEW_H, VIEW_W } from './display';
import { drawFrame } from './draw';
import { STEP, drainEvents, step, type Game, type GameEvent } from './sim';
import { useAnimationFrame } from '@/os/useAnimationFrame';

const BACKDROP_SEED = 0x57a2;
/** Most fixed steps per frame (0.1 s), so a stalled tab doesn't fast-forward the ball. */
const MAX_STEPS = 24;

/** Logical view → element px: uniform scale `s` and offsets that centre the view. */
export function viewTransform(w: number, h: number) {
  const s = Math.min(w / VIEW_W, h / VIEW_H) || 1;
  return { s, ox: (w - VIEW_W * s) / 2, oy: (h - VIEW_H * s) / 2 };
}

/** A pointer event's position in logical view pixels. */
export function toView(canvas: HTMLElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const { s, ox, oy } = viewTransform(rect.width, rect.height);
  return {
    x: (clientX - rect.left - ox) / s,
    y: (clientY - rect.top - oy) / s,
  };
}

export interface LoopOptions {
  /** Steps the game. */
  running: boolean;
  /** The menu backdrop: chasing lights and the attract display. */
  attract: boolean;
  /** Blinking and chasing lights (off under reduced motion). */
  motion: boolean;
  /** False while the window is minimized: no frames are scheduled. */
  active: boolean;
  onEvents: (events: GameEvent[]) => void;
}

export function useLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  gameRef: MutableRefObject<Game>,
  opts: LoopOptions,
): void {
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });

  const tickRef = useRef<((time: number, dtMs: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Null in jsdom: the game still runs, it just isn't drawn.
    const ctx = canvas.getContext('2d');
    let backdrop: HTMLCanvasElement | null = null;
    let backdropRes = 0;
    let acc = 0;
    let clock = 0;

    const tick = (_time: number, dtMs: number) => {
      const o = optsRef.current;
      const game = gameRef.current;
      const dt = Math.min(dtMs / 1000, 0.25);
      if (o.motion) clock += dt;

      if (o.running) {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n < MAX_STEPS) {
          step(game, STEP);
          acc -= STEP;
          n++;
        }
        if (n >= MAX_STEPS) acc = 0;
      }
      const events = drainEvents(game);
      if (events.length) o.onEvents(events);

      if (!ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== Math.round(w * dpr))
        canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr))
        canvas.height = Math.round(h * dpr);
      const { s, ox, oy } = viewTransform(w, h);
      const res = s * dpr;
      if (!backdrop || Math.abs(res - backdropRes) > 0.05) {
        backdrop = buildBackdrop(BACKDROP_SEED, res);
        backdropRes = res;
        if (!backdrop) return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#05030f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(res, 0, 0, res, ox * dpr, oy * dpr);
      drawFrame(ctx, game, backdrop, { clock, attract: o.attract });
    };

    tickRef.current = tick;
    return () => {
      tickRef.current = null;
    };
  }, [canvasRef, gameRef]);
  useAnimationFrame((time, dt) => tickRef.current?.(time, dt), opts.active);
}
