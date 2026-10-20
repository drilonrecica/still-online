import { describe, expect, it } from 'vitest';
import type { Band } from '@/content/friendspace/types';
import { NOW_PLAYING_IDLE } from '@/os/nowPlaying';
import {
  bandPlayerView,
  bandTracks,
  clockTime,
  shouldAutoplay,
  visibleBandBlog,
  pastShows,
  visibleShows,
} from './band';

const IDS = ['voxel-revolution', 'nope', 'cool-rock'];
const playing = (trackId: string, isPlaying = true) => ({
  track: { trackId, artist: 'Kevin MacLeod', title: 'x' },
  playing: isPlaying,
  position: 12,
  duration: 0,
});

describe('band player view', () => {
  it('lists the known tracks in order', () => {
    expect(bandTracks(IDS).map((t) => t.id)).toEqual([
      'voxel-revolution',
      'cool-rock',
    ]);
  });

  it('is idle while the Amplifier is stopped or holds another band’s track', () => {
    const idle = { trackId: null, playing: false, position: 0, duration: 0 };
    expect(bandPlayerView(IDS, NOW_PLAYING_IDLE)).toEqual(idle);
    expect(bandPlayerView(IDS, playing('surf-shimmy'))).toEqual(idle);
  });

  it('follows the Amplifier for its own tracks, playing or paused', () => {
    expect(bandPlayerView(IDS, playing('cool-rock'))).toEqual({
      trackId: 'cool-rock',
      playing: true,
      position: 12,
      duration: 209, // playlist length until the file reports one
    });
    expect(bandPlayerView(IDS, playing('cool-rock', false)).playing).toBe(
      false,
    );
  });

  it('formats m:ss', () => {
    expect(clockTime(0)).toBe('0:00');
    expect(clockTime(130.7)).toBe('2:10');
  });
});

describe('band shows and blog', () => {
  const band = {
    shows: [
      { day: 1, text: 'a' },
      { day: 4, text: 'b' },
    ],
    blog: [
      { day: 1, title: 'one', body: '' },
      { day: 3, title: 'three', body: '' },
      { day: 3, title: 'three later', body: '' },
    ],
  } as unknown as Band;

  it('gates by day', () => {
    expect(visibleShows(band, 3).map((s) => s.text)).toEqual(['a']);
    expect(visibleShows(band, 5).map((s) => s.text)).toEqual(['a', 'b']);
  });

  it('hides a show from its `until` day and lists recaps as past, newest first', () => {
    const toured = {
      shows: [
        { day: 1, text: 'soon', until: 5 },
        { day: 5, text: 'recap 5', past: true },
        { day: 6, text: 'next', until: 10 },
        { day: 10, text: 'recap 10', past: true },
      ],
    } as unknown as Band;
    const up = (day: number) => visibleShows(toured, day).map((s) => s.text);
    const past = (day: number) => pastShows(toured, day).map((s) => s.text);
    expect(up(1)).toEqual(['soon']);
    expect(up(5)).toEqual([]);
    expect(up(8)).toEqual(['next']);
    expect(up(10)).toEqual([]);
    expect(past(1)).toEqual([]);
    expect(past(6)).toEqual(['recap 5']);
    expect(past(10)).toEqual(['recap 10', 'recap 5']);
  });

  it('puts the newest blog entry first', () => {
    expect(visibleBandBlog(band, 2).map((b) => b.title)).toEqual(['one']);
    expect(visibleBandBlog(band, 5).map((b) => b.title)).toEqual([
      'three later',
      'three',
      'one',
    ]);
  });
});

describe('shouldAutoplay', () => {
  it('needs sound on, nothing playing and the setting on', () => {
    const base = { muted: false, playing: false, enabled: true };
    expect(shouldAutoplay(base)).toBe(true);
    expect(shouldAutoplay({ ...base, muted: true })).toBe(false);
    expect(shouldAutoplay({ ...base, playing: true })).toBe(false);
    expect(shouldAutoplay({ ...base, enabled: false })).toBe(false);
  });
});
