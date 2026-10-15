// German text for dex (docs/localization-de.md → "Dex: slow, short, always Abwesend"). Same ids,
// same line and choice counts as `src/content/contacts/dex*.ts`; '' = a line without text.
import type { ContactOverlay } from '../../types';

export const dex: ContactOverlay = {
  personalMessage: 'skaten. schreib halt was',
  days: {
    2: { personalMessage: 'ladekabel gefunden. KAMERA LÄUFT' },
    3: { personalMessage: 'ruhe in frieden kassette nr. 1 (1998-2007)' },
    4: { personalMessage: 'gestanden. kamera: in der tasche' },
    5: { personalMessage: 'weltpremiere. 30 sek. kein geld zurück' },
  },
  scripts: {
    opening: {
      hi: {
        lines: [
          'oh. jo {name}',
          'ich bin immer abwesend ich weiß. ich vergess das umzustellen',
        ],
        choices: [
          { text: 'lol du bist IMMER abwesend', label: 'Immer abwesend' },
          { text: 'hey dex was geht', label: 'Was geht?' },
        ],
      },
      always: {
        lines: [
          'is so ne lebenseinstellung',
          'ich und die tastatur machen grad ne pause',
        ],
        choices: [{ text: 'voll tiefgründig' }, { text: 'und wo biste grad' }],
      },
      up: {
        lines: [
          'komm grad vom skatepark',
          'hab nen kickflip gestanden. endlich',
        ],
        choices: [
          { text: 'NEIN ECHT? fett!!', label: 'Fett!!' },
          { text: 'fotos oder es is nie passiert', label: 'Fotos?' },
        ],
      },
      pics: {
        lines: [
          'die digicam von meinem bruder is tot lol',
          'musst mir halt glauben',
        ],
        choices: [{ text: 'ok ich glaub dir' }, { text: 'nö :P' }],
      },
      nope: {
        lines: [
          'wow. tragisch',
          'ich machs morgen vor der schule. wirst schon sehen',
        ],
      },
      nice: {
        lines: ['thx :D', 'hat so 300 versuche gedauert'],
        choices: [
          { text: 'bringste mirs bei?', label: 'Bringst du’s mir bei?' },
          {
            text: 'mir tun schon vom drüber nachdenken die handgelenke weh',
            label: 'Autsch',
          },
        ],
      },
      teach: {
        lines: ['klar. samstag im park', 'bring nen helm mit. ernsthaft'],
        choices: [
          { text: 'abgemacht (Y)' },
          { text: 'MUSS ich den helm aufsetzen', label: 'Helm??' },
        ],
      },
      helmet: {
        lines: [
          'ja. meine mama würds irgendwie rausfinden. tut sie immer',
          'ok geh wieder raus. später',
        ],
      },
      deal: {
        lines: ['cool. ok geh wieder raus', ''],
        personalMessages: { 1: 'bring {name} sa. skaten bei' },
      },
      wrists: {
        lines: ['lol fair', 'ok geh wieder raus. später'],
      },
    },
    dinner: {
      gone: {
        lines: [
          '{name} biste noch da?',
          'egal. essen. bin ma kurz weg (eher nich)',
          '',
        ],
        personalMessages: { 2: 'essen. dann skaten. dann pennen.' },
      },
    },
    nudged: {
      huh: { lines: ['hä? oh. sry. war weg. wie immer'] },
    },
    followup1: {
      back: {
        lines: [
          'ok also',
          'hab den kickflip nochma probiert. so ne stunde',
          '0 mal gestanden',
        ],
        choices: [
          { text: 'lol also WAR das zufall', label: 'Zufall?' },
          { text: 'oh mann :( alles ok?', label: 'Alles ok?' },
        ],
      },
      fluke: {
        lines: [
          'das war KEIN zufall',
          'mein board is nur sauer auf mich',
          'ich habs ma im regen liegen lassen. das vergisst es nich',
        ],
        choices: [
          { text: 'entschuldig dich bei deinem board' },
          { text: 'boards haben keine gefühle dex', label: 'Keine Gefühle' },
        ],
      },
      sorry: {
        lines: [
          'hab ich schon. es hat nein gesagt',
          'kriegt neues grip tape. als geschenk',
          '',
        ],
        personalMessages: { 2: 'ich und mein board sind in paartherapie' },
      },
      feelings: {
        lines: [
          'das denkst du',
          'ok muss weg ellbogen kühlen. lange geschichte',
        ],
      },
      hurt: {
        lines: [
          'jo meistens',
          'mein ellbogen is jetzt lila. irgendwie cool',
          'sieht aus wie ne landkarte von australien',
        ],
        choices: [
          { text: 'tu eis drauf!!' },
          { text: 'lol zeig morgen', label: 'Zeig morgen' },
        ],
      },
      ice: {
        lines: [
          'das einzige eis hier is ne tüte erbsen',
          'ok. dann halt erbsen',
          '',
        ],
        personalMessages: { 2: 'ellbogen: lila. erbsen: gefroren.' },
      },
      show: {
        lines: [
          'abgemacht. bis dahin is er wahrscheinlich grün',
          'noch cooler',
        ],
      },
    },
    followup2: {
      cam: {
        lines: [
          '{name}',
          'große neuigkeiten',
          'hab den ALTEN camcorder von meinem bruder in der garage gefunden. geht noch',
          'auf den kassetten steht 1998 lol',
        ],
        choices: [
          {
            text: 'also gibts jetzt nen beweis für den kickflip?',
            label: 'Beweis!',
          },
          { text: 'omg mach n skatevideo!!', label: 'Skatevideo!!' },
          { text: 'stellste jetzt endlich deinen status um' },
        ],
      },
      status: {
        lines: [
          'welchen status',
          'oh. abwesend. ne das bleibt so',
          'egal. der camcorder',
        ],
        choices: [
          { text: 'lol ok. skatevideo?' },
          { text: 'film den kickflip!' },
        ],
      },
      proof: {
        lines: [
          'genau. kein „fotos oder es is nie passiert“ mehr',
          'aber ich brauch wen der ihn hält',
          'mein bruder meint er is „zu alt für sowas“',
        ],
        choices: [
          { text: 'ich film! (Y)', label: 'Ich film' },
          { text: 'nur wenn ich im abspann steh', label: 'Abspann bitte' },
        ],
      },
      video: {
        lines: [
          'jo das is der plan',
          'zeitlupe. fette musik. das volle programm',
          'biste dabei?',
        ],
        choices: [
          { text: 'sowas von dabei' },
          { text: 'nur wenn ich im abspann steh', label: 'Abspann bitte' },
        ],
      },
      credit: {
        lines: [
          'ok. „kamera: {name}“',
          'in großen buchstaben. nach meinem namen',
          'aber groß',
        ],
        choices: [{ text: 'abgemacht lol' }, { text: 'VOR deinem namen' }],
      },
      before: {
        lines: [
          'du bist echt gnadenlos',
          'na gut. gleich groß. letztes angebot',
          '',
        ],
        personalMessages: { 2: 'dex + {name} filmproduktion. bald im kino' },
      },
      film: {
        lines: [
          'fett',
          'muss erst ma das ladekabel finden. kp wo das is',
          'ok geh wieder raus. später',
          '',
        ],
        personalMessages: { 3: 'dreh n skatevideo. kamera: {name}' },
      },
    },
    day2: {
      action: {
        lines: [
          '{name}',
          'hab das ladekabel vom camcorder gefunden. war im mikrowellenkarton',
          'den ganzen tag im park gefilmt',
          'hab so 2 stunden auf kassette',
        ],
        choices: [
          { text: 'wie wars??', label: 'Wie war’s?' },
          {
            text: 'wieso war das im MIKROWELLENKARTON',
            label: 'Mikrowellenkarton??',
          },
        ],
      },
      microwave: {
        lines: [
          'mein bruder sagt das is „sortiert“',
          'in der garage stell ich keine fragen',
        ],
        choices: [
          { text: 'lol fair. und wie wars beim filmen?' },
          { text: 'deine familie is komisch dex' },
        ],
      },
      went: {
        lines: [
          'hauptsächlich ich wie ich hinfall',
          '40 stürze. hab auf der kassette gezählt',
          'irgendein typ is durchs bild gefahren und auch hingefallen. also is der jetzt mit drin',
        ],
        choices: [
          {
            text: 'aber haste den kickflip gestanden?',
            label: 'Der Kickflip?',
          },
          { text: 'mach doch ne pannenshow draus lol', label: 'Pannenshow' },
        ],
      },
      kickflip: {
        lines: [
          'fast. so 3 mal',
          'das board hat ihn gestanden. ich nich',
          'morgen auf jeden fall',
          '',
        ],
        personalMessages: { 3: 'klappe 41. geht weiter' },
      },
      blooper: {
        lines: [
          'hm',
          'is eigentlich gar nich schlecht',
          'teil 1: stürze. teil 2: der kickflip. falls teil 2 passiert',
          '',
        ],
        personalMessages: { 3: 'skatevideo teil 1: stürze (fertig)' },
      },
    },
    day3: {
      tape: {
        lines: [
          '{name}',
          'schlechte nachrichten',
          'der camcorder hat die kassette gefressen',
          'so richtig GEFRESSEN. band kommt raus wie spaghetti',
        ],
        choices: [
          { text: 'NEEEIN. alles??', label: 'Alles??' },
          { text: 'kannste das band zurückspulen?', label: 'Zurückspulen?' },
          { text: 'ruhe in frieden' },
        ],
      },
      pencil: {
        lines: [
          'mein bruder meinte nimm nen bleistift. wie bei kassetten',
          'also hab ich nen bleistift genommen',
          'jetzt steckt der bleistift auch im camcorder',
        ],
        choices: [{ text: 'oh nein dex' }, { text: 'lol na klar' }],
      },
      rip: {
        lines: [
          'jo. ruhe in frieden',
          'war ne kassette von 1998. die hatte ein langes leben',
        ],
        choices: [
          { text: 'du kannst nochma filmen!', label: 'Nochmal filmen!' },
          { text: 'ne schweigeminute für die kassette' },
        ],
      },
      all: {
        lines: [
          'alle 40 stürze. weg',
          'vllt war die welt eh noch nich bereit dafür',
        ],
        choices: [
          { text: 'morgen nochma filmen?', label: 'Morgen nochmal?' },
          {
            text: 'wenigstens haste noch die erinnerungen',
            label: 'Die Erinnerungen',
          },
        ],
      },
      again: {
        lines: [
          'jo. bruder hat noch 1 kassette. da steht 1999 drauf',
          'neuer. also besser',
          'ok geh wieder raus. später',
          '',
        ],
        personalMessages: { 3: 'camcorder: 1. ich: 0' },
      },
      memories: {
        lines: [
          'tiefgründig',
          'mein ellbogen erinnert sich auch',
          'ok muss den bleistift rausholen. später',
          '',
        ],
        personalMessages: {
          3: 'vermisst: 1 bleistift. zuletzt gesehen: camcorder',
        },
      },
    },
    day4: {
      landed: {
        lines: [
          '{name}',
          'ok also',
          'ich hab ihn gestanden',
          'den kickflip. sauber. bin weggerollt und alles',
          'kamera war in der tasche. mit objektivdeckel drauf',
        ],
        choices: [
          { text: 'NEIN ECHT?? glückwunsch!!', label: 'Glückwunsch!!' },
          {
            text: 'fotos oder es is nie passiert :P',
            label: 'Fotos oder es is nie passiert',
          },
        ],
      },
      congrats: {
        lines: [
          'thx :D',
          'ich stand da so ne minute einfach rum',
          'dann bin ich umgefallen. aber DANACH. also zählt das',
        ],
        choices: [
          { text: 'das zählt voll' },
          { text: 'hats wer gesehen??', label: 'Wer gesehen?' },
        ],
      },
      pics: {
        lines: ['ich WUSSTE dass du das sagst', 'es gab aber nen zeugen'],
        choices: [{ text: 'wen??' }, { text: 'ok gut ich glaub dir' }],
      },
      witness: {
        lines: [
          'so n kleiner junge. so 7',
          'der hat „boah“ gesagt. dann hat seine mama ihn mitgenommen',
        ],
        choices: [
          { text: 'der kleine zählt (Y)', label: 'Kleiner zählt' },
          { text: 'ein kind is kein beweis dex', label: 'Kein Beweis' },
        ],
      },
      proof: {
        lines: [
          'der war SEHR sicher',
          'er hat mit mir abgeklatscht. das is quasi ne unterschrift',
          'egal. morgen mach ich das video. irgendwie',
          '',
        ],
        personalMessages: {
          3: 'gestanden. zeuge: 1 kind. unterschrift: abklatschen',
        },
      },
      counts: {
        lines: [
          'genau',
          'morgen mach ich das video mit dem was von der kassette übrig is',
          'is nich viel. ok später',
          '',
        ],
        personalMessages: { 3: 'kickflip: gestanden. kamera: hat gepennt' },
      },
    },
    day5: {
      premiere: {
        lines: [
          '{name}',
          'es is fertig. das video',
          'heut morgen den rest von der 1999er kassette vollgefilmt',
          'is 30 sekunden lang. is eher so verschwommen',
          'so richtig verschwommen. man sieht orange. das is mein shirt',
        ],
        choices: [
          { text: 'schick rüber!!', label: 'Schick’s mir!!' },
          { text: 'verschwommen?? lol', label: 'Verschwommen??' },
        ],
      },
      send: {
        lines: [
          'is auf kassette. ne kassette kann ich nich schicken',
          'musst vorbeikommen und es am fernseher gucken',
          'mein bruder hats angeschlossen. hat ne stunde gedauert',
        ],
        choices: [
          { text: 'ich komm (Y)', label: 'Ich komm' },
          { text: 'beschreibs mir einfach', label: 'Beschreib’s' },
        ],
      },
      blur: {
        lines: [
          'KÜNSTLERISCH verschwommen',
          'bei sekunde 22 is n geräusch. das is der kickflip',
          'sehen kann man ihn nich. aber hören',
        ],
        choices: [
          { text: 'das is so typisch dex' },
          { text: 'beschreib das ganze video', label: 'Beschreib’s' },
        ],
      },
      describe: {
        lines: [
          'ok',
          '0-10: himmel. 10-20: boden. 20-22: orange',
          '22: das geräusch',
          '23-27: mein bruder brüllt „nimmt das auf“',
        ],
        choices: [
          { text: 'das is ein meisterwerk' },
          { text: 'und die letzten 3 sekunden?', label: '27-30?' },
        ],
      },
      credits: {
        lines: [
          'der abspann',
          'hab „besonderer dank an: {name}“ auf n zettel geschrieben und gefilmt',
          'schärfste einstellung im ganzen video',
          '',
        ],
        personalMessages: { 3: 'besonderer dank an: {name}. du weißt warum' },
      },
      there: {
        lines: [
          'cool. bring chips mit',
          'is 30 sek also können wirs so 50 mal gucken',
          '',
        ],
        personalMessages: { 2: 'premiere bei mir. chips mitbringen' },
      },
      proud: {
        lines: [
          'thx',
          'ehrlich das beste was ich je gemacht hab',
          'meine mama hats zweimal geguckt. beide male „sehr schön dex“',
          '',
        ],
        personalMessages: {
          3: 'dex filmproduktion präsentiert: verschwommen (30 sek)',
        },
      },
    },
    nowPlaying2: {
      rock: {
        lines: [
          'jo',
          'cool rock',
          'wer hat sich den namen ausgedacht. so als hätte einer nen stein angeguckt und gesagt jo. cooler stein',
        ],
        choices: [
          { text: 'das is doch n skatesong oder', label: 'Skatesong?' },
          { text: 'lol dex was' },
        ],
      },
      skate: {
        lines: [
          '100%',
          'wenn ich jemals n skatevideo mach is das der song',
          'bräucht aber wen mit camcorder. wink mit dem zaunpfahl',
        ],
      },
      what: {
        lines: ['ich mein ja nur', 'is n guter stein', 'ok zurück in den park'],
      },
    },
    gameScore: {
      nice: {
        lines: [
          'hab deinen punktestand bei {game} gesehen',
          '{score}',
          'nich schlecht. ich hatte ma 2 millionen. glaub ich',
          'kann auch n traum gewesen sein',
        ],
        choices: [
          { text: 'fotos oder es is nie passiert', label: 'Beweis?' },
          { text: '2 millionen is ne menge dex', label: 'Ganz schön viel' },
        ],
      },
      proof: {
        lines: ['hab ich gefilmt', 'objektivdeckel war drauf'],
      },
      lot: {
        lines: ['jo', 'ich war ma eine nacht lang richtig gut im flippern'],
      },
    },
  },
};
