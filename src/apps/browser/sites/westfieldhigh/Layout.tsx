// Shared frame for westfield-high.example: the crest header, the grey left nav table and the footer.
// No hit counter, no animation: the district bought this template in 2001 and never touched it.
import type { ReactNode } from 'react';
import { WESTFIELD_TEXT as T } from '@/content/sites/westfieldhigh';
import { formatLongDate, now } from '@/os/clock';
import { SiteLink } from '../../SiteLink';
import styles from './Westfield.module.css';

const NAV = [
  ['Home', '/'],
  ['News & Announcements', '/news'],
  ['Staff Directory', '/staff'],
  ['Cafeteria Menu', '/cafeteria'],
] as const;

function Crest() {
  return (
    <svg
      className={styles.crest}
      viewBox="0 0 40 48"
      width="40"
      height="48"
      role="img"
      aria-label="Westfield Wildcats crest"
    >
      <path
        d="M2 2h36v22c0 12-8 19-18 22C10 43 2 36 2 24z"
        fill="#7a1020"
        stroke="#d8b84a"
        strokeWidth="2"
      />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="bold"
        fill="#d8b84a"
      >
        W
      </text>
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <table className={styles.frame}>
        <tbody>
          <tr>
            <td colSpan={2} className={styles.header}>
              <Crest />
              <div>
                <h1 className={styles.name}>{T.name}</h1>
                <p className={styles.motto}>{T.motto}</p>
              </div>
              <p className={styles.today}>{formatLongDate(now())}</p>
            </td>
          </tr>
          <tr>
            <td className={styles.side}>
              <nav aria-label="Site">
                <ul>
                  {NAV.map(([label, href]) => (
                    <li key={href}>
                      <SiteLink href={href}>{label}</SiteLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className={styles.sideNote}>
                Quick Links
                <br />
                <span>Parent Portal (coming soon)</span>
                <br />
                <span>Athletics (coming soon)</span>
              </p>
            </td>
            <td className={styles.content}>
              <main>{children}</main>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className={styles.footer}>
              {T.address} · {T.phone}
              <br />
              {T.footer}
              <br />
              {T.credits}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
