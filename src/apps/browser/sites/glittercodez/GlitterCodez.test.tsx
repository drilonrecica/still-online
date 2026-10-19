import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLayouts } from '@/content/locale';
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { LOCALES } from '@/i18n/types';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { parseLayoutCode } from '../friendspace/layoutCode';
import { buildIndex, search } from '../searchly/search';
import { SITES } from '..';
import { GLITTERCODEZ_SITE } from '.';
import {
  codeFor,
  cursorEntries,
  glitterEntries,
  layoutEntries,
  splitBySide,
  stickerEntries,
} from './logic';
import { getSiteText } from '@/content/locale';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${GLITTERCODEZ_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const codeBoxes = () =>
  screen
    .getAllByRole('textbox')
    .filter((el) => el.tagName === 'TEXTAREA') as HTMLTextAreaElement[];

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

describe.each(LOCALES)('GlitterCodez codes (%s)', (locale) => {
  const text = getSiteText(GLITTERCODEZ_HOST, locale, 'girl').GLITTERCODEZ_TEXT;
  const all = [
    ...layoutEntries(getLayouts(locale, 'girl')),
    ...glitterEntries(text),
    ...stickerEntries(text),
    ...cursorEntries(text),
  ];

  it('every published code parses back to its extras', () => {
    expect(all.length).toBeGreaterThan(15);
    for (const entry of all)
      expect(parseLayoutCode(codeFor(entry)), entry.name).toEqual(entry.extras);
  });
});

describe('splitBySide', () => {
  it('puts the player side first and hides nothing', () => {
    const layouts = getLayouts('en', 'girl');
    const girl = splitBySide(layouts, 'girl');
    const boy = splitBySide(layouts, 'boy');
    expect(girl.hot.every((l) => l.side === 'girl')).toBe(true);
    expect(boy.hot.every((l) => l.side === 'boy')).toBe(true);
    expect(girl.hot.length + girl.more.length).toBe(layouts.length);
    expect(boy.hot).toEqual(girl.more);
  });
});

describe('glittercodez.example', () => {
  it('shows the gallery with a preview and the generated code per layout', async () => {
    open('/');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'hot 4 u!!' }),
    ).toBeTruthy();
    expect(screen.getByText('NEW!!')).toBeTruthy();
    expect(screen.getByText('1.337.420')).toBeTruthy();
    const layouts = getLayouts('en', 'girl');
    expect(screen.getAllByTestId('layout-preview')).toHaveLength(
      layouts.length,
    );
    const boxes = codeBoxes();
    expect(boxes.map((b) => b.value).sort()).toEqual(
      layoutEntries(layouts).map(codeFor).sort(),
    );
  });

  it('features the boy side first for a boy', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    open('/');
    await finishLoad();
    const hot = await screen.findByRole('region', { name: 'hot 4 u!!' });
    expect(
      within(hot).getByRole('article', { name: 'Skater Grunge' }),
    ).toBeTruthy();
    const more = screen.getByRole('region', { name: 'more layouts' });
    expect(
      within(more).getByRole('article', { name: 'Starry Night' }),
    ).toBeTruthy();
  });

  // user-event installs its own clipboard on setup(), so spy on it after open().
  it('Copy writes the code to the clipboard', async () => {
    const user = open('/');
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    await finishLoad();
    const tile = await screen.findByRole('article', { name: 'Starry Night' });
    await user.click(within(tile).getByRole('button', { name: 'Copy code!!' }));
    expect(writeText).toHaveBeenCalledWith(
      codeFor(layoutEntries(getLayouts('en', 'girl'))[0]!),
    );
    expect(within(tile).getByRole('status')).toHaveTextContent(/Copied!!/);
  });

  it('Copy falls back to selecting the code when the clipboard refuses', async () => {
    const user = open('/');
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    );
    await finishLoad();
    const tile = await screen.findByRole('article', { name: 'Starry Night' });
    await user.click(within(tile).getByRole('button', { name: 'Copy code!!' }));
    expect(within(tile).getByRole('status')).toHaveTextContent(
      'press Ctrl+C!!',
    );
    const box = within(tile).getByRole('textbox') as HTMLTextAreaElement;
    expect(document.activeElement).toBe(box);
    expect(box.selectionEnd - box.selectionStart).toBe(box.value.length);
  });

  it.each([
    ['/glitter', 'Glitter Codez', 5],
    ['/stickers', 'Sticker Codez', 9],
    ['/cursors', 'Cursor Codez', 4],
  ])('%s lists codes for single tags', async (path, heading, n) => {
    open(path);
    await finishLoad();
    expect(await screen.findByRole('heading', { name: heading })).toBeTruthy();
    const boxes = codeBoxes();
    expect(boxes).toHaveLength(n);
    for (const box of boxes) expect(box.value).toMatch(/^<!-- GlitterCodez/);
  });

  it('is German when the language is German', async () => {
    useSettingsStore.setState({ language: 'de' });
    open('/');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'heiß für dich!!' }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: 'Code kopieren!!' }).length,
    ).toBeGreaterThan(0);
  });
});

describe('Searchly', () => {
  it('indexes GlitterCodez in both languages', () => {
    expect(SITES).toContain(GLITTERCODEZ_SITE);
    const en = search('glitter layouts', buildIndex(SITES));
    expect(en.some((r) => r.url === `http://${GLITTERCODEZ_HOST}/`)).toBe(true);
    const de = search('glitzer', buildIndex(SITES, 'de'));
    expect(
      de.some((r) => r.url === `http://${GLITTERCODEZ_HOST}/glitter`),
    ).toBe(true);
  });
});
