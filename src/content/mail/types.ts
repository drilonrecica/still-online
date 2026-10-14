// Mail content (P4-07: src/content/mail/day1.ts … day5.ts, autoReplies.ts) and the persisted
// `mail` store data (P4-06: src/apps/mail/store.ts).
import type { ContactId } from '../types';
import type { PhotoSpec } from '../../os/fs/types';

export interface MailAddress {
  name: string;
  /** `@livemail.example` for friends, `@<site>.example` for everyone else. */
  address: string;
}

export interface MailAttachment {
  /** File name used when saving to the fs (`flyer.jpg`, `itinerary.txt`). */
  name: string;
  type: 'txt' | 'image';
  text?: string;
  photo?: PhotoSpec;
}

/** One authored mail, delivered once `day <= currentDay`. */
export interface MailContent {
  /** Unique across all days. */
  id: string;
  day: number;
  from: MailAddress;
  subject: string;
  body: string;
  attachments?: readonly MailAttachment[];
}

/** A friend's canned answer to the player's mail. */
export interface AutoReply {
  contactId: ContactId;
  subject: string;
  body: string;
  /** Reply to every later mail ("u know we can just chat right"). */
  again: string;
}

export type MailFolder = 'inbox' | 'sent' | 'deleted';

/** A mail in the player's mailbox. */
export interface MailMessage {
  /** Content id for delivered mail; `m:<random>` for composed, replies and bounces. */
  id: string;
  folder: MailFolder;
  from: MailAddress;
  to: MailAddress[];
  subject: string;
  body: string;
  attachments: MailAttachment[];
  /** Epoch ms (real time). */
  receivedAt: number;
  read: boolean;
}

export interface MailState {
  messages: MailMessage[];
  /** Days whose content mails were delivered. */
  deliveredDays: number[];
}
