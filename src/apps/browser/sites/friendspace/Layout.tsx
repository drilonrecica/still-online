// The Friendspace frame: logo bar, nav and footer around every page.
import { useId, type ReactNode } from 'react';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { getBulletins } from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { useWebStore } from '../../store';
import { hasUnreadBulletins } from './logic';
import { useSiteText } from '../useSiteText';
import { SiteLink } from '../../SiteLink';
import styles from './Friendspace.module.css';

/** Two overlapping chat bubbles; the front one is a planet with a ring. Original art. */
function Mark() {
  const glow = `fs-glow${useId().replace(/:/g, '')}`;
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 36 28"
      width={36}
      height={28}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={glow} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#fff6b0" />
          <stop offset="0.6" stopColor="#ffb400" />
          <stop offset="1" stopColor="#c96a00" />
        </radialGradient>
      </defs>
      <g stroke="#001a55" strokeWidth={1} strokeLinejoin="round">
        <path d="M6 15 L2 23 L11 18 Z" fill="#9fd0ff" />
        <circle cx={11} cy={10} r={8.5} fill="#9fd0ff" />
        <path d="M27 19 L32 26 L22 22 Z" fill={`url(#${glow})`} />
      </g>
      <g transform="rotate(-18 22 15)" fill="none" stroke="#9fd0ff">
        <path d="M9 15 A13 3 0 0 1 35 15" strokeWidth={1.6} />
      </g>
      <circle
        cx={22}
        cy={15}
        r={8}
        fill={`url(#${glow})`}
        stroke="#001a55"
        strokeWidth={1}
      />
      <g transform="rotate(-18 22 15)" fill="none" stroke="#9fd0ff">
        <path d="M9 15 A13 3 0 0 0 35 15" strokeWidth={1.6} />
      </g>
    </svg>
  );
}

export function Logo() {
  const { FRIENDSPACE_TEXT: T } = useSiteText(FRIENDSPACE_HOST);
  return (
    <span className={styles.logo}>
      <Mark />
      {T.logo}
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { FRIENDSPACE_TEXT: T } = useSiteText(FRIENDSPACE_HOST);
  const t = useT();
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const seen = useWebStore((s) => s.bulletinsSeen);
  const unread = hasUnreadBulletins(getBulletins(locale, gender), day, seen);
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <SiteLink href="/" className={styles.logoLink}>
          <Logo />
        </SiteLink>
        <span className={styles.tagline}>{T.tagline}</span>
      </header>
      <nav className={styles.nav} aria-label={t('sites.friendspace.nav.label')}>
        <SiteLink href="/">{t('sites.friendspace.nav.home')}</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="/me">{t('sites.friendspace.nav.myProfile')}</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="/bulletins">
          {unread ? (
            <>
              <span className={styles.srOnly}>
                {t('sites.friendspace.nav.bulletinsUnread')}
              </span>
              <span aria-hidden>
                {t('sites.friendspace.nav.bulletins')} (
                <span className={styles.unreadDot}>●</span>)
              </span>
            </>
          ) : (
            t('sites.friendspace.nav.bulletins')
          )}
        </SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="http://searchly.example/">
          {t('sites.friendspace.nav.search')}
        </SiteLink>
      </nav>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>{T.footer}</footer>
    </div>
  );
}
