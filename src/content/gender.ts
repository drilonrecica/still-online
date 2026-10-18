// Gendered content (docs/gender.md). Content stays plain strings: `g(girl, boy)` writes both
// versions into one string between private-use markers, and `resolveGender` picks a side once,
// in `contentFor(locale, gender)`. The rest of the game only ever sees plain text.
import type { Gender } from '@/os/types';

export const GENDERS = ['girl', 'boy'] as const satisfies readonly Gender[];

const OPEN = '';
const SPLIT = '';
const CLOSE = '';
const MARKERS = /[-]/;
const VARIANT = /([^-]*)([^-]*)/g;

/** Both versions of a text in one string: `` `ur my fave ${g('cousine', 'cousin')}` ``. */
export function g(girl: string, boy: string): string {
  return `${OPEN}${girl}${SPLIT}${boy}${CLOSE}`;
}

/** A non-string value per gender, as `gendered({ girl, boy })` stores it. */
export interface Gendered<T> {
  readonly __gendered: true;
  readonly girl: T;
  readonly boy: T;
}

/**
 * A non-string value per gender (e.g. a `PhotoSpec`). Typed as `T` so it fits any content field;
 * at runtime it is a branded `Gendered<T>` until `resolveGender` picks a side.
 */
export function gendered<T>(sides: { girl: T; boy: T }): T {
  const value: Gendered<T> = {
    __gendered: true,
    girl: sides.girl,
    boy: sides.boy,
  };
  return value as unknown as T;
}

export function isGendered(value: unknown): value is Gendered<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<Gendered<unknown>>).__gendered === true
  );
}

/** True when `s` contains any gender marker (well-formed or not). */
export const hasGenderMarkers = (s: string): boolean => MARKERS.test(s);

/** Malformed variants in `s`: unbalanced or nested markers, or an empty side. */
export function genderMarkerProblems(s: string): string[] {
  if (!hasGenderMarkers(s)) return [];
  const problems: string[] = [];
  let open = false;
  let split = false;
  let side = 0;
  for (const c of s) {
    if (c === OPEN) {
      if (open) problems.push('nested variant');
      open = true;
      split = false;
      side = 0;
    } else if (c === SPLIT) {
      if (!open || split) problems.push('unbalanced variant (stray split)');
      else if (side === 0) problems.push('empty girl side');
      split = true;
      side = 0;
    } else if (c === CLOSE) {
      if (!open || !split) problems.push('unbalanced variant (stray close)');
      else if (side === 0) problems.push('empty boy side');
      open = false;
      split = false;
    } else {
      side++;
    }
  }
  if (open) problems.push('unbalanced variant (never closed)');
  return problems;
}

const isPlain = (value: object): boolean => {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * `value` with every variant resolved for `gender`: markers in strings and `gendered` values
 * are replaced by their side, through plain objects and arrays. Unchanged parts (and values
 * without variants) are returned as they are, so identity survives; inputs are never mutated,
 * and a frozen object that changed comes back as a frozen copy. Functions are left alone.
 */
export function resolveGender<T>(value: T, gender: Gender): T {
  return walk(value, gender) as T;
}

function walk(value: unknown, gender: Gender): unknown {
  if (typeof value === 'string')
    return hasGenderMarkers(value)
      ? value.replace(VARIANT, (_, girl: string, boy: string) =>
          gender === 'girl' ? girl : boy,
        )
      : value;
  if (typeof value !== 'object' || value === null) return value;
  if (isGendered(value)) return walk(value[gender], gender);
  if (Array.isArray(value)) {
    let out: unknown[] | null = null;
    value.forEach((item: unknown, i) => {
      const next = walk(item, gender);
      if (next !== item) (out ??= [...value])[i] = next;
    });
    if (!out) return value;
    return Object.isFrozen(value) ? Object.freeze(out) : out;
  }
  if (!isPlain(value)) return value;
  let out: Record<string, unknown> | null = null;
  for (const [key, item] of Object.entries(value)) {
    const next = walk(item, gender);
    if (next !== item) (out ??= { ...value })[key] = next;
  }
  if (!out) return value;
  return Object.isFrozen(value) ? Object.freeze(out) : out;
}

const memo = new WeakMap<object, Partial<Record<Gender, unknown>>>();

/** `resolveGender`, memoized per raw object and gender (content modules never change). */
export function resolvedFor<T extends object>(raw: T, gender: Gender): T {
  let sides = memo.get(raw);
  if (!sides) memo.set(raw, (sides = {}));
  if (!(gender in sides)) sides[gender] = resolveGender(raw, gender);
  return sides[gender] as T;
}
