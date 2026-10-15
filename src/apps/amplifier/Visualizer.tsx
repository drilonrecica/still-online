// Tiny spectrum/oscilloscope display; click cycles bars → oscilloscope → off.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useAnimationFrame } from '@/os/useAnimationFrame';
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

interface VisualizerProps {
  audio: HTMLMediaElement;
  status: PlaybackStatus;
  /** Reduced motion: draw a static frame only. */
  reduced: boolean;
  /** The Amplifier window is minimized: stop animating. */
  minimized?: boolean;
}

export function Visualizer({
  audio,
  status,
  reduced,
  minimized = false,
}: VisualizerProps) {
  const t = useT();
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(createVisualizerState());
  const frameRef = useRef<((now: number) => void) | null>(null);
  const lastRef = useRef(-Infinity);

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
    frameRef.current = (now: number) => {
      // Small slack so a 60Hz display reliably draws every other frame.
      if (now - lastRef.current < 1000 / FPS - 2) return;
      lastRef.current = now;
      drawFrame(ctx, mode, analyser, state);
    };
    return () => {
      frameRef.current = null;
    };
  }, [audio, mode, reduced, status]);
  const animating = !(mode === 'off' || reduced || status !== 'playing');
  useAnimationFrame((now) => frameRef.current?.(now), animating && !minimized);

  return (
    <button
      type="button"
      className={styles.visualizer}
      aria-label={t(`amplifier.visualizer.${mode}`)}
      data-mode={mode}
      onClick={() => setMode(nextMode)}
    >
      <canvas ref={canvasRef} width={VIS_WIDTH} height={VIS_HEIGHT} />
    </button>
  );
}
