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
  personalMessage: {
    kind: 'line',
    scriptId: 'opening',
    nodeId: 'hi',
    lineIndex: 0,
    params: { trackId: 't1' },
  },
  transcript: [
    {
      kind: 'line',
      from: 'contact',
      scriptId: 'opening',
      nodeId: 'hi',
      lineIndex: 0,
      params: { game: 'mines', score: 12 },
      at: 1,
      whileAway: true,
    },
    {
      kind: 'choice',
      from: 'player',
      scriptId: 'opening',
      nodeId: 'hi',
      choiceIndex: 1,
      flavor: ':)',
      at: 2,
    },
    { kind: 'awayReply', from: 'contact', at: 3 },
    { kind: 'typed', from: 'player', text: 'hey', at: 4 },
    { kind: 'message', from: 'contact', text: 'v0.2 text', at: 5 },
    { kind: 'nudge', from: 'player', at: 6 },
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
        awayMessage: 'at practice',
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

  it.each([
    [4, 4],
    [0, undefined],
    [1.5, undefined],
    ['2', undefined],
  ])('a script day %j sanitizes to %j', (day, expected) => {
    const p = sanitizeProgress({
      contacts: {
        mika: {
          ...valid(),
          scripts: { opening: { runs: 1, visited: [], trackIds: [], day } },
        },
      },
    });
    expect(p.contacts.mika?.scripts.opening?.day).toBe(expected);
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

describe('sanitizeProgress: v0.2 saves', () => {
  it('keeps text entries verbatim and turns a text personal message into a literal', () => {
    const legacy = {
      ...valid(),
      personalMessage: 'lake trip minus Alex :(',
      transcript: [
        { kind: 'message', from: 'contact', text: 'hi Alex', at: 1 },
        { kind: 'message', from: 'player', text: 'yo', at: 2 },
        {
          kind: 'message',
          from: 'contact',
          text: 'u there?',
          at: 3,
          whileAway: true,
        },
      ],
    };
    const p = sanitizeProgress({ contacts: { mika: legacy } });
    expect(p.contacts.mika?.personalMessage).toEqual({
      kind: 'literal',
      text: 'lake trip minus Alex :(',
    });
    expect(p.contacts.mika?.transcript).toEqual(legacy.transcript);
  });

  it("turns the old English default away message 'brb' into the localized default", () => {
    const player = (awayMessage: unknown) =>
      sanitizeProgress({ player: { status: 'away', awayMessage } }).player
        .awayMessage;
    expect(player('brb')).toBeNull();
    expect(player(undefined)).toBeNull();
    expect(player('at lunch')).toBe('at lunch');
    expect(player('')).toBe('');
  });

  it('drops malformed references', () => {
    const p = sanitizeProgress({
      contacts: {
        mika: {
          ...valid(),
          transcript: [
            { kind: 'line', from: 'contact', scriptId: 'a', at: 1 },
            {
              kind: 'line',
              from: 'player',
              scriptId: 'a',
              nodeId: 'n',
              lineIndex: 0,
              at: 1,
            },
            {
              kind: 'choice',
              from: 'player',
              scriptId: 'a',
              nodeId: 'n',
              choiceIndex: -1,
              at: 1,
            },
            { kind: 'typed', from: 'contact', text: 'x', at: 1 },
            {
              kind: 'line',
              from: 'contact',
              scriptId: 'a',
              nodeId: 'n',
              lineIndex: 0,
              params: { game: 'tetris', score: 'lots', trackId: 'x' },
              at: 2,
            },
          ],
        },
        broken: { ...valid(), personalMessage: { kind: 'day' } },
      },
    });
    expect(Object.keys(p.contacts)).toEqual(['mika']);
    expect(p.contacts.mika?.transcript).toEqual([
      {
        kind: 'line',
        from: 'contact',
        scriptId: 'a',
        nodeId: 'n',
        lineIndex: 0,
        params: { trackId: 'x' },
        at: 2,
      },
    ]);
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
      awayMessage: null,
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
