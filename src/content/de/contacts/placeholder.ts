// Week-two placeholders (v0.5 rules → German): overlays copied from the English scripts and day
// presence, so parity and the fallback check hold while German shows English. Same ids, lines,
// choices and personal messages; '' for a line without text.
// W3 replaces this with German
import type { Contact, ContactOverlay, NodeOverlay, Script } from '../../types';

/** A text overlay for `scripts` that repeats their English text. */
export function placeholderScripts(
  scripts: readonly Script[],
): ContactOverlay['scripts'] {
  return Object.fromEntries(
    scripts.map((s) => [
      s.id,
      Object.fromEntries(
        Object.entries(s.nodes).map(([id, node]): [string, NodeOverlay] => {
          const personalMessages = Object.fromEntries(
            node.lines.flatMap((l, i) =>
              l.personalMessageChange === undefined
                ? []
                : [[i, l.personalMessageChange]],
            ),
          );
          return [
            id,
            {
              lines: node.lines.map((l) => l.text ?? ''),
              ...('choices' in node
                ? {
                    choices: node.choices.map((c) => ({
                      text: c.text,
                      ...(c.label !== undefined ? { label: c.label } : {}),
                    })),
                  }
                : {}),
              ...(Object.keys(personalMessages).length
                ? { personalMessages }
                : {}),
            },
          ];
        }),
      ),
    ]),
  );
}

/** A presence overlay for `days` that repeats their English personal messages. */
export function placeholderDays(days: Contact['days']): ContactOverlay['days'] {
  return Object.fromEntries(
    Object.entries(days ?? {}).flatMap(([day, presence]) =>
      presence?.personalMessage === undefined
        ? []
        : [[day, { personalMessage: presence.personalMessage }]],
    ),
  );
}
