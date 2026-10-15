// Hen Hunt's menu, help, high-score and end-of-round screens, laid over the canvas.
import { useState, type ReactNode } from 'react';
import { scoreName } from '@/i18n/scoreName';
import { useT } from '@/i18n/useT';
import { MAX_SCORE_NAME, useGamesStore } from '@/os/store/games';
import {
  DEPTH,
  GOLDEN,
  HAT_PENALTY,
  ROUND_SECONDS,
  SHELLS,
  WINDOW_HEN,
} from './layout';
import type { RoundResult } from './HenHunt';
import styles from './HenHunt.module.css';

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.overlay}>
      <section className={styles.panel} aria-label={label}>
        {children}
      </section>
    </div>
  );
}

/** The chunky "HEN HUNT" title, each letter tipped a little. */
export function TitleArt() {
  const t = useT();
  const title = t('apps.henhunt.title');
  const letters = [...title.toLocaleUpperCase()];
  return (
    <h1 className={styles.title} aria-label={title}>
      {letters.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          style={{ transform: `rotate(${((i * 7) % 5) * 3 - 6}deg)` }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h1>
  );
}

export function MenuScreen({
  onPlay,
  onScores,
  onHelp,
}: {
  onPlay: () => void;
  onScores: () => void;
  onHelp: () => void;
}) {
  const t = useT();
  return (
    <div className={styles.overlay}>
      <div className={styles.menu}>
        <TitleArt />
        <p className={styles.tagline}>
          {t('henhunt.tagline', { seconds: ROUND_SECONDS, shells: SHELLS })}
        </p>
        <nav className={styles.menuButtons} aria-label={t('henhunt.menuLabel')}>
          <button
            type="button"
            className={styles.big}
            autoFocus
            onClick={onPlay}
          >
            {t('henhunt.play')}
          </button>
          <button type="button" className={styles.big} onClick={onScores}>
            {t('henhunt.highScores')}
          </button>
          <button type="button" className={styles.big} onClick={onHelp}>
            {t('henhunt.help')}
          </button>
        </nav>
      </div>
    </div>
  );
}

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  return (
    <Panel label={t('henhunt.helpTitle')}>
      <h2>{t('henhunt.helpTitle')}</h2>
      <ul className={styles.help}>
        <li>{t('henhunt.helpAim', { seconds: ROUND_SECONDS })}</li>
        <li>{t('henhunt.helpReload', { shells: SHELLS })}</li>
        <li>{t('henhunt.helpScroll')}</li>
        <li>
          {t('henhunt.helpHens', {
            far: DEPTH.far.points,
            mid: DEPTH.mid.points,
            near: DEPTH.near.points,
          })}
        </li>
        <li>
          {t('henhunt.helpBonus', {
            window: WINDOW_HEN.points,
            golden: GOLDEN.points,
          })}
        </li>
        <li>{t('henhunt.helpHat', { penalty: HAT_PENALTY })}</li>
      </ul>
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onBack}>
          {t('henhunt.back')}
        </button>
      </div>
    </Panel>
  );
}

export function ScoresScreen({
  onBack,
  onPlay,
}: {
  onBack: () => void;
  onPlay: () => void;
}) {
  const high = useGamesStore((s) => s.henhunt.high);
  const t = useT();
  return (
    <Panel label={t('henhunt.highScores')}>
      <h2>{t('henhunt.highScores')}</h2>
      {high.length === 0 ? (
        <p>{t('henhunt.noScores')}</p>
      ) : (
        <table className={styles.scores}>
          <thead>
            <tr>
              <th scope="col">{t('henhunt.colRank')}</th>
              <th scope="col">{t('henhunt.colName')}</th>
              <th scope="col">{t('henhunt.colScore')}</th>
              <th scope="col">{t('henhunt.colDate')}</th>
            </tr>
          </thead>
          <tbody>
            {high.map((h, i) => (
              <tr key={i}>
                <td>{i + 1}.</td>
                <td>{scoreName(h.name, t)}</td>
                <td>{h.score}</td>
                <td>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onPlay}>
          {t('henhunt.play')}
        </button>
        <button type="button" onClick={onBack}>
          {t('henhunt.mainMenu')}
        </button>
      </div>
    </Panel>
  );
}

export function OverScreen({
  result,
  defaultName,
  onSaveName,
  onPlay,
  onScores,
  onMenu,
}: {
  result: RoundResult;
  defaultName: string;
  onSaveName: (name: string) => void;
  onPlay: () => void;
  onScores: () => void;
  onMenu: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const t = useT();
  const accuracy = result.shots
    ? Math.round((result.hits / result.shots) * 100)
    : 0;
  return (
    <Panel label={t('henhunt.roundOver')}>
      <h2>{t('henhunt.timesUp')}</h2>
      <p className={styles.final}>
        <strong>{t('henhunt.finalScore', { score: result.score })}</strong>
      </p>
      <p>
        {t('henhunt.accuracy', {
          hits: result.hits,
          shots: result.shots,
          accuracy,
        })}
      </p>
      {result.high ? (
        <form
          className={styles.nameForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSaveName(name);
          }}
        >
          <label htmlFor="henhunt-name">{t('henhunt.newHigh')}</label>
          <input
            id="henhunt-name"
            autoFocus
            maxLength={MAX_SCORE_NAME}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">{t('common.ok')}</button>
        </form>
      ) : (
        <div className={styles.buttons}>
          <button type="button" autoFocus onClick={onPlay}>
            {t('henhunt.playAgain')}
          </button>
          <button type="button" onClick={onScores}>
            {t('henhunt.highScores')}
          </button>
          <button type="button" onClick={onMenu}>
            {t('henhunt.mainMenu')}
          </button>
        </div>
      )}
    </Panel>
  );
}
