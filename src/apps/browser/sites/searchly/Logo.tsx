// The "Searchly" wordmark: one colour per letter, original playful CSS lettering.
import styles from './Searchly.module.css';

const COLOURS = [
  '#d8341f',
  '#f2a900',
  '#2b8a3e',
  '#1c5fd6',
  '#a8329c',
  '#e8590c',
  '#0b8f8f',
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span
      className={small ? styles.logoSmall : styles.logo}
      role="img"
      aria-label="Searchly"
    >
      {[...'Searchly'].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ color: COLOURS[i % COLOURS.length] }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
