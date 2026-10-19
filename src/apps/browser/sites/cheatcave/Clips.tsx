// cheatcave.example `/clips`: the top 10 funny clips out by today, with procedural thumbnails.
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import { formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/useT';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useWorldStore } from '@/os/world';
import { useSiteText } from '../useSiteText';
import styles from './CheatCave.module.css';
import { Layout } from './Layout';
import { topClips } from './logic';

export default function Clips() {
  const { CHEATCAVE_CLIPS, CHEATCAVE_TEXT: T } = useSiteText(CHEATCAVE_HOST);
  const day = useWorldStore((s) => s.day);
  const locale = useLocale();
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{T.clipsHeading}</h2>
      <p>{T.clipsIntro}</p>
      <ol className={styles.clips} aria-label={t('sites.cheatcave.clips')}>
        {topClips(CHEATCAVE_CLIPS, day).map((clip, i) => (
          <li key={clip.id} className={styles.clip} aria-label={clip.title}>
            <span className={styles.rank}>
              {t('sites.cheatcave.rank', { n: i + 1 })}
            </span>
            <span className={styles.thumb}>
              <PhotoCanvas
                photo={clip.photo}
                width={96}
                height={72}
                label={clip.photo.caption}
              />
              <span className={styles.length}>{clip.length}</span>
            </span>
            <span className={styles.clipText}>
              <b>{clip.title}</b>
              <br />
              <span className={styles.meta}>
                {t('sites.cheatcave.uploadedBy', { user: clip.uploader })} ·{' '}
                {t('sites.cheatcave.views', {
                  n: formatNumber(clip.views, locale),
                })}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.empty}>{T.clipsPlayer}</p>
    </Layout>
  );
}
