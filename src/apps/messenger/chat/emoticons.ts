// Emoticon parser: splits message text into plain text and emoticon segments. Original SVGs.
import grin from '@/assets/emoticons/grin.svg';
import heart from '@/assets/emoticons/heart.svg';
import sad from '@/assets/emoticons/sad.svg';
import smile from '@/assets/emoticons/smile.svg';
import surprised from '@/assets/emoticons/surprised.svg';
import thumbsDown from '@/assets/emoticons/thumbs-down.svg';
import thumbsUp from '@/assets/emoticons/thumbs-up.svg';
import tongue from '@/assets/emoticons/tongue.svg';
import wink from '@/assets/emoticons/wink.svg';

export interface Emoticon {
  name: string;
  src: string;
  /** Typed codes, case-insensitive. */
  codes: readonly string[];
}

export const EMOTICONS: readonly Emoticon[] = [
  { name: 'Smile', src: smile, codes: [':)'] },
  { name: 'Sad', src: sad, codes: [':('] },
  { name: 'Big smile', src: grin, codes: [':D'] },
  { name: 'Wink', src: wink, codes: [';)'] },
  { name: 'Tongue out', src: tongue, codes: [':P'] },
  { name: 'Surprised', src: surprised, codes: [':O'] },
  { name: 'Thumbs up', src: thumbsUp, codes: ['(Y)'] },
  { name: 'Thumbs down', src: thumbsDown, codes: ['(N)'] },
  { name: 'Heart', src: heart, codes: ['<3', '(L)'] },
];

export type Segment =
  | { kind: 'text'; text: string }
  /** `code` is the text as typed, e.g. `:p`. */
  | { kind: 'emoticon'; code: string; emoticon: Emoticon };

const byCode = new Map(
  EMOTICONS.flatMap((e) => e.codes.map((c) => [c.toUpperCase(), e] as const)),
);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp([...byCode.keys()].map(escape).join('|'), 'gi');

export function parseEmoticons(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    const code = match[0];
    const emoticon = byCode.get(code.toUpperCase());
    if (!emoticon) continue;
    if (match.index > last)
      segments.push({ kind: 'text', text: text.slice(last, match.index) });
    segments.push({ kind: 'emoticon', code, emoticon });
    last = match.index + code.length;
  }
  if (last < text.length)
    segments.push({ kind: 'text', text: text.slice(last) });
  return segments;
}
