import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAwayMessage,
  getPlayerName,
  screensaverText,
} from '@/i18n/settingsText';
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

describe('language', () => {
  it('defaults to null (detect), sets, and resets to detection', () => {
    expect(initial.language).toBeNull();
    const { setLanguage } = useSettingsStore.getState();
    setLanguage('de');
    expect(useSettingsStore.getState().language).toBe('de');
    setLanguage('fr' as never);
    expect(useSettingsStore.getState().language).toBeNull();
    setLanguage('en');
    setLanguage(null);
    expect(useSettingsStore.getState().language).toBeNull();
  });

  it('persists and restores the choice', async () => {
    useSettingsStore.getState().setLanguage('de');
    const saved = localStorage.getItem(storageKey('settings')) ?? '';
    expect(JSON.parse(saved).state.language).toBe('de');
    useSettingsStore.setState(initial, true);
    localStorage.setItem(storageKey('settings'), saved);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().language).toBe('de');
  });

  it('restores unknown or missing values (v0.2 saves) as null', async () => {
    for (const state of [{ language: 'fr' }, { language: 7 }, {}]) {
      useSettingsStore.setState(initial, true);
      localStorage.setItem(
        storageKey('settings'),
        JSON.stringify({ version: 1, state }),
      );
      await useSettingsStore.persist.rehydrate();
      expect(useSettingsStore.getState().language).toBeNull();
    }
  });
});

describe('localized defaults (playerName, awayMessage, screensaver text)', () => {
  const s = () => useSettingsStore.getState();

  it('start as null and render in the current language', () => {
    useSettingsStore.setState({ language: 'en' });
    expect(s()).toMatchObject({
      playerName: null,
      awayMessage: null,
      screensaver: { text: null },
    });
    expect([getPlayerName(), getAwayMessage()]).toEqual(['Player', 'brb']);
    useSettingsStore.setState({ language: 'de' });
    expect([getPlayerName(), getAwayMessage()]).toEqual([
      'Spieler',
      'bin gleich wieder da',
    ]);
    expect(screensaverText(s().screensaver)).toBe('still online...');
  });

  it("store a value equal to the current language's default as null", () => {
    useSettingsStore.setState({ language: 'de' });
    s().setPlayerName('Spieler');
    s().setAwayMessage('  bin gleich wieder da ');
    s().setScreensaver({ ...s().screensaver, text: 'still online...' });
    expect(s()).toMatchObject({
      playerName: null,
      awayMessage: null,
      screensaver: { text: null },
    });
    s().setPlayerName('Player'); // a real name in German
    s().setAwayMessage('');
    expect(s()).toMatchObject({ playerName: 'Player', awayMessage: '' });
  });

  it('migrate the v0.2 English defaults to null and keep typed values', async () => {
    const restore = async (state: object) => {
      localStorage.setItem(
        storageKey('settings'),
        JSON.stringify({ state, version: 1 }),
      );
      await useSettingsStore.persist.rehydrate();
    };
    await restore({
      playerName: 'Player',
      awayMessage: 'brb',
      screensaver: { id: 'marquee', minutes: 5, text: 'still online...' },
    });
    expect(s()).toMatchObject({
      playerName: null,
      awayMessage: null,
      screensaver: { id: 'marquee', text: null },
    });
    await restore({
      playerName: 'Ada',
      awayMessage: '',
      screensaver: { id: 'marquee', minutes: 5, text: 'hey' },
    });
    expect(s()).toMatchObject({
      playerName: 'Ada',
      awayMessage: '',
      screensaver: { text: 'hey' },
    });
    await restore({ playerName: 3, awayMessage: null });
    expect(s()).toMatchObject({ playerName: 'Ada', awayMessage: null });
  });
});
