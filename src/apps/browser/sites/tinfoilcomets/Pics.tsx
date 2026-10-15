// tinfoilcomets.example `/pics`: the "photo gallery" of procedural concert pics.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useWorldStore } from '@/os/world';
import { Layout } from './Layout';
import styles from './TinfoilComets.module.css';

export default function Pics() {
  const { TINFOIL_PICS, TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  const pics = TINFOIL_PICS.filter((p) => p.day <= day);
  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.tinfoilcomets.gallery')}</h2>
      <p className={styles.center}>{T.picsIntro}</p>
      <div className={styles.gallery}>
        {pics.map((p) => (
          <figure key={p.seed} className={styles.pic}>
            <PhotoCanvas
              photo={{ scene: 'concert', seed: p.seed }}
              width={160}
              height={120}
              label={p.caption}
            />
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>
    </Layout>
  );
}
