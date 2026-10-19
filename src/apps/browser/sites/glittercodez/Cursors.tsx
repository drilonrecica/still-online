// glittercodez.example `/cursors`: codes for single tags.
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { useSiteText } from '../useSiteText';
import { CodeTile } from './CodeBox';
import styles from './GlitterCodez.module.css';
import { Layout } from './Layout';
import { cursorEntries } from './logic';

export default function Cursors() {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.cursorsHeading}</h2>
      <p className={styles.howTo}>{T.cursorsIntro}</p>
      <div className={styles.grid}>
        {cursorEntries(T).map((entry) => (
          <CodeTile key={entry.id} entry={entry} />
        ))}
      </div>
    </Layout>
  );
}
