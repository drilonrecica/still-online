// Desktop icon grid: one icon per resolved shortcut, in a column top-left.
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import recycleBinFull32 from '@/assets/icons/recyclebin-full-32.svg';
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
      aria-label="Desktop"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={() => setSelected(null)}
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
          <span className={styles.label}>{app.label}</span>
        </div>
      ))}
    </div>
  );
}
