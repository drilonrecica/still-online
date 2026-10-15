// Settings stored as `null` mean "the localized default" (docs/i18n.md → "settings"). Read them
// only through these helpers, so the default follows the language.
import { useSettingsStore } from '@/os/store/settings';
import type { ScreensaverSettings } from '@/os/types';
import { getLocale, translate } from './t';
import type { Locale } from './types';
import { useT } from './useT';

/** The player's name in the current locale. */
export function getPlayerName(): string {
  return (
    useSettingsStore.getState().playerName ??
    translate(getLocale(), 'defaults.playerName')
  );
}

/** `getPlayerName()` for components; re-renders on a name or language change. */
export function usePlayerName(): string {
  const name = useSettingsStore((s) => s.playerName);
  const t = useT();
  return name ?? t('defaults.playerName');
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
