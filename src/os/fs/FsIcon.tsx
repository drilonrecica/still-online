// The 32px icon of an fs node: a type icon, or a live thumbnail for images.
import { useEffect, useRef } from 'react';
import audioIcon from '@/assets/icons/audio-32.svg';
import folderIcon from '@/assets/icons/folder-32.svg';
import imageIcon from '@/assets/icons/image-32.svg';
import linkIcon from '@/assets/icons/link-32.svg';
import notepadIcon from '@/assets/icons/notepad-32.svg';
import { useBlobUrl } from '@/os/blobStore';
import { renderPhoto } from './photos';
import type { FsNode, PhotoSpec } from './types';

const TYPE_ICONS: Record<FsNode['type'], string> = {
  folder: folderIcon,
  txt: notepadIcon,
  image: imageIcon,
  audio: audioIcon,
  link: linkIcon,
};

/** A procedural photo drawn on a canvas of the given pixel size. */
export function PhotoCanvas({
  photo,
  width,
  height,
  className,
  label,
}: {
  photo: PhotoSpec;
  width: number;
  height: number;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) renderPhoto(photo, ref.current, width, height);
  }, [photo.scene, photo.seed, width, height, photo]);
  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

function BlobThumb({ blobKey, size }: { blobKey: string; size: number }) {
  const url = useBlobUrl(blobKey);
  if (!url) return <img src={imageIcon} alt="" width={size} height={size} />;
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      draggable={false}
      style={{ objectFit: 'cover' }}
    />
  );
}

export function FsIcon({ node, size = 32 }: { node: FsNode; size?: number }) {
  if (node.type === 'image' && node.photo) {
    return <PhotoCanvas photo={node.photo} width={size} height={size} />;
  }
  if (node.type === 'image' && node.blobKey) {
    return <BlobThumb blobKey={node.blobKey} size={size} />;
  }
  return (
    <img
      src={TYPE_ICONS[node.type]}
      alt=""
      width={size}
      height={size}
      draggable={false}
    />
  );
}
