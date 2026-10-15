// Chat window (app `messenger-chat`): one per contact via `props.contactId`.
import { useEffect, useRef, useState } from 'react';
import type { Contact } from '@/content/types';
import { useSettingsStore } from '@/os/store/settings';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import { getMessengerContents, getMessengerEngine } from '../runtime';
import { StatusIcon, STATUS_LABELS } from '../StatusIcon';
import { useMessengerStore } from '../store';
import { Avatar } from './Avatar';
import styles from './Chat.module.css';
import { nudgeLimiter, onShake, SHAKE_MS } from './nudge';
import { Reply } from './Reply';
import { RichText, Transcript } from './Transcript';

const NOTICE_MS = 4000;
/** Unprocessed CSS modules (tests) give no class name, and `classList.add('')` throws. */
const SHAKE_CLASS = styles.shaking || 'chat-shaking';

/** Shakes the surrounding window frame for SHAKE_MS on incoming nudges (unless reduced motion). */
function useShake(contactId: string) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: HTMLElement | null = null;
    const stop = () => {
      clearTimeout(timer);
      frame?.classList.remove(SHAKE_CLASS);
      frame?.removeAttribute('data-shaking');
    };
    const unsubscribe = onShake(contactId, () => {
      if (reduced) return;
      stop();
      frame = root.current?.closest<HTMLElement>('[data-window-id]') ?? null;
      frame ??= root.current;
      frame?.classList.add(SHAKE_CLASS);
      frame?.setAttribute('data-shaking', 'true');
      timer = setTimeout(stop, SHAKE_MS);
    });
    return () => {
      unsubscribe();
      stop();
    };
  }, [contactId, reduced]);

  return root;
}

function ChatView({
  windowId,
  contact,
}: {
  windowId: string;
  contact: Contact;
}) {
  const id = contact.id;
  const progress = useMessengerStore((s) => s.progress.contacts[id]);
  const signedIn = useMessengerStore((s) => s.signedIn);
  const online = useMessengerStore((s) => s.online[id] === true);
  const typing = useMessengerStore((s) => s.typing[id] === true);
  const markRead = useMessengerStore((s) => s.markRead);
  const playerName = useSettingsStore((s) => s.playerName);
  const focused = useWindowsStore((s) => selectActiveWindowId(s) === windowId);
  const [notice, setNotice] = useState<string | null>(null);
  const root = useShake(id);

  const status = online
    ? (progress?.status ?? contact.initialStatus)
    : 'offline';
  const personalMessage = progress?.personalMessage ?? contact.personalMessage;
  const unread = progress?.unread ?? 0;

  useEffect(() => {
    useWindowsStore
      .getState()
      .setWindowTitle(windowId, `${contact.displayName} - Conversation`);
  }, [windowId, contact.displayName]);

  useEffect(() => {
    if (focused && unread > 0) markRead(id);
  }, [focused, unread, id, markRead]);

  useEffect(() => {
    if (notice === null) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  function nudge() {
    if (!nudgeLimiter.tryNudge(id)) {
      setNotice('You may not send a nudge so often. Please wait a moment.');
      return;
    }
    getMessengerEngine().playerNudge(id);
  }

  const statusText = !signedIn
    ? 'You are signed out of Messenger. Sign in to keep chatting.'
    : (notice ?? (typing ? `${contact.displayName} is typing a message…` : ''));

  return (
    <div ref={root} className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.to}>
            To: <StatusIcon status={status} />{' '}
            <strong>
              <RichText text={contact.displayName} />
            </strong>{' '}
            <span className={styles.handle}>&lt;{contact.handle}&gt;</span>{' '}
            <span className={styles.statusLabel}>
              ({STATUS_LABELS[status]})
            </span>
          </div>
          {personalMessage && (
            <div className={styles.personal}>
              <RichText text={personalMessage} />
            </div>
          )}
        </div>
        <div className={styles.picture}>
          <Avatar
            avatar={contact.avatar}
            label={`${contact.displayName}'s picture`}
          />
        </div>
      </header>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Conversation tools"
      >
        <button
          type="button"
          className={styles.tool}
          disabled={!signedIn}
          onClick={nudge}
        >
          Nudge
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() =>
            useWindowsStore
              .getState()
              .openApp('messenger-history', { contactId: id })
          }
        >
          History
        </button>
      </div>
      <Transcript
        entries={progress?.transcript ?? []}
        contactName={contact.displayName}
        playerName={playerName}
      />
      <Reply contactId={id} disabled={!signedIn} />
      <div className={styles.statusBar} role="status">
        {statusText}
      </div>
    </div>
  );
}

export default function Chat({ windowId, props }: AppComponentProps) {
  const contactId = props.contactId;
  const content = getMessengerContents().find(
    (c) => c.contact.id === contactId,
  );
  if (!content)
    return (
      <div className={styles.missing}>
        This contact is no longer in your contact list.
      </div>
    );
  return <ChatView windowId={windowId} contact={content.contact} />;
}
