// The seeded files per locale and gender: same ids everywhere, text from `getSeedFiles`.
import { getSeedFiles } from '@/content/locale';
import type { Locale } from '@/i18n/types';
import type { Gender } from '@/os/types';
import type { FsNode } from './types';

export const seedFilesFor = (
  locale: Locale,
  gender: Gender,
): readonly FsNode[] => getSeedFiles(locale, gender);
