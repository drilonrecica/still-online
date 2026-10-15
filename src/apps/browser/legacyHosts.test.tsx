// Migration: Spaceport became Friendspace in v0.4. Old urls redirect wherever they come from.
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { titleOf } from '@/test/windowTitle';
import '@/apps/registry';
import Browser from './Browser';
import { LEGACY_HOSTS, redirectLegacyUrl } from './legacyHosts';
import { resolve } from './sites';
import {
  DEFAULT_FAVORITES,
  WEB_DEFAULTS,
  renderFavorites,
  sanitizeWeb,
  useWebStore,
} from './store';
import { normalizeUrl, parseUrl, resolveHref } from './url';
import { useNavigation } from './useNavigation';

const OLD = 'spaceport.example';
const NEW = 'friendspace.example';

describe('redirectLegacyUrl', () => {
  it('maps the old host to the new one, keeping path and query', () => {
    expect(LEGACY_HOSTS[OLD]).toBe(NEW);
    expect(redirectLegacyUrl(`http://${OLD}/jess?tab=comments#top`)).toBe(
      `http://${NEW}/jess?tab=comments#top`,
    );
    expect(redirectLegacyUrl(`http://www.${OLD}/`)).toBe(`http://www.${NEW}/`);
    expect(redirectLegacyUrl(`http://${OLD.toUpperCase()}`)).toBe(
      `http://${NEW}`,
    );
  });

  it('leaves other hosts and look-alikes alone', () => {
    for (const url of [
      'http://searchly.example/search?q=spaceport.example',
      'http://notspaceport.example/',
      'http://spaceport.example.example/',
      'not a url',
    ]) {
      expect(redirectLegacyUrl(url)).toBe(url);
    }
  });
});

describe('browser url resolution', () => {
  it('redirects typed addresses', () => {
    expect(normalizeUrl(OLD)).toBe(`http://${NEW}/`);
    expect(normalizeUrl(`  www.SpacePort.example/Kayla?x=1 `)).toBe(
      `http://www.${NEW}/Kayla?x=1`,
    );
    expect(parseUrl(`${OLD}/kayla/`)?.url).toBe(`http://${NEW}/kayla`);
    expect(resolve(`http://${OLD}/jess`)?.site.host).toBe(NEW);
  });

  it('redirects links inside pages', () => {
    const base = 'http://tinfoilcomets.example/guestbook';
    expect(resolveHref(base, `${OLD}/jess`)).toBe(`http://${NEW}/jess`);
    expect(resolveHref(base, `http://${OLD}/me`)).toBe(`http://${NEW}/me`);
  });

  it('keeps only the new host in history', () => {
    const { result } = renderHook(() => useNavigation(`http://${OLD}/`));
    act(() => result.current.go(`${OLD}/kayla`));
    act(() => result.current.follow(`http://${OLD}/me`));
    expect(result.current.history.entries).toEqual([
      `http://${NEW}/`,
      `http://${NEW}/kayla`,
      `http://${NEW}/me`,
    ]);
  });
});

describe('saved favorites', () => {
  const sanitize = (favorites: unknown) =>
    sanitizeWeb({ favorites }, WEB_DEFAULTS).favorites;

  it('points old favorites at the new host and drops the old default name', () => {
    const favorites = sanitize([
      { title: 'Spaceport', url: `http://${OLD}/` },
      { title: 'My Spaceport', url: `http://${OLD}/me` },
      { url: `http://${OLD}/kayla` },
    ]);
    expect(favorites).toEqual([
      { url: `http://${NEW}/` },
      { title: 'My Spaceport', url: `http://${NEW}/me` },
      { url: `http://${NEW}/kayla` },
    ]);
    expect(renderFavorites(favorites, 'en')[0]?.title).toBe('Friendspace');
    expect(renderFavorites(favorites, 'de')[0]?.title).toBe('Friendspace');
  });

  it('merges an old favorite with its new twin', () => {
    expect(
      sanitize([{ url: `http://${NEW}/` }, { url: `http://${OLD}/` }]),
    ).toEqual([{ url: `http://${NEW}/` }]);
  });

  it('rehydrates a saved old favorite on the new host', async () => {
    localStorage.setItem(
      'still-online:v1:web',
      JSON.stringify({
        state: { favorites: [{ title: 'Spaceport', url: `http://${OLD}/` }] },
        version: 1,
      }),
    );
    await useWebStore.persist.rehydrate();
    expect(useWebStore.getState().favorites).toEqual([
      { url: `http://${NEW}/` },
    ]);
  });
});

describe('restored Web Explorer windows', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useSettingsStore.setState({ connectAutomatically: true, muted: true });
    useWebStore.setState({
      ...WEB_DEFAULTS,
      favorites: [...DEFAULT_FAVORITES],
    });
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

  it('opens an old props.url on Friendspace and saves the new url', async () => {
    const props = { url: `http://${OLD}/jess` };
    const windowId = useWindowsStore.getState().openApp('browser', props);
    render(<Browser windowId={windowId} props={props} />);
    expect(screen.getByLabelText('Address')).toHaveValue(`http://${NEW}/jess`);
    expect(
      useWindowsStore.getState().windows.find((w) => w.id === windowId)?.props,
    ).toEqual({ url: `http://${NEW}/jess` });
    await act(() => vi.advanceTimersByTimeAsync(1400));
    await vi.waitFor(() =>
      expect(titleOf(windowId)).toMatch(/on Friendspace - Web Explorer$/),
    );
  });
});
