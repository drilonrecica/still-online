// Moving pixels between PixelBuffers and the browser: canvas blits, PNG encoding, decoding fs images.
// Every function copes with jsdom, where canvases have no 2D context.
import { getBlob } from '@/os/blobStore';
import { renderPhoto } from '@/os/fs/photos';
import type { FsNode } from '@/os/fs/types';
import { MAX_SIDE, rgbaToHex, type PixelBuffer, type Rgba } from './pixels';

/** Procedural photos open at the size the viewer shows them. */
export const PHOTO_SIZE = { w: 640, h: 480 } as const;

export const TEXT_FONT = "16px Tahoma, Verdana, 'Segoe UI', sans-serif";
export const TEXT_LINE_HEIGHT = 19;

function context(canvas: HTMLCanvasElement) {
  try {
    return canvas.getContext('2d', { willReadFrequently: true });
  } catch {
    return null;
  }
}

function toImageData(buf: PixelBuffer): ImageData | null {
  if (typeof ImageData === 'undefined') return null;
  return new ImageData(new Uint8ClampedArray(buf.data), buf.w, buf.h);
}

/** Draws the whole buffer onto `canvas` (resizing it to match). */
export function blitToCanvas(canvas: HTMLCanvasElement, buf: PixelBuffer) {
  if (canvas.width !== buf.w) canvas.width = buf.w;
  if (canvas.height !== buf.h) canvas.height = buf.h;
  const ctx = context(canvas);
  const image = toImageData(buf);
  if (ctx && image) ctx.putImageData(image, 0, 0);
}

function scratch(buf: PixelBuffer) {
  const canvas = document.createElement('canvas');
  blitToCanvas(canvas, buf);
  return { canvas, ctx: context(canvas) };
}

function readBack(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const data = ctx.getImageData(0, 0, w, h).data;
  return { w, h, data: new Uint8ClampedArray(data) };
}

/** PNG bytes of the image. Rejects without canvas support. */
export function encodePng(buf: PixelBuffer): Promise<Blob> {
  const { canvas, ctx } = scratch(buf);
  return new Promise((resolve, reject) => {
    if (!ctx || typeof canvas.toBlob !== 'function') {
      reject(new Error('paint: no canvas support'));
      return;
    }
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('paint: encode'))),
      'image/png',
    );
  });
}

async function decodeBlob(blob: Blob): Promise<PixelBuffer | null> {
  if (typeof createImageBitmap !== 'function') return null;
  const bitmap = await createImageBitmap(blob);
  // Huge photos are scaled down to fit the largest canvas Attributes allows.
  const scale = Math.min(1, MAX_SIDE / bitmap.width, MAX_SIDE / bitmap.height);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = context(canvas);
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return readBack(ctx, w, h);
}

/** The pixels of an fs image: blob bytes decoded, or a procedural photo rendered. */
export async function decodeImage(node: FsNode): Promise<PixelBuffer | null> {
  if (node.type !== 'image') return null;
  if (node.blobKey) {
    const blob = await getBlob(node.blobKey);
    return blob ? decodeBlob(blob) : null;
  }
  if (node.photo) {
    const canvas = document.createElement('canvas');
    renderPhoto(node.photo, canvas, PHOTO_SIZE.w, PHOTO_SIZE.h);
    const ctx = context(canvas);
    return ctx ? readBack(ctx, PHOTO_SIZE.w, PHOTO_SIZE.h) : null;
  }
  return null;
}

/** The text tool: draws `text` (multi-line) with its top-left at (x, y). False without a canvas. */
export function drawText(
  buf: PixelBuffer,
  text: string,
  x: number,
  y: number,
  color: Rgba,
): boolean {
  const { ctx } = scratch(buf);
  if (!ctx) return false;
  ctx.font = TEXT_FONT;
  ctx.textBaseline = 'top';
  ctx.fillStyle = rgbaToHex(color);
  text.split('\n').forEach((line, i) => {
    ctx.fillText(line, x, y + i * TEXT_LINE_HEIGHT);
  });
  buf.data.set(readBack(ctx, buf.w, buf.h).data);
  return true;
}
