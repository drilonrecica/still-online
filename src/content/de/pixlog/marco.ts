// Marco on Pixlog in German, same structure as `src/content/pixlog/marco`: trocken, klein, nie „!".
// Der Flyer, der nach Suppe aussieht (Tag 2), Derek steigt aus (3), Probe mit Eimer (4; Album) und
// der Bean Cellar, Kapazität 11 (5; Album). Der Spieler ist „zwerg"; Tante Rita schreibt mit „!!!".
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const marcoPixlog: PixlogProfile = {
  contactId: 'marco',
  skin: 'night',
  about:
    'marco. bass. velvet lantern. uni. ' +
    'tante rita hat mein friendspace gefunden, also hab ich jetzt auch das hier. hallo tante rita. ' +
    'meistens fotos von der probe. geprobt wird in der küche von meinem mitbewohner. die nachbarn haben eine meinung dazu',
  albums: [
    {
      id: 'marco-practice',
      day: 4,
      title: 'probe. feat. ein eimer',
      photos: [
        {
          photo: {
            scene: 'concert',
            seed: 5401,
            caption:
              'die bühne. ist eine küche. das licht ist eine lampe mit nem roten t-shirt drüber',
          },
          comments: [
            {
              day: 4,
              from: 'derek (schlagzeug)',
              text: 'das t-shirt war MEINE idee',
            },
            {
              day: 4,
              from: 'jess',
              text: 'MARCO DIE BELEUCHTUNG IS SO ROCKIG!!!',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5402,
            caption:
              'der eimer. derek nennt ihn „eine zweite trommel“. es ist ein farbeimer',
          },
          comments: [
            {
              day: 4,
              from: 'pia',
              text: 'mama hat auch so nen eimer. is das mamas eimer',
            },
            { day: 4, from: 'dex', text: 'eimer klingt aber gut' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5403,
            caption: 'derek. nach 26 stunden zurück. neuer rekord',
          },
          comments: [
            {
              day: 4,
              from: 'derek (schlagzeug)',
              text: 'ich war nie weg. innerlich',
            },
            {
              day: 4,
              from: 'kayla',
              text: 'omg derek is WIEDER DA ~*wiedervereinigung*~',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5404,
            caption: 'das tamburin. die band hat abgestimmt. es bleibt',
          },
          comments: [
            {
              day: 4,
              from: 'theo',
              text: 'ähm. ich mag das tamburin. sorry, falls das jetzt als stimme zählt…',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5405,
            look: 'short',
            caption: 'ich. nicht nervös. geh weg',
          },
          comments: [
            {
              day: 4,
              from: 'Tante Rita',
              text: 'Marco, du bist ja so dünn geworden!!! Isst du auch genug??? Liebe Grüße, Tante Rita',
            },
            { day: 4, from: 'marco', text: 'ja. pizza. kalt' },
          ],
        },
      ],
    },
    {
      id: 'marco-bean-cellar',
      day: 5,
      title: 'velvet lantern live. kapazität 11',
      photos: [
        {
          photo: {
            scene: 'concert',
            seed: 5411,
            caption:
              'der bean cellar. eine reihe. das ist die erste und die letzte reihe',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'NÄCHSTES MAL KOMM ICH!!! ich war beschäftigt, nen drumstick an den kopf zu kriegen',
            },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5412,
            caption:
              'sechs lieder. fünf eigene und ein cover, das keiner kennt',
          },
          comments: [
            { day: 5, from: 'derek (schlagzeug)', text: 'also sechs eigene' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5413,
            caption:
              'letztes lied. derek hat den eimer umgetreten. gehört jetzt zur show',
          },
          comments: [
            { day: 5, from: 'dex', text: 'fett' },
            { day: 5, from: 'kayla', text: 'kult. echt ~*kult*~' },
            {
              day: 5,
              from: 'marco',
              text: 'er sagt, das war absicht. war es nicht',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5414,
            caption:
              'danach. der café-typ von oben hat uns muffins gegeben. von gestern. zählt trotzdem',
          },
          comments: [
            {
              day: 5,
              from: 'Tante Rita',
              text: 'So stolz!!! Deine Mutter will von ALLEN Fotos Abzüge!!! Liebe Grüße, Tante Rita',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5415,
            caption: 'die serviette. ich hab sie signiert. aus prinzip',
          },
          comments: [
            {
              day: 5,
              from: 'theo',
              text: 'ähm. könnte ich auch eine haben. eine serviette, meine ich. sorry',
            },
            {
              day: 5,
              from: 'pia',
              text: 'ich will auch eine. mit nem pony drauf',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'marco-flyer',
      day: 2,
      title: 'zum flyer',
      body:
        'der flyer hängt. café, waschsalon, bushaltestelle.\n\n' +
        'derek hat ihn mit filzstift „verbessert“. das ding in der mitte ist eine laterne. ' +
        'sieht aus wie ein glas suppe. drei leute haben nach der suppe gefragt.\n\n' +
        'es gibt keine suppe. velvet lantern. bean cellar. nur ein abend.',
    },
    {
      id: 'marco-drummer-wanted',
      day: 3,
      title: 'schlagzeuger gesucht',
      body:
        'derek ist ausgestiegen. das vierte mal dieses jahr.\n\n' +
        'in den bean cellar passt eine snare. derek sagt, seine kunst braucht becken.\n\n' +
        'seine sticks hat er hiergelassen. das ist meistens ein gutes zeichen. oder er hat sie vergessen.',
    },
    {
      id: 'marco-eleven',
      day: 5,
      title: 'elf',
      body:
        'das konzert hat stattgefunden. 11 leute waren da. ausverkauft, wenn in den laden 11 reinpassen. tun sie.\n\n' +
        'derek hat im letzten lied den eimer umgetreten. alle dachten, das war absicht. gehört jetzt zur show.\n\n' +
        '...\n\n' +
        'ok, es war gut. es war richtig gut.',
    },
  ],
  survey: {
    surveyId: 'this-or-that',
    answers: [
      'pizza. kalt. von gestern',
      'keins von beiden. zettel hinlegen',
      'winter. weniger leute draußen',
      'platten. ich weiß, das stand nicht zur auswahl',
      'die katze im café. genau die',
      'nachteule. die probe geht bis 2',
      'keins von beiden. was mit untertiteln',
      'keller',
      'stiefel. das ist ein look',
      'klein. großbuchstaben ist schreien. frag jess',
    ],
  },
  shouts: [
    { day: 1, text: 'probe. die nachbarn haben zweimal geklopft. gute kritik' },
    { day: 2, text: 'flyer hängen. das ist eine laterne. keine suppe' },
    {
      day: 2,
      text: g(
        'der zwerg hat jetzt ein pixlog. zu viel glitzer. passt schon',
        'der zwerg hat jetzt ein pixlog. dunkel. guter geschmack. bild dir nichts drauf ein',
      ),
    },
    { day: 3, text: 'schlagzeuger gesucht. muss in einen rucksack passen' },
    { day: 4, text: 'derek ist zurück. der eimer auch' },
    { day: 5, text: 'ausverkauft. kapazität: 11' },
    { day: 5, text: 'eine serviette signiert. aus prinzip' },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'Tante Rita',
      text: 'Marco, ist das die Internetseite, von der deine Mutter erzählt hat??? Ruf sie an!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 2,
      from: 'jess',
      text: 'MARCO ICH HAB DEN FLYER GESEHEN!!! die suppe is so süß!!! ich mein die LATERNE',
    },
    {
      day: 3,
      from: 'derek (schlagzeug)',
      text: 'ich bin raus. das ist meine offizielle erklärung',
    },
    {
      day: 4,
      from: 'derek (schlagzeug)',
      text: 'offizielle erklärung nr. 2: ich bin wieder da. ich bring den eimer mit',
    },
    {
      day: 5,
      from: 'kayla',
      text: 'elf leute is SO exklusiv. das is so typisch du marco ~*rockstar*~',
    },
  ],
};
