// English catalog: the source of truth for every key (see docs/i18n.md → "Catalogs").
// One top-level key per area; values are strings with `{param}` tokens or `(p) => string`.
export const en = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    apply: 'Apply',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    browse: 'Browse…',
  },
} as const;
