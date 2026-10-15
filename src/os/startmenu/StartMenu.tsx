// Start menu: pinned programs + All Programs flyout | places, user header, Log Off / Turn Off footer.
import { useT } from '@/i18n/useT';
import { usePlayerName } from '@/i18n/settingsText';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { listApps } from '@/apps/registry';
import {
  START_PLACES,
  resolveShortcuts,
  type ResolvedShortcut,
} from '@/os/shortcuts';
import { useSessionStore } from '@/os/store/session';
import { useWindowsStore } from '@/os/store/windows';
import {
  APP_CATEGORIES,
  type AppCategory,
  type AppDefinition,
  type AppId,
  type WindowProps,
} from '@/os/types';
import avatar from './avatar.svg';
import styles from './StartMenu.module.css';

const CATEGORY_LABELS: Record<AppCategory, string> = {
  accessories: 'Accessories',
  games: 'Games',
  internet: 'Internet',
  entertainment: 'Entertainment',
  system: 'System Tools',
};

const HOVER_OPEN_MS = 300;

export interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  /** Defaults to every registered app with `pinned`. Shown in the left column. */
  apps?: readonly AppDefinition[];
}

export function StartMenu({ open, onClose, apps }: StartMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const playerName = usePlayerName();
  const openApp = useWindowsStore((s) => s.openApp);
  const logOff = useSessionStore((s) => s.logOff);
  const shutDown = useSessionStore((s) => s.shutDown);
  const [flyout, setFlyout] = useState(false);
  const [category, setCategory] = useState<AppCategory | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  // What to focus after the next render, when a keyboard action changed the open levels.
  const focusAfter = useRef<
    'flyout' | 'sub' | 'allPrograms' | 'category' | null
  >(null);
  const depth = useRef(0);
  depth.current = category ? 2 : flyout ? 1 : 0;

  const closeLevel = () => {
    if (category) {
      focusAfter.current = 'category';
      setCategory(null);
    } else if (flyout) {
      focusAfter.current = 'allPrograms';
      setFlyout(false);
    }
  };
  const closeLevelRef = useRef(closeLevel);
  closeLevelRef.current = closeLevel;

  // Outside click and Escape close the menu. The Start button is "outside" too,
  // so it is excluded here and toggles the menu itself. Escape closes one level.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (rootRef.current?.contains(target)) return;
      if (target?.closest('[data-start-button]')) return;
      onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (depth.current > 0) closeLevelRef.current();
      else onClose();
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
    else {
      setFlyout(false);
      setCategory(null);
    }
  }, [open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    const what = focusAfter.current;
    if (!what) return;
    focusAfter.current = null;
    const root = rootRef.current;
    if (!root) return;
    const first = (sel: string) =>
      root.querySelector<HTMLElement>(`${sel} button`)?.focus();
    if (what === 'allPrograms') first('[data-all-programs]');
    else if (what === 'flyout') first('[data-level="flyout"]');
    else if (what === 'sub') first('[data-level="sub"]');
    else if (what === 'category') {
      root
        .querySelector<HTMLElement>(
          '[data-level="flyout"] button[aria-expanded]',
        )
        ?.focus();
    }
  }, [flyout, category]);

  if (!open) return null;

  const programs = apps ?? listApps().filter((app) => app.pinned);
  const places = resolveShortcuts(START_PLACES);
  const categories = APP_CATEGORIES.map((id) => ({
    id,
    apps: listApps().filter((app) => app.category === id),
  })).filter((c) => c.apps.length > 0);

  function launch(id: AppId, props?: WindowProps) {
    openApp(id, props);
    onClose();
  }

  function items(group: Element | null): HTMLElement[] {
    const root = rootRef.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('button')].filter(
      (b) => b.closest('[data-level]') === group,
    );
  }

  function openCategory(id: AppCategory, byKeyboard: boolean) {
    window.clearTimeout(hoverTimer.current);
    if (byKeyboard) focusAfter.current = 'sub';
    setCategory(id);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const active = document.activeElement as HTMLElement | null;
    const group = active?.closest('[data-level]') ?? null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = items(group);
      const index = active ? list.indexOf(active) : -1;
      const next =
        e.key === 'ArrowDown'
          ? (index + 1) % list.length
          : (index - 1 + list.length) % list.length;
      e.preventDefault();
      list[next]?.focus();
    } else if (e.key === 'ArrowRight') {
      if (active?.hasAttribute('data-all-programs')) {
        e.preventDefault();
        focusAfter.current = 'flyout';
        setFlyout(true);
      } else if (active?.dataset.category) {
        e.preventDefault();
        openCategory(active.dataset.category as AppCategory, true);
      }
    } else if (e.key === 'ArrowLeft') {
      if (group) {
        e.preventDefault();
        closeLevel();
      }
    }
  }

  const iconEntry = (
    key: string,
    label: string,
    icon: string,
    size: 32 | 16,
    onClick: () => void,
  ) => (
    <li key={key} role="none">
      <button
        type="button"
        role="menuitem"
        className={styles.item}
        onClick={onClick}
      >
        <img src={icon} alt="" width={size} height={size} draggable={false} />
        <span>{label}</span>
      </button>
    </li>
  );

  const appEntry = (app: AppDefinition, size: 32 | 16) =>
    iconEntry(
      app.id,
      t(app.labelKey ?? app.titleKey),
      size === 32 ? app.icon32 : app.icon16,
      size,
      () => launch(app.id),
    );

  const shortcutEntry = (s: ResolvedShortcut) =>
    iconEntry(s.key, s.label, s.icon16, 16, () => launch(s.appId, s.props));

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
        <div className={styles.leftColumn}>
          <ul className={styles.left} role="none">
            {programs.map((app) => appEntry(app, 32))}
          </ul>
          <div className={styles.allPrograms}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={flyout}
              data-all-programs
              className={styles.allProgramsButton}
              onClick={() => {
                setFlyout((o) => !o);
                setCategory(null);
              }}
            >
              <span>All Programs</span>
              <span className={styles.arrow} aria-hidden="true">
                ▶
              </span>
            </button>
          </div>
        </div>
        <ul className={styles.right} role="none">
          {places.map(shortcutEntry)}
        </ul>
      </div>
      {flyout && (
        <ul
          className={styles.flyout}
          role="menu"
          aria-label="All Programs"
          data-level="flyout"
        >
          {categories.map((c) => (
            <li
              key={c.id}
              role="none"
              className={styles.categoryItem}
              onMouseEnter={() => {
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(
                  () => setCategory(c.id),
                  HOVER_OPEN_MS,
                );
              }}
              onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
            >
              <button
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={category === c.id}
                data-category={c.id}
                className={styles.item}
                onClick={() => openCategory(c.id, false)}
              >
                <img
                  src={c.apps[0]?.icon16}
                  alt=""
                  width={16}
                  height={16}
                  draggable={false}
                />
                <span>{CATEGORY_LABELS[c.id]}</span>
                <span className={styles.arrow} aria-hidden="true">
                  ▶
                </span>
              </button>
              {category === c.id && (
                <ul
                  className={styles.submenu}
                  role="menu"
                  aria-label={CATEGORY_LABELS[c.id]}
                  data-level="sub"
                >
                  {c.apps.map((app) => appEntry(app, 16))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <button
          type="button"
          role="menuitem"
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
          role="menuitem"
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
