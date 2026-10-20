// tinfoilcomets.example `/band`: the four members, the albums and the tour dates.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { Layout } from './Layout';
import { tourRow } from './logic';
import styles from './TinfoilComets.module.css';

export default function Band() {
  const { TINFOIL_ALBUMS, TINFOIL_MEMBERS, TINFOIL_TOUR } =
    useSiteText(TINFOIL_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.tinfoilcomets.band')}</h2>
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

      <h2 className={styles.heading}>{t('sites.tinfoilcomets.albums')}</h2>
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
                  {a.tracks.map((track) => (
                    <li key={track}>{track}</li>
                  ))}
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      <h2 className={styles.heading}>{t('sites.tinfoilcomets.tour')}</h2>
      <table className={styles.box}>
        <tbody>
          {TINFOIL_TOUR.map((show) => {
            const row = tourRow(show, day);
            return (
              <tr key={show.venue}>
                <th scope="row" className={row.past ? undefined : styles.blink}>
                  {row.date}
                </th>
                <td>
                  <b>{show.venue}</b> &mdash; {row.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
