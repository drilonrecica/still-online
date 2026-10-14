import { describe, expect, it } from 'vitest';
import { mulberry32, pick, randInt, seedFrom } from './random';

describe('mulberry32', () => {
  it('matches the reference sequence for seed 1', () => {
    const rand = mulberry32(1);
    expect(rand()).toBeCloseTo(0.6270739405881613, 15);
    expect(rand()).toBeCloseTo(0.002735721180215478, 15);
    expect(rand()).toBeCloseTo(0.5274470399599522, 15);
  });

  it('is deterministic per seed and differs between seeds', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const seqA = Array.from({ length: 20 }, a);
    expect(Array.from({ length: 20 }, b)).toEqual(seqA);
    expect(Array.from({ length: 20 }, c)).not.toEqual(seqA);
  });

  it('returns floats in [0, 1)', () => {
    const rand = mulberry32(seedFrom('range'));
    for (let i = 0; i < 10_000; i++) {
      const n = rand();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('treats seeds as unsigned 32-bit', () => {
    expect(mulberry32(-1)()).toBe(mulberry32(0xffffffff)());
    expect(mulberry32(2 ** 32 + 5)()).toBe(mulberry32(5)());
  });
});

describe('seedFrom (FNV-1a)', () => {
  it('matches the FNV-1a 32-bit test vectors', () => {
    expect(seedFrom('')).toBe(0x811c9dc5);
    expect(seedFrom('a')).toBe(0xe40c292c);
    expect(seedFrom('foobar')).toBe(0xbf9cf968);
  });

  it('is stable and unsigned', () => {
    expect(seedFrom('summer_camp_2006')).toBe(seedFrom('summer_camp_2006'));
    expect(seedFrom('jess')).not.toBe(seedFrom('kayla'));
    expect(seedFrom('any text at all')).toBeGreaterThanOrEqual(0);
  });
});

describe('helpers', () => {
  it('randInt stays inside the inclusive range and hits both ends', () => {
    const rand = mulberry32(7);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const n = randInt(rand, 1, 6);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
      seen.add(n);
    }
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it('pick returns list elements deterministically', () => {
    const items = ['tent', 'fire', 'tree'] as const;
    const a = mulberry32(3);
    const b = mulberry32(3);
    for (let i = 0; i < 20; i++) {
      const got = pick(a, items);
      expect(items).toContain(got);
      expect(pick(b, items)).toBe(got);
    }
  });
});
