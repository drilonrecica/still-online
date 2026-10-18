// The lazy German chunk. The shared test setup has already loaded German, so these tests take
// fresh module instances (`vi.resetModules`) to see the app as it starts: English only.
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function fresh() {
  const load = await import('./load');
  const { contentFor } = await import('@/content/locale');
  const { translate } = await import('./t');
  const { useSettingsStore } = await import('@/os/store/settings');
  return { ...load, contentFor, translate, useSettingsStore };
}

describe('loadLocale', () => {
  it('serves English until German has loaded, then German', async () => {
    const { isLocaleLoaded, loadLocale, contentFor, translate } = await fresh();
    expect(isLocaleLoaded('en')).toBe(true);
    expect(isLocaleLoaded('de')).toBe(false);
    expect(contentFor('de', 'girl')).toBe(contentFor('en', 'girl'));
    expect(translate('de', 'common.cancel')).toBe('Cancel');

    await loadLocale('de');
    expect(isLocaleLoaded('de')).toBe(true);
    expect(contentFor('de', 'girl')).not.toBe(contentFor('en', 'girl'));
    expect(translate('de', 'common.cancel')).toBe('Abbrechen');
  });

  it('shares one request between concurrent calls', async () => {
    const { loadLocale } = await fresh();
    const a = loadLocale('de');
    expect(loadLocale('de')).toBe(a);
    await a;
  });
});

describe('setLanguage', () => {
  it('switches to an unloaded language only once it has loaded', async () => {
    const { useSettingsStore, isLocaleLoaded } = await fresh();
    useSettingsStore.setState({ language: 'en' });
    useSettingsStore.getState().setLanguage('de');
    expect(useSettingsStore.getState().language).toBe('en');
    await vi.waitFor(() =>
      expect(useSettingsStore.getState().language).toBe('de'),
    );
    expect(isLocaleLoaded('de')).toBe(true);
  });

  it('lets the newest choice win while German is loading', async () => {
    const { useSettingsStore } = await fresh();
    useSettingsStore.setState({ language: 'en' });
    const { setLanguage } = useSettingsStore.getState();
    setLanguage('de');
    setLanguage('en'); // changed their mind before the chunk arrived
    await vi.waitFor(async () => {
      const { isLocaleLoaded } = await import('./load');
      expect(isLocaleLoaded('de')).toBe(true);
    });
    expect(useSettingsStore.getState().language).toBe('en');
  });
});
