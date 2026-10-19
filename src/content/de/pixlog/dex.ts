// Dex on Pixlog in German, same structure as `src/content/pixlog/dex`: wenig worte, immer abwesend.
// Filmen im Skatepark, Ry hat die Fotos gemacht (Tag 2; Album und das „NEUE FOTOS"-Bulletin), der
// Camcorder frisst die Kassette (3), der Kickflip ohne Kamera (4) und die 30-Sekunden-Premiere im
// Wohnzimmer (5; Album).
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const dexPixlog: PixlogProfile = {
  contactId: 'dex',
  skin: 'orange',
  about:
    'dex. ich skate. ry hat mir die seite gemacht. kp wie man die farbe ändert. ' +
    'die fotos sind meistens wischer. is jetzt mein ding. wenn ich nich antworte bin ich im skatepark',
  albums: [
    {
      id: 'dex-filming',
      day: 2,
      title: 'drehtag. ry hat die gemacht',
      photos: [
        {
          photo: {
            scene: 'trip',
            seed: 5601,
            day: 2,
            caption:
              'der skatepark bei der schule. wenn die busse weg sind gehört der uns',
          },
          comments: [
            {
              day: 2,
              from: 'Kickflip_Kev',
              text: 'fett. darf ich die auf die seite stellen',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5602,
            day: 2,
            look: 'short',
            caption: 'ich + der camcorder. der hat oben n griff',
          },
          comments: [
            { day: 2, from: 'Ry (mein bruder)', text: 'MEIN camcorder' },
            { day: 2, from: 'jess', text: 'REGISSEUR DEX!!!' },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5603,
            day: 2,
            caption: 'ich. ich bin der wischer links',
          },
          comments: [
            { day: 2, from: 'jess', text: 'DEX WO BIST DU AUF DEM FOTO' },
            { day: 2, from: 'dex', text: 'links' },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5604,
            day: 2,
            caption: 'sturz 17 von 40. leute haben geklatscht. für den sturz',
          },
          comments: [
            { day: 2, from: 'kayla', text: 'omg alles ok bei dir?? :(' },
            {
              day: 2,
              from: 'theo',
              text: 'ich war bei den schaukeln. ich wollte nicht durchs bild laufen. sorry',
            },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5605,
            day: 2,
            caption:
              'irgend n typ is durchs bild gefahren und auch hingefallen. jetzt is er drin',
          },
          comments: [
            {
              day: 2,
              from: 'grindrail_gary',
              text: 'der typ war ich. bitte löschen',
            },
            { day: 3, from: 'marco', text: 'nimm ihn in die besetzung' },
          ],
        },
      ],
    },
    {
      id: 'dex-premiere',
      day: 5,
      title: 'weltpremiere (mein wohnzimmer)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5611,
            day: 5,
            caption: 'die premiere. 1 sofa. 1 fernseher. 30 sek',
          },
          comments: [
            {
              day: 5,
              from: 'sam_grabs',
              text: 'hab chips mitgebracht. wie befohlen',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5612,
            day: 5,
            caption: 'ry schließt die kassette an. hat ne stunde gedauert',
          },
          comments: [
            { day: 5, from: 'Ry (mein bruder)', text: 'gern geschehen' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5613,
            day: 5,
            look: 'short',
            caption: 'ich. der regisseur. kein geld zurück',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'mein pony kann bestimmt auch nen kickflip. wahrscheinlich. sie is sehr talentiert',
            },
            {
              day: 5,
              from: 'kayla',
              text: 'herr regisseur ~*sooo cool*~ (L)',
            },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5614,
            day: 5,
            caption:
              'die stelle wo ich ihn gestanden hab. keine kamera an dem tag. nur die stelle',
          },
          comments: [
            {
              day: 5,
              from: 'lil_shredder',
              text: 'ICH WAR DABEI!!! ich habs gesehen!!! meine mama sagt nochmal hallo',
            },
            { day: 5, from: 'marco', text: 'gute stelle' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'dex-filming-day',
      day: 2,
      title: 'filmen',
      body:
        'hab das ladekabel vom camcorder gefunden. war im mikrowellenkarton. frag nich\n\n' +
        'den ganzen tag im skatepark gefilmt. 2 stunden kassette. 40 stürze. hab gezählt\n\n' +
        'ry hat fotos gemacht. ich bin der wischer',
    },
    {
      id: 'dex-rip-tape',
      day: 3,
      title: 'ruhe in frieden kassette nr. 1',
      body:
        'der camcorder hat die kassette gefressen. band kommt raus wie spaghetti\n\n' +
        '1998-2007. sie hatte ein langes leben\n\n' +
        'bruder hat noch 1 kassette. da steht 1999 drauf. neuer also besser',
    },
    {
      id: 'dex-landed-it',
      day: 4,
      title: 'gestanden',
      body:
        'kickflip. sauber. weggerollt und alles\n\n' +
        'kamera: im rucksack. deckel drauf\n\n' +
        'n kleiner junge hats gesehen. er hat boah gesagt. das zählt',
    },
    {
      id: 'dex-premiere-post',
      day: 5,
      title: 'is fertig',
      body:
        'das video. 30 sek. is so n bisschen wischer\n\n' +
        'sekunde 22. das is der kickflip. sehen kann man ihn nich aber hören\n\n' +
        'kev hat es auf kickflipkings.example/video gestellt. es lädt. ewig',
    },
  ],
  survey: {
    surveyId: 'last-time',
    answers: [
      'ry is vom sofa gefallen. er sagt stimmt nich',
      'zu spät heimgekommen. der skatepark hat keine uhr',
      'bei meinem board. es hat nein gesagt',
      'bei kev. skatevideos bis 3 uhr',
      'tiefkühlerbsen. die warn für meinen ellbogen. hab n paar gegessen',
      'ne rolle. is in den bach gerollt. die is jetzt frei',
      'grip tape. von mir. für mein board',
      'nie. ry singt aber im auto',
      'bei kev. bin mit schuhen eingepennt',
      'hab keine. hab n board',
    ],
  },
  shouts: [
    { day: 1, text: 'skaten. schreib was' },
    {
      day: 1,
      text: 'nen kickflip gestanden. die kamera von meinem bruder war leer. musst mir einfach glauben',
    },
    { day: 2, text: 'ladekabel gefunden. KAMERA LÄUFT' },
    { day: 2, text: 'filmen im skatepark. riesen camcorder = ich' },
    { day: 3, text: 'ruhe in frieden kassette nr. 1 (1998-2007)' },
    { day: 4, text: 'gestanden. kamera: im rucksack' },
    { day: 5, text: 'weltpremiere. 30 sek. kein geld zurück' },
    {
      day: 5,
      text: g(
        'im abspann is n besonderer dank. das is die einzige stelle im video die nich verwackelt is',
        'im abspann is n besonderer dank. im nächsten video bist du drin. bring n board mit',
      ),
    },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'jess',
      text: 'DEX!!! SCHREIB MIR ZURÜCK INS GÄSTEBUCH!!! du bist IMMER abwesend!!!',
    },
    {
      day: 2,
      from: 'Kickflip_Kev',
      text: 'fette fotos. der wischer is voll du',
    },
    {
      day: 3,
      from: 'Ry (mein bruder)',
      text: 'die kassette war 9 jahre alt. n bisschen respekt bitte',
    },
    {
      day: 4,
      from: 'lil_shredder',
      text: 'DU HASTS GESCHAFFT!!! ich habs gesehen!!! hab es meiner ganzen klasse erzählt',
    },
    {
      day: 5,
      from: 'pia',
      text: 'dex is das video über ponys. sollte es nämlich. das is meine kritik',
    },
  ],
};
