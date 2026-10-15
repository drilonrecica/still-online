// The contract every screensaver implements. Drawing only; the overlay owns the canvas, the
// animation loop and input.
import type { PhotoSpec } from '@/os/fs/types';
import type { Rand } from '@/os/random';

/** A picture for My Pictures Slideshow: a procedural photo or a player image in the blob store. */
export type SlideSource =
  { kind: 'photo'; photo: PhotoSpec } | { kind: 'blob'; blobKey: string };

export interface SaverOptions {
  /** Canvas size in CSS pixels. */
  w: number;
  h: number;
  rand: Rand;
  /** Marquee text. */
  text: string;
  /** My Pictures (or built-in samples when it has none). */
  slides: readonly SlideSource[];
}

export interface Saver {
  /** Advances by `dtMs` and draws. The first call gets the cleared, black canvas. */
  frame: (ctx: CanvasRenderingContext2D, dtMs: number) => void;
  /** Releases anything loaded (image bitmaps). */
  dispose?: () => void;
}

export type SaverFactory = (options: SaverOptions) => Saver;
