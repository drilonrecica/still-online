// P1-03 end to end in the browser: a pasted layout code changes /me (preview first, then the saved
// page), friends' extras and comment graphics render, and the mood history grows on save.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;
const CODE = `<!-- GlitterCodez.example layout: Leopard Luxe -->
[layout bg=leopard text=#fff accent=#ff66cc font=impact glitter=on]
[cursor hearts]
[sticker skull top-left] [sticker pony bottom-right]`;

function open(path: string) {
  const url = `http://${FRIENDSPACE_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return { user };
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const stickersIn = (el: HTMLElement) =>
  [...el.querySelectorAll('[data-sticker]')].map((s) =>
    s.getAttribute('data-sticker'),
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    playerName: 'Ada',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 2 });
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

describe('layout codes on /me', () => {
  it('a pasted code shows in the live preview, then changes the saved profile', async () => {
    const { user } = open('/me');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    expect(
      screen.getByText('paste your code from glittercodez.example!'),
    ).toBeTruthy();
    const preview = screen.getByRole('group', { name: 'Preview:' });
    expect(stickersIn(preview)).toEqual([]);

    await user.click(screen.getByLabelText('Layout code:'));
    await user.paste(CODE);
    expect(stickersIn(preview)).toEqual(['skull', 'pony']);
    expect(preview).toHaveStyle({ color: '#fff' });

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(useWebStore.getState().myProfile?.layoutCode).toBe(CODE);
    const profile = screen.getByTestId('profile');
    expect(profile).toHaveStyle({ color: '#fff' });
    expect(profile.style.fontFamily).toContain('Impact');
    expect(profile.style.getPropertyValue('--sp-accent')).toBe('#ff66cc');
    expect(stickersIn(profile)).toEqual(['skull', 'pony']);
    expect(profile.querySelector('[data-glitter]')).toBeTruthy();
  });

  it('junk in the box changes nothing and never breaks the page', async () => {
    useWebStore.setState({
      myProfile: {
        ...useWebStore.getState().myProfile!,
        headline: 'hi',
        mood: { text: 'ok', emoticon: ':)' },
        aboutMe: '',
        songTrackId: null,
        themePreset: 'default',
        customColors: null,
        top8: [],
        layoutCode:
          '<script>alert(1)</script>[layout bg=url(x) text=red]'.repeat(80),
      },
    });
    open('/me');
    await finishLoad();
    const profile = await screen.findByTestId('profile');
    expect(stickersIn(profile)).toEqual([]);
    expect(profile.style.background).not.toContain('url(x)');
    expect(document.querySelector('script')).toBeNull();
  });

  it('a changed mood goes into the mood history under the ID card', async () => {
    const { user } = open('/me');
    await finishLoad();
    expect(screen.queryByRole('region', { name: 'Mood history' })).toBeNull();
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    const mood = screen.getByLabelText('Mood:');
    await user.clear(mood);
    await user.type(mood, 'sleepy');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    const history = screen.getByRole('region', { name: 'Mood history' });
    expect(within(history).getAllByRole('listitem')).toHaveLength(1);
    expect(history).toHaveTextContent('sleepy');
    expect(history).toHaveTextContent('today');
    expect(useWebStore.getState().myProfile?.moodHistory).toEqual([
      expect.objectContaining({ text: 'sleepy', day: 2 }),
    ]);
  });

  it("shows friends' comment graphics on the player's wall", async () => {
    open('/me');
    await finishLoad();
    expect(
      await screen.findByRole('img', { name: 'Thanks for the add!!' }),
    ).toBeTruthy();
  });
});

describe("friends' profile extras", () => {
  it("Jess's page has her stickers and a glitter heart on Kayla's comment", async () => {
    useWorldStore.setState({ day: 1 });
    open('/jess');
    await finishLoad();
    const profile = await screen.findByTestId('profile');
    expect(stickersIn(profile)).toEqual(['star', 'music']);
    expect(profile.querySelector('[data-glitter]')).toBeTruthy();
    expect(
      screen.getByRole('img', { name: '<3 glitter heart <3' }),
    ).toBeTruthy();
  });

  it('renders the graphics in German', async () => {
    useSettingsStore.setState({ language: 'de' });
    open('/me');
    await finishLoad();
    expect(
      await screen.findByRole('img', { name: 'Danke fürs Adden!!' }),
    ).toBeTruthy();
  });
});
