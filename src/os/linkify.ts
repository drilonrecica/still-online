// Finds fictional `*.example` links in plain text so apps can render them as clickable links.

export type LinkSegment =
  | { kind: 'text'; text: string }
  /** `text` is as typed; `url` is normalised to `http://…`. */
  | { kind: 'link'; text: string; url: string };

const LINK =
  /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.example(?:\/[^\s]*)?/gi;
/** Sentence punctuation that follows a link but isn't part of it. */
const TRAILING = /[.,;:!?)"']+$/;

/** Splits text into plain-text and `*.example` link segments. */
export function splitLinks(text: string): LinkSegment[] {
  const out: LinkSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const raw = m[0].replace(TRAILING, '');
    // Don't link inside an email address (`kim@livemail.example`).
    if (m.index > 0 && text[m.index - 1] === '@') continue;
    if (m.index > last)
      out.push({ kind: 'text', text: text.slice(last, m.index) });
    out.push({
      kind: 'link',
      text: raw,
      url: /^https?:\/\//i.test(raw) ? raw : `http://${raw}`,
    });
    last = m.index + raw.length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}
