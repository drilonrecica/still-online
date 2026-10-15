// Message History (app `messenger-history`): per-contact transcript browser with dates, search and Clear History.
import { usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { Fragment, useMemo, useState } from 'react';
import type { AppComponentProps } from '@/os/types';
import { renderTranscript } from '../engine';
import { getLocalizedContents, getMessengerContent } from '../runtime';
import { useMessengerStore } from '../store';
import { Avatar } from '../chat/Avatar';
import { RichText } from '../chat/Transcript';
import { WINKS } from '../winks/catalog';
import { groupByDay } from './groups';
import styles from './History.module.css';

/** `text` with case-insensitive occurrences of `query` wrapped in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q === '') return <RichText text={text} />;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  for (
    let at = lower.indexOf(needle);
    at !== -1;
    at = lower.indexOf(needle, from)
  ) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at}>{text.slice(at, at + needle.length)}</mark>);
    from = at + needle.length;
  }
  parts.push(text.slice(from));
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}

export default function History({ props }: AppComponentProps) {
  const t = useT();
  const playerName = usePlayerName();
  const locale = useLocale();
  const progress = useMessengerStore((s) => s.progress.contacts);
  const clearTranscript = useMessengerStore((s) => s.clearTranscript);
  const [picked, setPicked] = useState<string | null>(
    typeof props.contactId === 'string' ? props.contactId : null,
  );
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(false);

  const withHistory = getLocalizedContents(locale)
    .map((c) => ({
      contact: c.contact,
      count: progress[c.contact.id]?.transcript.length ?? 0,
    }))
    .filter((c) => c.count > 0);
  const selected =
    withHistory.find((c) => c.contact.id === picked) ?? withHistory[0] ?? null;
  const selectedId = selected?.contact.id;
  const groups = useMemo(
    () =>
      groupByDay(
        selectedId
          ? renderTranscript(
              progress[selectedId]?.transcript ?? [],
              getMessengerContent(selectedId, locale),
              locale,
              playerName,
            )
          : [],
        query,
      ),
    [progress, selectedId, query, locale, playerName],
  );

  function select(id: string) {
    setPicked(id);
    setConfirming(false);
  }

  return (
    <div className={styles.root}>
      <div
        className={styles.list}
        role="listbox"
        aria-label={t('messenger.list.contacts')}
      >
        {withHistory.length === 0 && (
          <div className={styles.empty}>{t('messenger.history.noHistory')}</div>
        )}
        {withHistory.map(({ contact, count }) => (
          <button
            key={contact.id}
            type="button"
            role="option"
            aria-selected={contact.id === selected?.contact.id}
            className={styles.contact}
            onClick={() => select(contact.id)}
          >
            <Avatar avatar={contact.avatar} label="" size={24} />
            <span className={styles.name}>
              <RichText text={contact.displayName} />
            </span>
            <span className={styles.count}>({count})</span>
          </button>
        ))}
      </div>
      <div className={styles.view}>
        {selected ? (
          <>
            <div className={styles.bar}>
              <input
                type="search"
                aria-label={t('messenger.history.searchLabel')}
                placeholder={t('messenger.history.search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {confirming ? (
                <span className={styles.confirm} role="alertdialog">
                  {t('messenger.history.confirmClear')}
                  <button
                    type="button"
                    onClick={() => {
                      clearTranscript(selected.contact.id);
                      setConfirming(false);
                    }}
                  >
                    {t('common.yes')}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)}>
                    {t('common.no')}
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirming(true)}>
                  {t('messenger.history.clear')}
                </button>
              )}
            </div>
            <div
              className={styles.log}
              role="log"
              aria-label={t('messenger.history.log')}
            >
              {groups.length === 0 && (
                <div className={styles.empty}>
                  {t('messenger.history.noMessages')}
                </div>
              )}
              {groups.map((g) => (
                <section key={g.label}>
                  <h3 className={styles.date}>{g.label}</h3>
                  {g.entries.map((e, i) =>
                    e.kind === 'nudge' ? (
                      <p key={i} className={styles.nudge}>
                        {e.from === 'contact'
                          ? t('messenger.transcript.nudgeFromContact', {
                              name: selected.contact.displayName,
                            })
                          : t('messenger.transcript.nudgeFromYou')}
                      </p>
                    ) : e.kind === 'wink' ? (
                      <p key={i} className={styles.nudge}>
                        {e.from === 'contact'
                          ? t('messenger.transcript.winkFromContact', {
                              name: selected.contact.displayName,
                              wink: t(WINKS[e.wink].nameKey),
                            })
                          : t('messenger.transcript.winkFromYou', {
                              wink: t(WINKS[e.wink].nameKey),
                            })}
                      </p>
                    ) : (
                      <div key={i} className={styles.message}>
                        <div className={styles.says}>
                          {t('messenger.transcript.says', {
                            name:
                              e.from === 'contact'
                                ? selected.contact.displayName
                                : playerName,
                          })}
                        </div>
                        <div className={styles.line}>
                          <Highlight text={e.text} query={query} />
                        </div>
                      </div>
                    ),
                  )}
                </section>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>{t('messenger.history.empty')}</div>
        )}
      </div>
    </div>
  );
}
