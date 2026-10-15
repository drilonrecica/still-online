// Odometer-style hit counter: black digit boxes; digits that changed roll in.
import { useState } from 'react';
import { counterDigits } from './logic';
import styles from './TinfoilComets.module.css';

export function HitCounter({ value }: { value: number }) {
  const text = counterDigits(value);
  // Remember the last shown value so only the digits that changed roll.
  const [shown, setShown] = useState({ text, before: text });
  if (shown.text !== text) setShown({ text, before: shown.text });
  const before = shown.before.padStart(text.length, ' ');
  return (
    <span className={styles.counter} role="img" aria-label={`${text} visits`}>
      {[...text].map((ch, i) =>
        ch === ',' ? (
          <span key={i} className={styles.counterComma}>
            ,
          </span>
        ) : (
          <span key={i} className={styles.digit}>
            <span
              key={`${i}:${ch}`}
              className={before[i] === ch ? undefined : styles.roll}
            >
              {ch}
            </span>
          </span>
        ),
      )}
    </span>
  );
}
