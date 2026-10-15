// My Pictures (procedural digicam photos, one per scene the camera "took") and My Music.
import { FS_FOLDERS, type FsNode, type PhotoSpec } from '@/os/fs/types';
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

export const PICTURES: readonly FsNode[] = [
  photo(
    'summer-camp-2006',
    'summer_camp_2006.jpg',
    { scene: 'camp', seed: 2006, caption: 'camp lakeview, cabin 4 forever' },
    at(2006, 7, 21, 18, 30),
  ),
  photo(
    'biscuit-the-dog',
    'biscuit_the_dog.jpg',
    { scene: 'pet', seed: 418, caption: 'biscuit after eating a whole sock' },
    at(2007, 9, 2, 11, 5),
  ),
  photo(
    'school-trip-museum',
    'school_trip_museum.jpg',
    {
      scene: 'trip',
      seed: 77,
      caption: 'museum trip. the dinosaur was smaller than expected',
    },
    at(2007, 5, 16, 13, 20),
  ),
  photo(
    'kaylas-party-blurry',
    'kaylas_party_BLURRY.jpg',
    {
      scene: 'party',
      seed: 1313,
      caption: "kayla's party. everyone moved. it's art now",
    },
    at(2007, 8, 25, 21, 45),
  ),
  photo(
    'beach-holiday',
    'beach_holiday.jpg',
    { scene: 'beach', seed: 808, caption: 'beach holiday, before the sunburn' },
    at(2007, 7, 30, 15, 10),
  ),
  photo(
    'me-webcam-test',
    'me_webcam_test.jpg',
    {
      scene: 'selfportrait',
      seed: 3000,
      caption: 'testing the new webcam. is my hair always like that',
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
