import { fireEvent, render, screen } from '@testing-library/react';
import { lazy } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { MessageKey } from '@/i18n/types';
import type { AppDefinition, AppId } from '@/os/types';
import { DesktopIcons } from './DesktopIcons';
import { useDesktopStore } from './store';
import '@/apps/registry';

function app(
  id: 'mycomputer' | 'notepad' | 'recyclebin',
  labelKey: MessageKey,
): AppDefinition {
  return {
    id,
    titleKey: `apps.${id}.title`,
    labelKey,
    icon16: 'a.svg',
    icon32: 'b.svg',
    component: lazy(() => Promise.resolve({ default: () => null })),
    defaultSize: { w: 300, h: 200 },
    singleInstance: false,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: false,
  };
}

const apps = [
  app('mycomputer', 'apps.mycomputer.title'),
  app('notepad', 'apps.notepad.label'),
  app('recyclebin', 'apps.recyclebin.title'),
];

beforeEach(() => useDesktopStore.setState({ positions: {} }));

function openIds() {
  return useWindowsStore.getState().windows.map((w) => w.appId);
}

describe('DesktopIcons', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
  });

  it('renders one icon per app', () => {
    render(<DesktopIcons apps={apps} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('single click selects, one at a time', () => {
    render(<DesktopIcons apps={apps} />);
    fireEvent.click(screen.getByText('Notepad'));
    expect(screen.getByRole('option', { name: /Notepad/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(screen.getByText('Recycle Bin'));
    expect(screen.getByRole('option', { name: /Notepad/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(openIds()).toEqual([]);
  });

  it('clicking empty desktop deselects', () => {
    render(<DesktopIcons apps={apps} />);
    fireEvent.click(screen.getByText('Notepad'));
    fireEvent.click(screen.getByTestId('desktop'));
    expect(screen.getByRole('option', { name: /Notepad/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('double click opens the app', () => {
    render(<DesktopIcons apps={apps} />);
    fireEvent.doubleClick(screen.getByText('My Computer'));
    expect(openIds()).toEqual(['mycomputer']);
  });

  it('arrow keys move selection and Enter opens', () => {
    render(<DesktopIcons apps={apps} />);
    const desktop = screen.getByTestId('desktop');
    fireEvent.keyDown(desktop, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /My Computer/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(desktop, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Notepad/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(desktop, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: /My Computer/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(desktop, { key: 'Enter' });
    expect(openIds()).toEqual(['mycomputer']);
  });

  it('Enter with nothing selected does nothing; the pictures never start a native drag', () => {
    render(<DesktopIcons apps={apps} />);
    fireEvent.keyDown(screen.getByTestId('desktop'), { key: 'Enter' });
    expect(openIds()).toEqual([]);
    for (const img of document.querySelectorAll('img')) {
      expect(img).toHaveAttribute('draggable', 'false');
    }
  });

  it('opens shortcuts with their window props and skips unregistered apps', () => {
    render(
      <DesktopIcons
        shortcuts={[
          {
            appId: 'notepad',
            labelKey: 'apps.notepad.label',
            props: { note: 'x' },
          },
          // Every real AppId is registered now; a stale id from old saved data stands in.
          { appId: 'retired-app' as AppId, labelKey: 'apps.mail.title' },
        ]}
      />,
    );
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.doubleClick(screen.getByText('Notepad'));
    expect(useWindowsStore.getState().windows[0]?.props).toEqual({ note: 'x' });
  });

  it('defaults to the desktop shortcut list', () => {
    render(<DesktopIcons />);
    const labels = screen.getAllByRole('option').map((o) => o.textContent);
    expect(labels).toEqual([
      'My Documents',
      'My Computer',
      'Recycle Bin',
      'Web Explorer',
      'Messenger',
      'Mail',
      'Connect to the Internet',
      'Amplifier',
      'TuneMole',
      'My Music',
      'Mines',
      'Hen Hunt',
      'Star Pinball',
      'Desktop Wrecker',
      'Paint',
      'Snapshot Booth',
      'My Pictures',
      'Notepad',
      'Message History',
      'Disk Cleanup',
    ]);
  });

  it('marks app shortcuts with an arrow, but not system icons or folders', () => {
    render(<DesktopIcons />);
    const hasArrow = (name: string) =>
      screen
        .getByRole('option', { name, exact: true } as { name: string })
        .querySelector('[data-testid="shortcut-arrow"]') !== null;
    expect(hasArrow('Mines')).toBe(true);
    expect(hasArrow('Messenger')).toBe(true);
    expect(hasArrow('My Computer')).toBe(false);
    expect(hasArrow('Recycle Bin')).toBe(false);
    expect(hasArrow('My Documents')).toBe(false);
  });
});

describe('desktop context menu', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
  });

  it('places icons down the first column, then the next', () => {
    render(<DesktopIcons apps={apps} />);
    const [a, b] = screen.getAllByRole('option');
    expect(a).toHaveStyle({ left: '5px', top: '5px' });
    expect(b).toHaveStyle({ left: '5px', top: '80px' });
  });

  it('drags an icon onto the nearest free cell, keeps the others put and saves it', () => {
    render(<DesktopIcons apps={apps} />);
    const notepad = screen.getByRole('option', { name: 'Notepad' });
    const mouse = {
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
    };
    fireEvent.pointerDown(notepad, { ...mouse, clientX: 40, clientY: 110 });
    fireEvent.pointerMove(notepad, { ...mouse, clientX: 120, clientY: 130 });
    expect(notepad).toHaveAttribute('data-dragging', 'true');
    // Dropped 230 px right and 20 px down from cell 0,1 → cell 3,1.
    fireEvent.pointerMove(notepad, { ...mouse, clientX: 270, clientY: 130 });
    fireEvent.pointerUp(notepad, { ...mouse, clientX: 270, clientY: 130 });
    fireEvent.click(notepad);
    expect(notepad).not.toHaveAttribute('data-dragging');
    expect(notepad).toHaveStyle({ left: '230px', top: '80px' });
    expect(useDesktopStore.getState().positions).toEqual({
      mycomputer: { col: 0, row: 0 },
      notepad: { col: 3, row: 1 },
      recyclebin: { col: 0, row: 2 },
    });
    // The drop selected it; its own click did not open it.
    expect(notepad).toHaveAttribute('aria-selected', 'true');
    expect(openIds()).toEqual([]);
  });

  it('a press that barely moves is still a click, and Escape cancels a drag', () => {
    render(<DesktopIcons apps={apps} />);
    const notepad = screen.getByRole('option', { name: 'Notepad' });
    const touch = {
      pointerId: 2,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
    };
    fireEvent.pointerDown(notepad, { ...touch, clientX: 40, clientY: 110 });
    fireEvent.pointerMove(notepad, { ...touch, clientX: 47, clientY: 114 });
    expect(notepad).not.toHaveAttribute('data-dragging');
    fireEvent.pointerUp(notepad, { ...touch, clientX: 47, clientY: 114 });
    fireEvent.click(notepad);
    // A touch tap opens.
    expect(openIds()).toEqual(['notepad']);

    fireEvent.pointerDown(notepad, { ...touch, clientX: 40, clientY: 110 });
    fireEvent.pointerMove(notepad, { ...touch, clientX: 240, clientY: 110 });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerUp(notepad, { ...touch, clientX: 240, clientY: 110 });
    expect(notepad).toHaveStyle({ left: '5px', top: '80px' });
    expect(useDesktopStore.getState().positions).toEqual({});
  });

  it('Arrange Icons By puts them back in order', () => {
    useDesktopStore.setState({
      positions: {
        notepad: { col: 5, row: 5 },
        mycomputer: { col: 0, row: 1 },
      },
    });
    render(<DesktopIcons apps={apps} />);
    expect(screen.getByRole('option', { name: 'Notepad' })).toHaveStyle({
      left: '380px',
    });
    fireEvent.contextMenu(screen.getByTestId('desktop'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Arrange Icons By/ }));
    expect(useDesktopStore.getState().positions).toEqual({});
    expect(screen.getByRole('option', { name: 'Notepad' })).toHaveStyle({
      left: '5px',
      top: '80px',
    });
  });

  it('right-click shows Properties, which opens Display Properties', () => {
    render(<DesktopIcons apps={apps} />);
    fireEvent.contextMenu(screen.getByTestId('desktop'));
    expect(screen.getByRole('menuitem', { name: /Refresh/ })).toBeVisible();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Properties' }));
    expect(useWindowsStore.getState().windows.map((w) => w.appId)).toEqual([
      'display',
    ]);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders German labels and context menu with language de', () => {
    useSettingsStore.setState({ language: 'de' });
    render(<DesktopIcons />);
    expect(screen.getByRole('listbox', { name: 'Desktop' })).toBeTruthy();
    const labels = screen.getAllByRole('option').map((o) => o.textContent);
    expect(labels).toContain('Eigene Dateien');
    expect(labels).toContain('Arbeitsplatz');
    expect(labels).toContain('Papierkorb');
    expect(labels).toContain('Hühnerjagd');
    fireEvent.contextMenu(screen.getByTestId('desktop'));
    expect(
      screen.getByRole('menuitem', { name: 'Eigenschaften' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('menuitem', { name: 'Aktualisieren' }),
    ).toBeTruthy();
  });
});
