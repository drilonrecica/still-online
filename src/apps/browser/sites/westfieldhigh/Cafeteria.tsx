// westfield-high.example `/cafeteria`: this week's lunch menu (the same every week).
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import styles from './Westfield.module.css';

export default function Cafeteria() {
  const { WESTFIELD_MENU, WESTFIELD_TEXT: T } = useSiteText(WESTFIELD_HOST);
  return (
    <Layout>
      <h2 className={styles.heading}>Cafeteria Menu</h2>
      <p>{T.menuIntro}</p>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Main</th>
            <th scope="col">Side</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {WESTFIELD_MENU.map((m) => (
            <tr key={m.day}>
              <td>{m.day}</td>
              <td>{m.main}</td>
              <td>{m.side}</td>
              <td>{m.note ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
