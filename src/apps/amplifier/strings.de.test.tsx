// P1-05: the Amplifier (player, equalizer, playlist, skins, Burn CD) in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaylistTrack } from '@/content/playlist';
import { useSettingsStore } from '@/os/store/settings';
import Amplifier from './Amplifier';
import { useAmplifierStore } from './store';

vi.mock('@/os/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

const track: PlaylistTrack = {
  id: 't0',
  title: 'Song',
  artist: 'Band',
  file: 'music/t0.mp3',
  durationSec: 187,
  license: 'CC BY 4.0',
};

beforeEach(() => {
  useSettingsStore.setState({ language: 'de' });
  act(() =>
    useAmplifierStore.setState({
      playlist: [track],
      index: 0,
      status: 'paused',
      currentTime: 0,
      duration: 187,
      repeat: 'off',
      skin: 'metal',
    }),
  );
});
afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Amplifier in German', () => {
  it('shows German transport, toggle and skin labels', () => {
    render(<Amplifier windowId="w1" props={{}} />);
    expect(screen.getByRole('button', { name: 'Wiedergabe' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stopp' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Zufallswiedergabe' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Wiederholen: aus' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Skin: Gebürstetes Metall' }),
    ).toBeVisible();
    expect(screen.getByText('WDH')).toBeVisible();
    expect(screen.getByText('PAUSE')).toBeInTheDocument();
  });

  it('localizes the equalizer, playlist menus and Burn CD dialog', async () => {
    const user = userEvent.setup();
    render(<Amplifier windowId="w1" props={{}} />);
    await user.click(screen.getByRole('button', { name: 'Equalizer' }));
    expect(screen.getByRole('button', { name: 'Equalizer ein' })).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'Voreinstellungen' }),
    ).toBeVisible();
    expect(screen.getByRole('slider', { name: 'Vorverst.' })).toBeVisible();
    expect(
      screen.getByRole('option', { name: 'Bass-Boost' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Wiedergabeliste' }));
    expect(screen.getByText('1 Titel / 3:07')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /MEHR/ }));
    await user.click(screen.getByRole('menuitem', { name: 'CD brennen…' }));
    const dialog = screen.getByRole('dialog', { name: 'Audio-CD brennen' });
    expect(dialog).toHaveTextContent('52-fach');
    expect(screen.getByRole('button', { name: 'Brennen' })).toBeVisible();
  });
});
