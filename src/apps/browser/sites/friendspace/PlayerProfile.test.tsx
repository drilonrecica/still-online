// v0.4.1 (F-01): `/me` saves only what the player typed, so untouched fields follow the language
// and gender; the page scrolls up after Save; the player's picture is their User Accounts tile.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { userPictureSrc } from '@/os/user/sources';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(host: string, path: string) {
  const url = `http://${host}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(<Browser windowId={windowId} props={{ url }} />);
  return { user, ...view };
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));

/** Opens `/me`, pastes a layout code (and types `headline` if given) and saves. */
async function saveWithLayout(headline?: string) {
  const { user } = open(FRIENDSPACE_HOST, '/me');
  await finishLoad();
  await user.click(await screen.findByRole('button', { name: 'Edit Profile' }));
  const form = screen.getByRole('form', { name: 'Edit Profile' });
  if (headline !== undefined) {
    const field = within(form).getByLabelText('Headline:');
    await user.clear(field);
    await user.type(field, headline);
  }
  await user.click(within(form).getByLabelText('Layout code:'));
  await user.paste('[layout bg=starry]');
  await user.click(within(form).getByRole('button', { name: 'Save Changes' }));
  return user;
}

const pictureSrc = (name: string) =>
  screen.getByRole('img', { name }).getAttribute('src');

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    playerName: 'Ada',
    gender: 'girl',
    language: 'en',
    userPicture: null,
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 1 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('/me default text after Save', () => {
  it('a pasted layout alone saves no text; German and boy show their own defaults', async () => {
    await saveWithLayout();
    const saved = useWebStore.getState().myProfile;
    expect(saved?.layoutCode).toBe('[layout bg=starry]');
    for (const k of ['headline', 'mood', 'aboutMe', 'themePreset'])
      expect(saved).not.toHaveProperty(k);
    expect(screen.getByText(/new 2 Friendspace/)).toBeTruthy();

    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(screen.getByText(/neu auf Friendspace!!/)).toBeTruthy();
    expect(screen.getByText('albern')).toBeTruthy();
    expect(screen.queryByText(/new 2 Friendspace/)).toBeNull();

    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(screen.getByText(/skaten bis zum umfallen/)).toBeTruthy();
    expect(screen.getByText('gelangweilt')).toBeTruthy();
    expect(screen.getByText(/^Hey\. Ich bin neu auf Friendspace/)).toBeTruthy();

    act(() => useSettingsStore.setState({ language: 'en' }));
    expect(screen.getByText(/skate all day/)).toBeTruthy();
    expect(screen.getByText(/^Hey\. I just joined Friendspace/)).toBeTruthy();
  });

  it('typed fields stay after a language and gender switch', async () => {
    await saveWithLayout('still online');
    expect(useWebStore.getState().myProfile).toMatchObject({
      headline: 'still online',
    });
    act(() => useSettingsStore.setState({ language: 'de', gender: 'boy' }));
    expect(screen.getByText(/still online/)).toBeTruthy();
    expect(screen.getByText('gelangweilt')).toBeTruthy();
  });

  it('scrolls the page back to the top after Save', async () => {
    const { user } = open(FRIENDSPACE_HOST, '/me');
    await finishLoad();
    const viewport = screen.getByTestId('browser-viewport');
    let top = 0;
    Object.defineProperty(viewport, 'scrollTop', {
      get: () => top,
      set: (v: number) => (top = v),
    });
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    top = 640;
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(top).toBe(0);
  });
});

describe('the player picture is the User Accounts tile', () => {
  it('on /me, following gender and picture changes live', async () => {
    open(FRIENDSPACE_HOST, '/me');
    await finishLoad();
    await screen.findByRole('button', { name: 'Edit Profile' });
    expect(pictureSrc("Ada's picture")).toBe(userPictureSrc('butterfly'));
    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(pictureSrc("Ada's picture")).toBe(userPictureSrc('skateboard'));
    act(() => useSettingsStore.setState({ userPicture: 'rocket' }));
    expect(pictureSrc("Ada's picture")).toBe(userPictureSrc('rocket'));
  });

  it("in a friend's Top 8", async () => {
    useSettingsStore.setState({ userPicture: 'kitten' });
    open(FRIENDSPACE_HOST, '/jess');
    await finishLoad();
    const top8 = await screen.findByRole('list', { name: 'Top 8' });
    const me = within(top8)
      .getAllByRole('listitem')
      .find((li) => li.textContent === 'Ada');
    expect(me?.querySelector('img')?.getAttribute('src')).toBe(
      userPictureSrc('kitten'),
    );
  });

  it('on the Pixlog /me, in German too', async () => {
    useSettingsStore.setState({ userPicture: 'football', language: 'de' });
    open(PIXLOG_HOST, '/me');
    await finishLoad();
    expect(await screen.findByRole('img', { name: 'Dein Bild' })).toBeTruthy();
    expect(pictureSrc('Dein Bild')).toBe(userPictureSrc('football'));
    act(() => useSettingsStore.setState({ userPicture: 'controller' }));
    expect(pictureSrc('Dein Bild')).toBe(userPictureSrc('controller'));
  });
});
