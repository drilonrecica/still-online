import { describe, expect, it } from 'vitest';
import {
  KICKFLIP_CREW,
  KICKFLIP_GIGS,
  KICKFLIP_VIDEO,
} from '@/content/sites/kickflipkings';
import {
  BUFFER_MAX,
  bestTrickOn,
  bufferAt,
  daysToPremiere,
  viewsOn,
  visibleGigs,
} from './logic';

describe('kickflipkings logic', () => {
  it("Dex's best trick changes once he lands the kickflip on day 4", () => {
    const dex = KICKFLIP_CREW.find((m) => m.handle === 'dex.kickflip')!;
    expect(bestTrickOn(dex, 3)).toMatch(/almost/);
    expect(bestTrickOn(dex, 4)).toMatch(/LANDED\. ask the kid/);
    expect(bestTrickOn(dex, 8)).toMatch(/ask the kid/);
    expect(bestTrickOn(dex, 9)).toMatch(/3rd at the jam/);
    expect(bestTrickOn(dex, 12)).toMatch(/3rd at the jam/);
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

  it('books the next Velvet Lantern show at the rec hall on day 6 and plays it on day 10', () => {
    const next = (day: number) =>
      visibleGigs(KICKFLIP_GIGS, day).find(
        (g) => g.gig.id === 'velvet-lantern-next',
      )!;
    expect(next(5)).toMatchObject({ venue: 'TBA', when: 'soon' });
    expect(next(6).venue).toBe('the westfield rec hall');
    expect(next(6).when).toMatch(/^saturday/);
    expect(next(6).updates).toHaveLength(1);
    expect(next(9).updates).toHaveLength(2);
    expect(next(9).played).toBe(false);
    expect(next(10)).toMatchObject({
      venue: 'the westfield rec hall',
      when: 'played saturday',
      played: true,
      updates: [],
    });
    expect(next(10).note).toMatch(/83 ppl/);
    expect(next(11).played).toBe(true);
  });

  it('shows the view counter from day 6, the newest count out by today', () => {
    expect(viewsOn(KICKFLIP_VIDEO.views, 5)).toBeNull();
    expect(viewsOn(KICKFLIP_VIDEO.views, 6)).toBe(41);
    expect(viewsOn(KICKFLIP_VIDEO.views, 9)).toBe(140);
    expect(viewsOn(KICKFLIP_VIDEO.views, 10)).toBe(212);
    expect(viewsOn(KICKFLIP_VIDEO.views, 15)).toBe(212);
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
