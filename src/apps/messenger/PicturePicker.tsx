// Dialog listing the My Pictures images; the choice becomes the player's display picture.
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { Dialog } from './AwayDialogs';
import styles from './Messenger.module.css';
import { PictureFile } from './chat/PlayerPicture';
import { useMessengerStore } from './store';

export function PicturePicker({ onClose }: { onClose: () => void }) {
  const t = useT();
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
      title={t('messenger.dialogs.pictureTitle')}
      onSubmit={() => {
        setDisplayPicture(picked);
        onClose();
      }}
      onCancel={onClose}
    >
      <ul
        className={styles.pictureList}
        role="listbox"
        aria-label={t('messenger.dialogs.myPictures')}
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
            {t('messenger.dialogs.noPicture')}
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
