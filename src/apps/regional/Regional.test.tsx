import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import Regional from './Regional';

function setup() {
  const windowId = useWindowsStore.getState().openApp('regional');
  render(<Regional windowId={windowId} props={{}} />);
  return { windowId, user: userEvent.setup() };
}

beforeEach(() => {
  act(() => useWindowsStore.getState().closeAll());
});

describe('Regional and Language Options', () => {
  it('previews the draft language and applies on Apply', async () => {
    const { user } = setup();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Language:'), 'de');
    expect(useSettingsStore.getState().language).toBe('en');
    expect(screen.getByTestId('regional-preview')).toHaveTextContent(
      /Zeit: \d{1,2}:\d{2} · Datum: \d{2}\.\d{2}\.\d{4} · Zahl: 1\.234/,
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(useSettingsStore.getState().language).toBe('de');
    // The dialog re-renders in German without closing.
    expect(screen.getByRole('button', { name: 'Übernehmen' })).toBeDisabled();
    expect(screen.getByLabelText('Sprache:')).toHaveValue('de');
  });

  it('OK applies and closes; Cancel discards', async () => {
    const first = setup();
    await first.user.selectOptions(screen.getByLabelText('Language:'), 'de');
    await first.user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(useSettingsStore.getState().language).toBe('en');
    expect(
      useWindowsStore.getState().windows.some((w) => w.id === first.windowId),
    ).toBe(false);

    const second = setup();
    await second.user.selectOptions(
      screen.getAllByLabelText('Language:').at(-1)!,
      'de',
    );
    await second.user.click(
      screen.getAllByRole('button', { name: 'OK' }).at(-1)!,
    );
    expect(useSettingsStore.getState().language).toBe('de');
    expect(
      useWindowsStore.getState().windows.some((w) => w.id === second.windowId),
    ).toBe(false);
  });

  it('renders German chrome', () => {
    useSettingsStore.setState({ language: 'de' });
    setup();
    expect(screen.getByRole('tab', { name: 'Sprachen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Abbrechen' }),
    ).toBeInTheDocument();
  });

  it('follows a language change made elsewhere (tray menu)', async () => {
    setup();
    act(() => useSettingsStore.getState().setLanguage('de'));
    expect(screen.getByLabelText('Sprache:')).toHaveValue('de');
    expect(screen.getByRole('button', { name: 'Übernehmen' })).toBeDisabled();
  });
});
