import type { Rand } from '@/os/random';

/** Paints a whole wallpaper at `w`×`h`. Must only write to `ctx` (never read it back) and draw
 *  all randomness from `rand`, so the same size gives the same picture every run. */
export type Painter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rand: Rand,
) => void;

export interface WallpaperDef {
  id: string;
  /** Shown in Display Properties. */
  name: string;
  /** Not listed until `unlock` is in the world store's unlocks. */
  hidden?: boolean;
  unlock?: string;
  /** Absent for `classic`, which is the CSS rolling hill in `global.css`. */
  render?: Painter;
}
