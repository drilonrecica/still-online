// The open picture: a PixelBuffer (the source of truth), its undo history and the canvas it shows on.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { blitToCanvas } from './codec';
import { createHistory } from './history';
import {
  assignBuffer,
  cloneBuffer,
  createBuffer,
  type PixelBuffer,
} from './pixels';

export const DEFAULT_SIZE = { w: 640, h: 480 } as const;

export interface PaintDocument {
  /** Mutable: tools draw straight into it, then call `redraw`. */
  buf: PixelBuffer;
  size: { w: number; h: number };
  /** Bumps on every committed change (dirty tracking). */
  revision: number;
  /** The latest revision, readable right after a change (before React re-renders). */
  getRevision: () => number;
  canvasRef: RefObject<HTMLCanvasElement>;
  /** Shows the buffer on the canvas on the next frame. */
  redraw: () => void;
  /** A change finished; `before` is the image it started from. */
  commit: (before: PixelBuffer) => void;
  /** New, Open, Attributes: replaces the picture; `fresh` also forgets undo. */
  replace: (next: PixelBuffer, fresh: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function usePaintDocument(): PaintDocument {
  const bufRef = useRef<PixelBuffer>(
    createBuffer(DEFAULT_SIZE.w, DEFAULT_SIZE.h),
  );
  const history = useRef(createHistory<PixelBuffer>());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef<number | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: DEFAULT_SIZE.w,
    h: DEFAULT_SIZE.h,
  });
  const [revision, setRevision] = useState(0);
  const revRef = useRef(0);

  const blitNow = useCallback(() => {
    frame.current = null;
    if (canvasRef.current) blitToCanvas(canvasRef.current, bufRef.current);
  }, []);

  const redraw = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(blitNow);
  }, [blitNow]);

  useEffect(() => {
    blitNow();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [blitNow]);

  const changed = useCallback(() => {
    const { w, h } = bufRef.current;
    setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    revRef.current += 1;
    setRevision(revRef.current);
    blitNow();
  }, [blitNow]);

  const commit = useCallback(
    (before: PixelBuffer) => {
      history.current.push(before);
      changed();
    },
    [changed],
  );

  const replace = useCallback(
    (next: PixelBuffer, fresh: boolean) => {
      if (fresh) history.current.clear();
      else history.current.push(cloneBuffer(bufRef.current));
      assignBuffer(bufRef.current, next);
      changed();
    },
    [changed],
  );

  const step = useCallback(
    (dir: 'undo' | 'redo') => {
      const current = cloneBuffer(bufRef.current);
      const target = history.current[dir](current);
      if (!target) return;
      assignBuffer(bufRef.current, target);
      changed();
    },
    [changed],
  );

  return {
    buf: bufRef.current,
    size,
    revision,
    getRevision: () => revRef.current,
    canvasRef,
    redraw,
    commit,
    replace,
    undo: () => step('undo'),
    redo: () => step('redo'),
    canUndo: history.current.canUndo(),
    canRedo: history.current.canRedo(),
  };
}
