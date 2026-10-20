// IE6-style menu bar. Menus without items render disabled. Hover switching is mouse-only, so a
// tap's compatibility `mouseenter` never switches menus under the finger (v0.6).
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import styles from './Browser.module.css';

export type MenuEntry =
  | {
      kind: 'item';
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      /** A radio item (one of a group): renders a bullet when true. */
      checked?: boolean;
    }
  | { kind: 'separator' };

export interface Menu {
  label: string;
  items: readonly MenuEntry[];
}

export function MenuBar({ menus }: { menus: readonly Menu[] }) {
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      className={styles.menubar}
      role="menubar"
      aria-label={t('apps.browser.title')}
    >
      {menus.map((menu) => {
        const enabled = menu.items.length > 0;
        return (
          <div
            key={menu.label}
            className={styles.menu}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              aria-haspopup={enabled ? 'menu' : undefined}
              aria-expanded={enabled ? open === menu.label : undefined}
              disabled={!enabled}
              className={styles.menuButton}
              onClick={() => setOpen(open === menu.label ? null : menu.label)}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse' && open && enabled)
                  setOpen(menu.label);
              }}
            >
              {menu.label}
            </button>
            {open === menu.label && (
              <div
                className={styles.dropdown}
                role="menu"
                aria-label={menu.label}
              >
                {menu.items.map((item, i) =>
                  item.kind === 'separator' ? (
                    <hr key={`sep-${i}`} className={styles.separator} />
                  ) : (
                    <button
                      key={`${item.label}-${i}`}
                      type="button"
                      role={
                        item.checked === undefined
                          ? 'menuitem'
                          : 'menuitemradio'
                      }
                      aria-checked={item.checked}
                      className={styles.item}
                      disabled={item.disabled}
                      onClick={() => {
                        setOpen(null);
                        item.onSelect();
                      }}
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
