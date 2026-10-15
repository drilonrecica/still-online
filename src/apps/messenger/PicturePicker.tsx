// Dialog listing the My Pictures images; the choice becomes the player's display picture.
import { useState } from 'react';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { Dialog } from './AwayDialogs';
import styles from './Messenger.module.css';
import { PictureFile } from './chat/PlayerPicture';
import { useMessengerStore } from './store';

export function PicturePicker({ onClose }: { onClose: () => void }) {
  const nodes = useFsStore((s) => s.nodes);
  const current = useMessengerStore(
    (s) => s.progress.player.displayPicture?.fileId ?? null,
  );
  const setDisplayPicture = useMessengerStore((s) => s.setDisplayPicture);
  const images = useFsStore
    .getState()
    .list(FS_FOLDERS.pics)
    .filter((n) => n.type === 'image' && nodes[n.id]);
  const [picked, setPicked] = useState<string | null>(
    current && images.some((n) => n.id === current) ? current : null,
  );

  return (
    <Dialog
      title="Change my picture"
      onSubmit={() => {
        setDisplayPicture(picked);
        onClose();
      }}
      onCancel={onClose}
    >
      <ul
        className={styles.pictureList}
        role="listbox"
        aria-label="My Pictures"
      >
        <li role="none">
          <button
            type="button"
            role="option"
            aria-selected={picked === null}
            className={styles.pictureOption}
            onClick={() => setPicked(null)}
          >
            <PictureFile fileId={null} size={40} label="" />
            (None)
          </button>
        </li>
        {images.map((n) => (
          <li key={n.id} role="none">
            <button
              type="button"
              role="option"
              aria-selected={picked === n.id}
              className={styles.pictureOption}
              onClick={() => setPicked(n.id)}
            >
              <PictureFile fileId={n.id} size={40} label="" />
              {n.name}
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
