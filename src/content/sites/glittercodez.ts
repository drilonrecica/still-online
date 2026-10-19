// glittercodez.example: "GlitterCodez – free layouts 4 ur profile!!" (P1-04). Each layout's code is
// generated from its `extras` by `layoutCodeFor` (P1-03), so every published code parses back.
// Sample data for now: P3-04 writes the twelve real layouts and the site text.
import type { Gender } from '@/os/types';
import type { LayoutExtras } from '../friendspace/layoutSets';

export const GLITTERCODEZ_HOST = 'glittercodez.example';

export interface LayoutDef {
  id: string;
  name: string;
  /** A 2007 blurb under the preview ("omg my fave!!! ~*~"). */
  blurb: string;
  /** Girly or boyish; the gallery features the player's side first. Both are always listed. */
  side: Gender;
  extras: LayoutExtras;
}

export const LAYOUTS: readonly LayoutDef[] = [
  {
    id: 'starry-night',
    name: 'Starry Night',
    blurb: 'sparkly stars 4 dreamers ~*~ copy it!!',
    side: 'girl',
    extras: {
      background: 'starry',
      text: '#ffffff',
      accent: '#ffcc00',
      font: 'comic',
      glitter: true,
      cursor: 'sparkle',
      stickers: [
        { id: 'star', pos: 'top-right' },
        { id: 'heart', pos: 'bottom-left' },
      ],
    },
  },
  {
    id: 'skater-grunge',
    name: 'Skater Grunge',
    blurb: 'dirty grip tape look. no glitter. ever. 4 real skaters',
    side: 'boy',
    extras: {
      background: 'grunge',
      text: '#e0e0d0',
      accent: '#ff6600',
      panel: '#222222',
      font: 'impact',
      glitter: false,
      stickers: [
        { id: 'skateboard', pos: 'top-left' },
        { id: 'skull', pos: 'bottom-right' },
      ],
    },
  },
];
