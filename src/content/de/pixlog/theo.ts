// Theo on Pixlog in German, same structure as `src/content/pixlog/theo`: schüchtern, „ähm", „sorry", „…".
// Ferienlager-Fotos vom letzten Sommer (Tag 1; Album), der Waldmeister-Wackelpudding (2), der
// Wackelpudding „hatte einen harten Tag" (3; passt zu gerissen und fest), 14 Karteikarten (4) und die 2+
// (5; Album). Partnerin/Partner per `g()`; als Mädchen wird er rot, ein Junge kriegt keinen Schwarm.
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const theoPixlog: PixlogProfile = {
  contactId: 'theo',
  skin: 'ocean',
  about:
    'ähm hi. das ist mein pixlog. ich zeichne meistens frösche. und anderes. aber meistens frösche. ' +
    'meine mama sagt, ich soll „mehr aus mir rausgehen“. also… das bin ich. draußen. ' +
    'sorry, dass hier noch nicht so viel ist',
  albums: [
    {
      id: 'theo-camp',
      day: 1,
      title: 'ferienlager (letzter sommer. sorry, dass es so spät kommt)',
      photos: [
        {
          photo: {
            scene: 'camp',
            seed: 5501,
            caption:
              'der see. ich hab ihn auch gezeichnet. die zeichnung ist besser',
          },
          comments: [
            {
              day: 1,
              from: 'froschfan_02',
              text: 'gibts in dem see frösche??',
            },
            {
              day: 2,
              from: 'kayla',
              text: 'sooo schön!! malst du mir den?? (L)',
            },
          ],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5502,
            caption:
              'unsere hütte hieß „ochsenfrosch“. hab ich nicht ausgesucht. aber ich fands gut',
          },
          comments: [],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5503,
            caption:
              'der frosch, den ich gefunden hab. ich hab ihn herr dalton genannt. sorry, herr dalton',
          },
          comments: [
            { day: 1, from: 'froschfan_02', text: 'LEGENDÄRER frosch' },
            {
              day: 1,
              from: 'jess',
              text: 'THEO!!! LOL!!! WEISS HERR DALTON DAVON!!!',
            },
            { day: 2, from: 'marco', text: 'gleiche haltung' },
          ],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5504,
            caption:
              'das lagerfeuer. ich hab 3 marshmallows verbrannt. mit absicht. ich mag sie verbrannt',
          },
          comments: [
            { day: 1, from: 'dex', text: 'verbrannt is die einzig wahre art' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5505,
            look: 'short',
            caption: 'ich. mama hat gesagt lächeln. das ist mein lächeln',
          },
          comments: [
            {
              day: 1,
              from: 'Mama',
              text: 'Sehr hübsch, mein Schatz. Hab dich lieb, Mama',
            },
          ],
        },
      ],
    },
    {
      id: 'theo-cell-project',
      day: 5,
      title: 'das bio-referat (2+)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5511,
            caption: 'die wackelpudding-zelle. sie hat einiges mitgemacht',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'DER WACKELPUDDING!!! ER LEBT!!! (so halb)',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5512,
            caption:
              'die beschriftungen. hab ich um 1 uhr nachts gezeichnet. sorry mama',
          },
          comments: [
            {
              day: 5,
              from: 'froschfan_02',
              text: 'das mitochondrium hat ein GESICHT. das beste überhaupt',
            },
            { day: 5, from: 'kayla', text: 'theo die sind SO süß (L)' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5513,
            caption:
              'unsere kühlbox vom campen. die riecht immer noch n bisschen nach fisch. sorry',
          },
          comments: [
            {
              day: 5,
              from: 'dex',
              text: 'fisch-wackelpudding. neue sorte',
            },
            {
              day: 5,
              from: 'pia',
              text: 'das würd ich NICHT essen. das würd ich mama sagen',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5514,
            look: 'short',
            caption: 'ich danach. ich hab nur 2 mal sorry gesagt',
          },
          comments: [
            { day: 5, from: 'marco', text: 'zwei. das ist wachstum' },
            {
              day: 5,
              from: 'Mama',
              text: 'Eine 2+, Theodor. Wir sind so stolz auf dich. Hab dich lieb, Mama',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5515,
            caption:
              'herr dalton hat gesagt, der wackelpudding war „einprägsam“. ich glaub, das ist gut',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'EINPRÄGSAM IS DIE BESTE NOTE DIE ES GIBT!!!',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'theo-jello-part-1',
      day: 2,
      title: 'wackelpudding (teil 1)',
      body:
        'wir haben den wackelpudding gemacht. ich und meine mama. 2 packungen waldmeister.\n\n' +
        'ich hab die weintrauben zu früh reingetan. die sind alle untergegangen. vielleicht sind das müde mitochondrien.\n\n' +
        'sorry. schlechter witz. er muss über nacht fest werden',
    },
    {
      id: 'theo-jello-had-a-day',
      day: 3,
      title: 'der wackelpudding hatte einen harten tag',
      body:
        'mit dem wackelpudding ist heute viel passiert. ich geh nicht näher drauf ein.\n\n' +
        g(
          'meine partnerin hatte einen plan. meine partnerin hat immer einen plan.\n\n',
          'mein partner hatte einen plan. mein partner hat immer einen plan.\n\n',
        ) +
        'wir haben also eine zelle. glaub ich. sorry, dass das so kurz ist',
    },
    {
      id: 'theo-index-cards',
      day: 4,
      title: 'karteikarten',
      body:
        'wir halten das referat morgen. erste stunde.\n\n' +
        'ich hab meinen teil auf karteikarten geschrieben. ich hab vorm spiegel geübt. ich hab 6 mal sorry gesagt. zum spiegel.\n\n' +
        'mama sagt, das wird schon. mama sagt das oft',
    },
    {
      id: 'theo-b-plus',
      day: 5,
      title: '2+',
      body:
        'herr dalton hat die noten ausgehängt. wir haben ne 2+.\n\n' +
        'er hat gesagt, die zeichnungen waren die besten in der klasse. ich hab sorry gesagt. er hat gesagt „nicht sorry sein, stolz sein“.\n\n' +
        'also. ich bin stolz. sorry. ich meine. ich bin stolz',
    },
  ],
  survey: {
    surveyId: 'about-me',
    answers: [
      'theo. theodor, wenn du meine mama bist',
      'einfach theo. sorry',
      'im märz. sorry, dass es nicht spannender ist',
      'froschgrün',
      'das auf meinem friendspace. das war bei der seite dabei',
      'käsetoast. meine kleine schwester klaut immer die hälfte',
      'der graue kapuzenpulli. ich hab den gleichen dreimal',
      '„beim klavier. sorry“',
      g(
        'meine bio-partnerin. wegen bio. nur wegen bio :$',
        'mein bio-partner. wegen bio. wir sind ein gutes team (Y)',
      ),
      'ein referat vor der ganzen klasse halten',
      'tierzeichner. oder frosch. sorry. zeichner',
      'still. zeichnet. sorry',
    ],
  },
  shouts: [
    {
      day: 1,
      text: g(
        'hab ne partnerin fürs bio-referat. sorry schon mal an sie',
        'hab nen partner fürs bio-referat. sorry schon mal an ihn',
      ),
    },
    {
      day: 1,
      text: 'hab in bio einen frosch gezeichnet. herr dalton hats gesehen. er hat nichts gesagt. das ist gut, glaub ich',
    },
    { day: 2, text: '2 packungen waldmeister-wackelpudding. sorry mama' },
    { day: 3, text: 'der wackelpudding ist… wackelig' },
    { day: 4, text: 'referat ist morgen. 14 karteikarten' },
    {
      day: 4,
      text: 'hab mir KEIN SORRY auf die hand geschrieben. ist abgegangen. schreib es nochmal hin',
    },
    { day: 5, text: 'ne 2+ :) (sorry fürs angeben)' },
    {
      day: 5,
      text: g(
        '2+. und die beste partnerin. sorry. das war jetzt viel auf einmal :$',
        '2+. bester partner. als nächstes machen wir das frosch-referat. falls es eins gibt',
      ),
    },
  ],
  kudosToPlayer: [3, 5],
  guestbook: [
    {
      day: 1,
      from: 'froschfan_02',
      text: 'deine frösche sind das beste auf ganz pixlog. kein witz',
    },
    {
      day: 2,
      from: 'Mama',
      text: 'Theodor, die Küche ist immer noch grün. Hab dich lieb, Mama',
    },
    {
      day: 2,
      from: 'kayla',
      text: 'theo malst du mir nen frosch mit krönchen?? bitte bitte (L)',
    },
    {
      day: 4,
      from: 'dex',
      text: 'sag morgen nich sorry. oder doch. is dein referat',
    },
    {
      day: 5,
      from: 'pia',
      text: 'theo du bist jetzt der offizielle künstler vom ponyclub. mal sternenstaub. das is ein BEFEHL',
    },
  ],
};
