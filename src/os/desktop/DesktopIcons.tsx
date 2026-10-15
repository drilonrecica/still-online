// Desktop icon grid: one icon per resolved shortcut, in a column top-left.
import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
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
import type { AppDefinition, Shortcut } from '@/os/types';
import styles from './DesktopIcons.module.css';

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
      className={styles.desktop}
      data-testid="desktop"
      role="listbox"
      aria-label={t('desktop.label')}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={() => setSelected(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setSelected(null);
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {icons.map((app) => (
        <div
          key={app.key}
          role="option"
          aria-selected={selected === app.key}
          className={styles.icon}
          data-selected={selected === app.key}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(app.key);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            openApp(app.appId, app.props);
          }}
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
      ))}
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
            onClick={() => setMenu(null)}
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
