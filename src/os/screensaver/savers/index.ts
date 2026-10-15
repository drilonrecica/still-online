import type { SaverId } from '../store';
import { createMarquee } from './marquee';
import { createPanes } from './panes';
import { createPipes } from './pipes';
import { createSlideshow } from './slideshow';
import type { SaverFactory } from './types';

export const SAVERS: Record<SaverId, SaverFactory> = {
  pipes: createPipes,
  panes: createPanes,
  marquee: createMarquee,
  slideshow: createSlideshow,
};
