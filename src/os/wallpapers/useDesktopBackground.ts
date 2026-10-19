// The desktop root's background, from `settings.wallpaper` and `wallpaperPosition`.
import { type CSSProperties, useEffect, useState } from 'react';
import { useLocale } from '@/i18n/useT';
import { useBlobUrl } from '@/os/blobStore';
import { useSettingsStore } from '@/os/store/settings';
import type { WallpaperPosition } from '@/os/types';
import { useWorldStore } from '@/os/world';
import { resolveWallpaperId } from './registry';
import { bucketSize, usePaintersReady, wallpaperUrl } from './render';

/** Shown around a centred image, like XP's plain desktop. */
export const DESKTOP_COLOR = '#3a6ea5';
const RESIZE_DEBOUNCE_MS = 250;

export type BackgroundSource =
  { kind: 'image'; url: string } | { kind: 'color'; color: string };

/** Inline styles for the desktop root; undefined keeps the CSS rolling hill from `global.css`. */
export function backgroundStyle(
  source: BackgroundSource | null,
  position: WallpaperPosition,
): CSSProperties | undefined {
  if (!source) return undefined;
  if (source.kind === 'color') {
    return { backgroundImage: 'none', backgroundColor: source.color };
  }
  return {
    backgroundImage: `url("${source.url}")`,
    backgroundColor: DESKTOP_COLOR,
    backgroundRepeat: position === 'tile' ? 'repeat' : 'no-repeat',
    backgroundSize: position === 'stretch' ? '100% 100%' : 'auto',
    backgroundPosition: position === 'tile' ? 'left top' : 'center',
  };
}

function useViewportSize(): { w: number; h: number } {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => setSize({ w: window.innerWidth, h: window.innerHeight }),
        RESIZE_DEBOUNCE_MS,
      );
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return size;
}

export function useDesktopBackground(): CSSProperties | undefined {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const position = useSettingsStore((s) => s.wallpaperPosition);
  const unlocks = useWorldStore((s) => s.unlocks);
  const { w, h } = useViewportSize();
  usePaintersReady();
  // The poster wallpaper is lettered, so a language switch repaints it.
  useLocale();
  const blobUrl = useBlobUrl(
    wallpaper.kind === 'custom' ? wallpaper.blobKey : null,
  );

  let source: BackgroundSource | null;
  if (wallpaper.kind === 'color') {
    source = { kind: 'color', color: wallpaper.color };
  } else if (wallpaper.kind === 'custom') {
    source = blobUrl ? { kind: 'image', url: blobUrl } : null;
  } else {
    // Cached per bucketed size, so this is a map lookup after the first render.
    const url = wallpaperUrl(
      resolveWallpaperId(wallpaper.id, unlocks),
      bucketSize(w),
      bucketSize(h),
    );
    source = url ? { kind: 'image', url } : null;
  }
  return backgroundStyle(source, position);
}
