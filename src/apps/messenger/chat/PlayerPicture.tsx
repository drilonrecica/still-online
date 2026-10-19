// The player's display picture: a My Pictures file, or the default pattern from the player name.
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
import { useBlobUrl } from '@/os/blobStore';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useFsStore } from '@/os/fs/store';
import type { Gender } from '@/os/types';
import { useMessengerStore } from '../store';
import { Avatar } from './Avatar';

/** The default pattern's colours: pink and purple for a girl, blue and green for a boy. */
const DEFAULT_COLORS: Readonly<Record<Gender, readonly [string, string]>> = {
  girl: ['#fbe0f0', '#8a2f9e'],
  boy: ['#dcefe6', '#1d4f99'],
};

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
  const gender = useGender();
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
      avatar={{
        kind: 'pattern',
        seed: playerName,
        colors: DEFAULT_COLORS[gender],
      }}
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
