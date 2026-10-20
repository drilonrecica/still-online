// P1-06: Mines in German.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useDeviceStore } from '@/os/device';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import Mines from './Mines';

beforeEach(() => {
  localStorage.clear();
  useGamesStore.getState().resetScores('mines');
  useSettingsStore.setState({ language: 'de' });
});
afterEach(() => {
  useSettingsStore.setState({ language: 'en' });
  useDeviceStore.setState({ device: 'desktop' });
});

describe('Mines in German', () => {
  it('localizes the menu, levels and field labels', async () => {
    const user = userEvent.setup();
    render(<Mines windowId="w1" props={{}} />);
    expect(screen.getByRole('group', { name: 'Minenfeld' })).toBeVisible();
    expect(
      screen.getByRole('img', { name: 'Verbleibende Minen: 10' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Zeile 1, Spalte 1: verdeckt' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Spiel' }));
    for (const name of [
      'Neu',
      'Anfänger',
      'Fortgeschrittene',
      'Profis',
      'Benutzerdefiniert…',
      'Bestzeiten…',
      'Beenden',
    ])
      expect(screen.getByRole('menuitem', { name })).toBeVisible();
  });

  it('shows the best-times dialog with a localized default name', async () => {
    const user = userEvent.setup();
    render(<Mines windowId="w1" props={{}} />);
    await user.click(screen.getByRole('menuitem', { name: 'Spiel' }));
    await user.click(screen.getByRole('menuitem', { name: 'Bestzeiten…' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Schnellste Minenräumer',
    });
    expect(dialog).toHaveTextContent('Anfänger:');
    expect(dialog).toHaveTextContent('999 Sekunden');
    expect(dialog).toHaveTextContent('Anonym');
    expect(
      screen.getByRole('button', { name: 'Zeiten zurücksetzen' }),
    ).toBeVisible();
  });

  it('names the flag-mode toggle (v0.6)', () => {
    useDeviceStore.setState({ device: 'phone' });
    render(<Mines windowId="w1" props={{}} />);
    expect(screen.getByRole('button', { name: 'Markiermodus' })).toBeVisible();
  });
});
