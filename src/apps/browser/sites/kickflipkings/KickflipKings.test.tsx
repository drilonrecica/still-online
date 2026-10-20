import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${KICKFLIP_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const names = (els: HTMLElement[]) =>
  els.map((a) => a.getAttribute('aria-label'));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
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

describe('kickflipkings.example', () => {
  it('home shows the news and a read-only shoutbox out by today', async () => {
    useWorldStore.setState({ day: 2 });
    open('/');
    await finishLoad();
    expect(names(await screen.findAllByRole('article'))).toEqual([
      'show alert: velvet lantern @ the bean cellar',
      'dex is FILMING',
      'KICKFLIP KINGS IS ONLINE!!!',
    ]);
    const shouts = screen.getByRole('list', { name: 'Shouts' });
    expect(within(shouts).getAllByRole('listitem')).toHaveLength(7);
    expect(shouts).toHaveTextContent(/huge camcorder/);
    expect(shouts).not.toHaveTextContent(/high five/);
    expect(screen.getByText(/only the crew can shout/)).toBeTruthy();
    const page = shouts.closest('main') as HTMLElement;
    expect(within(page).queryByRole('textbox')).toBeNull();
    expect(screen.getByText(/^yo skater girl!!/)).toBeTruthy();
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/');
    await finishLoad();
    expect(
      (await screen.findAllByRole('article'))[0]?.getAttribute('aria-label'),
    ).toBe('WORLD PREMIERE: the dex video');
  });

  it('greets a boy as a dude', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    open('/');
    await finishLoad();
    expect(await screen.findByText(/^yo dude!!/)).toBeTruthy();
    expect(screen.queryByText(/skater girl/)).toBeNull();
  });

  it('the crew page has Dex and three more; his best trick updates on day 4', async () => {
    open('/crew');
    await finishLoad();
    const crew = await screen.findByRole('list', { name: 'Crew members' });
    expect(names(within(crew).getAllByRole('listitem'))).toEqual([
      'Kev',
      'Sam',
      'Rico',
      'Dex',
    ]);
    expect(
      within(crew).getByRole('listitem', { name: 'Dex' }),
    ).toHaveTextContent(/kickflip \(almost\)/);
    cleanup();

    useWorldStore.setState({ day: 4 });
    open('/crew');
    await finishLoad();
    expect(
      await screen.findByRole('listitem', { name: 'Dex' }),
    ).toHaveTextContent(/LANDED/);
  });

  it("tricks go ollie to kickflip; Dex's story appears on day 4", async () => {
    useWorldStore.setState({ day: 3 });
    open('/tricks');
    await finishLoad();
    expect(names(await screen.findAllByRole('article'))).toEqual([
      'Ollie',
      'Pop Shove-It',
      'Kickflip',
    ]);
    expect(
      screen.getByRole('list', { name: 'How to do the Kickflip' }),
    ).toHaveTextContent(/flick ur front foot/);
    expect(screen.getByText(/still working on it/)).toBeTruthy();
    cleanup();

    useWorldStore.setState({ day: 4 });
    open('/tricks');
    await finishLoad();
    const story = await screen.findByRole('region', {
      name: 'DEX: HOW I LANDED IT',
    });
    expect(story).toHaveTextContent(/lens cap on/);
  });

  it('the video is a teaser until day 5, then buffers to 99% forever', async () => {
    useWorldStore.setState({ day: 4 });
    open('/video');
    await finishLoad();
    expect(await screen.findByText(/premiere: tomorrow!!/)).toBeTruthy();
    expect(screen.getByText(/didnt film it/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Play the video' })).toBeNull();
    cleanup();

    useWorldStore.setState({ day: 5 });
    const user = open('/video');
    await finishLoad();
    const player = await screen.findByRole('region', { name: 'Video player' });
    expect(player).toHaveTextContent('dex productions presents: a blur');
    expect(screen.getByText(/THE SOUND/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Play the video' }));
    expect(within(player).getByRole('status')).toHaveTextContent(
      'buffering… 0%',
    );
    // One tick per render: the next one is scheduled after the re-render.
    for (let i = 0; i < 25; i++)
      await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(within(player).getByRole('status')).toHaveTextContent(
      'buffering… 99%',
    );
    expect(screen.getByText(/stuck at 99%/)).toBeTruthy();
  });

  it("week two: the view counter climbs from day 6 and Kev's Jam clip appears on day 9", async () => {
    useWorldStore.setState({ day: 5 });
    open('/video');
    await finishLoad();
    await screen.findByRole('region', { name: 'Video player' });
    expect(screen.queryByText(/views/)).toBeNull();
    cleanup();

    useWorldStore.setState({ day: 6 });
    open('/video');
    await finishLoad();
    expect(await screen.findByText(/length 0:30 · 41 views/)).toBeTruthy();
    expect(screen.queryByText(/kevs clip/)).toBeNull();
    cleanup();

    useSettingsStore.setState({ gender: 'boy' });
    useWorldStore.setState({ day: 9 });
    open('/video');
    await finishLoad();
    expect(await screen.findByText(/length 0:30 · 140 views/)).toBeTruthy();
    const clip = screen.getByRole('region', {
      name: 'NEW: kevs clip. dex at the westfield jam',
    });
    expect(clip).toHaveTextContent(/length 0:06.*lens cap OFF/);
    cleanup();

    useSettingsStore.setState({ language: 'de' });
    useWorldStore.setState({ day: 10 });
    open('/video');
    await finishLoad();
    expect(await screen.findByText(/Länge 0:30 · 212 Aufrufe/)).toBeTruthy();
  });

  it('week two: the next Velvet Lantern show moves to the rec hall, then reads as played', async () => {
    useWorldStore.setState({ day: 8 });
    open('/gigs');
    await finishLoad();
    const day8 = await screen.findByRole('list', { name: 'Shows' });
    const next = within(day8).getAllByRole('listitem')[2]!;
    expect(next).toHaveTextContent(/the westfield rec hall/);
    expect(next).toHaveTextContent(/saturday\. doors at 6/);
    expect(next).toHaveTextContent(/bingo always wins.*The Grip Tapes open/);
    cleanup();

    useWorldStore.setState({ day: 10 });
    open('/gigs');
    await finishLoad();
    const day10 = await screen.findByRole('list', { name: 'Shows' });
    expect(within(day10).getAllByRole('listitem')[2]).toHaveTextContent(
      /the westfield rec hall.*played tonight.*83 ppl/,
    );
  });

  it('gigs list the Velvet Lantern bean cellar show, then its review', async () => {
    open('/gigs');
    await finishLoad();
    const gigs = await screen.findByRole('list', { name: 'Shows' });
    expect(names(within(gigs).getAllByRole('listitem'))).toEqual([
      'The Grip Tapes',
    ]);
    expect(screen.getByText(/no shows booked/)).toBeTruthy();
    cleanup();

    useWorldStore.setState({ day: 4 });
    open('/gigs');
    await finishLoad();
    const day4 = await screen.findByRole('list', { name: 'Shows' });
    expect(within(day4).getAllByRole('listitem')[1]).toHaveTextContent(
      /bean cellar.*paint bucket/,
    );
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/gigs');
    await finishLoad();
    const day5 = await screen.findByRole('list', { name: 'Shows' });
    expect(within(day5).getAllByRole('listitem')[1]).toHaveTextContent(
      /played last night.*SOLD OUT/,
    );
  });

  it('reads like a German skate site', async () => {
    useSettingsStore.setState({ language: 'de', gender: 'boy' });
    useWorldStore.setState({ day: 5 });
    const user = open('/');
    await finishLoad();
    expect(
      await screen.findByRole('article', {
        name: 'WELTPREMIERE: das dex-video',
      }),
    ).toBeTruthy();
    expect(screen.getByText(/^jo alter!!/)).toBeTruthy();
    expect(screen.getAllByText(/^von Kickflip_Kev, heute$/)).toHaveLength(1);
    await user.click(screen.getByRole('link', { name: 'KONZERTE' }));
    await finishLoad();
    expect(
      await screen.findByRole('list', { name: 'Konzerte' }),
    ).toHaveTextContent(/war gestern abend.*AUSVERKAUFT/);
    await user.click(screen.getByRole('link', { name: 'VIDEO' }));
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Video abspielen' }),
    );
    expect(
      within(screen.getByRole('region', { name: 'Videoplayer' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('wird geladen… 0 %');
  });
});
