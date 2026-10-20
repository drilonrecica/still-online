import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { events, type OsEventMap } from '@/os/events';
import { useNetworkStore } from '@/os/network';
import { NOW_PLAYING_IDLE, useNowPlayingStore } from '@/os/nowPlaying';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { pageTitle, resolve } from '..';

const LOAD = 1400;
const VOXEL = {
  trackId: 'voxel-revolution',
  artist: 'Kevin MacLeod',
  title: 'Voxel Revolution',
  durationSec: 130,
};

function open(path: string) {
  const url = `http://${FRIENDSPACE_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return { user };
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const emit = <K extends 'amplifier:trackChanged' | 'amplifier:progress'>(
  type: K,
  payload: OsEventMap[K],
) => act(() => events.emit(type, payload));

let enqueued: Mock<(p: OsEventMap['amplifier:enqueue']) => void>;
let controlled: Mock<(p: OsEventMap['amplifier:control']) => void>;
let offs: (() => void)[] = [];

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: false,
    playerName: 'Ada',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 1 });
  useNowPlayingStore.setState({ ...NOW_PLAYING_IDLE });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
  enqueued = vi.fn();
  controlled = vi.fn();
  offs = [
    events.on('amplifier:enqueue', enqueued),
    events.on('amplifier:control', controlled),
  ];
});

afterEach(() => {
  offs.forEach((off) => off());
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('friendspace band pages', () => {
  it('registers a fixed, titled page per band', () => {
    const page = resolve(`${FRIENDSPACE_HOST}/band/tinfoil-comets`);
    expect(page && pageTitle(page, 'en')).toBe(
      'Tinfoil Comets on Friendspace Music',
    );
    expect(page && pageTitle(page, 'de')).toBe(
      'Tinfoil Comets auf Friendspace Music',
    );
    expect(resolve(`${FRIENDSPACE_HOST}/band/nobody`)).toBeNull();
  });

  it('shows the band card, bio, day-gated shows and blog', async () => {
    useSettingsStore.setState({ muted: true });
    open('/band/tinfoil-comets');
    await finishLoad();
    const page = await screen.findByTestId('band');
    expect(
      within(page).getByRole('heading', { name: 'Tinfoil Comets' }),
    ).toBeTruthy();
    expect(within(page).getByText('Space Rock / Indie / Robot')).toBeTruthy();
    expect(within(page).getByText(/thx 4 the adds/)).toBeTruthy();
    expect(within(page).getByText(/Riverside Arena - SOLD OUT/)).toBeTruthy();
    expect(within(page).queryByText(/the big show/)).toBeNull();
    expect(within(page).getByText('riverside!!!')).toBeTruthy();
    expect(within(page).queryByText('practice update')).toBeNull();
  });

  it('shows empty states before a band has shows or blog posts', async () => {
    useSettingsStore.setState({ muted: true });
    open('/band/velvet-lantern');
    await finishLoad();
    const page = await screen.findByTestId('band');
    expect(
      within(page).getByRole('heading', { name: 'Velvet Lantern' }),
    ).toBeTruthy();
    expect(within(page).getByText(/No shows booked yet/)).toBeTruthy();
    expect(within(page).getByText('No blog entries yet.')).toBeTruthy();
  });

  it('reveals later shows and blog posts on later days', async () => {
    useSettingsStore.setState({ muted: true });
    useWorldStore.setState({ day: 4 });
    open('/band/tinfoil-comets');
    await finishLoad();
    await screen.findByTestId('band');
    expect(screen.getByText(/the big show/)).toBeTruthy();
    expect(screen.getByText('practice update')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Past Shows' })).toBeNull();
  });

  it('moves played shows from Upcoming Shows to Past Shows', async () => {
    useSettingsStore.setState({ muted: true });
    useWorldStore.setState({ day: 10 });
    open('/band/velvet-lantern');
    await finishLoad();
    const page = await screen.findByTestId('band');
    const box = (name: string) =>
      within(page).getByRole('heading', { name }).parentElement!;
    expect(
      within(box('Upcoming Shows')).getByText(/No shows booked yet/),
    ).toBeTruthy();
    const past = within(box('Past Shows'))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(past).toEqual([
      'played. 83 people. the mic was upside down. so were we',
      'the bean cellar. 11 people. 6 songs. the bucket is in the act now',
    ]);
  });

  it('is linked from a friend’s Top 8', async () => {
    useSettingsStore.setState({ muted: true });
    const { user } = open('/jess');
    await finishLoad();
    const top8 = await screen.findByRole('list', { name: 'Top 8' });
    await user.click(
      within(top8).getByRole('link', { name: /Tinfoil Comets/ }),
    );
    await finishLoad();
    expect(await screen.findByTestId('band-player')).toBeTruthy();
  });
});

describe('BandPlayer', () => {
  beforeEach(() => useSettingsStore.setState({ muted: true }));

  async function player() {
    const view = open('/band/tinfoil-comets');
    await finishLoad();
    return { ...view, box: await screen.findByTestId('band-player') };
  }

  it('plays a track through the Amplifier and reflects its state', async () => {
    const { user, box } = await player();
    expect(within(box).getByText('-- press play --')).toBeTruthy();

    await user.click(within(box).getByRole('button', { name: 'Play' }));
    expect(enqueued).toHaveBeenCalledWith({
      trackId: 'voxel-revolution',
      play: true,
    });

    emit('amplifier:trackChanged', VOXEL);
    emit('amplifier:progress', {
      trackId: 'voxel-revolution',
      position: 65,
      duration: 130,
      playing: true,
    });
    expect(within(box).getByText('Voxel Revolution')).toBeTruthy();
    expect(within(box).getByText('1:05 / 2:10')).toBeTruthy();
    expect(within(box).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '65',
    );
    expect(
      within(box).getByRole('button', { name: 'Play Voxel Revolution' }),
    ).toHaveAttribute('aria-current', 'true');

    await user.click(within(box).getByRole('button', { name: 'Pause' }));
    expect(controlled).toHaveBeenLastCalledWith({ action: 'pause' });

    emit('amplifier:progress', {
      trackId: 'voxel-revolution',
      position: 65,
      duration: 130,
      playing: false,
    });
    await user.click(within(box).getByRole('button', { name: 'Play' }));
    expect(controlled).toHaveBeenLastCalledWith({ action: 'resume' });
  });

  it('starts a track from the list', async () => {
    const { user, box } = await player();
    const list = within(box).getByRole('list', { name: 'Songs' });
    await user.click(
      within(list).getByRole('button', { name: 'Play Voxel Revolution' }),
    );
    expect(enqueued).toHaveBeenCalledWith({
      trackId: 'voxel-revolution',
      play: true,
    });
  });

  it('stays idle while another track plays', async () => {
    const { box } = await player();
    emit('amplifier:trackChanged', { ...VOXEL, trackId: 'surf-shimmy' });
    expect(within(box).getByText('-- press play --')).toBeTruthy();
    expect(within(box).getByRole('button', { name: 'Play' })).toBeTruthy();
  });
});

describe('profile-song autoplay', () => {
  it('queues the band’s first song once when unmuted, idle and enabled', async () => {
    open('/band/tinfoil-comets');
    await finishLoad();
    await screen.findByTestId('band');
    expect(enqueued).toHaveBeenCalledTimes(1);
    expect(enqueued).toHaveBeenCalledWith({
      trackId: 'voxel-revolution',
      play: true,
      quiet: true,
    });
  });

  it('queues a friend’s profile song', async () => {
    open('/dex');
    await finishLoad();
    await screen.findByTestId('profile');
    expect(enqueued).toHaveBeenCalledWith({
      trackId: 'cool-rock',
      play: true,
      quiet: true,
    });
  });

  it('does nothing when muted', async () => {
    useSettingsStore.setState({ muted: true });
    open('/dex');
    await finishLoad();
    await screen.findByTestId('profile');
    expect(enqueued).not.toHaveBeenCalled();
  });

  it('does nothing while the Amplifier is already playing', async () => {
    events.emit('amplifier:trackChanged', VOXEL);
    open('/dex');
    await finishLoad();
    await screen.findByTestId('profile');
    expect(enqueued).not.toHaveBeenCalled();
  });

  it('does nothing when the player turned it off', async () => {
    useWebStore.setState({
      myProfile: {
        headline: '',
        mood: { text: '', emoticon: ':)' },
        aboutMe: '',
        songTrackId: null,
        themePreset: 'default',
        customColors: null,
        top8: [],
        autoplay: false,
      },
    });
    open('/dex');
    await finishLoad();
    await screen.findByTestId('profile');
    expect(enqueued).not.toHaveBeenCalled();
  });

  it('never autoplays on the player’s own page', async () => {
    useWebStore.setState({
      myProfile: {
        headline: '',
        mood: { text: '', emoticon: ':)' },
        aboutMe: '',
        songTrackId: 'cool-rock',
        themePreset: 'default',
        customColors: null,
        top8: [],
      },
    });
    open('/me');
    await finishLoad();
    await screen.findByTestId('profile');
    expect(enqueued).not.toHaveBeenCalled();
  });
});

describe('song strip stop and the autoplay setting', () => {
  it('■ stops the profile song while the Amplifier holds it', async () => {
    useSettingsStore.setState({ muted: true });
    const { user } = open('/dex');
    await finishLoad();
    const strip = await screen.findByRole('region', { name: 'Profile song' });
    const stop = within(strip).getByRole('button', { name: 'Stop' });
    expect(stop).toBeDisabled();

    emit('amplifier:trackChanged', {
      ...VOXEL,
      trackId: 'cool-rock',
      title: 'Cool Rock',
    });
    await user.click(stop);
    expect(controlled).toHaveBeenCalledWith({ action: 'stop' });
  });

  it('/me’s checkbox turns autoplay off and on', async () => {
    const { user } = open('/me');
    await finishLoad();
    const box = await screen.findByRole('checkbox', {
      name: 'Autoplay profile songs',
    });
    expect(box).toBeChecked();
    await user.click(box);
    expect(useWebStore.getState().myProfile?.autoplay).toBe(false);
    expect(
      screen.getByRole('checkbox', { name: 'Autoplay profile songs' }),
    ).not.toBeChecked();
    await user.click(
      screen.getByRole('checkbox', { name: 'Autoplay profile songs' }),
    );
    expect(useWebStore.getState().myProfile?.autoplay).toBe(true);
  });

  it('the profile editor saves the autoplay setting', async () => {
    const { user } = open('/me');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    const form = screen.getByRole('form', { name: 'Edit Profile' });
    await user.click(
      within(form).getByRole('checkbox', { name: 'Autoplay profile songs' }),
    );
    await user.click(
      within(form).getByRole('button', { name: 'Save Changes' }),
    );
    expect(useWebStore.getState().myProfile?.autoplay).toBe(false);
  });

  it('speaks German', async () => {
    useSettingsStore.setState({ language: 'de', muted: true });
    open('/band/tinfoil-comets');
    await finishLoad();
    const box = await screen.findByTestId('band-player');
    expect(within(box).getByRole('button', { name: 'Abspielen' })).toBeTruthy();
    expect(
      screen.getByRole('region', { name: 'Nächste Auftritte' }),
    ).toBeTruthy();
    expect(within(box).getByText('-- auf Play drücken --')).toBeTruthy();
  });
});
