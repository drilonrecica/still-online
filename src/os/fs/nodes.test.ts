import { describe, expect, it } from 'vitest';
import { cleanName, parseNode, uniqueName } from './nodes';
import { sanitizeFsState } from './records';
import type { FsNode } from './types';

const T = 1_000;
const node = (
  id: string,
  parentId: string,
  patch: Partial<FsNode> = {},
): FsNode => ({
  id,
  parentId,
  name: `${id}.txt`,
  type: 'txt',
  createdAt: T,
  modifiedAt: T,
  ...patch,
});

describe('fs nodes', () => {
  it('cleans names', () => {
    expect(cleanName('  a<b>.txt ')).toBe('ab.txt');
    expect(cleanName('/\\')).toBeNull();
  });

  it('numbers names without an extension and dot-files at the end', () => {
    const nodes = {
      a: node('a', 'docs', { name: 'readme' }),
      b: node('b', 'docs', { name: '.hidden' }),
    };
    expect(uniqueName(nodes, 'docs', 'readme', 'txt')).toBe('readme (2)');
    expect(uniqueName(nodes, 'docs', '.hidden', 'txt')).toBe('.hidden (2)');
    expect(uniqueName(nodes, 'docs', 'readme', 'txt', 'a')).toBe('readme');
  });

  it('parses nodes, dropping mistyped extras', () => {
    expect(
      parseNode({
        ...node('x', 'docs'),
        text: 5,
        photo: { scene: 'camp', seed: 3, caption: 7 },
        evil: true,
      }),
    ).toEqual({ ...node('x', 'docs'), photo: { scene: 'camp', seed: 3 } });
    expect(
      parseNode({ ...node('x', 'docs'), photo: { scene: 'moon', seed: 1 } })
        ?.photo,
    ).toBeUndefined();
    expect(
      parseNode({
        ...node('x', 'docs'),
        photo: { scene: 'selfportrait', seed: 1, look: 'short' },
      })?.photo,
    ).toEqual({ scene: 'selfportrait', seed: 1, look: 'short' });
    expect(
      parseNode({
        ...node('x', 'docs'),
        photo: { scene: 'selfportrait', seed: 1, look: 'mohawk' },
      })?.photo,
    ).toEqual({ scene: 'selfportrait', seed: 1 });
    expect(parseNode({ ...node('x', 'docs'), type: 'exe' })).toBeNull();
    expect(
      parseNode({ ...node('x', 'docs'), createdAt: 'yesterday' }),
    ).toBeNull();
    expect(parseNode({ ...node('x', 'docs'), name: '' })).toBeNull();
    expect(parseNode(null)).toBeNull();
  });
});

describe('sanitizeFsState', () => {
  it('returns just the system folders for corrupt data', () => {
    for (const bad of [null, 'x', [], { nodes: [] }, { nodes: { a: 1 } }]) {
      const state = sanitizeFsState(bad, T);
      expect(Object.keys(state.nodes).sort()).toEqual([
        'docs',
        'music',
        'pics',
        'recycle',
        'root',
      ]);
      expect(state.purgedSeeds).toEqual([]);
    }
  });

  it('drops invalid nodes, orphans, cycles and children of files', () => {
    const state = sanitizeFsState(
      {
        nodes: {
          ok: node('ok', 'pics'),
          bad: { id: 'bad', parentId: 'docs' },
          orphan: node('orphan', 'ghost'),
          c1: node('c1', 'c2', { type: 'folder' }),
          c2: node('c2', 'c1', { type: 'folder' }),
          inFile: node('inFile', 'ok'),
        },
        purgedSeeds: ['seed:a', 'seed:a', 3],
      },
      T,
    );
    expect(Object.keys(state.nodes)).toContain('ok');
    for (const id of ['bad', 'orphan', 'c1', 'c2', 'inFile']) {
      expect(state.nodes[id]).toBeUndefined();
    }
    expect(state.purgedSeeds).toEqual(['seed:a']);
  });

  it('re-creates tampered or missing system folders', () => {
    const state = sanitizeFsState(
      {
        nodes: {
          docs: {
            ...node('docs', 'recycle'),
            name: 'Hacked',
            type: 'folder',
            createdAt: 42,
          },
          kept: node('kept', 'docs'),
        },
        purgedSeeds: [],
      },
      T,
    );
    expect(state.nodes.docs).toMatchObject({
      parentId: 'root',
      name: 'My Documents',
      system: true,
      createdAt: 42,
    });
    expect(state.nodes.root?.parentId).toBeNull();
    expect(state.nodes.kept).toBeDefined();
  });

  it('repairs Recycle Bin bookkeeping', () => {
    const state = sanitizeFsState(
      {
        nodes: {
          binned: node('binned', 'recycle'),
          stale: node('stale', 'docs', { deletedFrom: 'pics' }),
          fake: { ...node('fake', 'docs'), system: true },
        },
      },
      T,
    );
    expect(state.nodes.binned?.deletedFrom).toBe('docs');
    expect(state.nodes.stale?.deletedFrom).toBeUndefined();
    expect(state.nodes.fake?.system).toBeUndefined();
  });
});
