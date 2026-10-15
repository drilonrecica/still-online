// Shared by Paint's tests.
import { BLACK, getPixel, type PixelBuffer, type Rgba } from './pixels';

/** Coordinates ("x,y") of every pixel that is exactly `c`. */
export function painted(buf: PixelBuffer, c: Rgba = BLACK): string[] {
  const out: string[] = [];
  for (let y = 0; y < buf.h; y++)
    for (let x = 0; x < buf.w; x++)
      if (getPixel(buf, x, y)?.every((v, i) => v === c[i]))
        out.push(`${x},${y}`);
  return out;
}
