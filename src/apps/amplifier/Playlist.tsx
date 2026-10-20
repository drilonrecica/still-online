// Amplifier playlist panel: numbered track list with durations, editing and a footer
// with the ADD / MISC menus and the total time.
import { useT } from '@/i18n/useT';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { PlaylistTrack } from '@/content/playlist';
import { composeHandlers } from '@/os/touch/compose';
import { useActivate } from '@/os/touch/useActivate';
import { useLongPress } from '@/os/touch/useLongPress';
import { BurnDialog, MyMusicDialog, ShippedDialog } from './Dialogs';
import { formatTime } from './format';
import styles from './Amplifier.module.css';

/** Extra window height (px) the panel adds under the main player. */
export const PLAYLIST_HEIGHT = 160;

interface Props {
  tracks: readonly PlaylistTrack[];
  currentIndex: number;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: (track: PlaylistTrack) => void;
}

type Menu = 'add' | 'misc' | null;
/** Room the track menu needs inside the panel (px): its min-width and four rows. */
const ROW_MENU_W = 110;
const ROW_MENU_H = 64;

/** The track menu (right-click or long-press on a row), at a point in the panel. */
interface RowMenu {
  index: number;
  x: number;
  y: number;
}
type Dialog = 'music' | 'shipped' | 'burn' | null;

export default function Playlist({
  tracks,
  currentIndex,
  onPlay,
  onRemove,
  onMove,
  onAdd,
}: Props) {
  const t = useT();
  const total = tracks.reduce((sum, tr) => sum + tr.durationSec, 0);
  const [selected, setSelected] = useState(-1);
  const [menu, setMenu] = useState<Menu>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [dragFrom, setDragFrom] = useState(-1);
  const [rowMenu, setRowMenu] = useState<RowMenu | null>(null);
  const burns = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Double-click or a tap plays a row; the row's own keys handle Enter.
  const activateRow = useActivate((index: number) => onPlay(index));
  // Mouse drag still reorders; the menu is the touch path to Move up/down and Remove.
  const pressRow = useLongPress(({ clientX, clientY }, index: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    const box = panel.getBoundingClientRect();
    // A phone zooms the skin: the box is in screen px, the menu's left/top in skin px.
    const scale = panel.offsetWidth > 0 ? box.width / panel.offsetWidth : 1;
    const w = box.width / scale;
    const h = box.height / scale;
    setSelected(index);
    setRowMenu({
      index,
      x: Math.max(0, Math.min((clientX - box.left) / scale, w - ROW_MENU_W)),
      y: Math.max(0, Math.min((clientY - box.top) / scale, h - ROW_MENU_H)),
    });
  });

  // Any press elsewhere or Escape closes the track menu.
  useEffect(() => {
    if (!rowMenu) return;
    const close = () => setRowMenu(null);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [rowMenu]);

  const focusRow = (i: number) =>
    requestAnimationFrame(() =>
      (listRef.current?.children[i] as HTMLElement | undefined)?.focus(),
    );

  function remove(index: number) {
    onRemove(index);
    setSelected(Math.min(index, tracks.length - 2));
  }

  function move(from: number, to: number) {
    onMove(from, to);
    setSelected(to);
  }

  /** Runs a track-menu item and closes the menu. */
  function fromMenu(action: () => void) {
    setRowMenu(null);
    action();
  }

  function onKeyDown(e: KeyboardEvent<HTMLLIElement>, index: number) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        onPlay(index);
        break;
      case 'Delete':
        e.preventDefault();
        e.stopPropagation();
        remove(index);
        focusRow(Math.min(index, tracks.length - 2));
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        // Keep list navigation from reaching the player's volume shortcuts.
        e.preventDefault();
        e.stopPropagation();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        if (e.ctrlKey) {
          const to = index + step;
          if (to < 0 || to >= tracks.length) break;
          move(index, to);
          focusRow(to);
          break;
        }
        const items = e.currentTarget.parentElement?.children;
        (items?.[index + step] as HTMLElement | undefined)?.focus();
        break;
      }
    }
  }

  function openDialog(d: Dialog) {
    setMenu(null);
    setDialog(d);
  }

  function closeDialog() {
    if (dialog === 'burn') burns.current += 1;
    setDialog(null);
  }

  return (
    <div className={styles.playlist} data-testid="playlist" ref={panelRef}>
      <ul
        ref={listRef}
        className={styles.playlistList}
        role="listbox"
        aria-label={t('amplifier.playlist')}
      >
        {tracks.map((tr, i) => (
          <li
            key={tr.id}
            role="option"
            aria-selected={i === currentIndex}
            tabIndex={0}
            className={styles.playlistRow}
            data-current={i === currentIndex}
            data-selected={i === selected}
            draggable
            onFocus={() => setSelected(i)}
            {...composeHandlers(
              { onClick: () => setSelected(i) },
              activateRow(i),
              pressRow(i),
            )}
            onKeyDown={(e) => onKeyDown(e, i)}
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom >= 0) move(dragFrom, i);
              setDragFrom(-1);
            }}
            onDragEnd={() => setDragFrom(-1)}
          >
            <span className={styles.playlistTitle}>
              {i + 1}. {tr.artist} - {tr.title}
            </span>
            <span>{formatTime(tr.durationSec)}</span>
          </li>
        ))}
      </ul>
      {rowMenu && (
        <div
          className={`${styles.playlistMenu} ${styles.rowMenu}`}
          role="menu"
          aria-label={t('amplifier.list.trackMenu')}
          style={{ left: rowMenu.x, top: rowMenu.y }}
          // Keep the window-level close handler from running before the item's click.
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => fromMenu(() => onPlay(rowMenu.index))}
          >
            {t('amplifier.play')}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={rowMenu.index === 0}
            onClick={() =>
              fromMenu(() => move(rowMenu.index, rowMenu.index - 1))
            }
          >
            {t('amplifier.list.moveUp')}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={rowMenu.index === tracks.length - 1}
            onClick={() =>
              fromMenu(() => move(rowMenu.index, rowMenu.index + 1))
            }
          >
            {t('amplifier.list.moveDown')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => fromMenu(() => remove(rowMenu.index))}
          >
            {t('amplifier.list.remove')}
          </button>
        </div>
      )}
      <div className={styles.playlistFooter}>
        <div className={styles.playlistMenus}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === 'add'}
            onClick={() => setMenu(menu === 'add' ? null : 'add')}
          >
            {t('amplifier.list.shortAdd')}
          </button>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === 'misc'}
            onClick={() => setMenu(menu === 'misc' ? null : 'misc')}
          >
            {t('amplifier.list.shortMisc')}
          </button>
          {menu && (
            <div
              className={styles.playlistMenu}
              role="menu"
              aria-label={
                menu === 'add'
                  ? t('amplifier.list.add')
                  : t('amplifier.list.misc')
              }
            >
              {menu === 'add' ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openDialog('music')}
                  >
                    {t('amplifier.list.fromMyMusic')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openDialog('shipped')}
                  >
                    {t('amplifier.list.shipped')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openDialog('burn')}
                >
                  {t('amplifier.list.burn')}
                </button>
              )}
            </div>
          )}
        </div>
        <span>
          {t('amplifier.list.summary', {
            n: tracks.length,
            time: formatTime(total),
          })}
        </span>
      </div>
      {dialog === 'music' && (
        <MyMusicDialog onAdd={onAdd} onClose={closeDialog} />
      )}
      {dialog === 'shipped' && (
        <ShippedDialog have={tracks} onAdd={onAdd} onClose={closeDialog} />
      )}
      {dialog === 'burn' && (
        <BurnDialog attempt={burns.current} onClose={closeDialog} />
      )}
    </div>
  );
}
