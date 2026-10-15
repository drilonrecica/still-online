// Opens Web Explorer for `browser:open` (Messenger links, Mail, Explorer links, balloons).
// Apps never import the browser; they emit the event and this opens a window.
import { getApp } from '@/apps/registry';
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';

/** Subscribes once; returns the unsubscribe function (used by the App effect). */
export function installBrowserRouter(): () => void {
  return events.on('browser:open', ({ url }) => {
    if (!getApp('browser')) return;
    useWindowsStore.getState().openApp('browser', { url });
  });
}
