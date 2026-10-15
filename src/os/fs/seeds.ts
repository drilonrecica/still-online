// The seeded files per locale: same ids in every locale, text from `getSeedFiles(locale)`.
import { getSeedFiles } from '@/content/locale';
import type { Locale } from '@/i18n/types';
import type { FsNode } from './types';

export const seedFilesFor = (locale: Locale): readonly FsNode[] =>
  getSeedFiles(locale);
