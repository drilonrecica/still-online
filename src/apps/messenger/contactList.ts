// Pure view-model for the contact list: which contacts sit in which group, with counts.
import type { Locale } from '@/i18n/types';
import type { Gender } from '@/os/types';
import {
  CONTACT_GROUP_IDS,
  type Contact,
  type ContactContent,
  type ContactId,
  type ContactListGroupId,
  type ContactProgress,
  type ContactStatus,
} from '@/content/types';
import { renderPersonalMessage } from './engine/render';

/** Group ids are language-neutral; the view renders `messenger.groups.<id>`. */
export type ListGroupId = ContactListGroupId;

export interface ListEntry {
  contact: Contact;
  /** `offline` for anyone not signed in or appearing offline. */
  status: ContactStatus;
  /** Rendered in the list's locale. */
  personalMessage: string;
  /** The contact asked something and is waiting for the player's reply. */
  awaitingReply: boolean;
}

export interface ListGroup {
  id: ListGroupId;
  entries: ListEntry[];
  /** Contacts currently signed in (and not appearing offline) out of `total`. */
  online: number;
  total: number;
}

/** `contents` carry the text for `locale` and `gender`; personal messages render from them. */
export function buildContactList(
  contents: readonly ContactContent[],
  progress: Readonly<Record<ContactId, ContactProgress>>,
  online: Readonly<Record<ContactId, boolean>>,
  locale: Locale,
  playerName: string,
  gender: Gender,
): ListGroup[] {
  const contacts = contents.map((c) => c.contact);
  const contentOf = new Map(contents.map((c) => [c.contact.id, c]));
  const byName = (a: ListEntry, b: ListEntry) =>
    a.contact.displayName.localeCompare(b.contact.displayName);
  const entryOf = (contact: Contact): ListEntry => {
    const p = progress[contact.id];
    const signedIn = online[contact.id] === true;
    return {
      contact,
      status: signedIn ? (p?.status ?? contact.initialStatus) : 'offline',
      personalMessage: renderPersonalMessage(
        p?.personalMessage ?? 'initial',
        contentOf.get(contact.id),
        locale,
        playerName,
        gender,
      ),
      awaitingReply: p?.active?.awaitingChoice === true,
    };
  };

  const groups: ListGroup[] = [];
  for (const id of CONTACT_GROUP_IDS) {
    const members = contacts.filter((c) => c.group === id).map(entryOf);
    if (members.length === 0) continue;
    const visible = members.filter((e) => e.status !== 'offline').sort(byName);
    groups.push({
      id,
      entries: visible,
      online: visible.length,
      total: members.length,
    });
  }
  const offline = contacts
    .map(entryOf)
    .filter((e) => e.status === 'offline')
    .sort(byName);
  if (offline.length > 0)
    groups.push({
      id: 'offline',
      entries: offline,
      online: 0,
      total: offline.length,
    });
  return groups;
}
