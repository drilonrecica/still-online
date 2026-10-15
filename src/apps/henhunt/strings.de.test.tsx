// P1-06: Hen Hunt's menu and screens in German; the canvas HUD text comes from `t()`.
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import { t } from '@/i18n/t';
import { drawHud } from './hud';
import { createGame } from './sim';
import type { Ctx } from './scene';
import HenHunt from './HenHunt';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  useGamesStore.getState().resetScores('henhunt');
  useSettingsStore.setState({ language: 'de' });
});
afterEach(() => {
  vi.unstubAllGlobals();
  useSettingsStore.setState({ language: 'en' });
});

describe('Hen Hunt in German', () => {
  it('localizes the menu, help and empty score table', () => {
    render(<HenHunt />);
    expect(screen.getByRole('heading', { name: 'Hühnerjagd' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Spielen' })).toBeVisible();
    expect(screen.getByText(/90 Sekunden\. 8 Patronen/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Hilfe' }));
    expect(screen.getByText(/kostet dich 25 Punkte/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bestenliste' }));
    expect(screen.getByText(/Noch keine Punkte/)).toBeVisible();
  });

  it('draws the HUD text from the catalog and measures it', () => {
    const drawn: string[] = [];
    const ctx = new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (prop === 'measureText')
            return (s: string) => ({ width: s.length * 9 });
          if (prop === 'fillText')
            return (s: string) => {
              drawn.push(s);
            };
          return () => undefined;
        },
        set: () => true,
      },
    ) as unknown as Ctx;
    const g = createGame(1, {});
    g.time = 9;
    g.shells = 0;
    drawHud(ctx, g);
    expect(drawn).toContain('PUNKTE');
    expect(drawn).toContain('Noch 10 Sekunden!');
    expect(drawn).toContain(t('henhunt.hud.reload'));
    expect(t('henhunt.hud.reload')).toBe(
      'Nachladen! (Rechtsklick oder Leertaste)',
    );
  });
});
