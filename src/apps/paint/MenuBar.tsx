// Paint's classic menu bar: click a title to open its menu, hover to switch while one is open.
import { useState } from 'react';
import styles from './Paint.module.css';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  checked?: boolean;
  /** Shown right-aligned, e.g. `Ctrl+Z`. */
  shortcut?: string;
  /** Draws a separator above the item. */
  separator?: boolean;
}

export interface Menu {
  id: string;
  label: string;
  items: MenuItem[];
}

export function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div
      className={styles.menubar}
      role="menubar"
      aria-label="Paint"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
      }}
    >
      {menus.map((menu) => (
        <div key={menu.id} className={styles.menu}>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === menu.id}
            className={styles.menuButton}
            onClick={() => setOpen(open === menu.id ? null : menu.id)}
            onMouseEnter={() => open && setOpen(menu.id)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(null);
            }}
          >
            {menu.label}
          </button>
          {open === menu.id && (
            <div
              className={styles.dropdown}
              role="menu"
              aria-label={menu.label}
            >
              {menu.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role={
                    item.checked === undefined ? 'menuitem' : 'menuitemradio'
                  }
                  aria-checked={item.checked}
                  disabled={item.disabled}
                  className={styles.item}
                  data-separator={item.separator || undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(null);
                  }}
                  onClick={() => {
                    setOpen(null);
                    item.onSelect();
                  }}
                >
                  <span className={styles.check} aria-hidden>
                    {item.checked ? '•' : ''}
                  </span>
                  <span className={styles.itemLabel}>{item.label}</span>
                  {item.shortcut && (
                    <span className={styles.shortcut}>{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
