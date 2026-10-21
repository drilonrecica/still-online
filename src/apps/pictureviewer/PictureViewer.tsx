// Picture Viewer: one picture at a time, Previous/Next within its folder, fit or actual size.
// Opening another picture reuses the window (`swapProps` in the registry).
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useT } from '@/i18n/useT';
import { useBlobUrl } from '@/os/blobStore';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { compareNodes } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './PictureViewer.module.css';

const PHOTO_W = 640;
const PHOTO_H = 480;
/** A sideways touch swipe longer than this (px) steps to the next or previous picture. */
const SWIPE_PX = 50;

function BlobImage({ blobKey, name }: { blobKey: string; name: string }) {
  const t = useT();
  const url = useBlobUrl(blobKey);
  if (!url)
    return <p className={styles.message}>{t('pictureviewer.loading')}</p>;
  return <img src={url} alt={name} />;
}

export default function PictureViewer({ windowId, props }: AppComponentProps) {
  const t = useT();
  const fileId = typeof props.fileId === 'string' ? props.fileId : null;
  const nodes = useFsStore((s) => s.nodes);
  const [fit, setFit] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const image = fileId ? nodes[fileId] : undefined;
  // A picture moved to the Recycle Bin is gone as far as the viewer is concerned.
  const picture =
    image?.type === 'image' && image.parentId !== FS_FOLDERS.recycle
      ? image
      : undefined;
  const parentId = picture?.parentId;
  const images = useMemo(
    () =>
      Object.values(nodes)
        .filter((n) => n.parentId === parentId && n.type === 'image')
        .sort(compareNodes),
    [nodes, parentId],
  );
  const index = images.findIndex((n) => n.id === fileId);
  const name = picture?.name;

  useEffect(() => {
    const { setWindowTitle } = useWindowsStore.getState();
    if (name) setWindowTitle(windowId, 'pictureviewer.title', { file: name });
    else setWindowTitle(windowId, 'apps.pictureviewer.title');
  }, [windowId, name]);

  useEffect(() => rootRef.current?.focus(), []);

  function step(delta: number) {
    if (images.length < 2) return;
    const next = images[(index + delta + images.length) % images.length];
    if (next) {
      useWindowsStore.getState().setWindowProps(windowId, { fileId: next.id });
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    swipe.current =
      e.pointerType === 'touch' && fit ? { x: e.clientX, y: e.clientY } : null;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (
      Math.abs(dx) > SWIPE_PX &&
      Math.abs(dx) > Math.abs(e.clientY - start.y)
    ) {
      step(dx < 0 ? 1 : -1);
    }
  }

  const { openApp } = useWindowsStore.getState();

  return (
    <div
      ref={rootRef}
      className={styles.viewer}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
        else return;
        e.preventDefault();
      }}
    >
      <div className={styles.bar}>
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={images.length < 2}
        >
          {t('pictureviewer.previous')}
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={images.length < 2}
        >
          {t('pictureviewer.next')}
        </button>
        <button
          type="button"
          aria-pressed={fit}
          disabled={!picture}
          onClick={() => setFit((f) => !f)}
        >
          {fit ? t('pictureviewer.actualSize') : t('pictureviewer.bestFit')}
        </button>
        <button
          type="button"
          disabled={!picture}
          onClick={() => picture && openApp('paint', { fileId: picture.id })}
        >
          {t('pictureviewer.editInPaint')}
        </button>
        <button
          type="button"
          disabled={!parentId}
          onClick={() => parentId && openApp('explorer', { folder: parentId })}
        >
          {t('pictureviewer.openFolder')}
        </button>
        {picture && index >= 0 && (
          <span className={styles.position}>
            {t('pictureviewer.position', {
              n: index + 1,
              count: images.length,
            })}
          </span>
        )}
      </div>
      <div
        className={styles.stage}
        data-fit={fit}
        data-testid="picture-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        {!picture ? (
          <p className={styles.message}>
            {fileId
              ? t('pictureviewer.cannotDisplay')
              : t('pictureviewer.noPicture')}
          </p>
        ) : picture.photo ? (
          <PhotoCanvas
            photo={picture.photo}
            width={PHOTO_W}
            height={PHOTO_H}
            label={picture.photo.caption ?? picture.name}
            className={styles.image}
          />
        ) : picture.blobKey ? (
          <BlobImage blobKey={picture.blobKey} name={picture.name} />
        ) : (
          <p className={styles.message}>{t('pictureviewer.cannotDisplay')}</p>
        )}
      </div>
      {picture?.photo?.caption && (
        <p className={styles.caption}>{picture.photo.caption}</p>
      )}
    </div>
  );
}
