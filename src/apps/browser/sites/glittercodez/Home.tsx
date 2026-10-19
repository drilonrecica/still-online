// glittercodez.example `/`: the layout gallery, the player's side first ("hot 4 u!!").
import {
  GLITTERCODEZ_HOST,
  type LayoutDef,
} from '@/content/sites/glittercodez';
import { getLayouts } from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import { useLocale } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { CodeTile } from './CodeBox';
import styles from './GlitterCodez.module.css';
import { Layout } from './Layout';
import { layoutEntries, splitBySide } from './logic';

export default function Home() {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  const gender = useGender();
  const layouts = getLayouts(useLocale(), gender);
  const { hot, more } = splitBySide(layouts, gender);
  const sections: [string, LayoutDef[]][] = [
    [T.hotHeading, hot],
    [T.moreHeading, more],
  ];
  return (
    <Layout>
      <p className={styles.howTo}>{T.howTo}</p>
      {sections.map(
        ([heading, list]) =>
          list.length > 0 && (
            <section key={heading} aria-label={heading}>
              <h2 className={styles.heading}>{heading}</h2>
              <div className={styles.grid}>
                {layoutEntries(list).map((entry) => (
                  <CodeTile key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ),
      )}
    </Layout>
  );
}
