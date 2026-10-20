import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Photobooth from './Photobooth';
import { nextBoothName } from './photos';

vi.mock('./photos', async (orig) => {
  const real = await orig<typeof import('./photos')>();
  return { ...real, canvasToPng: () => Promise.resolve(new Blob(['png'])) };
});

function fakeStream() {
  const track = { stop: vi.fn() };
  return {
    track,
    stream: { getTracks: () => [track] } as unknown as MediaStream,
  };
}

function setCamera(impl: (() => Promise<MediaStream>) | undefined) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: impl ? { getUserMedia: vi.fn(impl) } : undefined,
  });
}

function picsNames() {
  return useFsStore
    .getState()
    .list(FS_FOLDERS.pics)
    .map((n) => n.name);
}

describe('Snapshot Booth', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    setCamera(undefined);
    useSettingsStore.setState({ gender: 'girl' });
  });

  it('shows the consent screen first and does not touch the camera', () => {
    setCamera(() => Promise.reject(new Error('should not be called')));
    render(<Photobooth />);
    expect(screen.getByText(/nothing is uploaded/i)).toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('requests video only and stops every track on unmount', async () => {
    const { stream, track } = fakeStream();
    setCamera(() => Promise.resolve(stream));
    const user = userEvent.setup();
    const view = render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: 'Use my webcam' }));
    expect(
      await screen.findByRole('img', { name: 'Camera preview' }),
    ).toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    });
    expect(track.stop).not.toHaveBeenCalled();
    view.unmount();
    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it('stops the camera when switching to cartoon mode', async () => {
    const { stream, track } = fakeStream();
    setCamera(() => Promise.resolve(stream));
    const user = userEvent.setup();
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: 'Use my webcam' }));
    await user.click(await screen.findByRole('button', { name: 'Cartoon me' }));
    expect(track.stop).toHaveBeenCalled();
    expect(
      screen.getByRole('img', { name: 'Cartoon preview' }),
    ).toBeInTheDocument();
  });

  it('falls back to cartoon mode with an explanation when permission is denied', async () => {
    setCamera(() => Promise.reject(new DOMException('no', 'NotAllowedError')));
    const user = userEvent.setup();
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: 'Use my webcam' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/not allowed/i);
    expect(
      screen.getByRole('img', { name: 'Cartoon preview' }),
    ).toBeInTheDocument();
  });

  it('falls back when no camera exists or the API is missing', async () => {
    setCamera(undefined);
    const user = userEvent.setup();
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: 'Use my webcam' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/camera/i);
    expect(screen.getByRole('button', { name: 'Take Photo' })).toBeEnabled();
  });

  it('cartoon mode: look buttons cycle and filters toggle', async () => {
    const user = userEvent.setup();
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: /use a cartoon me/i }));
    // A girl starts with long hair; the list wraps around to spiky.
    await user.click(screen.getByRole('button', { name: 'Hair: Long' }));
    await user.click(screen.getByRole('button', { name: 'Hair: Spiky' }));
    expect(screen.getByRole('button', { name: 'Hair: Bob' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Comic' }));
    expect(screen.getByRole('button', { name: 'Comic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('starts a boy on spiky hair', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    const user = userEvent.setup();
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: /use a cartoon me/i }));
    expect(screen.getByRole('button', { name: 'Hair: Spiky' })).toBeVisible();
  });

  it('counts down 3-2-1, then saves booth_<n>.png to My Pictures and offers the DP action', async () => {
    const before = picsNames().length;
    expect(nextBoothName()).toBe('booth_1.png');
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Photobooth />);
    await user.click(screen.getByRole('button', { name: /use a cartoon me/i }));
    await user.click(screen.getByRole('button', { name: 'Take Photo' }));
    expect(screen.getByText('3')).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(screen.getByText('2')).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(2000));
    await waitFor(() => expect(picsNames()).toContain('booth_1.png'));
    expect(picsNames().length).toBe(before + 1);

    const got: string[] = [];
    const off = events.on('messenger:setDisplayPicture', ({ fileId }) =>
      got.push(fileId),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Set as display picture' }),
    );
    off();
    const saved = useFsStore
      .getState()
      .list(FS_FOLDERS.pics)
      .find((n) => n.name === 'booth_1.png');
    expect(saved?.type).toBe('image');
    expect(saved?.blobKey).toBeTruthy();
    expect(got).toEqual([saved?.id]);
    expect(nextBoothName()).toBe('booth_2.png');

    // The photo itself opens in the Picture Viewer.
    await user.click(screen.getByRole('button', { name: 'Open booth_1.png' }));
    const viewer = useWindowsStore
      .getState()
      .windows.find((w) => w.appId === 'pictureviewer');
    expect(viewer?.props).toEqual({ fileId: saved?.id });
  });
});
