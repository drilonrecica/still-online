// Opens the Amplifier when something asks it to play. Kept out of the store so the store stays UI-free.
// Importing the store here guarantees its `amplifier:enqueue` handler exists before the first event,
// even though the Amplifier component itself is lazy.
import '@/apps/amplifier/store';
import { PLAYLIST } from '@/content/playlist';
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';

/** Subscribes once; returns the unsubscribe function (used by the App effect). */
export function installAmplifierRouter(): () => void {
  return events.on('amplifier:enqueue', ({ trackId, play }) => {
    if (!play || !PLAYLIST.some((t) => t.id === trackId)) return;
    const { windows, openApp } = useWindowsStore.getState();
    if (!windows.some((w) => w.appId === 'amplifier')) openApp('amplifier');
  });
}
