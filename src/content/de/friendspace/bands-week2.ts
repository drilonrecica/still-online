// German band pages in week two, same days and shape as `src/content/friendspace/bands-week2`.
// Velvet Lantern bucht das Jugendzentrum (6), streitet über die Setlist (7), spielt den Song vom
// Zwerg mit The Grip Tapes als Vorband (8) und spielt vor 83 Leuten (10, nach der Show). Die
// Tinfoil Comets sind auf der Lakeview Festwiese ausverkauft (8) und spielen dort am selben Abend (10).
import { g } from '../../gender';
import type { BandWeek } from '../../friendspace/bands-week2';
import type { BandId } from '../../friendspace/types';

const TINFOIL_COMETS_WEEK2: BandWeek = {
  shows: [
    { day: 6, text: 'DIESEN SAMSTAG - Lakeview Festwiese', until: 8 },
    {
      day: 8,
      text: 'Lakeview Festwiese - in 9 minuten AUSVERKAUFT!!! wir sind genauso geschockt wie ihr',
      until: 10,
    },
    { day: 6, text: 'nächste woche - The Rocket Room' },
    {
      day: 10,
      text: 'Lakeview Festwiese. windig. ausverkauft. danke, regencapes',
      past: true,
    },
  ],
  blog: [
    {
      day: 10,
      title: 'lakeview festwiese!!!',
      body: 'open air = WIND. buzz hat bei song 2 seinen alufolienhut verloren. den rest haben wir ohne gespielt. wer nen hut findet: der is von ihm',
    },
  ],
};

const VELVET_LANTERN_WEEK2: BandWeek = {
  shows: [
    {
      day: 6,
      text: 'das jugendzentrum westfield. samstag. 80 leute. ohne altersgrenze. diesmal echt',
      until: 10,
    },
    {
      day: 8,
      text: 'vorband: the grip tapes. 3 songs. einer über regen',
      until: 10,
    },
    {
      day: 10,
      text: 'gespielt. 83 leute. das mikro hing verkehrt rum. wir auch',
      past: true,
    },
  ],
  blog: [
    {
      day: 7,
      title: 'die setlist',
      body: 'setlist-besprechung. 3 stunden. 8 songs. derek wollte den eimer in jedem song. der eimer ist in 3. derek hat verhandelt wie ein anwalt',
    },
    {
      day: 8,
      title: 'neuer song',
      body: `neuer song im set. ${g('„laternenherz“', '„56k“')}. der text ist von ${g('meiner cousine', 'meinem cousin')}. alles kleingeschrieben. wie der abspann in dex' video. ich habe ein wort geändert. ok vier`,
    },
    {
      day: 10,
      title: '83 statt 12',
      body: 'ich hatte so 12 gesagt. ich lag 71 daneben. jemand hat ein plektrum geworfen. das war ich. der eimer wurde in einem vierten song umgetreten. herr dalton hat ihn angestupst. danke an alle 83',
    },
  ],
};

const GRIP_TAPES_WEEK2: BandWeek = {
  shows: [
    {
      day: 8,
      text: 'samstag - vorband für velvet lantern im jugendzentrum. drinnen. keine boards. wir haben zugesagt',
      until: 10,
    },
    {
      day: 10,
      text: 'das jugendzentrum. 3 songs. der über regen. es hat nich geregnet. keiner is hingefallen',
      past: true,
    },
  ],
  blog: [],
};

export const SUGARCUBE_PARADE_WEEK2: BandWeek = {
  shows: [
    {
      day: 6,
      text: 'nächsten monat - das herbstfest am ententeich. löffel mitbringen (schon wieder)',
    },
  ],
  blog: [],
};

/** The German week-two additions per band page. */
export const BANDS_WEEK2: Readonly<Record<BandId, BandWeek>> = {
  'tinfoil-comets': TINFOIL_COMETS_WEEK2,
  'velvet-lantern': VELVET_LANTERN_WEEK2,
  'grip-tapes': GRIP_TAPES_WEEK2,
  'sugarcube-parade': SUGARCUBE_PARADE_WEEK2,
};
