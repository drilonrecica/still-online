import { describe, expect, expectTypeOf, it } from 'vitest';
import { de } from './messages/de';
import { en } from './messages/en';
import {
  isLocale,
  LOCALES,
  type CatalogArgs,
  type CatalogKey,
  type CatalogShape,
  type CatalogValue,
  type MessageArgs,
  type MessageKey,
  type TemplateParams,
} from './types';

const fixture = {
  a: { plain: 'Hi', greet: 'Hi {name}, {n} new' },
  files: (p: { n: number }) => (p.n === 1 ? '1 file' : `${p.n} files`),
} as const;
type Fixture = typeof fixture;

describe('i18n types', () => {
  it('knows the locales', () => {
    expect(LOCALES).toEqual(['en', 'de']);
    expect(isLocale('de')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it('derives keys, values and args from a catalog', () => {
    expectTypeOf<CatalogKey<Fixture>>().toEqualTypeOf<
      'a.plain' | 'a.greet' | 'files'
    >();
    expectTypeOf<TemplateParams<'Hi {name}, {n} new'>>().toEqualTypeOf<
      'name' | 'n'
    >();
    expectTypeOf<CatalogArgs<CatalogValue<Fixture, 'a.plain'>>>().toEqualTypeOf<
      []
    >();
    expectTypeOf<CatalogArgs<CatalogValue<Fixture, 'a.greet'>>>().toEqualTypeOf<
      [params: Readonly<Record<'name' | 'n', string | number>>]
    >();
    expectTypeOf<CatalogArgs<CatalogValue<Fixture, 'files'>>>().toEqualTypeOf<
      [params: { n: number }]
    >();
    expectTypeOf<CatalogShape<Fixture>['a']['plain']>().toEqualTypeOf<string>();
    expect(fixture.files({ n: 2 })).toBe('2 files');
  });

  it('types the app catalog', () => {
    expectTypeOf<'common.ok'>().toMatchTypeOf<MessageKey>();
    expectTypeOf<MessageArgs<'common.cancel'>>().toEqualTypeOf<[]>();
    expect(Object.keys(de.common).sort()).toEqual(
      Object.keys(en.common).sort(),
    );
  });
});
