// Profile-song autoplay: opening a friend's or band's page queues its song in the Amplifier once
// per page view, unless the game is muted, something is already playing or `/me` turned it off.
import { useEffect, useRef } from 'react';
import { events } from '@/os/events';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { useSettingsStore } from '@/os/store/settings';
import { useWebStore } from '../../store';
import { shouldAutoplay } from './band';

export function useProfileAutoplay(
  trackId: string | null | undefined,
  pageKey: string,
) {
  // Survives StrictMode's double effect, so a view never queues the song twice.
  const done = useRef<string | null>(null);
  useEffect(() => {
    if (!trackId || done.current === pageKey) return;
    done.current = pageKey;
    const ok = shouldAutoplay({
      muted: useSettingsStore.getState().muted,
      playing: useNowPlayingStore.getState().playing,
      enabled: useWebStore.getState().myProfile?.autoplay !== false,
    });
    // Quiet: the song plays without the Amplifier window jumping over the page.
    if (ok)
      events.emit('amplifier:enqueue', { trackId, play: true, quiet: true });
  }, [trackId, pageKey]);
}
