import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { getLocale, interpolate, renderMessage, t, translate } from './t';

afterEach(() => vi.restoreAllMocks());

const fixture = {
  a: { plain: 'Hi', greet: 'Hi {name}, {n} new', twice: '{x}+{x}' },
  files: (p: { n: number }) => (p.n === 1 ? '1 file' : `${p.n} files`),
} as const;

describe('interpolate / renderMessage', () => {
  it('replaces every {param} token', () => {
    expect(interpolate('Hi {name}, {n} new', { name: 'Ada', n: 3 })).toBe(
      'Hi Ada, 3 new',
    );
    expect(renderMessage(fixture, 'a.twice', { x: 1 })).toBe('1+1');
    expect(renderMessage(fixture, 'a.plain')).toBe('Hi');
  });

  it('leaves a token visible when its param is missing', () => {
    expect(renderMessage(fixture, 'a.greet', { name: 'Ada' })).toBe(
      'Hi Ada, {n} new',
    );
    expect(renderMessage(fixture, 'a.greet')).toBe('Hi {name}, {n} new');
    // Inherited properties are not params.
    expect(interpolate('{toString}', {})).toBe('{toString}');
  });

  it('passes the params object to function values', () => {
    expect(renderMessage(fixture, 'files', { n: 1 })).toBe('1 file');
    expect(renderMessage(fixture, 'files', { n: 4 })).toBe('4 files');
  });

  it('returns undefined for paths that are not leaves', () => {
    expect(renderMessage(fixture, 'a')).toBeUndefined();
    expect(renderMessage(fixture, 'a.nope')).toBeUndefined();
    expect(renderMessage(fixture, 'a.plain.deeper')).toBeUndefined();
    expect(renderMessage(fixture, 'zzz.x')).toBeUndefined();
  });
});

describe('t', () => {
  it('is pinned to English in unit tests', () => {
    expect(useSettingsStore.getState().language).toBe('en');
    expect(getLocale()).toBe('en');
    expect(t('common.cancel')).toBe('Cancel');
  });

  it('follows the language on every call', () => {
    useSettingsStore.getState().setLanguage('de');
    expect(t('common.cancel')).toBe('Abbrechen');
    expect(t('common.close')).toBe('Schließen');
    useSettingsStore.getState().setLanguage('en');
    expect(t('common.cancel')).toBe('Cancel');
  });

  it('detects the locale while none is chosen', () => {
    useSettingsStore.setState({ language: null });
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-CH']);
    expect(getLocale()).toBe('de');
    expect(t('common.yes')).toBe('Ja');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR']);
    expect(getLocale()).toBe('en');
  });

  it('translates for an explicit locale and never throws on a stale key', () => {
    expect(translate('de', 'common.apply')).toBe('Übernehmen');
    expect(translate('en', 'common.apply')).toBe('Apply');
    // A key that isn't in the catalog (e.g. from an old save) renders as itself.
    expect(t('gone.away' as 'common.ok')).toBe('gone.away');
  });

  it('type-checks keys and params', () => {
    // @ts-expect-error unknown key
    expect(t('common.nope')).toBe('common.nope');
    // @ts-expect-error plain strings take no params
    expect(t('common.ok', { x: 1 })).toBe('OK');
  });
});
