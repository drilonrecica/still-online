import { describe, expect, it } from 'vitest';
import {
  g,
  gendered,
  genderMarkerProblems,
  hasGenderMarkers,
  isGendered,
  resolvedFor,
  resolveGender,
} from './gender';

describe('g()', () => {
  it('writes both sides into one string between markers', () => {
    expect(g('a', 'b')).toBe('ab');
    expect(hasGenderMarkers(g('a', 'b'))).toBe(true);
    expect(hasGenderMarkers('plain')).toBe(false);
  });

  it('works mid-sentence', () => {
    const s = `ur my fave ${g('cousine', 'cousin')}!!`;
    expect(resolveGender(s, 'girl')).toBe('ur my fave cousine!!');
    expect(resolveGender(s, 'boy')).toBe('ur my fave cousin!!');
  });

  it('resolves several variants in one string', () => {
    const s = `${g('die', 'der')} ${g('Beste', 'Beste')} ${g('Heldin', 'Held')}`;
    expect(resolveGender(s, 'girl')).toBe('die Beste Heldin');
    expect(resolveGender(s, 'boy')).toBe('der Beste Held');
  });
});

describe('gendered()', () => {
  it('is branded until resolved', () => {
    const v = gendered({ girl: { hair: 'long' }, boy: { hair: 'short' } });
    expect(isGendered(v)).toBe(true);
    expect(resolveGender(v, 'girl')).toEqual({ hair: 'long' });
    expect(resolveGender(v, 'boy')).toEqual({ hair: 'short' });
  });

  it('resolves strings inside the chosen side', () => {
    const v = gendered({
      girl: { caption: g('x', 'y') },
      boy: { caption: 'z' },
    });
    expect(resolveGender(v, 'girl')).toEqual({ caption: 'x' });
  });
});

describe('resolveGender', () => {
  it('deep-walks objects and arrays', () => {
    const raw = {
      id: 'a',
      n: 3,
      list: ['plain', g('girl', 'boy'), { deep: [g('1', '2')] }],
      spec: gendered({ girl: 1, boy: 2 }),
    };
    expect(resolveGender(raw, 'boy')).toEqual({
      id: 'a',
      n: 3,
      list: ['plain', 'boy', { deep: ['2'] }],
      spec: 2,
    });
  });

  it('keeps identity where nothing changes and never mutates', () => {
    const untouched = { a: ['x', { b: 'y' }] };
    const raw = { untouched, changed: { t: g('g', 'b') } };
    const out = resolveGender(raw, 'girl');
    expect(out).not.toBe(raw);
    expect(out.untouched).toBe(untouched);
    expect(raw.changed.t).toBe(g('g', 'b'));
    expect(resolveGender(untouched, 'boy')).toBe(untouched);
  });

  it('keeps frozen data frozen and leaves functions and class instances alone', () => {
    const fn = () => g('a', 'b');
    const date = new Date(0);
    const raw = Object.freeze({ t: g('a', 'b'), fn, date });
    const out = resolveGender(raw, 'boy');
    expect(Object.isFrozen(out)).toBe(true);
    expect(out.t).toBe('b');
    expect(out.fn).toBe(fn);
    expect(out.date).toBe(date);
  });

  it('copies module-like null-prototype objects', () => {
    const raw = Object.assign(Object.create(null) as Record<string, unknown>, {
      X: g('a', 'b'),
    });
    expect(resolveGender(raw, 'girl')).toEqual({ X: 'a' });
  });
});

describe('resolvedFor (memo)', () => {
  it('resolves once per raw object and gender', () => {
    const raw = { t: g('a', 'b') };
    const girl = resolvedFor(raw, 'girl');
    expect(resolvedFor(raw, 'girl')).toBe(girl);
    expect(resolvedFor(raw, 'boy')).not.toBe(girl);
    expect(resolvedFor(raw, 'boy').t).toBe('b');
    expect(resolvedFor({ t: g('a', 'b') }, 'girl')).not.toBe(girl);
  });
});

describe('genderMarkerProblems', () => {
  it('accepts well-formed text', () => {
    expect(genderMarkerProblems('plain')).toEqual([]);
    expect(genderMarkerProblems(`a ${g('x', 'y')} b ${g('1', '2')}`)).toEqual(
      [],
    );
  });

  it.each([
    ['never closed', 'ab'],
    ['stray split', 'ab'],
    ['stray close', 'a'],
    ['missing split', 'a'],
    ['nested', `${g('a', 'b')}c`],
    ['empty girl side', g('', 'b')],
    ['empty boy side', g('a', '')],
    ['double split', 'abc'],
  ])('flags %s', (_, s) => {
    expect(genderMarkerProblems(s).length).toBeGreaterThan(0);
  });
});
