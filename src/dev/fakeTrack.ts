// Dev-only: emits a fake `amplifier:trackChanged` until the real Amplifier exists (M3).
// In the browser console: `emitFakeTrack()` or `emitFakeTrack({ trackId: 'x', artist: 'A', title: 'T' })`.
import { events, type OsEventMap } from '@/os/events';

type Track = OsEventMap['amplifier:trackChanged'];

let counter = 0;

export function emitFakeTrack(overrides: Partial<Track> = {}): Track {
  counter += 1;
  const track: Track = {
    trackId: `fake-${counter}`,
    artist: 'Fake Artist',
    title: `Fake Song ${counter}`,
    durationSec: 180,
    ...overrides,
  };
  events.emit('amplifier:trackChanged', track);
  return track;
}

declare global {
  interface Window {
    emitFakeTrack?: typeof emitFakeTrack;
  }
}

/** Exposes the helper on `window`. Call only from `import.meta.env.DEV`. */
export function installFakeTrackHelper() {
  window.emitFakeTrack = emitFakeTrack;
}
