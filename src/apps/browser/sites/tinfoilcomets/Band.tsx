// tinfoilcomets.example `/band`: the four members, the albums and the tour dates.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { Layout } from './Layout';
import styles from './TinfoilComets.module.css';

export default function Band() {
  const { TINFOIL_ALBUMS, TINFOIL_MEMBERS, TINFOIL_TOUR } =
    useSiteText(TINFOIL_HOST);
  const day = useWorldStore((s) => s.day);
  return (
    <Layout>
      <h2 className={styles.heading}>~*~ THE BAND ~*~</h2>
      <table className={styles.box}>
        <tbody>
          {TINFOIL_MEMBERS.map((m) => (
            <tr key={m.name}>
              <th scope="row">
                {m.name}
                <br />
                <small>({m.role})</small>
              </th>
              <td>
                <ul>
                  {m.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className={styles.heading}>~*~ ALBUMS ~*~</h2>
      {TINFOIL_ALBUMS.map((a) => (
        <table key={a.title} className={styles.box}>
          <tbody>
            <tr>
              <td>
                <b>
                  {a.title} ({a.year})
                </b>{' '}
                &mdash; {a.note}
                <ol>
                  {a.tracks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      <h2 className={styles.heading}>~*~ TOUR DATES ~*~</h2>
      <table className={styles.box}>
        <tbody>
          {TINFOIL_TOUR.map((t) => {
            const past = t.after && day >= t.after.day ? t.after : null;
            return (
              <tr key={t.venue}>
                <th scope="row" className={past ? undefined : styles.blink}>
                  {past?.date ?? t.date}
                </th>
                <td>
                  <b>{t.venue}</b> &mdash; {past?.note ?? t.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
