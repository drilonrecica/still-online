import { describe, expect, it } from 'vitest';
import { skinZoom, SKIN_WIDTH, TAP_PX } from './skinZoom';

const none = { eq: false, playlist: false };

describe('skinZoom', () => {
  it('scales the skin to the width of a portrait phone', () => {
    expect(skinZoom(412, 800, none)).toBe(1.498);
    expect(skinZoom(360, 600, { eq: true, playlist: true })).toBe(1.309);
  });

  it('is limited by the height when the panels would run past the bottom', () => {
    // Landscape 915×372: the width alone would be ×3.3.
    const z = skinZoom(915, 372, none);
    expect(z).toBeLessThan(915 / SKIN_WIDTH);
    expect(z).toBe(3.142);
    expect(skinZoom(915, 372, { eq: false, playlist: true })).toBeLessThan(z);
  });

  it('never shrinks the skin below its own size', () => {
    expect(skinZoom(915, 372, { eq: true, playlist: true })).toBe(1);
    expect(skinZoom(200, 800, none)).toBe(1);
  });

  it('keeps a 36 px tap target at least 18 skin px (the desktop button) up to ×2', () => {
    expect(TAP_PX / skinZoom(550, 900, none)).toBe(18);
  });
});
