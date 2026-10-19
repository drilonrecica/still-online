// P0-03: the Top 8 diff `saveProfile` sends to Messenger.
import { describe, expect, it } from 'vitest';
import type { PlayerTopEntry } from '@/content/friendspace/types';
import {
  DEFAULT_TOP8_CONTACTS,
  savedTop8Contacts,
  top8Diff,
} from './top8Drama';

const c = (id: string): PlayerTopEntry => ({ kind: 'contact', id });

describe('top8Diff', () => {
  it('lists dropped and added friends; reordering changes nothing', () => {
    expect(top8Diff(['jess', 'kayla', 'pia'], [c('pia'), c('jess')])).toEqual({
      dropped: ['kayla'],
      added: [],
    });
    expect(top8Diff(['jess'], [c('jess'), c('theo')])).toEqual({
      dropped: [],
      added: ['theo'],
    });
    expect(top8Diff(['jess', 'pia'], [c('pia'), c('jess')])).toEqual({
      dropped: [],
      added: [],
    });
  });

  it('ignores bands and extras, and counts a duplicate once', () => {
    const after: PlayerTopEntry[] = [
      { kind: 'band', id: 'tinfoil-comets' },
      { kind: 'extra', name: 'xXskaterXx', seed: 's' },
      c('dex'),
      c('dex'),
    ];
    expect(top8Diff([], after)).toEqual({ dropped: [], added: ['dex'] });
  });

  it('a never-saved Top 8 counts as the default one (every friend)', () => {
    expect(savedTop8Contacts(undefined)).toEqual(DEFAULT_TOP8_CONTACTS);
    expect(DEFAULT_TOP8_CONTACTS).toContain('kayla');
    expect(savedTop8Contacts([c('jess')])).toEqual(['jess']);
  });
});
