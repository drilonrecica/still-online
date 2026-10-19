// Dex's German Friendspace profile: slow, short, lowercase, always away. Same days and theme colours;
// the skate stickers are German skater talk (Kickflip, Grip Tape and Board stay).
import { dexProfile as en } from '../../../friendspace/profiles/dex';
import type { ProfileContent } from '../../../friendspace/profiles/types';

export const dexProfile: ProfileContent = {
  ...en,
  headline: 'abwesend. wie immer',
  mood: { text: 'am chillen', emoticon: '(Y)' },
  aboutMe:
    'dex. skaten. essen. schlafen. hinfallen. nochmal. wenn ich nich online bin bin ich im skatepark. ich bin nich online. ' +
    'mein board und ich haben ne komplizierte beziehung. hab es ma im regen liegen lassen. es vergisst nix. ' +
    'mein bruder hat mir die seite gemacht also nich mir die schuld für die farben geben',
  wantToMeet:
    'wer auch immer fahrradspuren auf der rampe hinterlässt. wir müssen reden',
  interests: [
    { label: 'Musik', text: 'was mein bruder halt im auto hört' },
    { label: 'Filme', text: 'skatevideos. die alten auf kassette' },
    { label: 'Fernsehen', text: 'guck ich nich so. bin draußen' },
    {
      label: 'Bücher',
      text: 'die camcorder-anleitung. total spannend',
    },
    { label: 'Helden', text: 'jeder der ihn beim ersten versuch steht' },
  ],
  top8: [
    { kind: 'extra', name: 'Ry (mein bruder)', seed: 'dexbro' },
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'theo' },
    { kind: 'band', id: 'grip-tapes' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'DEX!!! antworte mal auf deine nachrichten!!! du bist IMMER abwesend!!!',
    },
    {
      day: 1,
      from: 'Ry (mein bruder)',
      text: 'mama sagt komm zum abendessen. sie meint JETZT',
    },
    {
      day: 2,
      from: 'theo',
      contactId: 'theo',
      text: 'ich hab dich im skatepark filmen sehen. sah cool aus. ich wollt nich durchs bild laufen',
    },
    {
      day: 2,
      from: 'Ry (mein bruder)',
      text: 'du schuldest mir was für den camcorder. der lag aus nem GRUND in der garage',
    },
    {
      day: 3,
      from: 'marco',
      contactId: 'marco',
      text: 'camcorder fressen kassetten. das machen die so. tut mir leid',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'dex alles ok?? jess sagt dein camcorder hat deinen film GEFRESSEN *heul*',
    },
    {
      day: 4,
      from: 'lil_shredder',
      text: 'BOAH. du hast ihn gestanden. ich habs gesehen!!! meine mama sagt hallo',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'stimmt das dass du nen kickflip kannst. glaub ich dir nich',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: 'ICH HAB DAS VIDEO 50 MAL GEGUCKT. 0:22 IS KUNST!!!',
    },
    {
      day: 5,
      from: 'Ry (mein bruder)',
      text: 'hab ne stunde gebraucht um die kassette anzuschließen. gern geschehen',
    },
  ],
  commentsOnPlayer: [
    { day: 2, text: 'oh. jo. du hast ne seite. fett' },
    { day: 4, text: 'hab ihn gestanden. keine kamera. klassiker' },
    { day: 5, text: 'guck dir 0:22 an. mehr sag ich nich' },
  ],
  theme: {
    ...en.theme,
    stickers: [
      'SKATEN',
      'kickflip-club',
      'grip tape > leute',
      'DAS BOARD IS SAUER AUF MICH',
    ],
  },
};
