// "◀ Prev | Tinfoil Comets Webring | Random | Next ▶": every other registered fictional site.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { SITES } from '..';
import { useBrowserNavigator } from '../../navigator';
import { SiteLink } from '../../SiteLink';
import { webring } from './logic';
import styles from './TinfoilComets.module.css';

export function Webring() {
  const nav = useBrowserNavigator();
  const ring = webring(
    SITES.map((s) => s.host),
    TINFOIL_HOST,
  );
  const home = (host: string) => `http://${host}/`;
  return (
    <div className={styles.webring} role="navigation" aria-label="Webring">
      <SiteLink href={home(ring.prev)}>&#9664; Prev</SiteLink>
      {' | '}
      <b>Tinfoil Comets Webring</b>
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
        Random
      </a>
      {' | '}
      <SiteLink href={home(ring.next)}>Next &#9654;</SiteLink>
    </div>
  );
}
