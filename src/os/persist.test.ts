import { beforeEach, describe, expect, it } from 'vitest';
import { useNotepadStore } from '@/apps/notepad/store';
import { useSettingsStore } from '@/os/store/settings';
import { createWindowsStore } from '@/os/store/windows';
import { useSessionStore } from '@/os/store/session';
import { setAppResolver, useWindowsStore } from '@/os/store/windows';
import { storageKey } from '@/os/persist';

const app = {
  id: 'notepad' as const,
  title: 'Notepad',
  defaultSize: { w: 400, h: 300 },
  singleInstance: false,
};
const deps = {
  getApp: (id: string) => (id === 'notepad' ? app : undefined),
  getWorkArea: () => ({ w: 1000, h: 700 }),
};
const makeWindows = () => createWindowsStore(deps);

beforeEach(() => localStorage.clear());

describe('settings', () => {
  it('round-trips', async () => {
    useSettingsStore.setState({
      playerName: 'Ann',
      muted: true,
      volume: 0.2,
      firstBootDone: true,
    });
    const saved = JSON.parse(localStorage.getItem(storageKey('settings'))!);
    expect(saved.version).toBe(1);
    useSettingsStore.setState({ playerName: 'x', muted: false, volume: 1 });
    localStorage.setItem(storageKey('settings'), JSON.stringify(saved));
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject({
      playerName: 'Ann',
      muted: true,
      volume: 0.2,
      firstBootDone: true,
    });
  });

  it.each(['{not json', '"str"', '{"state":5,"version":1}', 'null'])(
    'corrupt storage %s falls back to defaults',
    async (raw) => {
      useSettingsStore.setState({ playerName: 'Zed', volume: 0.1 });
      localStorage.setItem(storageKey('settings'), raw);
      await expect(useSettingsStore.persist.rehydrate()).resolves.not.toThrow();
      expect(useSettingsStore.getState().playerName).toBe('Zed');
    },
  );

  it('resets on a version mismatch', async () => {
    localStorage.setItem(
      storageKey('settings'),
      JSON.stringify({ state: { playerName: 'Old', muted: true }, version: 0 }),
    );
    useSettingsStore.setState({ playerName: 'Player', muted: false });
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().playerName).toBe('Player');
    expect(useSettingsStore.getState().muted).toBe(false);
  });

  it('ignores invalid field types', async () => {
    const invalid = JSON.stringify({
      state: { playerName: 7, muted: 'yes', volume: 9 },
      version: 1,
    });
    useSettingsStore.setState({ playerName: 'P', muted: false });
    localStorage.setItem(storageKey('settings'), invalid);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject({
      playerName: 'P',
      muted: false,
      volume: 1,
    });
  });
});

describe('notepad', () => {
  it('round-trips', async () => {
    useNotepadStore.getState().setText('hello');
    const saved = localStorage.getItem(storageKey('notepad'))!;
    useNotepadStore.setState({ text: '' });
    localStorage.setItem(storageKey('notepad'), saved);
    await useNotepadStore.persist.rehydrate();
    expect(useNotepadStore.getState().text).toBe('hello');
  });

  it('survives corrupt JSON', async () => {
    useNotepadStore.setState({ text: 'keep' });
    localStorage.setItem(storageKey('notepad'), '}{');
    await useNotepadStore.persist.rehydrate();
    expect(useNotepadStore.getState().text).toBe('keep');
  });
});

describe('windows', () => {
  it('round-trips and is not hydrated at creation', async () => {
    const a = makeWindows();
    const id = a.getState().openApp('notepad');
    a.getState().moveWindow(id, 100, 80);
    const b = makeWindows();
    expect(b.getState().windows).toEqual([]);
    await b.persist.rehydrate();
    expect(b.getState().windows).toHaveLength(1);
    expect(b.getState().windows[0]).toMatchObject({ id, x: 100, y: 80 });
    expect(b.getState().topZ).toBe(1);
  });

  it('drops unknown apps and malformed windows', async () => {
    localStorage.setItem(
      storageKey('windows'),
      JSON.stringify({
        state: {
          windows: [{ id: 'win-1', appId: 'ghost' }, 42, null],
          topZ: 'x',
        },
        version: 1,
      }),
    );
    const store = makeWindows();
    await store.persist.rehydrate();
    expect(store.getState().windows).toEqual([]);
    expect(store.getState().topZ).toBe(0);
  });

  it('survives corrupt JSON', async () => {
    localStorage.setItem(storageKey('windows'), 'nope');
    const store = makeWindows();
    await expect(store.persist.rehydrate()).resolves.not.toThrow();
    expect(store.getState().windows).toEqual([]);
  });
});

describe('session', () => {
  it('restores windows on log on, not before', () => {
    setAppResolver((id) => deps.getApp(id));
    useWindowsStore.setState({ windows: [], topZ: 0 });
    localStorage.setItem(
      storageKey('windows'),
      JSON.stringify({
        state: {
          windows: [
            {
              id: 'win-1',
              appId: 'notepad',
              title: 'Notepad',
              x: 30,
              y: 30,
              w: 400,
              h: 300,
              z: 1,
              minimized: false,
              maximized: false,
              props: {},
            },
          ],
          topZ: 1,
        },
        version: 1,
      }),
    );
    useSessionStore.setState({ state: 'login' });
    expect(useWindowsStore.getState().windows).toEqual([]);
    useSessionStore.getState().logOn();
    expect(useWindowsStore.getState().windows).toHaveLength(1);
  });
});
