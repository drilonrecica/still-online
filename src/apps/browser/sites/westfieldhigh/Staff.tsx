// westfield-high.example `/staff`: the staff directory table.
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import styles from './Westfield.module.css';

export default function Staff() {
  const { WESTFIELD_STAFF, WESTFIELD_TEXT: T } = useSiteText(WESTFIELD_HOST);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.westfieldhigh.staffTitle')}</h2>
      <p>{T.staffIntro}</p>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th scope="col">{t('sites.westfieldhigh.staffName')}</th>
            <th scope="col">{t('sites.westfieldhigh.department')}</th>
            <th scope="col">{t('sites.westfieldhigh.room')}</th>
            <th scope="col">{t('sites.westfieldhigh.email')}</th>
          </tr>
        </thead>
        <tbody>
          {WESTFIELD_STAFF.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{s.role}</td>
              <td>{s.room}</td>
              <td>{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
