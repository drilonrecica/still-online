// Emoticon parser: splits message text into plain text and emoticon segments. Original SVGs.
import type { CustomEmoticon } from '@/content/types';
import type { MessageKey } from '@/i18n/types';
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
  /** Catalog key of the tooltip name; player-made emoticons have none and show their code. */
  nameKey?: MessageKey;
  src: string;
  /** Typed codes, case-insensitive. */
  codes: readonly string[];
  /** Set for player-made emoticons: the My Pictures file shown instead of `src`. */
  fileId?: string;
}

export const EMOTICONS: readonly Emoticon[] = [
  { nameKey: 'messenger.emoticons.smile', src: smile, codes: [':)'] },
  { nameKey: 'messenger.emoticons.sad', src: sad, codes: [':('] },
  { nameKey: 'messenger.emoticons.grin', src: grin, codes: [':D'] },
  { nameKey: 'messenger.emoticons.wink', src: wink, codes: [';)'] },
  { nameKey: 'messenger.emoticons.tongue', src: tongue, codes: [':P'] },
  { nameKey: 'messenger.emoticons.surprised', src: surprised, codes: [':O'] },
  { nameKey: 'messenger.emoticons.thumbsUp', src: thumbsUp, codes: ['(Y)'] },
  {
    nameKey: 'messenger.emoticons.thumbsDown',
    src: thumbsDown,
    codes: ['(N)'],
  },
  { nameKey: 'messenger.emoticons.heart', src: heart, codes: ['<3', '(L)'] },
  { nameKey: 'messenger.emoticons.dog', src: dog, codes: ['(dog)'] },
  { nameKey: 'messenger.emoticons.cat', src: cat, codes: ['(cat)'] },
  {
    nameKey: 'messenger.emoticons.music',
    src: music,
    codes: ['(music)', '(8)'],
  },
  {
    nameKey: 'messenger.emoticons.pizza',
    src: pizza,
    codes: ['(pizza)', '(pi)'],
  },
  {
    nameKey: 'messenger.emoticons.party',
    src: party,
    codes: ['(party)', '<:o)'],
  },
  { nameKey: 'messenger.emoticons.sun', src: sun, codes: ['(sun)', '(#)'] },
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
