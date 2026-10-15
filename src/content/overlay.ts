// Merging a contact's text overlay (another language's lines) over the English contact. Kept
// apart from `locale.ts` so the lazily loaded German bundle can use it without a cycle.
import type {
  Choice,
  ContactContent,
  ContactLine,
  ContactOverlay,
  NodeOverlay,
  Script,
  ScriptNode,
} from './types';

// ---------------------------------------------------------------------------

/** Overlay text, or `undefined` when it is missing/empty (the English text is used). */
const given = (text: string | undefined): string | undefined =>
  text === undefined || text === '' ? undefined : text;

function mergeLine(
  line: ContactLine,
  index: number,
  node: NodeOverlay | undefined,
): ContactLine {
  const text = line.text === undefined ? undefined : given(node?.lines[index]);
  const pm =
    line.personalMessageChange === undefined
      ? undefined
      : given(node?.personalMessages?.[index]);
  if (text === undefined && pm === undefined) return line;
  return {
    ...line,
    ...(text !== undefined ? { text } : {}),
    ...(pm !== undefined ? { personalMessageChange: pm } : {}),
  };
}

function mergeChoice(
  choice: Choice,
  index: number,
  node: NodeOverlay | undefined,
): Choice {
  const over = node?.choices?.[index];
  const text = given(over?.text);
  const label = given(over?.label);
  if (text === undefined && label === undefined) return choice;
  return {
    ...choice,
    ...(text !== undefined ? { text } : {}),
    ...(label !== undefined ? { label } : {}),
  };
}

function mergeNode(
  node: ScriptNode,
  over: NodeOverlay | undefined,
): ScriptNode {
  if (!over) return node;
  const lines = node.lines.map((l, i) => mergeLine(l, i, over));
  if (!('choices' in node)) return { ...node, lines };
  return {
    ...node,
    lines,
    choices: node.choices.map((c, i) =>
      mergeChoice(c, i, over),
    ) as unknown as typeof node.choices,
  };
}

function mergeScript(script: Script, overlay: ContactOverlay): Script {
  const nodes = overlay.scripts[script.id];
  if (!nodes) return script;
  return {
    ...script,
    nodes: Object.fromEntries(
      Object.entries(script.nodes).map(([id, node]) => [
        id,
        mergeNode(node, nodes[id]),
      ]),
    ),
  };
}

/**
 * A full contact in the overlay's language: only text is replaced, and any text the overlay
 * lacks stays English. Delays, triggers, actions and the node graph always come from `content`.
 */
export function mergeOverlay(
  content: ContactContent,
  overlay: ContactOverlay | undefined,
): ContactContent {
  if (!overlay) return content;
  const { contact } = content;
  const days = contact.days
    ? Object.fromEntries(
        Object.entries(contact.days).map(([day, presence]) => {
          const pm =
            presence?.personalMessage === undefined
              ? undefined
              : given(overlay.days?.[Number(day)]?.personalMessage);
          return [
            day,
            pm === undefined ? presence : { ...presence, personalMessage: pm },
          ];
        }),
      )
    : undefined;
  const awayReply =
    contact.awayReply === undefined ? undefined : given(overlay.awayReply);
  return {
    contact: {
      ...contact,
      displayName: given(overlay.displayName) ?? contact.displayName,
      personalMessage:
        given(overlay.personalMessage) ?? contact.personalMessage,
      ...(days ? { days } : {}),
      ...(awayReply !== undefined ? { awayReply } : {}),
    },
    scripts: content.scripts.map((s) => mergeScript(s, overlay)),
  };
}

/**
 * Paths of every English text a merge would fall back to (empty = fully translated). For tests
 * and the P2 fallback check; `displayName` is optional and never reported.
 */
export function overlayFallbacks(
  content: ContactContent,
  overlay: ContactOverlay | undefined,
): string[] {
  const id = content.contact.id;
  const out: string[] = [];
  const miss = (text: string | undefined, path: string) => {
    if (given(text) === undefined) out.push(`${id}.${path}`);
  };
  miss(overlay?.personalMessage, 'personalMessage');
  if (content.contact.awayReply !== undefined)
    miss(overlay?.awayReply, 'awayReply');
  for (const [day, presence] of Object.entries(content.contact.days ?? {})) {
    if (presence?.personalMessage !== undefined)
      miss(
        overlay?.days?.[Number(day)]?.personalMessage,
        `days.${day}.personalMessage`,
      );
  }
  for (const script of content.scripts) {
    for (const [nodeId, node] of Object.entries(script.nodes)) {
      const over = overlay?.scripts[script.id]?.[nodeId];
      const at = `${script.id}.${nodeId}`;
      node.lines.forEach((line, i) => {
        if (line.text !== undefined) miss(over?.lines[i], `${at}.lines[${i}]`);
        if (line.personalMessageChange !== undefined)
          miss(over?.personalMessages?.[i], `${at}.personalMessages[${i}]`);
      });
      if ('choices' in node)
        node.choices.forEach((choice, i) => {
          miss(over?.choices?.[i]?.text, `${at}.choices[${i}].text`);
          if (choice.label !== undefined)
            miss(over?.choices?.[i]?.label, `${at}.choices[${i}].label`);
        });
    }
  }
  return out;
}
