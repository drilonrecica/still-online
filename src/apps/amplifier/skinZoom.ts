// Amplifier on a phone (v0.6): the 275 px skin scales to the full-screen window with CSS `zoom`,
// keeping its look. Tap targets stay 36 px on screen, so they shrink in skin pixels as it grows.
import { useLayoutEffect, useState, type RefObject } from 'react';

/** The skin's design width (the desktop window). */
export const SKIN_WIDTH = 275;
/** A tap target on a phone, in screen px. */
export const TAP_PX = 36;
/** Skin height (px) outside the tap rows: LCD, sliders, padding and gaps. */
export const SKIN_FIXED_HEIGHT = 84;
/** The EQ panel without its header row. */
export const EQ_FIXED_HEIGHT = 80;
/** The least room the playlist keeps for its rows. */
export const PLAYLIST_FIXED_HEIGHT = 60;

export interface SkinPanels {
  eq: boolean;
  playlist: boolean;
}

/**
 * The zoom for a window of `width`×`height` screen px: the skin fills the width unless the
 * open panels would then run past the bottom. Tap rows (title bar, two button rows, the EQ
 * header, the playlist footer) are 36 px at any zoom. Never below 1, rounded down to 1/1000.
 */
export function skinZoom(
  width: number,
  height: number,
  panels: SkinPanels,
): number {
  const tapRows = 3 + (panels.eq ? 1 : 0) + (panels.playlist ? 1 : 0);
  const fixed =
    SKIN_FIXED_HEIGHT +
    (panels.eq ? EQ_FIXED_HEIGHT : 0) +
    (panels.playlist ? PLAYLIST_FIXED_HEIGHT : 0);
  const byWidth = width / SKIN_WIDTH;
  const byHeight = (height - tapRows * TAP_PX) / fixed;
  return Math.max(1, Math.floor(Math.min(byWidth, byHeight) * 1000) / 1000);
}

export interface SkinFit {
  zoom: number;
  /** The skin's size in its own (unzoomed) px, so it fills the window exactly. */
  width: number;
  height: number;
}

/** Fits the skin to the element's parent while `enabled`; null otherwise (the desktop). */
export function useSkinFit(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  panels: SkinPanels,
): SkinFit | null {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!enabled || !parent) {
      setSize(null);
      return;
    }
    const measure = () =>
      setSize({ w: parent.clientWidth, h: parent.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [ref, enabled]);
  if (!enabled || !size || size.w === 0 || size.h === 0) return null;
  const zoom = skinZoom(size.w, size.h, panels);
  return { zoom, width: size.w / zoom, height: size.h / zoom };
}
