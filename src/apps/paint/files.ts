// Paint's file operations: save to My Pictures, set as the desktop background, use as display picture.
import { deleteBlob, putBlob } from '@/os/blobStore';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { useSettingsStore } from '@/os/store/settings';
import { encodePng } from './codec';
import type { PixelBuffer } from './pixels';

export const DEFAULT_NAME = 'untitled.png';

/** `cat` → `cat.png`; names that already end in an image extension keep it. */
export function withPngExtension(name: string): string {
  const trimmed = name.trim();
  return /\.(png|jpe?g|gif|bmp)$/i.test(trimmed) ? trimmed : `${trimmed}.png`;
}

/** Writes the image over an existing fs image. */
export async function saveOver(fileId: string, buf: PixelBuffer) {
  const blobKey = await putBlob(await encodePng(buf));
  if (useFsStore.getState().get(fileId)?.type !== 'image') {
    await deleteBlob(blobKey);
    throw new Error('paint: file is gone');
  }
  useFsStore.getState().writeImage(fileId, blobKey);
}

/**
 * Save As: overwrites an image of the same name in `folderId`, or creates a new one.
 * Returns the file id.
 */
export async function saveAs(
  folderId: string,
  name: string,
  buf: PixelBuffer,
): Promise<string> {
  const fileName = withPngExtension(name);
  const existing = useFsStore
    .getState()
    .list(folderId)
    .find(
      (n) =>
        n.type === 'image' && n.name.toLowerCase() === fileName.toLowerCase(),
    );
  if (existing) {
    await saveOver(existing.id, buf);
    return existing.id;
  }
  const blobKey = await putBlob(await encodePng(buf));
  return useFsStore
    .getState()
    .createFile(folderId, { name: fileName, type: 'image', blobKey });
}

/**
 * File → Set As Background. The wallpaper gets its own copy of the bytes, because Display
 * Properties deletes a replaced custom wallpaper's blob and must never delete a file's.
 */
export async function setAsBackground(
  buf: PixelBuffer,
  position: 'tile' | 'center',
): Promise<void> {
  const blobKey = await putBlob(await encodePng(buf));
  const settings = useSettingsStore.getState();
  const previous = settings.wallpaper;
  settings.setWallpaper({ kind: 'custom', blobKey });
  settings.setWallpaperPosition(position);
  if (previous.kind === 'custom') await deleteBlob(previous.blobKey);
}

/** File → Use as display picture (the file must be saved first). */
export function sendToDisplayPicture(fileId: string): void {
  events.emit('messenger:setDisplayPicture', { fileId });
}
