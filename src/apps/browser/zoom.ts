// Fit to screen (v0.6): on a phone, pages lay out at an 800 px virtual width and are scaled
// with CSS `zoom` to the page area's width, like a 2007 mobile browser. See docs/touch.md.
import type { Device } from '@/os/device';

/** The width every page lays out at on a phone, in both Fit to screen and Actual size. */
export const PAGE_VIRTUAL_WIDTH = 800;

/**
 * The `zoom` that makes an 800 px page exactly fill `containerWidth`. Rounded down to 1/1000, so
 * 800 × zoom never runs a fraction past the container and scrolls it sideways. 1 for a container
 * that isn't laid out yet (0, NaN).
 */
export function fitZoom(containerWidth: number): number {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  return Math.floor((containerWidth / PAGE_VIRTUAL_WIDTH) * 1000) / 1000;
}

/** The saved `fitToScreen` choice from untrusted data: a boolean, else absent. */
export const sanitizeFitToScreen = (v: unknown): boolean | undefined =>
  typeof v === 'boolean' ? v : undefined;

/**
 * Whether pages are fitted to the screen. Only a phone fits (its default, until the player picks
 * Actual size); a tablet and a desktop always show pages at their actual size.
 */
export const isFitToScreen = (
  saved: boolean | undefined,
  device: Device,
): boolean => device === 'phone' && (saved ?? true);
