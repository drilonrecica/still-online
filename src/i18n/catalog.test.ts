// Catalog parity: every locale has exactly the keys of `en`, each string uses the same `{params}`,
// and every function value runs. Never silence this test (see tasks.md → "i18n rules").
import { describe, expect, it } from 'vitest';
import { MESSAGES } from './t';
import { LOCALES } from './types';

type Leaf = string | ((params: object) => string);

/** Every leaf of a catalog by dot path. */
function leaves(catalog: object, prefix = ''): Map<string, Leaf> {
  const out = new Map<string, Leaf>();
  for (const [k, v] of Object.entries(catalog)) {
    const path = `${prefix}${k}`;
    if (typeof v === 'string' || typeof v === 'function') out.set(path, v);
    else if (typeof v === 'object' && v !== null) {
      for (const [p, leaf] of leaves(v, `${path}.`)) out.set(p, leaf);
    } else out.set(path, v as Leaf); // a bad value; reported below
  }
  return out;
}

const tokens = (s: string) =>
  [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

/**
 * Params handed to function values. Any param reads as `2` (a plural-friendly number) unless a
 * key needs a specific shape: add it here.
 */
const SAMPLE_PARAMS: Readonly<Record<string, object>> = {};
const anyParams = new Proxy(
  {},
  { get: (_t, p) => (typeof p === 'string' ? 2 : undefined) },
);

/** Human-readable parity problems between the source catalog and a translation. */
function parityProblems(source: object, target: object): string[] {
  const a = leaves(source);
  const b = leaves(target);
  const problems: string[] = [];
  for (const key of a.keys()) if (!b.has(key)) problems.push(`missing ${key}`);
  for (const key of b.keys()) if (!a.has(key)) problems.push(`extra ${key}`);
  for (const [key, av] of a) {
    const bv = b.get(key);
    if (bv === undefined) continue;
    if (typeof av !== typeof bv) {
      problems.push(`${key}: ${typeof av} vs ${typeof bv}`);
    } else if (typeof av === 'string' && typeof bv === 'string') {
      const at = tokens(av).join(',');
      const bt = tokens(bv).join(',');
      if (at !== bt) problems.push(`${key}: params {${at}} vs {${bt}}`);
    } else {
      for (const [side, fn] of [
        ['source', av],
        ['target', bv],
      ] as const) {
        try {
          const out = (fn as (p: object) => unknown)(
            SAMPLE_PARAMS[key] ?? anyParams,
          );
          if (typeof out !== 'string' || out === '') {
            problems.push(`${key}: ${side} function returned ${String(out)}`);
          }
        } catch (e) {
          problems.push(`${key}: ${side} function threw ${String(e)}`);
        }
      }
    }
  }
  for (const [key, v] of [...a, ...b]) {
    if (typeof v !== 'string' && typeof v !== 'function') {
      problems.push(`${key}: not a string or function`);
    }
  }
  return problems;
}

describe('catalog parity', () => {
  for (const locale of LOCALES.filter((l) => l !== 'en')) {
    it(`${locale} has the keys and params of en`, () => {
      expect(parityProblems(MESSAGES.en, MESSAGES[locale])).toEqual([]);
    });
  }

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      for (const [key, v] of leaves(MESSAGES[locale])) {
        expect(v, `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('catches missing and extra keys, param drift and broken functions', () => {
    const en = {
      a: { hi: 'Hi {name}', bye: 'Bye' },
      n: (p: { n: number }) => `${p.n} files`,
    };
    expect(parityProblems(en, en)).toEqual([]);
    expect(
      parityProblems(en, {
        a: { hi: 'Hallo {nme}', extra: 'x' },
        n: () => {
          throw new Error('boom');
        },
      }),
    ).toEqual([
      'missing a.bye',
      'extra a.extra',
      'a.hi: params {name} vs {nme}',
      'n: target function threw Error: boom',
    ]);
    expect(parityProblems(en, { a: { hi: 'Hallo', bye: 3 }, n: 'x' })).toEqual([
      'a.hi: params {name} vs {}',
      'a.bye: string vs number',
      'n: function vs string',
      'a.bye: not a string or function',
    ]);
  });
});
