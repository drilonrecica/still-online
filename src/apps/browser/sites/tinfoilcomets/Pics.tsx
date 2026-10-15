// tinfoilcomets.example `/pics`: the "photo gallery" of procedural concert pics.
import { TINFOIL_PICS } from '@/content/sites/tinfoilcomets';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useWorldStore } from '@/os/world';
import { Layout } from './Layout';
import styles from './TinfoilComets.module.css';

export default function Pics() {
  const day = useWorldStore((s) => s.day);
  const pics = TINFOIL_PICS.filter((p) => p.day <= day);
  return (
    <Layout>
      <h2 className={styles.heading}>~*~ PIC GALLERY ~*~</h2>
      <p className={styles.center}>
        all taken by me w my disposable camera!!! (except the ones that r not)
      </p>
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
