// searchly.example `/`: the cheesy homepage.
import { useState } from 'react';
import { SEARCHLY_HOST } from '@/content/sites/searchly';
import type { SitePageProps } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { rich } from '../rich';
import { useSiteText } from '../useSiteText';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import styles from './Searchly.module.css';
import { searchUrl } from './search';

export default function Home({ navigate }: SitePageProps) {
  const { SEARCHLY_TEXT: T } = useSiteText(SEARCHLY_HOST);
  const t = useT();
  const [installing, setInstalling] = useState(false);
  return (
    <div className={styles.page}>
      <div className={styles.home}>
        <Logo />
        <p className={styles.tagline}>
          {rich(T.tagline, { every: <b>{T.taglineEvery}</b> })}
        </p>
        <SearchBox navigate={navigate} />
        <p className={styles.toolbarLine}>
          <a
            href="#toolbar"
            className={styles.blink}
            onClick={(e) => {
              e.preventDefault();
              setInstalling(true);
            }}
          >
            {T.toolbarLink}
          </a>
        </p>
        <p className={styles.small}>
          {T.tryLabel}{' '}
          {T.examples.map((q, i) => (
            <span key={q}>
              {i > 0 && ', '}
              <SiteLink href={searchUrl(q)}>{q}</SiteLink>
            </span>
          ))}
        </p>
        <p className={styles.footer}>{T.footer}</p>
      </div>
      {installing && (
        <div
          className={styles.dialog}
          role="dialog"
          aria-label={t('sites.searchly.installing')}
        >
          <div className={styles.dialogTitle}>{T.setupTitle}</div>
          <div className={styles.dialogBody}>
            <p>{T.setupProgress}</p>
            <div
              className={styles.bar}
              role="progressbar"
              aria-valuenow={3}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.barFill} />
            </div>
            <p className={styles.small}>{T.setupNote}</p>
            <button
              type="button"
              className={styles.button}
              onClick={() => setInstalling(false)}
            >
              {t('sites.searchly.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
