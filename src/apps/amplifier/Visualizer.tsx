// Tiny spectrum/oscilloscope display; click cycles bars → oscilloscope → off.
import { useEffect, useRef, useState } from 'react';
import { getAnalyser } from './analyser';
import type { PlaybackStatus } from './store';
import {
  createVisualizerState,
  drawFrame,
  drawIdle,
  FPS,
  nextMode,
  VIS_HEIGHT,
  VIS_WIDTH,
  type VisualizerMode,
} from './draw';
import styles from './Amplifier.module.css';

const MODE_LABEL: Record<VisualizerMode, string> = {
  bars: 'Visualizer: bars',
  scope: 'Visualizer: oscilloscope',
  off: 'Visualizer: off',
};

interface VisualizerProps {
  audio: HTMLMediaElement;
  status: PlaybackStatus;
  /** Reduced motion: draw a static frame only. */
  reduced: boolean;
}

export function Visualizer({ audio, status, reduced }: VisualizerProps) {
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(createVisualizerState());

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d') ?? null;
    if (!ctx) return;
    const state = stateRef.current;
    if (mode === 'off' || reduced || status === 'stopped') {
      drawIdle(ctx, mode, state);
      return;
    }
    const analyser = getAnalyser(audio);
    if (status === 'paused') {
      // One frame, then hold it.
      drawFrame(ctx, mode, analyser, state);
      return;
    }
    let raf = 0;
    let last = -Infinity;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Small slack so a 60Hz display reliably draws every other frame.
      if (now - last < 1000 / FPS - 2) return;
      last = now;
      drawFrame(ctx, mode, analyser, state);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audio, mode, reduced, status]);

  return (
    <button
      type="button"
      className={styles.visualizer}
      aria-label={MODE_LABEL[mode]}
      data-mode={mode}
      onClick={() => setMode(nextMode)}
    >
      <canvas ref={canvasRef} width={VIS_WIDTH} height={VIS_HEIGHT} />
    </button>
  );
}
