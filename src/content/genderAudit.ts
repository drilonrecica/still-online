// Gender audit (G2-01, docs/gender.md → "Audit"): scans all content as a boy resolves it for
// girly cue words. `genderAudit.test.ts` fails on any hit that `genderAudit.allow.ts` doesn't
// list with a reason; `npm run gender-audit` prints the numbers.
import type { Gender } from '@/os/types';
import type { Locale } from '@/i18n/types';
import { contentFor } from './locale';

export interface Cue {
  /** The cue as the allowlist names it (`match`). */
  id: string;
  re: RegExp;
}

// Letter boundaries that know umlauts and ß (`\b` doesn't).
const L = 'A-Za-zÄÖÜäöüß';
const word = (id: string, body: string): Cue => ({
  id,
  re: new RegExp(`(?<![${L}])(?:${body})(?![${L}])`, 'i'),
});
const literal = (id: string): Cue => ({
  id,
  re: new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
});
/** German compounds: the cue anywhere in a word („Bastelglitzer", „Ponyhof"). */
const part = (id: string, body = id): Cue => ({
  id,
  re: new RegExp(body, 'i'),
});

const EN_CUES: readonly Cue[] = [
  literal('<3'),
  literal('(L)'),
  literal(':-*'),
  word('xoxo', 'xoxo'),
  word('luv u', 'luv u'),
  word('bff', 'bffs?'),
  word('hun', 'hun'),
  word('babe', 'babes?'),
  word('sweetie', 'sweeties?'),
  word('cutie', 'cuties?'),
  word('cute', 'cute(?:r|st)?'),
  word('pretty', 'pretty'),
  word('gorgeous', 'gorgeous'),
  word('glitter', 'glitter(?:s|y|ed)?'),
  word('sparkl*', `sparkl[${L}]*`),
  word('sleepover', 'sleepovers?'),
  word('lip gloss', 'lip ?gloss'),
  word('nail polish', 'nail polish'),
  word('makeup', 'make-?up'),
  word('outfit', 'outfits?'),
  word('pink', 'pink'),
  word('pony', 'pony'),
  word('ponies', 'ponies'),
  word('horse', 'horses?'),
  word('crush', 'crush(?:es|ed|ing)?'),
  word('pinky swear', 'pinky swear'),
  word('pinky promise', 'pinky promise'),
];

const DE_CUES: readonly Cue[] = [
  word('hdgdl', 'hdgdl'),
  word('süß', 'süß(?:e|er|es|en|em)?'),
  word('hübsch', `hübsch[${L}]*`),
  word('Schatz', 'schatz(?:i|is)?'),
  part('Mädchen'),
  part('Glitzer'),
  part('Pyjamaparty'),
  part('Übernachtungsparty'),
  part('Pony', `pony(?!s(?![${L}]))`),
  part('Ponys', 'ponys'),
  part('Pferd'),
  part('Outfit'),
  part('Lipgloss'),
  word('rosa', `rosa(?:farben|[a-z]*e[nmrs]?)?`),
  word('pink', 'pink(?:e[nmrs]?)?'),
  word('Schwarm', 'schwarm'),
];

/** English cues a German cue already covers (one hit per word, not two). */
const COVERED_IN_DE = new Set([
  'pink',
  'pony',
  'ponies',
  'outfit',
  'lip gloss',
]);

/** English cues everywhere (German chat borrows them), German cues in German content. */
export const cuesFor = (locale: Locale): readonly Cue[] =>
  locale === 'de'
    ? [...EN_CUES.filter((c) => !COVERED_IN_DE.has(c.id)), ...DE_CUES]
    : EN_CUES;

/**
 * Keys whose strings are ids, styling, links or addresses, not text anyone reads as words.
 * `from` is an author's screen name (`lipgloss_lexi`) or a mail sender, never a line to him.
 */
const SKIP_KEYS = new Set([
  'from',
  'address',
  'id',
  'contactId',
  'scriptId',
  'start',
  'next',
  'trigger',
  'avatar',
  'theme',
  'layout',
  'skin',
  'seed',
  'songTrackId',
  'trackIds',
  'graphic',
  'link',
  'href',
  'url',
  'wink',
  'statusChange',
  'unlock',
  'group',
  'handle',
  'kind',
  'scene',
  'look',
  'palette',
  'colors',
  'color',
  'mime',
  'icon',
]);

/** Readable segment for an array item: its id if it has one, else the index. */
function itemKey(item: unknown, i: number): string {
  if (typeof item === 'object' && item !== null) {
    const o = item as Record<string, unknown>;
    if (typeof o.id === 'string') return o.id;
    if (typeof o.contactId === 'string') return o.contactId;
    const c = o.contact as Record<string, unknown> | undefined;
    if (c && typeof c.id === 'string') return c.id;
  }
  return `[${i}]`;
}

function collect(value: unknown, path: string, out: Map<string, string>) {
  if (typeof value === 'string') {
    out.set(path, value);
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item: unknown, i) => {
      const key = itemKey(item, i);
      collect(
        item,
        key.startsWith('[') ? `${path}${key}` : `${path}/${key}`,
        out,
      );
    });
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (SKIP_KEYS.has(key)) continue;
    collect(item, `${path}/${key}`, out);
  }
}

/**
 * Stable paths: `contacts/jess/day3/glitter/lines[2]` for a line's text,
 * `…/choices[0]/text` or `/label` for the player's options.
 */
const tidy = (path: string): string =>
  path
    .replace(/^contacts\/([^/]+)\/contact\//, 'contacts/$1/')
    .replace(/^contacts\/([^/]+)\/scripts\/([^/]+)\/nodes\//, 'contacts/$1/$2/')
    .replace(/(lines\[\d+\])\/text$/, '$1');

/** Every readable string of `locale`'s content for `gender`, by stable path. */
export function contentStrings(
  locale: Locale,
  gender: Gender,
): Map<string, string> {
  // JSON drops the functions (helpers like `newDayBalloonText`).
  const data = JSON.parse(JSON.stringify(contentFor(locale, gender))) as Record<
    string,
    unknown
  >;
  const raw = new Map<string, string>();
  for (const [key, value] of Object.entries(data)) collect(value, key, raw);
  return new Map([...raw].map(([p, s]) => [tidy(p), s]));
}

/** True for the player's own reply options (they may never be allowlisted). */
export const isChoicePath = (where: string): boolean =>
  /\/choices\[\d+\]\/(text|label)$/.test(where);

export const ALLOW_REASONS = [
  'friend-self-talk',
  'story-fact',
  'site-content',
] as const;

export interface AllowEntry {
  /** A hit's `where`, or a prefix ending in `/*` (site content only). */
  where: string;
  /** A cue id, or `*` with a `/*` prefix. */
  match: string;
  reason: (typeof ALLOW_REASONS)[number];
}

/** True when `entry` allows `hit`. */
export function allows(entry: AllowEntry, hit: Hit): boolean {
  const where = entry.where.endsWith('/*')
    ? hit.where.startsWith(entry.where.slice(0, -1))
    : hit.where === entry.where;
  return where && (entry.match === '*' || entry.match === hit.match);
}

export interface Hit {
  /** `en/…` or `de/…` plus the content path. */
  where: string;
  match: string;
  text: string;
}

/** Every cue hit in `locale`'s content as a boy reads it. */
export function auditHits(locale: Locale): Hit[] {
  const hits: Hit[] = [];
  const cues = cuesFor(locale);
  for (const [path, text] of contentStrings(locale, 'boy'))
    for (const cue of cues)
      if (cue.re.test(text))
        hits.push({ where: `${locale}/${path}`, match: cue.id, text });
  return hits;
}

/** Top-level module of a path (`contacts/jess`, `sites/friendspace.example`, `mail`). */
export const moduleOf = (where: string): string => {
  const [, area = '', sub] = where.split('/');
  const top = area.replace(/\[\d+\]$/, '');
  return top === 'contacts' || top === 'sites' ? `${top}/${sub}` : top;
};

export interface ModuleNumbers {
  /** Readable strings as a boy gets them. */
  strings: number;
  /** Of those, how many read differently for a girl. */
  differ: number;
  /** Cue hits on the boy side. */
  hits: number;
}

/** Per module of `locale`: strings, strings that differ by gender, and boy-side cue hits. */
export function auditNumbers(locale: Locale): Record<string, ModuleNumbers> {
  const girl = contentStrings(locale, 'girl');
  const out: Record<string, ModuleNumbers> = {};
  const row = (path: string) =>
    (out[moduleOf(path)] ??= { strings: 0, differ: 0, hits: 0 });
  for (const [path, text] of contentStrings(locale, 'boy')) {
    const r = row(`${locale}/${path}`);
    r.strings++;
    if (girl.get(path) !== text) r.differ++;
  }
  for (const hit of auditHits(locale)) row(hit.where).hits++;
  return out;
}
