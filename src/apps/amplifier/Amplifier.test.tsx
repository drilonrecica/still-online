import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaylistTrack } from '@/content/playlist';
import Amplifier from './Amplifier';
import { useAmplifierStore } from './store';

vi.mock('@/os/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));
import { useReducedMotion } from '@/os/useReducedMotion';

const track: PlaylistTrack = {
  id: 't0',
  title: 'Song',
  artist: 'Band',
  file: 'music/t0.mp3',
  durationSec: 187,
  license: 'CC BY 4.0',
};

const spies = () => ({
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  next: vi.fn(),
  prev: vi.fn(),
  seek: vi.fn(),
  setVolume: vi.fn(),
  toggleShuffle: vi.fn(),
  cycleRepeat: vi.fn(),
  togglePlay: vi.fn(),
});

function renderAmp(
  state: Partial<ReturnType<typeof useAmplifierStore.getState>> = {},
) {
  const actions = spies();
  act(() =>
    useAmplifierStore.setState({
      playlist: [track],
      index: 0,
      status: 'playing',
      currentTime: 65,
      duration: 187,
      volume: 0.5,
      shuffle: false,
      repeat: 'off',
      ...actions,
      ...state,
    }),
  );
  render(<Amplifier windowId="w1" props={{}} />);
  return actions;
}

describe('Amplifier', () => {
  beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(false));
  afterEach(() => vi.clearAllMocks());

  it('shows elapsed time, toggles to remaining, and the marquee text', async () => {
    renderAmp();
    expect(screen.getByLabelText('Time elapsed').textContent).toBe('1:05');
    expect(screen.getByTestId('marquee').textContent).toBe(
      '1. Band - Song (3:07)',
    );
    await userEvent.click(screen.getByLabelText('Time elapsed'));
    expect(screen.getByLabelText('Time remaining').textContent).toBe('-2:02');
  });

  it('transport and toggle buttons call the store', async () => {
    const a = renderAmp();
    for (const [name, fn] of [
      ['Previous', a.prev],
      ['Play', a.play],
      ['Pause', a.pause],
      ['Stop', a.stop],
      ['Next', a.next],
      ['Shuffle', a.toggleShuffle],
      ['Repeat: off', a.cycleRepeat],
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name }));
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });

  it('sliders call seek and setVolume', () => {
    const a = renderAmp();
    fireEvent.change(screen.getByLabelText('Seek'), {
      target: { value: '90' },
    });
    expect(a.seek).toHaveBeenCalledWith(90);
    fireEvent.change(screen.getByLabelText('Volume'), {
      target: { value: '25' },
    });
    expect(a.setVolume).toHaveBeenCalledWith(0.25);
  });

  it('keyboard: Space toggles play, arrows seek', async () => {
    const a = renderAmp();
    const root = screen.getByRole('group', { name: 'Amplifier' });
    root.focus();
    await userEvent.keyboard(' ');
    expect(a.togglePlay).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ArrowRight}');
    expect(a.seek).toHaveBeenLastCalledWith(70);
    await userEvent.keyboard('{ArrowLeft}');
    expect(a.seek).toHaveBeenLastCalledWith(60);
  });

  it('marquee is static with reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderAmp();
    expect(screen.getByTestId('marquee').dataset.static).toBe('true');
  });
});
