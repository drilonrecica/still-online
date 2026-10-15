// Helpers for the seeded file system content (src/content/files/). Only functions live here.
import type { FsNode } from '@/os/fs/types';

/** Local-time epoch ms; months are 1-based (`at(2007, 9, 3, 16, 42)` = Sep 3 2007, 4:42 PM). */
export function at(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
): number {
  return new Date(year, month - 1, day, hour, minute).getTime();
}

type SeedFields = Omit<FsNode, 'id' | 'createdAt' | 'modifiedAt'>;

/**
 * A seed node with id `seed:<slug>`. `created`/`modified` are the file's own dates (2007-ish),
 * so Explorer's "Date Modified" column reads like the family computer's history.
 */
export function seedFile(
  slug: string,
  fields: SeedFields,
  created: number,
  modified = created,
): FsNode {
  return {
    id: `seed:${slug}`,
    createdAt: created,
    modifiedAt: modified,
    ...fields,
  };
}

/** A `.txt` seed. */
export function seedText(
  slug: string,
  parentId: string,
  name: string,
  text: string,
  created: number,
  modified = created,
): FsNode {
  return seedFile(
    slug,
    { parentId, name, type: 'txt', text },
    created,
    modified,
  );
}
