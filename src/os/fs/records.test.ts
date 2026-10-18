import { describe, expect, it } from 'vitest';
import { systemFolders } from './nodes';
import {
  localizeNodes,
  sanitizeFsState,
  seedLookup,
  toRecord,
  toRecords,
} from './records';
import type { FsNode } from './types';

const T = 1_000;
const poem: FsNode = {
  id: 'seed:poem',
  parentId: 'docs',
  name: 'poem.txt',
  type: 'txt',
  text: 'roses',
  createdAt: T,
  modifiedAt: T,
};
const camp: FsNode = {
  id: 'seed:camp',
  parentId: 'pics',
  name: 'camp.jpg',
  type: 'image',
  photo: { scene: 'camp', seed: 3, caption: 'at camp' },
  createdAt: T,
  modifiedAt: T,
};
const EN = seedLookup([poem, camp]);
// A stand-in for the German seeds (P2 writes the real ones).
const DE = seedLookup([
  { ...poem, name: 'gedicht.txt', text: 'Rosen' },
  {
    ...camp,
    name: 'zeltlager.jpg',
    photo: { ...camp.photo!, caption: 'im Lager' },
  },
]);

const withSeeds = (...extra: FsNode[]) => {
  const nodes = systemFolders(T, 'en');
  for (const n of [poem, camp, ...extra]) nodes[n.id] = n;
  return nodes;
};

describe('localizeNodes', () => {
  it('renders system folders and untouched seeds in the locale', () => {
    const de = localizeNodes(withSeeds(), 'de', 'girl', DE);
    expect(de.docs?.name).toBe('Eigene Dateien');
    expect(de['seed:poem']).toMatchObject({
      name: 'gedicht.txt',
      text: 'Rosen',
    });
    expect(de['seed:camp']?.photo).toEqual({
      scene: 'camp',
      seed: 3,
      caption: 'im Lager',
    });
    const back = localizeNodes(de, 'en', 'girl', EN);
    expect(back).toEqual(withSeeds());
  });

  it('leaves dirty seeds and player files alone, and returns the same object when nothing changes', () => {
    const mine: FsNode = { ...poem, id: 'f:1', name: 'mine.txt' };
    const nodes = withSeeds(mine);
    nodes['seed:poem'] = { ...poem, name: 'renamed.txt', dirty: true };
    const de = localizeNodes(nodes, 'de', 'girl', DE);
    expect(de['seed:poem']?.name).toBe('renamed.txt');
    expect(de['f:1']).toBe(mine);
    expect(localizeNodes(de, 'de', 'girl', DE)).toBe(de);
  });
});

describe('toRecord', () => {
  it('leaves out generated text only', () => {
    const nodes = withSeeds();
    expect(toRecord(nodes.docs!, EN)).not.toHaveProperty('name');
    expect(toRecord(poem, EN)).toEqual({
      id: 'seed:poem',
      parentId: 'docs',
      type: 'txt',
      createdAt: T,
      modifiedAt: T,
    });
    expect(toRecord(camp, EN).photo).toEqual({ scene: 'camp', seed: 3 });
    const dirty = { ...poem, text: 'mine now', dirty: true };
    expect(toRecord(dirty, EN)).toEqual(dirty);
    // A seed whose content is gone keeps its text, so nothing is lost.
    expect(toRecord(poem, seedLookup([]))).toEqual(poem);
  });
});

describe('sanitizeFsState', () => {
  it('round-trips the neutral shape in either language', () => {
    const records = { nodes: toRecords(withSeeds(), EN), purgedSeeds: [] };
    const en = sanitizeFsState(records, T, 'en', 'girl', EN, EN);
    expect(en.nodes).toEqual(withSeeds());
    const de = sanitizeFsState(records, T, 'de', 'girl', DE, EN);
    expect(de.nodes['seed:poem']).toMatchObject({
      name: 'gedicht.txt',
      text: 'Rosen',
    });
    expect(de.nodes.pics?.name).toBe('Eigene Bilder');
  });

  it('migrates v0.2 seeds: English text = untouched, anything else = dirty', () => {
    const v02 = {
      nodes: {
        ...withSeeds(),
        'seed:poem': { ...poem, text: 'my edit' },
      },
    };
    const de = sanitizeFsState(v02, T, 'de', 'girl', DE, EN);
    expect(de.nodes['seed:camp']).toMatchObject({ name: 'zeltlager.jpg' });
    expect(de.nodes['seed:camp']).not.toHaveProperty('dirty');
    expect(de.nodes['seed:poem']).toMatchObject({
      name: 'poem.txt',
      text: 'my edit',
      dirty: true,
    });
  });

  it('drops a neutral seed record whose content is gone', () => {
    const records = { nodes: toRecords(withSeeds(), EN) };
    const out = sanitizeFsState(
      records,
      T,
      'en',
      'girl',
      seedLookup([camp]),
      EN,
    );
    expect(out.nodes['seed:poem']).toBeUndefined();
    expect(out.nodes['seed:camp']).toBeDefined();
  });
});
