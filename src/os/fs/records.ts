// The `fs` store's language-neutral persisted shape (docs/i18n.md → "fs"). In memory every node is
// rendered in the current locale and gender; on disk system folders have no `name` and untouched
// seeds no `name`/`text`/`photo.caption`/`photo.look`. These helpers convert between the two and migrate v0.2
// saves.
import { getGender } from '@/i18n/settingsText';
import { getLocale } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import { isRecord } from '@/os/persist';
import type { Gender } from '@/os/types';
import {
  isSeedId,
  isSystemId,
  parseNode,
  pruneTree,
  systemFolderName,
  systemFolders,
} from './nodes';
import { seedFilesFor } from './seeds';
import { isV02SeedText } from './v02Seeds';
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

/** `node` with the name, text, photo caption and photo look of its seed content. */
function withSeedText(node: FsNode, seed: FsNode): FsNode {
  const out: FsNode = { ...node, name: seed.name };
  if (seed.text !== undefined) out.text = seed.text;
  else delete out.text;
  if (out.photo) {
    out.photo = { ...out.photo };
    if (seed.photo?.caption !== undefined)
      out.photo.caption = seed.photo.caption;
    else delete out.photo.caption;
    if (seed.photo?.look !== undefined) out.photo.look = seed.photo.look;
    else delete out.photo.look;
  }
  return sameText(out, node) && out.photo?.look === node.photo?.look
    ? node
    : out;
}

/**
 * Renders system folder names in `locale` and untouched seeds in `locale` for `gender`. Returns
 * `nodes` itself when nothing changed, so a switch without visible changes doesn't re-render.
 * Dirty (renamed or edited) seeds keep their text.
 */
export function localizeNodes(
  nodes: Nodes,
  locale: Locale,
  gender: Gender,
  seeds: SeedLookup = seedLookup(seedFilesFor(locale, gender)),
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
      delete out.photo.look;
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
 * One untrusted non-system node. A neutral seed record takes its text from `seeds` (the current
 * locale and gender). A v0.2 seed (which still has its English text) is untouched if that text
 * equals the English seed (or the v0.2 text of a seed that changed since), otherwise the player renamed or edited it: it becomes `dirty` and
 * keeps its text. v0.2 had no gender and shipped what is now the girl side, so `englishSeeds`
 * are English for a girl.
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
  if (english && (sameText(node, english) || isV02SeedText(node))) {
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
  gender: Gender = getGender(),
  seeds: SeedLookup = seedLookup(seedFilesFor(locale, gender)),
  englishSeeds: SeedLookup = seedLookup(seedFilesFor('en', 'girl')),
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
