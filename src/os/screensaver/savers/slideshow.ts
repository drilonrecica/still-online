// My Pictures Slideshow: fades through the pictures, 6 s each, with a slow Ken Burns pan and zoom.
import { getBlob } from '@/os/blobStore';
import { renderPhoto } from '@/os/fs/photos';
import type { PhotoSpec } from '@/os/fs/types';
import { mulberry32 } from '@/os/random';
import type { Saver, SaverFactory, SlideSource } from './types';

export const SLIDE_MS = 6000;
export const FADE_MS = 1200;

/** Shown when My Pictures has no pictures, like the sample pictures of a fresh install. */
export const SAMPLE_SLIDES: readonly SlideSource[] = (
  [
    { scene: 'beach', seed: 2007 },
    { scene: 'snow', seed: 1201 },
    { scene: 'pet', seed: 77 },
    { scene: 'trip', seed: 31 },
    { scene: 'camp', seed: 614 },
  ] satisfies PhotoSpec[]
).map((photo) => ({ kind: 'photo', photo }));

type Picture = { image: CanvasImageSource; w: number; h: number };

function release(picture: Picture | null) {
  if (
    typeof ImageBitmap !== 'undefined' &&
    picture?.image instanceof ImageBitmap
  )
    picture.image.close();
}

async function load(source: SlideSource): Promise<Picture | null> {
  if (source.kind === 'photo') {
    const canvas = document.createElement('canvas');
    renderPhoto(source.photo, canvas, 960, 720);
    return canvas.getContext('2d') ? { image: canvas, w: 960, h: 720 } : null;
  }
  const blob = await getBlob(source.blobKey);
  if (!blob || typeof createImageBitmap !== 'function') return null;
  const bitmap = await createImageBitmap(blob);
  return { image: bitmap, w: bitmap.width, h: bitmap.height };
}

/** Where slide `index` is `progress` (0–1) of the way through: alpha, zoom and pan offset. */
export function slideFrame(
  index: number,
  localMs: number,
): { alpha: number; zoom: number; panX: number; panY: number } {
  const rand = mulberry32(index * 7919 + 1);
  const progress = Math.min(1, Math.max(0, localMs / SLIDE_MS));
  const zoomIn = rand() < 0.5;
  const zoom = zoomIn ? 1.04 + 0.12 * progress : 1.16 - 0.12 * progress;
  const angle = rand() * Math.PI * 2;
  const reach = 0.04 * (progress - 0.5);
  return {
    alpha: Math.max(
      0,
      Math.min(1, localMs / FADE_MS, (SLIDE_MS - localMs) / FADE_MS),
    ),
    zoom,
    panX: Math.cos(angle) * reach,
    panY: Math.sin(angle) * reach,
  };
}

export const createSlideshow: SaverFactory = ({ w, h, slides }): Saver => {
  const ready: Picture[] = [];
  let disposed = false;
  let clock = 0;
  const sources = slides.length ? slides : SAMPLE_SLIDES;
  // Load in order, one at a time; the show starts as soon as the first picture is in.
  void (async () => {
    for (const source of sources) {
      const picture = await load(source).catch(() => null);
      if (disposed) return release(picture);
      if (picture) ready.push(picture);
    }
  })();

  return {
    frame(ctx, dtMs) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      if (ready.length === 0) return;
      clock += dtMs;
      const index = Math.floor(clock / SLIDE_MS);
      const picture = ready[index % ready.length];
      if (!picture) return;
      const { alpha, zoom, panX, panY } = slideFrame(index, clock % SLIDE_MS);
      // Cover the screen, then zoom and pan.
      const scale = Math.max(w / picture.w, h / picture.h) * zoom;
      const dw = picture.w * scale;
      const dh = picture.h * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        picture.image,
        (w - dw) / 2 + panX * w,
        (h - dh) / 2 + panY * h,
        dw,
        dh,
      );
      ctx.globalAlpha = 1;
    },
    dispose() {
      disposed = true;
      ready.forEach(release);
    },
  };
};
