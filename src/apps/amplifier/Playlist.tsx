// Amplifier playlist panel: numbered track list with durations, editing and a footer
// with the ADD / MISC menus and the total time.
import { useT } from '@/i18n/useT';
import { useRef, useState, type KeyboardEvent } from 'react';
import type { PlaylistTrack } from '@/content/playlist';
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
  const burns = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);

  const focusRow = (i: number) =>
    requestAnimationFrame(() =>
      (listRef.current?.children[i] as HTMLElement | undefined)?.focus(),
    );

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
        onRemove(index);
        setSelected(Math.min(index, tracks.length - 2));
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
          onMove(index, to);
          setSelected(to);
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
    <div className={styles.playlist} data-testid="playlist">
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
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onDoubleClick={() => onPlay(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom >= 0) {
                onMove(dragFrom, i);
                setSelected(i);
              }
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
