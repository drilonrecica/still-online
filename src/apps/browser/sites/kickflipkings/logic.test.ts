import { describe, expect, it } from 'vitest';
import { KICKFLIP_CREW, KICKFLIP_GIGS } from '@/content/sites/kickflipkings';
import {
  BUFFER_MAX,
  bestTrickOn,
  bufferAt,
  daysToPremiere,
  visibleGigs,
} from './logic';

describe('kickflipkings logic', () => {
  it("Dex's best trick changes once he lands the kickflip on day 4", () => {
    const dex = KICKFLIP_CREW.find((m) => m.handle === 'dex.kickflip')!;
    expect(bestTrickOn(dex, 3)).toMatch(/almost/);
    expect(bestTrickOn(dex, 4)).toMatch(/LANDED/);
    const kev = KICKFLIP_CREW[0]!;
    expect(bestTrickOn(kev, 5)).toBe(kev.bestTrick);
  });

  it('lists gigs by day, adds updates and reads a played show as played', () => {
    const ids = (day: number) =>
      visibleGigs(KICKFLIP_GIGS, day).map((g) => g.gig.id);
    expect(ids(1)).toEqual(['grip-tapes']);
    expect(ids(2)).toEqual(['grip-tapes', 'velvet-lantern-bean-cellar']);
    const cellar = (day: number) =>
      visibleGigs(KICKFLIP_GIGS, day).find(
        (g) => g.gig.id === 'velvet-lantern-bean-cellar',
      )!;
    expect(cellar(2).updates).toHaveLength(0);
    expect(cellar(4).updates).toHaveLength(2);
    expect(cellar(4).played).toBe(false);
    expect(cellar(5).played).toBe(true);
    expect(cellar(5).note).toMatch(/SOLD OUT/);
    expect(cellar(5).updates).toHaveLength(0);
    expect(ids(5)).toContain('velvet-lantern-next');
  });

  it('counts down to the premiere', () => {
    expect(daysToPremiere(1, 5)).toBe(4);
    expect(daysToPremiere(4, 5)).toBe(1);
    expect(daysToPremiere(7, 5)).toBe(0);
  });

  it('buffering crawls up and sticks at 99%', () => {
    expect(bufferAt(0)).toBe(0);
    let last = 0;
    for (let step = 1; step < 40; step++) {
      const pct = bufferAt(step);
      expect(pct).toBeGreaterThanOrEqual(last);
      last = pct;
    }
    expect(last).toBe(BUFFER_MAX);
  });
});
