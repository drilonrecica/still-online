// Hen Hunt's menu, help, high-score and end-of-round screens, laid over the canvas.
import { useState, type ReactNode } from 'react';
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
  const letters = [...'HEN HUNT'];
  return (
    <h1 className={styles.title} aria-label="Hen Hunt">
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
  return (
    <div className={styles.overlay}>
      <div className={styles.menu}>
        <TitleArt />
        <p className={styles.tagline}>
          {ROUND_SECONDS} seconds. 8 shells. A sky full of hens.
        </p>
        <nav className={styles.menuButtons} aria-label="Hen Hunt menu">
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
          You have {ROUND_SECONDS} seconds. Click to shoot; aim with the mouse
          (or the arrow keys and Enter).
        </li>
        <li>
          The gun holds {SHELLS} shells. Right-click or press Space to reload
          &mdash; it takes a second.
        </li>
        <li>Move to the left or right edge to look around the countryside.</li>
        <li>
          Far hens are worth {DEPTH.far.points}, middle ones {DEPTH.mid.points},
          close ones {DEPTH.near.points}.
        </li>
        <li>
          Keep an eye on the windmill window ({WINDOW_HEN.points}) and the
          golden hen ({GOLDEN.points}, once a round, and quick!).
        </li>
        <li>
          Leave the scarecrow alone: his hat costs you {HAT_PENALTY} points.
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
  const high = useGamesStore((s) => s.henhunt.high);
  return (
    <Panel label="High scores">
      <h2>High Scores</h2>
      {high.length === 0 ? (
        <p>No scores yet. Go get those hens!</p>
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
                <td>{h.score}</td>
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
  result: RoundResult;
  defaultName: string;
  onSaveName: (name: string) => void;
  onPlay: () => void;
  onScores: () => void;
  onMenu: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const accuracy = result.shots
    ? Math.round((result.hits / result.shots) * 100)
    : 0;
  return (
    <Panel label="Round over">
      <h2>Time&rsquo;s up!</h2>
      <p className={styles.final}>
        Score: <strong>{result.score}</strong>
      </p>
      <p>
        {result.hits} hits from {result.shots} shots ({accuracy}% accuracy)
      </p>
      {result.high ? (
        <form
          className={styles.nameForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSaveName(name);
          }}
        >
          <label htmlFor="henhunt-name">
            A new high score! Enter your name:
          </label>
          <input
            id="henhunt-name"
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
