// German seeded files: the English nodes (same ids, order, folders, dates and photo specs) with
// German names, text and photo captions.
import type { FsNode } from '@/os/fs/types';
import { SEED_FILES as EN_SEED_FILES } from '../../files';
import { MUSIC, PICTURES } from './media';
import { PERSONAL_DOCS } from './personalDocs';
import { RECYCLE_BIN } from './recycleBin';
import { SCHOOL_DOCS } from './schoolDocs';
import type { SeedText } from './types';

/** German text by seed slug (`seed:<slug>`); `files.test.ts` checks it covers every seed. */
export const SEED_TEXT: Readonly<Record<string, SeedText>> = {
  ...SCHOOL_DOCS,
  ...PERSONAL_DOCS,
  ...PICTURES,
  ...MUSIC,
  ...RECYCLE_BIN,
};

function localize(node: FsNode): FsNode {
  const de = SEED_TEXT[node.id.replace(/^seed:/, '')];
  if (!de) return node;
  const out: FsNode = { ...node, name: de.name };
  if (de.text !== undefined) out.text = de.text;
  if (de.caption !== undefined && node.photo)
    out.photo = { ...node.photo, caption: de.caption };
  return out;
}

export const SEED_FILES: readonly FsNode[] = EN_SEED_FILES.map(localize);
