// searchly.example `/search?q=&p=`: ranked results, pagination, typo suggestion.
import { useMemo } from 'react';
import type { SitePageProps } from '@/content/sites/types';
import { SITES } from '..';
import { SiteLink } from '../../SiteLink';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import styles from './Searchly.module.css';
import { PAGE_SIZE, buildIndex, didYouMean, search, searchUrl } from './search';

export default function Results({ query, navigate }: SitePageProps) {
  const q = (query.get('q') ?? '').trim();
  const requested = Number.parseInt(query.get('p') ?? '1', 10);
  const { results, suggestion } = useMemo(() => {
    const index = buildIndex(SITES);
    return { results: search(q, index), suggestion: didYouMean(q, index) };
  }, [q]);
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
          ? 'Type something to search.'
          : `Results ${results.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - ${(page - 1) * PAGE_SIZE + shown.length} of ${results.length} for `}
        {q !== '' && <b>{q}</b>}
      </div>
      {suggestion && (
        <p className={styles.suggest}>
          Did you mean:{' '}
          <SiteLink href={searchUrl(suggestion)}>
            <b>{suggestion}</b>
          </SiteLink>
        </p>
      )}
      {q !== '' && results.length === 0 && (
        <div className={styles.none}>
          <p>
            Oh no! Searchly couldn&apos;t find any pages matching <b>{q}</b>.
          </p>
          <ul>
            <li>Check your spelling (even spacebar mishaps count).</li>
            <li>Try different words, or fewer of them.</li>
            <li>
              Try more general words, like &quot;fan&quot; or &quot;tips&quot;.
            </li>
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
        <nav className={styles.pager} aria-label="Result pages">
          {page > 1 && (
            <SiteLink href={searchUrl(q, page - 1)}>&laquo; Previous</SiteLink>
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
                  aria-label={`Page ${i + 1}`}
                >
                  y
                </SiteLink>
              ),
            )}
          </span>{' '}
          {page < pageCount && (
            <SiteLink href={searchUrl(q, page + 1)}>Next &raquo;</SiteLink>
          )}
        </nav>
      )}
    </div>
  );
}
