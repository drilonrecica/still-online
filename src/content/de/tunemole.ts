// German TuneMole results: same ids, track ids and result kinds as `src/content/tunemole`;
// peers and file names are German-sounding and invented. Shipped track titles stay.
import type { TuneMoleResult } from '../types';

export { searchTuneMole } from '../tunemole';

const MUSIC = ['mp3', 'musik', 'lied', 'song', 'gratis', 'kostenlos'] as const;

export const TUNEMOLE_PEERS = [
  'xXdj_kevXx',
  'skaterboi_dex',
  'comet_fan_4ever',
  '~*kayla*~',
  'mixtape_mike',
] as const;

export const TUNEMOLE_RESULTS: readonly TuneMoleResult[] = [
  {
    fileName: 'Surf_Shimmy_(LIVE)_(ECHT)_.mp3',
    sizeKb: 3_870,
    bitrate: 128,
    peer: 'xXdj_kevXx',
    kind: 'track',
    trackId: 'surf-shimmy',
    keywords: ['surf', 'strand', 'gitarre', ...MUSIC],
  },
  {
    fileName: 'SURF SHIMMY - beste qualität!!.mp3',
    sizeKb: 2_410,
    bitrate: 96,
    peer: '~*kayla*~',
    kind: 'track',
    trackId: 'surf-shimmy',
    keywords: ['surf', 'shimmy', ...MUSIC],
  },
  {
    fileName: 'cool_rock_KOMPLETT_ohne_gelaber.mp3',
    sizeKb: 5_020,
    bitrate: 160,
    peer: 'skaterboi_dex',
    kind: 'track',
    trackId: 'cool-rock',
    keywords: ['rock', 'cool', 'skate', 'gitarre', ...MUSIC],
  },
  {
    fileName: 'Newer_Wave_(remix)_(kein_remix).mp3',
    sizeKb: 4_390,
    bitrate: 128,
    peer: 'comet_fan_4ever',
    kind: 'track',
    trackId: 'newer-wave',
    keywords: ['new', 'neu', 'wave', 'synth', 'comets', ...MUSIC],
  },
  {
    fileName: 'voxel_revolution_tanz_mix.mp3',
    sizeKb: 3_660,
    bitrate: 128,
    peer: 'mixtape_mike',
    kind: 'track',
    trackId: 'voxel-revolution',
    keywords: ['voxel', 'tanz', 'dance', 'revolution', 'disco', ...MUSIC],
  },
  {
    fileName: 'pleasant porridge (chillig) .mp3',
    sizeKb: 4_100,
    bitrate: 128,
    peer: '~*kayla*~',
    kind: 'track',
    trackId: 'pleasant-porridge',
    keywords: [
      'porridge',
      'chill',
      'chillig',
      'entspannt',
      'frühstück',
      ...MUSIC,
    ],
  },
  {
    fileName: 'garantiert_kein_virus.mp3',
    sizeKb: 1_337,
    bitrate: 128,
    peer: 'xXdj_kevXx',
    kind: 'prank',
    keywords: ['virus', 'hits', 'top', 'neu', ...MUSIC],
    prankText:
      'lol reingefallen. da war kein lied. da is nie ein lied.\r\n\r\n- xXdj_kevXx',
  },
  {
    fileName: 'gratis_klingeltöne_installer.exe.mp3',
    sizeKb: 2_048,
    bitrate: 64,
    peer: 'mixtape_mike',
    kind: 'prank',
    keywords: [
      'klingelton',
      'klingeltöne',
      'handy',
      'installer',
      'ringtone',
      ...MUSIC,
    ],
    prankText:
      'lol reingefallen. klingeltöne sind nich gratis. nix is gratis.\r\n\r\n- mixtape_mike',
  },
  {
    fileName: 'Tinfoil_Comets_-_unveröffentlichtes_demo_(selten).mp3',
    sizeKb: 6_500,
    bitrate: 192,
    peer: 'comet_fan_4ever',
    kind: 'stall',
    keywords: [
      'tinfoil',
      'comets',
      'unveröffentlicht',
      'demo',
      'selten',
      ...MUSIC,
    ],
  },
  {
    fileName: 'Tinfoil_Comets_-_neue_single_GELEAKT.mp3',
    sizeKb: 4_880,
    bitrate: 128,
    peer: 'skaterboi_dex',
    kind: 'stall',
    keywords: ['tinfoil', 'comets', 'single', 'geleakt', 'neu', ...MUSIC],
  },
  {
    fileName: 'Kayla_mix_vol_3_(traurige_lieder).mp3',
    sizeKb: 9_800,
    bitrate: 128,
    peer: '~*kayla*~',
    kind: 'stall',
    keywords: ['mix', 'traurig', 'kayla', ...MUSIC],
  },
];
