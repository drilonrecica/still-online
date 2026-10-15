// Plays requested winks once over a chat's transcript; reduced motion shows the still frame.
import { useEffect, useState } from 'react';
import type { ContactId, WinkId } from '@/content/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import { WinkArt } from './art';
import { winkPlayMs } from './catalog';
import { onWink } from './play';
import styles from './Winks.module.css';

export function WinkOverlay({ contactId }: { contactId: ContactId }) {
  const reduced = useReducedMotion();
  /** `n` remounts the art, so a wink sent twice in a row starts over. */
  const [playing, setPlaying] = useState<{ wink: WinkId; n: number } | null>(
    null,
  );

  useEffect(
    () =>
      onWink(contactId, (wink) =>
        setPlaying((p) => ({ wink, n: (p?.n ?? 0) + 1 })),
      ),
    [contactId],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => setPlaying(null),
      winkPlayMs(playing.wink, reduced),
    );
    return () => clearTimeout(timer);
  }, [playing, reduced]);

  if (!playing) return null;
  return (
    <div
      className={styles.overlay}
      data-wink={playing.wink}
      data-still={reduced ? 'true' : undefined}
    >
      <WinkArt key={playing.n} wink={playing.wink} still={reduced} />
    </div>
  );
}
