// Pure view-model for the contact list: which contacts sit in which group, with counts.
import {
  CONTACT_GROUP_IDS,
  type Contact,
  type ContactId,
  type ContactListGroupId,
  type ContactProgress,
  type ContactStatus,
} from '@/content/types';

/** Group ids are language-neutral; the view renders `messenger.groups.<id>`. */
export type ListGroupId = ContactListGroupId;

export interface ListEntry {
  contact: Contact;
  /** `offline` for anyone not signed in or appearing offline. */
  status: ContactStatus;
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

export function buildContactList(
  contacts: readonly Contact[],
  progress: Readonly<Record<ContactId, ContactProgress>>,
  online: Readonly<Record<ContactId, boolean>>,
): ListGroup[] {
  const byName = (a: ListEntry, b: ListEntry) =>
    a.contact.displayName.localeCompare(b.contact.displayName);
  const entryOf = (contact: Contact): ListEntry => {
    const p = progress[contact.id];
    const signedIn = online[contact.id] === true;
    return {
      contact,
      status: signedIn ? (p?.status ?? contact.initialStatus) : 'offline',
      personalMessage: p?.personalMessage ?? contact.personalMessage,
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
