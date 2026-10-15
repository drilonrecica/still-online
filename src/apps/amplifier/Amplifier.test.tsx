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
  const { unmount } = render(<Amplifier windowId="w1" props={{}} />);
  return { ...actions, unmount };
}

describe('Amplifier', () => {
  beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(false));
  afterEach(() => vi.clearAllMocks());

  it('stops playback when the window closes', () => {
    const amp = renderAmp();
    expect(amp.stop).not.toHaveBeenCalled();
    amp.unmount();
    expect(amp.stop).toHaveBeenCalledOnce();
  });

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

  describe('playlist panel', () => {
    const tracks: PlaylistTrack[] = [
      track,
      { ...track, id: 't1', title: 'Other', durationSec: 60 },
    ];

    it('toggles with PL and shows durations and total', async () => {
      renderAmp({ playlist: tracks });
      expect(screen.queryByTestId('playlist')).toBeNull();
      const pl = screen.getByRole('button', { name: 'Playlist' });
      await userEvent.click(pl);
      expect(pl.getAttribute('aria-pressed')).toBe('true');
      const rows = screen.getAllByRole('option');
      expect(rows[1]?.textContent).toContain('2. Band - Other');
      expect(rows[1]?.textContent).toContain('1:00');
      expect(screen.getByTestId('playlist').textContent).toContain(
        '2 tracks / 4:07',
      );
      await userEvent.click(pl);
      expect(screen.queryByTestId('playlist')).toBeNull();
    });

    it('highlights the current track and follows changes', async () => {
      renderAmp({ playlist: tracks, index: 0 });
      await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
      const sel = () =>
        screen
          .getAllByRole('option')
          .map((r) => r.getAttribute('aria-selected'));
      expect(sel()).toEqual(['true', 'false']);
      act(() => useAmplifierStore.setState({ index: 1 }));
      expect(sel()).toEqual(['false', 'true']);
    });

    it('double-click and Enter play that track', async () => {
      const playIndex = vi.fn();
      renderAmp({ playlist: tracks, playIndex });
      await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
      const rows = screen.getAllByRole('option');
      await userEvent.dblClick(rows[1] as HTMLElement);
      expect(playIndex).toHaveBeenLastCalledWith(1);
      rows[0]?.focus();
      await userEvent.keyboard('{Enter}');
      expect(playIndex).toHaveBeenLastCalledWith(0);
    });

    it('Del removes the row and Ctrl+Down reorders', async () => {
      const three = [...tracks, { ...track, id: 't2', title: 'Third' }];
      renderAmp({ playlist: three, index: -1 });
      await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
      const ids = () => useAmplifierStore.getState().playlist.map((t) => t.id);
      screen.getAllByRole('option')[0]?.focus();
      await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
      expect(ids()).toEqual(['t1', 't0', 't2']);
      await userEvent.keyboard('{Delete}');
      expect(ids()).toEqual(['t1', 't2']);
    });

    it('ADD ▸ Shipped tracks adds a track', async () => {
      renderAmp({ playlist: [track], index: -1 });
      await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
      await userEvent.click(screen.getByRole('button', { name: 'ADD ▸' }));
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Shipped tracks…' }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Add Surf Shimmy' }),
      );
      expect(useAmplifierStore.getState().playlist.map((t) => t.id)).toEqual([
        't0',
        'surf-shimmy',
      ]);
    });

    describe('Burn CD', () => {
      beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
      afterEach(() => vi.useRealTimers());

      async function burn() {
        await userEvent.click(screen.getByRole('button', { name: 'MISC ▸' }));
        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Burn CD…' }),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Burn' }));
        for (let i = 0; i < 40; i++) {
          await act(() => vi.advanceTimersByTimeAsync(50));
        }
      }

      it('fails with a buffer underrun, then at 89%', async () => {
        renderAmp({ playlist: [track] });
        await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
        await burn();
        expect(screen.getByRole('progressbar').getAttribute('value')).toBe(
          '37',
        );
        expect(screen.getByRole('alert').textContent).toBe(
          'Buffer underrun. The disc is now a coaster.',
        );
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));
        expect(screen.queryByRole('dialog')).toBeNull();

        await burn();
        expect(screen.getByRole('progressbar').getAttribute('value')).toBe(
          '89',
        );
        expect(screen.getByRole('alert').textContent).toBe(
          'Please insert a blank disc.',
        );
      });
    });
  });
});

describe('Amplifier skins and windowshade', () => {
  beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(false));

  it('SKN cycles skins and the Skins menu picks one', async () => {
    renderAmp();
    act(() => useAmplifierStore.setState({ skin: 'metal' }));
    const root = screen.getByRole('group', { name: 'Amplifier' });
    expect(root.dataset.skin).toBe('metal');
    await userEvent.click(screen.getByRole('button', { name: /^Skin:/ }));
    expect(root.dataset.skin).toBe('neon');
    await userEvent.click(screen.getByRole('button', { name: /^Skin:/ }));
    expect(root.dataset.skin).toBe('bubblegum');
    await userEvent.click(screen.getByRole('button', { name: /^Skin:/ }));
    expect(root.dataset.skin).toBe('metal');

    fireEvent.contextMenu(screen.getByTestId('titlebar'));
    await userEvent.click(screen.getByRole('menuitem', { name: /Skins/ }));
    await userEvent.click(
      screen.getByRole('menuitemradio', { name: /Bubblegum/ }),
    );
    expect(root.dataset.skin).toBe('bubblegum');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('skin persists and rejects junk', () => {
    act(() => useAmplifierStore.getState().setSkin('neon'));
    expect(
      JSON.parse(localStorage.getItem('still-online:v1:amplifier') ?? '{}')
        .state.skin,
    ).toBe('neon');
    act(() =>
      useAmplifierStore.getState().setSkin('bogus' as unknown as 'neon'),
    );
    expect(useAmplifierStore.getState().skin).toBe('neon');
  });

  it('double-clicking the titlebar toggles the windowshade and resizes', async () => {
    const resize = vi.fn();
    const { useWindowsStore } = await import('@/os/store/windows');
    act(() =>
      useWindowsStore.setState({
        windows: [{ id: 'w1', x: 10, y: 20, w: 275, h: 116 }],
        resizeWindow: resize,
      } as never),
    );
    renderAmp();
    fireEvent.doubleClick(screen.getByTestId('titlebar'));
    expect(resize).toHaveBeenLastCalledWith('w1', {
      x: 10,
      y: 20,
      w: 275,
      h: 14,
    });
    expect(screen.queryByTestId('marquee')).toBeNull();
    expect(screen.getByTestId('shade-marquee')).toBeTruthy();
    fireEvent.doubleClick(screen.getByTestId('titlebar'));
    expect(resize).toHaveBeenLastCalledWith('w1', {
      x: 10,
      y: 20,
      w: 275,
      h: 116,
    });
    expect(screen.getByTestId('marquee')).toBeTruthy();
  });
});

describe('Amplifier equalizer panel', () => {
  beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(false));

  async function withWindow() {
    const resize = vi.fn();
    const { useWindowsStore } = await import('@/os/store/windows');
    act(() =>
      useWindowsStore.setState({
        windows: [{ id: 'w1', x: 10, y: 20, w: 275, h: 116 }],
        resizeWindow: resize,
      } as never),
    );
    const lastHeight = () =>
      (resize.mock.lastCall?.[1] as { h: number } | undefined)?.h;
    return { resize, lastHeight };
  }

  it('EQ and playlist heights stack and survive the windowshade', async () => {
    const { lastHeight } = await withWindow();
    renderAmp();
    await userEvent.click(screen.getByRole('button', { name: 'Equalizer' }));
    expect(screen.getByTestId('equalizer')).toBeTruthy();
    expect(lastHeight()).toBe(116 + 96);
    await userEvent.click(screen.getByRole('button', { name: 'Playlist' }));
    expect(lastHeight()).toBe(116 + 96 + 160);
    fireEvent.doubleClick(screen.getByTestId('titlebar'));
    expect(lastHeight()).toBe(14);
    fireEvent.doubleClick(screen.getByTestId('titlebar'));
    expect(lastHeight()).toBe(116 + 96 + 160);
    await userEvent.click(screen.getByRole('button', { name: 'Equalizer' }));
    expect(lastHeight()).toBe(116 + 160);
    expect(screen.queryByTestId('equalizer')).toBeNull();
  });

  it('ON, AUTO, presets and sliders drive the store', async () => {
    await withWindow();
    act(() =>
      useAmplifierStore.setState({
        eq: { on: false, preamp: 0, bands: Array(10).fill(0) },
      }),
    );
    renderAmp();
    await userEvent.click(screen.getByRole('button', { name: 'Equalizer' }));

    const on = screen.getByRole('button', { name: 'Equalizer on' });
    expect(on.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(on);
    expect(useAmplifierStore.getState().eq.on).toBe(true);
    expect(on.getAttribute('aria-pressed')).toBe('true');

    const auto = screen.getByRole('button', { name: 'Auto' });
    await userEvent.click(auto);
    expect(auto.getAttribute('aria-pressed')).toBe('true');

    const presets = screen.getByLabelText('Presets') as HTMLSelectElement;
    expect(presets.value).toBe('Flat');
    await userEvent.selectOptions(presets, 'Treble Boost');
    expect(useAmplifierStore.getState().eq.bands).toEqual([
      0, 0, 0, 0, 0, 2, 5, 8, 9, 10,
    ]);
    expect(presets.value).toBe('Treble Boost');

    fireEvent.change(screen.getByLabelText('60 Hz'), {
      target: { value: '4' },
    });
    expect(useAmplifierStore.getState().eq.bands[0]).toBe(4);
    expect(presets.value).toBe('');
    expect(screen.getByLabelText('60 Hz').getAttribute('aria-valuetext')).toBe(
      '+4 dB',
    );
    fireEvent.change(screen.getByLabelText('Preamp'), {
      target: { value: '-3' },
    });
    expect(useAmplifierStore.getState().eq.preamp).toBe(-3);
    expect(screen.getAllByRole('slider')).toHaveLength(2 + 11);
  });
});
