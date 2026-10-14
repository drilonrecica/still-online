import { fireEvent, render, screen } from '@testing-library/react';
import { lazy } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWindowsStore } from '@/os/store/windows';
import type { AppDefinition } from '@/os/types';
import { DesktopIcons } from './DesktopIcons';

function app(
  id: 'mycomputer' | 'notepad' | 'recyclebin',
  title: string,
): AppDefinition {
  return {
    id,
    title,
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
  app('mycomputer', 'My Computer'),
  app('notepad', 'Notepad'),
  app('recyclebin', 'Recycle Bin'),
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
});
