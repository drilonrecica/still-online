// Mail: folders, message list and preview over the persisted `mail` store. Needs a connection to
// send and receive; reading what has already arrived works offline.
import { useEffect, useMemo, useState } from 'react';
import { getContacts } from '@/content/locale';
import type {
  MailAttachment,
  MailFolder,
  MailMessage,
} from '@/content/mail/types';
import { toGameDate } from '@/os/clock';
import { formatNumber, formatShortDate, formatTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
import type { TFunction } from '@/i18n/types';
import { usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { requireOnline, useNetworkStore } from '@/os/network';
import { splitLinks } from '@/os/linkify';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Mail.module.css';
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

interface Draft {
  to: string;
  subject: string;
  body: string;
  attachments: MailAttachment[];
}

const quote = (t: TFunction, m: MailMessage) =>
  t('mail.ui.quote', {
    name: m.from.name,
    address: m.from.address,
    subject: m.subject,
    body: m.body,
  });

function Body({ text }: { text: string }) {
  return (
    <p className={styles.body}>
      {splitLinks(text).map((seg, i) =>
        seg.kind === 'text' ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <a
            key={i}
            href={seg.url}
            onClick={(e) => {
              e.preventDefault();
              events.emit('browser:open', { url: seg.url });
            }}
          >
            {seg.text}
          </a>
        ),
      )}
    </p>
  );
}

/** Saves an attachment to My Documents / My Pictures (once per chip) and opens it. */
function useAttachmentOpener() {
  const [saved, setSaved] = useState<Record<string, string>>({});
  return (key: string, att: MailAttachment) => {
    const fs = useFsStore.getState();
    let id = saved[key];
    if (!id || !fs.get(id)) {
      id =
        att.type === 'txt'
          ? fs.createFile(FS_FOLDERS.docs, {
              name: att.name,
              type: 'txt',
              text: att.text ?? '',
            })
          : fs.createFile(FS_FOLDERS.pics, {
              name: att.name,
              type: 'image',
              ...(att.photo ? { photo: att.photo } : {}),
            });
      setSaved((s) => ({ ...s, [key]: id as string }));
    }
    const windows = useWindowsStore.getState();
    if (att.type === 'txt') windows.openApp('notepad', { fileId: id });
    else windows.openApp('explorer', { folder: FS_FOLDERS.pics });
  };
}

function Compose({
  initial,
  onSend,
  onCancel,
}: {
  initial: Draft;
  onSend: (d: Draft) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState(initial);
  const contacts = getContacts(useLocale());
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <form
      className={styles.compose}
      aria-label={t('mail.ui.compose')}
      onSubmit={(e) => {
        e.preventDefault();
        onSend(draft);
      }}
    >
      <div className={styles.composeBar}>
        <button type="submit" disabled={draft.to.trim() === ''}>
          {t('mail.ui.send')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('mail.ui.cancel')}
        </button>
      </div>
      <label>
        <span>{t('mail.ui.headerTo')}</span>
        <input
          aria-label={t('mail.ui.to')}
          list="mail-friends"
          value={draft.to}
          onChange={(e) => set({ to: e.target.value })}
        />
        <datalist id="mail-friends">
          {contacts.map((c) => (
            <option key={c.contact.id} value={c.contact.handle}>
              {c.contact.displayName}
            </option>
          ))}
        </datalist>
      </label>
      <label>
        <span>{t('mail.ui.headerSubject')}</span>
        <input
          aria-label={t('mail.ui.subject')}
          value={draft.subject}
          onChange={(e) => set({ subject: e.target.value })}
        />
      </label>
      <textarea
        aria-label={t('mail.ui.body')}
        value={draft.body}
        onChange={(e) => set({ body: e.target.value })}
      />
    </form>
  );
}

export default function Mail({ windowId }: AppComponentProps) {
  const t = useT();
  const locale = useLocale();
  const records = useMailStore((s) => s.messages);
  const playerName = usePlayerName();
  // Rendered in the current language on every switch; only player-written mail is stored as text.
  const messages = useMemo(
    () => renderMails(records, locale, playerAddress(playerName)),
    [records, locale, playerName],
  );
  const online = useNetworkStore((s) => s.status === 'online');
  const [folder, setFolder] = useState<MailFolder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
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
    useMailStore.getState().markRead(m.id);
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
  };

  const remove = () => {
    if (!selected) return;
    useMailStore.getState().remove(selected.id);
    setSelectedId(null);
  };

  const compose = (patch: Partial<Draft> = {}) =>
    setDraft({ to: '', subject: '', body: '', attachments: [], ...patch });

  return (
    <div className={styles.root}>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label={t('mail.ui.toolbar')}
      >
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
                  onClick={() => {
                    setFolder(f);
                    setSelectedId(null);
                    setDraft(null);
                  }}
                >
                  {t(`mail.folders.${f}`)}
                  {n > 0 ? ` (${n})` : ''}
                </button>
              </li>
            );
          })}
        </ul>
        <div className={styles.content}>
          {draft ? (
            <Compose
              initial={draft}
              onSend={(d) => void send(d)}
              onCancel={() => setDraft(null)}
            />
          ) : (
            <>
              <table className={styles.list} aria-label={t('mail.ui.messages')}>
                <thead>
                  <tr>
                    <th aria-label={t('mail.ui.attachment')} />
                    <th>
                      {folder === 'sent' ? t('mail.ui.to') : t('mail.ui.from')}
                    </th>
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
                      <td>
                        {folder === 'sent'
                          ? (m.to[0]?.name ?? '')
                          : m.from.name}
                      </td>
                      <td>{m.subject}</td>
                      <td>{formatReceived(m.receivedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                            onClick={() =>
                              openAttachment(`${selected.id}:${a.name}`, a)
                            }
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
