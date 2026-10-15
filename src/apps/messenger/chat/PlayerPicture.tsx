// The player's display picture: a My Pictures file, or the default pattern from the player name.
import { usePlayerName } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
import { useBlobUrl } from '@/os/blobStore';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useFsStore } from '@/os/fs/store';
import { useMessengerStore } from '../store';
import { Avatar } from './Avatar';

const DEFAULT_COLORS = ['#dfe9f8', '#1d4f99'] as const;

/** The picture of `fileId` at `size` px; falls back to the default when it is missing or not an image. */
export function PictureFile({
  fileId,
  size,
  label,
}: {
  fileId: string | null;
  size: number;
  label: string;
}) {
  const node = useFsStore((s) => (fileId ? s.nodes[fileId] : undefined));
  const playerName = usePlayerName();
  const blobKey =
    node?.type === 'image' && !node.deletedFrom && !node.photo
      ? (node.blobKey ?? null)
      : null;
  const url = useBlobUrl(blobKey);
  const usable = node?.type === 'image' && !node.deletedFrom;

  if (usable && node.photo)
    return (
      <PhotoCanvas
        photo={node.photo}
        width={size}
        height={size}
        label={label}
      />
    );
  if (usable && blobKey && url)
    return (
      <img
        src={url}
        alt={label}
        width={size}
        height={size}
        draggable={false}
        style={{ objectFit: 'cover' }}
      />
    );
  return (
    <Avatar
      avatar={{ kind: 'pattern', seed: playerName, colors: DEFAULT_COLORS }}
      label={label}
      size={size}
    />
  );
}

/** The player's current display picture, read from messenger progress. */
export function PlayerPicture({ size }: { size: number }) {
  const t = useT();
  const fileId = useMessengerStore(
    (s) => s.progress.player.displayPicture?.fileId ?? null,
  );
  return (
    <PictureFile
      fileId={fileId}
      size={size}
      label={t('messenger.chat.yourPicture')}
    />
  );
}
