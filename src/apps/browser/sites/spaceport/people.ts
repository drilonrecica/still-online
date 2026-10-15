// Turns profile content into what ProfileView shows: friends' names and pictures come from the
// contact content (never from Messenger's state), the player's from their name.
import { contacts } from '@/content/contacts';
import type { ProfileComment, TopFriend } from '@/content/profiles/types';
import type { ContactId } from '@/content/types';
import { extraColors, fillName } from './logic';
import type { PictureSpec, TopFriendView, WallComment } from './ProfileView';

/** The player's default pattern colours (the same as Messenger's default picture). */
const PLAYER_COLORS = ['#dfe9f8', '#1d4f99'] as const;

export const FRIEND_IDS: readonly ContactId[] = contacts.map(
  (c) => c.contact.id,
);

export function friend(id: ContactId) {
  return contacts.find((c) => c.contact.id === id)?.contact;
}

export function friendPicture(id: ContactId): PictureSpec {
  const avatar = friend(id)?.avatar;
  return avatar?.kind === 'pattern'
    ? { seed: avatar.seed, colors: avatar.colors }
    : { seed: id, colors: extraColors(id) };
}

export function playerPicture(playerName: string): PictureSpec {
  return { seed: playerName, colors: PLAYER_COLORS };
}

export function friendName(id: ContactId): string {
  return friend(id)?.displayName ?? id;
}

export function topFriendView(t: TopFriend, playerName: string): TopFriendView {
  if (t.kind === 'player')
    return {
      key: 'player',
      label: playerName,
      picture: playerPicture(playerName),
      href: '/me',
    };
  if (t.kind === 'contact')
    return {
      key: t.id,
      label: friendName(t.id),
      picture: friendPicture(t.id),
      href: `/${t.id}`,
    };
  return {
    key: `x:${t.seed}`,
    label: t.name,
    picture: { seed: t.seed, colors: extraColors(t.seed) },
  };
}

export function wallComment(
  c: ProfileComment,
  playerName: string,
): WallComment {
  const text = fillName(c.text, playerName);
  if (c.contactId)
    return {
      day: c.day,
      from: friendName(c.contactId),
      picture: friendPicture(c.contactId),
      href: `/${c.contactId}`,
      text,
    };
  return {
    day: c.day,
    from: c.from,
    picture: { seed: c.from, colors: extraColors(c.from) },
    text,
  };
}
