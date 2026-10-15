// Snapshot Booth: webcam photos (never uploaded) with filters and a countdown, plus a cartoon fallback.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlobUrl } from '@/os/blobStore';
import { useFsStore } from '@/os/fs/store';
import { playSound } from '@/os/sound';
import type { AppComponentProps } from '@/os/types';
import { useAnimationFrame, useWindowMinimized } from '@/os/useAnimationFrame';
import {
  cycle,
  DEFAULT_LOOK,
  drawCartoon,
  EYES,
  HAIR,
  MOUTHS,
  type CartoonLook,
} from './cartoon';
import {
  applyFilter,
  FILTER_IDS,
  FILTER_LABELS,
  type FilterId,
} from './filters';
import { canvasToPng, savePhoto, setAsDisplayPicture } from './photos';
import styles from './Photobooth.module.css';

const W = 640;
const H = 480;
/** Frame interval of the preview loop (≈15 fps keeps the pixel filters cheap). */
const FRAME_MS = 66;

type Mode = 'start' | 'webcam' | 'cartoon';

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

function context2d(canvas: HTMLCanvasElement | null) {
  try {
    return canvas?.getContext('2d', { willReadFrequently: true }) ?? null;
  } catch {
    return null;
  }
}

function Thumb({ id }: { id: string }) {
  const node = useFsStore((s) => s.nodes[id]);
  const url = useBlobUrl(node?.blobKey ?? null);
  if (!node) return null;
  return (
    <li className={styles.thumb}>
      {url ? <img src={url} alt={node.name} /> : <span>{node.name}</span>}
      <button type="button" onClick={() => setAsDisplayPicture(id)}>
        Set as display picture
      </button>
    </li>
  );
}

export default function Photobooth({ windowId }: Partial<AppComponentProps>) {
  const minimized = useWindowMinimized(windowId);
  const [mode, setMode] = useState<Mode>('start');
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('normal');
  const [look, setLook] = useState<CartoonLook>(DEFAULT_LOOK);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  // The render loop reads these without restarting.
  const live = useRef({ filter, look, mode });
  live.current = { filter, look, mode };

  const stopCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    alive.current = true;
    const pending = timers.current;
    return () => {
      alive.current = false;
      pending.forEach((t) => window.clearTimeout(t));
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const goCartoon = useCallback(
    (why: string | null) => {
      stopCamera();
      setNotice(why);
      setMode('cartoon');
    },
    [stopCamera],
  );

  const startWebcam = useCallback(async () => {
    stopCamera();
    setNotice(null);
    const devices = navigator.mediaDevices;
    if (!devices?.getUserMedia) {
      goCartoon("This browser can't reach a camera, so here's a cartoon you.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await devices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
    } catch (e) {
      if (!alive.current) return;
      const name = e instanceof DOMException ? e.name : '';
      goCartoon(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Snapshot Booth was not allowed to use your camera. Nothing was recorded — here is a cartoon you instead.'
          : 'No camera was found on this computer, so here is a cartoon you instead.',
      );
      return;
    }
    if (!alive.current) {
      stopStream(stream);
      return;
    }
    streamRef.current = stream;
    setMode('webcam');
  }, [goCartoon, stopCamera]);

  // Attach the stream once the <video> exists.
  useEffect(() => {
    if (mode !== 'webcam') return;
    const video = videoRef.current;
    if (video && streamRef.current) {
      video.srcObject = streamRef.current;
      void video.play?.()?.catch(() => {});
    }
  }, [mode]);

  // The render loop: source (video or cartoon) → filter → visible canvas.
  const tickRef = useRef<((now: number) => void) | null>(null);
  useEffect(() => {
    if (mode === 'start') return;
    let last = 0;
    let frame = 0;
    const tick = (now: number) => {
      if (now - last < FRAME_MS) return;
      last = now;
      const out = context2d(canvasRef.current);
      if (!out) return;
      const sourceCanvas = (sourceRef.current ??=
        document.createElement('canvas'));
      sourceCanvas.width = W;
      sourceCanvas.height = H;
      const src = context2d(sourceCanvas);
      if (!src) return;
      const cur = live.current;
      if (cur.mode === 'cartoon') {
        drawCartoon(src, W, H, cur.look);
      } else {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        src.drawImage(video, 0, 0, W, H);
      }
      const frameData = src.getImageData(0, 0, W, H);
      const filtered = applyFilter(
        cur.filter,
        { w: W, h: H, data: frameData.data },
        (frame += 1),
      );
      out.putImageData(
        new ImageData(new Uint8ClampedArray(filtered.data), W, H),
        0,
        0,
      );
    };
    tickRef.current = tick;
    return () => {
      tickRef.current = null;
    };
  }, [mode]);
  useAnimationFrame(
    (now) => tickRef.current?.(now),
    mode !== 'start' && !minimized,
  );

  const choose = (next: 'webcam' | 'cartoon') => {
    if (next === 'cartoon') goCartoon(null);
    else void startWebcam();
  };

  async function capture() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFlash(true);
    timers.current.push(
      window.setTimeout(() => alive.current && setFlash(false), 250),
    );
    playSound('click');
    try {
      const id = await savePhoto(await canvasToPng(canvas));
      if (alive.current) setPhotos((p) => [id, ...p]);
    } catch {
      if (alive.current) setError("The photo couldn't be saved.");
    }
  }

  function takePhoto() {
    if (count !== null) return;
    setError(null);
    const step = (n: number) => {
      if (!alive.current) return;
      if (n === 0) {
        setCount(null);
        void capture();
        return;
      }
      setCount(n);
      timers.current.push(window.setTimeout(() => step(n - 1), 1000));
    };
    step(3);
  }

  if (mode === 'start') {
    return (
      <div className={styles.root}>
        <div className={styles.consent}>
          <h2>Snapshot Booth</h2>
          <p>
            Snapshot Booth needs your webcam. Your camera stays on this computer
            — photos are saved only in this browser, nothing is uploaded.
          </p>
          <div className={styles.row}>
            <button type="button" onClick={() => void startWebcam()}>
              Use my webcam
            </button>
            <button type="button" onClick={() => goCartoon(null)}>
              No camera — use a cartoon me
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      <div className={styles.stage}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className={styles.canvas}
          role="img"
          aria-label={mode === 'webcam' ? 'Camera preview' : 'Cartoon preview'}
        />
        <video ref={videoRef} className={styles.video} muted playsInline />
        {count !== null && (
          <div className={styles.count} aria-live="assertive">
            {count}
          </div>
        )}
        {flash && <div className={styles.flash} data-testid="flash" />}
      </div>

      <div className={styles.row} role="group" aria-label="Filters">
        {FILTER_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {FILTER_LABELS[id]}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <button type="button" onClick={takePhoto} disabled={count !== null}>
          Take Photo
        </button>
        {mode === 'cartoon' ? (
          <>
            <button
              type="button"
              onClick={() =>
                setLook({ ...look, hair: cycle(look.hair, HAIR.length) })
              }
            >
              Hair: {HAIR[look.hair]}
            </button>
            <button
              type="button"
              onClick={() =>
                setLook({ ...look, eyes: cycle(look.eyes, EYES.length) })
              }
            >
              Eyes: {EYES[look.eyes]}
            </button>
            <button
              type="button"
              onClick={() =>
                setLook({ ...look, mouth: cycle(look.mouth, MOUTHS.length) })
              }
            >
              Mouth: {MOUTHS[look.mouth]}
            </button>
            <button type="button" onClick={() => choose('webcam')}>
              Use my webcam
            </button>
          </>
        ) : (
          <button type="button" onClick={() => choose('cartoon')}>
            Cartoon me
          </button>
        )}
      </div>
      {error && (
        <p className={styles.notice} role="alert">
          {error}
        </p>
      )}
      <ul className={styles.strip} aria-label="Photos">
        {photos.map((id) => (
          <Thumb key={id} id={id} />
        ))}
      </ul>
    </div>
  );
}
