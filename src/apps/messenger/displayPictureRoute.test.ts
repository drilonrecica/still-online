import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { installDisplayPictureRoute } from './displayPictureRoute';
import { useMessengerStore } from './store';

const dp = () =>
  useMessengerStore.getState().progress.player.displayPicture?.fileId ?? null;

let off: () => void;
beforeEach(() => {
  localStorage.clear();
  useMessengerStore.getState().setDisplayPicture(null);
  off = installDisplayPictureRoute();
});
afterEach(() => off());

describe('messenger:setDisplayPicture', () => {
  it('sets an fs image as the display picture', () => {
    const id = useFsStore.getState().createFile(FS_FOLDERS.pics, {
      name: 'me.png',
      type: 'image',
      blobKey: 'blob:me',
    });
    events.emit('messenger:setDisplayPicture', { fileId: id });
    expect(dp()).toBe(id);
  });

  it('ignores missing files and non-images', () => {
    const txt = useFsStore
      .getState()
      .createFile(FS_FOLDERS.docs, { name: 'a.txt', type: 'txt' });
    events.emit('messenger:setDisplayPicture', { fileId: txt });
    events.emit('messenger:setDisplayPicture', { fileId: 'f:nope' });
    expect(dp()).toBeNull();
  });
});
