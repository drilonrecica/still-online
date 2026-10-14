// Seeded randomness for everything drawn or simulated in code (photos, wallpapers, games).
// Same seed → same sequence, on every run and every machine.

/** A PRNG returning floats in [0, 1). */
export type Rand = () => number;

/** mulberry32: a small, fast 32-bit generator. Good enough for art and games, not for crypto. */
export function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 32-bit FNV-1a hash of the UTF-16 code units of `text`, as an unsigned seed. */
export function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Integer in [min, max] (inclusive). */
export function randInt(rand: Rand, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/** A random element of a non-empty list. */
export function pick<T>(rand: Rand, items: readonly [T, ...T[]]): T {
  return items[Math.floor(rand() * items.length)] ?? items[0];
}
