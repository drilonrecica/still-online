// `web:top8Changed` (sent by Friendspace's `saveProfile`): Top 8 drama bookkeeping (P0-03).
// Installed from App at boot, so a drop counts before Messenger ever opens; the conversation
// runtime stays a lazy chunk and is loaded only when the Top 8 actually changes.
import { events } from '@/os/events';

/** Subscribes once; returns the unsubscribe function (used by the App effect). */
export function installTop8Route(): () => void {
  return events.on('web:top8Changed', (change) => {
    void import('./runtime').then(({ getMessengerEngine }) =>
      getMessengerEngine().top8Changed(change),
    );
  });
}
