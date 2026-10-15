import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectBrowserLocale, detectLocale } from './detect';

afterEach(() => vi.restoreAllMocks());

describe('detectLocale', () => {
  it('picks German from any German region', () => {
    expect(detectLocale(['de-AT'])).toBe('de');
    expect(detectLocale(['de'])).toBe('de');
    expect(detectLocale(['DE_ch'])).toBe('de');
  });

  it('lets the first supported language win', () => {
    expect(detectLocale(['en-GB', 'de'])).toBe('en');
    expect(detectLocale(['fr', 'de-DE'])).toBe('de');
    expect(detectLocale(['fr', 'it'])).toBe('en');
  });

  it('falls back to English for nothing usable', () => {
    expect(detectLocale([])).toBe('en');
    expect(detectLocale(undefined)).toBe('en');
    expect(detectLocale(null)).toBe('en');
    expect(detectLocale(['', undefined, null])).toBe('en');
  });

  it('reads navigator.languages, else navigator.language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE', 'en']);
    expect(detectBrowserLocale()).toBe('de');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(
      undefined as unknown as readonly string[],
    );
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-AT');
    expect(detectBrowserLocale()).toBe('de');
  });
});
