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

const SCENERY_SEED = 0x4e4e;
/** Most fixed steps per frame, so a stalled tab doesn't fast-forward the round. */
const MAX_STEPS = 6;

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
  /** Steps the game (false freezes it, e.g. a static menu backdrop). */
  running: boolean;
  hud: boolean;
  /** Screen shake on shots and turning sails. */
  motion: boolean;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Null in jsdom: the game still runs, it just isn't drawn.
    const ctx = canvas.getContext('2d');
    let scenery: Scenery | null = null;
    let sceneryRes = 0;
    let frame = 0;
    let last: number | null = null;
    let acc = 0;
    let sails = 0.4;
    let shake = 0;

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const o = optsRef.current;
      const game = gameRef.current;
      const dt = last === null ? 0 : Math.min((time - last) / 1000, 0.25);
      last = time;

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

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      last = null;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, gameRef]);
}
