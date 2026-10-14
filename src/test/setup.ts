import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are off, so Testing Library can't register its own auto-cleanup.
afterEach(cleanup);

// jsdom has no canvas backend and logs "Not implemented" for getContext; return null quietly.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as HTMLCanvasElement['getContext'];
