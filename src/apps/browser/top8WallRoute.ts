// `messenger:top8Reacted` (sent when a friend's Top 8 reaction ends): a `top8Wall` entry dated
// today; the wall line itself comes from `top8Reactions` content at render (P0-03, P1-05).
// Installed from App at boot; the `web` store is loaded only when a reaction arrives.
import { events } from '@/os/events';
import { useWorldStore } from '@/os/world';

/** Subscribes once; returns the unsubscribe function (used by the App effect). */
export function installTop8WallRoute(): () => void {
  return events.on('messenger:top8Reacted', ({ contactId, kind }) => {
    const day = useWorldStore.getState().day;
    void import('./store').then(({ useWebStore }) =>
      useWebStore.getState().appendTop8Wall({ contactId, kind, day }),
    );
  });
}
