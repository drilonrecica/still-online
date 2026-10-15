import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';

// Vitest globals are off, so Testing Library can't register its own auto-cleanup.
afterEach(cleanup);

// Unit tests assert English. A German test sets `language: 'de'` itself.
beforeEach(() => {
  useSettingsStore.setState({ language: 'en' });
});

// jsdom has no canvas backend and logs "Not implemented" for getContext; return null quietly.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as HTMLCanvasElement['getContext'];
