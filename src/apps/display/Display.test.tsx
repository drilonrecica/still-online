import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { getBlob } from '@/os/blobStore';
import { useScreensaverPreview } from '@/os/screensaver/store';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { SETTINGS_V02_DEFAULTS } from '@/os/types';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';
import '@/apps/registry';
import Display from './Display';

const initial = useSettingsStore.getState();

function open() {
  const id = useWindowsStore.getState().openApp('display');
  render(<Display windowId={id} props={{}} />);
  return id;
}

const s = () => useSettingsStore.getState();

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState(initial, true);
  useSettingsStore.setState({
    theme: SETTINGS_V02_DEFAULTS.theme,
    screensaver: { ...SETTINGS_V02_DEFAULTS.screensaver },
    wallpaper: SETTINGS_V02_DEFAULTS.wallpaper,
    wallpaperPosition: SETTINGS_V02_DEFAULTS.wallpaperPosition,
  });
  useWorldStore.setState({ ...WORLD_DEFAULTS });
  useScreensaverPreview.getState().stopPreview();
  act(() => useWindowsStore.getState().closeAll());
});

describe('Display Properties', () => {
  it('switches between the four tabs', async () => {
    const user = userEvent.setup();
    open();
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent);
    expect(tabs).toEqual(['Themes', 'Desktop', 'Screen Saver', 'Appearance']);
    expect(screen.getByRole('tab', { name: 'Themes' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: 'Screen Saver' }));
    expect(screen.getByLabelText('Screen saver:')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Appearance' }));
    expect(screen.getByLabelText('Color scheme:')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Desktop' }));
    expect(screen.getByRole('listbox', { name: 'Background' })).toBeVisible();
  });

  it('Apply writes the draft; Apply is disabled until something changed', async () => {
    const user = userEvent.setup();
    open();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await user.click(screen.getByRole('tab', { name: 'Appearance' }));
    await user.selectOptions(screen.getByLabelText('Color scheme:'), 'olive');
    expect(s().theme).toBe('blue');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().theme).toBe('olive');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('Cancel discards and closes the window', async () => {
    const user = userEvent.setup();
    const id = open();
    await user.click(screen.getByRole('option', { name: 'Olive Afternoon' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(s().theme).toBe('blue');
    expect(s().wallpaper).toEqual({ kind: 'builtin', id: 'classic' });
    expect(useWindowsStore.getState().windows.some((w) => w.id === id)).toBe(
      false,
    );
  });

  it('OK applies a theme preset (scheme + wallpaper) and closes', async () => {
    const user = userEvent.setup();
    const id = open();
    await user.click(screen.getByRole('option', { name: 'Silver Night' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(s().theme).toBe('silver');
    expect(s().wallpaper).toEqual({ kind: 'builtin', id: 'orbit' });
    expect(useWindowsStore.getState().windows.some((w) => w.id === id)).toBe(
      false,
    );
  });

  it('lists hidden wallpapers only once unlocked', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('tab', { name: 'Desktop' }));
    expect(screen.queryByRole('option', { name: 'Retro Grid' })).toBeNull();
    act(() => useWorldStore.getState().unlock('konami'));
    expect(screen.getByRole('option', { name: 'Retro Grid' })).toBeVisible();
  });

  it('applies a wallpaper, a position and a solid colour', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('tab', { name: 'Desktop' }));
    await user.click(screen.getByRole('option', { name: 'Blue Ripple' }));
    await user.selectOptions(screen.getByLabelText('Position:'), 'tile');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().wallpaper).toEqual({ kind: 'builtin', id: 'ripple' });
    expect(s().wallpaperPosition).toBe('tile');
    await user.click(screen.getByRole('button', { name: 'Color #ff0000' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().wallpaper).toEqual({ kind: 'color', color: '#ff0000' });
  });

  it('Browse… stores the file in the blob store and applies it as custom', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('tab', { name: 'Desktop' }));
    const file = new File([new Uint8Array([1, 2, 3])], 'me.png', {
      type: 'image/png',
    });
    await user.upload(screen.getByTestId('browse-input'), file);
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: 'Custom image' }),
      ).toBeVisible(),
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    const wp = s().wallpaper;
    expect(wp.kind).toBe('custom');
    if (wp.kind !== 'custom') return;
    const blob = await getBlob(wp.blobKey);
    expect(blob?.size).toBe(3);
  });

  it('an unapplied upload is deleted when the dialog closes', async () => {
    const user = userEvent.setup();
    const { unmount } = (() => {
      const id = useWindowsStore.getState().openApp('display');
      return render(<Display windowId={id} props={{}} />);
    })();
    await user.click(screen.getByRole('tab', { name: 'Desktop' }));
    await user.upload(
      screen.getByTestId('browse-input'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    await screen.findByRole('option', { name: 'Custom image' });
    unmount();
    expect(s().wallpaper.kind).toBe('builtin');
  });

  it('Screen Saver: saver, wait minutes (1–60), marquee text and Preview', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('tab', { name: 'Screen Saver' }));
    expect(screen.getByRole('button', { name: 'Settings…' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Screen saver:'), 'marquee');
    fireEvent.change(screen.getByLabelText('Wait:'), {
      target: { value: '99' },
    });
    expect(screen.getByLabelText('Wait:')).toHaveValue(60);
    await user.click(screen.getByRole('button', { name: 'Settings…' }));
    const text = screen.getByLabelText('Text:');
    await user.clear(text);
    await user.type(text, 'hello');
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(useScreensaverPreview.getState().preview).toEqual({
      id: 'marquee',
      text: 'hello',
    });
    expect(s().screensaver.id).toBe('panes');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().screensaver).toEqual({
      id: 'marquee',
      minutes: 60,
      text: 'hello',
    });
  });
});
