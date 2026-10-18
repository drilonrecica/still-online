// Settings stored as `null` mean "the localized default" (docs/i18n.md → "settings"). Read them
// only through these helpers, so the default follows the language.
import { useSettingsStore } from '@/os/store/settings';
import type { Gender, ScreensaverSettings } from '@/os/types';
import { effectiveUserPicture, type UserPictureId } from '@/os/user/pictures';
import { getLocale, translate } from './t';
import type { Locale } from './types';
import { useT } from './useT';

/** The player's name. Login won't log on without one, so `''` only ever shows before logon. */
export function getPlayerName(): string {
  return useSettingsStore.getState().playerName ?? '';
}

/** `getPlayerName()` for components; re-renders on a name change. */
export function usePlayerName(): string {
  return useSettingsStore((s) => s.playerName) ?? '';
}

/** The player's gender. `null` (not chosen yet, only before the first logon) resolves as girl. */
export function getGender(): Gender {
  return useSettingsStore.getState().gender ?? 'girl';
}

/** `getGender()` for components; re-renders on a gender change. */
export function useGender(): Gender {
  return useSettingsStore((s) => s.gender) ?? 'girl';
}

/**
 * The user picture to show: the saved one, else the gender's default. `null` only before a
 * gender is chosen, which shows the neutral avatar.
 */
export function getUserPicture(): UserPictureId | null {
  const { userPicture, gender } = useSettingsStore.getState();
  return effectiveUserPicture(userPicture, gender);
}

/** `getUserPicture()` for components; re-renders on a picture or gender change. */
export function useUserPicture(): UserPictureId | null {
  const picture = useSettingsStore((s) => s.userPicture);
  const gender = useSettingsStore((s) => s.gender);
  return effectiveUserPicture(picture, gender);
}

/** The away message auto-away and the manual prompt start from. */
export function getAwayMessage(): string {
  return (
    useSettingsStore.getState().awayMessage ??
    translate(getLocale(), 'defaults.awayMessage')
  );
}

export function useAwayMessage(): string {
  const message = useSettingsStore((s) => s.awayMessage);
  const t = useT();
  return message ?? t('defaults.awayMessage');
}

/** The marquee text of `saver`. */
export function screensaverText(
  saver: Pick<ScreensaverSettings, 'text'>,
  locale: Locale = getLocale(),
): string {
  return saver.text ?? translate(locale, 'defaults.screensaverText');
}
