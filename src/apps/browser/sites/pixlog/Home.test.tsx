import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PIXLOG_PROFILES, STRANGERS } from '@/content/pixlog';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { formatNumber } from '@/i18n/format';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { recentVisitors, visitorCount } from './logic';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${PIXLOG_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const feed = () =>
  within(screen.getByRole('region', { name: 'What your friends are up to' }));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    gender: 'girl',
    language: 'en',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 5 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  cleanup();
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('pixlog home feed', () => {
  it('shows shouts and generated album and blog lines, newest first', async () => {
    open('/');
    await finishLoad();
    await screen.findByRole('heading', { name: 'What your friends are up to' });
    const album = feed().getByRole('link', {
      name: 'Jess added 1 photo to “COMETS LIVE!!!”',
    });
    expect(album.getAttribute('href')).toBe(
      `http://${PIXLOG_HOST}/album?id=jess-comets-show`,
    );
    expect(
      feed()
        .getByRole('link', {
          name: 'Jess wrote a new blog post: “the countdown”',
        })
        .getAttribute('href'),
    ).toBe(`http://${PIXLOG_HOST}/jess?tab=blog`);
    expect(feed().getByText('cant sleep. too excited')).toBeTruthy();
    const items = feed().getAllByRole('listitem');
    expect(items[0]!.textContent).toContain('COMETS LIVE!!!');
    expect(items[0]!.textContent).toContain('today');
    expect(items.at(-1)!.textContent).toContain('4 days ago');
  });

  it('day-gates the feed', async () => {
    useWorldStore.setState({ day: 1 });
    open('/');
    await finishLoad();
    await screen.findByRole('heading', { name: 'What your friends are up to' });
    expect(feed().queryByText(/COMETS LIVE/)).toBeNull();
    expect(feed().getByText('cant sleep. too excited')).toBeTruthy();
  });

  it('shows the visitors box with counter, pictures, names and day labels', async () => {
    open('/');
    await finishLoad();
    const box = within(
      await screen.findByRole('region', { name: 'Who visited my profile' }),
    );
    expect(
      box.getByText(`${formatNumber(visitorCount(5), 'en')} visitors so far`),
    ).toBeTruthy();
    const expected = recentVisitors(PIXLOG_PROFILES, 5, STRANGERS);
    expect(box.getAllByRole('listitem')).toHaveLength(expected.length);
    for (const v of expected) {
      const name = v.kind === 'friend' ? 'Jess' : v.name;
      expect(box.getByRole('img', { name: `${name}'s picture` })).toBeTruthy();
    }
    expect(box.getByRole('link', { name: /Jess/ }).getAttribute('href')).toBe(
      `http://${PIXLOG_HOST}/jess`,
    );
    expect(box.getAllByText('today').length).toBeGreaterThan(0);
  });

  it('renders the same for a boy (no player-directed text here)', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    open('/');
    await finishLoad();
    await screen.findByRole('heading', { name: 'What your friends are up to' });
    expect(
      feed().getByRole('link', {
        name: 'Jess added 1 photo to “COMETS LIVE!!!”',
      }),
    ).toBeTruthy();
  });

  it('is German when the language is German', async () => {
    useSettingsStore.setState({ language: 'de' });
    open('/');
    await finishLoad();
    const box = within(
      await screen.findByRole('region', { name: 'Wer war auf meinem Profil' }),
    );
    expect(
      box.getByText(`bisher ${formatNumber(visitorCount(5), 'de')} Besucher`),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: 'Jess hat 1 Foto zu „COMETS LIVE!!!“ hinzugefügt',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Jess ruft:')).toBeTruthy();
  });
});
