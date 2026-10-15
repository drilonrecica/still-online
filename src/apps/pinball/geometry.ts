// Star Pinball collision geometry: every shape answers "closest point to p", so the ball
// collides with all of them the same way (a circle against a point, plus the shape's radius).

export interface Vec {
  x: number;
  y: number;
}

/** A line segment, optionally thick (`r` > 0 makes it a capsule). */
export interface SegmentShape {
  kind: 'segment';
  a: Vec;
  b: Vec;
  r?: number;
  /** One-way: solid only for a ball on the side this normal points to. */
  oneWay?: Vec;
}

/** A circular arc from angle `a0` to `a1` (radians, clockwise on screen, a0 < a1). */
export interface ArcShape {
  kind: 'arc';
  c: Vec;
  radius: number;
  a0: number;
  a1: number;
}

/** A solid disc (bumpers, posts). */
export interface CircleShape {
  kind: 'circle';
  c: Vec;
  radius: number;
}

export type Shape = SegmentShape | ArcShape | CircleShape;

export const vec = (x: number, y: number): Vec => ({ x, y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
export const len = (a: Vec) => Math.hypot(a.x, a.y);

/** The point of segment ab closest to p. */
export function closestOnSegment(p: Vec, a: Vec, b: Vec): Vec {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2));
  return { x: a.x + ab.x * t, y: a.y + ab.y * t };
}

const TAU = Math.PI * 2;

/** `angle` moved into [a0, a0 + 2π). */
function wrapFrom(angle: number, a0: number): number {
  return a0 + ((((angle - a0) % TAU) + TAU) % TAU);
}

/** The point of an arc closest to p (an end point when p is outside the arc's sweep). */
export function closestOnArc(p: Vec, arc: ArcShape): Vec {
  const { c, radius, a0, a1 } = arc;
  const at = (a: number) => ({
    x: c.x + Math.cos(a) * radius,
    y: c.y + Math.sin(a) * radius,
  });
  if (p.x === c.x && p.y === c.y) return at(a0);
  const angle = wrapFrom(Math.atan2(p.y - c.y, p.x - c.x), a0);
  if (angle <= a1) return at(angle);
  // Outside the sweep: whichever end is nearer.
  const e0 = at(a0);
  const e1 = at(a1);
  return len(sub(p, e0)) <= len(sub(p, e1)) ? e0 : e1;
}

/** The closest point on the shape's core (its centre line or centre) and the shape's radius. */
export function closestOnShape(p: Vec, s: Shape): { q: Vec; r: number } {
  switch (s.kind) {
    case 'segment':
      return { q: closestOnSegment(p, s.a, s.b), r: s.r ?? 0 };
    case 'arc':
      return { q: closestOnArc(p, s), r: 0 };
    case 'circle':
      return { q: s.c, r: s.radius };
  }
}

export interface Contact {
  /** Unit normal from the shape towards the ball. */
  n: Vec;
  /** How deep the ball overlaps the shape (> 0). */
  depth: number;
  /** The contact point on the shape's surface. */
  point: Vec;
}

/** Where a ball of radius `br` at `p` touches the shape, or null if it doesn't. */
export function contact(p: Vec, br: number, s: Shape): Contact | null {
  const { q, r } = closestOnShape(p, s);
  const d = sub(p, q);
  const dist = len(d);
  const reach = br + r;
  if (dist >= reach) return null;
  let n: Vec;
  if (dist > 1e-9) n = { x: d.x / dist, y: d.y / dist };
  else if (s.kind === 'segment') {
    // Dead centre on the line: push out along its normal.
    const ab = sub(s.b, s.a);
    const l = len(ab) || 1;
    n = s.oneWay ?? { x: -ab.y / l, y: ab.x / l };
  } else n = { x: 0, y: -1 };
  if (s.kind === 'segment' && s.oneWay) {
    // A one-way wall only stops a ball whose centre is on its solid side.
    const side = dot(sub(p, s.a), s.oneWay);
    if (side < 0) return null;
    n = s.oneWay;
    const depth = reach - side;
    if (depth <= 0) return null;
    return { n, depth, point: q };
  }
  return {
    n,
    depth: reach - dist,
    point: { x: q.x + n.x * r, y: q.y + n.y * r },
  };
}
