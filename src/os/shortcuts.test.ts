import { describe, expect, it } from 'vitest';
import { DESKTOP_SHORTCUTS, START_PLACES, resolveShortcuts } from './shortcuts';
import '@/apps/registry';

describe('shortcut lists', () => {
  it('every desktop and Start menu shortcut points at a registered app', () => {
    expect(resolveShortcuts(DESKTOP_SHORTCUTS)).toHaveLength(
      DESKTOP_SHORTCUTS.length,
    );
    expect(resolveShortcuts(START_PLACES)).toHaveLength(START_PLACES.length);
  });

  it('puts every game on the desktop', () => {
    const ids = DESKTOP_SHORTCUTS.map((s) => s.appId);
    for (const game of ['mines', 'henhunt', 'pinball', 'wrecker'] as const) {
      expect(ids).toContain(game);
    }
  });

  it('has unique labels and keys', () => {
    const resolved = resolveShortcuts(DESKTOP_SHORTCUTS);
    expect(new Set(resolved.map((s) => s.key)).size).toBe(resolved.length);
    expect(new Set(resolved.map((s) => s.label)).size).toBe(resolved.length);
  });
});
