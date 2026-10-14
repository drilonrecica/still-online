// Amplifier playlist. Every track is by Kevin MacLeod (incompetech.com), CC BY 4.0; see CREDITS.md.

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  /** Path under `public/`, without a leading slash. Resolve it against `import.meta.env.BASE_URL`. */
  file: string;
  durationSec: number;
  license: 'CC BY 4.0';
}

export const PLAYLIST: readonly PlaylistTrack[] = [
  {
    id: 'surf-shimmy',
    title: 'Surf Shimmy',
    artist: 'Kevin MacLeod',
    file: 'music/surf-shimmy.mp3',
    durationSec: 123,
    license: 'CC BY 4.0',
  },
  {
    id: 'cool-rock',
    title: 'Cool Rock',
    artist: 'Kevin MacLeod',
    file: 'music/cool-rock.mp3',
    durationSec: 209,
    license: 'CC BY 4.0',
  },
  {
    id: 'newer-wave',
    title: 'Newer Wave',
    artist: 'Kevin MacLeod',
    file: 'music/newer-wave.mp3',
    durationSec: 175,
    license: 'CC BY 4.0',
  },
  {
    id: 'voxel-revolution',
    title: 'Voxel Revolution',
    artist: 'Kevin MacLeod',
    file: 'music/voxel-revolution.mp3',
    durationSec: 130,
    license: 'CC BY 4.0',
  },
  {
    id: 'pleasant-porridge',
    title: 'Pleasant Porridge',
    artist: 'Kevin MacLeod',
    file: 'music/pleasant-porridge.mp3',
    durationSec: 171,
    license: 'CC BY 4.0',
  },
];
