import { beforeEach, describe, expect, it } from 'vitest';
import { useWindowsStore } from '@/os/store/windows';
import { useToastStore } from '@/os/toast/store';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';
import '@/apps/registry';
import { createKonamiMatcher, installKonami } from './konami';

const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

describe('createKonamiMatcher', () => {
  it('fires on the full sequence only', () => {
    const feed = createKonamiMatcher();
    const results = CODE.map((k) => feed(k));
    expect(results.slice(0, -1).every((r) => !r)).toBe(true);
    expect(results.at(-1)).toBe(true);
  });

  it('resets on a wrong key and accepts upper-case B/A', () => {
    const feed = createKonamiMatcher();
    ['ArrowUp', 'ArrowUp', 'x'].forEach((k) => feed(k));
    expect(CODE.map((k) => feed(k.toUpperCase())).at(-1)).toBe(true);
  });

  it('a repeated first key keeps the sequence alive', () => {
    const feed = createKonamiMatcher();
    feed('ArrowUp');
    expect(['ArrowUp', ...CODE].map((k) => feed(k)).at(-1)).toBe(true);
  });
});

describe('installKonami', () => {
  beforeEach(() => {
    useWorldStore.setState({ ...WORLD_DEFAULTS });
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useToastStore.getState().clear();
  });

  const press = (keys: string[]) =>
    keys.forEach((key) =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key })),
    );

  it('unlocks konami and announces it once', () => {
    const off = installKonami();
    press(CODE);
    expect(useWorldStore.getState().unlocks).toContain('konami');
    expect(useToastStore.getState().toasts.map((t) => t.title)).toEqual([
      'Cheat activated!',
    ]);
    press(CODE);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    off();
  });

  it('ignores the code while a window is focused', () => {
    useWindowsStore.getState().openApp('notepad');
    const off = installKonami();
    press(CODE);
    expect(useWorldStore.getState().unlocks).toEqual([]);
    off();
  });
});
