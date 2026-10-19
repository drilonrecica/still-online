// glittercodez.example `/glitter`: codes for single tags.
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { useSiteText } from '../useSiteText';
import { CodeTile } from './CodeBox';
import styles from './GlitterCodez.module.css';
import { Layout } from './Layout';
import { glitterEntries } from './logic';

export default function Glitter() {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.glitterHeading}</h2>
      <p className={styles.howTo}>{T.glitterIntro}</p>
      <div className={styles.grid}>
        {glitterEntries(T).map((entry) => (
          <CodeTile key={entry.id} entry={entry} />
        ))}
      </div>
    </Layout>
  );
}
