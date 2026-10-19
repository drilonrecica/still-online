import { describe, expect, it } from 'vitest';
import { photoDateStamp, renderPhoto } from './photos';
import type { PhotoScene, PhotoSpec } from './types';

const SCENES: PhotoScene[] = [
  'camp',
  'pet',
  'trip',
  'party',
  'beach',
  'snow',
  'concert',
  'selfportrait',
  'skatepark',
  'lanparty',
  'ramp',
];

/** A canvas whose 2D context records every call and property write. */
function recordingCanvas() {
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
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  return { canvas: canvas as unknown as HTMLCanvasElement, log };
}

function draw(spec: PhotoSpec) {
  const { canvas, log } = recordingCanvas();
  renderPhoto(spec, canvas, 160, 120);
  return { canvas, log };
}

describe('renderPhoto', () => {
  it.each(SCENES)('draws %s deterministically', (scene) => {
    const a = draw({ scene, seed: 42 });
    const b = draw({ scene, seed: 42 });
    expect(a.log.length).toBeGreaterThan(20);
    expect(a.log).toEqual(b.log);
    expect(a.log).toContainEqual([
      'fillText',
      photoDateStamp(42),
      expect.any(Number),
      expect.any(Number),
    ]);
    expect([a.canvas.width, a.canvas.height]).toEqual([160, 120]);
  });

  it('draws different photos for different seeds and scenes', () => {
    expect(draw({ scene: 'party', seed: 1 }).log).not.toEqual(
      draw({ scene: 'party', seed: 2 }).log,
    );
    expect(draw({ scene: 'camp', seed: 1 }).log).not.toEqual(
      draw({ scene: 'snow', seed: 1 }).log,
    );
  });

  it('draws the self-portrait with long hair, short hair, or the v0.3 hair', () => {
    const long = draw({ scene: 'selfportrait', seed: 3000, look: 'long' }).log;
    const short = draw({
      scene: 'selfportrait',
      seed: 3000,
      look: 'short',
    }).log;
    const none = draw({ scene: 'selfportrait', seed: 3000 }).log;
    expect(long).not.toEqual(short);
    expect(long).not.toEqual(none);
    expect(short).not.toEqual(none);
    expect(
      draw({ scene: 'selfportrait', seed: 3000, look: 'short' }).log,
    ).toEqual(short);
  });

  it('gives a girl a pink mouth and a boy the plain line colour', () => {
    const fills = (look: 'long' | 'short') =>
      draw({ scene: 'selfportrait', seed: 3000, look }).log.filter(
        (e) => Array.isArray(e) && e[0] === 'set' && e[1] === 'fillStyle',
      );
    expect(fills('long')).toContainEqual(['set', 'fillStyle', '#a04040']);
    expect(fills('short')).not.toContainEqual(['set', 'fillStyle', '#a04040']);
  });

  it('draws the boy scenes differently per seed', () => {
    for (const scene of ['skatepark', 'lanparty', 'ramp'] as const) {
      expect(draw({ scene, seed: 1 }).log, scene).not.toEqual(
        draw({ scene, seed: 2 }).log,
      );
    }
  });

  it('does nothing without a 2D context (jsdom)', () => {
    const canvas = document.createElement('canvas');
    expect(() =>
      renderPhoto({ scene: 'beach', seed: 3 }, canvas, 64, 48),
    ).not.toThrow();
    expect([canvas.width, canvas.height]).toEqual([64, 48]);
  });

  it("stamps a 2006/2007 date like '07 6 14", () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(photoDateStamp(seed)).toMatch(
        /^'0[67] ([1-9]|1[0-2]) ([1-9]|1\d|2[0-8])$/,
      );
    }
    expect(photoDateStamp(9)).toBe(photoDateStamp(9));
  });
});
