import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
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
});
