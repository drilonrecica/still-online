// Pure helpers for band pages: what the band player shows of the Amplifier (from the OS mirror,
// never the Amplifier store), day-gated shows and blog, and when a profile song may autoplay.
import type { Band } from '@/content/friendspace/types';
import { PLAYLIST, type PlaylistTrack } from '@/content/playlist';
import type { NowPlayingState } from '@/os/nowPlaying';

/** The band's playlist tracks in order (unknown ids are skipped). */
export function bandTracks(trackIds: readonly string[]): PlaylistTrack[] {
  return trackIds.flatMap((id) => PLAYLIST.filter((t) => t.id === id));
}

export interface BandPlayerView {
  /** The band track the Amplifier holds (playing or paused), or null. */
  trackId: string | null;
  playing: boolean;
  position: number;
  duration: number;
}

/** The player's state: the Amplifier's, but only while it holds one of this band's tracks. */
export function bandPlayerView(
  trackIds: readonly string[],
  now: NowPlayingState,
): BandPlayerView {
  const current = now.track
    ? bandTracks(trackIds).find((t) => t.id === now.track?.trackId)
    : undefined;
  if (!current)
    return { trackId: null, playing: false, position: 0, duration: 0 };
  return {
    trackId: current.id,
    playing: now.playing,
    position: now.position,
    duration: now.duration || current.durationSec,
  };
}

/** `m:ss`. */
export function clockTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Upcoming shows out by `day`, in content order (the soonest stays first): no recaps, and none
 * past its `until`.
 */
export function visibleShows(band: Band, day: number): Band['shows'] {
  return band.shows.filter(
    (s) => s.day <= day && !s.past && (s.until === undefined || day < s.until),
  );
}

/** Recaps of played shows out by `day`, newest day first (later lines of a day first). */
export function pastShows(band: Band, day: number): Band['shows'] {
  return band.shows
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.past && s.day <= day)
    .sort((x, y) => y.s.day - x.s.day || y.i - x.i)
    .map(({ s }) => s);
}

/** Blog entries out by `day`, newest day first (later entries of a day first). */
export function visibleBandBlog(band: Band, day: number): Band['blog'] {
  return band.blog
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.day <= day)
    .sort((x, y) => y.b.day - x.b.day || y.i - x.i)
    .map(({ b }) => b);
}

/** A profile song autoplays only when sound is on, nothing is playing and the player allows it. */
export function shouldAutoplay(c: {
  muted: boolean;
  playing: boolean;
  enabled: boolean;
}): boolean {
  return !c.muted && !c.playing && c.enabled;
}
