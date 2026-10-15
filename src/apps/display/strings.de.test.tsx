// P1-04: Display Properties in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Display from './Display';

beforeEach(() => {
  localStorage.clear();
  act(() => useWindowsStore.getState().closeAll());
  useSettingsStore.setState({ language: 'de' });
});

afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Display Properties in German', () => {
  it('shows German tabs, theme names and screen saver names', async () => {
    const user = userEvent.setup();
    const id = useWindowsStore.getState().openApp('display');
    render(<Display windowId={id} props={{}} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Designs',
      'Desktop',
      'Bildschirmschoner',
      'Darstellung',
    ]);
    expect(
      screen.getByRole('option', { name: 'Silberne Nacht' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Bildschirmschoner' }));
    expect(
      screen.getByRole('option', { name: 'Fliegende Fenster' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Vorschau' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Darstellung' }));
    expect(screen.getByLabelText('Farbschema:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Übernehmen' })).toBeDisabled();
  });
});
