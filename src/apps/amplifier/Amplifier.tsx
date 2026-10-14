// Amplifier main window: original dark-metal player skin driven by the amplifier store.
import { useState, type KeyboardEvent } from 'react';
import { useWindowsStore } from '@/os/store/windows';
import { isFromControl, useWindowDrag } from '@/os/wm/useWindowDrag';
import { useReducedMotion } from '@/os/useReducedMotion';
import type { AppComponentProps } from '@/os/types';
import { formatTime, nowPlayingText } from './format';
import { useAmplifierStore } from './store';
import styles from './Amplifier.module.css';

const SEEK_STEP = 5;
const VOLUME_STEP = 0.05;
const REPEAT_LABEL = {
  off: 'Repeat: off',
  all: 'Repeat: all',
  one: 'Repeat: one',
};

export default function Amplifier({ windowId }: AppComponentProps) {
  const drag = useWindowDrag(windowId);
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(false);

  const s = useAmplifierStore();
  const track = s.playlist[s.index];
  const text = track
    ? nowPlayingText(track, s.index)
    : 'Amplifier - nothing playing';
  const shown = remaining
    ? -Math.max(0, s.duration - s.currentTime)
    : s.currentTime;
  const timeText = (shown < 0 ? '-' : '') + formatTime(Math.abs(shown));

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    // Let focused buttons/sliders keep their own Space/arrow behaviour.
    if (isFromControl(e.target)) return;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        s.togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        s.seek(s.currentTime + SEEK_STEP);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        s.seek(s.currentTime - SEEK_STEP);
        break;
      case 'ArrowUp':
        e.preventDefault();
        s.setVolume(s.volume + VOLUME_STEP);
        break;
      case 'ArrowDown':
        e.preventDefault();
        s.setVolume(s.volume - VOLUME_STEP);
        break;
    }
  }

  const windows = () => useWindowsStore.getState();

  return (
    <div
      className={styles.root}
      tabIndex={0}
      role="group"
      aria-label="Amplifier"
      onKeyDown={onKeyDown}
    >
      <div className={styles.titlebar} {...drag}>
        <span className={styles.titleText}>AMPLIFIER</span>
        <button
          type="button"
          className={styles.winBtn}
          aria-label="Minimize"
          onClick={() => windows().minimizeWindow(windowId)}
        >
          _
        </button>
        <button
          type="button"
          className={styles.winBtn}
          aria-label="Close"
          onClick={() => windows().closeWindow(windowId)}
        >
          ×
        </button>
      </div>

      <div className={styles.display}>
        <button
          type="button"
          className={styles.time}
          aria-label={remaining ? 'Time remaining' : 'Time elapsed'}
          onClick={() => setRemaining((r) => !r)}
        >
          {timeText}
        </button>
        <div
          className={styles.marquee}
          data-static={reduced}
          data-testid="marquee"
          title={text}
        >
          <span className={styles.marqueeText}>{text}</span>
        </div>
      </div>

      <div className={styles.sliders}>
        <input
          type="range"
          className={styles.seek}
          aria-label="Seek"
          min={0}
          max={Math.max(1, Math.floor(s.duration))}
          step={1}
          value={Math.min(s.currentTime, Math.max(1, s.duration))}
          disabled={s.index < 0}
          onChange={(e) => s.seek(Number(e.target.value))}
        />
        <input
          type="range"
          className={styles.volume}
          aria-label="Volume"
          min={0}
          max={100}
          value={Math.round(s.volume * 100)}
          onChange={(e) => s.setVolume(Number(e.target.value) / 100)}
        />
      </div>

      <div className={styles.buttons}>
        <button type="button" aria-label="Previous" onClick={s.prev}>
          ⏮
        </button>
        <button
          type="button"
          aria-label="Play"
          aria-pressed={s.status === 'playing'}
          onClick={s.play}
        >
          ▶
        </button>
        <button
          type="button"
          aria-label="Pause"
          aria-pressed={s.status === 'paused'}
          onClick={s.pause}
        >
          ⏸
        </button>
        <button type="button" aria-label="Stop" onClick={s.stop}>
          ⏹
        </button>
        <button type="button" aria-label="Next" onClick={s.next}>
          ⏭
        </button>
        <span className={styles.spacer} />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Shuffle"
          aria-pressed={s.shuffle}
          onClick={s.toggleShuffle}
        >
          SHUF
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-label={REPEAT_LABEL[s.repeat]}
          aria-pressed={s.repeat !== 'off'}
          onClick={s.cycleRepeat}
        >
          {s.repeat === 'one' ? 'REP1' : 'REP'}
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-label="Playlist"
          aria-pressed={false}
        >
          PL
        </button>
      </div>
    </div>
  );
}
