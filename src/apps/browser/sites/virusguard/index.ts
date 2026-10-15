// virusguard.example: the scareware parody the "subscription has expired!" balloon opens (P1-04).
import { lazy } from 'react';
import type { SiteDefinition } from '@/content/sites/types';
import { VIRUSGUARD_HOST } from '@/content/sites/virusguard';

export const VIRUSGUARD_SITE: SiteDefinition = {
  host: VIRUSGUARD_HOST,
  title: 'VirusGuard 2007 - Is Your Computer Infected?',
  description:
    'WARNING!!! Your computer may be 87% infected!!! Buy VirusGuard 2007 for only $49.95. (A joke website.)',
  keywords: [
    'virus',
    'antivirus',
    'virusguard',
    'scan',
    'security',
    'infected',
  ],
  pages: {
    '/': {
      title: 'VirusGuard 2007 - Is Your Computer Infected?',
      keywords: ['buy', 'scan', 'threats'],
      component: lazy(() => import('./Home')),
    },
  },
};
