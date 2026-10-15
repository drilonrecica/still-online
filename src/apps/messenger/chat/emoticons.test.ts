import { describe, expect, it } from 'vitest';
import { translate } from '@/i18n/t';
import { EMOTICONS, parseEmoticons, type Segment } from './emoticons';

/** `text` segments as-is, emoticons as `[Name]`. */
const show = (segments: Segment[]) =>
  segments
    .map((s) =>
      s.kind === 'text'
        ? s.text
        : `[${s.emoticon.nameKey ? translate('en', s.emoticon.nameKey) : s.emoticon.codes[0]}]`,
    )
    .join('');

describe('parseEmoticons', () => {
  it('returns plain text as one segment', () => {
    expect(parseEmoticons('hey whats up')).toEqual([
      { kind: 'text', text: 'hey whats up' },
    ]);
    expect(parseEmoticons('')).toEqual([]);
  });

  it('recognises every required code', () => {
    const codes = [
      ':)',
      ':(',
      ':D',
      ';)',
      ':P',
      ':O',
      '(Y)',
      '(N)',
      '<3',
      '(L)',
    ];
    for (const code of codes) {
      const [segment, ...rest] = parseEmoticons(code);
      expect(rest).toEqual([]);
      expect(segment).toMatchObject({ kind: 'emoticon', code });
    }
  });

  it('maps codes to emoticons; <3 and (L) are both the heart', () => {
    expect(show(parseEmoticons(':) :( :D ;) :P :O (Y) (N) <3 (L)'))).toBe(
      '[Smile] [Sad] [Big smile] [Wink] [Tongue out] [Surprised] [Thumbs up] [Thumbs down] [Heart] [Heart]',
    );
  });

  it('is case-insensitive and keeps the typed code', () => {
    const segments = parseEmoticons('lol :p (y) :d (l)');
    expect(show(segments)).toBe(
      'lol [Tongue out] [Thumbs up] [Big smile] [Heart]',
    );
    expect(segments[1]).toMatchObject({ code: ':p' });
  });

  it('splits around emoticons, including adjacent ones and text edges', () => {
    expect(show(parseEmoticons(':)hi:(:('))).toBe('[Smile]hi[Sad][Sad]');
    expect(show(parseEmoticons('see u 2morrow!! <3<3'))).toBe(
      'see u 2morrow!! [Heart][Heart]',
    );
  });

  it('leaves near-misses alone', () => {
    expect(show(parseEmoticons(': ) (Q) < 3 (yes)'))).toBe(': ) (Q) < 3 (yes)');
  });

  it('gives every emoticon a picture', () => {
    for (const e of EMOTICONS) expect(e.src).toBeTruthy();
  });

  it('recognises the six new built-ins and their alternate codes', () => {
    const names: Record<string, string> = {
      '(dog)': 'Dog',
      '(cat)': 'Cat',
      '(music)': 'Music',
      '(8)': 'Music',
      '(pizza)': 'Pizza',
      '(pi)': 'Pizza',
      '(party)': 'Party',
      '<:o)': 'Party',
      '(sun)': 'Sun',
      '(#)': 'Sun',
    };
    for (const [code, name] of Object.entries(names))
      expect(show(parseEmoticons(`a ${code} b`))).toBe(`a [${name}] b`);
  });

  it('parses custom codes case-insensitively alongside built-ins', () => {
    const custom = [{ code: '[ponies]', fileId: 'f1' }];
    const segments = parseEmoticons('so [PONIES] :)', custom);
    expect(show(segments)).toBe('so [[ponies]] [Smile]');
    expect(segments[1]).toMatchObject({
      code: '[PONIES]',
      emoticon: { fileId: 'f1' },
    });
    // Without the list the code stays text.
    expect(show(parseEmoticons('[ponies]'))).toBe('[ponies]');
  });
});
