// The layout code's `[cursor …]` (P1-03): a trail of small CSS shapes following the pointer inside
// the profile frame only. Throttled, at most `TRAIL_MAX` nodes, and off under reduced motion.
import { useCallback, useRef, useState, type PointerEvent } from 'react';
import type { CursorId } from '@/content/friendspace/layoutSets';
import { useReducedMotion } from '@/os/useReducedMotion';
import styles from './Extras.module.css';

export const TRAIL_MAX = 12;
/** Minimum time between two new trail nodes. */
export const TRAIL_THROTTLE_MS = 40;

interface TrailNode {
  id: number;
  x: number;
  y: number;
}

/** Pointer handlers for the profile frame, and the trail to draw (empty when off). */
export function useCursorTrail(cursor: CursorId | undefined) {
  const reduced = useReducedMotion();
  const on = cursor !== undefined && !reduced;
  const [nodes, setNodes] = useState<TrailNode[]>([]);
  const last = useRef(-Infinity);
  const nextId = useRef(0);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!on) return;
      const t = performance.now();
      if (t - last.current < TRAIL_THROTTLE_MS) return;
      last.current = t;
      const box = e.currentTarget.getBoundingClientRect();
      // Fit to screen zooms the page (v0.6): client px → the page's own CSS px.
      const scale = box.width / e.currentTarget.offsetWidth || 1;
      const node = {
        id: nextId.current++,
        x: ((e.clientX ?? 0) - box.left) / scale,
        y: ((e.clientY ?? 0) - box.top) / scale,
      };
      setNodes((old) => [...old, node].slice(-TRAIL_MAX));
    },
    [on],
  );
  const onPointerLeave = useCallback(() => setNodes([]), []);

  return {
    handlers: on ? { onPointerMove, onPointerLeave } : {},
    trail:
      cursor !== undefined && !reduced && nodes.length > 0
        ? { cursor, nodes }
        : null,
  };
}

export function CursorTrail({
  cursor,
  nodes,
}: {
  cursor: CursorId;
  nodes: readonly TrailNode[];
}) {
  return (
    <div className={styles.trail} aria-hidden data-testid="cursor-trail">
      {nodes.map((n) => (
        <span
          key={n.id}
          className={`${styles.trailNode} ${styles[`trail-${cursor}`] ?? ''}`}
          style={{ left: n.x, top: n.y }}
        />
      ))}
    </div>
  );
}
