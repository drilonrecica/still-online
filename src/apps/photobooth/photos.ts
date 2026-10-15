// Snapshot Booth's storage: numbered `booth_<n>.png` files in My Pictures.
import { putBlob } from '@/os/blobStore';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';

/** The smallest `booth_<n>.png` number not used in My Pictures yet. */
export function nextBoothName(): string {
  const used = new Set<number>();
  for (const node of useFsStore.getState().list(FS_FOLDERS.pics)) {
    const m = /^booth_(\d+)\.png$/i.exec(node.name);
    if (m) used.add(Number(m[1]));
  }
  let n = 1;
  while (used.has(n)) n++;
  return `booth_${n}.png`;
}

/** Stores the PNG and creates the My Pictures file. Returns the new fs id. */
export async function savePhoto(png: Blob): Promise<string> {
  const blobKey = await putBlob(png);
  return useFsStore.getState().createFile(FS_FOLDERS.pics, {
    name: nextBoothName(),
    type: 'image',
    blobKey,
  });
}

export function setAsDisplayPicture(fileId: string): void {
  events.emit('messenger:setDisplayPicture', { fileId });
}

/** PNG bytes of a canvas; rejects where the canvas can't encode (jsdom). */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('photobooth: no canvas support'));
      return;
    }
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('photobooth: encode')),
      'image/png',
    );
  });
}
