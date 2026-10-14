// Amplifier playlist panel: numbered track list with durations and a total-time footer.
import type { KeyboardEvent } from 'react';
import type { PlaylistTrack } from '@/content/playlist';
import { formatTime } from './format';
import styles from './Amplifier.module.css';

/** Extra window height (px) the panel adds under the main player. */
export const PLAYLIST_HEIGHT = 160;

interface Props {
  tracks: readonly PlaylistTrack[];
  currentIndex: number;
  onPlay: (index: number) => void;
}

export default function Playlist({ tracks, currentIndex, onPlay }: Props) {
  const total = tracks.reduce((sum, t) => sum + t.durationSec, 0);

  function onKeyDown(e: KeyboardEvent<HTMLLIElement>, index: number) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        onPlay(index);
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        // Keep list navigation from reaching the player's volume shortcuts.
        e.preventDefault();
        e.stopPropagation();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        const items = e.currentTarget.parentElement?.children;
        (items?.[index + step] as HTMLElement | undefined)?.focus();
        break;
      }
    }
  }

  return (
    <div className={styles.playlist} data-testid="playlist">
      <ul className={styles.playlistList} role="listbox" aria-label="Playlist">
        {tracks.map((t, i) => (
          <li
            key={t.id}
            role="option"
            aria-selected={i === currentIndex}
            tabIndex={0}
            className={styles.playlistRow}
            data-current={i === currentIndex}
            onDoubleClick={() => onPlay(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className={styles.playlistTitle}>
              {i + 1}. {t.artist} - {t.title}
            </span>
            <span>{formatTime(t.durationSec)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.playlistFooter}>
        {tracks.length} tracks / {formatTime(total)}
      </div>
    </div>
  );
}
