// The eight user pictures (login tile, Start menu header, User Accounts). Original 48×48 SVG
// tiles in `src/assets/user/` (URLs in `./sources.ts`, kept apart so this stays plain data).
// The first four lean girl, the last four boy; each gender has a default, used while
// `settings.userPicture` is `null`.
import type { Gender } from '@/os/types';

export const USER_PICTURE_IDS = [
  'butterfly',
  'flower',
  'kitten',
  'heart-guitar',
  'skateboard',
  'controller',
  'football',
  'rocket',
] as const;

export type UserPictureId = (typeof USER_PICTURE_IDS)[number];

export const DEFAULT_USER_PICTURE: Readonly<Record<Gender, UserPictureId>> = {
  girl: 'butterfly',
  boy: 'skateboard',
};

export function isUserPictureId(v: unknown): v is UserPictureId {
  return USER_PICTURE_IDS.some((id) => id === v);
}

/** The picture to show: the saved one, else the gender's default; `null` before any gender. */
export function effectiveUserPicture(
  picture: UserPictureId | null,
  gender: Gender | null,
): UserPictureId | null {
  return picture ?? (gender ? DEFAULT_USER_PICTURE[gender] : null);
}
