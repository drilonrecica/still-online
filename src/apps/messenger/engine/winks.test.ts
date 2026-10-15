import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Script } from '@/content/types';
import { sanitizeProgress } from './progress';
import { contactContent, line, setup } from './test-helpers';

const winker: Script = {
  id: 'w',
  trigger: { type: 'onSignIn' },
  start: 'a',
  nodes: {
    a: {
      lines: [
        line('look', 0, { nudge: true, wink: 'hamster', statusChange: 'busy' }),
        line(undefined, 100, { wink: 'pickle' }),
      ],
      end: true,
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('winks in the engine', () => {
  it('a contact line sends its wink after the nudge, before the status', () => {
    const t = setup([contactContent('lena', [winker])]);
    t.engine.signIn();
    vi.advanceTimersByTime(160); // typing "look"
    expect(t.take()).toEqual([
      'signedIn lena online',
      'start lena/w',
      'typing lena',
      'typingStop lena',
      '< lena: look',
      'nudge contact lena',
      'wink contact lena hamster',
      'status lena busy',
    ]);
    vi.advanceTimersByTime(100);
    expect(t.take()).toEqual(['wink contact lena pickle', 'end lena/w']);
    expect(t.said('lena')).toEqual([
      '< look',
      'nudge contact',
      'wink contact hamster',
      'wink contact pickle',
    ]);
    expect(t.progress('lena').transcript[2]).toEqual({
      kind: 'wink',
      from: 'contact',
      wink: 'hamster',
      at: new Date('2026-10-14T12:00:00.160Z').getTime(),
    });
  });

  it('a text-less wink line does not count as unread', () => {
    const t = setup([contactContent('lena', [winker])]);
    t.engine.signIn();
    vi.advanceTimersByTime(1000);
    expect(t.progress('lena').unread).toBe(1);
  });

  it('playerWink adds a transcript entry and emits, only while signed in', () => {
    const t = setup([contactContent('lena', [])]);
    t.engine.playerWink('lena', 'kiss');
    expect(t.take()).toEqual([]);
    t.engine.signIn();
    t.take();
    t.engine.playerWink('lena', 'kiss');
    t.engine.playerWink('nobody', 'kiss');
    expect(t.take()).toEqual(['wink player lena kiss']);
    expect(t.said('lena')).toEqual(['wink player kiss']);
  });

  it('sanitize keeps known winks and drops unknown ones', () => {
    const at = 1;
    const p = sanitizeProgress({
      contacts: {
        lena: {
          everSignedIn: true,
          status: 'online',
          personalMessage: '',
          transcript: [
            { kind: 'wink', from: 'player', wink: 'fireworks', at },
            { kind: 'wink', from: 'contact', wink: 'disco', at },
            { kind: 'wink', from: 'someone', wink: 'kiss', at },
            { kind: 'wink', from: 'contact', at },
          ],
        },
      },
    });
    expect(p.contacts.lena?.transcript).toEqual([
      { kind: 'wink', from: 'player', wink: 'fireworks', at },
    ]);
  });
});
