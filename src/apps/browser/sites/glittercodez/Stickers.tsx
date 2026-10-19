// glittercodez.example `/stickers`: codes for single tags.
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { useSiteText } from '../useSiteText';
import { CodeTile } from './CodeBox';
import styles from './GlitterCodez.module.css';
import { Layout } from './Layout';
import { stickerEntries } from './logic';

export default function Stickers() {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.stickersHeading}</h2>
      <p className={styles.howTo}>{T.stickersIntro}</p>
      <div className={styles.grid}>
        {stickerEntries(T).map((entry) => (
          <CodeTile key={entry.id} entry={entry} />
        ))}
      </div>
    </Layout>
  );
}
