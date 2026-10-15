// Content lint: checks authored contacts and scripts for mistakes the type system can't catch.
// Each check returns human-readable problems; an empty list means the content is fine.
import {
  CONTENT_UNLOCKS,
  TEXT_PLACEHOLDERS,
  type ContactContent,
  type Script,
  type ScriptNode,
} from './types';

const nextIds = (node: ScriptNode): string[] =>
  'choices' in node ? node.choices.map((c) => c.next) : [];

/** Node ids reachable from the script's start node. */
function reachable(script: Script): Set<string> {
  const seen = new Set<string>();
  const stack = [script.start];
  for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
    const node = script.nodes[id];
    if (seen.has(id) || !node) continue;
    seen.add(id);
    stack.push(...nextIds(node));
  }
  return seen;
}

/** Graph checks: start/next ids exist, every node is reachable and every node can reach an end. */
export function lintScriptGraph(script: Script): string[] {
  const problems: string[] = [];
  const at = (msg: string) => problems.push(`script "${script.id}": ${msg}`);
  if (!script.nodes[script.start]) at(`start node "${script.start}" missing`);

  for (const [id, node] of Object.entries(script.nodes)) {
    for (const next of nextIds(node)) {
      if (!script.nodes[next])
        at(`node "${id}" choice leads to missing "${next}"`);
    }
    if (node.lines.some((line) => line.delayMs < 0))
      at(`node "${id}" has a negative delay`);
  }

  const seen = reachable(script);
  for (const id of Object.keys(script.nodes)) {
    if (!seen.has(id)) at(`node "${id}" is unreachable`);
  }

  // Nodes from which some `end` node can be reached (fixed point over the reverse graph).
  const ends = new Set(
    Object.entries(script.nodes)
      .filter(([, node]) => 'end' in node)
      .map(([id]) => id),
  );
  for (let grew = true; grew;) {
    grew = false;
    for (const [id, node] of Object.entries(script.nodes)) {
      if (!ends.has(id) && nextIds(node).some((n) => ends.has(n))) {
        ends.add(id);
        grew = true;
      }
    }
  }
  for (const id of Object.keys(script.nodes)) {
    if (!ends.has(id)) at(`node "${id}" can never reach an end`);
  }
  return problems;
}

/** Every string in the content, with a path for error messages. */
function strings(value: unknown, path: string): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) =>
      strings(v, `${path}.${k}`),
    );
  }
  return [];
}

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
/** Explicit scheme or `www.` hosts; allowed only when the host ends in `.example`. */
const EXPLICIT_URL = /(?:https?:\/\/|www\.)[^\s/"'<>)]+/gi;
const BARE_URL = /\b[\w-]+\.(?:com|net|org|edu|gov|info|biz|io|tv|uk|de|fr)\b/i;
/** Real product names the UI must not use, and things that don't exist in 2007. */
const FORBIDDEN =
  /\b(?:windows|msn|winamp|myspace|netlog|iphone|smartphone|selfie|DM|app store|hashtag|tweet|streaming)\b/i;
const PLACEHOLDER = /\{[^}]*\}/g;

const isExample = (host: string) => /\.example$/i.test(host);

export interface LintTextOptions {
  /** Placeholder tokens allowed in this text; when omitted, placeholders aren't checked. */
  placeholders?: readonly string[];
}

/**
 * Text checks for any authored string: no real-looking emails/URLs (`.example` is fine),
 * no forbidden names or anachronisms, and only known placeholders when `opts.placeholders` is given.
 */
export function lintText(
  text: string,
  path: string,
  opts: LintTextOptions = {},
): string[] {
  const problems: string[] = [];
  for (const email of text.match(EMAIL) ?? []) {
    if (!isExample(email))
      problems.push(`${path}: real-looking email "${email}"`);
  }
  // Emails contain a dotted domain that would otherwise look like a bare URL.
  const noEmails = text.replace(EMAIL, ' ');
  const explicit = noEmails.match(EXPLICIT_URL) ?? [];
  const realUrl =
    explicit.some((u) => !isExample(u.replace(/[.,;:!?]+$/, ''))) ||
    BARE_URL.test(noEmails);
  if (realUrl) problems.push(`${path}: real-looking URL in "${text}"`);
  if (FORBIDDEN.test(text))
    problems.push(`${path}: forbidden name or anachronism in "${text}"`);
  const { placeholders } = opts;
  if (placeholders) {
    for (const token of text.match(PLACEHOLDER) ?? []) {
      if (!placeholders.includes(token))
        problems.push(`${path}: unknown placeholder ${token}`);
    }
  }
  return problems;
}

/** Runs `lintText` over every string in any content object (no placeholder check). */
export function lintContentStrings(value: unknown, path: string): string[] {
  return strings(value, path).flatMap(([p, text]) => lintText(text, p));
}

/** Text checks for a contact: shared text lint, plus placeholders only where they resolve. */
export function lintContactText(content: ContactContent): string[] {
  const id = content.contact.id;
  const problems = lintContentStrings(content, id);
  const known: readonly string[] = TEXT_PLACEHOLDERS;
  for (const script of content.scripts) {
    const nowPlaying = script.trigger.type === 'onNowPlaying';
    for (const [path, text] of strings(script.nodes, `${id}.${script.id}`)) {
      for (const token of text.match(PLACEHOLDER) ?? []) {
        if (!known.includes(token))
          problems.push(`${path}: unknown placeholder ${token}`);
        else if (!nowPlaying && token !== '{name}') {
          problems.push(
            `${path}: ${token} only resolves in onNowPlaying scripts`,
          );
        }
      }
    }
  }
  return problems;
}

const isDay = (n: number) => Number.isInteger(n) && n >= 2;

/**
 * Day checks: `onDay` days and `days` keys are whole days ≥ 2, `onDay` isn't `repeat`, and
 * presence messages have no placeholders (they aren't resolved, like `personalMessage`).
 */
function lintDays(content: ContactContent): string[] {
  const id = content.contact.id;
  const problems: string[] = [];
  for (const [key, presence] of Object.entries(content.contact.days ?? {})) {
    if (!isDay(Number(key)))
      problems.push(`${id}: days key "${key}" must be a whole day >= 2`);
    const pm = presence?.personalMessage;
    if (pm !== undefined)
      problems.push(
        ...lintText(pm, `${id}.days.${key}.personalMessage`, {
          placeholders: [],
        }).filter((p) => p.includes('placeholder')),
      );
  }
  for (const s of content.scripts) {
    const t = s.trigger;
    if (t.type !== 'onDay') continue;
    if (!isDay(t.day))
      problems.push(`${id}: script "${s.id}" day must be a whole day >= 2`);
    if (s.repeat) problems.push(`${id}: script "${s.id}" onDay can't repeat`);
  }
  return problems;
}

/** Every `unlock` on a line is a known id. */
function lintUnlocks(content: ContactContent): string[] {
  const known: readonly string[] = CONTENT_UNLOCKS;
  return content.scripts.flatMap((s) =>
    Object.entries(s.nodes).flatMap(([nodeId, node]) =>
      node.lines.flatMap((line) =>
        line.unlock === undefined || known.includes(line.unlock)
          ? []
          : [
              `${content.contact.id}: script "${s.id}" node "${nodeId}" unlocks unknown "${line.unlock}"`,
            ],
      ),
    ),
  );
}

/** All checks for one contact, including unique script ids. */
export function lintContact(content: ContactContent): string[] {
  const ids = content.scripts.map((s) => s.id);
  const dupes = ids.filter((s, i) => ids.indexOf(s) !== i);
  const followUps = content.scripts.flatMap((s) => {
    const t = s.trigger;
    if (t.type !== 'afterScript') return [];
    const at = `${content.contact.id}: script "${s.id}"`;
    if (t.scriptId === s.id) return [`${at} follows itself`];
    if (!ids.includes(t.scriptId))
      return [`${at} follows unknown script "${t.scriptId}"`];
    return t.minutes > 0 ? [] : [`${at} needs minutes > 0`];
  });
  return [
    ...dupes.map((s) => `${content.contact.id}: duplicate script id "${s}"`),
    ...followUps,
    ...lintDays(content),
    ...lintUnlocks(content),
    ...content.scripts.flatMap((s) =>
      lintScriptGraph(s).map((p) => `${content.contact.id}: ${p}`),
    ),
    ...lintContactText(content),
  ];
}
