// Stapley: an original cartoon stapler with big googly eyes, eyebrows and one little arm.
// The idle animations (blink, eyebrow raise, look around) are CSS keyframes in Assistant.module.css.
import styles from './Assistant.module.css';

export function StapleySprite({ talking }: { talking: boolean }) {
  return (
    <svg
      className={styles.sprite}
      width="72"
      height="64"
      viewBox="0 0 72 64"
      aria-hidden="true"
      data-talking={talking || undefined}
    >
      {/* base and body */}
      <rect x="6" y="50" width="56" height="8" rx="2" fill="#4a4f57" />
      <path
        d="M4 40 Q4 22 20 20 L54 18 Q66 18 66 30 L66 50 L4 50 Z"
        fill="#c8302b"
        stroke="#6d1512"
        strokeWidth="1.5"
      />
      <path
        d="M8 24 Q10 22 20 22"
        stroke="#f08a84"
        strokeWidth="2"
        fill="none"
      />
      {/* mouth plate */}
      <rect
        x="48"
        y="38"
        width="20"
        height="8"
        rx="1.5"
        fill="#9aa3ad"
        stroke="#4a4f57"
      />
      {/* eyes */}
      <circle
        cx="26"
        cy="32"
        r="9"
        fill="#fff"
        stroke="#222"
        strokeWidth="1.5"
      />
      <circle
        cx="43"
        cy="32"
        r="9"
        fill="#fff"
        stroke="#222"
        strokeWidth="1.5"
      />
      <g className={styles.pupils}>
        <circle cx="27" cy="33" r="3.6" fill="#111" />
        <circle cx="44" cy="33" r="3.6" fill="#111" />
      </g>
      <g className={styles.lids}>
        <rect x="16" y="22" width="20" height="20" fill="#c8302b" />
        <rect x="33" y="22" width="20" height="20" fill="#c8302b" />
      </g>
      {/* eyebrows */}
      <g
        className={styles.brows}
        stroke="#2b1a14"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M18 20 L32 17" />
        <path d="M37 17 L51 20" />
      </g>
      {/* arm */}
      <g className={styles.arm}>
        <path
          d="M66 36 Q74 34 71 26"
          stroke="#222"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="71" cy="25" r="2.4" fill="#f5e6c8" stroke="#222" />
      </g>
    </svg>
  );
}
