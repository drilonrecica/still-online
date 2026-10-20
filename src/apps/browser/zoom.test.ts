import { describe, expect, it } from 'vitest';
import { WEB_DEFAULTS, sanitizeWeb } from './store';
import {
  PAGE_VIRTUAL_WIDTH,
  fitZoom,
  isFitToScreen,
  sanitizeFitToScreen,
} from './zoom';

describe('fitZoom', () => {
  it('scales the 800 px page to the container width', () => {
    expect(PAGE_VIRTUAL_WIDTH).toBe(800);
    expect(fitZoom(800)).toBe(1);
    expect(fitZoom(400)).toBe(0.5);
    expect(fitZoom(1000)).toBe(1.25);
  });

  it('rounds down, so the page never runs past the container', () => {
    for (const width of [412, 360, 393, 411, 915, 799, 1]) {
      const zoom = fitZoom(width);
      expect(PAGE_VIRTUAL_WIDTH * zoom).toBeLessThanOrEqual(width);
      expect(PAGE_VIRTUAL_WIDTH * zoom).toBeGreaterThan(width - 1);
    }
    expect(fitZoom(412)).toBe(0.515);
  });

  it('is 1 for a container that is not laid out', () => {
    expect(fitZoom(0)).toBe(1);
    expect(fitZoom(-5)).toBe(1);
    expect(fitZoom(Number.NaN)).toBe(1);
    expect(fitZoom(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('fitToScreen', () => {
  it('fits by default on a phone only; a tablet and a desktop show actual size', () => {
    expect(isFitToScreen(undefined, 'phone')).toBe(true);
    expect(isFitToScreen(false, 'phone')).toBe(false);
    expect(isFitToScreen(true, 'phone')).toBe(true);
    expect(isFitToScreen(undefined, 'tablet')).toBe(false);
    expect(isFitToScreen(true, 'tablet')).toBe(false);
    expect(isFitToScreen(true, 'desktop')).toBe(false);
  });

  it('sanitizes the saved choice to a boolean', () => {
    expect(sanitizeFitToScreen(true)).toBe(true);
    expect(sanitizeFitToScreen(false)).toBe(false);
    for (const bad of ['true', 1, null, {}, []])
      expect(sanitizeFitToScreen(bad)).toBeUndefined();
  });

  it('loads in the web store: kept when valid, absent when missing or corrupt', () => {
    expect(sanitizeWeb({ fitToScreen: false }, WEB_DEFAULTS).fitToScreen).toBe(
      false,
    );
    const v05 = sanitizeWeb({ favorites: [], counters: {} }, WEB_DEFAULTS);
    expect('fitToScreen' in v05).toBe(false);
    const corrupt = sanitizeWeb({ fitToScreen: 'yes' }, WEB_DEFAULTS);
    expect('fitToScreen' in corrupt).toBe(false);
  });
});
