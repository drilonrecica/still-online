// Amplifier main window: original dark-metal player skin driven by the amplifier store.
import { useT } from '@/i18n/useT';
import { useWindowMinimized } from '@/os/useAnimationFrame';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useDevice } from '@/os/device';
import { useWindowsStore } from '@/os/store/windows';
import { composeHandlers } from '@/os/touch/compose';
import { useActivate } from '@/os/touch/useActivate';
import { useLongPress } from '@/os/touch/useLongPress';
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
import { TAP_PX, useSkinFit } from './skinZoom';
import { Visualizer } from './Visualizer';
import styles from './Amplifier.module.css';

const BASE_HEIGHT = 116;
/** Windowshade strip height. */
export const SHADE_HEIGHT = 14;
const SEEK_STEP = 5;
const VOLUME_STEP = 0.05;

export default function Amplifier({ windowId }: AppComponentProps) {
  const t = useT();
  const drag = useWindowDrag(windowId);
  const minimized = useWindowMinimized(windowId);
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [shaded, setShaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [skinsOpen, setSkinsOpen] = useState(false);
  // On a phone the skin fills the full-screen window, scaled with CSS zoom.
  const rootRef = useRef<HTMLDivElement>(null);
  const fit = useSkinFit(rootRef, useDevice() === 'phone', {
    eq: showEq && !shaded,
    playlist: showPlaylist && !shaded,
  });
  const fitStyle = fit
    ? ({
        zoom: fit.zoom,
        width: fit.width,
        height: fit.height,
        '--amp-tap': `${TAP_PX / fit.zoom}px`,
      } as CSSProperties)
    : undefined;
  // Title bar: double-click or double-tap shades, right-click or long-press opens the menu.
  const activateTitle = useActivate(
    (_: void, _via, target) => {
      if (!isFromControl(target)) toggleShade();
    },
    { touchTaps: 2, enter: false },
  );
  const pressTitle = useLongPress(() => {
    setSkinsOpen(false);
    setMenuOpen((o) => !o);
  });

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
    : t('amplifier.nothingPlaying');
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

  function chooseSkin(skin: AmplifierSkin) {
    s.setSkin(skin);
    setMenuOpen(false);
    setSkinsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={fitStyle}
      data-fit={fit ? true : undefined}
      tabIndex={0}
      role="group"
      aria-label={t('amplifier.name')}
      data-skin={s.skin}
      data-shade={shaded}
      onKeyDown={onKeyDown}
    >
      <div
        className={styles.titlebar}
        data-testid="titlebar"
        {...composeHandlers(drag, activateTitle(), pressTitle())}
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
              aria-label={
                s.status === 'playing'
                  ? t('amplifier.pause')
                  : t('amplifier.play')
              }
              onClick={s.togglePlay}
            >
              {s.status === 'playing' ? '⏸' : '▶'}
            </button>
          </>
        ) : (
          <span className={styles.titleText}>{t('amplifier.titleText')}</span>
        )}
        <button
          type="button"
          className={styles.winBtn}
          aria-label={t('amplifier.minimize')}
          onClick={() => windows().minimizeWindow(windowId)}
        >
          _
        </button>
        <button
          type="button"
          className={styles.winBtn}
          aria-label={t('amplifier.close')}
          onClick={() => windows().closeWindow(windowId)}
        >
          ×
        </button>
      </div>

      {menuOpen && (
        <div
          className={styles.menu}
          role="menu"
          aria-label={t('amplifier.menu')}
        >
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={skinsOpen}
            onClick={() => setSkinsOpen((o) => !o)}
          >
            {t('amplifier.skins')}
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
                {t(`amplifier.skin.${k}`)}
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
                aria-label={
                  remaining
                    ? t('amplifier.timeRemaining')
                    : t('amplifier.timeElapsed')
                }
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
                {t(`amplifier.status.${s.status}`)}
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
              aria-label={t('amplifier.seek')}
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
              aria-label={t('amplifier.volume')}
              min={0}
              max={100}
              value={Math.round(s.volume * 100)}
              onChange={(e) => s.setVolume(Number(e.target.value) / 100)}
            />
          </div>

          <div className={styles.buttons}>
            <button
              type="button"
              aria-label={t('amplifier.previous')}
              onClick={s.prev}
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label={t('amplifier.play')}
              aria-pressed={s.status === 'playing'}
              onClick={s.play}
            >
              ▶
            </button>
            <button
              type="button"
              aria-label={t('amplifier.pause')}
              aria-pressed={s.status === 'paused'}
              onClick={s.pause}
            >
              ⏸
            </button>
            <button
              type="button"
              aria-label={t('amplifier.stop')}
              onClick={s.stop}
            >
              ⏹
            </button>
            <button
              type="button"
              aria-label={t('amplifier.next')}
              onClick={s.next}
            >
              ⏭
            </button>
            <span className={styles.spacer} />
            <button
              type="button"
              className={styles.toggle}
              aria-label={t('amplifier.shuffle')}
              aria-pressed={s.shuffle}
              onClick={s.toggleShuffle}
            >
              {t('amplifier.shortShuffle')}
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label={t(`amplifier.repeat.${s.repeat}`)}
              aria-pressed={s.repeat !== 'off'}
              onClick={s.cycleRepeat}
            >
              {s.repeat === 'one'
                ? t('amplifier.shortRepeatOne')
                : t('amplifier.shortRepeat')}
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label={t('amplifier.equalizer')}
              aria-pressed={showEq}
              onClick={toggleEqPanel}
            >
              {t('amplifier.shortEq')}
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label={t('amplifier.playlist')}
              aria-pressed={showPlaylist}
              onClick={togglePlaylist}
            >
              {t('amplifier.shortPlaylist')}
            </button>
            <button
              type="button"
              className={styles.toggle}
              aria-label={t('amplifier.skinLabel', {
                skin: t(`amplifier.skin.${s.skin}`),
              })}
              onClick={s.cycleSkin}
            >
              {t('amplifier.shortSkin')}
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
