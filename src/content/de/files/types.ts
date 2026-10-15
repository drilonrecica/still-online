// The German text of one seeded file; ids, folders, dates and photo specs come from
// `src/content/files`.
export interface SeedText {
  name: string;
  /** For `.txt` seeds. */
  text?: string;
  /** For photos. */
  caption?: string;
}
