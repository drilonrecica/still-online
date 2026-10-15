// Emoticon parser: splits message text into plain text and emoticon segments. Original SVGs.
import type { CustomEmoticon } from '@/content/types';
import cat from '@/assets/emoticons/cat.svg';
import dog from '@/assets/emoticons/dog.svg';
import grin from '@/assets/emoticons/grin.svg';
import heart from '@/assets/emoticons/heart.svg';
import music from '@/assets/emoticons/music.svg';
import party from '@/assets/emoticons/party.svg';
import pizza from '@/assets/emoticons/pizza.svg';
import sad from '@/assets/emoticons/sad.svg';
import smile from '@/assets/emoticons/smile.svg';
import sun from '@/assets/emoticons/sun.svg';
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
  /** Set for player-made emoticons: the My Pictures file shown instead of `src`. */
  fileId?: string;
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
  { name: 'Dog', src: dog, codes: ['(dog)'] },
  { name: 'Cat', src: cat, codes: ['(cat)'] },
  { name: 'Music', src: music, codes: ['(music)', '(8)'] },
  { name: 'Pizza', src: pizza, codes: ['(pizza)', '(pi)'] },
  { name: 'Party', src: party, codes: ['(party)', '<:o)'] },
  { name: 'Sun', src: sun, codes: ['(sun)', '(#)'] },
];

export type Segment =
  | { kind: 'text'; text: string }
  /** `code` is the text as typed, e.g. `:p`. */
  | { kind: 'emoticon'; code: string; emoticon: Emoticon };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface Matcher {
  byCode: Map<string, Emoticon>;
  pattern: RegExp;
}

function matcher(emoticons: readonly Emoticon[]): Matcher {
  const byCode = new Map(
    emoticons.flatMap((e) => e.codes.map((c) => [c.toUpperCase(), e] as const)),
  );
  // Longest first, so a code is never cut short by a shorter one sharing its start.
  const codes = [...byCode.keys()].sort((a, b) => b.length - a.length);
  return { byCode, pattern: new RegExp(codes.map(escape).join('|'), 'gi') };
}

const BUILT_IN = matcher(EMOTICONS);
const NO_CUSTOM: readonly CustomEmoticon[] = [];

/** Splits `text`; `custom` (the player's own emoticons) is recognised alongside the built-ins. */
export function parseEmoticons(
  text: string,
  custom: readonly CustomEmoticon[] = NO_CUSTOM,
): Segment[] {
  const { byCode, pattern } =
    custom.length === 0
      ? BUILT_IN
      : matcher([
          ...EMOTICONS,
          ...custom.map((e) => ({
            name: e.code,
            src: '',
            codes: [e.code],
            fileId: e.fileId,
          })),
        ]);
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
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
