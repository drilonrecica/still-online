// Shared i18n contracts. See docs/i18n.md for how catalogs, keys and persisted references work.
import type { en } from './messages/en';

// ---------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------

export const LOCALES = ['en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (v: unknown): v is Locale =>
  (LOCALES as readonly unknown[]).includes(v);

/** Names shown in language pickers: always in their own language, never translated. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: 'English',
  de: 'Deutsch',
};

/** BCP 47 tags `format.ts` hands to `Intl`. */
export const INTL_LOCALES: Readonly<Record<Locale, string>> = {
  en: 'en-US',
  de: 'de-DE',
};

// ---------------------------------------------------------------------------
// Catalog typing (generic over any catalog, so tests can use small fixtures)
// ---------------------------------------------------------------------------

/** A function value, for grammar a template can't express (plurals, German cases). */
export type MessageFn = (params: never) => string;

/** A catalog with its string literals widened to `string`; function signatures are kept. */
export type CatalogShape<T> = T extends string
  ? string
  : T extends (params: infer P) => string
    ? (params: P) => string
    : { readonly [K in keyof T]: CatalogShape<T[K]> };

/** Every leaf dot path of a catalog: `'common.ok' | 'messenger.status.away' | …`. */
export type CatalogKey<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | MessageFn
    ? `${Prefix}${K}`
    : CatalogKey<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** The value at dot path `P`. */
export type CatalogValue<
  T,
  P extends string,
> = P extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? CatalogValue<T[H], R>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** `{name}` tokens of a string literal: `'Hi {name}, {n} new'` → `'name' | 'n'`. */
export type TemplateParams<S extends string> =
  S extends `${string}{${infer N}}${infer R}` ? N | TemplateParams<R> : never;

/** A value a `{param}` token accepts; numbers are formatted by the caller (`formatNumber`). */
export type ParamValue = string | number;

/**
 * The rest arguments `t(key, …)` takes for a value: none for a plain string, a params object
 * naming every token for a template, the function's own params for a function value.
 */
export type CatalogArgs<V> = V extends (params: infer P) => string
  ? unknown extends P
    ? []
    : [params: P]
  : V extends string
    ? [TemplateParams<V>] extends [never]
      ? []
      : [params: Readonly<Record<TemplateParams<V>, ParamValue>>]
    : never;

// ---------------------------------------------------------------------------
// The app catalog
// ---------------------------------------------------------------------------

/** What every locale's catalog must provide: the shape of `en.ts`. */
export type Messages = CatalogShape<typeof en>;

/** Type-checked catalog key. */
export type MessageKey = CatalogKey<typeof en>;

export type MessageArgs<K extends MessageKey> = CatalogArgs<
  CatalogValue<typeof en, K>
>;

/** `t()` and the function `useT()` returns (implemented in P0-02). */
export type TFunction = <K extends MessageKey>(
  key: K,
  ...args: MessageArgs<K>
) => string;

// ---------------------------------------------------------------------------
// Persisted text references
// ---------------------------------------------------------------------------

/** JSON-safe params stored next to a key. Ids stay raw ids; rendering formats them. */
export type TextParams = Readonly<Record<string, ParamValue>>;

/**
 * Generated text as it is persisted: a key plus params, rendered with `t()` in the current
 * locale at view time. Used for window titles and generated mail. `sanitize` drops refs whose
 * key no longer exists in `en.ts`.
 */
export interface TextRef {
  key: MessageKey;
  params?: TextParams;
}
