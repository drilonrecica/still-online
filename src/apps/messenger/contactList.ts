// Pure view-model for the contact list: which contacts sit in which group, with counts.
import type {
  Contact,
  ContactGroup,
  ContactId,
  ContactProgress,
  ContactStatus,
} from '@/content/types';

export type ListGroupId = ContactGroup | 'Offline';

export interface ListEntry {
  contact: Contact;
  /** `offline` for anyone not signed in or appearing offline. */
  status: ContactStatus;
  personalMessage: string;
}

export interface ListGroup {
  id: ListGroupId;
  entries: ListEntry[];
  /** Contacts currently signed in (and not appearing offline) out of `total`. */
  online: number;
  total: number;
}

const GROUP_ORDER: readonly ContactGroup[] = ['Friends', 'School', 'Family'];

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
    };
  };

  const groups: ListGroup[] = [];
  for (const id of GROUP_ORDER) {
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
      id: 'Offline',
      entries: offline,
      online: 0,
      total: offline.length,
    });
  return groups;
}
