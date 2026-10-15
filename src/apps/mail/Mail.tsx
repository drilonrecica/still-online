// Mail: folders, message list and preview over the persisted `mail` store. Needs a connection to
// send and receive; reading what has already arrived works offline.
import { useEffect, useMemo, useState } from 'react';
import { contacts } from '@/content/contacts';
import type {
  MailAttachment,
  MailFolder,
  MailMessage,
} from '@/content/mail/types';
import { toGameDate } from '@/os/clock';
import { formatShortDate, formatTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { requireOnline, useNetworkStore } from '@/os/network';
import { splitLinks } from '@/os/linkify';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Mail.module.css';
import { useMailStore } from './store';

export const APP_NAME = 'Mail';

const FOLDER_LABELS: Record<MailFolder, string> = {
  inbox: 'Inbox',
  sent: 'Sent Items',
  deleted: 'Deleted Items',
};
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

const quote = (m: MailMessage) =>
  `\n\n----- Original Message -----\nFrom: ${m.from.name} <${m.from.address}>\nSubject: ${m.subject}\n\n${m.body}`;

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
  const [draft, setDraft] = useState(initial);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <form
      className={styles.compose}
      aria-label="Create Mail"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(draft);
      }}
    >
      <div className={styles.composeBar}>
        <button type="submit" disabled={draft.to.trim() === ''}>
          Send
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <label>
        <span>To:</span>
        <input
          aria-label="To"
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
        <span>Subject:</span>
        <input
          aria-label="Subject"
          value={draft.subject}
          onChange={(e) => set({ subject: e.target.value })}
        />
      </label>
      <textarea
        aria-label="Message body"
        value={draft.body}
        onChange={(e) => set({ body: e.target.value })}
      />
    </form>
  );
}

export default function Mail({ windowId }: AppComponentProps) {
  const messages = useMailStore((s) => s.messages);
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

  useEffect(() => {
    useWindowsStore
      .getState()
      .setWindowTitle(
        windowId,
        unread > 0
          ? `${FOLDER_LABELS[folder]} (${unread}) - ${APP_NAME}`
          : `${FOLDER_LABELS[folder]} - ${APP_NAME}`,
      );
  }, [windowId, folder, unread]);

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
      <div className={styles.toolbar} role="toolbar" aria-label="Mail">
        <button type="button" onClick={() => compose()}>
          Create Mail
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() =>
            selected &&
            compose({
              to: selected.from.address,
              subject: /^re:/i.test(selected.subject)
                ? selected.subject
                : `Re: ${selected.subject}`,
              body: quote(selected),
            })
          }
        >
          Reply
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() =>
            selected &&
            compose({
              subject: /^fw:/i.test(selected.subject)
                ? selected.subject
                : `Fw: ${selected.subject}`,
              body: quote(selected),
              attachments: selected.attachments,
            })
          }
        >
          Forward
        </button>
        <button type="button" disabled={!selected} onClick={remove}>
          Delete
        </button>
        <button type="button" onClick={() => void sendRecv()}>
          Send/Recv
        </button>
      </div>
      {!online && (
        <div className={styles.offline} role="status">
          <span>Working offline. Connect to send and receive.</span>
          <button type="button" onClick={() => void requireOnline()}>
            Connect
          </button>
        </div>
      )}
      <div className={styles.main}>
        <ul className={styles.folders} aria-label="Folders">
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
                  {FOLDER_LABELS[f]}
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
              <table className={styles.list} aria-label="Messages">
                <thead>
                  <tr>
                    <th aria-label="Attachment" />
                    <th>{folder === 'sent' ? 'To' : 'From'}</th>
                    <th>Subject</th>
                    <th>Received</th>
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
                aria-label="Preview"
                tabIndex={0}
              >
                {selected ? (
                  <>
                    <dl className={styles.headers}>
                      <dt>From:</dt>
                      <dd>
                        {selected.from.name} &lt;{selected.from.address}&gt;
                      </dd>
                      <dt>To:</dt>
                      <dd>{selected.to.map((a) => a.name).join(', ')}</dd>
                      <dt>Subject:</dt>
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
                      ? 'There are no messages in this folder.'
                      : 'Select a message to read it.'}
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
