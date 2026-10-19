// kickflipkings.example `/video`: Dex's skate video. Teasers until the premiere (day 5), then a
// "player": a procedural still (sky, ground, an orange blur), a fake PLAY button whose buffering
// crawls to 99% and sticks there, and the scene-by-scene guide. Nothing ever plays.
import { useEffect, useState } from 'react';
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { scaleMs } from '@/os/speed';
import { useWorldStore } from '@/os/world';
import { upToDay } from '../daily';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';
import { Layout } from './Layout';
import { BUFFER_MAX, bufferAt, daysToPremiere } from './logic';

const TICK_MS = 450;

export default function Video() {
  const { KICKFLIP_TEXT: T, KICKFLIP_VIDEO: V } = useSiteText(KICKFLIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  // null = not pressed yet; otherwise how many buffering ticks have passed.
  const [step, setStep] = useState<number | null>(null);
  const pct = step === null ? null : bufferAt(step);

  useEffect(() => {
    if (step === null || bufferAt(step) >= BUFFER_MAX) return;
    const id = setTimeout(() => setStep(step + 1), scaleMs(TICK_MS));
    return () => clearTimeout(id);
  }, [step]);

  if (day < V.premiereDay) {
    return (
      <Layout>
        <h2 className={styles.heading}>{T.videoHeading}</h2>
        <p className={styles.soon}>
          {T.videoSoon}{' '}
          {t('sites.kickflipkings.premiereIn', {
            n: daysToPremiere(day, V.premiereDay),
          })}
        </p>
        {upToDay(V.teasers, day).map((teaser) => (
          <p key={teaser.day} className={styles.card}>
            {teaser.text}
          </p>
        ))}
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className={styles.heading}>{T.videoHeading}</h2>
      <section
        className={styles.player}
        aria-label={t('sites.kickflipkings.player')}
      >
        <h3 className={styles.cardTitle}>{V.title}</h3>
        <div className={styles.screen}>
          <span className={styles.sky} />
          <span className={styles.ground} />
          <span className={styles.blur} />
          {pct === null ? (
            <button
              type="button"
              className={styles.play}
              aria-label={t('sites.kickflipkings.play')}
              onClick={() => setStep(0)}
            >
              ▶ {V.playLabel}
            </button>
          ) : (
            <p className={styles.buffering} role="status">
              {V.buffering} {t('sites.kickflipkings.percent', { n: pct })}
            </p>
          )}
        </div>
        <div className={styles.bar}>
          <span className={styles.barFill} style={{ width: `${pct ?? 0}%` }} />
        </div>
        <p className={styles.meta}>
          {t('sites.kickflipkings.length', { length: V.length })}
        </p>
        {pct !== null && pct >= BUFFER_MAX && (
          <p className={styles.closed}>{V.stuck}</p>
        )}
      </section>
      <h3 className={styles.cardTitle}>{t('sites.kickflipkings.timeline')}</h3>
      <dl className={styles.timeline}>
        {V.timeline.map((scene) => (
          <div key={scene.at}>
            <dt>{scene.at}</dt>
            <dd>{scene.text}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.meta}>{V.credits}</p>
    </Layout>
  );
}
