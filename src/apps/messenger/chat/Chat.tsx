// Chat window (app `messenger-chat`): one per contact via `props.contactId`.
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Contact } from '@/content/types';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import { renderPersonalMessage, renderTranscript } from '../engine';
import {
  getMessengerContent,
  getMessengerEngine,
  useLocalizedContents,
} from '../runtime';
import { StatusIcon } from '../StatusIcon';
import { useMessengerStore } from '../store';
import { Avatar } from './Avatar';
import { PlayerPicture } from './PlayerPicture';
import styles from './Chat.module.css';
import { nudgeLimiter, onShake, SHAKE_MS } from './nudge';
import { Reply } from './Reply';
import { RichText, Transcript } from './Transcript';
import { WinkMenu } from '../winks/WinkMenu';
import { WinkOverlay } from '../winks/WinkOverlay';

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
  const t = useT();
  const id = contact.id;
  const progress = useMessengerStore((s) => s.progress.contacts[id]);
  const signedIn = useMessengerStore((s) => s.signedIn);
  const online = useMessengerStore((s) => s.online[id] === true);
  const typing = useMessengerStore((s) => s.typing[id] === true);
  const markRead = useMessengerStore((s) => s.markRead);
  const playerName = usePlayerName();
  const locale = useLocale();
  const gender = useGender();
  const text = getMessengerContent(id, locale, gender);
  const focused = useWindowsStore((s) => selectActiveWindowId(s) === windowId);
  const [notice, setNotice] = useState<string | null>(null);
  const root = useShake(id);

  const status = online
    ? (progress?.status ?? contact.initialStatus)
    : 'offline';
  const personalMessage = renderPersonalMessage(
    progress?.personalMessage ?? 'initial',
    text,
    locale,
    playerName,
    gender,
  );
  const stored = progress?.transcript;
  const entries = useMemo(
    () => renderTranscript(stored ?? [], text, locale, playerName, gender),
    [stored, text, locale, playerName, gender],
  );
  const unread = progress?.unread ?? 0;

  useEffect(() => {
    useWindowsStore.getState().setWindowTitle(windowId, 'messenger.chatTitle', {
      name: contact.displayName,
    });
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
      setNotice(t('messenger.chat.nudgeTooOften'));
      return;
    }
    getMessengerEngine().playerNudge(id);
  }

  const statusText = !signedIn
    ? t('messenger.chat.signedOut')
    : (notice ??
      (typing
        ? t('messenger.chat.typing', { name: contact.displayName })
        : ''));

  return (
    <div
      ref={root}
      className={`${styles.root} touch-controls`}
      data-chat-contact={id}
    >
      <header className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.to}>
            {t('messenger.chat.to')} <StatusIcon status={status} />{' '}
            <strong>
              <RichText text={contact.displayName} />
            </strong>{' '}
            <span className={styles.handle}>&lt;{contact.handle}&gt;</span>{' '}
            <span className={styles.statusLabel}>
              ({t(`messenger.status.${status}`)})
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
            label={t('messenger.chat.pictureOf', { name: contact.displayName })}
          />
        </div>
      </header>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label={t('messenger.chat.tools')}
      >
        <button
          type="button"
          className={styles.tool}
          disabled={!signedIn}
          onClick={nudge}
        >
          {t('messenger.chat.nudge')}
        </button>
        <WinkMenu
          disabled={!signedIn}
          buttonClassName={styles.tool}
          onSend={(wink) => getMessengerEngine().playerWink(id, wink)}
        />
        <button
          type="button"
          className={styles.tool}
          onClick={() =>
            useWindowsStore
              .getState()
              .openApp('messenger-history', { contactId: id })
          }
        >
          {t('messenger.chat.history')}
        </button>
      </div>
      <div className={styles.stage}>
        <Transcript
          entries={entries}
          contactName={contact.displayName}
          playerName={playerName}
        />
        <WinkOverlay contactId={id} />
      </div>
      <div className={styles.bottom}>
        <div className={styles.replyArea}>
          <Reply contactId={id} disabled={!signedIn} />
        </div>
        <div className={styles.myPicture}>
          <PlayerPicture size={64} />
        </div>
      </div>
      <div className={styles.statusBar} role="status">
        {statusText}
      </div>
    </div>
  );
}

export default function Chat({ windowId, props }: AppComponentProps) {
  const t = useT();
  const contactId = props.contactId;
  const content = useLocalizedContents().find(
    (c) => c.contact.id === contactId,
  );
  if (!content)
    return (
      <div className={styles.missing}>{t('messenger.chat.missingContact')}</div>
    );
  return <ChatView windowId={windowId} contact={content.contact} />;
}
