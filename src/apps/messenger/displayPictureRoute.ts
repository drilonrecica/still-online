// `messenger:setDisplayPicture` (sent by Paint): makes an fs image the player's display picture.
// Installed from App at boot, not by the lazy conversation runtime, so it works before Messenger opens.
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { useMessengerStore } from './store';

/** Subscribes once; returns the unsubscribe function (used by the App effect). */
export function installDisplayPictureRoute(): () => void {
  return events.on('messenger:setDisplayPicture', ({ fileId }) => {
    if (useFsStore.getState().get(fileId)?.type !== 'image') return;
    useMessengerStore.getState().setDisplayPicture(fileId);
  });
}
