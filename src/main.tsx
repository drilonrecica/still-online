import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'xp.css/dist/XP.css';
import '@/os/theme/tokens.css';
import '@/os/theme/global.css';
import { App } from '@/App';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
