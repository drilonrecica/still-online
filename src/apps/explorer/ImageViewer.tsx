// "Picture and Fax Viewer"-style pane: one image, prev/next within its folder, fit or actual size.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBlobUrl } from '@/os/blobStore';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import type { FsNode } from '@/os/fs/types';
import styles from './Explorer.module.css';

const PHOTO_W = 640;
const PHOTO_H = 480;

export interface ImageViewerProps {
  image: FsNode;
  /** 1-based position among the folder's images, and how many there are. */
  position: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

function BlobImage({
  blobKey,
  name,
  fit,
}: {
  blobKey: string;
  name: string;
  fit: boolean;
}) {
  const t = useT();
  const url = useBlobUrl(blobKey);
  if (!url) return <p>{t('explorer.loading')}</p>;
  return <img src={url} alt={name} data-fit={fit} />;
}

export function ImageViewer({
  image,
  position,
  count,
  onPrev,
  onNext,
  onClose,
}: ImageViewerProps) {
  const t = useT();
  const [fit, setFit] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => rootRef.current?.focus(), []);

  return (
    <div
      ref={rootRef}
      className={styles.viewer}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') onPrev();
        else if (e.key === 'ArrowRight') onNext();
        else if (e.key === 'Escape' || e.key === 'Backspace') onClose();
        else return;
        e.preventDefault();
      }}
    >
      <div className={styles.viewerBar}>
        <button type="button" onClick={onClose}>
          {t('explorer.back')}
        </button>
        <button type="button" onClick={onPrev} disabled={count < 2}>
          {t('explorer.previous')}
        </button>
        <button type="button" onClick={onNext} disabled={count < 2}>
          {t('explorer.next')}
        </button>
        <button
          type="button"
          aria-pressed={fit}
          onClick={() => setFit((f) => !f)}
        >
          {fit ? t('explorer.actualSize') : t('explorer.bestFit')}
        </button>
        <span className={styles.viewerTitle}>
          {t('explorer.position', { name: image.name, n: position, count })}
        </span>
      </div>
      <div className={styles.viewerStage} data-fit={fit}>
        {image.photo ? (
          <PhotoCanvas
            photo={image.photo}
            width={PHOTO_W}
            height={PHOTO_H}
            label={image.photo.caption ?? image.name}
            className={styles.viewerImage}
          />
        ) : image.blobKey ? (
          <BlobImage blobKey={image.blobKey} name={image.name} fit={fit} />
        ) : (
          <p>{t('explorer.cannotDisplay')}</p>
        )}
      </div>
      {image.photo?.caption && (
        <p className={styles.viewerCaption}>{image.photo.caption}</p>
      )}
    </div>
  );
}
