// tinfoilcomets.example `/guestbook`: friends' entries by day plus the player's (persisted in `web`).
import { usePlayerName } from '@/i18n/settingsText';
import { useId, useState, type FormEvent } from 'react';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
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
  const { TINFOIL_GUESTBOOK } = useSiteText(TINFOIL_HOST);
  const day = useWorldStore((s) => s.day);
  const mine = useWebStore((s) => s.guestbook[TINFOIL_HOST] ?? NONE);
  const sign = useWebStore((s) => s.signGuestbook);
  const playerName = usePlayerName();
  const [form, setForm] = useState({
    name: playerName,
    message: '',
    homepage: '',
  });
  const [error, setError] = useState<string | null>(null);
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
      <h2 className={styles.heading}>~*~ SIGN MY GUESTBOOK!!! ~*~</h2>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor={`${id}-name`}>Name:</label>
        <input {...field('name')} maxLength={NAME_MAX} />
        <label htmlFor={`${id}-homepage`}>Homepage:</label>
        <input
          {...field('homepage')}
          maxLength={HOMEPAGE_MAX}
          placeholder="http://"
        />
        <label htmlFor={`${id}-message`}>Message:</label>
        <textarea {...field('message')} maxLength={MESSAGE_MAX} rows={4} />
        <span />
        <span>
          <button type="submit" className={styles.button}>
            Sign it!!!
          </button>{' '}
          {error && (
            <span role="alert" className={styles.error}>
              {error}
            </span>
          )}
          {thanks && (
            <span role="status" className={styles.thanks}>
              THANK U 4 SIGNING!!! &hearts;
            </span>
          )}
        </span>
      </form>

      <p className={styles.center}>
        <b>{entries.length}</b> ppl have signed!!!
      </p>
      <ol className={styles.entries} aria-label="Guestbook entries">
        {entries.map((e, i) => (
          <li key={i} className={e.mine ? styles.mine : undefined}>
            <div className={styles.entryHead}>
              <b>{e.name}</b> signed {signedLabel(e.day, day)}
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
