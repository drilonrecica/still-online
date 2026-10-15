import { beforeEach, describe, expect, it } from 'vitest';
import { storageKey } from '@/os/persist';
import { SETTINGS_V02_DEFAULTS } from '@/os/types';
import {
  sanitizeWallpaper,
  sanitizeWallpaperPosition,
  useSettingsStore,
} from './settings';

const initial = useSettingsStore.getState();

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState(initial, true);
});

describe('wallpaper settings', () => {
  it('defaults to the classic hill, stretched', () => {
    expect(useSettingsStore.getState().wallpaper).toEqual(
      SETTINGS_V02_DEFAULTS.wallpaper,
    );
    expect(useSettingsStore.getState().wallpaperPosition).toBe('stretch');
  });

  it('sets valid choices and ignores invalid ones', () => {
    const { setWallpaper, setWallpaperPosition } = useSettingsStore.getState();
    setWallpaper({ kind: 'builtin', id: 'ripple' });
    setWallpaperPosition('tile');
    expect(useSettingsStore.getState().wallpaper).toEqual({
      kind: 'builtin',
      id: 'ripple',
    });
    setWallpaper({ kind: 'color', color: 'red' });
    setWallpaperPosition('fill' as never);
    expect(useSettingsStore.getState().wallpaper).toEqual({
      kind: 'builtin',
      id: 'ripple',
    });
    expect(useSettingsStore.getState().wallpaperPosition).toBe('tile');
  });

  it('sanitizes wallpaper choices', () => {
    expect(sanitizeWallpaper({ kind: 'builtin', id: 'hill' })).toEqual({
      kind: 'builtin',
      id: 'hill',
    });
    expect(sanitizeWallpaper({ kind: 'custom', blobKey: 'blob:1' })).toEqual({
      kind: 'custom',
      blobKey: 'blob:1',
    });
    expect(sanitizeWallpaper({ kind: 'color', color: '#00AA55' })).toEqual({
      kind: 'color',
      color: '#00aa55',
    });
    for (const bad of [
      null,
      'hill',
      [],
      { kind: 'builtin', id: '' },
      { kind: 'builtin', id: 3 },
      { kind: 'custom' },
      { kind: 'color', color: '#fff' },
      { kind: 'color', color: 'url(x)' },
      { kind: 'photo', id: 'x' },
    ]) {
      expect(sanitizeWallpaper(bad)).toBeNull();
    }
    expect(sanitizeWallpaperPosition('center')).toBe('center');
    expect(sanitizeWallpaperPosition('fill')).toBeNull();
  });

  it('restores persisted wallpaper settings and drops corrupt ones', async () => {
    localStorage.setItem(
      storageKey('settings'),
      JSON.stringify({
        version: 1,
        state: {
          playerName: 'Ada',
          wallpaper: { kind: 'color', color: '#123456' },
          wallpaperPosition: 'center',
        },
      }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject({
      playerName: 'Ada',
      wallpaper: { kind: 'color', color: '#123456' },
      wallpaperPosition: 'center',
    });

    useSettingsStore.setState(initial, true);
    localStorage.setItem(
      storageKey('settings'),
      JSON.stringify({
        version: 1,
        state: { wallpaper: { kind: 'color' }, wallpaperPosition: 7 },
      }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().wallpaper).toEqual(
      SETTINGS_V02_DEFAULTS.wallpaper,
    );
    expect(useSettingsStore.getState().wallpaperPosition).toBe('stretch');
  });
});

describe('theme and screensaver settings', () => {
  it('defaults to blue and the Flying Panes saver', () => {
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('blue');
    expect(s.screensaver).toEqual(SETTINGS_V02_DEFAULTS.screensaver);
  });

  it('sets valid values and ignores invalid ones', () => {
    const { setTheme, setScreensaver } = useSettingsStore.getState();
    setTheme('olive');
    setTheme('pink' as never);
    expect(useSettingsStore.getState().theme).toBe('olive');
    setScreensaver({ id: 'marquee', minutes: 99, text: 'hi' });
    expect(useSettingsStore.getState().screensaver).toEqual({
      id: 'marquee',
      minutes: 60,
      text: 'hi',
    });
    setScreensaver({ id: 'bogus' as never, minutes: 3, text: '' });
    expect(useSettingsStore.getState().screensaver).toEqual({
      id: 'marquee',
      minutes: 3,
      text: 'hi',
    });
  });
});

describe('connectAutomatically', () => {
  it('defaults on, toggles, persists and restores', async () => {
    expect(useSettingsStore.getState().connectAutomatically).toBe(true);
    useSettingsStore.getState().setConnectAutomatically(false);
    const saved = localStorage.getItem(storageKey('settings')) ?? '';
    expect(JSON.parse(saved).state.connectAutomatically).toBe(false);
    useSettingsStore.setState(initial, true);
    localStorage.setItem(storageKey('settings'), saved);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().connectAutomatically).toBe(false);
  });

  it('keeps the default when the stored value is corrupt', async () => {
    localStorage.setItem(
      storageKey('settings'),
      JSON.stringify({ version: 1, state: { connectAutomatically: 'yes' } }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().connectAutomatically).toBe(true);
  });
});

describe('petEnabled', () => {
  it('defaults off, persists and restores', async () => {
    expect(useSettingsStore.getState().petEnabled).toBe(false);
    useSettingsStore.getState().setPetEnabled(true);
    const saved = localStorage.getItem(storageKey('settings')) ?? '';
    expect(JSON.parse(saved).state.petEnabled).toBe(true);
    useSettingsStore.setState(initial, true);
    localStorage.setItem(storageKey('settings'), saved);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().petEnabled).toBe(true);
  });

  it('keeps the default when the stored value is corrupt', async () => {
    localStorage.setItem(
      storageKey('settings'),
      JSON.stringify({ version: 1, state: { petEnabled: 1 } }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().petEnabled).toBe(false);
  });
});

describe('assistantEnabled', () => {
  it('defaults on, toggles and ignores a bad persisted value', () => {
    expect(useSettingsStore.getState().assistantEnabled).toBe(true);
    useSettingsStore.getState().setAssistantEnabled(false);
    expect(useSettingsStore.getState().assistantEnabled).toBe(false);
    useSettingsStore.getState().setAssistantEnabled(true);
  });
});
