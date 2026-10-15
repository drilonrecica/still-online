import { fireEvent, render, screen } from '@testing-library/react';
import { lazy } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWindowsStore } from '@/os/store/windows';
import type { MessageKey } from '@/i18n/types';
import type { AppDefinition, AppId } from '@/os/types';
import { DesktopIcons } from './DesktopIcons';
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

  it('Enter with nothing selected does nothing; icons are not draggable', () => {
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
          { appId: 'notepad', label: 'Scratch', props: { note: 'x' } },
          // Every real AppId is registered now; a stale id from old saved data stands in.
          { appId: 'retired-app' as AppId, label: 'Missing' },
        ]}
      />,
    );
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.doubleClick(screen.getByText('Scratch'));
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
});
