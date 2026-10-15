// A text alternative for canvas games: samples a status line (e.g. "Score 120, 6 shells") from
// mutable game state once a second, so a screen reader can read it via `aria-describedby`.
import { useEffect, useState, type CSSProperties } from 'react';

const SAMPLE_MS = 1000;

/** Visually hidden but still read aloud. */
export const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** Returns `describe()` re-sampled every second while `active`; '' when inactive. */
export function useGameStatus(describe: () => string, active: boolean) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active) {
      setText('');
      return;
    }
    const sample = () => setText(describe());
    sample();
    const id = window.setInterval(sample, SAMPLE_MS);
    return () => window.clearInterval(id);
    // `describe` closes over refs only; sampling on `active` changes is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return text;
}
