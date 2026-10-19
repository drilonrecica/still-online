// Theo's German Friendspace profile: shy, „ähm“, „sorry“, „…“, draws frogs. Mama comments formally.
import { g } from '../../gender';
import { theoProfile as en } from '../../profiles/theo';
import type { ProfileContent } from '../../profiles/types';

export const theoProfile: ProfileContent = {
  ...en,
  headline: 'ähm. hi',
  mood: { text: 'ganz ok, glaub ich', emoticon: ':)' },
  aboutMe:
    'ich zeichne sachen. meistens frösche. in bio sitz ich hinten. ich spiele klavier, weil meine mutter das so will. ' +
    'sorry, dass das so kurz ist. ich weiß nicht so richtig, was man hier reinschreibt. ich schreib später mehr… wahrscheinlich',
  wantToMeet:
    'leute, die gern zeichnen. oder frösche mögen. oder beides. sorry',
  interests: [
    {
      label: 'Musik',
      text: 'klavier. und was auch immer das für ein lied ist… es war bei der seite dabei',
    },
    { label: 'Filme', text: 'alles mit dinosauriern' },
    { label: 'Fernsehen', text: 'tierdokus. die mit den fröschen' },
    {
      label: 'Bücher',
      text: 'das bio-buch. das ist eigentlich ganz interessant. sorry',
    },
    { label: 'Helden', text: 'leute, die immer wissen, was sie sagen sollen' },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'extra', name: 'Mama', seed: 'theomom' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'froschfan_02', seed: 'frogfan02' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'Mama',
      text: 'Theodor, denk an deinen Klavierunterricht am Mittwoch. Hab dich lieb, Mama',
    },
    {
      day: 1,
      from: 'froschfan_02',
      text: 'deine froschzeichnung is das beste auf ganz friendspace. kein witz',
    },
    {
      day: 2,
      from: 'kayla',
      contactId: 'kayla',
      text: 'theo deine zeichnungen sind SO gut. malst du mich mal??',
    },
    {
      day: 3,
      from: 'jess',
      contactId: 'jess',
      text: 'THEO ich hab das mit dem wackelpudding gehört. ruhe in frieden wackelpudding. du wirst wieder auferstehen',
    },
    {
      day: 3,
      from: 'Mama',
      text: 'In der Speisekammer ist noch eine dritte Packung Gelatine, Schatz. Hab dich lieb, Mama',
    },
    {
      day: 4,
      from: 'dex',
      contactId: 'dex',
      text: 'viel glück morgen. sag nich sorry',
    },
    {
      day: 4,
      from: 'Mama',
      text: 'Wir sind so stolz, dass du morgen dein Referat hältst! Hab dich lieb, Mama',
    },
    {
      day: 5,
      from: 'marco',
      contactId: 'marco',
      text: 'zwei plus. nach meiner rechnung ist das eine eins. ich bin allerdings nicht besonders gut in mathe',
    },
    {
      day: 5,
      from: 'pia',
      contactId: 'pia',
      text: 'theo kannst du ein pony malen. ein KÖNIGINNEN-pony. mit stern',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: 'ähm hi {name}. ich hab jetzt ne seite. sorry, falls das komisch ist',
    },
    {
      day: 3,
      text: 'tut mir leid wegen dem wackelpudding. schon wieder. das war meine schuld',
    },
    {
      day: 4,
      text: 'ich hab mir KEIN SORRY auf die hand geschrieben für morgen. ok tschüss',
    },
    {
      day: 5,
      text: `ne 2+. danke, dass du ${g('meine partnerin', 'mein partner')} warst. sorry. ich mein. danke`,
    },
  ],
};
