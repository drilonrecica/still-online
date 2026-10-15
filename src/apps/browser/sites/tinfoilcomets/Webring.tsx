// "◀ Prev | Tinfoil Comets Webring | Random | Next ▶": every other registered fictional site.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useT } from '@/i18n/useT';
import { SITES } from '..';
import { useBrowserNavigator } from '../../navigator';
import { SiteLink } from '../../SiteLink';
import { webring } from './logic';
import styles from './TinfoilComets.module.css';

export function Webring() {
  const nav = useBrowserNavigator();
  const t = useT();
  const ring = webring(
    SITES.map((s) => s.host),
    TINFOIL_HOST,
  );
  const home = (host: string) => `http://${host}/`;
  return (
    <div
      className={styles.webring}
      role="navigation"
      aria-label={t('sites.tinfoilcomets.webring.label')}
    >
      <SiteLink href={home(ring.prev)}>
        {t('sites.tinfoilcomets.webring.prev')}
      </SiteLink>
      {' | '}
      <b>{t('sites.tinfoilcomets.webring.name')}</b>
      {' | '}
      <a
        href="#random"
        onClick={(e) => {
          e.preventDefault();
          const pick =
            ring.others[Math.floor(Math.random() * ring.others.length)];
          if (pick) nav.navigate(home(pick));
        }}
      >
        {t('sites.tinfoilcomets.webring.random')}
      </a>
      {' | '}
      <SiteLink href={home(ring.next)}>
        {t('sites.tinfoilcomets.webring.next')}
      </SiteLink>
    </div>
  );
}
