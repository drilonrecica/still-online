import { formatNumber } from '@/i18n/format';
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContactStatus, PlayerStatus } from '@/content/types';
import { requireOnline } from '@/os/network';
import { playSound } from '@/os/sound';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useActivate } from '@/os/touch/useActivate';
import { AwayPrompt, OptionsDialog } from './AwayDialogs';
import { buildContactList, type ListGroupId } from './contactList';
import styles from './Messenger.module.css';
import { PlayerPicture } from './chat/PlayerPicture';
import { RichText } from './chat/Transcript';
import { PicturePicker } from './PicturePicker';
import {
  getMessengerContents,
  getMessengerEngine,
  useLocalizedContents,
} from './runtime';
import { StatusIcon } from './StatusIcon';
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
  const t = useT();
  const playerName = usePlayerName();
  const [handle, setHandle] = useState(() => handleFor(playerName));
  const [signingIn, setSigningIn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  async function signIn() {
    setSigningIn(true);
    // Offline: the dial-up dialog opens (and dials automatically by default).
    const online = await requireOnline();
    if (!mounted.current) return;
    if (!online) {
      setSigningIn(false);
      return;
    }
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
        if (!signingIn) void signIn();
      }}
    >
      <img className={styles.logo} src={messengerIcon} alt="" />
      <h1 className={styles.signInTitle}>{t('messenger.signIn.title')}</h1>
      <label className={styles.field}>
        {t('messenger.signIn.email')}
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
            aria-label={t('messenger.signIn.signingInLabel')}
          />
          <span role="status">{t('messenger.signIn.signingIn')}</span>
        </>
      ) : (
        <button type="submit" className={styles.signInButton}>
          {t('messenger.signIn.submit')}
        </button>
      )}
    </form>
  );
}

function PersonalMessage() {
  const t = useT();
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
      aria-label={t('messenger.list.personalMessage')}
      placeholder={t('messenger.list.personalPlaceholder')}
      maxLength={120}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        // Only a real edit counts: it replaces (and ends) any now-playing line.
        if (draft.trim() !== saved) setPersonalMessage(draft.trim());
      }}
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

/** Orange speech bubble: this contact is waiting for your reply. Original artwork. */
function AwaitingReplyIcon() {
  const t = useT();
  return (
    <svg
      className={styles.awaitingReply}
      width={14}
      height={14}
      viewBox="0 0 14 14"
      role="img"
      aria-label={t('messenger.list.waitingForReply')}
    >
      <path
        d="M2 1.5h10a1.5 1.5 0 0 1 1.5 1.5v5.5A1.5 1.5 0 0 1 12 10H6l-3 3v-3H2A1.5 1.5 0 0 1 .5 8.5V3A1.5 1.5 0 0 1 2 1.5z"
        fill="#f5a623"
        stroke="#b86e00"
      />
      <circle cx="4.5" cy="5.75" r="1" fill="#fff" />
      <circle cx="7" cy="5.75" r="1" fill="#fff" />
      <circle cx="9.5" cy="5.75" r="1" fill="#fff" />
    </svg>
  );
}

function ContactListView() {
  const playerName = usePlayerName();
  const t = useT();
  const locale = useLocale();
  const status = useMessengerStore((s) => s.progress.player.status);
  const awayMessage = useMessengerStore((s) => s.progress.player.awayMessage);
  const shownAwayMessage = awayMessage ?? t('defaults.awayMessage');
  const setStatus = useMessengerStore((s) => s.setPlayerStatus);
  const goAway = useMessengerStore((s) => s.goAway);
  const [dialog, setDialog] = useState<'away' | 'options' | 'picture' | null>(
    null,
  );
  const [fileMenu, setFileMenu] = useState(false);
  const showNowPlaying = useMessengerStore(
    (s) => s.progress.player.showNowPlaying,
  );
  const setShowNowPlaying = useMessengerStore((s) => s.setShowNowPlaying);
  const progress = useMessengerStore((s) => s.progress.contacts);
  const online = useMessengerStore((s) => s.online);
  const [collapsed, setCollapsed] = useState<ReadonlySet<ListGroupId>>(
    new Set(),
  );

  const localized = useLocalizedContents();
  const gender = useGender();
  const groups = useMemo(
    () =>
      buildContactList(localized, progress, online, locale, playerName, gender),
    [localized, progress, online, locale, playerName, gender],
  );
  const waiting = groups
    .flatMap((g) => g.entries)
    .filter((e) => e.awaitingReply).length;

  function toggle(id: ListGroupId) {
    const next = new Set(collapsed);
    if (!next.delete(id)) next.add(id);
    setCollapsed(next);
  }

  function openChat(contactId: string) {
    useWindowsStore.getState().openApp('messenger-chat', { contactId });
  }
  // Double-click or a tap opens a chat; the row's own keys add Space to Enter.
  const activateContact = useActivate((id: string) => openChat(id));

  return (
    <>
      <div className={styles.menuBar} role="menubar">
        <button
          type="button"
          role="menuitem"
          className={styles.menuButton}
          aria-haspopup="menu"
          aria-expanded={fileMenu}
          onClick={() => setFileMenu(!fileMenu)}
        >
          {t('messenger.list.fileMenu')}
        </button>
        {fileMenu && (
          <ul className={styles.menu} role="menu">
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setFileMenu(false);
                  setDialog('options');
                }}
              >
                {t('messenger.list.options')}
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setFileMenu(false);
                  useWindowsStore.getState().openApp('messenger-history');
                }}
              >
                {t('messenger.list.viewHistory')}
              </button>
            </li>
          </ul>
        )}
      </div>
      <div className={`${styles.header} ${styles.headerRow}`}>
        <button
          type="button"
          className={styles.pictureButton}
          aria-label={t('messenger.list.changePicture')}
          title={t('messenger.list.changePicture')}
          onClick={() => setDialog('picture')}
        >
          <PlayerPicture size={48} />
        </button>
        <div className={styles.headerBody}>
          <div className={styles.nameRow}>
            <StatusIcon status={status} />
            <span className={styles.playerName}>{playerName}</span>
            {status === 'away' && (
              <span className={styles.awayNote}>
                (
                {shownAwayMessage
                  ? t('messenger.list.awayWithMessage', {
                      message: shownAwayMessage,
                    })
                  : t('messenger.list.away')}
                )
              </span>
            )}
            <select
              className={styles.statusSelect}
              aria-label={t('messenger.list.myStatus')}
              value={status}
              onChange={(e) => {
                const next = e.target.value as PlayerStatus;
                if (next === 'away') setDialog('away');
                else setStatus(next);
              }}
            >
              {PLAYER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'offline'
                    ? t('messenger.status.appearOffline')
                    : t(`messenger.status.${s}`)}
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
            {t('messenger.list.showNowPlaying')}
          </label>
        </div>
      </div>
      <div
        className={styles.list}
        role="group"
        aria-label={t('messenger.list.contacts')}
      >
        {groups.map((group) => {
          const open = !collapsed.has(group.id);
          const name = t(`messenger.groups.${group.id}`);
          const label =
            group.id === 'offline'
              ? t('messenger.groups.offlineCount', {
                  total: formatNumber(group.total, locale),
                })
              : t('messenger.groups.count', {
                  group: name,
                  online: formatNumber(group.online, locale),
                  total: formatNumber(group.total, locale),
                });
          return (
            <div key={group.id} role="group" aria-label={name}>
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
                group.entries.map(
                  ({ contact, status: s, personalMessage, awaitingReply }) => (
                    <div
                      key={contact.id}
                      className={styles.contact}
                      role="button"
                      tabIndex={0}
                      data-status={s}
                      data-contact-id={contact.id}
                      data-awaiting-reply={awaitingReply}
                      title={t(
                        awaitingReply
                          ? 'messenger.list.contactTitleWaiting'
                          : 'messenger.list.contactTitle',
                        { name: contact.displayName, handle: contact.handle },
                      )}
                      {...activateContact(contact.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openChat(contact.id);
                        }
                      }}
                    >
                      <StatusIcon status={s as ContactStatus} />
                      <span className={styles.contactName}>
                        <RichText text={contact.displayName} />
                      </span>
                      {awaitingReply && <AwaitingReplyIcon />}
                      {personalMessage && (
                        <span className={styles.contactMessage}>
                          - <RichText text={personalMessage} />
                        </span>
                      )}
                    </div>
                  ),
                )}
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <span>
          {t('messenger.list.contactCount', {
            n: getMessengerContents().length,
          })}
          {waiting > 0 &&
            ` · ${t('messenger.list.waitingCount', { n: formatNumber(waiting, locale) })}`}
        </span>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => getMessengerEngine().signOut()}
        >
          {t('messenger.list.signOut')}
        </button>
      </div>
      {dialog === 'away' && (
        <AwayPrompt
          onCancel={() => setDialog(null)}
          onConfirm={(message) => {
            // The untouched localized default stays a default, so it follows the language.
            const useDefault =
              useSettingsStore.getState().awayMessage === null &&
              message === t('defaults.awayMessage');
            goAway(useDefault ? null : message, false);
            setDialog(null);
          }}
        />
      )}
      {dialog === 'picture' && (
        <PicturePicker onClose={() => setDialog(null)} />
      )}
      {dialog === 'options' && (
        <OptionsDialog onClose={() => setDialog(null)} />
      )}
    </>
  );
}

export default function Messenger() {
  const signedIn = useMessengerStore((s) => s.signedIn);
  return (
    <div className={`${styles.root} touch-controls`}>
      {signedIn ? <ContactListView /> : <SignInView />}
    </div>
  );
}
