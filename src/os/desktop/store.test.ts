import { beforeEach, describe, expect, it } from 'vitest';
import { storageKey } from '@/os/persist';
import { sanitizePositions, useDesktopStore } from './store';

beforeEach(() => {
  localStorage.clear();
  useDesktopStore.setState({ positions: {} });
});

describe('desktop store', () => {
  it('saves a layout and arranges it away', () => {
    useDesktopStore.getState().place({ notepad: { col: 3, row: 2 } });
    expect(useDesktopStore.getState().positions).toEqual({
      notepad: { col: 3, row: 2 },
    });
    expect(localStorage.getItem(storageKey('desktop'))).toContain('notepad');
    useDesktopStore.getState().arrange();
    expect(useDesktopStore.getState().positions).toEqual({});
  });

  it('drops corrupt cells', () => {
    expect(
      sanitizePositions({
        ok: { col: 1, row: 2 },
        negative: { col: -1, row: 0 },
        fraction: { col: 1.5, row: 0 },
        huge: { col: 1, row: 9999 },
        text: { col: '1', row: 0 },
        none: null,
      }),
    ).toEqual({ ok: { col: 1, row: 2 } });
    expect(sanitizePositions('nope')).toEqual({});
  });

  it('restores a saved layout and survives a corrupt save', async () => {
    localStorage.setItem(
      storageKey('desktop'),
      JSON.stringify({
        state: { positions: { mines: { col: 4, row: 0 }, bad: 7 } },
        version: 1,
      }),
    );
    await useDesktopStore.persist.rehydrate();
    expect(useDesktopStore.getState().positions).toEqual({
      mines: { col: 4, row: 0 },
    });
    localStorage.setItem(storageKey('desktop'), '{not json');
    useDesktopStore.setState({ positions: {} });
    await useDesktopStore.persist.rehydrate();
    expect(useDesktopStore.getState().positions).toEqual({});
  });
});
