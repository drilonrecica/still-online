// Scene painters for `renderPhoto`, one per `PhotoScene`. Each draws a whole frame from shapes and
// the seeded `rand`.
import { concert, party, pet, selfportrait } from './photoScenesIndoor';
import { beach, camp, snow, trip } from './photoScenesOutdoor';
import type { Painter } from './photoShapes';
import type { PhotoScene } from './types';

export const SCENE_PAINTERS: Record<PhotoScene, Painter> = {
  camp,
  pet,
  trip,
  party,
  beach,
  snow,
  concert,
  selfportrait,
};
