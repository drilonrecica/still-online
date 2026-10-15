import { beforeEach, describe, expect, it } from 'vitest';
import { exampleContact } from '@/content/example.fixture';
import type { ContactProgress } from '@/content/types';
import { storageKey } from '@/os/persist';
import { createMessengerStore } from '../store';
import {
  defaultContactProgress,
  defaultProgress,
  reconcileContact,
  sanitizeProgress,
} from './progress';

const valid = (): ContactProgress => ({
  ...defaultContactProgress(exampleContact.contact),
  everSignedIn: true,
  active: {
    scriptId: 'opening',
    nodeId: 'hi',
    lineIndex: 1,
    awaitingChoice: false,
    context: { trackId: 't1', artist: 'A', title: 'T' },
  },
  queue: [{ scriptId: 'nudged', context: {} }],
  scripts: { opening: { runs: 0, visited: ['hi'], trackIds: [] } },
  transcript: [
    { kind: 'message', from: 'contact', text: 'hi', at: 1 },
    { kind: 'nudge', from: 'player', at: 2 },
  ],
  unread: 3,
});

beforeEach(() => localStorage.clear());

describe('sanitizeProgress', () => {
  it('keeps valid progress unchanged', () => {
    const p = {
      player: {
        status: 'away' as const,
        personalMessage: '♫ Band - Song',
        showNowPlaying: true,
        personalMessageBeforeNowPlaying: 'hi',
        awayMessage: 'brb',
        autoAway: true,
        awaySince: 1000,
      },
      contacts: { mika: valid() },
    };
    expect(sanitizeProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });

  it.each([null, 42, 'x', [], { player: 1, contacts: [] }])(
    'falls back to defaults for %j',
    (v) => {
      expect(sanitizeProgress(v)).toEqual(defaultProgress());
    },
  );

  it.each([
    [3, 3],
    [undefined, 1],
    [0, 1],
    [-2, 1],
    [2.5, 1],
    ['4', 1],
  ])('presenceDay %j sanitizes to %j', (presenceDay, expected) => {
    const p = sanitizeProgress({
      contacts: { mika: { ...valid(), presenceDay } },
    });
    expect(p.contacts.mika?.presenceDay).toBe(expected);
  });

  it('drops broken contacts and invalid list items', () => {
    const p = sanitizeProgress({
      player: { status: 'sleepy' },
      contacts: {
        broken: { status: 'online' },
        mika: {
          ...valid(),
          active: { scriptId: 7 },
          queue: [{ scriptId: 'ok' }, { nope: true }, 'x'],
          scripts: { a: { runs: -1 }, b: { runs: 2, visited: ['n', 3] } },
          transcript: [
            { kind: 'message', from: 'contact', at: 1 },
            { kind: 'nudge', from: 'contact', at: 5 },
          ],
          unread: 'many',
        },
      },
    });
    expect(p.player).toEqual(defaultProgress().player);
    expect(Object.keys(p.contacts)).toEqual(['mika']);
    expect(p.contacts.mika).toMatchObject({
      active: null,
      queue: [{ scriptId: 'ok', context: {} }],
      scripts: { b: { runs: 2, visited: ['n'], trackIds: [] } },
      transcript: [{ kind: 'nudge', from: 'contact', at: 5 }],
      unread: 0,
    });
  });
});

describe('reconcileContact', () => {
  const scripts = exampleContact.scripts;

  it('keeps matching progress', () => {
    expect(reconcileContact(valid(), scripts)).toEqual(valid());
  });

  it('drops an active script whose node or line no longer exists', () => {
    const base = valid();
    expect(
      reconcileContact(
        { ...base, active: { ...base.active!, nodeId: 'gone' } },
        scripts,
      ).active,
    ).toBeNull();
    expect(
      reconcileContact(
        { ...base, active: { ...base.active!, lineIndex: 9 } },
        scripts,
      ).active,
    ).toBeNull();
  });

  it('fixes awaitingChoice on an end node and moves lineIndex past the lines of a choices node', () => {
    const base = valid();
    const onEnd = reconcileContact(
      {
        ...base,
        active: {
          ...base.active!,
          nodeId: 'yes',
          lineIndex: 2,
          awaitingChoice: true,
        },
      },
      scripts,
    );
    expect(onEnd.active).toMatchObject({ awaitingChoice: false, lineIndex: 2 });
    const onChoices = reconcileContact(
      {
        ...base,
        active: { ...base.active!, lineIndex: 0, awaitingChoice: true },
      },
      scripts,
    );
    expect(onChoices.active).toMatchObject({
      awaitingChoice: true,
      lineIndex: 2,
    });
  });
});

describe('messenger store', () => {
  it('persists only progress and round-trips it', () => {
    const a = createMessengerStore();
    a.getState().setPlayerStatus('away');
    a.getState().setPlayerPersonalMessage('brb');
    a.getState().setShowNowPlaying(true);
    a.setState({ signedIn: true, online: { mika: true } });
    const saved = JSON.parse(localStorage.getItem(storageKey('messenger'))!);
    expect(saved.version).toBe(1);
    expect(Object.keys(saved.state)).toEqual(['progress']);

    const b = createMessengerStore();
    expect(b.getState().progress.player).toEqual({
      status: 'away',
      personalMessage: 'brb',
      showNowPlaying: true,
      personalMessageBeforeNowPlaying: null,
      awayMessage: '',
      autoAway: false,
      awaySince: expect.any(Number),
    });
    expect(b.getState()).toMatchObject({
      signedIn: false,
      online: {},
      typing: {},
    });
  });

  it('falls back to defaults on corrupt storage', () => {
    localStorage.setItem(storageKey('messenger'), '{not json');
    expect(createMessengerStore().getState().progress).toEqual(
      defaultProgress(),
    );
    localStorage.setItem(
      storageKey('messenger'),
      JSON.stringify({ state: { progress: 5 }, version: 1 }),
    );
    expect(createMessengerStore().getState().progress).toEqual(
      defaultProgress(),
    );
  });

  it('markRead clears unread and ignores unknown contacts', () => {
    const s = createMessengerStore();
    s.setState({
      progress: { ...defaultProgress(), contacts: { mika: valid() } },
    });
    s.getState().markRead('nobody');
    s.getState().markRead('mika');
    expect(s.getState().progress.contacts.mika?.unread).toBe(0);
  });
});
