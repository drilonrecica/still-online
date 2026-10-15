// Amplifier main window: original dark-metal player skin driven by the amplifier store.
import { useWindowMinimized } from '@/os/useAnimationFrame';
import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useWindowsStore } from '@/os/store/windows';
import { isFromControl, useWindowDrag } from '@/os/wm/useWindowDrag';
import { useReducedMotion } from '@/os/useReducedMotion';
import type { AppComponentProps } from '@/os/types';
import { setEqualizer } from './analyser';
import Equalizer, { EQ_HEIGHT } from './Equalizer';
import { formatTime, nowPlayingText } from './format';
import Playlist, { PLAYLIST_HEIGHT } from './Playlist';
import {
  amplifierAudio,
  SKINS,
  useAmplifierStore,
  type AmplifierSkin,
} from './store';
import { Visualizer } from './Visualizer';
import styles from './Amplifier.module.css';

const BASE_HEIGHT = 116;
/** Windowshade strip height. */
export const SHADE_HEIGHT = 14;
const SKIN_LABEL: Record<AmplifierSkin, string> = {
  metal: 'Brushed Metal',
  neon: 'Neon Night',
  bubblegum: 'Bubblegum',
};
const SEEK_STEP = 5;
const VOLUME_STEP = 0.05;
const STATUS_LABEL = {
  playing: 'PLAY',
  paused: 'PAUSE',
  stopped: 'STOP',
};
const REPEAT_LABEL = {
  off: 'Repeat: off',
  all: 'Repeat: all',
  one: 'Repeat: one',
};

export default function Amplifier({ windowId }: AppComponentProps) {
  const drag = useWindowDrag(windowId);
  const minimized = useWindowMinimized(windowId);
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [shaded, setShaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [skinsOpen, setSkinsOpen] = useState(false);

  // The audio element outlives this window: closing it (✕, log off, shut down) stops
  // the music. Minimizing only hides the window, so playback continues.
  useEffect(() => () => useAmplifierStore.getState().stop(), []);

  const s = useAmplifierStore();

  // Keep the audio graph's filters on the stored curve. The graph is built only while
  // the EQ is on and music plays (after a gesture), never on mount.
  const playing = s.status === 'playing';
  useEffect(() => {
    setEqualizer(amplifierAudio, s.eq, s.eq.on && playing);
  }, [s.eq, playing]);
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

  function resizeTo(h: number) {
    const win = windows().windows.find((w) => w.id === windowId);
    if (win) {
      windows().resizeWindow(windowId, { x: win.x, y: win.y, w: win.w, h });
    }
  }

  /** Player + the open panels, stacked in one window (EQ above the playlist). */
  const fullHeight = (playlist: boolean, eq: boolean) =>
    BASE_HEIGHT + (eq ? EQ_HEIGHT : 0) + (playlist ? PLAYLIST_HEIGHT : 0);

  function togglePlaylist() {
    const next = !showPlaylist;
    setShowPlaylist(next);
    // Same window: grow/shrink under the player.
    resizeTo(fullHeight(next, showEq));
  }

  function toggleEqPanel() {
    const next = !showEq;
    setShowEq(next);
    resizeTo(fullHeight(showPlaylist, next));
  }

  function toggleShade() {
    const next = !shaded;
    setShaded(next);
    setMenuOpen(false);
    // The open panels are remembered while shaded and come back on restore.
    resizeTo(next ? SHADE_HEIGHT : fullHeight(showPlaylist, showEq));
  }

  function onTitleDoubleClick(e: MouseEvent<HTMLElement>) {
    if (isFromControl(e.target)) return;
    toggleShade();
  }

  function onTitleContextMenu(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    setSkinsOpen(false);
    setMenuOpen((o) => !o);
  }

  function chooseSkin(skin: AmplifierSkin) {
    s.setSkin(skin);
    setMenuOpen(false);
    setSkinsOpen(false);
  }

  return (
    <div
      className={styles.root}
      tabIndex={0}
      role="group"
      aria-label="Amplifier"
      data-skin={s.skin}
      data-shade={shaded}
      onKeyDown={onKeyDown}
    >
      <div
        className={styles.titlebar}
        data-testid="titlebar"
        {...drag}
        onDoubleClick={onTitleDoubleClick}
        onContextMenu={onTitleContextMenu}
      >
        {shaded ? (
          <>
            <span className={styles.shadeTime}>{timeText}</span>
            <span
              className={styles.shadeMarquee}
              data-testid="shade-marquee"
              title={text}
            >
              {text}
            </span>
            <button
              type="button"
              className={styles.winBtn}
              aria-label={s.status === 'playing' ? 'Pause' : 'Play'}
              onClick={s.togglePlay}
            >
              {s.status === 'playing' ? '⏸' : '▶'}
            </button>
          </>
        ) : (
          <span className={styles.titleText}>AMPLIFIER</span>
        )}
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

      {menuOpen && (
        <div className={styles.menu} role="menu" aria-label="Amplifier menu">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={skinsOpen}
            onClick={() => setSkinsOpen((o) => !o)}
          >
            Skins ▸
          </button>
          {skinsOpen &&
            SKINS.map((k) => (
              <button
                key={k}
                type="button"
                role="menuitemradio"
                aria-checked={s.skin === k}
                onClick={() => chooseSkin(k)}
              >
                {s.skin === k ? '● ' : '○ '}
                {SKIN_LABEL[k]}
              </button>
            ))}
        </div>
      )}

      {!shaded && (
        <>
          <div className={styles.display}>
            <div className={styles.lcdTop}>
              <button
                type="button"
                className={styles.time}
                aria-label={remaining ? 'Time remaining' : 'Time elapsed'}
                onClick={() => setRemaining((r) => !r)}
              >
                {timeText}
              </button>
              <Visualizer
                audio={amplifierAudio}
                status={s.status}
                reduced={reduced}
                minimized={minimized}
              />
              <span className={styles.statusText} aria-hidden="true">
                {STATUS_LABEL[s.status]}
              </span>
            </div>
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
              aria-label="Equalizer"
              aria-pressed={showEq}
              onClick={toggleEqPanel}
            >
              EQ
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label="Playlist"
              aria-pressed={showPlaylist}
              onClick={togglePlaylist}
            >
              PL
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label={`Skin: ${SKIN_LABEL[s.skin]}`}
              onClick={s.cycleSkin}
            >
              SKN
            </button>
          </div>

          {showEq && (
            <Equalizer
              eq={s.eq}
              onToggle={s.toggleEq}
              onPreamp={s.setPreamp}
              onBand={s.setBand}
              onPreset={s.applyPreset}
            />
          )}

          {showPlaylist && (
            <Playlist
              tracks={s.playlist}
              currentIndex={s.index}
              onPlay={s.playIndex}
              onRemove={s.removeAt}
              onMove={s.moveTrack}
              onAdd={s.addTrack}
            />
          )}
        </>
      )}
    </div>
  );
}
