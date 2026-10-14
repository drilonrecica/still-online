// Time and now-playing text for the Amplifier display.
import type { PlaylistTrack } from '@/content/playlist';

/** Seconds → `m:ss`. Non-finite or negative input renders as `0:00`. */
export function formatTime(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Marquee text: `1. Artist - Title (m:ss)`. */
export function nowPlayingText(track: PlaylistTrack, index: number): string {
  return `${index + 1}. ${track.artist} - ${track.title} (${formatTime(track.durationSec)})`;
}
