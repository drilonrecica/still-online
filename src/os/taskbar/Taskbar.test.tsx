import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { useDeviceStore } from '@/os/device';
import { useAttentionStore } from '@/os/store/attention';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import { Taskbar } from './Taskbar';

function state() {
  return useWindowsStore.getState();
}

describe('Taskbar', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useSettingsStore.setState({ muted: false });
    useAttentionStore.setState({ keys: {} });
  });

  it('flashes a window that wants attention, but not while it is active', () => {
    state().openApp('notepad');
    state().openApp('recyclebin'); // active
    useAttentionStore.getState().setAttention('notepad', true);
    useAttentionStore.getState().setAttention('recyclebin', true);
    render(<Taskbar />);
    const notepad = screen.getByRole('button', { name: /Untitled - Notepad/ });
    const bin = screen.getByRole('button', { name: /Recycle Bin/ });
    expect(notepad.getAttribute('data-attention')).toBe('true');
    expect(notepad.getAttribute('title')).toBe('Untitled - Notepad');
    expect(notepad.getAttribute('aria-description')).toBe(
      'wants your attention',
    );
    expect(bin.getAttribute('data-attention')).toBe('false');
  });

  it('keys attention per instance for multi-instance apps', () => {
    state().openApp('messenger-chat', { contactId: 'ann' });
    state().openApp('messenger-chat', { contactId: 'bob' });
    state().openApp('notepad'); // keeps both chats inactive
    useAttentionStore.getState().setAttention('messenger-chat:ann', true);
    const { container } = render(<Taskbar />);
    const flashing = container.querySelectorAll('[data-attention="true"]');
    expect(flashing).toHaveLength(1);

    act(() =>
      useAttentionStore.getState().setAttention('messenger-chat:ann', false),
    );
    expect(container.querySelectorAll('[data-attention="true"]')).toHaveLength(
      0,
    );
  });

  it('shows the start button and one button per open window', () => {
    state().openApp('notepad');
    state().openApp('recyclebin');
    render(<Taskbar />);
    expect(screen.getByRole('button', { name: 'start' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Recycle Bin' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Untitled - Notepad' }),
    ).toBeTruthy();
  });

  it('click on the active button minimizes, click on another focuses', () => {
    const notepad = state().openApp('notepad');
    const bin = state().openApp('recyclebin');
    render(<Taskbar />);
    const notepadBtn = screen.getByRole('button', {
      name: 'Untitled - Notepad',
    });
    const binBtn = screen.getByRole('button', { name: 'Recycle Bin' });
    expect(binBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(notepadBtn);
    expect(state().windows.find((w) => w.id === notepad)?.z).toBeGreaterThan(
      state().windows.find((w) => w.id === bin)?.z ?? 0,
    );
    expect(notepadBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(notepadBtn);
    expect(state().windows.find((w) => w.id === notepad)?.minimized).toBe(true);

    fireEvent.click(notepadBtn);
    expect(state().windows.find((w) => w.id === notepad)?.minimized).toBe(
      false,
    );
  });

  it('clock tooltip shows the year 2007', () => {
    render(<Taskbar />);
    const clock = screen.getByTestId('tray-clock');
    expect(clock.getAttribute('title')).toContain('2007');
    expect(clock.textContent).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it('clock tooltip ends with the day', () => {
    useWorldStore.setState({ day: 3 });
    render(<Taskbar />);
    expect(screen.getByTestId('tray-clock').getAttribute('title')).toMatch(
      / · Day 3$/,
    );
    useWorldStore.setState({ day: 1 });
  });

  it('mute button toggles the setting', () => {
    render(<Taskbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }));
    expect(useSettingsStore.getState().muted).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Unmute sound' }));
    expect(useSettingsStore.getState().muted).toBe(false);
  });

  it('calls onStartClick', () => {
    let clicks = 0;
    render(<Taskbar onStartClick={() => clicks++} />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(clicks).toBe(1);
  });
});

describe('Taskbar on a phone', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useDeviceStore.setState({ device: 'phone' });
  });
  afterEach(() => useDeviceStore.setState({ device: 'desktop' }));

  it('window buttons are icon-only, named and titled by the window', () => {
    state().openApp('notepad');
    render(<Taskbar />);
    const button = screen.getByRole('button', { name: 'Untitled - Notepad' });
    expect(button).toHaveAttribute('title', 'Untitled - Notepad');
    expect(button.textContent).toBe('');
  });

  it('tucks network, Messenger and Fluff behind the chevron', () => {
    render(<Taskbar />);
    expect(screen.getByTestId('tray-language')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mute sound' })).toBeTruthy();
    expect(screen.getByTestId('tray-clock')).toBeInTheDocument();
    expect(screen.queryByTestId('tray-network')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Messenger' })).toBeNull();

    const chevron = screen.getByRole('button', { name: 'Show hidden icons' });
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(chevron);
    const hidden = screen.getByRole('group', { name: 'Show hidden icons' });
    expect(within(hidden).getByTestId('tray-network')).toBeInTheDocument();
    expect(
      within(hidden).getByRole('button', { name: 'Messenger' }),
    ).toBeTruthy();
    expect(
      within(hidden).getByRole('button', { name: 'Desktop sheep' }),
    ).toBeTruthy();

    // Fluff toggles in place; an outside tap folds the icons away.
    fireEvent.click(
      within(hidden).getByRole('button', { name: 'Desktop sheep' }),
    );
    expect(screen.getByTestId('tray-hidden')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByTestId('tray-hidden')).toBeNull();
  });

  it('a window coming to the front closes the flyout', () => {
    render(<Taskbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Show hidden icons' }));
    fireEvent.click(screen.getByRole('button', { name: 'Messenger' }));
    expect(state().windows.map((w) => w.appId)).toEqual(['messenger']);
    expect(screen.queryByTestId('tray-hidden')).toBeNull();
  });

  it('German: „Ausgeblendete Symbole einblenden"', () => {
    useSettingsStore.setState({ language: 'de' });
    render(<Taskbar />);
    expect(
      screen.getByRole('button', { name: 'Ausgeblendete Symbole einblenden' }),
    ).toBeTruthy();
  });
});

describe('Taskbar on a desktop', () => {
  it('keeps every tray icon and the window titles', () => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    state().openApp('notepad');
    render(<Taskbar />);
    expect(
      screen.queryByRole('button', { name: 'Show hidden icons' }),
    ).toBeNull();
    expect(screen.getByTestId('tray-network')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Messenger' })).toBeTruthy();
    expect(screen.getByText('Untitled - Notepad')).toBeInTheDocument();
  });
});
