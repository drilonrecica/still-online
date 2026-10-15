// TuneMole's fictional peer-to-peer network. Tracks map to the shipped CC BY playlist; the
// file names are deliberately dubious. Every peer is invented.
import type { TuneMoleResult } from './types';

const MUSIC = ['mp3', 'music', 'song', 'free'] as const;

export const TUNEMOLE_PEERS = [
  'xXdj_kevXx',
  'skaterboi_dex',
  'comet_fan_4ever',
  '~*kayla*~',
  'mixtape_mike',
] as const;

export const TUNEMOLE_RESULTS: readonly TuneMoleResult[] = [
  {
    fileName: 'Surf_Shimmy_(LIVE)_(REAL)_.mp3',
    sizeKb: 3_870,
    bitrate: 128,
    peer: 'xXdj_kevXx',
    kind: 'track',
    trackId: 'surf-shimmy',
    keywords: ['surf', 'beach', 'guitar', ...MUSIC],
  },
  {
    fileName: 'SURF SHIMMY - best quality!!.mp3',
    sizeKb: 2_410,
    bitrate: 96,
    peer: '~*kayla*~',
    kind: 'track',
    trackId: 'surf-shimmy',
    keywords: ['surf', 'shimmy', ...MUSIC],
  },
  {
    fileName: 'cool_rock_FULL_VERSION_no_talking.mp3',
    sizeKb: 5_020,
    bitrate: 160,
    peer: 'skaterboi_dex',
    kind: 'track',
    trackId: 'cool-rock',
    keywords: ['rock', 'cool', 'skate', 'guitar', ...MUSIC],
  },
  {
    fileName: 'Newer_Wave_(remix)_(not_a_remix).mp3',
    sizeKb: 4_390,
    bitrate: 128,
    peer: 'comet_fan_4ever',
    kind: 'track',
    trackId: 'newer-wave',
    keywords: ['new', 'wave', 'synth', 'comets', ...MUSIC],
  },
  {
    fileName: 'voxel_revolution_dance_mix.mp3',
    sizeKb: 3_660,
    bitrate: 128,
    peer: 'mixtape_mike',
    kind: 'track',
    trackId: 'voxel-revolution',
    keywords: ['voxel', 'dance', 'revolution', 'club', ...MUSIC],
  },
  {
    fileName: 'pleasant porridge (chill) .mp3',
    sizeKb: 4_100,
    bitrate: 128,
    peer: '~*kayla*~',
    kind: 'track',
    trackId: 'pleasant-porridge',
    keywords: ['porridge', 'chill', 'relax', 'breakfast', ...MUSIC],
  },
  {
    fileName: 'totally_not_a_virus.mp3',
    sizeKb: 1_337,
    bitrate: 128,
    peer: 'xXdj_kevXx',
    kind: 'prank',
    keywords: ['virus', 'hits', 'top', 'new', ...MUSIC],
    prankText:
      'lol gotcha. there was no song. there is never a song.\r\n\r\n- xXdj_kevXx',
  },
  {
    fileName: 'free_ringtones_installer.exe.mp3',
    sizeKb: 2_048,
    bitrate: 64,
    peer: 'mixtape_mike',
    kind: 'prank',
    keywords: ['ringtone', 'ringtones', 'phone', 'installer', ...MUSIC],
    prankText:
      'lol gotcha. ringtones are not free. nothing is free.\r\n\r\n- mixtape_mike',
  },
  {
    fileName: 'Tinfoil_Comets_-_unreleased_demo_(rare).mp3',
    sizeKb: 6_500,
    bitrate: 192,
    peer: 'comet_fan_4ever',
    kind: 'stall',
    keywords: ['tinfoil', 'comets', 'unreleased', 'demo', 'rare', ...MUSIC],
  },
  {
    fileName: 'Tinfoil_Comets_-_new_single_LEAKED.mp3',
    sizeKb: 4_880,
    bitrate: 128,
    peer: 'skaterboi_dex',
    kind: 'stall',
    keywords: ['tinfoil', 'comets', 'single', 'leaked', ...MUSIC],
  },
  {
    fileName: 'Kayla_mix_vol_3_(sad_songs).mp3',
    sizeKb: 9_800,
    bitrate: 128,
    peer: '~*kayla*~',
    kind: 'stall',
    keywords: ['mix', 'sad', 'kayla', ...MUSIC],
  },
];

/** Case-insensitive search: every word must appear in the file name or keywords. */
export function searchTuneMole(
  query: string,
  results: readonly TuneMoleResult[] = TUNEMOLE_RESULTS,
): TuneMoleResult[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return results.filter((r) => {
    const hay = `${r.fileName} ${(r.keywords ?? []).join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
