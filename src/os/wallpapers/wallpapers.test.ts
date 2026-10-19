import { beforeAll, describe, expect, it } from 'vitest';
import {
  CLASSIC_WALLPAPER_ID,
  getWallpaper,
  listWallpapers,
  resolveWallpaperId,
  WALLPAPERS,
} from './registry';
import {
  bucketSize,
  loadPainters,
  renderWallpaper,
  wallpaperUrl,
} from './render';
import { backgroundStyle, DESKTOP_COLOR } from './useDesktopBackground';
import { CONTENT_UNLOCKS } from '@/content/types';
import { useSettingsStore } from '@/os/store/settings';
import type { WallpaperDef } from './types';

/** A 2D context that records every call and property write. */
function recorder() {
  const log: unknown[] = [];
  const gradient = () => ({
    addColorStop: (...args: unknown[]) => log.push(['addColorStop', ...args]),
  });
  const ctx = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (
          prop === 'createLinearGradient' ||
          prop === 'createRadialGradient'
        ) {
          return (...args: unknown[]) => {
            log.push([prop, ...args]);
            return gradient();
          };
        }
        return (...args: unknown[]) => log.push([String(prop), ...args]);
      },
      set: (_t, prop, value) => {
        log.push([
          'set',
          String(prop),
          typeof value === 'object' ? 'gradient' : value,
        ]);
        return true;
      },
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, log };
}

function draw(def: WallpaperDef, w = 320, h = 200) {
  const { ctx, log } = recorder();
  renderWallpaper(def, ctx, w, h);
  return log;
}

const PAINTED = WALLPAPERS.filter((w) => w.painted);

beforeAll(loadPainters);

describe('wallpaper registry', () => {
  it('has classic plus 9 homages and 3 hidden unlockables', () => {
    expect(WALLPAPERS.map((w) => w.id)).toEqual([
      'classic',
      'hill',
      'ripple',
      'autumn',
      'dunes',
      'stones',
      'tulips',
      'orbit',
      'bloom',
      'peaks',
      'ponies',
      'retro',
      'lantern-poster',
    ]);
    expect(PAINTED).toHaveLength(12);
    expect(getWallpaper(CLASSIC_WALLPAPER_ID)?.painted).toBeUndefined();
    expect(new Set(WALLPAPERS.map((w) => w.nameKey)).size).toBe(
      WALLPAPERS.length,
    );
  });

  it('hides each easter egg behind its unlock', () => {
    const hidden = WALLPAPERS.filter((w) => w.hidden);
    expect(hidden.map((w) => [w.id, w.unlock])).toEqual([
      ['ponies', 'ponies'],
      ['retro', 'konami'],
      ['lantern-poster', 'lantern-poster'],
    ]);
    expect(listWallpapers([]).map((w) => w.id)).not.toContain('retro');
    expect(listWallpapers(['konami']).map((w) => w.id)).toContain('retro');
    expect(listWallpapers(['konami']).map((w) => w.id)).not.toContain('ponies');
  });

  it('falls back to classic for unknown or locked ids', () => {
    expect(resolveWallpaperId('hill', [])).toBe('hill');
    expect(resolveWallpaperId('nope', [])).toBe('classic');
    expect(resolveWallpaperId('ponies', [])).toBe('classic');
    expect(resolveWallpaperId('ponies', ['ponies'])).toBe('ponies');
    expect(resolveWallpaperId('lantern-poster', [])).toBe('classic');
    expect(resolveWallpaperId('lantern-poster', ['lantern-poster'])).toBe(
      'lantern-poster',
    );
  });
});

describe('renderWallpaper', () => {
  it.each(PAINTED.map((w) => [w.id, w] as const))(
    'paints %s deterministically',
    (_id, def) => {
      const a = draw(def);
      expect(a.length).toBeGreaterThan(30);
      expect(a).toEqual(draw(def));
    },
  );

  it('paints each wallpaper differently and scales with the size', () => {
    const logs = PAINTED.map((def) => JSON.stringify(draw(def)));
    expect(new Set(logs).size).toBe(PAINTED.length);
    const hill = getWallpaper('hill');
    if (!hill) throw new Error('missing hill');
    expect(draw(hill, 320, 200)).not.toEqual(draw(hill, 640, 400));
  });

  it('writes the tiny 1337 on the retro grid', () => {
    const retro = getWallpaper('retro');
    if (!retro) throw new Error('missing retro');
    expect(draw(retro)).toContainEqual([
      'fillText',
      '1337',
      expect.any(Number),
      expect.any(Number),
    ]);
  });
});

describe('the lantern poster', () => {
  const poster = () => {
    const def = getWallpaper('lantern-poster');
    if (!def) throw new Error('missing lantern-poster');
    return def;
  };
  /** The single letters the poster hand-letters, joined back into words. */
  const lettering = (log: unknown[]) =>
    log
      .filter(
        (e): e is [string, string] =>
          Array.isArray(e) && e[0] === 'fillText' && e[1] !== 'theo k.',
      )
      .map((e) => e[1])
      // Each letter is drawn twice: its marker outline, then the letter.
      .filter((_, i) => i % 2 === 0)
      .join('');

  it('is unlocked by content and shows its title and venue', () => {
    expect(CONTENT_UNLOCKS).toContain('lantern-poster');
    const text = lettering(draw(poster(), 640, 400));
    expect(text).toContain('VELVET LANTERN');
    expect(text).toContain('· LIVE AT THE REC HALL ·');
  });

  it('letters the venue in German', () => {
    useSettingsStore.setState({ language: 'de' });
    expect(lettering(draw(poster(), 640, 400))).toContain(
      '· LIVE IM JUGENDZENTRUM ·',
    );
  });
});

describe('wallpaperUrl', () => {
  it('returns null without a canvas backend (jsdom) and for classic', () => {
    expect(wallpaperUrl('hill', 1280, 800)).toBeNull();
    expect(wallpaperUrl('classic', 1280, 800)).toBeNull();
    expect(wallpaperUrl('nope', 1280, 800)).toBeNull();
  });

  it('buckets sizes to 256 px, never below one bucket', () => {
    expect(bucketSize(1280)).toBe(1280);
    expect(bucketSize(1366)).toBe(1280);
    expect(bucketSize(1450)).toBe(1536);
    expect(bucketSize(50)).toBe(256);
  });
});

describe('backgroundStyle', () => {
  it('keeps the CSS hill when there is no image', () => {
    expect(backgroundStyle(null, 'stretch')).toBeUndefined();
  });

  it('shows a solid colour', () => {
    expect(
      backgroundStyle({ kind: 'color', color: '#008080' }, 'tile'),
    ).toEqual({
      backgroundImage: 'none',
      backgroundColor: '#008080',
    });
  });

  it('applies the position to an image', () => {
    const source = { kind: 'image', url: 'data:x' } as const;
    expect(backgroundStyle(source, 'stretch')).toMatchObject({
      backgroundImage: 'url("data:x")',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    });
    expect(backgroundStyle(source, 'center')).toMatchObject({
      backgroundSize: 'auto',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundColor: DESKTOP_COLOR,
    });
    expect(backgroundStyle(source, 'tile')).toMatchObject({
      backgroundRepeat: 'repeat',
    });
  });
});
