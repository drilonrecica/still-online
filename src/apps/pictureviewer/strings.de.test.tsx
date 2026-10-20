// The Picture Viewer in German.
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { titleOf } from '@/test/windowTitle';
import { getApp } from '@/apps/registry';
import { systemFolders } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';

beforeEach(() => {
  useSettingsStore.setState({ language: 'de' });
  useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  act(() => useWindowsStore.getState().closeAll());
});
afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Picture Viewer in German', () => {
  it('shows German buttons, title, position and the empty-picture message', async () => {
    let id = '';
    act(() => {
      const { createFile } = useFsStore.getState();
      id = createFile('pics', { name: 'bild.png', type: 'image' });
      createFile('pics', { name: 'zwei.png', type: 'image' });
    });
    render(<WindowLayer getApp={getApp} />);
    act(() => {
      useWindowsStore.getState().openApp('pictureviewer', { fileId: id });
    });
    expect(
      await screen.findByRole('button', { name: 'Weiter' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Originalgröße' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'In Paint bearbeiten' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 von 2')).toBeInTheDocument();
    expect(
      screen.getByText('Dieses Bild kann nicht angezeigt werden.'),
    ).toBeInTheDocument();
    const win = useWindowsStore.getState().windows[0]?.id;
    await waitFor(() => expect(titleOf(win)).toBe('bild.png - Bildanzeige'));
  });
});
