import { describe, expect, it } from 'vitest';
import { EMOTICONS, parseEmoticons, type Segment } from './emoticons';

/** `text` segments as-is, emoticons as `[Name]`. */
const show = (segments: Segment[]) =>
  segments
    .map((s) => (s.kind === 'text' ? s.text : `[${s.emoticon.name}]`))
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
});
