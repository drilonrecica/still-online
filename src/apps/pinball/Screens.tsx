// Star Pinball's menu, help, high-score and game-over panels, laid over the table.
import { useState, type ReactNode } from 'react';
import { MAX_SCORE_NAME, useGamesStore } from '@/os/store/games';
import { formatScore } from './font';
import { BALLS, BALL_SAVE_SECONDS, POINTS, RANKS } from './sim';
import styles from './Pinball.module.css';

export interface GameResult {
  score: number;
  rank: number;
  /** Earned a top-10 place (asks for a name). */
  high: boolean;
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
  return (
    <div className={styles.overlay}>
      <div className={styles.menu}>
        <h1 className={styles.title}>
          Star <span>Pinball</span>
        </h1>
        <nav className={styles.menuButtons} aria-label="Star Pinball menu">
          <button
            type="button"
            className={styles.big}
            autoFocus
            onClick={onPlay}
          >
            Play
          </button>
          <button type="button" className={styles.big} onClick={onScores}>
            High Scores
          </button>
          <button type="button" className={styles.big} onClick={onHelp}>
            Help
          </button>
        </nav>
      </div>
    </div>
  );
}

export function HelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <Panel label="How to play">
      <h2>How to play</h2>
      <ul className={styles.help}>
        <li>
          Hold <kbd>Space</kbd> or <kbd>↓</kbd> to pull the plunger, let go to
          launch. Or press and hold on the launch lane.
        </li>
        <li>
          Flippers: <kbd>Z</kbd> or left <kbd>Shift</kbd>, and <kbd>/</kbd> or
          right <kbd>Shift</kbd>. Clicking the left or right half of the table
          works too.
        </li>
        <li>
          <kbd>T</kbd> nudges the table. Three warnings, then the next nudge
          tilts and the ball is lost.
        </li>
        <li>
          Light all three top lanes for a 2× multiplier. The flippers shift the
          lit lanes.
        </li>
        <li>Drop S-T-A-R to rank up: {RANKS.join(' → ')}.</li>
        <li>
          The Hyperspace ramp on the left scores {formatScore(POINTS.ramp)};
          planets score {POINTS.bumper}.
        </li>
        <li>
          {BALLS} balls. A ball lost in the first {BALL_SAVE_SECONDS} seconds
          comes back once. <kbd>Esc</kbd> quits to the menu.
        </li>
      </ul>
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onBack}>
          Back
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
  const high = useGamesStore((s) => s.pinball.high);
  return (
    <Panel label="High scores">
      <h2>High Scores</h2>
      {high.length === 0 ? (
        <p>No scores yet. The galaxy awaits!</p>
      ) : (
        <table className={styles.scores}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Score</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {high.map((h, i) => (
              <tr key={i}>
                <td>{i + 1}.</td>
                <td>{h.name}</td>
                <td>{formatScore(h.score)}</td>
                <td>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.buttons}>
        <button type="button" autoFocus onClick={onPlay}>
          Play
        </button>
        <button type="button" onClick={onBack}>
          Main Menu
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
  const [name, setName] = useState(defaultName);
  return (
    <Panel label="Game over">
      <h2>Game Over</h2>
      <p className={styles.final}>
        Score: <strong>{formatScore(result.score)}</strong>
      </p>
      <p className={styles.center}>Final rank: {RANKS[result.rank]}</p>
      {result.high ? (
        <form
          className={styles.nameForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSaveName(name);
          }}
        >
          <label htmlFor="pinball-name">
            A new high score! Enter your name:
          </label>
          <input
            id="pinball-name"
            autoFocus
            maxLength={MAX_SCORE_NAME}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">OK</button>
        </form>
      ) : (
        <div className={styles.buttons}>
          <button type="button" autoFocus onClick={onPlay}>
            Play Again
          </button>
          <button type="button" onClick={onScores}>
            High Scores
          </button>
          <button type="button" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      )}
    </Panel>
  );
}
