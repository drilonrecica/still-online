// Eight original SVG hamsters bouncing out of sync (each has its own speed and delay).
// Reduced motion: the CSS turns the bounce off and they just stand there, proudly.
import type { CSSProperties } from 'react';
import styles from './TinfoilComets.module.css';

const FURS = [
  '#E8A35C',
  '#F2C38B',
  '#D9874A',
  '#C9A27E',
  '#F6E3C6',
  '#B98B5E',
  '#EDB979',
  '#DDB08A',
] as const;

function Hamster({ fur }: { fur: string }) {
  return (
    <svg viewBox="0 0 48 44" width="48" height="44" aria-hidden>
      <ellipse
        cx="8"
        cy="20"
        rx="3"
        ry="5"
        fill={fur}
        transform="rotate(-30 8 20)"
      />
      <ellipse
        cx="40"
        cy="20"
        rx="3"
        ry="5"
        fill={fur}
        transform="rotate(30 40 20)"
      />
      <circle cx="14" cy="11" r="5" fill={fur} />
      <circle cx="34" cy="11" r="5" fill={fur} />
      <circle cx="14" cy="11" r="2.5" fill="#FFB3C6" />
      <circle cx="34" cy="11" r="2.5" fill="#FFB3C6" />
      <ellipse cx="24" cy="25" rx="17" ry="14" fill={fur} />
      <ellipse cx="24" cy="30" rx="10" ry="8" fill="#FFF3E0" />
      <circle cx="18" cy="21" r="2.2" fill="#222" />
      <circle cx="30" cy="21" r="2.2" fill="#222" />
      <circle cx="18.8" cy="20.2" r="0.8" fill="#fff" />
      <circle cx="30.8" cy="20.2" r="0.8" fill="#fff" />
      <circle cx="14.5" cy="27" r="2.6" fill="#FF8FAB" opacity="0.55" />
      <circle cx="33.5" cy="27" r="2.6" fill="#FF8FAB" opacity="0.55" />
      <ellipse cx="24" cy="25.5" rx="1.7" ry="1.2" fill="#E5677F" />
      <path
        d="M21.5 27.5 q2.5 2.2 5 0"
        stroke="#7A4A2A"
        fill="none"
        strokeWidth="0.9"
      />
      <ellipse cx="17" cy="39" rx="3.2" ry="1.8" fill="#FFB3C6" />
      <ellipse cx="31" cy="39" rx="3.2" ry="1.8" fill="#FFB3C6" />
    </svg>
  );
}

export function Hamsters() {
  return (
    <div
      className={styles.hamsters}
      role="img"
      aria-label="Eight dancing hamsters"
    >
      {FURS.map((fur, i) => (
        <span
          key={i}
          className={styles.hamster}
          style={
            {
              '--dur': `${0.42 + ((i * 7) % 5) * 0.07}s`,
              '--delay': `${-((i * 3) % 8) * 0.09}s`,
            } as CSSProperties
          }
        >
          <Hamster fur={fur} />
        </span>
      ))}
    </div>
  );
}
