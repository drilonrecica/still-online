import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContactStatus, PlayerStatus } from '@/content/types';
import { playSound } from '@/os/sound';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { buildContactList, type ListGroupId } from './contactList';
import styles from './Messenger.module.css';
import { RichText } from './chat/Transcript';
import { getMessengerContents, getMessengerEngine } from './runtime';
import { StatusIcon, STATUS_LABELS } from './StatusIcon';
import { useMessengerStore } from './store';
import messengerIcon from '@/assets/icons/messenger-32.svg';

/** How long the sign-in spinner shows before the contact list appears. */
export const SIGN_IN_MS = 2000;
const HANDLE_DOMAIN = '@livemail.example';

const PLAYER_STATUSES: readonly PlayerStatus[] = [
  'online',
  'away',
  'busy',
  'offline',
];

export function handleFor(playerName: string): string {
  const slug = playerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${slug || 'player'}${HANDLE_DOMAIN}`;
}

function SignInView() {
  const playerName = useSettingsStore((s) => s.playerName);
  const [handle, setHandle] = useState(() => handleFor(playerName));
  const [signingIn, setSigningIn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function signIn() {
    setSigningIn(true);
    timer.current = setTimeout(() => {
      playSound('logon');
      getMessengerEngine().signIn();
    }, scaleMs(SIGN_IN_MS));
  }

  return (
    <form
      className={styles.signIn}
      onSubmit={(e) => {
        e.preventDefault();
        if (!signingIn) signIn();
      }}
    >
      <img className={styles.logo} src={messengerIcon} alt="" />
      <h1 className={styles.signInTitle}>Sign in to Messenger</h1>
      <label className={styles.field}>
        E-mail address:
        <input
          type="text"
          value={handle}
          disabled={signingIn}
          onChange={(e) => setHandle(e.target.value)}
        />
      </label>
      {signingIn ? (
        <>
          <div
            className={styles.spinner}
            role="progressbar"
            aria-label="Signing in"
          />
          <span role="status">Signing in…</span>
        </>
      ) : (
        <button type="submit" className={styles.signInButton}>
          Sign in
        </button>
      )}
    </form>
  );
}

function PersonalMessage() {
  const saved = useMessengerStore((s) => s.progress.player.personalMessage);
  const setPersonalMessage = useMessengerStore(
    (s) => s.setPlayerPersonalMessage,
  );
  const [draft, setDraft] = useState(saved);

  // Follow changes made elsewhere (e.g. "now playing").
  useEffect(() => setDraft(saved), [saved]);

  return (
    <input
      className={styles.personal}
      aria-label="Personal message"
      placeholder="<Type a personal message>"
      maxLength={120}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => setPersonalMessage(draft.trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(saved);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function ContactListView() {
  const playerName = useSettingsStore((s) => s.playerName);
  const status = useMessengerStore((s) => s.progress.player.status);
  const setStatus = useMessengerStore((s) => s.setPlayerStatus);
  const showNowPlaying = useMessengerStore(
    (s) => s.progress.player.showNowPlaying,
  );
  const setShowNowPlaying = useMessengerStore((s) => s.setShowNowPlaying);
  const progress = useMessengerStore((s) => s.progress.contacts);
  const online = useMessengerStore((s) => s.online);
  const [collapsed, setCollapsed] = useState<ReadonlySet<ListGroupId>>(
    new Set(),
  );

  const groups = useMemo(
    () =>
      buildContactList(
        getMessengerContents().map((c) => c.contact),
        progress,
        online,
      ),
    [progress, online],
  );

  function toggle(id: ListGroupId) {
    const next = new Set(collapsed);
    if (!next.delete(id)) next.add(id);
    setCollapsed(next);
  }

  function openChat(contactId: string) {
    useWindowsStore.getState().openApp('messenger-chat', { contactId });
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.nameRow}>
          <StatusIcon status={status} />
          <span className={styles.playerName}>{playerName}</span>
          <select
            className={styles.statusSelect}
            aria-label="My status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PlayerStatus)}
          >
            {PLAYER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'offline' ? 'Appear Offline' : STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <PersonalMessage />
        <label className={styles.nowPlaying}>
          <input
            type="checkbox"
            checked={showNowPlaying}
            onChange={(e) => setShowNowPlaying(e.target.checked)}
          />
          Show what I&apos;m listening to
        </label>
      </div>
      <div className={styles.list} role="tree" aria-label="Contacts">
        {groups.map((group) => {
          const open = !collapsed.has(group.id);
          const label =
            group.id === 'Offline'
              ? `Offline (${group.total})`
              : `${group.id} (${group.online}/${group.total})`;
          return (
            <div key={group.id} role="group" aria-label={group.id}>
              <button
                type="button"
                className={styles.groupHeader}
                aria-expanded={open}
                onClick={() => toggle(group.id)}
              >
                <span aria-hidden="true">{open ? '▾' : '▸'}</span>
                {label}
              </button>
              {open &&
                group.entries.map(({ contact, status: s, personalMessage }) => (
                  <div
                    key={contact.id}
                    className={styles.contact}
                    role="treeitem"
                    aria-selected={false}
                    data-status={s}
                    data-contact-id={contact.id}
                    title={`${contact.displayName} <${contact.handle}>`}
                    onDoubleClick={() => openChat(contact.id)}
                  >
                    <StatusIcon status={s as ContactStatus} />
                    <span className={styles.contactName}>
                      <RichText text={contact.displayName} />
                    </span>
                    {personalMessage && (
                      <span className={styles.contactMessage}>
                        - <RichText text={personalMessage} />
                      </span>
                    )}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <span>{getMessengerContents().length} contacts</span>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => getMessengerEngine().signOut()}
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export default function Messenger() {
  const signedIn = useMessengerStore((s) => s.signedIn);
  return (
    <div className={styles.root}>
      {signedIn ? <ContactListView /> : <SignInView />}
    </div>
  );
}
