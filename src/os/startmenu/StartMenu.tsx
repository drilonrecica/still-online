// Start menu: two columns (programs | places), user header, Log Off / Turn Off footer.
import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { getApp, listApps } from '@/apps/registry';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppDefinition, AppId } from '@/os/types';
import avatar from './avatar.svg';
import styles from './StartMenu.module.css';

/** Fixed right-column entries, in order. */
const PLACE_IDS: readonly AppId[] = ['mycomputer', 'recyclebin'];

export interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  /** Defaults to every registered app with `showInStartMenu`. */
  apps?: readonly AppDefinition[];
}

export function StartMenu({ open, onClose, apps }: StartMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playerName = useSettingsStore((s) => s.playerName);
  const openApp = useWindowsStore((s) => s.openApp);
  const logOff = useSessionStore((s) => s.logOff);
  const shutDown = useSessionStore((s) => s.shutDown);

  // Outside click and Escape close the menu. The Start button is "outside" too,
  // so it is excluded here and toggles the menu itself.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (rootRef.current?.contains(target)) return;
      if (target?.closest('[data-start-button]')) return;
      onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [open]);

  if (!open) return null;

  const programs = apps ?? listApps().filter((app) => app.showInStartMenu);
  const places = PLACE_IDS.map((id) => getApp(id)).filter(
    (app): app is AppDefinition => app !== undefined,
  );

  function launch(id: AppId) {
    openApp(id);
    onClose();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button')];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown'
        ? (index + 1) % items.length
        : (index - 1 + items.length) % items.length;
    e.preventDefault();
    items[next]?.focus();
  }

  const entry = (app: AppDefinition, size: 32 | 16 = 32) => (
    <li key={app.id}>
      <button
        type="button"
        className={styles.item}
        onClick={() => launch(app.id)}
      >
        <img
          src={size === 32 ? app.icon32 : app.icon16}
          alt=""
          width={size}
          height={size}
          draggable={false}
        />
        <span>{app.label ?? app.title}</span>
      </button>
    </li>
  );

  return (
    <div
      ref={rootRef}
      className={styles.menu}
      role="menu"
      aria-label="Start menu"
      onKeyDown={onKeyDown}
    >
      <div className={styles.header}>
        <img src={avatar} alt="" width={40} height={40} draggable={false} />
        <span className={styles.name}>{playerName}</span>
      </div>
      <div className={styles.columns}>
        <ul className={styles.left}>{programs.map((app) => entry(app))}</ul>
        <ul className={styles.right}>{places.map((app) => entry(app, 16))}</ul>
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.footerButton}
          onClick={() => {
            onClose();
            logOff();
          }}
        >
          Log Off
        </button>
        <button
          type="button"
          className={styles.footerButton}
          onClick={() => {
            onClose();
            shutDown();
          }}
        >
          Turn Off Computer
        </button>
      </div>
    </div>
  );
}
