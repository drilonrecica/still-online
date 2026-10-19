// The band page's dark inline music player. It never owns audio: ▶/❚❚ and the track list drive the
// Amplifier through events, and the LCD and progress bar follow the OS's now-playing mirror.
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { bandPlayerView, bandTracks, clockTime } from './band';
import styles from './Band.module.css';

export function BandPlayer({
  name,
  trackIds,
}: {
  name: string;
  trackIds: readonly string[];
}) {
  const t = useT();
  const now = useNowPlayingStore();
  const tracks = bandTracks(trackIds);
  const [selected, setSelected] = useState(tracks[0]?.id ?? null);
  const view = bandPlayerView(trackIds, now);
  const shown =
    tracks.find((tr) => tr.id === (view.trackId ?? selected)) ?? tracks[0];
  if (!shown) return null;

  const play = (trackId: string) => {
    setSelected(trackId);
    events.emit('amplifier:enqueue', { trackId, play: true });
  };
  const toggle = () => {
    if (view.trackId === null) play(shown.id);
    else
      events.emit('amplifier:control', {
        action: view.playing ? 'pause' : 'resume',
      });
  };
  const duration = view.duration || shown.durationSec;
  const percent =
    duration > 0 ? Math.min(100, (view.position / duration) * 100) : 0;

  return (
    <section
      className={styles.player}
      aria-label={t('sites.friendspace.band.player', { name })}
      data-testid="band-player"
    >
      <div className={styles.lcd} aria-live="polite">
        <span className={styles.lcdTitle}>
          {view.trackId ? shown.title : t('sites.friendspace.band.idle')}
        </span>
        <span className={styles.lcdTime}>
          {clockTime(view.position)} / {clockTime(duration)}
        </span>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.playButton}
          aria-label={
            view.playing
              ? t('sites.friendspace.band.pause')
              : t('sites.friendspace.band.play')
          }
          onClick={toggle}
        >
          {view.playing ? '❚❚' : '▶'}
        </button>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label={t('sites.friendspace.band.progress')}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(view.position)}
          aria-valuetext={`${clockTime(view.position)} / ${clockTime(duration)}`}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <ol
        className={styles.tracks}
        aria-label={t('sites.friendspace.band.tracks')}
      >
        {tracks.map((tr, i) => (
          <li key={tr.id}>
            <button
              type="button"
              className={styles.track}
              aria-label={t('sites.friendspace.band.playTrack', {
                title: tr.title,
              })}
              aria-current={tr.id === view.trackId ? 'true' : undefined}
              onClick={() => play(tr.id)}
            >
              <span>
                {i + 1}. {tr.title}
              </span>
              <span>{clockTime(tr.durationSec)}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
