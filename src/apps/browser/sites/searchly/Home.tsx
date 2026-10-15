// searchly.example `/`: the cheesy homepage.
import { useState } from 'react';
import type { SitePageProps } from '@/content/sites/types';
import { SiteLink } from '../../SiteLink';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import styles from './Searchly.module.css';

export default function Home({ navigate }: SitePageProps) {
  const [installing, setInstalling] = useState(false);
  return (
    <div className={styles.page}>
      <div className={styles.home}>
        <Logo />
        <p className={styles.tagline}>
          Search <b>every</b> page on the whole World Wide Web!
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
            Searchly Toolbar &mdash; download now!
          </a>
        </p>
        <p className={styles.small}>
          Try: <SiteLink href="/search?q=fan">fan</SiteLink>,{' '}
          <SiteLink href="/search?q=gossip">gossip</SiteLink>,{' '}
          <SiteLink href="/search?q=tips">tips</SiteLink>
        </p>
        <p className={styles.footer}>
          &copy; 2007 Searchly Inc. &middot; Make Searchly your homepage!
        </p>
      </div>
      {installing && (
        <div className={styles.dialog} role="dialog" aria-label="Installing">
          <div className={styles.dialogTitle}>Searchly Toolbar Setup</div>
          <div className={styles.dialogBody}>
            <p>Installing Searchly Toolbar&hellip; 3%</p>
            <div
              className={styles.bar}
              role="progressbar"
              aria-valuenow={3}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.barFill} />
            </div>
            <p className={styles.small}>Please do not close this window.</p>
            <button
              type="button"
              className={styles.button}
              onClick={() => setInstalling(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
