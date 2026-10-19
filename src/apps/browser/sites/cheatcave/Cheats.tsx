// cheatcave.example `/cheats?game=`: the game list, or one game's cheats plus its joke cheat.
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import type { SitePageProps } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './CheatCave.module.css';
import { Layout } from './Layout';
import { cheatsHref, findGame } from './logic';

export default function Cheats({ query }: SitePageProps) {
  const { CHEATCAVE_GAMES, CHEATCAVE_TEXT: T } = useSiteText(CHEATCAVE_HOST);
  const t = useT();
  const id = query.get('game');
  const game = findGame(CHEATCAVE_GAMES, id);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.cheatsHeading}</h2>
      {game ? (
        <article className={styles.card} aria-label={game.name}>
          <h3 className={styles.cardTitle}>{game.name}</h3>
          <p className={styles.meta}>{game.genre}</p>
          <p>{game.blurb}</p>
          <dl
            className={styles.cheats}
            aria-label={t('sites.cheatcave.cheats')}
          >
            {game.cheats.map((c) => (
              <div key={c.code}>
                <dt>{c.code}</dt>
                <dd>{c.effect}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.joke}>
            <b>{T.jokeLabel}</b> {game.joke.code}: {game.joke.effect}
          </p>
          <p>
            <SiteLink href="/cheats">{T.allGames}</SiteLink>
          </p>
        </article>
      ) : (
        <>
          <p className={id === null ? undefined : styles.empty}>
            {id === null ? T.cheatsIntro : T.noGame}
          </p>
          <ul className={styles.games} aria-label={t('sites.cheatcave.games')}>
            {CHEATCAVE_GAMES.map((g) => (
              <li key={g.id}>
                <SiteLink href={cheatsHref(g.id)}>{g.name}</SiteLink>{' '}
                <span className={styles.meta}>({g.genre})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  );
}
