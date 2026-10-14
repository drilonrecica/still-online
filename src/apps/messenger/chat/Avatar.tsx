// Contact display picture: an authored SVG, or a mirrored 5×5 pattern generated from a seed.
import type { Avatar as AvatarSpec } from '@/content/types';

/** FNV-1a: small, stable string hash. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Filled cells of a left-right mirrored 5×5 grid; the same seed always gives the same cells. */
export function patternCells(seed: string): [number, number][] {
  const bits = hash(seed);
  const cells: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      if (((bits >> (row * 3 + col)) & 1) === 0) continue;
      cells.push([col, row]);
      if (col < 2) cells.push([4 - col, row]);
    }
  }
  return cells;
}

export function Avatar({
  avatar,
  label,
  size = 64,
}: {
  avatar: AvatarSpec;
  label: string;
  size?: number;
}) {
  if (avatar.kind === 'svg')
    return <img src={avatar.src} alt={label} width={size} height={size} />;
  const [bg, fg] = avatar.colors;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width="7" height="7" fill={bg} />
      {patternCells(avatar.seed).map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x + 1}
          y={y + 1}
          width="1"
          height="1"
          fill={fg}
        />
      ))}
    </svg>
  );
}
