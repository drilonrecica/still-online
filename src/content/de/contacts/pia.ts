// German text for pia (docs/localization-de.md → "Pia: the bossy little sister"). Same ids, same
// line and choice counts as `src/content/contacts/pia*.ts`; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';
import { piaWeek2Days, piaWeek2Scripts } from '../../contacts/pia-week2';
import { placeholderDays, placeholderScripts } from './placeholder';

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
    5: {
      personalMessage: g(
        'ich hab wem ein GESCHENK gemacht (L) rate ma wem',
        'ich hab wem ein GESCHENK gemacht (Y) rate ma wem',
      ),
    },
    // Days 6–10: placeholders until W3.
    ...placeholderDays(piaWeek2Days),
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
          {
            text: g('ein fohlen', 'ein fohlen. logisch. kann ich jetzt gehen'),
          },
          { text: g('ein pony', 'ein kalb') },
          { text: g('ein pferdchen', 'n mini-esel lol') },
        ],
      },
      right: {
        lines: ['RICHTIG!!! :D', 'du bist ja doch nich so doof', ''],
        personalMessages: {
          2: g(
            '{name} kennt sich mit pferden aus (Y)',
            '{name} is nich GANZ doof (Y)',
          ),
        },
      },
      wrong: {
        lines: [
          'FALSCH lol',
          g(
            'es is ein FOHLEN. ein pony is was ganz anderes',
            'es is ein FOHLEN. kein kalb. kein esel. ein FOHLEN',
          ),
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
          { text: g('süß :)', 'chefin vom hundenapf vielleicht') },
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
        lines: [
          g('das is nich SÜSS das is WAHR', 'der hundenapf gehört AUCH mir'),
          g('aber danke', 'keks is meiner meinung. 2 gegen 1'),
        ],
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
            text: g(
              'ok ich hab EIN pony verstellt',
              'ok ich hab EINS von deinen plastikviechern verstellt',
            ),
            label: g('Ein Pony verstellt', 'Eins verstellt'),
          },
          {
            text: g(
              'ich hab deine ponys nach farben sortiert. bitte schön',
              'ich hab deine ganze armee nach farben aufgestellt. bitte schön',
            ),
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
          {
            text: g('großes ehrenwort', 'in die hand spucken und einschlagen?'),
            label: g('Großes Ehrenwort', 'Spucken + einschlagen'),
          },
          {
            text: g('ich mach keine ehrenworte', 'ich bin doch nich 6 pia'),
            label: g('Kein Ehrenwort', 'Bin nich 6'),
          },
        ],
      },
      pinky: {
        lines: [
          g('ok. ich glaub dir. erstmal', 'IHHH. ok. ich glaub dir. erstmal'),
          'ich mach ein VERMISST-plakat',
          '',
        ],
        personalMessages: {
          2: 'BELOHNUNG für sternenstaub: 1 aufkleber (n guter)',
        },
      },
      mom: {
        lines: [
          g(
            'ich sags mama dass du kein ehrenwort gibst',
            'ich sags mama dass du auf GAR NIX schwörst',
          ),
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
          {
            text: g('glitzer?', 'der hund hat jetzt bling?'),
            label: g('Glitzer?', 'Bling?'),
          },
          {
            text: g(
              'fall abgeschlossen. verhaften',
              'fall abgeschlossen. ich bewach die zelle',
            ),
            label: g('Verhaften', 'Ich bin der Wärter'),
          },
        ],
      },
      sparkle: {
        lines: [
          'SILBERNER glitzer. wie die HAARE von sternenstaub',
          'ok vielleicht is der von meinem glitzerstift. aber VIELLEICHT AUCH NICH',
        ],
        choices: [
          {
            text: g(
              'dein glitzerstift is aber überall',
              'boah dein stift läuft überall aus. mein controller GLÄNZT jetzt',
            ),
            label: g('Glitzer is überall', 'Dein Stift läuft aus'),
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
          g(
            'er is drin eingeschlafen. verbrecher haben KEIN SCHAMGEFÜHL',
            'er is drin eingeschlafen. verbrecher haben KEIN SCHAMGEFÜHL. du bist jetzt der WÄRTER',
          ),
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
          {
            text: g('juhu sternenstaub!!', 'cool. die königin lebt'),
            label: g('Juhu Sternenstaub!!', 'Die Königin lebt'),
          },
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
          {
            text: g('oh danke pia :)', 'oh. danke. glaub ich'),
            label: g('Danke Pia :)', 'Danke, glaub ich'),
          },
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
          2: g(
            'hab {name} ein GESCHENK gemacht (L) bitte schön',
            'hab {name} ein GESCHENK gemacht (Y) bitte schön',
          ),
        },
      },
      dislike: {
        lines: [
          'du WIRST es mögen',
          g(
            'es glitzert. glitzer mag jeder',
            'da is ein REGENBOGEN drauf. jungs dürfen auch regenbögen mögen. is ne TATSACHE',
          ),
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
    // Top 8 drama (P0-03).
    'top8-dropped': {
      noticed: {
        lines: [
          '{name}',
          'ICH BIN NICHT IN DEINER TOP 8',
          'ich habs an papas laptop nachgeguckt. ZWEIMAL',
          'ich sags mama!!',
        ],
        choices: [
          { text: 'pia das is doch nur ne website', label: 'Nur ne Website' },
          {
            text: 'ok ok ich nehm dich wieder rein',
            label: 'Ich nehm dich rein',
          },
        ],
      },
      website: {
        lines: [
          'MAMAAAAAA',
          g(
            'mama sagt du sollst lieb zu deiner schwester sein. HA',
            'mama sagt du sollst lieb zu deinem bruder sein. HA',
          ),
          '',
        ],
        personalMessages: { 2: 'NICHT in einer top 8. mama weiß bescheid' },
      },
      back: {
        lines: ['du hast 5 min', 'ich zähle. 1. 2. 3', ''],
        personalMessages: { 2: 'warte auf meinen top-8-platz. 4. 5' },
      },
    },
    'top8-readded': {
      back: {
        lines: [
          'ok habs gesehen. ich bin wieder in deiner top 8',
          'ich hab mama gesagt dass dus repariert hast',
          g(
            'du bist nicht die SCHLIMMSTE schwester. eher so die drittschlimmste',
            'du bist nicht der SCHLIMMSTE bruder. eher so der drittschlimmste',
          ),
          '',
        ],
        personalMessages: { 3: 'wieder in der top 8. wie es sich GEHÖRT' },
      },
    },
    // Days 6–10 (W1-02): placeholders until W3.
    ...placeholderScripts(piaWeek2Scripts),
  },
};
