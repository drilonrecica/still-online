// The animated "UNDER CONSTRUCTION" sign: hazard stripes, blinking letters and a little digger.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useSiteText } from '../useSiteText';
import styles from './TinfoilComets.module.css';

function Digger() {
  return (
    <svg viewBox="0 0 84 50" width="84" height="50" aria-hidden>
      <rect x="0" y="47" width="84" height="3" fill="#8B5A2B" />
      <rect x="8" y="37" width="42" height="10" rx="5" fill="#333" />
      {[13, 23, 33, 43].map((cx) => (
        <circle key={cx} cx={cx} cy="42" r="3" fill="#777" />
      ))}
      <rect
        x="10"
        y="25"
        width="36"
        height="12"
        fill="#F5C400"
        stroke="#8a6d00"
      />
      <rect
        x="26"
        y="12"
        width="17"
        height="14"
        fill="#F5C400"
        stroke="#8a6d00"
      />
      <rect x="29" y="15" width="11" height="7" fill="#9FD3FF" />
      <circle
        cx="34"
        cy="10"
        r="2.4"
        fill="#FF7A00"
        className={styles.beacon}
      />
      <g className={styles.arm}>
        <path
          d="M44 28 L64 14 L74 30"
          stroke="#E0A800"
          strokeWidth="4"
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M70 29 L80 29 L77 38 L71 37 Z" fill="#777" />
      </g>
    </svg>
  );
}

export function UnderConstruction() {
  const { TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  return (
    <div className={styles.construction}>
      <Digger />
      <div className={styles.sign}>
        <span className={styles.signText}>{T.construction}</span>
        <small>{T.constructionNote}</small>
      </div>
      <Digger />
    </div>
  );
}
