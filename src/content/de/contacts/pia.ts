// German text for pia (docs/localization-de.md → "Pia: the bossy little sister"). Same ids, same
// line and choice counts as `src/content/contacts/pia*.ts`; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const pia: ContactOverlay = {
  displayName: 'pia (L) ponys (L)',
  personalMessage: 'NICHT IN MEIN ZIMMER GEHEN!!!',
  days: {
    2: {
      personalMessage:
        'VERMISST: STERNENSTAUB. wer sie sieht SAGT MIR BESCHEID',
    },
    3: { personalMessage: 'detektivin pia ERMITTELT' },
    4: { personalMessage: 'fall ABGESCHLOSSEN (nich fragen)' },
    5: { personalMessage: 'ich hab wem ein GESCHENK gemacht (L) rate ma wem' },
  },
  scripts: {
    opening: {
      hi: {
        lines: [
          '{name} hier is pia',
          'ich bin an papas laptop!! er hat gesagt ich darf 20 min',
        ],
        choices: [
          { text: 'cool. und wieso schreibst du mir', label: 'Wieso?' },
          {
            text: 'papa lässt dich an seinen laptop??',
            label: 'Papas Laptop??',
          },
        ],
      },
      laptop: {
        lines: [
          'ja weil ich VERANTWORTUNGSVOLL bin',
          'im gegensatz zu GEWISSEN leuten',
        ],
        choices: [
          { text: 'was soll das denn heißen', label: 'Wie bitte?' },
          { text: 'ok gut' },
        ],
      },
      remote: {
        lines: ['du hast die fernbedienung kaputt gemacht', 'das wissen alle'],
        choices: [
          { text: 'das war der hund!!', label: 'Das war der Hund' },
          { text: '...ok stimmt' },
        ],
      },
      dog: {
        lines: [
          'keks kommt nich mal an den tisch',
          'ich habs mama schon gesagt :P',
        ],
        choices: [{ text: 'PIA' }, { text: 'egal' }],
      },
      why: {
        lines: [
          'EGAL mama sagt essen gibts in 10 min',
          'und kannst du mir bei meinem pferde-quiz helfen',
        ],
        choices: [
          { text: 'klar was is die frage', label: 'Klar' },
          { text: 'nein' },
        ],
      },
      quiz: {
        lines: ['wie heißt ein pferdebaby'],
        choices: [
          { text: 'ein fohlen' },
          { text: 'ein pony' },
          { text: 'ein pferdchen' },
        ],
      },
      right: {
        lines: ['RICHTIG!!! :D', 'du bist ja doch nich so doof', ''],
        personalMessages: { 2: '{name} kennt sich mit pferden aus (Y)' },
      },
      wrong: {
        lines: [
          'FALSCH lol',
          'es is ein FOHLEN. ein pony is was ganz anderes',
          'ich sags papa',
        ],
      },
      no: {
        lines: ['GUT. ich sags mama dass du nein gesagt hast!!', ''],
      },
    },
    dinner: {
      dinner: {
        lines: ['ESSEN', 'mama sagt komm SOFORT runter'],
        choices: [{ text: 'komme!!' }, { text: 'noch 5 minuten' }],
      },
      coming: {
        lines: ['und bring deinen teller von gestern mit'],
      },
      five: {
        lines: [
          'MAMA {name} HAT GESAGT NOCH 5 MINUTEN',
          'ups hab ich das laut getippt',
        ],
      },
    },
    timeUp: {
      bye: {
        lines: ['papa sagt meine 20 min sind um :(', 'tschüüüüss', ''],
      },
    },
    followup1: {
      how: {
        lines: [
          '{name}',
          '{name} {name} {name}',
          'wie ändert man die graue schrift unter deinem namen',
        ],
        choices: [
          { text: 'draufklicken und was eintippen', label: 'Draufklicken' },
          { text: 'warum sollte ich dir helfen', label: 'Warum sollte ich?' },
        ],
      },
      bribe: {
        lines: [
          'weil ich weiß wer den letzten puddingbecher gegessen hat',
          'und es war nich keks',
        ],
        choices: [
          { text: 'ok ok einfach draufklicken und tippen', label: 'Ok ok' },
          { text: 'das traust du dich nich' },
        ],
      },
      mom: {
        lines: [
          'MAMAAAAAAA',
          'spaß sie is im garten',
          'hab ich eh selber rausgefunden. HA',
          '',
        ],
        personalMessages: {
          3: '{name} hat den pudding gegessen. fragt mich woher ich das weiß',
        },
      },
      helped: {
        lines: ['OMG es geht', '', 'guck guck guck'],
        personalMessages: { 1: 'pia is die CHEFIN von diesem haus (L)' },
        choices: [
          { text: 'mama is die chefin vom haus', label: 'Mama ist es' },
          { text: 'süß :)' },
        ],
      },
      boss: {
        lines: [
          'mama is die chefin von MAMA',
          'ich bin die chefin vom HAUS',
          'das is was anderes. verstehst du nich',
        ],
      },
      cute: {
        lines: ['das is nich SÜSS das is WAHR', 'aber danke'],
      },
    },
    followup2: {
      sneak: {
        lines: [
          'psst',
          'papa telefoniert mit oma also hat er den laptop vergessen :D',
          'ok ERNSTE frage',
          'warst du in meinem zimmer',
        ],
        choices: [
          { text: 'nein?? wieso sollte ich', label: 'Nein??' },
          {
            text: 'ok ich hab EIN pony verstellt',
            label: 'Ein Pony verstellt',
          },
          {
            text: 'ich hab deine ponys nach farben sortiert. bitte schön',
            label: 'Nach Farben sortiert',
          },
        ],
      },
      denied: {
        lines: [
          'weil meine ponys in ner ANDEREN REIHENFOLGE stehen',
          'da war jemand drin',
        ],
        choices: [
          { text: 'vielleicht war das keks', label: 'Keks?' },
          { text: 'vielleicht warst du das selber', label: 'Du selber' },
        ],
      },
      biscuit: {
        lines: [
          'keks kommt nich an mein regal',
          '...',
          'außer er stellt sich auf den sitzsack. er IS schon komisch in letzter zeit',
          'ok du bist aus dem schneider. erstmal',
        ],
      },
      herself: {
        lines: [
          'oh',
          'ich hab heute morgen ne ponyhochzeit gemacht',
          'DAS DARF KEINER WISSEN',
        ],
      },
      confess: {
        lines: [
          'WELCHES',
          'wenn das sternenstaub is SCHREI ICH',
          'sie is die königin sie kommt in die MITTE',
          'ich sags mama. wenn papa fertig telefoniert hat',
          '',
        ],
      },
      sorted: {
        lines: [
          '...',
          'ok eigentlich is das ganz schön hübsch',
          'aber mach das NIE WIEDER',
          'und sag mama nich dass ich hübsch gesagt hab',
          '',
        ],
        personalMessages: { 4: 'ponys nach farben sortiert :) NICHT ANFASSEN' },
      },
    },
    day2: {
      missing: {
        lines: [
          '{name}!!!',
          'STERNENSTAUB IS WEG',
          'heute morgen war sie noch in der mitte vom regal und jetzt NICH MEHR',
          'hast du sie genommen',
        ],
        choices: [
          { text: 'nein!! ich schwörs', label: 'Nein!! Ich schwör’s' },
          { text: 'wer is sternenstaub?', label: 'Wer is Sternenstaub?' },
          { text: 'vielleicht is sie weggelaufen', label: 'Weggelaufen' },
        ],
      },
      who: {
        lines: [
          'WER IS STERNENSTAUB',
          'sie is die KÖNIGIN. lila mit silbernen haaren und nem stern',
          'das weiß doch jeder',
        ],
        choices: [
          {
            text: 'ach die. nein ich hab sie nich genommen',
            label: 'Nich genommen',
          },
          { text: 'verzeihung eure majestät', label: 'Eure Majestät' },
        ],
      },
      ranaway: {
        lines: [
          'ponys LAUFEN NICH WEG {name}',
          'die sind aus plastik',
          'ok in GESCHICHTEN laufen sie weg aber nich in ECHT',
        ],
        choices: [
          { text: 'ok ok ich hab sie nich genommen', label: 'Nich genommen' },
          { text: 'vielleicht hat sie nen freund', label: 'Nen Freund?' },
        ],
      },
      boyfriend: {
        lines: [
          'IHHH',
          'sie is eine KÖNIGIN sie braucht keinen freund',
          'ich sags mama dass du das gesagt hast',
          '',
        ],
      },
      swear: {
        lines: ['großes ehrenwort?'],
        choices: [
          { text: 'großes ehrenwort', label: 'Großes Ehrenwort' },
          { text: 'ich mach keine ehrenworte', label: 'Kein Ehrenwort' },
        ],
      },
      pinky: {
        lines: [
          'ok. ich glaub dir. erstmal',
          'ich mach ein VERMISST-plakat',
          '',
        ],
        personalMessages: {
          2: 'BELOHNUNG für sternenstaub: 1 aufkleber (n guter)',
        },
      },
      mom: {
        lines: [
          'ich sags mama dass du kein ehrenwort gibst',
          'das is praktisch ein GESTÄNDNIS',
        ],
      },
    },
    day3: {
      solved: {
        lines: [
          '{name} ich habs gelöst',
          'es war KEKS',
          'beweise: 1. er benimmt sich komisch. 2. er hat glitzer auf der nase. 3. er hat mich angeguckt',
        ],
        choices: [
          { text: 'das sind keine beweise pia', label: 'Keine Beweise' },
          { text: 'glitzer?', label: 'Glitzer?' },
          { text: 'fall abgeschlossen. verhaften', label: 'Verhaften' },
        ],
      },
      sparkle: {
        lines: [
          'SILBERNER glitzer. wie die HAARE von sternenstaub',
          'ok vielleicht is der von meinem glitzerstift. aber VIELLEICHT AUCH NICH',
        ],
        choices: [
          {
            text: 'dein glitzerstift is aber überall',
            label: 'Glitzer is überall',
          },
          { text: 'ok keks wars', label: 'Keks war’s' },
        ],
      },
      notevidence: {
        lines: [
          'das SIND beweise',
          'mama hat „pia bitte“ gesagt, das heißt ich hab recht',
        ],
        choices: [
          { text: 'das heißt das nich', label: 'Heißt es nich' },
          { text: 'na gut. und jetzt?', label: 'Und jetzt?' },
        ],
      },
      interrogate: {
        lines: [
          'jetzt verhör ich ihn',
          'er sagt gar nix. SEHR verdächtig',
          'keine leckerlis bis sternenstaub wieder da is',
          '',
        ],
        personalMessages: { 3: 'keks is VERDÄCHTIG. keine leckerlis' },
      },
      arrest: {
        lines: [
          'ich hab ihn in den ponyknast gesteckt',
          'der ponyknast is der wäschekorb',
          'er is drin eingeschlafen. verbrecher haben KEIN SCHAMGEFÜHL',
          '',
        ],
      },
      glitter: {
        lines: [
          'der is NICH überall',
          '...der is n bisschen überall',
          'sag mama nix vom sofa',
        ],
      },
    },
    day4: {
      found: {
        lines: [
          '{name} {name}',
          'ICH HAB SIE GEFUNDEN!!!!',
          'sternenstaub war in der WÄSCHE',
          'in einer socke von papa. IN DER WASCHMASCHINE',
        ],
        choices: [
          { text: 'geht es ihr gut??', label: 'Geht’s ihr gut??' },
          { text: 'also wars nich keks', label: 'Doch nich Keks' },
        ],
      },
      ok: {
        lines: [
          'sie war einen GANZEN WASCHGANG drin',
          'ihre haare sind jetzt extra flauschig. sie sieht eigentlich TOLL aus',
        ],
        choices: [
          { text: 'wie is sie in ne socke gekommen?', label: 'Wie?' },
          { text: 'juhu sternenstaub!!', label: 'Juhu Sternenstaub!!' },
        ],
      },
      biscuit: {
        lines: [
          '...',
          'ok es war nich keks',
          'ich hab ihm ein ENTSCHULDIGUNGS-leckerli gegeben. mach kein drama draus',
        ],
        choices: [
          {
            text: 'du musst dich bei ihm entschuldigen',
            label: 'Entschuldig dich',
          },
          { text: 'und wie is sie in ne socke gekommen?', label: 'Wie?' },
        ],
      },
      sock: {
        lines: [
          'ok also',
          'VIELLEICHT hab ich ne pony-übernachtungsparty im wäschekorb gemacht',
          'VIELLEICHT hab ichs vergessen',
          'und du darfst das mama NICH sagen. ich sag mama sachen. mama kriegt keine sachen gesagt',
        ],
      },
      yay: {
        lines: [
          'JUHU STERNENSTAUB (L)(L)(L)',
          'FREUDENTANZ!!! is n gürkchen. ne pony-version gabs nich',
          'sie is wieder in der MITTE wo sie hingehört',
          '',
        ],
        personalMessages: { 3: 'STERNENSTAUB IS ZUHAUSE (L) extra flauschig' },
      },
      apology: {
        lines: [
          'ich HAB mich entschuldigt',
          'er hat mir übers gesicht geleckt. das heißt entschuldigung angenommen',
        ],
      },
    },
    day5: {
      present: {
        lines: [
          '{name}',
          'ich hab ein GESCHENK für dich',
          'weil du bei sternenstaub geholfen hast. irgendwie. n bisschen',
          'ich hab dir ein GESCHENK in den computer getan!!! guck bei den hintergrüden',
        ],
        choices: [
          { text: 'oh danke pia :)', label: 'Danke Pia :)' },
          { text: 'was isses?', label: 'Was isses?' },
          { text: 'wie bist du in meinen computer gekommen??', label: 'Wie??' },
        ],
      },
      thanks: {
        lines: [
          'bitte',
          'du musst es FÜR IMMER benutzen',
          'oder wenigstens ne woche',
        ],
        choices: [
          { text: 'für immer. versprochen', label: 'Versprochen' },
          { text: 'und wenn ichs nich mag', label: 'Und wenn nich?' },
        ],
      },
      what: {
        lines: [
          'is eine ÜBERRASCHUNG',
          'ok es sind ponys',
          'sternenstaub is drauf. in der MITTE natürlich',
        ],
        choices: [
          { text: 'ich guck gleich nach', label: 'Ich guck nach' },
          {
            text: 'aber wie bist du in meinen computer gekommen',
            label: 'Wie??',
          },
        ],
      },
      how: {
        lines: [
          'ich hab so meine METHODEN',
          '...papa hat geholfen',
          'er hat gesagt „nich {name} verraten“ also verrat dir nich dass ichs dir verraten hab',
        ],
        choices: [
          { text: 'dein geheimnis is sicher', label: 'Geheimnis is sicher' },
          { text: 'ich sags mama', label: 'Ich sag’s Mama' },
        ],
      },
      look: {
        lines: [
          'GUT',
          'rechtsklick auf den desktop. dann eigenschaften. dann GUCKEN',
          '',
        ],
        personalMessages: {
          2: 'hab {name} ein GESCHENK gemacht (L) bitte schön',
        },
      },
      dislike: {
        lines: [
          'du WIRST es mögen',
          'es glitzert. glitzer mag jeder',
          'wenn dus änderst sag ichs mama',
        ],
      },
      safe: {
        lines: [
          'gut',
          'jetzt schuldet papa mir nen puddingbecher weil ich SEIN geheimnis bewahrt hab',
        ],
      },
      telling: {
        lines: [
          'DU DARFST ES MAMA NICH SAGEN',
          'mama was sagen is MEIN job',
          'und geschenke können keinen ärger machen. das is ne REGEL',
        ],
      },
    },
    nowPlaying2: {
      floor: {
        lines: [
          '{name} ich hör deine musik',
          'durch die DECKE',
          'is das {title}?? ich mach grad mein pony-puzzle',
        ],
        choices: [
          { text: 'sorry ich mach leiser', label: 'Sorry' },
          { text: 'is doch gar nich laut', label: 'Is nich laut' },
        ],
      },
      down: {
        lines: [
          'danke',
          'du kannst wieder lauter machen wenn ich fertig bin',
          'in 2 stunden',
        ],
      },
      loud: {
        lines: [
          'die lampe WACKELT',
          'ich sags mama',
          '...nach dem song. der is irgendwie gut',
        ],
      },
    },
    gameScore: {
      better: {
        lines: [
          '{name} ich hab gesehen wie du {game} gespielt hast',
          'du hast {score}??',
          'ich bin besser',
          'jetzt bin ich am computer dran. das is die REGEL',
        ],
        choices: [
          {
            text: 'du kommst ja nich mal an die tasten',
            label: 'Kommst nich ran',
          },
          { text: 'ok gut. 10 minuten', label: 'Ok, 10 Minuten' },
        ],
      },
      reach: {
        lines: ['ICH KOMM DRAN', 'ich sags mama', ''],
        personalMessages: { 2: 'BESSER IM FLIPPERN ALS MANCHE LEUTE' },
      },
      turn: {
        lines: ['10 minuten is keine runde', 'ne runde geht bis ich gewinne'],
      },
    },
    // P4 replaces this with German (Top 8 drama, P0-03).
    'top8-dropped': {
      noticed: {
        lines: [
          '{name}',
          'I AM NOT IN UR TOP 8',
          'i checked on dads laptop. TWICE',
          'im telling mom',
        ],
        choices: [
          { text: 'pia its just a website', label: 'Its just a website' },
          { text: 'ok ok ill put u back', label: 'Ill put you back' },
        ],
      },
      website: {
        lines: [
          'MOOOOOOOM',
          g(
            'mom says be nice to ur sister. HA',
            'mom says be nice to ur brother. HA',
          ),
          '',
        ],
        personalMessages: { 2: 'NOT in a top 8. mom knows' },
      },
      back: {
        lines: ['u have 5 min', 'i am counting. 1. 2. 3', ''],
        personalMessages: { 2: 'waiting 4 my top 8 spot. 4. 5' },
      },
    },
    // P4 replaces this with German.
    'top8-readded': {
      back: {
        lines: [
          'ok i saw. im back in ur top 8',
          'i told mom u fixed it',
          g(
            'ur not the WORST sister. ur like the 3rd worst',
            'ur not the WORST brother. ur like the 3rd worst',
          ),
          '',
        ],
        personalMessages: { 3: 'back in the top 8. as i SHOULD be' },
      },
    },
  },
};
