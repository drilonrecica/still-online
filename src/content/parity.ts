// Structural parity between English content and another locale (docs/i18n.md → "Structural
// parity"). Localize inside a line, never add or remove one: old transcripts store
// `(scriptId, nodeId, lineIndex)` and must re-render in either language. Parity compares the raw
// (unresolved) modules; gender variants are not placeholders, so tokens are taken per side.
import { GENDERS, resolveGender } from './gender';
import type { ContactContent, ContactOverlay } from './types';

const PLACEHOLDER = /\{[^}]*\}/g;

/**
 * Placeholder tokens in `text`, sorted, so "{a} {b}" and "{b} {a}" match. Taken per gender side
 * (`"girl | boy"` when the sides differ), so a `g()` variant counts once per side.
 */
const tokens = (text: string | undefined) => {
  const [girl, boy] = GENDERS.map((gender) =>
    (resolveGender(text ?? '', gender).match(PLACEHOLDER) ?? [])
      .sort()
      .join(' '),
  );
  return girl === boy ? girl : `${girl} | ${boy}`;
};

/** Problems with one contact overlay; an empty overlay has none. */
export function contactParityProblems(
  content: ContactContent,
  overlay: ContactOverlay,
): string[] {
  const id = content.contact.id;
  const problems: string[] = [];
  const at = (msg: string) => problems.push(`${id}: ${msg}`);
  const samePlaceholders = (
    en: string | undefined,
    other: string | undefined,
    path: string,
  ) => {
    if (other === undefined || other === '') return;
    if (tokens(en) !== tokens(other))
      at(
        `${path} placeholders "${tokens(other)}" differ from English "${tokens(en)}"`,
      );
  };

  const { contact } = content;
  samePlaceholders(
    contact.personalMessage,
    overlay.personalMessage,
    'personalMessage',
  );
  if (overlay.awayReply !== undefined && contact.awayReply === undefined)
    at('awayReply has no English awayReply');
  samePlaceholders(contact.awayReply, overlay.awayReply, 'awayReply');
  for (const [day, presence] of Object.entries(overlay.days ?? {})) {
    const en = contact.days?.[Number(day)]?.personalMessage;
    if (presence?.personalMessage === undefined) continue;
    if (en === undefined) at(`days.${day} has no English personal message`);
    samePlaceholders(
      en,
      presence.personalMessage,
      `days.${day}.personalMessage`,
    );
  }

  for (const [scriptId, nodes] of Object.entries(overlay.scripts)) {
    const script = content.scripts.find((s) => s.id === scriptId);
    if (!script) {
      at(`script "${scriptId}" doesn't exist in English`);
      continue;
    }
    for (const [nodeId, over] of Object.entries(nodes)) {
      if (!over) continue;
      const node = script.nodes[nodeId];
      const path = `${scriptId}.${nodeId}`;
      if (!node) {
        at(`node "${path}" doesn't exist in English`);
        continue;
      }
      if (over.lines.length !== node.lines.length)
        at(
          `${path} has ${over.lines.length} lines, English has ${node.lines.length}`,
        );
      over.lines.forEach((text, i) => {
        const line = node.lines[i];
        if (line && line.text === undefined && text !== '')
          at(`${path}.lines[${i}] has text but the English line has none`);
        samePlaceholders(line?.text, text, `${path}.lines[${i}]`);
      });
      const enChoices = 'choices' in node ? node.choices : [];
      const choices = over.choices ?? [];
      if (choices.length !== enChoices.length)
        at(
          `${path} has ${choices.length} choices, English has ${enChoices.length}`,
        );
      choices.forEach((c, i) => {
        samePlaceholders(
          enChoices[i]?.text,
          c.text,
          `${path}.choices[${i}].text`,
        );
        samePlaceholders(
          enChoices[i]?.label,
          c.label,
          `${path}.choices[${i}].label`,
        );
      });
      for (const [index, text] of Object.entries(over.personalMessages ?? {})) {
        const line = node.lines[Number(index)];
        if (line?.personalMessageChange === undefined)
          at(
            `${path}.personalMessages[${index}] has no English personalMessageChange`,
          );
        samePlaceholders(
          line?.personalMessageChange,
          text,
          `${path}.personalMessages[${index}]`,
        );
      }
    }
  }
  return problems;
}

const idOf = (v: unknown): unknown =>
  v && typeof v === 'object'
    ? ((v as Record<string, unknown>).id ??
      (v as Record<string, unknown>).contactId)
    : undefined;

/**
 * Problems with a full module of another locale: the same exports, arrays of the same length
 * with the same ids (`id` or `contactId`) in the same order, objects with the same keys, and
 * identical non-text values (hosts stay hosts).
 */
export function moduleParityProblems(
  en: Readonly<Record<string, unknown>>,
  other: Readonly<Record<string, unknown>>,
  name: string,
): string[] {
  const problems: string[] = [];
  const keys = new Set([...Object.keys(en), ...Object.keys(other)]);
  for (const key of keys) {
    const a = en[key];
    const b = other[key];
    const at = `${name}.${key}`;
    if (!(key in other)) problems.push(`${at} is missing`);
    else if (!(key in en)) problems.push(`${at} doesn't exist in English`);
    else if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b))
      problems.push(`${at} has a different type`);
    else if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length)
        problems.push(`${at} has ${b.length} items, English has ${a.length}`);
      else
        a.forEach((item, i) => {
          if (idOf(item) !== idOf(b[i]))
            problems.push(
              `${at}[${i}] id "${String(idOf(b[i]))}" ≠ "${String(idOf(item))}"`,
            );
        });
    } else if (a && typeof a === 'object' && b && typeof b === 'object') {
      const ka = Object.keys(a).sort().join(',');
      const kb = Object.keys(b).sort().join(',');
      if (ka !== kb) problems.push(`${at} keys differ from English`);
    } else if (typeof a !== 'string' && typeof a !== 'function' && a !== b)
      problems.push(`${at} is ${String(b)}, English has ${String(a)}`);
    else if (key.endsWith('_HOST') && a !== b)
      problems.push(`${at} host changed`);
  }
  return problems;
}

/** String fields that are references, not text: ids, script links, hosts and urls. */
const REFERENCE_KEY =
  /\.(?:id|\w+Id|next|start|host|\w+_HOST|url|href|scene|unlock|wink)$/;

/** A photo is drawn content, not a reference: a slot may show another scene per gender (G2-04). */
const GENDERED_PHOTO = /\.photo\.(?:scene|seed)$/;

const kind = (v: unknown) =>
  Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;

/**
 * Problems between the two resolved genders of the same content: identical structure (types,
 * array lengths, object keys) and identical non-text values (ids, days, links, hosts). Only text
 * and photos may differ.
 */
export function genderParityProblems(
  girl: unknown,
  boy: unknown,
  path: string,
): string[] {
  if (kind(girl) !== kind(boy))
    return [`${path}: girl is ${kind(girl)}, boy is ${kind(boy)}`];
  if (typeof girl === 'function' || GENDERED_PHOTO.test(path)) return [];
  if (typeof girl === 'string')
    return girl === boy || !REFERENCE_KEY.test(path)
      ? []
      : [`${path}: girl has ${girl}, boy has ${String(boy)}`];
  if (Array.isArray(girl) && Array.isArray(boy)) {
    if (girl.length !== boy.length)
      return [`${path}: girl has ${girl.length} items, boy has ${boy.length}`];
    return girl.flatMap((v: unknown, i) =>
      genderParityProblems(v, boy[i], `${path}[${i}]`),
    );
  }
  if (girl && typeof girl === 'object' && boy && typeof boy === 'object') {
    const a = girl as Record<string, unknown>;
    const b = boy as Record<string, unknown>;
    if (Object.keys(a).sort().join(',') !== Object.keys(b).sort().join(','))
      return [`${path}: keys differ between girl and boy`];
    return Object.keys(a).flatMap((k) =>
      genderParityProblems(a[k], b[k], `${path}.${k}`),
    );
  }
  return girl === boy
    ? []
    : [`${path}: girl has ${String(girl)}, boy has ${String(boy)}`];
}

/** Keys whose string values are ids, urls or set members, never translated text. */
const NON_TEXT_KEYS = new Set([
  'id',
  'contactId',
  'surveyId',
  'seed',
  'link',
  'scene',
  'skin',
  'side',
  'kind',
  'pos',
  'trackIds',
  'extras',
]);

/**
 * Deep structural parity for the v0.4 modules (bulletins, bands, Top 8 reactions, Pixlog,
 * surveys, layouts): the same array lengths, object keys, numbers (days, seeds) and ids at every
 * level, and the same placeholders in every text. Only the wording may differ.
 */
export function deepParityProblems(
  en: unknown,
  other: unknown,
  path: string,
  textAllowed = true,
): string[] {
  if (Array.isArray(en)) {
    if (!Array.isArray(other)) return [`${path} has a different type`];
    if (en.length !== other.length)
      return [`${path} has ${other.length} items, English has ${en.length}`];
    return en.flatMap((item, i) =>
      deepParityProblems(item, other[i], `${path}[${i}]`, textAllowed),
    );
  }
  if (en && typeof en === 'object') {
    if (!other || typeof other !== 'object' || Array.isArray(other))
      return [`${path} has a different type`];
    const a = en as Record<string, unknown>;
    const b = other as Record<string, unknown>;
    if (Object.keys(a).sort().join(',') !== Object.keys(b).sort().join(','))
      return [`${path} keys differ from English`];
    return Object.keys(a).flatMap((key) =>
      deepParityProblems(
        a[key],
        b[key],
        `${path}.${key}`,
        textAllowed && !NON_TEXT_KEYS.has(key),
      ),
    );
  }
  if (typeof en !== typeof other) return [`${path} has a different type`];
  if (typeof en === 'string' && textAllowed)
    return tokens(en) === tokens(other as string)
      ? []
      : [`${path} placeholders differ from English`];
  return en === other
    ? []
    : [`${path} is ${String(other)}, English has ${String(en)}`];
}
