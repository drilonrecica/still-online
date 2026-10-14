// "Picture and Fax Viewer"-style pane: one image, prev/next within its folder, fit or actual size.
import { useEffect, useRef, useState } from 'react';
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
  const url = useBlobUrl(blobKey);
  if (!url) return <p>Loading…</p>;
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
          Back to folder
        </button>
        <button type="button" onClick={onPrev} disabled={count < 2}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={count < 2}>
          Next
        </button>
        <button
          type="button"
          aria-pressed={fit}
          onClick={() => setFit((f) => !f)}
        >
          {fit ? 'Actual size' : 'Best fit'}
        </button>
        <span className={styles.viewerTitle}>
          {image.name} ({position} of {count})
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
          <p>This picture can't be displayed.</p>
        )}
      </div>
      {image.photo?.caption && (
        <p className={styles.viewerCaption}>{image.photo.caption}</p>
      )}
    </div>
  );
}
