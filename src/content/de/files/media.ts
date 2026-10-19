// German My Pictures and My Music (`src/content/files/media.ts`): file names and photo captions.
import { g } from '../../gender';
import type { SeedText } from './types';

export const PICTURES: Readonly<Record<string, SeedText>> = {
  'summer-camp-2006': {
    name: 'ferienlager_2006.jpg',
    caption: g(
      'ferienlager lakeview, hütte 4 für immer',
      'ferienlager lakeview. hütte 4 hat flaggenklau gewonnen. zweimal',
    ),
  },
  'biscuit-the-dog': {
    name: 'keks_der_hund.jpg',
    caption: g(
      'keks, nachdem er ne ganze socke gefressen hat',
      'keks hat ne ganze socke gefressen. legende',
    ),
  },
  'school-trip-museum': {
    name: g('ausflug_museum.jpg', 'skatepark_sturz.jpg'),
    caption: g(
      'museumsausflug. der dino war kleiner als gedacht',
      'ich. der bordstein hat gewonnen',
    ),
  },
  'kaylas-party-blurry': {
    name: g('kaylas_party_VERWACKELT.jpg', 'lan_party_bei_marco.jpg'),
    caption: g(
      'kaylas party. alle haben sich bewegt. jetzt is es kunst',
      'lan-party bei marco. galaxy raiders 3 bis mama angerufen hat. hauptsächlich chips',
    ),
  },
  'beach-holiday': {
    name: g('strandurlaub.jpg', 'dex_rampe.jpg'),
    caption: g(
      'strandurlaub, vor dem sonnenbrand',
      'dex seine rampe. sein bruder hat sie gebaut. ich hab EINEN drop-in gestanden',
    ),
  },
  'me-webcam-test': {
    name: 'ich_webcam_test.jpg',
    caption: g(
      'teste die neue webcam. sehen meine haare immer so aus',
      'teste die neue webcam. stehen meine haare echt immer so ab',
    ),
  },
};

/** Track file names are the shipped track titles and stay as they are. */
export const MUSIC: Readonly<Record<string, SeedText>> = {
  'surf-shimmy': { name: 'surf_shimmy.mp3' },
  'cool-rock': { name: 'cool_rock.mp3' },
};
