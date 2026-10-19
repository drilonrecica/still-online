// Friendspace band pages (`/band/<id>`, P1-02), one per artist group on the playlist under an
// original band name. Sample data for now: P3-01 writes the four real bands.
import type { Band } from './types';

export const BANDS: readonly Band[] = [
  {
    id: 'tinfoil-comets',
    name: 'Tinfoil Comets',
    genre: 'Space Rock / Indie / Robot',
    hometown: 'the garage behind Ziggy’s mom’s house',
    bio: 'we are the Tinfoil Comets. we play loud songs about space and robots. thx 4 the adds!!',
    trackIds: ['voxel-revolution'],
    shows: [{ day: 5, text: 'Friday night - the big show. BE THERE!!!' }],
    blog: [
      {
        day: 3,
        title: 'practice update',
        body: 'ziggy broke another drumstick. we r fine. new song is SO close',
      },
    ],
    theme: {
      background: 'linear-gradient(#0a0a2a, #1c1c4a)',
      text: '#e8e8ff',
      accent: '#9fd0ff',
      glitter: true,
      font: "'Trebuchet MS', Verdana, sans-serif",
      panel: '#14143a',
    },
  },
];
