// The Favorites explorer bar: the saved pages, Add, and a Delete button per favorite.
import type { Favorite } from '@/content/sites/types';
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
  return (
    <aside className={styles.pane} aria-label="Favorites">
      <div className={styles.paneHeader}>
        <span>Favorites</span>
        <button
          type="button"
          className={styles.paneClose}
          onClick={onClose}
          aria-label="Close Favorites"
        >
          ×
        </button>
      </div>
      <div className={styles.paneActions}>
        <button type="button" onClick={onAdd} disabled={!canAdd}>
          Add...
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
              aria-label={`Delete ${f.title}`}
            >
              ×
            </button>
          </li>
        ))}
        {favorites.length === 0 && (
          <li className={styles.paneEmpty}>(empty)</li>
        )}
      </ul>
    </aside>
  );
}
