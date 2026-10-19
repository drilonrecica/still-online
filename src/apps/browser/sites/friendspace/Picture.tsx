// A profile picture: the mirrored 5×5 pattern drawn from a seed. Re-implemented here (sites never
// import Messenger); `seedFrom` is the same FNV-1a hash, so friends look like their Messenger picture.
// The player's picture is their User Accounts tile instead.
import { seedFrom } from '@/os/random';
import type { UserPictureId } from '@/os/user/pictures';
import { userPictureSrc } from '@/os/user/sources';

export function patternCells(seed: string): [number, number][] {
  const bits = seedFrom(seed);
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

/** A friend's, extra's or band's seeded pattern. */
export interface PatternPicture {
  seed: string;
  colors: readonly [string, string];
}

/** A pattern, or the player's User Accounts tile (`userPicture`, `null` = the neutral avatar). */
export type PictureSpec =
  PatternPicture | { userPicture: UserPictureId | null };

export function Picture({
  label,
  size = 96,
  ...spec
}: PictureSpec & { label: string; size?: number }) {
  if ('userPicture' in spec)
    return (
      <img
        src={userPictureSrc(spec.userPicture)}
        width={size}
        height={size}
        alt={label}
        data-picture={spec.userPicture ?? 'none'}
      />
    );
  const [bg, fg] = spec.colors;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true })}
    >
      <rect width="7" height="7" fill={bg} />
      {patternCells(spec.seed).map(([x, y]) => (
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
