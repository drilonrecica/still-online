// The seeded files per locale. TODO(P0-06): replace with `getSeedFiles(locale)` from
// src/content/locale.ts; until then both locales use the English seeds.
import { SEED_FILES } from '@/content/files';
import type { Locale } from '@/i18n/types';
import type { FsNode } from './types';

const SEEDS: Readonly<Record<Locale, readonly FsNode[]>> = {
  en: SEED_FILES,
  de: SEED_FILES,
};

export const seedFilesFor = (locale: Locale): readonly FsNode[] =>
  SEEDS[locale];
