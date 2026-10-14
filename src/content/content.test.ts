// Runs the shared text lint over every authored content module as it appears.
import { describe, expect, it } from 'vitest';
import { lintContentStrings } from './lint';

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

describe('content lint: all content modules', () => {
  it('finds content modules', () => {
    expect(shipped.length).toBeGreaterThan(0);
  });

  it.each(shipped)('%s has no text problems', (path, mod) => {
    // Only data exports; skip functions and classes.
    const data = Object.fromEntries(
      Object.entries(mod).filter(([, v]) => typeof v !== 'function'),
    );
    expect(lintContentStrings(data, path)).toEqual([]);
  });
});
