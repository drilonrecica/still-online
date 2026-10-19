// German Pixlog surveys, same ids, question counts and order as `src/content/pixlog/surveys`.
// Written like German 2007 Freundebuch/Bulletin-Umfragen: lowercase, „du", chat spelling.
import { g } from '../../gender';
import type { Survey } from '../../pixlog/types';

export const SURVEYS: readonly Survey[] = [
  {
    id: 'this-or-that',
    title: 'das oder das?!',
    questions: [
      'pizza oder pommes?',
      'anrufen oder schreiben?',
      'sommer oder winter?',
      'mp3-player oder cds?',
      'katzen oder hunde?',
      'frühaufsteher oder nachteule?',
      'horrorfilm oder komödie?',
      'freibad oder strand?',
      'turnschuhe oder flip-flops?',
      'in GROSSBUCHSTABEN schreiben oder klein?',
    ],
  },
  {
    id: 'about-me',
    title: '~*die ULTIMATIVE über-mich-umfrage*~',
    questions: [
      'name:',
      'spitznamen:',
      'geburtstag:',
      'lieblingsfarbe:',
      'lieblingslied grad:',
      'lieblingsessen:',
      'was haste grad an?',
      'was is dein spruch im messenger?',
      'wer hat dich zuletzt angeschrieben?',
      'größte angst:',
      'was willste mal werden?',
      'beschreib dich in 3 wörtern:',
    ],
  },
  {
    id: 'last-time',
    title: 'wann hast du zum letzten mal…',
    questions: [
      'so gelacht dass du geheult hast?',
      'ärger gekriegt?',
      'dich entschuldigt?',
      'viel zu lange wach geblieben?',
      'was komisches gegessen?',
      'was wichtiges verloren?',
      'ein geschenk gekriegt?',
      'laut gesungen?',
      g('ne übernachtungsparty gemacht?', 'bei nem kumpel gepennt?'),
      'ein geheimnis verraten?',
    ],
  },
];
