// Shared frame for about.example pages: banner, sidebar of cool sites, footer.
import type { ReactNode } from 'react';
import { ABOUT_HOST } from '@/content/sites/about';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './About.module.css';

export function Layout({ children }: { children: ReactNode }) {
  const { ABOUT_TEXT: T, COOL_SITES } = useSiteText(ABOUT_HOST);
  return (
    <div className={styles.page}>
      <table className={styles.frame}>
        <colgroup>
          <col className={styles.sideCol} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} className={styles.banner}>
              <h1>{T.banner}</h1>
              <p>{T.bannerTagline}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className={styles.ticker}>
              <span>{T.ticker}</span>
            </td>
          </tr>
          <tr>
            <td className={styles.side}>
              <h2>{T.coolSitesTitle}</h2>
              <ul>
                {COOL_SITES.map(({ label, url }) => (
                  <li key={url}>
                    <SiteLink href={url}>{label}</SiteLink>
                  </li>
                ))}
              </ul>
            </td>
            <td className={styles.main}>{children}</td>
          </tr>
          <tr>
            <td colSpan={2} className={styles.footer}>
              {T.footer}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
