// Jess on Pixlog in German, same structure as `src/content/pixlog/jess`: Konzertwoche in CAPS.
// Das Glitzerschild mit dem Pfotenabdruck (Tag 2), die Outfit-Krise (3), die Checkliste (4),
// erste Reihe und Ziggys Drumstick (5; das „NEUE FOTOS"-Bulletin).
import { g } from '../../gender';
import type { PixlogProfile } from '../../pixlog/types';

export const jessPixlog: PixlogProfile = {
  contactId: 'jess',
  skin: 'lime',
  about:
    'HIIII hier is JESS!!! :D TINFOIL COMETS 4 LIFE. das wars, das is mein über mich. ' +
    'ok noch was: ich kreische, ich glitzer, ich erzähl die SCHLECHTESTEN witze. meine katze glitzert (lange geschichte). ' +
    'gib mir kudos oder ZIGGY ERFÄHRT DAVON',
  albums: [
    {
      id: 'jess-the-sign',
      day: 2,
      title: 'OPERATION SCHILD!!!',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5111,
            day: 2,
            look: 'long',
            caption: 'ich. glitzer im GESICHT. alles gut',
          },
          comments: [
            {
              day: 2,
              from: 'kayla',
              text: 'glitzer steht dir ehrlich gesagt (L)',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5112,
            day: 2,
            caption: 'der mitkünstler. es tut ihm NICHT leid',
          },
          comments: [
            { day: 2, from: 'pia', text: 'darf ich die glitzerkatze haben' },
            {
              day: 3,
              from: 'marco',
              text: 'er hat unterschrieben. rechtlich gehört ihm das schild jetzt',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5113,
            day: 2,
            caption: 'der PFOTENABDRUCK. das is jetzt kunst. keine diskussion',
          },
          comments: [
            {
              day: 2,
              from: 'xX_CometGirl_Xx',
              text: 'ein PFOTENABDRUCK!!! ziggy hat AUCH ne katze!!!',
            },
            { day: 2, from: 'dex', text: 'pfotenabdruck is n gutes logo' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5114,
            day: 2,
            look: 'long',
            caption: 'das schild is hinter mir. glaubt mir einfach',
          },
          comments: [],
        },
      ],
    },
    {
      id: 'jess-comets-show',
      day: 5,
      title: 'COMETS LIVE!!!',
      photos: [
        {
          photo: {
            scene: 'concert',
            seed: 5101,
            day: 4,
            caption: 'ERSTE REIHE!!!!',
          },
          comments: [
            { day: 5, from: 'kayla', text: 'omg bin voll neidisch!!' },
            {
              day: 5,
              from: 'xX_CometGirl_Xx',
              text: 'ICH WAR AUCH DA!!! reihe 4!!! haste mich kreischen gehört',
            },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5102,
            day: 4,
            caption: 'ZIGGY!!!!!! (der wischer is ziggy)',
          },
          comments: [
            { day: 5, from: 'marco', text: 'der wischer hat ne gute haltung' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5103,
            day: 4,
            caption:
              'der drumstick-dreher. 1 sekunde bevor er MICH GETROFFEN HAT',
          },
          comments: [
            {
              day: 5,
              from: 'theo',
              text: 'ähm. ist mit deiner stirn alles ok? tschuldige, komische frage…',
            },
            { day: 5, from: 'dex', text: 'boah' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5104,
            day: 4,
            look: 'long',
            caption: 'ich + DER DRUMSTICK + die beule',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'darf ich ihn anfassen. ich bin vorsichtig. meistens',
            },
            {
              day: 5,
              from: 'ZIGGY FANCLUB',
              text: 'LEGENDE!!! mit dem GESICHT gefangen!!!',
            },
            {
              day: 5,
              from: 'kayla',
              text: 'die beule is eigentlich voll süß',
            },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5105,
            day: 4,
            caption: 'die autofahrt. mama hat gesungen. ALLES',
          },
          comments: [
            {
              day: 5,
              from: 'marco',
              text: 'hat sie die hohe stelle geschafft',
            },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5106,
            day: 4,
            caption: 'letztes lied. keine stimme mehr. HAT SICH GELOHNT',
          },
          comments: [],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'jess-countdown',
      day: 1,
      title: 'der countdown',
      body:
        'ICH HAB DAS RADIO-GEWINNSPIEL GEWONNEN. 2 KARTEN. TINFOIL COMETS. NÄCHSTEN FREITAG.\n\n' +
        'ich hab 47 mal angerufen. mama sagt das is „ganz schön oft“. ich sag das is HINGABE.\n\n' +
        'freitag freitag freitag. das wars, das is der eintrag',
    },
    {
      id: 'jess-outfit',
      day: 3,
      title: 'WAS ZIEH ICH AN (eine krise)',
      body:
        'mein kleiderschrank LÜGT. ich hab 40 shirts und keins davon is ein konzert-shirt.\n\n' +
        'ich hab ALLES anprobiert. mein bett is jetzt ein berg. ein klamottenberg.\n\n' +
        'update: outfit GEFUNDEN. mein bruder sagt ich seh aus wie ne discokugel. das is ein KOMPLIMENT',
    },
    {
      id: 'jess-checklist',
      day: 4,
      title: 'die CHECKLISTE',
      body:
        'karten: hat mama. SICHER\n\n' +
        'schild: mit pfotenabdruck und allem. PERFEKT\n\n' +
        'outfit: liegt auf meinem stuhl. starrt mich an\n\n' +
        'einwegkamera: ABGEHAKT. 27 bilder. ich mach ALLE voll\n\n' +
        'schlafen: nö',
    },
    {
      id: 'jess-front-row',
      day: 5,
      title: 'ICH WAR IN DER ERSTEN REIHE',
      body:
        'die leute haben mich einfach GESCHOBEN. ganz nach vorne. ERSTE. REIHE.\n\n' +
        'ziggy hat den drumstick gedreht und dann hat er ihn GEWORFEN und er hat mich an der stirn getroffen und dann HAB ICH IHN GEFANGEN.\n\n' +
        'er wohnt jetzt unter meinem kopfkissen. die beule wohnt auf meinem kopf. beste. nacht. ÜBERHAUPT. (L) hdgdl',
    },
  ],
  survey: {
    surveyId: 'this-or-that',
    answers: [
      'pizza',
      'schreiben, logo',
      'sommer',
      'CDS!!! die mit dem roboter. 40 mal am tag',
      'KATZEN. glitzernde',
      'nachteule. ich schlaf nich. frag mama',
      'komödie. bei horrorfilmen kreisch ich und flieg raus',
      'freibad!!! arschbombe',
      'turnschuhe. in flip-flops kann man nich springen',
      'GROSS. LOGISCH',
    ],
  },
  shouts: [
    { day: 1, text: 'kann nich schlafen. zu aufgeregt' },
    {
      day: 1,
      text: 'ICH HAB DAS RADIO-GEWINNSPIEL GEWONNEN!!!! 2 KARTEN!!!!!',
    },
    { day: 2, text: 'SCHILD-NOTFALL. nich fragen' },
    {
      day: 2,
      text: 'meine katze is jetzt mitkünstler. er hat unterschrieben. mit dem FUSS',
    },
    { day: 3, text: 'ALARMSTUFE PINK. mein kleiderschrank LÜGT' },
    { day: 4, text: 'NUR NOCH 1 MAL SCHLAFEN!!!!! (L) (L)' },
    {
      day: 5,
      text: 'ICH HAB ZIGGYS DRUMSTICK GEFANGEN!!!!! (mit dem gesicht)',
    },
    {
      day: 5,
      text: `${g('beste konzertpartnerin', 'bester konzertpartner')} der galaxis. du weißt wer gemeint is ${g('(L)', '(Y)')}`,
    },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'pia',
      text: 'jess kannst du glitzer auf meine seite machen. bitte. mama hat gesagt ich soll bitte sagen',
    },
    { day: 2, from: 'xX_CometGirl_Xx', text: 'deine seite is soooo toll!!' },
    {
      day: 3,
      from: 'kayla',
      text: 'ich kann dir ein glitzertop leihen. oder 12. ruf mich an!!',
    },
    {
      day: 4,
      from: 'ZIGGY FANCLUB',
      text: 'MORGEN!!! Ziggy liest JEDES Schild!!! auch die mit Pfotenabdruck!!!',
    },
    {
      day: 5,
      from: 'theo',
      text: 'ähm. glückwunsch zum drumstick. und tut mir leid wegen deinem kopf',
    },
    { day: 5, from: 'dex', text: 'erste reihe. fett' },
  ],
};
