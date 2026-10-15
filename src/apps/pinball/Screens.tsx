// Star Pinball's menu, help, high-score and game-over panels, laid over the table.
import { useState, type ReactNode } from 'react';
import { scoreName } from '@/i18n/scoreName';
import { useLocale, useT } from '@/i18n/useT';
import { MAX_SCORE_NAME, useGamesStore } from '@/os/store/games';
import { rankName } from './display';
import { formatScore } from './font';
import { BALLS, BALL_SAVE_SECONDS, POINTS, RANKS } from './sim';
import styles from './Pinball.module.css';

export interface GameResult {
  score: number;
  rank: number;
  /** Earned a top-10 place (asks for a name). */
  high: boolean;
}

/** Help text with `[Key]` markers rendered as key caps. */
function withKeys(text: string): ReactNode[] {
  return text
    .split(/\[([^\]]+)\]/)
    .map((part, i) => (i % 2 ? <kbd key={i}>{part}</kbd> : part));
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.overlay}>
      <section className={styles.panel} aria-label={label}>
        {children}
      </section>
    </div>
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
        <h1 className={styles.title}>
          {t('pinball.titleFirst')}
          <span>{t('pinball.titleSecond')}</span>
        </h1>
        <nav className={styles.menuButtons} aria-label={t('pinball.menuLabel')}>
          <button
            type="button"
            className={styles.big}
            autoFocus
            onClick={onPlay}
          >
            {t('pinball.play')}
          </button>
          <button type="button" className={styles.big} onClick={onScores}>
            {t('pinball.highScores')}
          </button>
          <button type="button" className={styles.big} onClick={onHelp}>
            {t('pinball.help')}
          </button>
        </nav>
      </div>
    </div>
  );
}

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const locale = useLocale();
  return (
    <Panel label={t('pinball.helpTitle')}>
      <h2>{t('pinball.helpTitle')}</h2>
      <ul className={styles.help}>
        <li>{withKeys(t('pinball.helpLaunch'))}</li>
        <li>{withKeys(t('pinball.helpFlippers'))}</li>
        <li>{withKeys(t('pinball.helpNudge'))}</li>
        <li>{t('pinball.helpLanes')}</li>
        <li>
          {t('pinball.helpRanks', {
            ranks: RANKS.map((_, i) => rankName(i, locale)).join(' → '),
          })}
        </li>
        <li>
          {t('pinball.helpRamp', {
            ramp: formatScore(POINTS.ramp, locale),
            bumper: formatScore(POINTS.bumper, locale),
          })}
        </li>
        <li>
          {withKeys(
            t('pinball.helpBalls', {
              balls: BALLS,
              seconds: BALL_SAVE_SECONDS,
            }),
          )}
        </li>
      </ul>
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onBack}>
          {t('pinball.back')}
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
  const t = useT();
  const locale = useLocale();
  const high = useGamesStore((s) => s.pinball.high);
  return (
    <Panel label={t('pinball.highScores')}>
      <h2>{t('pinball.highScores')}</h2>
      {high.length === 0 ? (
        <p>{t('pinball.noScores')}</p>
      ) : (
        <table className={styles.scores}>
          <thead>
            <tr>
              <th scope="col">{t('pinball.colRank')}</th>
              <th scope="col">{t('pinball.colName')}</th>
              <th scope="col">{t('pinball.colScore')}</th>
              <th scope="col">{t('pinball.colDate')}</th>
            </tr>
          </thead>
          <tbody>
            {high.map((h, i) => (
              <tr key={i}>
                <td>{i + 1}.</td>
                <td>{scoreName(h.name, t)}</td>
                <td>{formatScore(h.score, locale)}</td>
                <td>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onPlay}>
          {t('pinball.play')}
        </button>
        <button type="button" onClick={onBack}>
          {t('pinball.mainMenu')}
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
  result: GameResult;
  defaultName: string;
  onSaveName: (name: string) => void;
  onPlay: () => void;
  onScores: () => void;
  onMenu: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [name, setName] = useState(defaultName);
  return (
    <Panel label={t('pinball.gameOver')}>
      <h2>{t('pinball.gameOver')}</h2>
      <p className={styles.final}>
        {t('pinball.finalScore')}{' '}
        <strong>{formatScore(result.score, locale)}</strong>
      </p>
      <p className={styles.center}>
        {t('pinball.finalRank', { rank: rankName(result.rank, locale) })}
      </p>
      {result.high ? (
        <form
          className={styles.nameForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSaveName(name);
          }}
        >
          <label htmlFor="pinball-name">{t('pinball.newHigh')}</label>
          <input
            id="pinball-name"
            autoFocus
            maxLength={MAX_SCORE_NAME}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">{t('pinball.ok')}</button>
        </form>
      ) : (
        <div className={styles.buttons}>
          <button type="button" autoFocus onClick={onPlay}>
            {t('pinball.playAgain')}
          </button>
          <button type="button" onClick={onScores}>
            {t('pinball.highScores')}
          </button>
          <button type="button" onClick={onMenu}>
            {t('pinball.mainMenu')}
          </button>
        </div>
      )}
    </Panel>
  );
}
