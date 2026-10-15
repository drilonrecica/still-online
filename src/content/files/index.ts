// Seeded file system content: the family computer as the player finds it in 2007.
// Merged into the fs store with `fs.seed()` on app start (see docs/architecture-v0.2.md → "File system").
import type { FsNode } from '@/os/fs/types';
import { MUSIC, PICTURES } from './media';
import { PERSONAL_DOCS } from './personalDocs';
import { RECYCLE_BIN } from './recycleBin';
import { SCHOOL_DOCS } from './schoolDocs';

/** Parents before children, so the list reads top-down. */
export const SEED_FILES: readonly FsNode[] = [
  ...SCHOOL_DOCS,
  ...PERSONAL_DOCS,
  ...PICTURES,
  ...MUSIC,
  ...RECYCLE_BIN,
];
