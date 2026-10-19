// The profile song: a mini player strip that queues the track in Amplifier on click, shows what the
// Amplifier is doing with it (from the OS mirror) and stops it with ■.
import { useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { trackLabel } from './logic';
import styles from './Friendspace.module.css';

export function SongStrip({ trackId }: { trackId: string | null }) {
  const t = useT();
  const current = useNowPlayingStore((s) => s.track?.trackId === trackId);
  const playing = useNowPlayingStore((s) => s.playing);
  const label = trackLabel(trackId);
  if (!trackId || !label) return null;
  return (
    <div
      className={styles.song}
      role="region"
      aria-label={t('sites.friendspace.profileSong')}
    >
      <button
        type="button"
        className={styles.songButton}
        onClick={() =>
          events.emit('amplifier:enqueue', { trackId, play: true })
        }
      >
        &#9654; {label}
      </button>
      <button
        type="button"
        className={styles.songButton}
        aria-label={t('sites.friendspace.stopSong')}
        title={t('sites.friendspace.stopSong')}
        disabled={!current}
        onClick={() => events.emit('amplifier:control', { action: 'stop' })}
      >
        &#9632;
      </button>
      <span className={styles.songStatus}>
        {!current
          ? t('sites.friendspace.clickToPlay')
          : playing
            ? t('sites.friendspace.nowPlaying')
            : t('sites.friendspace.pausedInAmplifier')}
      </span>
    </div>
  );
}
