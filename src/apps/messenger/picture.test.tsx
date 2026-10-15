import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { putBlob } from '@/os/blobStore';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import Messenger from './Messenger';
import { sanitizeProgress } from './engine/progress';
import { contactContent } from './engine/test-helpers';
import { setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useMessengerStore.setState({ signedIn: true });
  useWindowsStore.setState({ windows: [], topZ: 0 });
  setMessengerContentsForTests([contactContent('lena', [])]);
});

describe('display pictures', () => {
  it('sanitizes the persisted choice', () => {
    expect(
      sanitizeProgress({ player: { displayPicture: { fileId: 'x' } } }).player
        .displayPicture,
    ).toEqual({ fileId: 'x' });
    expect(
      sanitizeProgress({ player: { displayPicture: { fileId: 5 } } }).player
        .displayPicture,
    ).toBeUndefined();
  });

  it('lists My Pictures images, persists the choice, and shows it', async () => {
    const id = useFsStore.getState().createFile(FS_FOLDERS.pics, {
      name: 'me.jpg',
      type: 'image',
      photo: { scene: 'pet', seed: 3 },
    });
    const user = userEvent.setup();
    render(<Messenger />);
    await user.click(screen.getByRole('button', { name: 'Change my picture' }));
    const list = screen.getByRole('listbox', { name: 'My Pictures' });
    expect(within(list).getByRole('option', { name: /\(None\)/ })).toBeTruthy();
    await user.click(within(list).getByRole('option', { name: /me\.jpg/ }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(useMessengerStore.getState().progress.player.displayPicture).toEqual(
      { fileId: id },
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getAllByRole('img', { name: 'Your picture' })).toHaveLength(
      1,
    );
    expect(localStorage.getItem('still-online:v1:messenger')).toContain(id);
  });

  it('renders blob images', async () => {
    const key = await putBlob(new Blob(['x'], { type: 'image/png' }));
    const id = useFsStore.getState().createFile(FS_FOLDERS.pics, {
      name: 'blob.png',
      type: 'image',
      blobKey: key,
    });
    URL.createObjectURL = () => 'blob:test';
    URL.revokeObjectURL = () => undefined;
    act(() => useMessengerStore.getState().setDisplayPicture(id));
    render(<Messenger />);
    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: 'Your picture' }).getAttribute('src'),
      ).toBe('blob:test'),
    );
  });

  it('falls back to the default when the file is gone', () => {
    act(() => useMessengerStore.getState().setDisplayPicture('f:missing'));
    render(<Messenger />);
    const img = screen.getByRole('img', { name: 'Your picture' });
    expect(img.tagName.toLowerCase()).toBe('svg');
  });
});
