import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LayoutExtras } from '@/content/friendspace/layoutSets';
import { THEME_PRESETS } from '@/content/sites/friendspace';
import { useSettingsStore } from '@/os/store/settings';
import { TRAIL_MAX, TRAIL_THROTTLE_MS } from './CursorTrail';
import { applyLayout, BACKGROUNDS, FONTS } from './layoutStyles';
import { LayoutPreview } from './LayoutPreview';
import { withMoodHistory } from './logic';
import { ProfileView, type ProfileViewProps } from './ProfileView';
import type { PlayerProfile } from '@/content/friendspace/profiles/types';

const THEME = THEME_PRESETS[0]!.theme;
const PIC = { seed: 's', colors: ['#fff', '#000'] as const };

function props(patch: Partial<ProfileViewProps> = {}): ProfileViewProps {
  return {
    name: 'Ada',
    displayName: 'Ada',
    headline: 'still here',
    mood: { text: 'ok', emoticon: ':)' },
    picture: PIC,
    lastLogin: '10/15/2007',
    songTrackId: null,
    aboutMe: 'me',
    top8: [],
    comments: [],
    emptyWall: 'none',
    day: 3,
    theme: THEME,
    ...patch,
  };
}

function reduceMotion(on: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: on && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

let clock = 0;
beforeEach(() => {
  clock = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
});

afterEach(() => {
  vi.restoreAllMocks();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

const move = (el: HTMLElement, x: number) => {
  clock += TRAIL_THROTTLE_MS;
  fireEvent.pointerMove(el, { clientX: x, clientY: 10 });
};
const trailNodes = () =>
  screen.queryByTestId('cursor-trail')?.querySelectorAll('span').length ?? 0;

describe('applyLayout', () => {
  it('puts the extras on top of the theme', () => {
    const x: LayoutExtras = {
      background: 'camo',
      text: '#fff',
      accent: '#0f0',
      panel: 'none',
      font: 'courier',
      glitter: true,
      stickers: [],
    };
    expect(applyLayout({ ...THEME, glitter: false }, x)).toEqual({
      ...THEME,
      background: BACKGROUNDS.camo,
      text: '#fff',
      accent: '#0f0',
      panel: 'transparent',
      font: FONTS.courier,
      glitter: true,
    });
  });

  it('leaves the theme alone without extras', () => {
    expect(applyLayout(THEME, undefined)).toBe(THEME);
    expect(applyLayout(THEME, { stickers: [] })).toEqual(THEME);
  });
});

describe('withMoodHistory', () => {
  const base: PlayerProfile = {
    headline: '',
    mood: { text: 'ok', emoticon: ':)' },
    aboutMe: '',
    songTrackId: null,
    themePreset: 'default',
    customColors: null,
    top8: [],
  };

  it('prepends a changed mood, newest first, max 5', () => {
    let p = base;
    for (let d = 1; d <= 7; d++)
      p = withMoodHistory(
        p,
        { ...p, mood: { text: `m${d}`, emoticon: ':D' } },
        d,
      );
    expect(p.moodHistory?.map((m) => m.text)).toEqual([
      'm7',
      'm6',
      'm5',
      'm4',
      'm3',
    ]);
    expect(p.moodHistory?.[0]).toEqual({ text: 'm7', emoticon: ':D', day: 7 });
  });

  it('keeps the history when the mood stays the same or is empty', () => {
    expect(
      withMoodHistory(base, { ...base, headline: 'x' }, 2).moodHistory,
    ).toBeUndefined();
    expect(
      withMoodHistory(base, { ...base, mood: { text: '', emoticon: ':(' } }, 2)
        .moodHistory,
    ).toBeUndefined();
    const emoticonOnly = withMoodHistory(
      base,
      { ...base, mood: { text: 'ok', emoticon: ':(' } },
      2,
    );
    expect(emoticonOnly.moodHistory).toHaveLength(1);
  });
});

describe('ProfileView extras', () => {
  it('renders stickers in their corners', () => {
    render(
      <ProfileView
        {...props({
          extras: {
            stickers: [
              { id: 'star', pos: 'top-left' },
              { id: 'controller', pos: 'bottom-right' },
            ],
          },
        })}
      />,
    );
    const imgs = screen
      .getByTestId('profile')
      .querySelectorAll('[data-sticker]');
    expect(
      [...imgs].map((i) => [
        i.getAttribute('data-sticker'),
        i.getAttribute('data-pos'),
      ]),
    ).toEqual([
      ['star', 'top-left'],
      ['controller', 'bottom-right'],
    ]);
  });

  it('shimmers a glitter headline, statically under reduced motion', () => {
    const glitterTheme = { ...THEME, glitter: true };
    const { unmount } = render(
      <ProfileView {...props({ theme: glitterTheme })} />,
    );
    const shimmer = screen.getByText(/still here/);
    expect(shimmer.className).toMatch(/glitterHeadline/);
    expect(shimmer.className).not.toMatch(/glitterStatic/);
    unmount();

    reduceMotion(true);
    render(<ProfileView {...props({ theme: glitterTheme })} />);
    expect(screen.getByText(/still here/).className).toMatch(/glitterStatic/);
  });

  it('has no glitter headline without glitter', () => {
    render(<ProfileView {...props({ theme: { ...THEME, glitter: false } })} />);
    expect(screen.getByText(/still here/).className).not.toMatch(
      /glitterHeadline/,
    );
  });

  it('draws a throttled cursor trail of at most 12 nodes inside the profile', () => {
    render(
      <ProfileView
        {...props({ extras: { cursor: 'sparkle', stickers: [] } })}
      />,
    );
    const profile = screen.getByTestId('profile');
    move(profile, 5);
    expect(trailNodes()).toBe(1);
    fireEvent.pointerMove(profile, { clientX: 6, clientY: 10 }); // same instant: throttled
    expect(trailNodes()).toBe(1);
    for (let i = 0; i < 30; i++) move(profile, i * 3);
    expect(trailNodes()).toBe(TRAIL_MAX);
    fireEvent.pointerLeave(profile);
    expect(trailNodes()).toBe(0);
  });

  it('has no cursor trail without a cursor or under reduced motion', () => {
    const { unmount } = render(<ProfileView {...props()} />);
    move(screen.getByTestId('profile'), 5);
    expect(trailNodes()).toBe(0);
    unmount();

    reduceMotion(true);
    render(
      <ProfileView
        {...props({ extras: { cursor: 'flames', stickers: [] } })}
      />,
    );
    move(screen.getByTestId('profile'), 5);
    expect(trailNodes()).toBe(0);
  });

  it('draws comment graphics above the text', () => {
    render(
      <ProfileView
        {...props({
          comments: [
            {
              day: 3,
              from: 'Kayla',
              picture: PIC,
              text: 'yay',
              graphic: 'thanks',
            },
            { day: 2, from: 'Pia', picture: PIC, text: 'hi', graphic: 'hug' },
            {
              day: 1,
              from: 'Jess',
              picture: PIC,
              text: '<3',
              graphic: 'glitterheart',
            },
            { day: 1, from: 'Dex', picture: PIC, text: 'sup' },
          ],
        })}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Thanks for the add!!' }),
    ).toBeTruthy();
    expect(screen.getByRole('img', { name: '*hugs*' })).toBeTruthy();
    expect(
      screen.getByRole('img', { name: '<3 glitter heart <3' }),
    ).toBeTruthy();
    expect(document.querySelectorAll('[data-graphic]')).toHaveLength(3);
  });

  it('lists the mood history with day labels, in German too', () => {
    useSettingsStore.setState({ language: 'de' });
    render(
      <ProfileView
        {...props({
          moodHistory: [
            { text: 'müde', emoticon: ':(', day: 3 },
            { text: 'hyper', emoticon: ':D', day: 1 },
          ],
        })}
      />,
    );
    const box = screen.getByRole('region', { name: 'Stimmungsverlauf' });
    expect(box).toHaveTextContent('müde');
    expect(box.querySelectorAll('li')).toHaveLength(2);
  });
});

describe('LayoutPreview', () => {
  it('shows the theme with the extras applied', () => {
    render(
      <LayoutPreview
        theme={THEME}
        extras={{
          background: 'checker',
          text: '#123',
          stickers: [{ id: 'heart', pos: 'top-right' }],
        }}
        title="Checkerboard Punk"
        label="Preview"
      />,
    );
    const box = screen.getByRole('group', { name: 'Preview' });
    expect(box).toHaveStyle({ color: '#123' });
    expect(box.querySelectorAll('[data-sticker="heart"]')).toHaveLength(1);
    expect(screen.getByText('Checkerboard Punk')).toBeTruthy();
  });
});
