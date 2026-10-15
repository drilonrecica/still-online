// Searchly's query form: the box plus the two buttons. Used on the home and results pages.
import { type FormEvent, useState } from 'react';
import { useLocale } from '@/i18n/useT';
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
        aria-label="Search the web"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
      />
      <div className={styles.buttons}>
        <button type="submit" className={styles.button}>
          Searchly Search
        </button>
        {!compact && (
          <button
            type="button"
            className={styles.button}
            onClick={() => navigate(luckyUrl(text, buildIndex(SITES, locale)))}
          >
            I&apos;m Feeling Lucky
          </button>
        )}
      </div>
    </form>
  );
}
