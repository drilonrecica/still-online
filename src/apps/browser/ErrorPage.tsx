// "The page cannot be displayed": shown offline and for unknown addresses. Original wording.
import styles from './Browser.module.css';

export interface ErrorPageProps {
  url: string;
  offline: boolean;
  onConnect: () => void;
}

export function ErrorPage({ url, offline, onConnect }: ErrorPageProps) {
  return (
    <div className={styles.errorPage} data-testid="page-cannot-be-displayed">
      <h1 className={styles.errorTitle}>
        <span className={styles.errorBadge} aria-hidden="true">
          i
        </span>
        The page cannot be displayed
      </h1>
      <p>
        The page you asked for is not answering right now. The website might be
        down for a while, or this computer might not be able to reach it.
      </p>
      <hr />
      <h2>Most likely causes:</h2>
      <ul>
        {offline && <li>You are not connected to the Internet.</li>}
        <li>The address may have been typed incorrectly.</li>
        <li>The website is having technical difficulties.</li>
      </ul>
      <h2>What you can try:</h2>
      <ul className={styles.tryList}>
        <li>
          Connect to the Internet, then try the page again.{' '}
          <button type="button" onClick={onConnect}>
            Connect
          </button>
        </li>
        <li>
          Check that the address is spelled correctly:{' '}
          <span className={styles.errorUrl}>{url}</span>
        </li>
        <li>Click the Refresh button, or try again later.</li>
      </ul>
      <p className={styles.errorFooter}>
        Server not found or no connection
        <br />
        Web Explorer
      </p>
    </div>
  );
}
