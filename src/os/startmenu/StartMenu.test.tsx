import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { Taskbar } from '@/os/taskbar/Taskbar';
import { OffScreen } from './OffScreen';
import { StartMenu } from './StartMenu';

function Shell() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <StartMenu open={open} onClose={() => setOpen(false)} />
      <Taskbar startOpen={open} onStartClick={() => setOpen((o) => !o)} />
    </>
  );
}

const menu = () => screen.queryByRole('menu', { name: 'Start menu' });

describe('StartMenu', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useSessionStore.setState({ state: 'desktop' });
    useSettingsStore.setState({ playerName: 'Player' });
  });

  it('opens and closes with the Start button', () => {
    render(<Shell />);
    expect(menu()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(menu()).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(menu()).toBeNull();
  });

  it('shows the player name and data-driven app lists', () => {
    useSettingsStore.setState({ playerName: 'Ada' });
    render(<StartMenu open onClose={() => {}} />);
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Notepad' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'My Computer' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Recycle Bin' })).toBeTruthy();
  });

  it('launching an app opens it and closes the menu', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'My Computer' }));
    expect(useWindowsStore.getState().windows.map((w) => w.appId)).toEqual([
      'mycomputer',
    ]);
    expect(menu()).toBeNull();
  });

  it('Escape closes the menu', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu()).toBeNull();
  });

  it('outside click closes the menu', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    fireEvent.pointerDown(document.body);
    expect(menu()).toBeNull();
  });

  it('arrow keys move focus between entries', () => {
    render(<StartMenu open onClose={() => {}} />);
    const first = screen.getAllByRole('menuitem')[0];
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getAllByRole('menuitem')[1]);
  });

  it('Log Off returns to login and closes windows', () => {
    useWindowsStore.getState().openApp('notepad');
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Log Off' }));
    expect(useSessionStore.getState().state).toBe('login');
    expect(useWindowsStore.getState().windows).toEqual([]);
    expect(menu()).toBeNull();
  });

  it('Turn Off Computer shuts down; the off screen powers back on', () => {
    useWindowsStore.getState().openApp('notepad');
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Turn Off Computer' }),
    );
    expect(useSessionStore.getState().state).toBe('shuttingDown');
    expect(useWindowsStore.getState().windows).toEqual([]);

    useSessionStore.getState().shutdownComplete();
    expect(useSessionStore.getState().state).toBe('off');
    render(<OffScreen />);
    expect(
      screen.getByText('It is now safe to turn off your computer.'),
    ).toBeTruthy();
    fireEvent.click(screen.getByTestId('off-screen'));
    expect(useSessionStore.getState().state).toBe('booting');
  });

  describe('All Programs', () => {
    const open = () => {
      render(<StartMenu open onClose={() => {}} />);
      fireEvent.click(screen.getByRole('menuitem', { name: /All Programs/ }));
    };

    afterEach(() => vi.useRealTimers());

    it('pinned apps fill the left column; non-pinned stay in the flyout', () => {
      render(<StartMenu open onClose={() => {}} />);
      expect(screen.getByRole('menuitem', { name: 'Amplifier' })).toBeTruthy();
      expect(screen.getByRole('menuitem', { name: 'Messenger' })).toBeTruthy();
      expect(screen.queryByRole('menu', { name: 'All Programs' })).toBeNull();
    });

    it('click opens the flyout with only non-empty categories', () => {
      open();
      const fly = screen.getByRole('menu', { name: 'All Programs' });
      const names = within(fly)
        .getAllByRole('menuitem')
        .map((b) => b.textContent?.replace('▶', ''));
      expect(names).toEqual([
        'Accessories',
        'Games',
        'Internet',
        'Entertainment',
        'System Tools',
      ]);
    });

    it('click opens a submenu and launching an app closes the menu', () => {
      const onClose = vi.fn();
      render(<StartMenu open onClose={onClose} />);
      fireEvent.click(screen.getByRole('menuitem', { name: /All Programs/ }));
      fireEvent.click(screen.getByRole('menuitem', { name: /Accessories/ }));
      const sub = screen.getByRole('menu', { name: 'Accessories' });
      fireEvent.click(within(sub).getByRole('menuitem', { name: 'Notepad' }));
      expect(useWindowsStore.getState().windows.map((w) => w.appId)).toEqual([
        'notepad',
      ]);
      expect(onClose).toHaveBeenCalled();
    });

    it('hover opens a submenu after 300 ms', () => {
      vi.useFakeTimers();
      open();
      const cat = screen.getByRole('menuitem', { name: /System Tools/ });
      fireEvent.mouseEnter(cat.parentElement as HTMLElement);
      expect(screen.queryByRole('menu', { name: 'System Tools' })).toBeNull();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('menu', { name: 'System Tools' })).toBeTruthy();
    });

    it('keyboard: → opens, ← closes, Esc closes one level at a time', () => {
      const onClose = vi.fn();
      render(<StartMenu open onClose={onClose} />);
      const all = screen.getByRole('menuitem', { name: /All Programs/ });
      all.focus();
      fireEvent.keyDown(all, { key: 'ArrowRight' });
      const fly = screen.getByRole('menu', { name: 'All Programs' });
      const first = within(fly).getAllByRole('menuitem')[0] as HTMLElement;
      expect(document.activeElement).toBe(first);

      fireEvent.keyDown(first, { key: 'ArrowRight' });
      const sub = screen.getByRole('menu', { name: 'Accessories' });
      expect(document.activeElement).toBe(
        within(sub).getAllByRole('menuitem')[0],
      );

      fireEvent.keyDown(document.activeElement as HTMLElement, {
        key: 'ArrowLeft',
      });
      expect(screen.queryByRole('menu', { name: 'Accessories' })).toBeNull();
      expect(document.activeElement).toBe(first);

      fireEvent.keyDown(first, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(
        within(fly).getAllByRole('menuitem')[1],
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu', { name: 'All Programs' })).toBeNull();
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
