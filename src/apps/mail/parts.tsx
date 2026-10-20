// Mail's building blocks: the compose form, a message body with links, and attachment opening.
import { useState } from 'react';
import { getContacts } from '@/content/locale';
import type { MailAttachment, MailMessage } from '@/content/mail/types';
import type { TFunction } from '@/i18n/types';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { splitLinks } from '@/os/linkify';
import { useWindowsStore } from '@/os/store/windows';
import styles from './Mail.module.css';

export interface Draft {
  to: string;
  subject: string;
  body: string;
  attachments: MailAttachment[];
}

export const quote = (t: TFunction, m: MailMessage) =>
  t('mail.ui.quote', {
    name: m.from.name,
    address: m.from.address,
    subject: m.subject,
    body: m.body,
  });

export function Body({ text }: { text: string }) {
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
export function useAttachmentOpener() {
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

export function Compose({
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
  const contacts = getContacts(useLocale(), useGender());
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
