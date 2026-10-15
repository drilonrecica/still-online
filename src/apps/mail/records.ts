// The `mail` store's language-neutral records (docs/i18n.md → "mail"): sanitize, v0.2 migration
// and render-time text. Only player-written (`text`) mail stores prose; everything else renders
// from content or the catalog in the current locale.
import { contacts } from '@/content/contacts';
import { MAIL_CONTENT } from '@/content/mail';
import { autoReplies } from '@/content/mail/autoReplies';
import type {
  AutoReply,
  MailAddress,
  MailAttachment,
  MailContent,
  MailFolder,
  MailMessage,
} from '@/content/mail/types';
import type { MailRecord } from '@/content/types';
import { translate } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import { isRecord } from '@/os/persist';

export const MAILER_DAEMON_ADDRESS = 'mailer-daemon@livemail.example';

/**
 * Stands for the player in a stored `text` mail's `from`/`to`: their name and address are
 * derived at render (`playerAddress()`), so a default name follows the language.
 */
export const PLAYER: MailAddress = { name: '', address: '' };

const isPlayer = (a: MailAddress) => a.address === '';

// TODO(P0-06): per-locale content via `getMailContent(locale)`; both locales use English for now.
const CONTENT: Readonly<Record<Locale, readonly MailContent[]>> = {
  en: MAIL_CONTENT,
  de: MAIL_CONTENT,
};
const REPLIES: Readonly<Record<Locale, readonly AutoReply[]>> = {
  en: autoReplies,
  de: autoReplies,
};
export const mailContentFor = (locale: Locale) => CONTENT[locale];
export const autoRepliesFor = (locale: Locale) => REPLIES[locale];

const CONTENT_IDS = new Set(MAIL_CONTENT.map((c) => c.id));

/** True when `id` is authored mail that renders by id. */
export const isContentId = (id: string): boolean => CONTENT_IDS.has(id);

export const friendById = (id: string) =>
  contacts.find((c) => c.contact.id === id)?.contact;

const FOLDERS: readonly MailFolder[] = ['inbox', 'sent', 'deleted'];
const str = (v: unknown): v is string => typeof v === 'string';

function sanitizeAddress(v: unknown): MailAddress | null {
  return isRecord(v) && str(v.name) && str(v.address)
    ? { name: v.name, address: v.address }
    : null;
}

function sanitizeAttachment(v: unknown): MailAttachment | null {
  if (!isRecord(v) || !str(v.name) || (v.type !== 'txt' && v.type !== 'image'))
    return null;
  const out: MailAttachment = { name: v.name, type: v.type };
  if (str(v.text)) out.text = v.text;
  const p = v.photo;
  if (isRecord(p) && str(p.scene) && typeof p.seed === 'number') {
    out.photo = {
      scene: p.scene as NonNullable<MailAttachment['photo']>['scene'],
      seed: p.seed,
      ...(str(p.caption) ? { caption: p.caption } : {}),
    };
  }
  return out;
}

type Base = Pick<MailRecord, 'id' | 'folder' | 'read' | 'receivedAt'>;

function sanitizeBase(v: Record<string, unknown>): Base | null {
  if (
    !str(v.id) ||
    v.id === '' ||
    !FOLDERS.includes(v.folder as MailFolder) ||
    typeof v.receivedAt !== 'number' ||
    !Number.isFinite(v.receivedAt)
  ) {
    return null;
  }
  return {
    id: v.id,
    folder: v.folder as MailFolder,
    read: v.read === true,
    receivedAt: v.receivedAt,
  };
}

const list = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** A full mail (a `text` record or a v0.2 message); null when unusable. */
function sanitizeText(
  v: Record<string, unknown>,
  base: Base,
): Extract<MailRecord, { kind: 'text' }> | null {
  const from = sanitizeAddress(v.from);
  if (!from || !str(v.subject) || !str(v.body)) return null;
  return {
    ...base,
    kind: 'text',
    from,
    to: list(v.to).flatMap((a) => sanitizeAddress(a) ?? []),
    subject: v.subject,
    body: v.body,
    attachments: list(v.attachments).flatMap(
      (a) => sanitizeAttachment(a) ?? [],
    ),
  };
}

// v0.2 stored rendered English; these are the exact strings it generated.
const V02_NO_SUBJECT = '(no subject)';
const V02_BOUNCE_SUBJECT = 'Undeliverable: ';
const V02_BOUNCE_TO = /^Your message to (.*) could not be delivered\./;
const V02_UNKNOWN_RECIPIENT = 'the recipient';
const V02_REPLY = 'RE: ';

const v02Subject = (s: string) => (s === V02_NO_SUBJECT ? '' : s);

/**
 * A v0.2 mail (fully rendered English) as a record: authored mail by id, bounces and friends'
 * auto-replies by their generated text, everything else verbatim. `playerAddress` is the
 * player's address at migration; it becomes the `PLAYER` marker.
 */
export function migrateV02(
  m: Extract<MailRecord, { kind: 'text' }>,
  playerAddress: string,
): MailRecord {
  const base: Base = {
    id: m.id,
    folder: m.folder,
    read: m.read,
    receivedAt: m.receivedAt,
  };
  if (isContentId(m.id)) return { ...base, kind: 'content' };
  if (
    m.from.address === MAILER_DAEMON_ADDRESS &&
    m.subject.startsWith(V02_BOUNCE_SUBJECT)
  ) {
    const to = V02_BOUNCE_TO.exec(m.body)?.[1] ?? '';
    return {
      ...base,
      kind: 'bounce',
      params: {
        to: to === V02_UNKNOWN_RECIPIENT ? '' : to,
        subject: v02Subject(m.subject.slice(V02_BOUNCE_SUBJECT.length)),
      },
    };
  }
  const handle = m.from.address.toLowerCase();
  const friend = contacts.find(
    (c) => c.contact.handle.toLowerCase() === handle,
  );
  const reply =
    friend && autoReplies.find((r) => r.contactId === friend.contact.id);
  if (
    friend &&
    reply &&
    m.folder !== 'sent' &&
    (m.body === reply.body || m.body === reply.again)
  ) {
    const again = m.body !== reply.body;
    return {
      ...base,
      kind: 'autoReply',
      contactId: friend.contact.id,
      again,
      params: {
        subject:
          again && m.subject.startsWith(V02_REPLY)
            ? v02Subject(m.subject.slice(V02_REPLY.length))
            : '',
      },
    };
  }
  const player = playerAddress.toLowerCase();
  const mark = (a: MailAddress) =>
    a.address.toLowerCase() === player ? PLAYER : a;
  return {
    ...m,
    from: mark(m.from),
    to: m.to.map(mark),
    subject: v02Subject(m.subject),
  };
}

/** One untrusted record: the neutral shape, or a v0.2 message (no `kind`), migrated. */
export function sanitizeRecord(
  v: unknown,
  playerAddress: string,
): MailRecord | null {
  if (!isRecord(v)) return null;
  const base = sanitizeBase(v);
  if (!base) return null;
  const params = isRecord(v.params) ? v.params : {};
  switch (v.kind) {
    case 'content':
      return isContentId(base.id) ? { ...base, kind: 'content' } : null;
    case 'bounce':
      return str(params.to) && str(params.subject)
        ? {
            ...base,
            kind: 'bounce',
            params: { to: params.to, subject: params.subject },
          }
        : null;
    case 'autoReply':
      return str(v.contactId) &&
        friendById(v.contactId) &&
        typeof v.again === 'boolean' &&
        str(params.subject)
        ? {
            ...base,
            kind: 'autoReply',
            contactId: v.contactId,
            again: v.again,
            params: { subject: params.subject },
          }
        : null;
    case 'text':
      return sanitizeText(v, base);
    case undefined: {
      const legacy = sanitizeText(v, base);
      return legacy && migrateV02(legacy, playerAddress);
    }
    default:
      return null;
  }
}

/**
 * The mail as the player reads it, in `locale`. Null for authored mail whose content is gone.
 * `player` is the player's current address (`playerAddress()`).
 */
export function renderMail(
  r: MailRecord,
  locale: Locale,
  player: MailAddress,
): MailMessage | null {
  const base = {
    id: r.id,
    folder: r.folder,
    read: r.read,
    receivedAt: r.receivedAt,
  };
  const subjectOr = (s: string) => s || translate(locale, 'mail.noSubject');
  switch (r.kind) {
    case 'content': {
      const c = mailContentFor(locale).find((m) => m.id === r.id);
      if (!c) return null;
      return {
        ...base,
        from: c.from,
        to: [player],
        subject: c.subject,
        body: c.body,
        attachments: [...(c.attachments ?? [])],
      };
    }
    case 'bounce':
      return {
        ...base,
        from: {
          name: translate(locale, 'mail.bounce.senderName'),
          address: MAILER_DAEMON_ADDRESS,
        },
        to: [player],
        subject: translate(locale, 'mail.bounce.subject', {
          subject: subjectOr(r.params.subject),
        }),
        body: translate(locale, 'mail.bounce.body', {
          to: r.params.to || translate(locale, 'mail.bounce.unknownRecipient'),
        }),
        attachments: [],
      };
    case 'autoReply': {
      const friend = friendById(r.contactId);
      const reply = autoRepliesFor(locale).find(
        (x) => x.contactId === r.contactId,
      );
      if (!friend || !reply) return null;
      return {
        ...base,
        from: { name: friend.displayName, address: friend.handle },
        to: [player],
        subject: r.again
          ? translate(locale, 'mail.reply.subject', {
              subject: subjectOr(r.params.subject),
            })
          : reply.subject,
        body: r.again ? reply.again : reply.body,
        attachments: [],
      };
    }
    case 'text': {
      const who = (a: MailAddress) => (isPlayer(a) ? player : a);
      return {
        ...base,
        from: who(r.from),
        to: r.to.map(who),
        subject: subjectOr(r.subject),
        body: r.body,
        attachments: r.attachments,
      };
    }
  }
}

/** Renders a mailbox, dropping records whose content is gone. */
export function renderMails(
  records: readonly MailRecord[],
  locale: Locale,
  player: MailAddress,
): MailMessage[] {
  return records.flatMap((r) => renderMail(r, locale, player) ?? []);
}
