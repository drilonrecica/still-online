// React side of i18n: hooks that re-render when the language changes.
import { useMemo } from 'react';
import { useSettingsStore } from '@/os/store/settings';
import { detectBrowserLocale } from './detect';
import { translate } from './t';
import type { Locale, TFunction } from './types';

/** The effective locale; the component re-renders when it changes. */
export function useLocale(): Locale {
  return useSettingsStore((s) => s.language) ?? detectBrowserLocale();
}

/** A `t` bound to the current locale; a new function (and a re-render) on every switch. */
export function useT(): TFunction {
  const locale = useLocale();
  return useMemo<TFunction>(
    () =>
      (key, ...args) =>
        translate(locale, key, ...args),
    [locale],
  );
}
