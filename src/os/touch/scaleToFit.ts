// Scale-to-fit maths for fixed-size game stages (v0.6). See docs/touch.md.

export interface StageRect {
  left: number;
  top: number;
}

/**
 * The CSS `zoom` that fits a `width`×`height` stage into a `boxW`×`boxH` box, keeping the aspect
 * ratio. `grow: false` never scales above 1. Rounded down to 1/1000 so the zoomed stage never
 * runs a fraction past the box. 1 for a box that isn't laid out yet (0, NaN).
 */
export function fitScale(
  boxW: number,
  boxH: number,
  width: number,
  height: number,
  { grow = true }: { grow?: boolean } = {},
): number {
  if (!(boxW > 0 && boxH > 0 && width > 0 && height > 0)) return 1;
  const s = Math.min(boxW / width, boxH / height);
  return Math.floor((grow ? s : Math.min(1, s)) * 1000) / 1000 || 0.001;
}

/**
 * A pointer's client position → stage pixels. `rect` is the stage's `getBoundingClientRect()`:
 * in Chromium, under CSS `zoom` the rect is in zoomed (on-screen) pixels while `clientX/Y` are
 * screen pixels too, so dividing the offset by the zoom gives unzoomed stage pixels.
 */
export function toStage(
  clientX: number,
  clientY: number,
  rect: StageRect,
  scale: number,
): { x: number; y: number } {
  const s = scale > 0 ? scale : 1;
  return { x: (clientX - rect.left) / s, y: (clientY - rect.top) / s };
}
