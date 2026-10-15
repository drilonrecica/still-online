// The still online wordmark: mark, name, optional edition tag and tagline.
import { APP_EDITION, APP_TAGLINE } from './brand';
import { Mark } from './Mark';
import styles from './Wordmark.module.css';

const MARK_PX = { lg: 64, md: 40, sm: 28 } as const;

export interface WordmarkProps {
  size?: keyof typeof MARK_PX;
  edition?: boolean;
  tagline?: boolean;
}

export function Wordmark({
  size = 'md',
  edition = false,
  tagline = false,
}: WordmarkProps) {
  return (
    <div className={styles.wordmark} data-size={size} data-testid="wordmark">
      <div className={styles.lockup}>
        <Mark size={MARK_PX[size]} />
        <div className={styles.text}>
          <span className={styles.name}>
            still <span className={styles.online}>online</span>
          </span>
          {edition && <span className={styles.edition}>{APP_EDITION}</span>}
        </div>
      </div>
      {tagline && <p className={styles.tagline}>{APP_TAGLINE}</p>}
    </div>
  );
}
