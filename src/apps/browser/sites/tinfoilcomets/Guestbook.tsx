// tinfoilcomets.example `/guestbook`: friends' entries by day plus the player's (persisted in `web`).
import { usePlayerName } from '@/i18n/settingsText';
import { useId, useState, type FormEvent } from 'react';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useT } from '@/i18n/useT';
import { rich } from '../rich';
import { useSiteText } from '../useSiteText';
import type { PlayerGuestbookEntry } from '@/content/sites/types';
import { useWorldStore } from '@/os/world';
import { resolve } from '..';
import { SiteLink } from '../../SiteLink';
import { useWebStore } from '../../store';
import { Layout } from './Layout';
import {
  guestbookEntries,
  HOMEPAGE_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  signedLabel,
  validateEntry,
} from './logic';
import styles from './TinfoilComets.module.css';

const NONE: readonly PlayerGuestbookEntry[] = [];

/** A homepage links only when it's a page that exists; anything else stays plain text. */
function Homepage({ url }: { url: string }) {
  const href = /^https?:\/\//i.test(url) ? url : `http://${url}`;
  return resolve(href) ? <SiteLink href={href}>{url}</SiteLink> : <>{url}</>;
}

export default function Guestbook() {
  const { TINFOIL_GUESTBOOK, TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  const t = useT();
  const day = useWorldStore((s) => s.day);
  const mine = useWebStore((s) => s.guestbook[TINFOIL_HOST] ?? NONE);
  const sign = useWebStore((s) => s.signGuestbook);
  const playerName = usePlayerName();
  const [form, setForm] = useState({
    name: playerName,
    message: '',
    homepage: '',
  });
  const [error, setError] = useState<'noName' | 'noMessage' | null>(null);
  const [thanks, setThanks] = useState(false);
  const id = useId();
  const entries = guestbookEntries(TINFOIL_GUESTBOOK, mine, day);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateEntry(form, day);
    if (!result.ok) {
      setError(result.error);
      setThanks(false);
      return;
    }
    sign(TINFOIL_HOST, result.entry);
    setForm((f) => ({ ...f, message: '' }));
    setError(null);
    setThanks(true);
  };

  const field = (key: keyof typeof form) => ({
    id: `${id}-${key}`,
    value: form[key],
    onChange: (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.tinfoilcomets.guestbook')}</h2>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor={`${id}-name`}>{t('sites.tinfoilcomets.name')}</label>
        <input {...field('name')} maxLength={NAME_MAX} />
        <label htmlFor={`${id}-homepage`}>
          {t('sites.tinfoilcomets.homepage')}
        </label>
        <input
          {...field('homepage')}
          maxLength={HOMEPAGE_MAX}
          placeholder="http://"
        />
        <label htmlFor={`${id}-message`}>
          {t('sites.tinfoilcomets.message')}
        </label>
        <textarea {...field('message')} maxLength={MESSAGE_MAX} rows={4} />
        <span />
        <span>
          <button type="submit" className={styles.button}>
            {t('sites.tinfoilcomets.sign')}
          </button>{' '}
          {error && (
            <span role="alert" className={styles.error}>
              {error === 'noName' ? T.errorNoName : T.errorNoMessage}
            </span>
          )}
          {thanks && (
            <span role="status" className={styles.thanks}>
              {T.signThanks}
            </span>
          )}
        </span>
      </form>

      <p className={styles.center}>
        {rich(t('sites.tinfoilcomets.signedCount', { n: '{n}' }), {
          n: <b>{entries.length}</b>,
        })}
      </p>
      <ol
        className={styles.entries}
        aria-label={t('sites.tinfoilcomets.entries')}
      >
        {entries.map((e, i) => (
          <li key={i} className={e.mine ? styles.mine : undefined}>
            <div className={styles.entryHead}>
              {rich(
                t('sites.tinfoilcomets.signed', {
                  name: '{name}',
                  when: signedLabel(e.day, day),
                }),
                { name: <b>{e.name}</b> },
              )}
              {e.homepage && (
                <>
                  {' '}
                  &middot; <Homepage url={e.homepage} />
                </>
              )}
            </div>
            <p>{e.message}</p>
          </li>
        ))}
      </ol>
    </Layout>
  );
}
