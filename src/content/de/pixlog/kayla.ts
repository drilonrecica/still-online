// Kayla on Pixlog in German, same structure as `src/content/pixlog/kayla`: ~*drama-prinzessin*~.
// Die Brianna-Saga: der Spruch (Tag 1), Zwillings-Hoodies (2), die einzigartigen Outfits und keine
// Einladung (3), die Wendung (4) und das Übernachtungsalbum mit demselben Minz-Schoko-Eis (5).
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const kaylaPixlog: PixlogProfile = {
  contactId: 'kayla',
  skin: 'bubblegum',
  about:
    '~*~ kayla ~*~ drama-PRINZESSIN (nicht queen. das is ein unterschied). ' +
    'lipgloss, streifen, traurige lieder wenns regnet. ICH hatte den gestreiften hoodie ZUERST. ' +
    'kudos = liebe. keine kudos = ich merk das ;)',
  albums: [
    {
      id: 'kayla-one-of-a-kind',
      day: 3,
      title: '~*einzigartig*~',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5211,
            day: 3,
            look: 'long',
            caption: 'outfit #1: KEIN hoodie',
          },
          comments: [
            {
              day: 3,
              from: 'lipgloss_lexi',
              text: 'WUNDERSCHÖN. wie immer <3',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5212,
            day: 3,
            look: 'long',
            caption: 'outfit #2: stulpen. mach DAS mal nach',
          },
          comments: [
            { day: 3, from: 'jess', text: 'STULPEN!!! DU BIST SO MUTIG' },
            {
              day: 4,
              from: 'Brianna',
              text: 'süß!! wo haste die her?? :)',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5213,
            day: 3,
            caption: 'prinzessin bewertet outfit #3. sie sagt nein',
          },
          comments: [
            {
              day: 3,
              from: 'pia',
              text: 'deine katze is deine chefin. wie ich bei keks',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5214,
            day: 3,
            look: 'long',
            caption: 'der gestreifte hoodie. in rente. vorerst',
          },
          comments: [
            {
              day: 3,
              from: 'theo',
              text: 'ähm. ich fand den hoodie schön. tschuldige',
            },
            { day: 3, from: 'kayla', text: 'theo. das hilft nich *seufz*' },
          ],
        },
      ],
    },
    {
      id: 'kayla-sleepover',
      day: 5,
      title: '~*übernachtungsparty überlebt*~',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5221,
            day: 4,
            caption: 'feindesland. (die kissen waren schön)',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'KAYLA BEI BRIANNA. die welt geht unter',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5222,
            day: 4,
            caption: 'DASSELBE EIS. minz-schoko. wir haben uns nur angestarrt',
          },
          comments: [
            { day: 5, from: 'Brianna', text: 'ZWILLINGE lol' },
            {
              day: 5,
              from: 'lipgloss_lexi',
              text: 'omg DASSELBE??? das is schicksal',
            },
            {
              day: 5,
              from: 'marco',
              text: 'minz-schoko. gute wahl. zweimal',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5223,
            day: 4,
            caption: 'horrorfilm. ich hatte KEINE angst. das war ein kissen',
          },
          comments: [{ day: 5, from: 'dex', text: 'du hattest angst' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5224,
            day: 4,
            look: 'long',
            caption:
              '„süßer schlafanzug“ (ihre worte. sie hat geschmack. ätzend)',
          },
          comments: [
            {
              day: 5,
              from: 'Brianna',
              text: 'der IS süß!! aber nich nachmachen ;)',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5225,
            day: 4,
            caption: 'ihr hund. der einzige der nich 40 mal sorry gesagt hat',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'is der netter als keks. nich keks verraten',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5226,
            day: 4,
            caption: '~*friedensvertrag*~ mit glitzerstift unterschrieben',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'FRIEDENSVERTRAG!!! beim nächsten will ich dabei sein (L)',
            },
            {
              day: 5,
              from: 'theo',
              text: 'ähm. das ist echt schön. tschuldige, ich mein glückwunsch',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'kayla-loyalty',
      day: 1,
      title: '~*treue*~',
      body:
        'manche leute müssen mal lernen was treue heißt.\n\n' +
        'manche leute schreiben sprüche über ANDERE leute und denken keiner merkts.\n\n' +
        'ich merks. ich merk es IMMER. das wars. ich nenn keine namen ;)',
    },
    {
      id: 'kayla-twins',
      day: 2,
      title: '~*ich bin niemandes zwilling*~',
      body:
        'heute hatte JEMAND MEINEN gestreiften hoodie an. es gab 2 stück im ganzen einkaufszentrum. ich hab nachgeguckt.\n\n' +
        'herr dalton hat gefragt ob wir uns abgesprochen haben. vor der GANZEN bio-klasse.\n\n' +
        'morgen zieh ich was an das sie NIEMALS nachmachen kann. ihr werdet sehen',
    },
    {
      id: 'kayla-grey',
      day: 3,
      title: '~*manche tage sind einfach grau*~',
      body:
        'alle haben nen rosa umschlag gekriegt. ALLE.\n\n' +
        'is ok. mir gehts GUT. es laufen traurige lieder und es regnet nich mal. so gut gehts mir. *seufz*\n\n' +
        `ps danke an die person die zugehört hat. du weißt wer gemeint is ${g('(L)', '(Y)')}`,
    },
    {
      id: 'kayla-plot-twist',
      day: 4,
      title: '~*plötzliche wendung*~ :O',
      body:
        'also. ich lösch jede mail von brianna ungelesen. das is prinzip.\n\n' +
        'tja. eine davon war die einladung zur übernachtungsparty. mit SMILEY.\n\n' +
        'und der spruch war über ihre kleine schwester. die macht ALLES nach.\n\n' +
        'ich weiß nich mehr wer ich bin. das universum schuldet mir ne erklärung. ich kann nich mehr',
    },
  ],
  survey: {
    surveyId: 'about-me',
    answers: [
      'kayla',
      'kay, prinzessin, drama-prinzessin (NICHT queen)',
      'geheim. aber im frühling. geschenke bitte',
      'pink. logisch',
      'irgendwas trauriges. frag nochma wenns regnet',
      'pommes. und lipgloss (nich zum essen)',
      'meinen gestreiften hoodie. das ORIGINAL',
      '~*manche leute sind einfach neidisch*~',
      'verrat ich nich ;)',
      'dass jemand meinen haarschnitt nachmacht',
      'berühmt. oder jurorin bei ner castingshow. is dasselbe',
      'treu. fabelhaft. missverstanden',
    ],
  },
  shouts: [
    { day: 1, text: 'manche leute müssen mal lernen was treue heißt…' },
    { day: 2, text: '~*nachmacher-alarm*~' },
    {
      day: 2,
      text: 'es gab 2 gestreifte hoodies im ganzen einkaufszentrum. ZWEI',
    },
    { day: 3, text: '~*nich eingeladen und NICHT am heulen*~' },
    {
      day: 3,
      text: `manche leute sind ECHTE freunde. du weißt wer gemeint is ${g('(L)', '(Y)')}`,
    },
    { day: 4, text: '~*plötzliche wendung*~ :O' },
    { day: 5, text: '~*übernachtungsparty überlebt*~' },
    {
      day: 5,
      text: 'minz-schoko is jetzt „unser ding“. ätzend. aber iwie süß',
    },
  ],
  kudosToPlayer: [3, 5],
  guestbook: [
    {
      day: 1,
      from: 'lipgloss_lexi',
      text: 'süße seite!!! deine fotos sind PERFEKT <3',
    },
    { day: 2, from: 'Brianna', text: 'die streifen sind toll!! :)' },
    {
      day: 3,
      from: 'theo',
      text: 'ähm. hi kayla. deine seite ist schön. tschuldige, falls das komisch ist',
    },
    {
      day: 4,
      from: 'pia',
      text: 'darf ich in deine top 8. mama hat gesagt ich soll nett fragen. das is nett',
    },
    {
      day: 5,
      from: 'Brianna',
      text: 'danke dass du da warst!! nächstes mal bring ich keksteig mit. du bringst minz-schoko ;)',
    },
    { day: 5, from: 'jess', text: 'KAYLA + BRIANNA = FRIEDEN?!?! (L) (L)' },
  ],
};
