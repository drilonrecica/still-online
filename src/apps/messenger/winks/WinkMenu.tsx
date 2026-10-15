// The chat toolbar's "Winks ▾" button: a 3×2 grid of still previews; picking one sends it.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { WinkId } from '@/content/types';
import { WinkArt } from './art';
import { WINK_ORDER, WINKS } from './catalog';
import styles from './Winks.module.css';

const COLUMNS = 3;
const MOVES: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -COLUMNS,
  ArrowDown: COLUMNS,
};

export function WinkMenu({
  disabled,
  buttonClassName,
  onSend,
}: {
  disabled: boolean;
  buttonClassName?: string;
  onSend: (wink: WinkId) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    items.current[0]?.focus();
    const close = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
      button.current?.focus();
      return;
    }
    const move = MOVES[e.key];
    if (move === undefined) return;
    e.preventDefault();
    const at = items.current.findIndex((el) => el === document.activeElement);
    const next = (at + move + WINK_ORDER.length) % WINK_ORDER.length;
    items.current[next]?.focus();
  };

  return (
    <div ref={wrap} className={styles.menuWrap}>
      <button
        ref={button}
        type="button"
        className={buttonClassName}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Winks ▾
      </button>
      {open && (
        <div
          className={styles.menu}
          role="menu"
          aria-label="Winks"
          onKeyDown={onKeyDown}
        >
          {WINK_ORDER.map((wink, i) => (
            <button
              key={wink}
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => {
                setOpen(false);
                button.current?.focus();
                onSend(wink);
              }}
            >
              <span className={styles.preview}>
                <WinkArt wink={wink} still />
              </span>
              {WINKS[wink].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
