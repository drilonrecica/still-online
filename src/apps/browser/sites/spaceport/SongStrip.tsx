// The profile song: a mini player strip that queues the track in Amplifier on click (no autoplay).
import { useState } from 'react';
import { events } from '@/os/events';
import { trackLabel } from './logic';
import styles from './Spaceport.module.css';

export function SongStrip({ trackId }: { trackId: string | null }) {
  const [playing, setPlaying] = useState(false);
  const label = trackLabel(trackId);
  if (!trackId || !label) return null;
  return (
    <div className={styles.song} role="region" aria-label="Profile song">
      <button
        type="button"
        className={styles.songButton}
        onClick={() => {
          events.emit('amplifier:enqueue', { trackId, play: true });
          setPlaying(true);
        }}
      >
        &#9654; {label}
      </button>
      <span className={styles.songStatus}>
        {playing ? 'now playing in Amplifier' : 'click to play'}
      </span>
    </div>
  );
}
