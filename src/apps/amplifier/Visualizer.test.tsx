import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaybackStatus } from './store';
import { Visualizer } from './Visualizer';

const analyser = vi.hoisted(() => ({
  frequencyBinCount: 256,
  getByteFrequencyData: vi.fn((a: Uint8Array) => a.fill(200)),
  getByteTimeDomainData: vi.fn((a: Uint8Array) => a.fill(128)),
}));
vi.mock('./analyser', () => ({ getAnalyser: vi.fn(() => analyser) }));
import { getAnalyser } from './analyser';

let frames: FrameRequestCallback[] = [];
const fillRect = vi.fn();

function runFrame(time: number) {
  const pending = frames;
  frames = [];
  act(() => pending.forEach((cb) => cb(time)));
}

function renderVis(status: PlaybackStatus, reduced = false) {
  const audio = new Audio();
  const utils = render(
    <Visualizer audio={audio} status={status} reduced={reduced} />,
  );
  return {
    ...utils,
    rerenderWith: (s: PlaybackStatus, r = reduced) =>
      utils.rerender(<Visualizer audio={audio} status={s} reduced={r} />),
  };
}

describe('Visualizer', () => {
  beforeEach(() => {
    frames = [];
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect,
    } as unknown as CanvasRenderingContext2D);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = [];
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('click cycles bars → oscilloscope → off → bars', async () => {
    renderVis('stopped');
    await userEvent.click(screen.getByLabelText('Visualizer: bars'));
    await userEvent.click(screen.getByLabelText('Visualizer: oscilloscope'));
    await userEvent.click(screen.getByLabelText('Visualizer: off'));
    expect(screen.getByLabelText('Visualizer: bars')).toBeInTheDocument();
  });

  it('animates at ~30fps while playing', () => {
    renderVis('playing');
    expect(getAnalyser).toHaveBeenCalledTimes(1);
    runFrame(1000);
    runFrame(1016); // too soon at 60Hz: skipped
    runFrame(1033);
    runFrame(1050); // skipped
    runFrame(1066);
    expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(3);
  });

  it('stops animating and holds one frame when paused', () => {
    const v = renderVis('playing');
    runFrame(1000);
    analyser.getByteFrequencyData.mockClear();
    v.rerenderWith('paused');
    expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
    expect(frames).toHaveLength(0);
  });

  it('is static with reduced motion and never captures the audio', () => {
    renderVis('playing', true);
    expect(frames).toHaveLength(0);
    expect(getAnalyser).not.toHaveBeenCalled();
    expect(fillRect).toHaveBeenCalledTimes(1); // background only
  });

  it('does not animate when switched off', async () => {
    renderVis('playing');
    await userEvent.click(screen.getByLabelText('Visualizer: bars'));
    await userEvent.click(screen.getByLabelText('Visualizer: oscilloscope'));
    expect(frames).toHaveLength(0);
  });
});
