// virusguard.example `/`: a blinking scare banner, a fake scan list, a Buy button that goes nowhere,
// and fine print saying it's all a joke.
import { useState } from 'react';
import {
  VIRUSGUARD_TESTIMONIALS,
  VIRUSGUARD_TEXT as T,
  VIRUSGUARD_THREATS,
} from '@/content/sites/virusguard';
import styles from './VirusGuard.module.css';

function Shield() {
  return (
    <svg viewBox="0 0 48 56" width="48" height="56" aria-hidden>
      <path
        d="M24 2 4 9v17c0 14 9 23 20 28 11-5 20-14 20-28V9z"
        fill="#1f8f3a"
        stroke="#0b4d1c"
        strokeWidth="2"
      />
      <path
        d="M14 28l7 7 13-15"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Shield />
        <div>
          <h1 className={styles.brand}>{T.brand}</h1>
          <p className={styles.slogan}>{T.slogan}</p>
        </div>
      </header>

      <div className={styles.alert} role="alert">
        <p className={styles.alertBig}>{T.alert}</p>
        <p>{T.subAlert}</p>
      </div>

      <section className={styles.scan} aria-label={T.scanTitle}>
        <h2>{T.scanTitle}</h2>
        <p className={styles.progress}>
          <span className={styles.meter} aria-hidden>
            <span />
          </span>{' '}
          {T.scanning}
        </p>
        <table className={styles.threats}>
          <thead>
            <tr>
              <th scope="col">Threat</th>
              <th scope="col">Found in</th>
              <th scope="col">Risk</th>
            </tr>
          </thead>
          <tbody>
            {VIRUSGUARD_THREATS.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td>{t.location}</td>
                <td className={styles.risk}>{t.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.offer}>
        <p className={styles.price}>{T.offer}</p>
        <p className={styles.offerNote}>{T.offerNote}</p>
        <button
          type="button"
          className={styles.buy}
          onClick={() => setMessage(T.bought)}
        >
          {T.buy}
        </button>{' '}
        <button
          type="button"
          className={styles.rescan}
          onClick={() => setMessage(T.rescanned)}
        >
          {T.rescan}
        </button>
        {message && (
          <p role="status" className={styles.message}>
            {message}
          </p>
        )}
        <p className={styles.seals}>
          {T.seals.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
      </section>

      <section className={styles.testimonials}>
        <h2>{T.testimonialsTitle}</h2>
        {VIRUSGUARD_TESTIMONIALS.map((t) => (
          <blockquote key={t.who}>
            &ldquo;{t.quote}&rdquo; <cite>- {t.who}</cite>
          </blockquote>
        ))}
      </section>

      <p className={styles.fineprint}>{T.fineprint}</p>
    </div>
  );
}
