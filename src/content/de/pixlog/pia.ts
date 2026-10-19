// Pia on Pixlog in German, same structure as `src/content/pixlog/pia`: herrische kleine Schwester,
// 23 Ponys, sagt's Mama. Der Ponyclub öffnet (Tag 1), Sternenstaub ist weg (2), Detektivin Pia
// verdächtigt Keks (3), sie ist wieder da, extra flauschig (4), ein Geschenk für dich (5).
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const piaPixlog: PixlogProfile = {
  contactId: 'pia',
  skin: 'sunset',
  about:
    'das is PIAS pixlog. ich hab 23 ponys und alle haben namen. sternenstaub is die KÖNIGIN. ' +
    `${g('meine große schwester', 'mein großer bruder')} darf meine fotos NICHT angucken. ` +
    'ok du darfst gucken. aber nich den bildschirm anfassen',
  albums: [
    {
      id: 'pia-pony-club',
      day: 1,
      title: 'PIAS PONYCLUB (offizielle fotos)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5311,
            caption: 'das erste treffen. ich bin die chefin',
          },
          comments: [
            {
              day: 1,
              from: 'ponyprincess_99',
              text: 'darf ich mitmachen!!! ich hab das lila!!!',
            },
            {
              day: 1,
              from: 'pia',
              text: 'da musst du die chefin fragen. ich bin die chefin. ok ja',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5312,
            caption: 'keks. wachhund. er kann das nich gut',
          },
          comments: [
            { day: 1, from: 'dex', text: 'sieht aus wie n guter wachhund' },
            { day: 1, from: 'marco', text: 'darf der hund mit abstimmen' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5313,
            look: 'long',
            caption: 'ich. die präsidentin. papa hats fotografiert',
          },
          comments: [],
        },
        {
          photo: {
            scene: 'party',
            seed: 5314,
            caption: 'sternenstaub in der MITTE. da gehört sie hin',
          },
          comments: [
            {
              day: 1,
              from: 'jess',
              text: 'STERNENSTAUB IS SO HÜBSCH!!! ich will in den club!!!',
            },
            {
              day: 2,
              from: 'ponyprincess_99',
              text: 'warte wo is sie jetzt?? :(',
            },
          ],
        },
      ],
    },
    {
      id: 'pia-stardust-home',
      day: 4,
      title: 'SIE IS WIEDER DA!!!',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5321,
            look: 'long',
            caption:
              'ich + sternenstaub. sie is jetzt extra flauschig. (sie nich ich)',
          },
          comments: [
            {
              day: 4,
              from: 'ponyprincess_99',
              text: 'SIE IS WIEDER DA!!! sie sieht so weich aus!!!',
            },
            {
              day: 4,
              from: 'kayla',
              text: 'die flauschigen haare stehen ihr SO gut. sternenstaub is jetzt model',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5322,
            caption: 'die willkommensparty. 22 ponys waren da. alle',
          },
          comments: [
            {
              day: 4,
              from: 'theo',
              text: 'ähm. das ist ne echt schöne party. tschuldige, dass ich nicht eingeladen war. ich mein, ist ok…',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5323,
            caption:
              'keks. UNSCHULDIG. er hat ein entschuldigungs-leckerli gekriegt',
          },
          comments: [
            {
              day: 4,
              from: 'Keks',
              text: 'wuff. (hier is papa. er hätte gern ein zweites entschuldigungs-leckerli)',
            },
            { day: 4, from: 'marco', text: 'gerechtigkeit' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5324,
            caption:
              'der fall is ABGESCHLOSSEN. NICHT fragen wo ich sie gefunden hab',
          },
          comments: [
            { day: 4, from: 'dex', text: 'in der wäsche oder' },
            { day: 4, from: 'pia', text: 'DEX' },
            {
              day: 5,
              from: 'jess',
              text: 'was is in der wäsche passiert pia. WAS IS PASSIERT',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'pia-missing',
      day: 2,
      title: 'VERMISST!!!',
      body:
        'VERMISST: STERNENSTAUB. sie is lila mit silbernen haaren und nem stern. sie is die KÖNIGIN.\n\n' +
        'heute morgen war sie noch in der mitte vom regal und jetzt IS SIE WEG.\n\n' +
        'BELOHNUNG: 1 sticker. ein guter. wenn du sie genommen hast gib sie zurück dann sag ichs nich mama. (ich sags mama)',
    },
    {
      id: 'pia-case-file',
      day: 3,
      title: 'AKTE (streng geheim)',
      body:
        'detektivin pia ermittelt.\n\n' +
        'verdächtiger nr. 1: keks. beweise: er benimmt sich komisch. er hat glitzer auf der nase. er hat mich ANGEGUCKT.\n\n' +
        `${g('verdächtige', 'verdächtiger')} nr. 2: ${g('meine große schwester', 'mein großer bruder')}. sagt ${g('sie', 'er')} hat sie nich genommen. wird noch ermittelt\n\n` +
        'mama hat gesagt „pia bitte“. das heißt ich hab recht',
    },
    {
      id: 'pia-present',
      day: 5,
      title: 'ein GESCHENK',
      body:
        `ich hab jemandem ein GESCHENK gemacht. rat ma wem. ${g('(L)', '(Y)')}\n\n` +
        'wie das geht is geheim. (papa hat geholfen. nich papa sagen dass ich das gesagt hab)\n\n' +
        'wer ein geschenk von mir hat muss es FÜR IMMER benutzen. oder ne woche. so is die regel',
    },
  ],
  survey: {
    surveyId: 'last-time',
    answers: [
      'als papa die ponystimme machen wollte',
      'nie. ich bin die die PETZT',
      'ich sag nich sorry. ich sag „ok GUT“',
      'jede nacht. ich les ponybücher unter der decke',
      'papas wackelpudding. der war grün. hab ihn trotzdem gegessen',
      `die fernbedienung. ok nich verloren. ${g('meine schwester', 'mein bruder')} hat sie KAPUTT gemacht`,
      'an meinem geburtstag. 4 ponys. REKORD',
      'in der badewanne. ponylieder. die ganze cd',
      'meine ponys machen JEDE nacht ne übernachtungsparty',
      `NIE. ich sag mama sachen. ${g('meine schwester', 'mein bruder')} sagt mir sachen. so is die reihenfolge`,
    ],
  },
  shouts: [
    {
      day: 1,
      text: 'PIAS PONYCLUB HAT AUF. treffen in meinem zimmer. nich rennen',
    },
    { day: 1, text: 'NICHT IN MEIN ZIMMER GEHEN (außer ponyclub)' },
    {
      day: 2,
      text: 'VERMISST: STERNENSTAUB. wenn du sie siehst SAG MIR BESCHEID',
    },
    {
      day: 2,
      text: `${g('meine schwester', 'mein bruder')} sagt ${g('sie', 'er')} hat sie nich genommen. das werden wir ja SEHEN`,
    },
    { day: 3, text: 'detektivin pia ermittelt' },
    { day: 4, text: 'STERNENSTAUB IS WIEDER DA (L) extra flauschig' },
    {
      day: 4,
      text: 'keks hat ein entschuldigungs-leckerli gekriegt. macht kein drama draus',
    },
    {
      day: 5,
      text: `ich hab jemandem ein GESCHENK gemacht ${g('(L)', '(Y)')} rat ma wem`,
    },
  ],
  kudosToPlayer: [4, 5],
  guestbook: [
    {
      day: 1,
      from: 'ponyprincess_99',
      text: 'PONYCLUB!!! darf ich vizepräsidentin sein!!!',
    },
    {
      day: 2,
      from: 'kayla',
      text: 'pia ich guck in der stadt nach sternenstaub. lila mit silbernen haaren oder? (L)',
    },
    {
      day: 3,
      from: 'Keks',
      text: 'wuff. (hier is papa. keks hätte gern seine leckerlis zurück)',
    },
    {
      day: 4,
      from: 'theo',
      text: 'ähm. ich bin echt froh, dass sie wieder da ist. tut mir leid, dass sie weg war',
    },
    {
      day: 5,
      from: 'jess',
      text: 'PIA!!! der ponyclub braucht ein SCHILD. ich hab glitzer (bisschen)',
    },
  ],
};
