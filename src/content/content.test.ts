// Runs the shared text lint over every authored content module as it appears, per locale:
// modules under `de/` (and everything the German accessors return) also get the German rules.
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { lintContact, lintContentStrings } from './lint';
import { contentFor } from './locale';

const modules = import.meta.glob('./**/*.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>;
const shipped = Object.entries(modules).filter(
  ([path]) =>
    !/\.(test|fixture)\.ts$/.test(path) &&
    !/(^|\/)types\.ts$/.test(path) &&
    !/(^|\/)lint\.ts$/.test(path),
);
const localeOf = (path: string) => (path.startsWith('./de/') ? 'de' : 'en');

describe('content lint: all content modules', () => {
  it('finds content modules in both locales', () => {
    expect(shipped.some(([p]) => localeOf(p) === 'en')).toBe(true);
    expect(shipped.some(([p]) => localeOf(p) === 'de')).toBe(true);
  });

  it.each(shipped)('%s has no text problems', (path, mod) => {
    // Only data exports; skip functions and classes.
    const data = Object.fromEntries(
      Object.entries(mod).filter(([, v]) => typeof v !== 'function'),
    );
    expect(lintContentStrings(data, path, localeOf(path))).toEqual([]);
  });
});

describe.each(LOCALES)('content lint: %s accessors', (locale) => {
  const content = contentFor(locale);

  it.each(content.contacts.map((c) => [c.contact.id, c] as const))(
    'contact %s passes all checks',
    (_, c) => {
      expect(lintContact(c, locale)).toEqual([]);
    },
  );

  it('every module passes the text lint', () => {
    // JSON drops the functions (helpers like `newDayBalloonText`).
    const data = JSON.parse(JSON.stringify(content)) as unknown;
    expect(lintContentStrings(data, locale, locale)).toEqual([]);
  });
});
