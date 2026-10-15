// The profile song: a mini player strip that queues the track in Amplifier on click (no autoplay).
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { trackLabel } from './logic';
import styles from './Spaceport.module.css';

export function SongStrip({ trackId }: { trackId: string | null }) {
  const [playing, setPlaying] = useState(false);
  const t = useT();
  const label = trackLabel(trackId);
  if (!trackId || !label) return null;
  return (
    <div
      className={styles.song}
      role="region"
      aria-label={t('sites.spaceport.profileSong')}
    >
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
        {playing
          ? t('sites.spaceport.nowPlaying')
          : t('sites.spaceport.clickToPlay')}
      </span>
    </div>
  );
}
