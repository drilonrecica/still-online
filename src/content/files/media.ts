// My Pictures (procedural digicam photos, one per scene the camera "took") and My Music.
import {
  FS_FOLDERS,
  type FsNode,
  type PhotoLook,
  type PhotoScene,
  type PhotoSpec,
} from '@/os/fs/types';
import { g, gendered } from '../gender';
import { at, seedFile } from './seed';

const photo = (
  slug: string,
  name: string,
  spec: PhotoSpec,
  taken: number,
): FsNode =>
  seedFile(
    slug,
    { parentId: FS_FOLDERS.pics, name, type: 'image', photo: spec },
    taken,
  );

/**
 * A slot with a photo per gender (docs/gender.md): a boy's camera took other moments. Scene, seed
 * and caption are gendered field by field, so the German overlay can still swap the caption.
 */
const genderedPhoto = (girl: PhotoSpec, boy: PhotoSpec): PhotoSpec => ({
  scene: gendered<PhotoScene>({ girl: girl.scene, boy: boy.scene }),
  seed: gendered({ girl: girl.seed, boy: boy.seed }),
  caption: g(girl.caption ?? '', boy.caption ?? ''),
});

export const PICTURES: readonly FsNode[] = [
  photo(
    'summer-camp-2006',
    'summer_camp_2006.jpg',
    {
      scene: 'camp',
      seed: 2006,
      caption: g(
        'camp lakeview, cabin 4 forever',
        'camp lakeview. cabin 4 won capture the flag. twice',
      ),
    },
    at(2006, 7, 21, 18, 30),
  ),
  photo(
    'biscuit-the-dog',
    'biscuit_the_dog.jpg',
    {
      scene: 'pet',
      seed: 418,
      caption: g(
        'biscuit after eating a whole sock',
        'biscuit ate a whole sock. legend',
      ),
    },
    at(2007, 9, 2, 11, 5),
  ),
  photo(
    'school-trip-museum',
    g('school_trip_museum.jpg', 'skatepark_wipeout.jpg'),
    genderedPhoto(
      {
        scene: 'trip',
        seed: 77,
        caption: 'museum trip. the dinosaur was smaller than expected',
      },
      { scene: 'skatepark', seed: 5150, caption: 'me. the curb won' },
    ),
    at(2007, 5, 16, 13, 20),
  ),
  photo(
    'kaylas-party-blurry',
    g('kaylas_party_BLURRY.jpg', 'lan_party_marcos.jpg'),
    genderedPhoto(
      {
        scene: 'party',
        seed: 1313,
        caption: "kayla's party. everyone moved. it's art now",
      },
      {
        scene: 'lanparty',
        seed: 1337,
        caption:
          "marco's lan party. galaxy raiders 3 til mom called. mostly chips",
      },
    ),
    at(2007, 8, 25, 21, 45),
  ),
  photo(
    'beach-holiday',
    g('beach_vacation.jpg', 'dexs_ramp.jpg'),
    genderedPhoto(
      {
        scene: 'beach',
        seed: 808,
        caption: 'beach vacation, before the sunburn',
      },
      {
        scene: 'ramp',
        seed: 4040,
        caption: "dex's ramp. his bro built it. i landed ONE drop-in",
      },
    ),
    at(2007, 7, 30, 15, 10),
  ),
  photo(
    'me-webcam-test',
    'me_webcam_test.jpg',
    {
      scene: 'selfportrait',
      seed: 3000,
      look: gendered<PhotoLook>({ girl: 'long', boy: 'short' }),
      caption: g(
        'testing the new webcam. is my hair always like that',
        'testing the new webcam. does my hair always stick up like that',
      ),
    },
    at(2007, 9, 1, 16, 2),
  ),
];

const track = (slug: string, name: string, trackId: string): FsNode =>
  seedFile(
    slug,
    { parentId: FS_FOLDERS.music, name, type: 'audio', trackId },
    at(2007, 9, 1, 10, 15),
  );

/** Tracks shipped in `public/music/`; ids match `src/content/playlist.ts`. */
export const MUSIC: readonly FsNode[] = [
  track('surf-shimmy', 'surf_shimmy.mp3', 'surf-shimmy'),
  track('cool-rock', 'cool_rock.mp3', 'cool-rock'),
];
