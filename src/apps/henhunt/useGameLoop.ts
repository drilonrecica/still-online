// Drives a Hen Hunt `Game` with a fixed-timestep requestAnimationFrame loop and draws it,
// letterboxed into the canvas at device resolution. Without canvas 2D it steps but doesn't draw.
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { drawFrame } from './draw';
import { VIEW_H, VIEW_W } from './layout';
import { buildScenery, type Scenery } from './scene';
import { STEP, drainEvents, step, type Game, type GameEvent } from './sim';
import { toStage } from '@/os/touch/scaleToFit';
import { useAnimationFrame } from '@/os/useAnimationFrame';

const SCENERY_SEED = 0x4e4e;
/** Most fixed steps per frame, so a stalled tab doesn't fast-forward the round. */
const MAX_STEPS = 6;

/** Logical view → element px: uniform scale `s` and offsets that centre the view. */
export function viewTransform(w: number, h: number) {
  const s = Math.min(w / VIEW_W, h / VIEW_H) || 1;
  return { s, ox: (w - VIEW_W * s) / 2, oy: (h - VIEW_H * s) / 2 };
}

/**
 * A pointer event's position in logical view pixels. The rect is on-screen pixels, also under a
 * `ScaleToFit` zoom, so the letterbox scale already includes the zoom.
 */
export function toView(canvas: HTMLElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const { s, ox, oy } = viewTransform(rect.width, rect.height);
  return toStage(clientX - ox, clientY - oy, rect, s);
}

export interface LoopOptions {
  /** Steps the game (false freezes it, e.g. a static menu backdrop). */
  running: boolean;
  hud: boolean;
  /** Screen shake on shots and turning sails. */
  motion: boolean;
  /** False while the window is minimized: no frames are scheduled. */
  active: boolean;
  onEvents: (events: GameEvent[]) => void;
}

export function useGameLoop(
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
    let scenery: Scenery | null = null;
    let sceneryRes = 0;
    let acc = 0;
    let sails = 0.4;
    let shake = 0;

    const tick = (_time: number, dtMs: number) => {
      const o = optsRef.current;
      const game = gameRef.current;
      const dt = Math.min(dtMs / 1000, 0.25);

      if (o.running) {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n++ < MAX_STEPS) {
          step(game, STEP);
          acc -= STEP;
        }
        if (n > MAX_STEPS) acc = 0;
      }
      const events = drainEvents(game);
      if (events.some((e) => e.type === 'shot') && o.motion) shake = 0.14;
      if (events.length) o.onEvents(events);
      if (o.motion && o.running) sails += dt * 0.6;
      shake = Math.max(0, shake - dt);

      if (!ctx) return;
      // Match the backing store to the element at device resolution.
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
      if (!scenery || Math.abs(res - sceneryRes) > 0.05) {
        scenery = buildScenery(SCENERY_SEED, res);
        sceneryRes = res;
        if (!scenery) return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const jx = shake > 0 ? (Math.random() - 0.5) * 8 * (shake / 0.14) : 0;
      const jy = shake > 0 ? (Math.random() - 0.5) * 8 * (shake / 0.14) : 0;
      ctx.setTransform(res, 0, 0, res, ox * dpr + jx, oy * dpr + jy);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VIEW_W, VIEW_H);
      ctx.clip();
      drawFrame(ctx, game, scenery, { sails, hud: o.hud });
      ctx.restore();
    };

    tickRef.current = tick;
    return () => {
      tickRef.current = null;
    };
  }, [canvasRef, gameRef]);
  useAnimationFrame((time, dt) => tickRef.current?.(time, dt), opts.active);
}
