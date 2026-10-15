// Marco's German Friendspace profile: lowercase, deadpan, never „!“ (Tante Rita shouts for him).
import { marcoProfile as en } from '../../profiles/marco';
import type { ProfileContent } from '../../profiles/types';

export const marcoProfile: ProfileContent = {
  ...en,
  headline: 'velvet lantern. karten an der abendkasse.',
  mood: { text: 'unbeeindruckt', emoticon: '(8)' },
  aboutMe:
    'uni. bass. velvet lantern. ' +
    'diese seite ist nicht für meine mutter. hallo mama. ' +
    'wir spielen absichtlich in kleinen läden. das nennt man exklusiv. ' +
    'wenn du über tante rita auf diese seite gekommen bist, bitte ausloggen',
  wantToMeet: 'einen schlagzeuger, der bleibt',
  interests: [
    {
      label: 'Musik',
      text: 'velvet lantern. und bands, von denen du noch nie gehört hast',
    },
    { label: 'Filme', text: 'die director’s cut-fassung. immer' },
    { label: 'Fernsehen', text: 'nein' },
    { label: 'Bücher', text: 'die ohne bilder auf dem cover' },
    { label: 'Helden', text: 'alle, die pünktlich zur probe kommen' },
  ],
  top8: [
    { kind: 'extra', name: 'derek (schlagzeug)', seed: 'derekdrums' },
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'Tante Rita', seed: 'auntrita' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'Tante Rita',
      text: 'Marco, Schatz, ruf deine Mutter an!!! Sie sagt, du rufst nie an!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'MARCO wann is euer nächstes konzert!!! ich bring ein schild mit!!!',
    },
    {
      day: 2,
      from: 'derek (schlagzeug)',
      text: 'flyer sieht fett aus. bean cellar wir kommen',
    },
    {
      day: 2,
      from: 'Tante Rita',
      text: 'Ich habe den Flyer an meinen Kühlschrank gehängt!!! Und bei der Post!!!',
    },
    {
      day: 3,
      from: 'derek (schlagzeug)',
      text: 'ich bin raus. diesmal echt. ruf mich nich an',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'is derek ok?? sein spruch is SO traurig *seufz*',
    },
    {
      day: 4,
      from: 'derek (schlagzeug)',
      text: 'ok bin wieder da. bring nen farbeimer mit. und ein tamburin. frag nich',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'deine band is laut. ich finds ein bisschen gut',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: '11 LEUTE!!! das is AUSVERKAUFT!!! velvet lantern 4 life',
    },
    {
      day: 5,
      from: 'Tante Rita',
      text: 'Ich bin so stolz auf dich!!! Deine Mutter hat geweint!!! Ich habe 11 gezählt!!!',
    },
    {
      day: 5,
      from: 'theo',
      contactId: 'theo',
      text: 'glückwunsch zum konzert. tut mir leid, dass ich nicht kommen konnte. ich hatte klavierunterricht',
    },
  ],
  commentsOnPlayer: [
    { day: 2, text: 'schöne seite, zwerg. lass den glitzer weg' },
    { day: 3, text: 'derek ist raus. schon wieder. frag nicht' },
    {
      day: 4,
      text: 'derek ist wieder da. mit einem farbeimer. frag auch danach nicht',
    },
    {
      day: 5,
      text: 'elf leute. nächstes mal stehst du auf der liste. erste reihe',
    },
  ],
};
