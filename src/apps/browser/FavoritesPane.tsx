// The Favorites explorer bar: the saved pages, Add, and a Delete button per favorite.
import type { Favorite } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import styles from './Browser.module.css';
import { StarIcon } from './icons';

export interface FavoritesPaneProps {
  favorites: readonly Favorite[];
  canAdd: boolean;
  onAdd: () => void;
  onOpen: (url: string) => void;
  onRemove: (url: string) => void;
  onClose: () => void;
}

export function FavoritesPane({
  favorites,
  canAdd,
  onAdd,
  onOpen,
  onRemove,
  onClose,
}: FavoritesPaneProps) {
  const t = useT();
  return (
    <aside className={styles.pane} aria-label={t('browser.pane.title')}>
      <div className={styles.paneHeader}>
        <span>{t('browser.pane.title')}</span>
        <button
          type="button"
          className={styles.paneClose}
          onClick={onClose}
          aria-label={t('browser.pane.close')}
        >
          ×
        </button>
      </div>
      <div className={styles.paneActions}>
        <button type="button" onClick={onAdd} disabled={!canAdd}>
          {t('browser.pane.add')}
        </button>
      </div>
      <ul className={styles.paneList}>
        {favorites.map((f) => (
          <li key={f.url}>
            <button
              type="button"
              className={styles.paneLink}
              onClick={() => onOpen(f.url)}
              title={f.url}
            >
              <StarIcon size={16} />
              <span>{f.title}</span>
            </button>
            <button
              type="button"
              className={styles.paneDelete}
              onClick={() => onRemove(f.url)}
              aria-label={t('browser.pane.remove', { title: f.title })}
            >
              ×
            </button>
          </li>
        ))}
        {favorites.length === 0 && (
          <li className={styles.paneEmpty}>{t('browser.pane.empty')}</li>
        )}
      </ul>
    </aside>
  );
}
