// Localized defaults for settings stored as `null` (docs/i18n.md → "settings"), for every
// locale. Kept out of the catalogs so the settings store can read them before a lazy catalog
// (German) has loaded; `en.ts` and `de.ts` embed their own entry.
export const DEFAULTS = {
  en: {
    awayMessage: 'brb',
    screensaverText: 'still online...',
  },
  de: {
    awayMessage: 'bin gleich wieder da',
    screensaverText: 'still online...',
  },
} as const;

export type DefaultField = keyof (typeof DEFAULTS)['en'];
