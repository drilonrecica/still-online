// German My Pictures and My Music (`src/content/files/media.ts`): file names and photo captions.
import type { SeedText } from './types';

export const PICTURES: Readonly<Record<string, SeedText>> = {
  'summer-camp-2006': {
    name: 'ferienlager_2006.jpg',
    caption: 'ferienlager lakeview, hütte 4 für immer',
  },
  'biscuit-the-dog': {
    name: 'keks_der_hund.jpg',
    caption: 'keks, nachdem er ne ganze socke gefressen hat',
  },
  'school-trip-museum': {
    name: 'ausflug_museum.jpg',
    caption: 'museumsausflug. der dino war kleiner als gedacht',
  },
  'kaylas-party-blurry': {
    name: 'kaylas_party_VERWACKELT.jpg',
    caption: 'kaylas party. alle haben sich bewegt. jetzt is es kunst',
  },
  'beach-holiday': {
    name: 'strandurlaub.jpg',
    caption: 'strandurlaub, vor dem sonnenbrand',
  },
  'me-webcam-test': {
    name: 'ich_webcam_test.jpg',
    caption: 'teste die neue webcam. sehen meine haare immer so aus',
  },
};

/** Track file names are the shipped track titles and stay as they are. */
export const MUSIC: Readonly<Record<string, SeedText>> = {
  'surf-shimmy': { name: 'surf_shimmy.mp3' },
  'cool-rock': { name: 'cool_rock.mp3' },
};
