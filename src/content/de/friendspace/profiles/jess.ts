// Jess's German Friendspace profile: neon chaos, CAPS, „!!!“, hdgdl. Same Top 8, days and theme.
import { g } from '../../../gender';
import { jessProfile as en } from '../../../friendspace/profiles/jess';
import type { ProfileContent } from '../../../friendspace/profiles/types';

export const jessProfile: ProfileContent = {
  ...en,
  headline: '~*~ ERSTE REIHE ODER GAR NICHT!!!1 ~*~',
  mood: { text: 'AUFGEDREHT', emoticon: ':D' },
  aboutMe:
    'hiiii hier is JESS!!! :D ich mag laute musik, glitzer, meinen kater (der glitzert jetzt auch, lange geschichte) und die TINFOIL COMETS. ' +
    'die sind die beste band der ganzen galaxis und wer was anderes sagt kann nen kommentar schreiben und ich lösch ihn :P ' +
    'ich hör ihre cd mit dem roboter so 40 mal am tag. mama sagt „mach leiser“ ich sag „mach LAUTER“. ' +
    'ich erzähl die schlechtesten witze der welt und bin stolz drauf. warum musste die cd zum arzt? sie hatte nen SPRUNG. gern geschehen',
  wantToMeet:
    'ZIGGY. den drummer. logisch. und jeden, der weiß wie man glitzerkleber aus nem kater kriegt',
  interests: [
    {
      label: 'Musik',
      text: 'TINFOIL COMETS!!! und alles wo man im auto mitschreien kann',
    },
    {
      label: 'Filme',
      text: 'konzert-dvds. die von den comets hab ich so 200 mal geguckt',
    },
    { label: 'Fernsehen', text: 'musikvideos. ALLE. um 2 uhr nachts' },
    {
      label: 'Bücher',
      text: 'die band-biografie. die is signiert (von mir. aber trotzdem)',
    },
    {
      label: 'Helden',
      text: 'Ziggy. und mama, wenn sie uns wohin fährt und NICHT singt',
    },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'extra', name: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    { kind: 'contact', id: 'dex' },
    { kind: 'contact', id: 'theo' },
    { kind: 'band', id: 'tinfoil-comets' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'xX_CometGirl_Xx',
      text: 'OMG noch ein COMET!!! trag dich in mein gästebuch ein auf tinfoilcomets.example!!!!',
    },
    {
      day: 1,
      from: 'kayla',
      contactId: 'kayla',
      text: 'du hast GEWONNEN?? jess hast du ein GLÜCK!!! (L)',
      graphic: 'glitterheart',
    },
    {
      day: 1,
      from: 'dex',
      contactId: 'dex',
      text: 'fett. die roboter-cd is gut',
    },
    {
      day: 2,
      from: 'marco',
      contactId: 'marco',
      text: 'hab gehört du bastelst ein schild. prüf die rechtschreibung. glaub mir',
    },
    {
      day: 2,
      from: 'pia',
      contactId: 'pia',
      text: 'du hast glitzer auf deinem bild. krieg ich auch glitzer',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'OUTFIT-NOTFALL?? ich hab so 12 glitzertops. ruf mich an',
    },
    {
      day: 3,
      from: 'theo',
      contactId: 'theo',
      text: 'ähm hi jess. viel glück beim konzert. sorry, falls das komisch ist…',
    },
    {
      day: 4,
      from: 'ZIGGY FANCLUB',
      text: 'MORGEN ABEND!!! bringt ein schild mit!!! Ziggy liest JEDES schild!!!',
    },
    {
      day: 4,
      from: 'dex',
      contactId: 'dex',
      text: 'viel spaß. nimm ohrstöpsel mit',
    },
    {
      day: 5,
      from: 'kayla',
      contactId: 'kayla',
      text: 'DU HAST DEN DRUMSTICK GEFANGEN??? fotos oder es is nie passiert',
    },
    {
      day: 5,
      from: 'marco',
      contactId: 'marco',
      text: 'erste reihe. respekt. derek is neidisch',
    },
    {
      day: 5,
      from: 'pia',
      contactId: 'pia',
      text: 'darf ich den drumstick anfassen. ich bin vorsichtig. meistens',
    },
    {
      day: 5,
      from: 'xX_CometGirl_Xx',
      text: 'DU HAST IHN GEFANGEN??? du bist meine HELDIN!!! ich heul grad!!!',
      graphic: 'glitterheart',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: '{name}!!! du bist auf friendspace!!! du bist in meinen top 8. platz 1. logisch :D',
      graphic: 'thanks',
    },
    {
      day: 3,
      text: g(
        'was ziehst du freitag an?? sag NICHT pulli. ich meins ernst',
        'was ziehst du freitag an?? NICHT den hoodie mit dem loch. ich meins ernst',
      ),
    },
    {
      day: 4,
      text: 'MORGEN!!! ich kann nich schlafen. ich kann nich essen. ich kann nur schreien',
    },
    {
      day: 5,
      text: `beste. nacht. ALLER ZEITEN. du bist ${g('die beste konzertfreundin', 'der beste konzertkumpel')} der galaxis ${g('(L) hdgdl', '(Y)')}`,
    },
  ],
};
