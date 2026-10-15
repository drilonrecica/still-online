// Structural parity between English content and another locale (docs/i18n.md → "Structural
// parity"). Localize inside a line, never add or remove one: old transcripts store
// `(scriptId, nodeId, lineIndex)` and must re-render in either language.
import type { ContactContent, ContactOverlay } from './types';

const PLACEHOLDER = /\{[^}]*\}/g;

/** Placeholder tokens in `text`, sorted, so "{a} {b}" and "{b} {a}" match. */
const tokens = (text: string | undefined) =>
  (text?.match(PLACEHOLDER) ?? []).sort().join(' ');

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
