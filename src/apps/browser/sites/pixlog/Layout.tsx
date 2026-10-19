// The pixlog frame: orange header bar with the wordmark, nav and footer around every page. The
// `skin` recolours the header and tabs (`data-skin`, see Pixlog.module.css).
import type { ReactNode } from 'react';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import type { PixlogSkinId } from '@/content/pixlog/types';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './Pixlog.module.css';

/** The "o" of the wordmark: a camera shutter, six blades around an opening. Original art. */
function Shutter() {
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <svg
      className={styles.shutter}
      viewBox="0 0 32 32"
      width={26}
      height={26}
      aria-hidden
      focusable="false"
    >
      <circle
        cx={16}
        cy={16}
        r={14}
        fill="none"
        stroke="#fff"
        strokeWidth={3}
      />
      {blades.map((angle) => (
        <path
          key={angle}
          d="M16 16 L16 5 L24 9 Z"
          fill="#fff"
          opacity={0.9}
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
      <circle cx={16} cy={16} r={3} fill="var(--px-bar, #ff7f00)" />
    </svg>
  );
}

export function Layout({
  skin = 'orange',
  children,
}: {
  skin?: PixlogSkinId;
  children: ReactNode;
}) {
  const { PIXLOG_TEXT: T } = useSiteText(PIXLOG_HOST);
  return (
    <div className={styles.page} data-skin={skin}>
      <header className={styles.bar}>
        <SiteLink href="/" className={styles.wordmark} aria-label={T.logo}>
          <span aria-hidden>pixl</span>
          <Shutter />
          <span aria-hidden>g</span>
          <span className={styles.tagline}>{T.tagline}</span>
        </SiteLink>
        <nav className={styles.nav} aria-label={T.nav.label}>
          <SiteLink href="/">{T.nav.home}</SiteLink>
          <SiteLink href="/me">{T.nav.login}</SiteLink>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>{T.footer}</footer>
    </div>
  );
}
