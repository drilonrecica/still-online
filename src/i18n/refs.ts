// Validation for persisted text references (docs/i18n.md → "Persisted state"). No store imports,
// so any store's `sanitize` can use it.
import { en } from './messages/en';
import type { MessageKey, TextParams } from './types';

/** True when `v` is a dot path to a string or function in `en.ts`. */
export function isMessageKey(v: unknown): v is MessageKey {
  if (typeof v !== 'string' || v === '') return false;
  let value: unknown = en;
  for (const part of v.split('.')) {
    if (
      typeof value !== 'object' ||
      value === null ||
      !Object.hasOwn(value, part)
    ) {
      return false;
    }
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' || typeof value === 'function';
}

/** Keeps the string and finite-number entries of an untrusted params object; null if none. */
export function sanitizeTextParams(v: unknown): TextParams | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const out: Record<string, string | number> = {};
  for (const [k, p] of Object.entries(v)) {
    if (
      typeof p === 'string' ||
      (typeof p === 'number' && Number.isFinite(p))
    ) {
      out[k] = p;
    }
  }
  return Object.keys(out).length ? out : null;
}
