// Desktop icon grid: one icon per app with `showOnDesktop`, in a column top-left.
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { listApps } from '@/apps/registry';
import { useWindowsStore } from '@/os/store/windows';
import type { AppDefinition, AppId } from '@/os/types';
import styles from './DesktopIcons.module.css';

export interface DesktopIconsProps {
  /** Defaults to every registered app with `showOnDesktop`. */
  apps?: readonly AppDefinition[];
}

function desktopApps(): AppDefinition[] {
  return listApps().filter((app) => app.showOnDesktop);
}

export function DesktopIcons({ apps }: DesktopIconsProps) {
  const icons = apps ?? desktopApps();
  const openApp = useWindowsStore((s) => s.openApp);
  const [selected, setSelected] = useState<AppId | null>(null);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (icons.length === 0) return;
    const index = icons.findIndex((app) => app.id === selected);
    const move = (to: number) => {
      e.preventDefault();
      setSelected(icons[to]?.id ?? null);
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      move(Math.min(index + 1, icons.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      move(Math.max(index - 1, 0));
    } else if (e.key === 'Enter' && selected) {
      e.preventDefault();
      openApp(selected);
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
          key={app.id}
          role="option"
          aria-selected={selected === app.id}
          className={styles.icon}
          data-selected={selected === app.id}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(app.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            openApp(app.id);
          }}
        >
          <img
            src={app.icon32}
            alt=""
            width={32}
            height={32}
            draggable={false}
          />
          <span className={styles.label}>{app.title}</span>
        </div>
      ))}
    </div>
  );
}
