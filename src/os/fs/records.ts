// The `fs` store's language-neutral persisted shape (docs/i18n.md → "fs"). In memory every node is
// rendered in the current locale; on disk system folders have no `name` and untouched seeds no
// `name`/`text`/`photo.caption`. These helpers convert between the two and migrate v0.2 saves.
import { getLocale } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import { isRecord } from '@/os/persist';
import {
  isSeedId,
  isSystemId,
  parseNode,
  pruneTree,
  systemFolderName,
  systemFolders,
} from './nodes';
import { seedFilesFor } from './seeds';
import type { FsFolderId, FsNode, FsState } from './types';

type Nodes = Record<string, FsNode>;

/** Seed content by id. */
export type SeedLookup = ReadonlyMap<string, FsNode>;

export const seedLookup = (seeds: readonly FsNode[]): SeedLookup =>
  new Map(seeds.map((n) => [n.id, n]));

/** A node as persisted: a full `FsNode`, or one with its generated text left out. */
export type FsNodeRecord = Omit<FsNode, 'name'> & { name?: string };

const sameText = (a: FsNode, b: FsNode): boolean =>
  a.name === b.name &&
  a.text === b.text &&
  a.photo?.caption === b.photo?.caption;

/** `node` with the name, text and photo caption of its seed content. */
function withSeedText(node: FsNode, seed: FsNode): FsNode {
  const out: FsNode = { ...node, name: seed.name };
  if (seed.text !== undefined) out.text = seed.text;
  else delete out.text;
  if (out.photo) {
    out.photo = { ...out.photo };
    if (seed.photo?.caption !== undefined)
      out.photo.caption = seed.photo.caption;
    else delete out.photo.caption;
  }
  return sameText(out, node) ? node : out;
}

/**
 * Renders system folder names and untouched seeds in `locale`. Returns `nodes` itself when
 * nothing changed, so a language switch without visible changes doesn't re-render.
 */
export function localizeNodes(
  nodes: Nodes,
  locale: Locale,
  seeds: SeedLookup,
): Nodes {
  let out: Nodes | null = null;
  for (const node of Object.values(nodes)) {
    let next = node;
    if (node.system && isSystemId(node.id)) {
      const name = systemFolderName(node.id as FsFolderId, locale);
      if (name !== node.name) next = { ...node, name };
    } else if (isSeedId(node.id) && !node.dirty) {
      const seed = seeds.get(node.id);
      if (seed) next = withSeedText(node, seed);
    }
    if (next !== node) {
      out ??= { ...nodes };
      out[node.id] = next;
    }
  }
  return out ?? nodes;
}

/** A node as it is saved: no system folder names, no text of untouched seeds. */
export function toRecord(node: FsNode, seeds: SeedLookup): FsNodeRecord {
  const out: FsNodeRecord = { ...node };
  if (node.system) {
    delete out.name;
  } else if (isSeedId(node.id) && !node.dirty && seeds.has(node.id)) {
    delete out.name;
    delete out.text;
    if (out.photo) {
      out.photo = { ...out.photo };
      delete out.photo.caption;
    }
  }
  return out;
}

export function toRecords(
  nodes: Nodes,
  seeds: SeedLookup,
): Record<string, FsNodeRecord> {
  const out: Record<string, FsNodeRecord> = {};
  for (const [id, node] of Object.entries(nodes))
    out[id] = toRecord(node, seeds);
  return out;
}

/**
 * One untrusted non-system node. A neutral seed record takes its text from `seeds`. A v0.2 seed
 * (which still has its English text) is untouched if that text equals the English seed,
 * otherwise the player renamed or edited it: it becomes `dirty` and keeps its text.
 */
function restoreNode(
  raw: Record<string, unknown>,
  seeds: SeedLookup,
  englishSeeds: SeedLookup,
): FsNode | null {
  const id = raw.id;
  if (typeof id !== 'string' || !isSeedId(id) || raw.dirty === true) {
    return parseNode(raw);
  }
  const seed = seeds.get(id);
  if (raw.name === undefined) {
    if (!seed) return null;
    const node = parseNode({ ...raw, name: seed.name });
    return node && withSeedText(node, seed);
  }
  const node = parseNode(raw);
  if (!node) return null;
  const english = englishSeeds.get(id);
  if (english && sameText(node, english)) {
    return seed ? withSeedText(node, seed) : node;
  }
  return { ...node, dirty: true };
}

const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/**
 * Builds the rendered fs state from untrusted persisted data (the neutral shape or a v0.2 save);
 * system folders always come back.
 */
export function sanitizeFsState(
  persisted: unknown,
  time: number,
  locale: Locale = getLocale(),
  seeds: SeedLookup = seedLookup(seedFilesFor(locale)),
  englishSeeds: SeedLookup = seedLookup(seedFilesFor('en')),
): FsState {
  const nodes = systemFolders(time, locale);
  const p = isRecord(persisted) ? persisted : {};
  if (isRecord(p.nodes)) {
    for (const raw of Object.values(p.nodes)) {
      if (!isRecord(raw) || typeof raw.id !== 'string') continue;
      const system = nodes[raw.id];
      if (system?.system) {
        // Keep the timestamps, force the structure and the name.
        if (finite(raw.createdAt) && finite(raw.modifiedAt)) {
          system.createdAt = raw.createdAt;
          system.modifiedAt = raw.modifiedAt;
        }
        continue;
      }
      if (nodes[raw.id]) continue;
      const node = restoreNode(raw, seeds, englishSeeds);
      if (node) nodes[node.id] = node;
    }
  }
  const purgedSeeds = Array.isArray(p.purgedSeeds)
    ? [
        ...new Set(
          p.purgedSeeds.filter((s): s is string => typeof s === 'string'),
        ),
      ]
    : [];
  return { nodes: pruneTree(nodes), purgedSeeds };
}
