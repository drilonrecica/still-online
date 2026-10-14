import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'xp.css/dist/XP.css';
import '@/os/theme/tokens.css';
import '@/os/theme/global.css';
import { App } from '@/App';

// Dev-only; the condition lets the bundler drop the import from production builds.
if (import.meta.env.DEV) {
  void import('@/dev/fakeTrack').then((m) => m.installFakeTrackHelper());
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
