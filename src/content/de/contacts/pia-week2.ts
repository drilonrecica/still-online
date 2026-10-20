// German text for Pia, days 6–10 (docs/localization-de.md → "Pia: the bossy little sister",
// "v0.5: week two"). Same ids, same line and choice counts as `src/content/contacts/pia-week2.ts`;
// '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const piaWeek2Days: ContactOverlay['days'] = {
  6: { personalMessage: 'ICH BRAUCH NEN HAMSTER (kein witz)' },
  7: { personalMessage: 'HEUTE ABEND vortrag bei mama' },
  8: { personalMessage: 'mama hat MAL SEHEN gesagt :(' },
  9: { personalMessage: 'FISCH. (kein hamster) (trotzdem ein haustier)' },
  10: { personalMessage: 'DARF NICH ZUR SHOW. UNFAIR!!' },
};

export const piaWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    hamster: {
      lines: [
        '{name}!!',
        'ich brauch nen HAMSTER',
        'KEIN witz',
        'er heißt professor knabber. es gibt ihn noch nich aber so heißt er',
      ],
      choices: [
        {
          text: g('omg ein hamster!!', 'is ne maus mit nem plan'),
          label: g('Ein Hamster!!', 'Maus mit Plan'),
        },
        { text: 'und was is mit keks?', label: 'Und Keks?' },
        { text: 'hamster beißen aber', label: 'Die beißen' },
      ],
    },
    yay: {
      lines: [
        g('ICH WEISS', 'ne maus mit nem PLAN is die BESTE sorte'),
        'er kriegt ein laufrad UND ne burg. die burg is zum nachdenken',
      ],
      choices: [
        { text: 'weiß mama das?', label: 'Weiß Mama das?' },
        { text: 'ne nachdenk-burg??' },
      ],
    },
    biscuit: {
      lines: [
        'keks is ein HUND',
        'hunde und hamster sind verschiedene abteilungen',
        'außerdem is keks noch auf bewährung wegen dem sternenstaub-fall',
      ],
      choices: [{ text: 'stimmt' }, { text: 'armer keks' }],
    },
    bite: {
      lines: [
        'nur wenn man GEMEIN zu ihnen is',
        'professor knabber beißt nich. er is PROFESSOR',
      ],
      choices: [
        { text: 'professoren beißen manchmal' },
        { text: 'ok überzeugt' },
      ],
    },
    essay: {
      lines: [
        'jedenfalls hab ichs aufgeschrieben',
        'WARUM ICH EINEN HAMSTER BRAUCHE. an papas laptop',
        'mit 10 gründen. grund 10 is „ich bin fast 10"',
        `ich habs dir gemailt. LIES ES. du bist ${g('meine zeugin', 'mein zeuge')}`,
        '',
        'sags mama noch nich. mama was sagen is MEIN job',
      ],
      personalMessages: { 4: 'WARUM ICH EINEN HAMSTER BRAUCHE: 10 gründe' },
    },
  },
  day7: {
    show: {
      lines: [
        '{name}!!',
        'HEUTE ABEND is der vortrag',
        'ich hab in paint was gemalt. professor knabber in seiner burg',
        'nach dem abendessen. wohnzimmer. mama auf dem sofa',
        'du bist das publikum',
        'das publikum das KLATSCHT',
      ],
      choices: [
        {
          text: g('ich klatsch!', 'na gut. einmal klatschen'),
          label: g('Ich klatsch', 'Einmal klatschen'),
        },
        { text: 'mach noch ne grafik dazu', label: 'Ne Grafik dazu' },
        { text: 'mama sagt eh nein', label: 'Mama sagt nein' },
      ],
    },
    clap: {
      lines: [
        g('GUT. klatsch LAUT', 'EINMAL?? ok. aber einmal LAUT'),
        'und sag WOW bei der burg',
      ],
      choices: [{ text: 'wooow' }, { text: 'und wenn ich lachen muss' }],
    },
    graph: {
      lines: [
        'ne GRAFIK',
        'ja. ne grafik wie glücklich ich sein werde',
        'die geht nur NACH OBEN',
      ],
      choices: [{ text: 'mama liebt grafiken' }, { text: 'genial' }],
    },
    no: {
      lines: [
        'sagt sie NICH',
        'nich nach der burg',
        'und wenn doch sag ichs... ok ich kann mama nich bei mama verpetzen',
      ],
      choices: [{ text: 'sags papa' }, { text: 'viel glück' }],
    },
    done: {
      lines: [
        'ok es is VORBEI',
        'danke fürs klatschen',
        'keks hat auch geklatscht. er hat gebellt. is dasselbe',
        'mama hat gesagt „ich denk drüber nach"',
        '',
        'nachdenken is GUT. nachdenken is fast ja',
      ],
      personalMessages: { 4: 'vortrag: FERTIG. mama: denkt nach' },
    },
  },
  day8: {
    weSee: {
      lines: [
        '{name}!!',
        'mama hat „mal sehen" gesagt',
        'jeder weiß dass mal sehen NEIN heißt',
        'das is so ne mama-regel',
      ],
      choices: [
        { text: 'ich red mit ihr', label: 'Ich red mit ihr' },
        { text: 'vllt erst ma was kleineres?', label: 'Was Kleineres?' },
        {
          text: 'sag ihr keks will nen freund',
          label: 'Keks will nen Freund',
        },
      ],
    },
    talk: {
      lines: [
        'JAAA',
        'du bist älter. mamas hören auf ältere',
        `sag die 10 gründe auf. du bist ${g('die ZEUGIN', 'der ZEUGE')}`,
      ],
      choices: [{ text: 'alle 10?' }, { text: 'jaja ok' }],
    },
    smaller: {
      lines: [
        'KLEINER??',
        'ein hamster IS klein',
        'was is kleiner als ein hamster. ein KÄFER?? ich will keinen käfer',
      ],
      choices: [
        { text: 'n fisch vielleicht' },
        { text: 'ok ich red einfach mit ihr' },
      ],
    },
    friend: {
      lines: ['keks WILL nen freund', 'hat er mir gesagt. mit den augen'],
      choices: [
        { text: 'seine augen sagen echt viel' },
        { text: 'ich sags ihr' },
      ],
    },
    phase: {
      lines: [
        'ok. operation hamster. phase 2',
        'phase 2 bist DU',
        '',
        'sag mama nich dass ich dich geschickt hab',
        'mama was sagen is MEIN job',
      ],
      personalMessages: { 2: 'operation hamster: phase 2 (du)' },
    },
  },
  day9: {
    fish: {
      lines: [
        '{name}!!!',
        'ich hab ein HAUSTIER',
        'is kein hamster',
        'is ein FISCH. ein goldfisch. aus der zoohandlung im einkaufszentrum',
        'mama sagt ein fisch is ein „anfänger-haustier". ich FANGE AN',
      ],
      choices: [
        {
          text: g(
            'ein fisch!! wie cool',
            'alter ein fisch is n nasser hamster',
          ),
          label: g('Ein Fisch!!', 'Nasser Hamster'),
        },
        { text: 'und professor knabber?', label: 'Professor Knabber?' },
      ],
    },
    react: {
      lines: [
        g(
          'ICH WEISS. er is orange und schwimmt runden',
          'ein NASSER HAMSTER. lol. ok das is lustig',
        ),
        g('so 100 runden. hab gezählt', 'sag ihm nich dass ich gelacht hab'),
      ],
      choices: [{ text: 'wie heißt er?' }, { text: 'hat er schon nen namen?' }],
    },
    nibbles: {
      lines: [
        'professor knabber is in der WARTESCHLEIFE',
        'wie ne serie die nächstes jahr weitergeht',
      ],
      choices: [
        { text: 'ok. und wie heißt der fisch?' },
        { text: 'ruhe in frieden professor knabber' },
      ],
    },
    names: {
      lines: [
        'er braucht nen NAMEN',
        'du darfst was vorschlagen. ich entscheide',
      ],
      choices: [
        { text: 'knabber junior', label: 'Knabber junior' },
        { text: 'goldi', label: 'Goldi' },
      ],
    },
    sir: {
      lines: [
        'nein',
        'er heißt SIR STERNENSTAUB DER ZWEITE',
        'weil sternenstaub die ERSTE is',
        '',
        'er wohnt auf meinem schreibtisch. du darfst ihn besuchen. vorher klopfen',
      ],
      personalMessages: { 3: 'er heißt SIR STERNENSTAUB DER ZWEITE' },
    },
  },
  day10: {
    unfair: {
      lines: [
        '{name}!!',
        'wie WARS',
        'nich erzählen',
        'ok erzähl',
        'NEIN nich. das is UNFAIR',
        'mama sagt ich bin zu klein. sie hat NÄCHSTES JAHR gesagt',
      ],
      choices: [
        {
          text: g('nächstes jahr ganz bestimmt', 'du hast nich viel verpasst'),
          label: g('Nächstes Jahr bestimmt', 'Nix verpasst'),
        },
        { text: 'ich erzähl dir alles', label: 'Ich erzähl dir alles' },
      ],
    },
    next: {
      lines: [
        g(
          'nächstes jahr. GROSSES EHRENWORT',
          'LÜGNER. ich hab die FOTOS gesehen',
        ),
        g(
          'ich habs in den kalender geschrieben. mit KULI',
          'marco hat ein GANZES album reingestellt',
        ),
      ],
      choices: [{ text: 'abgemacht' }, { text: 'ich erzähl dir morgen alles' }],
    },
    tell: {
      lines: [
        'ALLES',
        'fang mit dem eimer an. hat derek ihn umgetreten',
        'nein warte. erzähls morgen. ich bin noch sauer',
      ],
      choices: [{ text: 'hat er' }, { text: 'morgen. versprochen' }],
    },
    fish: {
      lines: [
        'egal ich hab meine EIGENE show gemacht',
        'für sir sternenstaub den zweiten. auf meinem schreibtisch. neben den ponys',
        'sternenstaub steht natürlich immer noch in der mitte',
        '',
        'er is die ganze zeit geschwommen. das heißt es hat ihm gefallen',
      ],
      personalMessages: { 3: 'sir sternenstaub der 2. is jetzt meine show' },
    },
  },
};
