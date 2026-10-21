// Desktop icon grid: one icon per resolved shortcut on 75 px cells, top-left down. Icons can
// be dragged to another cell (saved); "Arrange Icons By" puts them back in order.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, RefObject } from 'react';
import recycleBinFull32 from '@/assets/icons/recyclebin-full-32.svg';
import { useT } from '@/i18n/useT';
import { FS_FOLDERS } from '@/os/fs/types';
import { useFsStore } from '@/os/fs/store';
import {
  DESKTOP_SHORTCUTS,
  appShortcut,
  resolveShortcuts,
} from '@/os/shortcuts';
import { useWindowsStore } from '@/os/store/windows';
import { composeHandlers } from '@/os/touch/compose';
import { useActivate } from '@/os/touch/useActivate';
import { useLongPress } from '@/os/touch/useLongPress';
import type { AppDefinition, Shortcut } from '@/os/types';
import styles from './DesktopIcons.module.css';
import {
  cellKey,
  cellLeft,
  cellTop,
  gridSize,
  inGrid,
  layoutIcons,
  nearestFreeCell,
  type Cell,
} from './grid';
import { useDesktopStore } from './store';
import { useIconDrag } from './useIconDrag';

/** The desktop's size; jsdom (no layout) falls back to the window's. */
function useAreaSize(ref: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setSize({
        w: el.clientWidth || window.innerWidth,
        h: el.clientHeight || window.innerHeight,
      });
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export interface DesktopIconsProps {
  /** Defaults to `DESKTOP_SHORTCUTS`. */
  shortcuts?: readonly Shortcut[];
  /** Test override: shown as plain app shortcuts, bypassing the registry. */
  apps?: readonly AppDefinition[];
}

export function DesktopIcons({ shortcuts, apps }: DesktopIconsProps) {
  // Shortcut labels are resolved here; the hook re-renders the grid on a language switch.
  const t = useT();
  const icons = apps
    ? resolveShortcuts(apps.map(appShortcut), (id) =>
        apps.find((app) => app.id === id),
      )
    : resolveShortcuts(shortcuts ?? DESKTOP_SHORTCUTS);
  const openApp = useWindowsStore((s) => s.openApp);
  const binFull = useFsStore((s) =>
    Object.values(s.nodes).some((n) => n.parentId === FS_FOLDERS.recycle),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const size = useAreaSize(rootRef);
  const saved = useDesktopStore((s) => s.positions);
  const grid = gridSize(size.w, size.h);
  const keys = icons.map((icon) => icon.key).join('|');
  const layout = useMemo(
    () => layoutIcons(keys.split('|'), saved, grid),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by value
    [keys, saved, grid.cols, grid.rows],
  );
  const drag = useIconDrag((id, dx, dy) => {
    const from = layout.get(id);
    if (!from) return;
    const others = new Set(
      [...layout]
        .filter(([key]) => key !== id)
        .map(([, cell]) => cellKey(cell)),
    );
    const to =
      nearestFreeCell(cellLeft(from) + dx, cellTop(from) + dy, others, grid) ??
      from;
    // The whole layout is saved, so no other icon shifts to fill the gap. Saved cells off
    // this (smaller) screen are kept, so those icons go back to them on a bigger one.
    const next: Record<string, Cell> = Object.fromEntries(layout);
    for (const [key, cell] of Object.entries(saved)) {
      if (key in next && !inGrid(cell, grid)) next[key] = cell;
    }
    next[id] = to;
    useDesktopStore.getState().place(next);
    setSelected(id);
  });
  // Double-click or a tap opens; a right-click or a long-press opens the desktop menu.
  const activate = useActivate((icon: (typeof icons)[number]) =>
    openApp(icon.appId, icon.props),
  );
  const press = useLongPress(({ clientX, clientY }) => {
    setSelected(null);
    setMenu({ x: clientX, y: clientY });
  });

  // Any click elsewhere, Escape or a blur closes the context menu.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (icons.length === 0) return;
    const index = icons.findIndex((app) => app.key === selected);
    const move = (to: number) => {
      e.preventDefault();
      setSelected(icons[to]?.key ?? null);
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      move(Math.min(index + 1, icons.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      move(Math.max(index - 1, 0));
    } else if (e.key === 'Enter' && selected) {
      e.preventDefault();
      const target = icons.find((icon) => icon.key === selected);
      if (target) openApp(target.appId, target.props);
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.desktop}
      data-testid="desktop"
      data-desktop-background
      role="listbox"
      aria-label={t('desktop.label')}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={() => setSelected(null)}
      {...press()}
    >
      {icons.map((app) => {
        const cell = layout.get(app.key) ?? { col: 0, row: 0 };
        return (
          <div
            key={app.key}
            role="option"
            aria-selected={selected === app.key}
            className={styles.icon}
            data-selected={selected === app.key}
            data-icon={app.key}
            style={{ left: cellLeft(cell), top: cellTop(cell) }}
            {...composeHandlers(
              {
                onClick: (e: MouseEvent) => {
                  e.stopPropagation();
                  setSelected(app.key);
                },
              },
              activate(app),
              drag(app.key),
            )}
          >
            <span className={styles.art}>
              <img
                src={
                  app.appId === 'recyclebin' && binFull
                    ? recycleBinFull32
                    : app.icon32
                }
                alt=""
                width={32}
                height={32}
                draggable={false}
              />
              {app.shortcut && (
                <span
                  className={styles.arrow}
                  data-testid="shortcut-arrow"
                  aria-hidden
                />
              )}
            </span>
            <span className={styles.label}>{app.label}</span>
          </div>
        );
      })}
      {menu && (
        <ul
          className={styles.menu}
          role="menu"
          style={{ left: menu.x, top: menu.y }}
          // Keep the window-level close handler from running before the item's click.
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <li
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setMenu(null);
              openApp('display');
            }}
          >
            {t('desktop.menu.properties')}
          </li>
          <li
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setMenu(null);
              useDesktopStore.getState().arrange();
            }}
          >
            {t('desktop.menu.arrangeIcons')}
          </li>
          <li
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setMenu(null);
              setSelected(null);
            }}
          >
            {t('desktop.menu.refresh')}
          </li>
        </ul>
      )}
    </div>
  );
}
