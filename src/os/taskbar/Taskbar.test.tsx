import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { useAttentionStore } from '@/os/store/attention';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
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
