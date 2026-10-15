// Searchly's query form: the box plus the two buttons. Used on the home and results pages.
import { type FormEvent, useState } from 'react';
import { useLocale, useT } from '@/i18n/useT';
import { SITES } from '..';
import { buildIndex, luckyUrl, searchUrl } from './search';
import styles from './Searchly.module.css';

export function SearchBox({
  initial = '',
  navigate,
  compact = false,
}: {
  initial?: string;
  navigate: (url: string) => void;
  compact?: boolean;
}) {
  const [text, setText] = useState(initial);
  const locale = useLocale();
  const t = useT();
  const go = (e: FormEvent) => {
    e.preventDefault();
    navigate(searchUrl(text.trim()));
  };
  return (
    <form
      className={compact ? styles.formCompact : styles.form}
      onSubmit={go}
      role="search"
    >
      <input
        className={styles.input}
        type="text"
        name="q"
        aria-label={t('sites.searchly.searchLabel')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
      />
      <div className={styles.buttons}>
        <button type="submit" className={styles.button}>
          {t('sites.searchly.search')}
        </button>
        {!compact && (
          <button
            type="button"
            className={styles.button}
            onClick={() => navigate(luckyUrl(text, buildIndex(SITES, locale)))}
          >
            {t('sites.searchly.lucky')}
          </button>
        )}
      </div>
    </form>
  );
}
