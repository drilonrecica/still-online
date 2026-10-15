// Mail's persisted `mail` store: the player's mailbox plus delivery of authored mail per day,
// composing, and friends' canned replies. Mail is stored as language-neutral `MailRecord`s and
// rendered at view time (`records.ts`). See docs/architecture-v0.2.md → "Stores", docs/i18n.md → "mail".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MailAddress,
  MailAttachment,
  MailContent,
  MailState,
} from '@/content/mail/types';
import type { MailRecord } from '@/content/types';
import { getContacts } from '@/content/locale';
import { getPlayerName } from '@/i18n/settingsText';
import type { Locale } from '@/i18n/types';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import { mulberry32, randInt, seedFrom } from '@/os/random';
import { scaleMs } from '@/os/speed';
import { currentDay } from '@/os/world';
import {
  PLAYER,
  autoRepliesFor,
  isContentId,
  mailContentFor,
  sanitizeRecord,
} from './records';

export const MAIL_DEFAULTS: MailState = { messages: [], deliveredDays: [] };

export const REPLY_DELAY_MS = 20_000;

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
export function playerAddress(name: string = getPlayerName()): MailAddress {
  const user = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '') || 'player';
  return { name, address: `${user}@livemail.example` };
}

/** The friend whose Messenger handle is `address` (names in `locale`). */
export function friendFor(address: string, locale: Locale = 'en') {
  const needle = address.trim().toLowerCase();
  return getContacts(locale).find(
    (c) => c.contact.handle.toLowerCase() === needle,
  );
}

function newId(): string {
  return `m:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeMail(
  persisted: unknown,
  current: MailState,
): MailState {
  if (!isRecord(persisted)) return current;
  const seen = new Set<string>();
  // Settings hydrate first, so this is the address v0.2 mail was sent from.
  const player = playerAddress().address;
  const messages = Array.isArray(persisted.messages)
    ? persisted.messages.flatMap((m) => {
        const msg = sanitizeRecord(m, player);
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
      const add = (message: MailRecord) =>
        set((s) => ({ messages: [...s.messages, message] }));

      return {
        ...MAIL_DEFAULTS,

        deliver: (
          day = currentDay(),
          content = mailContentFor('en'),
          now = Date.now(),
        ) => {
          const { deliveredDays, messages } = get();
          const have = new Set(messages.map((m) => m.id));
          const due = content.filter(
            (c) =>
              c.day <= day && !deliveredDays.includes(c.day) && !have.has(c.id),
          );
          if (!due.length) return 0;
          // A day's mail always lands above everything already in the inbox, and a catch-up
          // batch lands day by day: a new day can boot minutes after the last one, which a
          // plain "now minus a few minutes" would sort below yesterday's mail.
          let floor = Math.max(
            -Infinity,
            ...messages
              .filter((m) => m.folder === 'inbox')
              .map((m) => m.receivedAt + 60_000),
          );
          let floorDay = -1;
          let dayTop = floor;
          const fresh = [...due]
            .sort((a, b) => a.day - b.day)
            .map((c): MailRecord => {
              if (c.day !== floorDay) {
                floor = dayTop;
                floorDay = c.day;
              }
              // A stable "arrived a while ago" offset, 2–90 minutes, so the list looks natural.
              const minutes = randInt(mulberry32(seedFrom(c.id)), 2, 90);
              // Raised to the floor, keeping the offsets' order (smaller offset = newer).
              const receivedAt = Math.max(
                now - minutes * 60_000,
                floor + (90 - minutes) * 1_000,
              );
              dayTop = Math.max(dayTop, receivedAt + 60_000);
              const base = {
                id: c.id,
                folder: 'inbox' as const,
                receivedAt,
                read: false,
              };
              // Authored mail renders by id; content that isn't shipped (tests) is kept as text.
              return isContentId(c.id)
                ? { ...base, kind: 'content' }
                : {
                    ...base,
                    kind: 'text',
                    from: c.from,
                    to: [PLAYER],
                    subject: c.subject,
                    body: c.body,
                    attachments: [...(c.attachments ?? [])],
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
              m.kind === 'text' &&
              m.folder !== 'inbox' &&
              m.to.some(
                (a) =>
                  a.address.toLowerCase() === recipient.address.toLowerCase(),
              ),
          ).length;
          // '' renders as "(no subject)" in the current language.
          const sentSubject = subject.trim();
          add({
            id: newId(),
            kind: 'text',
            folder: 'sent',
            from: PLAYER,
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
              kind: 'bounce',
              folder: 'inbox',
              params: { to: address, subject: sentSubject },
              receivedAt: Date.now(),
              read: false,
            });
            return;
          }

          const contactId = friend.contact.id;
          if (!autoRepliesFor('en').some((r) => r.contactId === contactId))
            return;
          const timer = setTimeout(() => {
            pendingReplies.delete(timer);
            add({
              id: newId(),
              kind: 'autoReply',
              folder: 'inbox',
              contactId,
              again: prior > 0,
              params: { subject: sentSubject },
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
