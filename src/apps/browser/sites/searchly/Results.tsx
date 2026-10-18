// searchly.example `/search?q=&p=`: ranked results, pagination, typo suggestion.
import { useMemo } from 'react';
import { SEARCHLY_HOST } from '@/content/sites/searchly';
import type { SitePageProps } from '@/content/sites/types';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { SITES } from '..';
import { SiteLink } from '../../SiteLink';
import { rich } from '../rich';
import { useSiteText } from '../useSiteText';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import styles from './Searchly.module.css';
import { PAGE_SIZE, buildIndex, didYouMean, search, searchUrl } from './search';

export default function Results({ query, navigate }: SitePageProps) {
  const q = (query.get('q') ?? '').trim();
  const requested = Number.parseInt(query.get('p') ?? '1', 10);
  const locale = useLocale();
  const t = useT();
  const { SEARCHLY_TEXT: T } = useSiteText(SEARCHLY_HOST);
  const gender = useGender();
  const index = useMemo(
    () => buildIndex(SITES, locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `meta` reads the gender, so a switch rebuilds the index
    [locale, gender],
  );
  const { results, suggestion } = useMemo(
    () => ({ results: search(q, index), suggestion: didYouMean(q, index) }),
    [q, index],
  );
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(
    Math.max(Number.isFinite(requested) ? requested : 1, 1),
    pageCount,
  );
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SiteLink href="/">
          <Logo small />
        </SiteLink>
        <SearchBox initial={q} navigate={navigate} compact />
      </div>
      <div className={styles.summary}>
        {q === ''
          ? t('sites.searchly.typeSomething')
          : rich(
              t('sites.searchly.resultsFor', {
                from: results.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
                to: (page - 1) * PAGE_SIZE + shown.length,
                total: results.length,
                query: '{query}',
              }),
              { query: <b>{q}</b> },
            )}
      </div>
      {suggestion && (
        <p className={styles.suggest}>
          {t('sites.searchly.didYouMean')}{' '}
          <SiteLink href={searchUrl(suggestion)}>
            <b>{suggestion}</b>
          </SiteLink>
        </p>
      )}
      {q !== '' && results.length === 0 && (
        <div className={styles.none}>
          <p>{rich(T.noResults, { query: <b>{q}</b> })}</p>
          <ul>
            {T.noResultsTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      <ol className={styles.results} start={(page - 1) * PAGE_SIZE + 1}>
        {shown.map((r) => (
          <li key={r.url}>
            <SiteLink href={r.url} className={styles.resultTitle}>
              {r.title}
            </SiteLink>
            <div className={styles.snippet}>{r.snippet}</div>
            <div className={styles.url}>{r.url.replace(/^http:\/\//, '')}</div>
          </li>
        ))}
      </ol>
      {results.length > PAGE_SIZE && (
        <nav
          className={styles.pager}
          aria-label={t('sites.searchly.resultPages')}
        >
          {page > 1 && (
            <SiteLink href={searchUrl(q, page - 1)}>
              {t('sites.searchly.previous')}
            </SiteLink>
          )}{' '}
          <span className={styles.pagerLogo}>
            Searchl
            {Array.from({ length: pageCount }, (_, i) =>
              i + 1 === page ? (
                <b key={i} aria-current="page">
                  y
                </b>
              ) : (
                <SiteLink
                  key={i}
                  href={searchUrl(q, i + 1)}
                  aria-label={t('sites.searchly.page', { n: i + 1 })}
                >
                  y
                </SiteLink>
              ),
            )}
          </span>{' '}
          {page < pageCount && (
            <SiteLink href={searchUrl(q, page + 1)}>
              {t('sites.searchly.next')}
            </SiteLink>
          )}
        </nav>
      )}
    </div>
  );
}
