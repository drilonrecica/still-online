// Mail: folders, message list and preview over the persisted `mail` store. Needs a connection to
// send and receive; reading what has already arrived works offline.
import { useEffect, useMemo, useState } from 'react';
import type { MailFolder, MailMessage } from '@/content/mail/types';
import { toGameDate } from '@/os/clock';
import { useDevice } from '@/os/device';
import { formatNumber, formatShortDate, formatTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { requireOnline, useNetworkStore } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Mail.module.css';
import { Body, Compose, quote, useAttachmentOpener, type Draft } from './parts';
import { mailPhoneView } from './phoneView';
import { renderMails } from './records';
import { playerAddress, useMailStore } from './store';

export const APP_NAME = 'Mail';

const FOLDER_ORDER: readonly MailFolder[] = ['inbox', 'sent', 'deleted'];

/** `10/14/2007 3:07 PM` in game time. */
export function formatReceived(ms: number): string {
  const d = toGameDate(new Date(ms));
  const locale = getLocale();
  return `${formatShortDate(d, locale)} ${formatTime(d, locale)}`;
}

export default function Mail({ windowId }: AppComponentProps) {
  const t = useT();
  const locale = useLocale();
  const phone = useDevice() === 'phone';
  const records = useMailStore((s) => s.messages);
  const playerName = usePlayerName();
  const gender = useGender();
  // Rendered in the current language and gender on every switch; only player-written mail is
  // stored as text.
  const messages = useMemo(
    () => renderMails(records, locale, playerAddress(playerName), gender),
    [records, locale, playerName, gender],
  );
  const online = useNetworkStore((s) => s.status === 'online');
  const [folder, setFolder] = useState<MailFolder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  // Phone: the selected message is open full screen (Back clears it).
  const [reading, setReading] = useState(false);
  const openAttachment = useAttachmentOpener();

  const inFolder = useMemo(
    () =>
      messages
        .filter((m) => m.folder === folder)
        .sort((a, b) => b.receivedAt - a.receivedAt),
    [messages, folder],
  );
  const selected = inFolder.find((m) => m.id === selectedId) ?? null;
  const unread = messages.filter((m) => m.folder === 'inbox' && !m.read).length;
  const view = mailPhoneView({
    composing: draft !== null,
    reading,
    hasSelection: selected !== null,
  });

  // The folder name is localized text inside a param, so a language switch sets it again.
  useEffect(() => {
    const windows = useWindowsStore.getState();
    const name = t(`mail.folders.${folder}`);
    if (unread > 0) {
      windows.setWindowTitle(windowId, 'mail.titleUnread', {
        folder: name,
        n: formatNumber(unread, locale),
      });
    } else {
      windows.setWindowTitle(windowId, 'mail.title', { folder: name });
    }
  }, [windowId, folder, unread, t, locale]);

  const select = (m: MailMessage) => {
    setSelectedId(m.id);
    setDraft(null);
    setReading(true);
    useMailStore.getState().markRead(m.id);
  };

  const showFolder = (f: MailFolder) => {
    setFolder(f);
    setSelectedId(null);
    setDraft(null);
    setReading(false);
  };

  const sendRecv = async () => {
    if (await requireOnline()) useMailStore.getState().deliver();
  };

  const send = async (d: Draft) => {
    if (!(await requireOnline())) return;
    useMailStore.getState().send(d);
    setDraft(null);
    setFolder('sent');
    setSelectedId(null);
    setReading(false);
  };

  const remove = () => {
    if (!selected) return;
    useMailStore.getState().remove(selected.id);
    setSelectedId(null);
    setReading(false);
  };

  const compose = (patch: Partial<Draft> = {}) =>
    setDraft({ to: '', subject: '', body: '', attachments: [], ...patch });

  const list = (
    <table className={styles.list} aria-label={t('mail.ui.messages')}>
      <thead>
        <tr>
          <th aria-label={t('mail.ui.attachment')} />
          <th>{folder === 'sent' ? t('mail.ui.to') : t('mail.ui.from')}</th>
          <th>{t('mail.ui.subject')}</th>
          <th>{t('mail.ui.received')}</th>
        </tr>
      </thead>
      <tbody>
        {inFolder.map((m) => (
          <tr
            key={m.id}
            data-unread={!m.read}
            aria-selected={m.id === selectedId}
            tabIndex={0}
            onClick={() => select(m)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') select(m);
            }}
          >
            <td>{m.attachments.length > 0 ? '📎' : ''}</td>
            <td>{folder === 'sent' ? (m.to[0]?.name ?? '') : m.from.name}</td>
            <td>
              <span className={styles.subject} title={m.subject}>
                {m.subject}
              </span>
            </td>
            <td>{formatReceived(m.receivedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const preview = (
    <div
      className={styles.preview}
      role="region"
      aria-label={t('mail.ui.preview')}
      tabIndex={0}
    >
      {selected ? (
        <>
          <dl className={styles.headers}>
            <dt>{t('mail.ui.headerFrom')}</dt>
            <dd>
              {selected.from.name} &lt;{selected.from.address}&gt;
            </dd>
            <dt>{t('mail.ui.headerTo')}</dt>
            <dd>{selected.to.map((a) => a.name).join(', ')}</dd>
            <dt>{t('mail.ui.headerSubject')}</dt>
            <dd>{selected.subject}</dd>
          </dl>
          {selected.attachments.length > 0 && (
            <div className={styles.attachments}>
              {selected.attachments.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => openAttachment(`${selected.id}:${a.name}`, a)}
                >
                  📎 {a.name}
                </button>
              ))}
            </div>
          )}
          <Body text={selected.body} />
        </>
      ) : (
        <p className={styles.empty}>
          {inFolder.length === 0
            ? t('mail.ui.emptyFolder')
            : t('mail.ui.selectMessage')}
        </p>
      )}
    </div>
  );

  const composer = draft && (
    <Compose
      initial={draft}
      onSend={(d) => void send(d)}
      onCancel={() => setDraft(null)}
    />
  );

  return (
    <div
      className={`${styles.root} touch-controls`}
      data-view={phone ? view : undefined}
    >
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label={t('mail.ui.toolbar')}
      >
        {phone && view === 'message' && (
          <button type="button" onClick={() => setReading(false)}>
            {t('mail.ui.back')}
          </button>
        )}
        <button type="button" onClick={() => compose()}>
          {t('mail.ui.create')}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() =>
            selected &&
            compose({
              to: selected.from.address,
              subject: /^(re|aw):/i.test(selected.subject)
                ? selected.subject
                : t('mail.ui.replySubject', { subject: selected.subject }),
              body: quote(t, selected),
            })
          }
        >
          {t('mail.ui.reply')}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() =>
            selected &&
            compose({
              subject: /^(fw|wg):/i.test(selected.subject)
                ? selected.subject
                : t('mail.ui.forwardSubject', { subject: selected.subject }),
              body: quote(t, selected),
              attachments: selected.attachments,
            })
          }
        >
          {t('mail.ui.forward')}
        </button>
        <button type="button" disabled={!selected} onClick={remove}>
          {t('mail.ui.delete')}
        </button>
        <button type="button" onClick={() => void sendRecv()}>
          {t('mail.ui.sendRecv')}
        </button>
      </div>
      {!online && (
        <div className={styles.offline} role="status">
          <span>{t('mail.ui.offline')}</span>
          <button type="button" onClick={() => void requireOnline()}>
            {t('mail.ui.connect')}
          </button>
        </div>
      )}
      {phone ? (
        // Phone: a folder drop-down over a full-width list, or one message, or Compose.
        <div className={styles.content}>
          {view === 'compose' && composer}
          {view === 'message' && preview}
          {view === 'list' && (
            <>
              <select
                className={styles.folderSelect}
                aria-label={t('mail.ui.folders')}
                value={folder}
                onChange={(e) => showFolder(e.target.value as MailFolder)}
              >
                {FOLDER_ORDER.map((f) => (
                  <option key={f} value={f}>
                    {t(`mail.folders.${f}`)}
                    {f === 'inbox' && unread > 0 ? ` (${unread})` : ''}
                  </option>
                ))}
              </select>
              {inFolder.length === 0 ? preview : list}
            </>
          )}
        </div>
      ) : (
        <div className={styles.main}>
          <ul className={styles.folders} aria-label={t('mail.ui.folders')}>
            {FOLDER_ORDER.map((f) => {
              const n = f === 'inbox' ? unread : 0;
              return (
                <li key={f}>
                  <button
                    type="button"
                    data-active={f === folder}
                    aria-current={f === folder}
                    onClick={() => showFolder(f)}
                  >
                    {t(`mail.folders.${f}`)}
                    {n > 0 ? ` (${n})` : ''}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={styles.content}>
            {composer ?? (
              <>
                {list}
                {preview}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
