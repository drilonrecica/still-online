// westfield-high.example: the school's official site (a template bought in 2001, never updated).
import { lazy } from 'react';
import type { SiteDefinition } from '@/content/sites/types';
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';

export const WESTFIELD_SITE: SiteDefinition = {
  host: WESTFIELD_HOST,
  title: 'Westfield High School - Home of the Wildcats',
  description:
    'Official web site of Westfield High School: news and announcements, staff directory and the cafeteria menu. Go Wildcats!',
  keywords: [
    'westfield',
    'high',
    'school',
    'wildcats',
    'news',
    'teachers',
    'dalton',
    'biology',
  ],
  pages: {
    '/': {
      title: 'Westfield High School - Home',
      keywords: ['welcome', 'announcements', 'principal'],
      component: lazy(() => import('./Home')),
    },
    '/news': {
      title: 'Westfield High School - News and Announcements',
      keywords: ['bake sale', 'cell project', 'science fair', 'mp3'],
      component: lazy(() => import('./News')),
    },
    '/staff': {
      title: 'Westfield High School - Staff Directory',
      keywords: ['teachers', 'dalton', 'room 12', 'email'],
      component: lazy(() => import('./Staff')),
    },
    '/cafeteria': {
      title: 'Westfield High School - Cafeteria Menu',
      keywords: ['lunch', 'menu', 'food', 'cafeteria'],
      component: lazy(() => import('./Cafeteria')),
    },
  },
};
