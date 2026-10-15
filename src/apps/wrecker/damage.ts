// Desktop Wrecker damage generators: pure, seeded geometry for every mark a tool leaves.
// Drawing lives in draw.ts; these only decide shapes, so they can be tested without a canvas.
import { randInt, type Rand } from '@/os/random';

export interface Point {
  x: number;
  y: number;
}

export type StampKind = 'tread' | 'boom';

/** A mark painted once onto the damage canvas. Coordinates are CSS px in the viewport. */
export type Mark =
  | { kind: 'crack'; x: number; y: number; lines: Point[][] }
  | { kind: 'cut'; points: Point[] }
  | { kind: 'scorch'; x: number; y: number; r: number }
  | { kind: 'hole'; x: number; y: number; r: number; cracks: Point[][] }
  | { kind: 'stamp'; x: number; y: number; stamp: StampKind; angle: number };

const TAU = Math.PI * 2;

/** One wandering crack line from `start` heading `angle`, `length` px long. */
function crackLine(
  rand: Rand,
  start: Point,
  angle: number,
  length: number,
  depth: number,
  out: Point[][],
): Point[] {
  const line: Point[] = [start];
  let { x, y } = start;
  let a = angle;
  let walked = 0;
  while (walked < length) {
    const step = 7 + rand() * 11;
    a += (rand() - 0.5) * 0.7;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    walked += step;
    line.push({ x, y });
    // Branch off now and then; branches are shorter and may branch once more.
    if (depth < 2 && walked < length * 0.8 && rand() < 0.22) {
      const side = rand() < 0.5 ? -1 : 1;
      crackLine(
        rand,
        { x, y },
        a + side * (0.4 + rand() * 0.6),
        (length - walked) * (0.35 + rand() * 0.4),
        depth + 1,
        out,
      );
    }
  }
  out.push(line);
  return line;
}

/**
 * A hammer hit: 7–11 branching rays out from (x, y) up to `radius` px, plus two broken rings
 * joining neighbouring rays like a spider web.
 */
export function crackPattern(
  rand: Rand,
  x: number,
  y: number,
  radius = 90,
): Point[][] {
  const lines: Point[][] = [];
  const rays = randInt(rand, 7, 11);
  const offset = rand() * TAU;
  const spines: Point[][] = [];
  for (let i = 0; i < rays; i++) {
    const angle = offset + (i / rays) * TAU + (rand() - 0.5) * 0.5;
    const length = radius * (0.5 + rand() * 0.5);
    spines.push(crackLine(rand, { x, y }, angle, length, 0, lines));
  }
  for (const ring of [0.3, 0.6]) {
    for (let i = 0; i < spines.length; i++) {
      if (rand() < 0.3) continue;
      const a = spines[i];
      const b = spines[(i + 1) % spines.length];
      if (!a || !b) continue;
      // Index ≥ 1: every ray starts at the impact point, so index 0 would be a zero chord.
      const pa = a[Math.max(1, Math.floor(ring * (a.length - 1)))];
      const pb = b[Math.max(1, Math.floor(ring * (b.length - 1)))];
      if (!pa || !pb) continue;
      // A slightly sagging chord between the two rays.
      const mid = {
        x: (pa.x + pb.x) / 2 + (rand() - 0.5) * 6,
        y: (pa.y + pb.y) / 2 + (rand() - 0.5) * 6,
      };
      lines.push([pa, mid, pb]);
    }
  }
  return lines;
}

/**
 * A chainsaw cut from `from` to `to`: points every ~5 px, pushed sideways at random so the
 * edge is jagged. It starts and ends exactly on the endpoints, so drags join up.
 */
export function jaggedCut(rand: Rand, from: Point, to: Point): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.round(len / 5));
  const nx = len ? -dy / len : 0;
  const ny = len ? dx / len : 0;
  const points: Point[] = [from];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const off = (rand() - 0.5) * 6;
    points.push({
      x: from.x + dx * t + nx * off,
      y: from.y + dy * t + ny * off,
    });
  }
  points.push(to);
  return points;
}

/** A spot within `radius` of (x, y), denser towards the middle: where a bullet lands. */
export function spreadPoint(
  rand: Rand,
  x: number,
  y: number,
  radius = 22,
): Point {
  const a = rand() * TAU;
  const d = radius * rand() * rand() + radius * 0.15 * rand();
  return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
}

/** A bullet hole: a 3–5 px hole with 3–5 short hairline cracks. */
export function bulletHole(rand: Rand, x: number, y: number): Mark {
  const r = 3 + rand() * 2;
  const cracks: Point[][] = [];
  const n = randInt(rand, 3, 5);
  for (let i = 0; i < n; i++) {
    const a = rand() * TAU;
    const len = r * (2 + rand() * 3);
    const bend = a + (rand() - 0.5) * 0.6;
    const start = { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
    const mid = {
      x: start.x + (Math.cos(a) * len) / 2,
      y: start.y + (Math.sin(a) * len) / 2,
    };
    cracks.push([
      start,
      mid,
      {
        x: mid.x + (Math.cos(bend) * len) / 2,
        y: mid.y + (Math.sin(bend) * len) / 2,
      },
    ]);
  }
  return { kind: 'hole', x, y, r, cracks };
}

/** One puff of scorch under the flamethrower; many of them accumulate into a burn. */
export function scorchPuff(rand: Rand, x: number, y: number): Mark {
  return {
    kind: 'scorch',
    x: x + (rand() - 0.5) * 10,
    y: y + (rand() - 0.5) * 10,
    r: 22 + rand() * 16,
  };
}

/** The `count`-th stamp: tank tread and "BOOM!" alternate, each slightly askew. */
export function stampMark(
  rand: Rand,
  count: number,
  x: number,
  y: number,
): Mark {
  return {
    kind: 'stamp',
    x,
    y,
    stamp: count % 2 === 0 ? 'tread' : 'boom',
    angle: (rand() - 0.5) * 0.5,
  };
}
