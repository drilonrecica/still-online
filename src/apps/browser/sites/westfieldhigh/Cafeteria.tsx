// westfield-high.example `/cafeteria`: this week's lunch menu (the same every week).
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import styles from './Westfield.module.css';

export default function Cafeteria() {
  const { WESTFIELD_MENU, WESTFIELD_TEXT: T } = useSiteText(WESTFIELD_HOST);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.westfieldhigh.menuTitle')}</h2>
      <p>{T.menuIntro}</p>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th scope="col">{t('sites.westfieldhigh.menuDay')}</th>
            <th scope="col">{t('sites.westfieldhigh.menuMain')}</th>
            <th scope="col">{t('sites.westfieldhigh.menuSide')}</th>
            <th scope="col">{t('sites.westfieldhigh.menuNotes')}</th>
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
