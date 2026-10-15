import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { titleOf } from '@/test/windowTitle';
import { systemFolders } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { getApp } from '@/apps/registry';

beforeEach(() => {
  useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  act(() => useWindowsStore.getState().closeAll());
});

function openExplorer(folder?: string) {
  render(<WindowLayer getApp={getApp} />);
  act(() => {
    useWindowsStore.getState().openApp('explorer', folder ? { folder } : {});
  });
}

describe('explorer app', () => {
  it('titles the window after the folder and navigates by double-click', async () => {
    openExplorer('docs');
    expect(await screen.findByLabelText('Address')).toHaveValue('My Documents');
    // The title is set in an effect, which may land just after the address renders.
    await waitFor(() =>
      expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
        'My Documents',
      ),
    );
    fireEvent.doubleClick(screen.getByText('My Pictures'));
    expect(screen.getByLabelText('Address')).toHaveValue(
      'My Documents\\My Pictures',
    );
    // The title is set in an effect, which may land just after the address renders.
    await waitFor(() =>
      expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
        'My Pictures',
      ),
    );
  });

  it('renames folders and the title live when the language changes', async () => {
    openExplorer('pics');
    await waitFor(() =>
      expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
        'My Pictures',
      ),
    );
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(screen.getByLabelText('Address')).toHaveValue(
      'Eigene Dateien\\Eigene Bilder',
    );
    await waitFor(() =>
      expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
        'Eigene Bilder',
      ),
    );
  });

  it('is one window per folder', () => {
    render(<WindowLayer getApp={getApp} />);
    const { openApp } = useWindowsStore.getState();
    const a = openApp('explorer', { folder: 'pics' });
    expect(openApp('explorer', { folder: 'pics' })).toBe(a);
    expect(openApp('explorer', { folder: 'music' })).not.toBe(a);
  });

  it('views images with prev/next', async () => {
    act(() => {
      const { createFile } = useFsStore.getState();
      createFile('pics', {
        name: 'a.jpg',
        type: 'image',
        photo: { scene: 'camp', seed: 1, caption: 'First' },
      });
      createFile('pics', {
        name: 'b.jpg',
        type: 'image',
        photo: { scene: 'pet', seed: 2, caption: 'Second' },
      });
    });
    openExplorer('pics');
    fireEvent.doubleClick(await screen.findByText('a.jpg'));
    expect(screen.getByText('a.jpg (1 of 2)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('b.jpg (2 of 2)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to folder' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens a recycle-bin window with the shared view', async () => {
    render(<WindowLayer getApp={getApp} />);
    act(() => {
      useWindowsStore.getState().openApp('recyclebin');
    });
    expect(
      await screen.findByText('The Recycle Bin is empty.'),
    ).toBeInTheDocument();
  });
});
