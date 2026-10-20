// German text for Jess, days 6–10 (W3-01; `src/content/contacts/jess-week2.ts`) and her girl-only
// threads (`jess-girl.ts`, one side only, no `g()`). docs/localization-de.md → "Jess: loud, ALL
// CAPS, nudges" and "v0.5: week two". Same ids, line and choice counts; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const jessWeek2Days: ContactOverlay['days'] = {
  6: { personalMessage: 'ZIGGY HAT DAS ANGEFASST (hängt jetzt überm bett)' },
  7: { personalMessage: 'FAN-ART-WETTBEWERB!!!!! (ich GEWINNE)' },
  8: { personalMessage: 'LAKEVIEW AUSVERKAUFT!!!!!!!!! :(' },
  9: {
    personalMessage: `2. PLATZ!!!!! signierte setlist ${g('(L)', '(Y)')}`,
  },
  10: { personalMessage: 'heute abend juz!!! SCHILD: FERTIG' },
};

export const jessWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    bruise: {
      lines: [
        '{name}!!!!',
        'STIRN-UPDATE',
        'die is jetzt LILA. so traubensaft-lila',
        'mein bruder sagt das is ein stern wenn man die augen zukneift. ICH KNEIF JETZT DAUERND DIE AUGEN ZU',
      ],
      choices: [
        { text: 'is deine stirn ok??', label: 'Stirn ok?' },
        {
          text: g('lass die einrahmen!!', 'alter. kampfnarbe'),
          label: g('Einrahmen!', 'Kampfnarbe'),
        },
        { text: 'is deine mama ausgeflippt', label: 'Mama ausgeflippt?' },
      ],
    },
    ok: {
      lines: [
        'is GUT. tut nur weh wenn ich draufdrück',
        'also drück ich so alle 5 min drauf',
        'zum NACHGUCKEN',
      ],
      choices: [
        { text: 'hör auf da draufzudrücken lol' },
        { text: 'so funktioniert heilen nich' },
      ],
    },
    scar: {
      lines: [
        g(
          'MEIN GESICHT EINRAHMEN?? lol {name}',
          'KAMPFNARBE. JA. so heißt das ab jetzt',
        ),
        g(
          'ok mein gesicht kann ich nich einrahmen. aber ich HAB was eingerahmt',
          'die hab ich aus der SCHLACHT. der schlacht um den drumstick',
        ),
      ],
      choices: [
        { text: 'was denn noch??', label: 'Was noch?' },
        { text: 'erzähl ALLES' },
      ],
    },
    mom: {
      lines: [
        'sie hat gefragt warum ich ne lila stirn UND nen drumstick hab',
        'ich so „rock n roll mama“',
        'sie so „ab ins bett jessica“',
        'es war 4 uhr nachmittags',
      ],
      choices: [{ text: 'LOOOL jessica' }, { text: 'na ja. fair' }],
    },
    wall: {
      lines: [
        'ok GROSSE NEUIGKEITEN',
        'der drumstick is UMGEZOGEN',
        'der lag unterm kopfkissen aber ich hab mich draufgerollt. AUA. schon wieder',
        'jetzt hängt er an 2 nägeln überm bett',
        'mit schild. ZIGGY HAT DAS ANGEFASST',
        '',
      ],
      choices: [
        { text: 'das is ein schrein!!', label: 'Ein Schrein!' },
        {
          text: g('der is perfekt (L)', 'respekt. \\m/'),
          label: g('Perfekt', 'Respekt'),
        },
      ],
      personalMessages: { 5: 'stirn: lila. herz: ZIGGY' },
    },
    museum: {
      lines: [
        'das is kein schrein. das is ein MUSEUM',
        'führungen sind gratis. für dich',
        g('alle anderen zahlen in glitzer (L)', 'alle anderen zahlen (Y)'),
      ],
    },
  },
  day7: {
    contest: {
      lines: [
        '{name} {name}',
        'WETTBEWERB. AUF DER FANSEITE',
        'FAN-ART. thema: „die comets im weltall“',
        'und abgabe is MORGEN',
      ],
      choices: [
        { text: 'was machst du??', label: 'Was machst du?' },
        { text: 'morgen?? das is ja voll knapp', label: 'Voll knapp!' },
      ],
    },
    soon: {
      lines: [
        'ICH WEISS. unter druck bin ich am besten',
        'und unter glitzer',
        'der plan: ne collage. ziggys drumstick-wirbel. IM WELTALL',
      ],
      choices: [
        { text: 'nimm den kartenabriss!', label: 'Kartenabriss!' },
        {
          text: g(
            'glitzer = du gewinnst. mehr sterne. mehr glitzer',
            'da müssen flammen drauf. weltall-flammen',
          ),
          label: g('Glitzer = Sieg', 'Flammen'),
        },
      ],
    },
    plan: {
      lines: [
        'ne COLLAGE',
        'ziggys drumstick-wirbel. IM WELTALL',
        'sterne aus zeitschriften. alufolie. und der drumstick is natürlich die hauptfigur',
      ],
      choices: [
        { text: 'nimm den kartenabriss!', label: 'Kartenabriss!' },
        {
          text: g(
            'glitzer = du gewinnst. mehr sterne. mehr glitzer',
            'da müssen flammen drauf. weltall-flammen',
          ),
          label: g('Glitzer = Sieg', 'Flammen'),
        },
      ],
    },
    stub: {
      lines: [
        'DER KARTENABRISS',
        'in die MITTE. wie ein planet',
        'du bist genial {name}. ein GENIE',
      ],
      choices: [
        { text: 'ich weiß :P' },
        { text: 'das is ein heiliger kartenabriss', label: 'Heiliger Abriss' },
      ],
    },
    extra: {
      lines: [
        g('MEHR. JA. zu viel glitzer gibts nich', 'FLAMMEN??'),
        g(
          'meine katze hat auch wieder welchen abgekriegt. egal. die is das gewohnt',
          '...ok EINE flamme. ne KLEINE',
        ),
        g(
          'mehr sterne. mehr glitzer. MEHR',
          'in die ecke. ne geschmackvolle WELTALL-flamme',
        ),
      ],
      choices: [
        { text: 'ziggy wird das LIEBEN' },
        {
          text: g('perfekt', 'mit flammen is alles besser'),
          label: g('Perfekt', 'Flammen sind besser'),
        },
      ],
    },
    done: {
      lines: [
        'ok is FERTIG',
        'das is 40% glitzer und 60% LIEBE',
        '',
        `meine mama schickt das heute abend ab. drück mir die daumen!!! ${g('(L)', '(Y)')}`,
      ],
      personalMessages: { 2: 'collage: 40% glitzer 60% LIEBE' },
    },
  },
  day8: {
    sold: {
      lines: [
        '{name}',
        'LAKEVIEW',
        'AUSVERKAUFT',
        'IN 9 MINUTEN',
        'ich war die GANZE zeit am telefon. hab 40 mal das besetztzeichen gehört',
        'mir gehts NICH gut',
      ],
      choices: [
        {
          text: g(
            'die spielen noch andere konzerte',
            'die comets kommen wieder. bands kommen immer wieder',
          ),
          label: g('Andere Konzerte', 'Die kommen wieder'),
        },
        {
          text: 'du hast schon nen DRUMSTICK gefangen',
          label: 'Du hast nen Drumstick',
        },
        { text: 'komm zu marcos show!', label: 'Marcos Show!' },
      ],
    },
    other: {
      lines: [
        'ANDERE KONZERTE',
        'und wenn die nie wiederkommen {name}',
        'und wenn die ins WELTALL ziehen. in echt',
      ],
      choices: [
        { text: 'dann spielen die halt im weltall' },
        { text: 'die kommen wieder' },
      ],
    },
    drumstick: {
      lines: [
        '...',
        'stimmt eigentlich',
        'keiner in lakeview fängt nen drumstick mit dem GESICHT',
        'ich bin einzigartig',
      ],
      choices: [
        { text: 'genau' },
        {
          text: 'und du hast den blauen fleck als beweis',
          label: 'Der Fleck!',
        },
      ],
    },
    marco: {
      lines: ['marcos show??', 'die von velvet lantern?? im juz?', 'mom'],
      choices: [{ text: 'ich wart' }, { text: 'was' }],
    },
    same: {
      lines: [
        'WARTE',
        'lakeview is samstag',
        'marcos show is samstag',
        'DAS IS DERSELBE ABEND',
        'ok is entschieden. ich geh zu marcos show',
        '',
        'und das heißt',
        'ICH BRAUCH EIN NEUES SCHILD',
      ],
      personalMessages: { 5: 'in trauer. (aber velvet lantern??)' },
    },
  },
  day9: {
    place: {
      lines: [
        '{name}!!!!!',
        '2. PLATZ',
        'ICH BIN 2. BEIM FAN-ART-WETTBEWERB',
        'der preis is die setlist von riverside. SIGNIERT. von allen 4',
        'ziggy hat ZWEIMAL unterschrieben',
        '1. wurde spacegirl4eva. die hat ne keytar aus MAKKARONI gebastelt',
        'ICH HAB GEGEN NUDELN VERLOREN',
      ],
      choices: [
        { text: '2. platz is der hammer!!', label: '2. ist der Hammer' },
        {
          text: g('das war BETRUG', 'nudeln sind keine kunst'),
          label: g('Betrug!', 'Nudeln ≠ Kunst'),
        },
        {
          text: 'häng sie neben den drumstick',
          label: 'Neben den Drumstick',
        },
      ],
    },
    amazing: {
      lines: [
        'er IS der hammer',
        'ich war nur dramatisch. kayla färbt auf mich ab',
        'ZIGGYS NAME. ZWEIMAL',
      ],
      choices: [
        { text: 'zweimal!!' },
        { text: 'und jetzt', label: 'Und jetzt?' },
      ],
    },
    robbed: {
      lines: [
        g(
          'BETRUG. von NUDELN. danke {name}',
          'du darfst nich in die nähe von meinem glitzer. du wolltest FLAMMEN',
        ),
        g(
          'wenigstens wird meine collage nich matschig',
          '...aber ok. nudeln sind keine kunst. danke',
        ),
        'ok ich bin drüber weg. größtenteils',
      ],
      choices: [
        { text: 'größtenteils lol' },
        { text: 'und jetzt', label: 'Und jetzt?' },
      ],
    },
    drumstick: {
      lines: [
        'HAB ICH SCHON',
        'drumstick oben. setlist drunter',
        'meine wand wird BERÜHMT',
      ],
      choices: [
        { text: 'das museum wächst' },
        { text: 'und jetzt', label: 'Und jetzt?' },
      ],
    },
    sign: {
      lines: [
        'ok. NÄCHSTES PROJEKT',
        'neues schild. fürs juz',
        'da steht: MARCO WIRF EIN PLEKTRUM',
        '',
        'er MUSS. is in GROSSBUCHSTABEN',
      ],
      personalMessages: { 3: 'NEUES SCHILD: MARCO WIRF EIN PLEKTRUM' },
    },
  },
  day10: {
    threw: {
      lines: [
        '{name}!!!!!!',
        'ER HATS GEWORFEN',
        'MARCO. HAT. EIN PLEKTRUM. GEWORFEN',
        'er hat mein schild gelesen und „nein“ ins mikro gesagt. das hing verkehrt rum',
        'und dann beim LETZTEN SONG hat ers einfach. geworfen',
        'UND ICH HABS GEFANGEN',
      ],
      choices: [
        { text: 'mit der HAND??', label: 'Mit der Hand??' },
        { text: 'hats deine stirn getroffen lol', label: 'Deine Stirn lol' },
        { text: 'wo kommts hin?', label: 'Wo kommts hin?' },
      ],
    },
    hand: {
      lines: [
        'MIT DER HAND',
        'wie ein NORMALER mensch',
        'ich bin ERWACHSEN geworden {name}',
      ],
      choices: [{ text: 'bin so stolz' }, { text: 'charakterentwicklung' }],
    },
    forehead: {
      lines: [
        'NEIN',
        'meine stirn is in RENTE',
        'mit der hand gefangen. beim ersten versuch',
      ],
      choices: [
        { text: 'ein echter profi' },
        { text: 'die stirn hat sich die pause verdient' },
      ],
    },
    where: {
      lines: [
        'WO KOMMTS HIN',
        'neben den drumstick und die setlist. logisch',
        'ich hab jetzt ein system',
      ],
      choices: [{ text: 'ein system??' }, { text: 'zeig her' }],
    },
    shrine: {
      lines: [
        'der drumstick. die setlist. das plektrum',
        'das is kein museum mehr. das is DER SCHREIN',
        '',
        'die comets haben übrigens heute abend in lakeview gespielt',
        'IS MIR SOWAS VON EGAL',
        'ok n bisschen schon',
      ],
      choices: [{ text: 'nur n bisschen' }, { text: 'das juz war eh besser' }],
      personalMessages: {
        2: 'MARCO HAT EIN PLEKTRUM GEWORFEN. ICH HABS GEFANGEN. MIT DER HAND',
      },
    },
    best: {
      lines: [
        'es WAR besser. ich konnte marcos gesicht sehen',
        'der hat SO genervt geguckt. war super',
        `beste woche ALLER ZEITEN ${g('(L) hdgdl', '(Y)')}`,
      ],
    },
  },
};

export const jessGirlThreads: ContactOverlay['scripts'] = {
  lateNight: {
    awake: {
      lines: [
        '{name}',
        'biste wach',
        'meine mama denkt ich schlaf',
        'ich tipp ganz LEISE',
      ],
      choices: [
        { text: 'bin wach. was los', label: 'Bin wach' },
        {
          text: 'jess deine feststelltaste is NICH leise',
          label: 'Feststelltaste is laut',
        },
      ],
    },
    quiet: {
      lines: [
        'pssssst',
        'siehste. kleinbuchstaben. wie ein NINJA',
        'ok das eben war laut',
      ],
      choices: [{ text: 'lol ok was los' }, { text: 'flüster es' }],
    },
    talk: {
      lines: [
        'ok also. lakeview is weg. is GUT so',
        'das juz is klein. da sieht man die band wenigstens RICHTIG',
        'und mein neues schild wird das beste schild der GESCHICHTE',
        'und noch was',
        'theo sagt so SÜSS sorry zu dir. ich mein ja nur',
      ],
      choices: [
        { text: '...vielleicht', label: '...vielleicht' },
        { text: 'JESSSS', label: 'JESS!' },
        { text: 'geh schlafen lol', label: 'Geh schlafen' },
      ],
    },
    maybe: {
      lines: [
        'VIELLEICHT',
        'ok ich sag gar nix. ich GRINSE nur',
        'ok ok. gn8 (L)',
      ],
    },
    jess: {
      lines: [
        'WAS. ich beobachte nur',
        'ich beobachte halt sehr gut',
        'ok ok. gn8 (L)',
      ],
    },
    sleep: {
      lines: [
        'du lenkst immer ab lol',
        'ich hab meine mama auf der treppe gehört',
        'ok ok. gn8 (L)',
      ],
    },
  },
  signWorkshop: {
    workshop: {
      lines: [
        '{name}!!!',
        'SCHILD-WERKSTATT. JETZT',
        'pappe: CHECK. glitzerkleber: 4 farben',
        'MARCO WIRF EIN: fertig',
        'welche farbe kriegt PLEKTRUM??',
      ],
      choices: [
        { text: 'silber. wie ein echtes plektrum', label: 'Silber' },
        { text: 'rosa!! knallrosa', label: 'Rosa' },
      ],
    },
    silver: {
      lines: [
        'SILBER. edel. das wird er respektieren',
        'nächste frage',
        'mal ich ne laterne dazu?? is der BANDNAME',
      ],
      choices: [
        { text: 'ja!! ne kleine laterne', label: 'Laterne dazu' },
        { text: 'nee, nur glitzer', label: 'Nur Glitzer' },
      ],
    },
    pink: {
      lines: [
        'ROSA. das wird er HASSEN. perfekt',
        'nächste frage',
        'mal ich ne laterne dazu?? is der BANDNAME',
      ],
      choices: [
        { text: 'ja!! ne kleine laterne', label: 'Laterne dazu' },
        { text: 'nee, nur glitzer', label: 'Nur Glitzer' },
      ],
    },
    lantern: {
      lines: [
        'ne laterne in der ecke. wie auf theos poster',
        'die leuchtet. mit GLITZER',
      ],
      choices: [{ text: 'is perfekt' }, { text: 'jetzt MUSS marco werfen' }],
    },
    plain: {
      lines: [
        'nur glitzer. der KLASSIKER',
        'weniger is mehr. außer glitzer. glitzer is mehr',
      ],
      choices: [{ text: 'is perfekt' }, { text: 'jetzt MUSS marco werfen' }],
    },
    cat: {
      lines: [
        'WARTE',
        'die katze is grad drübergelaufen. SCHON WIEDER',
        'ein 2. PFOTENABDRUCK',
        'das is jetzt ne SERIE',
        '',
      ],
      personalMessages: { 4: 'schild: FERTIG. katze: auch fertig' },
    },
  },
};
