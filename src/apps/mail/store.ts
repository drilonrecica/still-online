// Mail's persisted `mail` store: the player's mailbox plus delivery of authored mail per day,
// composing, and friends' canned replies. See docs/architecture-v0.2.md → "Stores".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { autoReplies } from '@/content/mail/autoReplies';
import { MAIL_CONTENT } from '@/content/mail';
import type {
  MailAddress,
  MailAttachment,
  MailContent,
  MailFolder,
  MailMessage,
  MailState,
} from '@/content/mail/types';
import { contacts } from '@/content/contacts';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import { mulberry32, randInt, seedFrom } from '@/os/random';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
import { currentDay } from '@/os/world';

export const MAIL_DEFAULTS: MailState = { messages: [], deliveredDays: [] };

export const REPLY_DELAY_MS = 20_000;

export const MAILER_DAEMON: MailAddress = {
  name: 'Mail Delivery Subsystem',
  address: 'mailer-daemon@livemail.example',
};

const FOLDERS: readonly MailFolder[] = ['inbox', 'sent', 'deleted'];

export interface ComposeInput {
  to: string;
  subject: string;
  body: string;
  attachments?: readonly MailAttachment[];
}

export interface MailStore extends MailState {
  /** Delivers content mail with `day <= day` that wasn't delivered yet. Returns how many. */
  deliver: (
    day?: number,
    content?: readonly MailContent[],
    now?: number,
  ) => number;
  /** Files the mail in Sent, then bounces or schedules the friend's reply. */
  send: (input: ComposeInput) => void;
  markRead: (id: string, read?: boolean) => void;
  /** Inbox/Sent → Deleted Items; Deleted Items → gone for good. */
  remove: (id: string) => void;
}

/** The player's own address. */
export function playerAddress(): MailAddress {
  const name = useSettingsStore.getState().playerName;
  const user = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '') || 'player';
  return { name, address: `${user}@livemail.example` };
}

/** A friend's name for `address` (their Messenger handle), or the address itself. */
export function friendFor(address: string) {
  const needle = address.trim().toLowerCase();
  return contacts.find((c) => c.contact.handle.toLowerCase() === needle);
}

function newId(): string {
  return `m:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

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

function sanitizeMessage(v: unknown): MailMessage | null {
  if (!isRecord(v) || !str(v.id) || v.id === '') return null;
  const from = sanitizeAddress(v.from);
  if (
    !from ||
    !FOLDERS.includes(v.folder as MailFolder) ||
    !str(v.subject) ||
    !str(v.body) ||
    typeof v.receivedAt !== 'number' ||
    !Number.isFinite(v.receivedAt)
  ) {
    return null;
  }
  const list = (x: unknown) => (Array.isArray(x) ? x : []);
  return {
    id: v.id,
    folder: v.folder as MailFolder,
    from,
    to: list(v.to).flatMap((a) => sanitizeAddress(a) ?? []),
    subject: v.subject,
    body: v.body,
    attachments: list(v.attachments).flatMap(
      (a) => sanitizeAttachment(a) ?? [],
    ),
    receivedAt: v.receivedAt,
    read: v.read === true,
  };
}

export function sanitizeMail(
  persisted: unknown,
  current: MailState,
): MailState {
  if (!isRecord(persisted)) return current;
  const seen = new Set<string>();
  const messages = Array.isArray(persisted.messages)
    ? persisted.messages.flatMap((m) => {
        const msg = sanitizeMessage(m);
        if (!msg || seen.has(msg.id)) return [];
        seen.add(msg.id);
        return [msg];
      })
    : current.messages;
  const days = Array.isArray(persisted.deliveredDays)
    ? [
        ...new Set(
          persisted.deliveredDays.filter(
            (d): d is number =>
              typeof d === 'number' && Number.isInteger(d) && d >= 1,
          ),
        ),
      ].sort((a, b) => a - b)
    : current.deliveredDays;
  return { messages, deliveredDays: days };
}

// Replies are timers, not component state, so a friend answers with the window closed.
const pendingReplies = new Set<ReturnType<typeof setTimeout>>();

/** Cancels scheduled friend replies. For tests and log off. */
export function cancelPendingReplies(): void {
  pendingReplies.forEach(clearTimeout);
  pendingReplies.clear();
}

export const useMailStore = create<MailStore>()(
  persist(
    (set, get) => {
      const add = (message: MailMessage) =>
        set((s) => ({ messages: [...s.messages, message] }));

      return {
        ...MAIL_DEFAULTS,

        deliver: (
          day = currentDay(),
          content = MAIL_CONTENT,
          now = Date.now(),
        ) => {
          const { deliveredDays, messages } = get();
          const have = new Set(messages.map((m) => m.id));
          const due = content.filter(
            (c) =>
              c.day <= day && !deliveredDays.includes(c.day) && !have.has(c.id),
          );
          if (!due.length) return 0;
          const fresh = due.map((c): MailMessage => {
            // A stable "arrived a while ago" offset, 2–90 minutes, so the list looks natural.
            const minutes = randInt(mulberry32(seedFrom(c.id)), 2, 90);
            return {
              id: c.id,
              folder: 'inbox',
              from: c.from,
              to: [playerAddress()],
              subject: c.subject,
              body: c.body,
              attachments: [...(c.attachments ?? [])],
              receivedAt: now - minutes * 60_000,
              read: false,
            };
          });
          const days = new Set(deliveredDays);
          due.forEach((c) => days.add(c.day));
          set({
            messages: [...messages, ...fresh],
            deliveredDays: [...days].sort((a, b) => a - b),
          });
          return fresh.length;
        },

        send: ({ to, subject, body, attachments = [] }) => {
          const address = to.trim();
          const friend = friendFor(address);
          const recipient: MailAddress = friend
            ? {
                name: friend.contact.displayName,
                address: friend.contact.handle,
              }
            : { name: address, address };
          const prior = get().messages.filter(
            (m) =>
              m.folder !== 'inbox' &&
              m.to.some(
                (a) =>
                  a.address.toLowerCase() === recipient.address.toLowerCase(),
              ),
          ).length;
          const sentSubject = subject.trim() || '(no subject)';
          add({
            id: newId(),
            folder: 'sent',
            from: playerAddress(),
            to: [recipient],
            subject: sentSubject,
            body,
            attachments: [...attachments],
            receivedAt: Date.now(),
            read: true,
          });

          if (!friend) {
            add({
              id: newId(),
              folder: 'inbox',
              from: MAILER_DAEMON,
              to: [playerAddress()],
              subject: 'Undeliverable: ' + sentSubject,
              body:
                `Your message to ${address || 'the recipient'} could not be delivered.\n\n` +
                'The address was not found on the server. Check the spelling and try again.',
              attachments: [],
              receivedAt: Date.now(),
              read: false,
            });
            return;
          }

          const reply = autoReplies.find(
            (r) => r.contactId === friend.contact.id,
          );
          if (!reply) return;
          const timer = setTimeout(() => {
            pendingReplies.delete(timer);
            add({
              id: newId(),
              folder: 'inbox',
              from: {
                name: friend.contact.displayName,
                address: friend.contact.handle,
              },
              to: [playerAddress()],
              subject: prior === 0 ? reply.subject : `RE: ${sentSubject}`,
              body: prior === 0 ? reply.body : reply.again,
              attachments: [],
              receivedAt: Date.now(),
              read: false,
            });
          }, scaleMs(REPLY_DELAY_MS));
          pendingReplies.add(timer);
        },

        markRead: (id, read = true) =>
          set((s) => ({
            messages: s.messages.map((m) => (m.id === id ? { ...m, read } : m)),
          })),

        remove: (id) =>
          set((s) => {
            const msg = s.messages.find((m) => m.id === id);
            if (!msg) return s;
            if (msg.folder === 'deleted') {
              return { messages: s.messages.filter((m) => m.id !== id) };
            }
            return {
              messages: s.messages.map((m) =>
                m.id === id ? { ...m, folder: 'deleted', read: true } : m,
              ),
            };
          }),
      };
    },
    persistOptions<MailStore, MailState>({
      name: 'mail',
      partialize: ({ messages, deliveredDays }) => ({
        messages,
        deliveredDays,
      }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeMail(persisted, current),
      }),
    }),
  ),
);

/** Delivers due mail whenever the connection comes up. Returns the unsubscribe function. */
export function installMailDelivery(): () => void {
  return events.on('network:connected', () => {
    useMailStore.getState().deliver();
  });
}
