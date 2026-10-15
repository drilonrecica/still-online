// Window titles are rendered, never stored: the runtime `titleKey` or the app's own.
import { translateRef } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import type { AppDefinition, WindowState } from '@/os/types';

export function renderWindowTitle(
  win: Pick<WindowState, 'titleKey' | 'titleParams'>,
  app: Pick<AppDefinition, 'titleKey'> | undefined,
  locale: Locale,
): string {
  if (win.titleKey) return translateRef(locale, win.titleKey, win.titleParams);
  return app ? translateRef(locale, app.titleKey) : '';
}
