// Shared frame for about.example pages: banner, sidebar of cool sites, footer.
import type { ReactNode } from 'react';
import { SiteLink } from '../../SiteLink';
import styles from './About.module.css';

const COOL_SITES = [
  ['Searchly', 'http://searchly.example/'],
  ['Tinfoil Comets', 'http://tinfoilcomets.example/'],
  ['Spaceport', 'http://spaceport.example/'],
  ['Westfield High', 'http://westfield-high.example/'],
  ['Celeb Gossip 07', 'http://celebgossip07.example/'],
] as const;

export function Layout({ children }: { children: ReactNode }) {
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
              <h1>Web Explorer</h1>
              <p>Your window on the World Wide Web</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className={styles.ticker}>
              <span>
                *** NEW! Add your favorite pages to the Favorites menu *** Tip:
                a 56K modem loads most pages in under a minute! ***
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.side}>
              <h2>Cool Sites</h2>
              <ul>
                {COOL_SITES.map(([label, url]) => (
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
              Best viewed at 800x600 · This page is stored on your computer
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
