// "The page cannot be displayed": shown offline and for unknown addresses. Original wording.
import { useT } from '@/i18n/useT';
import styles from './Browser.module.css';

export interface ErrorPageProps {
  url: string;
  offline: boolean;
  onConnect: () => void;
}

export function ErrorPage({ url, offline, onConnect }: ErrorPageProps) {
  const t = useT();
  return (
    <div className={styles.errorPage} data-testid="page-cannot-be-displayed">
      <h1 className={styles.errorTitle}>
        <span className={styles.errorBadge} aria-hidden="true">
          i
        </span>
        {t('browser.error.title')}
      </h1>
      <p>{t('browser.error.intro')}</p>
      <hr />
      <h2>{t('browser.error.causesHeading')}</h2>
      <ul>
        {offline && <li>{t('browser.error.causeOffline')}</li>}
        <li>{t('browser.error.causeTypo')}</li>
        <li>{t('browser.error.causeServer')}</li>
      </ul>
      <h2>{t('browser.error.tryHeading')}</h2>
      <ul className={styles.tryList}>
        <li>
          {t('browser.error.tryConnect')}{' '}
          <button type="button" onClick={onConnect}>
            {t('browser.error.connect')}
          </button>
        </li>
        <li>
          {t('browser.error.tryAddress')}{' '}
          <span className={styles.errorUrl}>{url}</span>
        </li>
        <li>{t('browser.error.tryRefresh')}</li>
      </ul>
      <p className={styles.errorFooter}>
        {t('browser.error.footer')}
        <br />
        {t('apps.browser.title')}
      </p>
    </div>
  );
}
