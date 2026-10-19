// Virtual file system contracts (P0-04 implements the store). See docs/architecture-v0.2.md → "File system".

export type FsType = 'folder' | 'txt' | 'image' | 'audio' | 'link';

export type PhotoScene =
  | 'camp'
  | 'pet'
  | 'trip'
  | 'party'
  | 'beach'
  | 'snow'
  | 'concert'
  | 'selfportrait'
  | 'skatepark'
  | 'lanparty'
  | 'ramp';

/** A procedural "digicam photo", drawn by `renderPhoto` from `seed`. */
/** The player's hair in the `selfportrait` scene (long for a girl, short and spiky for a boy). */
export type PhotoLook = 'long' | 'short';

export interface PhotoSpec {
  scene: PhotoScene;
  seed: number;
  caption?: string;
  /** Only the `selfportrait` scene uses it; without it the hair is the v0.3 middle length. */
  look?: PhotoLook;
  /** Story day the photo was taken; the stamp then reads `'07 10 <7 + day>`. Without it, seeded. */
  day?: number;
}

export interface FsNode {
  /** Seeds: `seed:<slug>`; user files: `f:<random>`; system folders: their well-known id. */
  id: string;
  /** null only for `root`. */
  parentId: string | null;
  /** With extension for files: `bio_project.txt`, `camp.jpg`. */
  name: string;
  type: FsType;
  /** Epoch ms (real time). */
  createdAt: number;
  modifiedAt: number;
  /** txt */
  text?: string;
  /** image (procedural) */
  photo?: PhotoSpec;
  /** image (player data in the blob store) */
  blobKey?: string;
  /** audio → a `src/content/playlist.ts` track id */
  trackId?: string;
  /** link → a `*.example` URL */
  url?: string;
  /** Set while in the Recycle Bin: the original parentId. */
  deletedFrom?: string;
  /** Folders that can't be deleted or renamed. Their `name` renders from `fs.folders.<id>`. */
  system?: boolean;
  /**
   * `seed:` nodes only: the player renamed or edited it, so `name`/`text`/`photo.caption` are
   * frozen. Untouched seeds render those from the seed content of the current locale.
   */
  dirty?: boolean;
}

/** Well-known system folders, always present (sanitize re-creates them). */
export const FS_FOLDERS = {
  root: 'root',
  docs: 'docs',
  pics: 'pics',
  music: 'music',
  recycle: 'recycle',
} as const;

export type FsFolderId = (typeof FS_FOLDERS)[keyof typeof FS_FOLDERS];

/** Fields a caller may set when creating a file; ids, parent and times are the store's job. */
export type FsNewFile = Pick<FsNode, 'name' | 'type'> &
  Partial<Pick<FsNode, 'text' | 'photo' | 'blobKey' | 'trackId' | 'url'>>;

/** Persisted data of the `fs` store. */
export interface FsState {
  /** Keyed by id. */
  nodes: Record<string, FsNode>;
  /** Seed ids the player purged; `seed()` never re-adds them. */
  purgedSeeds: string[];
}

export interface FsStore extends FsState {
  /** Children: folders first, then by name (case-insensitive). */
  list: (parentId: string) => FsNode[];
  get: (id: string) => FsNode | undefined;
  /** `My Documents\My Pictures\camp.jpg` (root is not part of the path). */
  path: (id: string) => string;
  /** Returns the new id. Clashing names become `name (2).txt`, `name (3).txt`, … */
  createFile: (parentId: string, file: FsNewFile) => string;
  writeText: (id: string, text: string) => void;
  /** Points an image at new bytes in the blob store (Paint's Save); drops a procedural photo
   * and deletes the old blob. */
  writeImage: (id: string, blobKey: string) => void;
  rename: (id: string, name: string) => void;
  /** Moves to `recycle` and sets `deletedFrom`; folders move with their contents. */
  remove: (id: string) => void;
  restore: (id: string) => void;
  /** Deletes for good (and the node's blob, if any). Purged seeds are remembered. */
  purge: (id: string) => void;
  emptyRecycleBin: () => void;
  /** Adds missing seed nodes; never re-adds an id in `purgedSeeds`. */
  seed: (nodes: readonly FsNode[]) => void;
}
