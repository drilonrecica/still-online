// The Standard Buttons. On a phone (v0.6) they condense to 36 px icon buttons: Back, Forward,
// Refresh, Home and Favorites (no Stop, no labels).
import { useT } from '@/i18n/useT';
import styles from './Browser.module.css';
import {
  BackIcon,
  ForwardIcon,
  HomeIcon,
  RefreshIcon,
  StarIcon,
  StopIcon,
} from './icons';
import type { Navigation } from './useNavigation';

export interface ToolbarProps {
  nav: Navigation;
  phone: boolean;
  favoritesOpen: boolean;
  onToggleFavorites: () => void;
}

export function Toolbar({
  nav,
  phone,
  favoritesOpen,
  onToggleFavorites,
}: ToolbarProps) {
  const t = useT();
  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label={t('browser.toolbar.label')}
    >
      <button
        type="button"
        className={styles.tool}
        onClick={nav.back}
        disabled={!nav.canBack}
        aria-label={t('browser.toolbar.back')}
      >
        <BackIcon />
        {!phone && <span>{t('browser.toolbar.back')}</span>}
      </button>
      <button
        type="button"
        className={styles.tool}
        onClick={nav.forward}
        disabled={!nav.canForward}
        aria-label={t('browser.toolbar.forward')}
      >
        <ForwardIcon />
      </button>
      {!phone && (
        <button
          type="button"
          className={styles.tool}
          onClick={nav.stop}
          disabled={!nav.loading}
          aria-label={t('browser.toolbar.stop')}
        >
          <StopIcon />
        </button>
      )}
      <button
        type="button"
        className={styles.tool}
        onClick={nav.refresh}
        aria-label={t('browser.toolbar.refresh')}
      >
        <RefreshIcon />
      </button>
      <button
        type="button"
        className={styles.tool}
        onClick={nav.home}
        aria-label={t('browser.toolbar.home')}
      >
        <HomeIcon />
      </button>
      <span className={styles.toolSep} aria-hidden="true" />
      <button
        type="button"
        className={styles.tool}
        onClick={onToggleFavorites}
        aria-pressed={favoritesOpen}
        aria-label={t('browser.toolbar.favorites')}
      >
        <StarIcon />
        {!phone && <span>{t('browser.toolbar.favorites')}</span>}
      </button>
    </div>
  );
}
