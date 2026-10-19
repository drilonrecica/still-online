// Sanitizers for the v0.4 `web` store fields (P0-02). Each field is checked on its own and falls
// back to its default, so a v0.3 save (or a corrupt one) loads without losing anything else.
// See docs/architecture-v0.4.md → "Saved state".
import { contacts } from '@/content/contacts';
import { BANDS } from '@/content/friendspace/bands';
import type { MoodHistoryEntry } from '@/content/friendspace/profiles/types';
import type { PlayerTopEntry } from '@/content/friendspace/types';
import { PIXLOG_SKINS, type PixlogSkinId } from '@/content/pixlog/types';
import type { PixlogState, Top8WallEntry } from '@/content/sites/types';
import type { ContactId } from '@/content/types';
import { isRecord } from '@/os/persist';
import type { Gender } from '@/os/types';

export const WEB_LIMITS = {
  top8: 8,
  layoutCode: 2000,
  moodHistory: 5,
  /** Oldest wall reactions drop off beyond this. */
  top8Wall: 50,
  album: 24,
  caption: 80,
  surveyAnswer: 80,
} as const;

export const PIXLOG_DEFAULTS: PixlogState = {
  album: [],
  surveys: {},
  kudosGiven: {},
};

const str = (v: unknown): v is string => typeof v === 'string';
const day = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1;

const CONTACT_IDS: ReadonlySet<string> = new Set(
  contacts.map((c) => c.contact.id),
);
const BAND_IDS: ReadonlySet<string> = new Set(BANDS.map((b) => b.id));

export const isContactId = (v: unknown): v is ContactId =>
  str(v) && CONTACT_IDS.has(v);

const entryKey = (e: PlayerTopEntry) =>
  e.kind === 'extra' ? `extra:${e.seed}` : `${e.kind}:${e.id}`;

function topEntry(v: unknown): PlayerTopEntry | null {
  // v0.3 saved the Top 8 as contact ids.
  if (str(v)) return isContactId(v) ? { kind: 'contact', id: v } : null;
  if (!isRecord(v)) return null;
  if (v.kind === 'contact' && isContactId(v.id))
    return { kind: 'contact', id: v.id };
  if (v.kind === 'band' && str(v.id) && BAND_IDS.has(v.id))
    return { kind: 'band', id: v.id };
  if (v.kind === 'extra' && str(v.name) && str(v.seed) && v.name && v.seed)
    return { kind: 'extra', name: v.name, seed: v.seed };
  return null;
}

/** Typed Top 8 entries: migrates contact ids, drops unknown kinds and ids, dedupes, max 8. */
export function sanitizeTop8(v: unknown): PlayerTopEntry[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: PlayerTopEntry[] = [];
  for (const raw of v) {
    const e = topEntry(raw);
    if (!e || seen.has(entryKey(e))) continue;
    seen.add(entryKey(e));
    out.push(e);
    if (out.length === WEB_LIMITS.top8) break;
  }
  return out;
}

/** A pasted layout code, capped; anything but a string is dropped. */
export const sanitizeLayoutCode = (v: unknown): string | undefined =>
  str(v) ? v.slice(0, WEB_LIMITS.layoutCode) : undefined;

export const sanitizeAutoplay = (v: unknown): boolean | undefined =>
  typeof v === 'boolean' ? v : undefined;

export function sanitizeMoodHistory(
  v: unknown,
): MoodHistoryEntry[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v
    .flatMap((m) =>
      isRecord(m) && str(m.text) && str(m.emoticon) && day(m.day)
        ? [{ text: m.text, emoticon: m.emoticon, day: m.day }]
        : [],
    )
    .slice(0, WEB_LIMITS.moodHistory);
}

export const sanitizeBulletinsSeen = (v: unknown): number | undefined =>
  day(v) ? v : undefined;

export function sanitizeTop8Wall(v: unknown): Top8WallEntry[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v
    .flatMap((e): Top8WallEntry[] =>
      isRecord(e) &&
      isContactId(e.contactId) &&
      (e.kind === 'dropped' || e.kind === 'readded') &&
      day(e.day)
        ? [{ contactId: e.contactId, kind: e.kind, day: e.day }]
        : [],
    )
    .slice(-WEB_LIMITS.top8Wall);
}

export const isPixlogSkin = (v: unknown): v is PixlogSkinId =>
  (PIXLOG_SKINS as readonly unknown[]).includes(v);

/** The skin an untouched Pixlog page starts with: the player's side of 2007. */
export const DEFAULT_PIXLOG_SKIN: Readonly<Record<Gender, PixlogSkinId>> = {
  girl: 'bubblegum',
  boy: 'night',
};

/** The player's Pixlog skin: their pick, else the gender's default (a switch follows it). */
export const pixlogSkinFor = (
  pixlog: PixlogState | undefined,
  gender: Gender,
): PixlogSkinId => pixlog?.skin ?? DEFAULT_PIXLOG_SKIN[gender];

/** Album entries: a My Pictures node id plus a caption; deduped by node, max 24. */
export function sanitizeAlbum(v: unknown): PixlogState['album'] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: PixlogState['album'] = [];
  for (const e of v) {
    if (!isRecord(e) || !str(e.fsNodeId) || !e.fsNodeId || !str(e.caption))
      continue;
    if (seen.has(e.fsNodeId)) continue;
    seen.add(e.fsNodeId);
    out.push({
      fsNodeId: e.fsNodeId,
      caption: e.caption.slice(0, WEB_LIMITS.caption),
    });
    if (out.length === WEB_LIMITS.album) break;
  }
  return out;
}

export const cleanSurveyAnswers = (answers: readonly unknown[]): string[] =>
  answers.map((a) => (str(a) ? a.slice(0, WEB_LIMITS.surveyAnswer) : ''));

function sanitizeSurveys(v: unknown): PixlogState['surveys'] {
  if (!isRecord(v)) return {};
  const out: PixlogState['surveys'] = {};
  for (const [id, answers] of Object.entries(v))
    if (Array.isArray(answers)) out[id] = cleanSurveyAnswers(answers);
  return out;
}

function sanitizeKudos(v: unknown): PixlogState['kudosGiven'] {
  if (!isRecord(v)) return {};
  const out: PixlogState['kudosGiven'] = {};
  for (const [id, days] of Object.entries(v)) {
    if (!isContactId(id) || !Array.isArray(days)) continue;
    out[id] = [...new Set(days.filter(day))].sort((a, b) => a - b);
  }
  return out;
}

/** The player's Pixlog state; each part falls back to its default on its own. */
export function sanitizePixlog(v: unknown): PixlogState | undefined {
  if (!isRecord(v)) return undefined;
  return {
    ...(isPixlogSkin(v.skin) ? { skin: v.skin } : {}),
    album: sanitizeAlbum(v.album),
    surveys: sanitizeSurveys(v.surveys),
    kudosGiven: sanitizeKudos(v.kudosGiven),
  };
}
