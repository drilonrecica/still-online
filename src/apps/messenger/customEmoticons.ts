// Player-made emoticons: `[code]` shortcuts mapped to a My Pictures file. Pure helpers, no assets.
import type { CustomEmoticon } from '@/content/types';

/** `[ponies]`: 2–7 characters (no whitespace or brackets) inside square brackets. */
const CODE = /^\[[^[\]\s]{2,7}\]$/;

export const isCustomCode = (code: string): boolean => CODE.test(code);

/** Turns what the player typed (`ponies` or `[ponies]`) into a code, or null if it is invalid. */
export function normalizeCustomCode(input: string): string | null {
  const t = input.trim();
  const code = t.startsWith('[') ? t : `[${t}]`;
  return isCustomCode(code) ? code : null;
}

/** Keeps valid entries, drops duplicates (case-insensitive). */
export function sanitizeCustomEmoticons(v: unknown): CustomEmoticon[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: CustomEmoticon[] = [];
  for (const e of v as unknown[]) {
    if (typeof e !== 'object' || e === null) continue;
    const { code, fileId } = e as Record<string, unknown>;
    if (typeof code !== 'string' || typeof fileId !== 'string') continue;
    if (!isCustomCode(code) || seen.has(code.toLowerCase())) continue;
    seen.add(code.toLowerCase());
    out.push({ code, fileId });
  }
  return out;
}
