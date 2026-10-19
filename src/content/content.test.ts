// Runs the shared text lint over every authored content module as it appears, per locale:
// modules under `de/` (and everything the German accessors return) also get the German rules.
// Raw modules are linted as authored (gender variants must be well-formed); the accessors are
// linted resolved, for a girl and for a boy.
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { GENDERS } from './gender';
import { lintContact, lintContentStrings } from './lint';
import { lintSocial } from './lintSocial';
import { contentFor } from './locale';

const modules = import.meta.glob('./**/*.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>;
const shipped = Object.entries(modules).filter(
  ([path]) =>
    !/\.(test|fixture)\.ts$/.test(path) &&
    !/(^|\/)types\.ts$/.test(path) &&
    !/(^|\/)lint\.ts$/.test(path) &&
    // Re-exports the modules linted here, plus the UI catalog (which names real products in
    // the About disclaimer on purpose).
    path !== './de/bundle.ts',
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

const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);

describe.each(COMBOS)(
  'content lint: %s accessors for a %s',
  (locale, gender) => {
    const content = contentFor(locale, gender);

    it.each(content.contacts.map((c) => [c.contact.id, c] as const))(
      'contact %s passes all checks',
      (_, c) => {
        expect(lintContact(c, locale)).toEqual([]);
      },
    );

    it('v0.4 content resolves (ids, days 1–5, layout sets)', () => {
      expect(lintSocial(content)).toEqual([]);
    });

    it('every module passes the text lint', () => {
      // JSON drops the functions (helpers like `newDayBalloonText`).
      const data = JSON.parse(JSON.stringify(content)) as unknown;
      expect(lintContentStrings(data, locale, locale)).toEqual([]);
    });
  },
);
