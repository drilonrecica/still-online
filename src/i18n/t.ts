// `t()` and `getLocale()` for non-React code. React views use `useT()`/`useLocale()` instead,
// which re-render on a language switch. See docs/i18n.md → "Catalogs".
import { useSettingsStore } from '@/os/store/settings';
import { detectBrowserLocale } from './detect';
import { MESSAGES } from './messages';
import type {
  Locale,
  MessageArgs,
  MessageKey,
  TFunction,
  TextParams,
} from './types';

export { MESSAGES };

/** The effective locale: the player's choice, or detection until they choose. */
export function getLocale(): Locale {
  return useSettingsStore.getState().language ?? detectBrowserLocale();
}

type Params = Readonly<Record<string, unknown>>;

/** Replaces each `{name}` token with its param; a token without a param stays visible. */
export function interpolate(template: string, params?: Params): string {
  return template.replace(/\{(\w+)\}/g, (token, name: string) =>
    params && Object.hasOwn(params, name) ? String(params[name]) : token,
  );
}

/**
 * Renders the value at dot path `key` of any catalog: a template is interpolated, a function
 * gets the params object. `undefined` if the path doesn't lead to a string or function.
 */
export function renderMessage(
  catalog: object,
  key: string,
  params?: Params,
): string | undefined {
  let value: unknown = catalog;
  for (const part of key.split('.')) {
    if (typeof value !== 'object' || value === null) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  if (typeof value === 'string') return interpolate(value, params);
  if (typeof value === 'function') {
    return (value as (p: Params) => string)(params ?? {});
  }
  return undefined;
}

/** `t` for one locale. Falls back to English, then to the key itself (never throws). */
export function translate<K extends MessageKey>(
  locale: Locale,
  key: K,
  ...args: MessageArgs<K>
): string {
  const params = (args as readonly unknown[])[0] as Params | undefined;
  return (
    renderMessage(MESSAGES[locale], key, params) ??
    renderMessage(MESSAGES.en, key, params) ??
    key
  );
}

/** Translates `key` in the current locale. Reads the locale on every call; never caches. */
export const t: TFunction = (key, ...args) =>
  translate(getLocale(), key, ...args);

/**
 * Renders a persisted reference (`TextRef`, a window's `titleKey`/`titleParams`) whose params
 * were type-checked when it was stored.
 */
export function translateRef(
  locale: Locale,
  key: MessageKey,
  params?: TextParams,
): string {
  return (
    renderMessage(MESSAGES[locale], key, params) ??
    renderMessage(MESSAGES.en, key, params) ??
    key
  );
}
