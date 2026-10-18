import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { loadLocale } from '@/i18n/load';
import { useSettingsStore } from '@/os/store/settings';

// Vitest globals are off, so Testing Library can't register its own auto-cleanup.
afterEach(cleanup);

// German is a lazy chunk in the app; tests load it once up front so `contentFor('de')`,
// `translate('de', …)` and `setLanguage('de')` work synchronously, as they do after a load.
await loadLocale('de');

// Unit tests assert English and the girl side. A German test sets `language: 'de'` itself; a
// test of the boy side sets `gender: 'boy'`.
beforeEach(() => {
  useSettingsStore.setState({ language: 'en', gender: 'girl' });
});

// jsdom has no canvas backend and logs "Not implemented" for getContext; return null quietly.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as HTMLCanvasElement['getContext'];
