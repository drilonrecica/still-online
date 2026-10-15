import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'xp.css/dist/XP.css';
import '@/os/theme/tokens.css';
import '@/os/theme/global.css';
import { loadLocale } from '@/i18n/load';
import { getLocale } from '@/i18n/t';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

// Only English is bundled. A German player's catalog and content load before the app module is
// even imported, because the stores hydrate (and localize saved files) as soon as they load.
// If that fails (offline), the app starts in English rather than not at all.
loadLocale(getLocale())
  .catch((error: unknown) => console.warn('could not load language', error))
  .then(() => import('@/App'))
  .then(({ App }) => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
