// Image URLs for the user pictures in `./pictures.ts`.
import butterfly from '@/assets/user/butterfly.svg';
import controller from '@/assets/user/controller.svg';
import flower from '@/assets/user/flower.svg';
import football from '@/assets/user/football.svg';
import heartGuitar from '@/assets/user/heart-guitar.svg';
import kitten from '@/assets/user/kitten.svg';
import rocket from '@/assets/user/rocket.svg';
import skateboard from '@/assets/user/skateboard.svg';
import avatar from '@/os/startmenu/avatar.svg';
import type { UserPictureId } from './pictures';

const SOURCES: Readonly<Record<UserPictureId, string>> = {
  butterfly,
  flower,
  kitten,
  'heart-guitar': heartGuitar,
  skateboard,
  controller,
  football,
  rocket,
};

/** Image URL for a picture id; `null` is the neutral pre-v0.4 avatar. */
export function userPictureSrc(id: UserPictureId | null): string {
  return id ? SOURCES[id] : avatar;
}
