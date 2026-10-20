// German text for Kayla's week two (W1-01; `src/content/contacts/kayla-week2.ts`, `kayla-girl.ts`;
// docs/localization-de.md → "Kayla: ~*drama*~", "v0.5: week two"). The class rep election vs
// Brianna: Pony, the sign-up, the slogan, 61 zu 61 and the co-reps. Same ids, same line and choice
// counts; '' = a line without text. The girl-only outfit thread has one side only, no `g()`.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const kaylaWeek2Days: ContactOverlay['days'] = {
  6: { personalMessage: '~*neue frisur. neues ich*~' },
  7: { personalMessage: '~*es geht LOS*~' },
  8: { personalMessage: '~*schreib ne rede. bitte nich stören*~' },
  9: { personalMessage: '~*wahltag. bitte warten*~' },
  10: { personalMessage: '~*co-klassensprecherin*~ (lange geschichte)' },
};

export const kaylaWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    bangs: {
      lines: [
        '{name}',
        'ich habs getan',
        'ich hab jetzt nen PONY',
        'meine mama hat n bisschen geweint. gutes weinen. glaub ich',
      ],
      choices: [
        { text: 'zeig her!!', label: 'Zeig her!' },
        { text: 'neue frisur is mutig', label: 'Voll mutig' },
        {
          text: 'und wenn brianna das nachmacht',
          label: 'Wenn sies nachmacht?',
        },
      ],
    },
    pic: {
      lines: [
        'ok ich schick dir n webcam-foto',
        '...es lädt zeile für zeile',
        'einwählen is ein VERBRECHEN',
        'ok. da. sei ehrlich',
      ],
      choices: [
        {
          text: g('omg du siehst so süß aus', 'sieht gut aus. glaub ich'),
          label: g('Voll süß!', 'Gut, glaub ich'),
        },
        { text: 'sehr ~*dramatisch*~', label: 'Sehr dramatisch' },
      ],
    },
    honest: {
      lines: [
        g(
          'DANKE. endlich versteht mich mal einer',
          'du bist SO ein junge. aber danke',
        ),
        g(
          'mein bruder sagt ich seh aus wie ein bobtail. er is für mich GESTORBEN',
          '„gut, glaub ich“ is das netteste was je ein junge über meine haare gesagt hat',
        ),
      ],
      choices: [
        { text: 'lol ok' },
        { text: 'das is n riesenkompliment', label: 'Riesenkompliment' },
      ],
    },
    brave: {
      lines: [
        'MUTIG. ja. genau das wort',
        'ein pony is keine frisur {name}',
        'ein pony is eine ENTSCHEIDUNG',
      ],
      choices: [{ text: 'ne große entscheidung' }, { text: 'gut entschieden' }],
    },
    copy: {
      lines: [
        'dann gehts LOS',
        'ich habs gesagt und ich meins ernst',
        'friedensvertrag hin oder her',
      ],
      choices: [
        { text: 'das traut sie sich nich' },
        { text: 'kayla das sind nur haare', label: 'Sind nur haare' },
      ],
    },
    lifestyle: {
      lines: [
        'das sind nich nur haare. das is ne lebenseinstellung',
        '',
        'morgen is die große enthüllung in der schule',
        'wenn brianna mit pony reinkommt dann WEISS ich bescheid',
      ],
      personalMessages: { 1: '~*pony: eine lebenseinstellung*~' },
    },
  },
  day7: {
    on: {
      lines: [
        '{name}. es geht LOS',
        'brianna kommt morgens in die klasse',
        'MIT PONY',
        'und dann trägt sie sich für die klassensprecherwahl ein. VOR MEINEN AUGEN',
        'also hab ich mich auch eingetragen. 4 minuten vor schluss',
      ],
      choices: [
        { text: 'du musst unbedingt gewinnen', label: 'Du musst gewinnen!' },
        {
          text: 'vllt is sie einfach wieder n fan',
          label: 'Wieder n fan?',
        },
        {
          text: 'und was is mit dem friedensvertrag??',
          label: 'Der vertrag??',
        },
      ],
    },
    win: {
      lines: [
        'ich MUSS gewinnen',
        'ich hab ideen. ich hab nen pony. ich hab dich',
        'brianna hat... auch nen pony',
      ],
      choices: [
        { text: 'deine frisur war zuerst da' },
        { text: 'ideen schlagen frisuren' },
      ],
    },
    fan: {
      lines: [
        'ein FAN',
        'fans treten nich GEGEN dich an {name}',
        '...ok vllt n kleines bisschen fan',
      ],
      choices: [
        { text: 'ein ehrgeiziger fan' },
        { text: 'is doch irgendwie schmeichelhaft' },
      ],
    },
    treaty: {
      lines: [
        'der friedensvertrag is ausgesetzt',
        'das nennt man POLITIK',
        'kannste nachlesen',
      ],
      choices: [{ text: 'politik lol' }, { text: 'das is so dramatisch' }],
    },
    posters: {
      lines: [
        'die plakate hängen im ostflur. guck sie dir an',
        '',
        'ich hab 12 gemacht. sie hat 12 gemacht. ich hab GEZÄHLT',
        g(
          'wähl mich. sags allen weiter :)',
          'wähl mich. und sags den jungs (Y)',
        ),
      ],
      personalMessages: { 1: '~*wählt kayla zur klassensprecherin*~' },
    },
  },
  day8: {
    drafts: {
      lines: [
        '{name}',
        'rede-notfall',
        'ich hab 11 entwürfe. die sind alle SCHLECHT',
      ],
      choices: [
        { text: 'lies mir einen vor', label: 'Lies einen vor' },
        {
          text: 'deine reden sind nie schlecht',
          label: 'Nie schlecht',
        },
      ],
    },
    slogan: {
      lines: [
        'ok vergiss die rede. ich brauch nen SLOGAN',
        'A: ~*kayla: pony UND köpfchen*~',
        'B: kayla wählen heißt NIE WIEDER RÄTSEL-HACKBRATEN',
        'such einen aus. sei ehrlich',
      ],
      choices: [
        { text: 'A!! der mit dem köpfchen', label: 'A: köpfchen' },
        {
          text: g(
            'B. nie wieder hackbraten',
            'der mit dem hackbraten. dafür stimmt jeder junge',
          ),
          label: g('B: kein hackbraten', 'Der hackbraten'),
        },
      ],
    },
    a: {
      lines: [
        'A. ich WUSSTE es',
        'der hat stil. wie ich',
        '',
        'aber was kommt aufs plakat',
      ],
      personalMessages: { 2: '~*kayla: pony UND köpfchen*~' },
      choices: [
        {
          text: g('glitzer auf jedes K!', 'mach das K richtig groß'),
          label: g('Glitzer auf jedes K', 'Ein großes K'),
        },
        { text: 'dein gesicht. is doch klar', label: 'Dein gesicht' },
      ],
    },
    b: {
      lines: [
        g(
          'der mit dem HACKBRATEN?? echt jetzt??',
          'boah. du hast recht. es is der hackbraten',
        ),
        g(
          '...ok das is irgendwie genial. alle hassen den hackbraten',
          'unsere ganze stufe hat gelitten. sogar die mensa-damen',
        ),
        '',
      ],
      personalMessages: {
        2: 'kayla wählen heißt NIE WIEDER RÄTSEL-HACKBRATEN',
      },
      choices: [
        { text: 'das is ne bewegung' },
        {
          text: 'der hackbraten muss weg',
          label: 'Hackbraten muss weg',
        },
      ],
    },
    done: {
      lines: [
        'ok. slogan: FERTIG',
        'ich habs 3 mal meinem spiegel vorgelesen',
        'der spiegel hat mich gewählt',
        'morgen is wahltag. ich krieg keine luft *seufz*',
      ],
    },
  },
  day9: {
    tie: {
      lines: [
        '{name}',
        'sie haben gezählt',
        '61',
        'zu 61',
        'auf einem zettel stand „rätsel-hackbraten“. der zählt nich',
      ],
      choices: [
        { text: 'UNENTSCHIEDEN??', label: 'Unentschieden??' },
        { text: 'nachzählen!!', label: 'Nachzählen!' },
        { text: 'ihr könntet euch das teilen?', label: 'Teilen?' },
      ],
    },
    shock: {
      lines: [
        'UNENTSCHIEDEN',
        'ich war noch nie in meinem LEBEN unentschieden',
        'außer an der eisdiele. da immer',
      ],
      choices: [
        { text: 'hahaha' },
        { text: 'und jetzt??', label: 'Und jetzt?' },
      ],
    },
    recount: {
      lines: [
        'sie HABEN nachgezählt',
        'zweimal. immer noch 61 zu 61',
        'und der hackbraten-zettel is immer noch der hackbraten-zettel',
      ],
      choices: [
        {
          text: 'wer wählt denn bitte nen HACKBRATEN',
          label: 'Wer wählt hackbraten',
        },
        { text: 'und jetzt??', label: 'Und jetzt?' },
      ],
    },
    share: {
      lines: [
        'TEILEN',
        'teilen. mit BRIANNA',
        '...sag das nich laut. das universum hört mit',
      ],
      choices: [{ text: 'zu spät' }, { text: 'sorry universum' }],
    },
    office: {
      lines: [
        'jetzt sitzen wir im SEKRETARIAT',
        'ich und brianna. auf 2 stühlen. wir reden nich',
        '',
        'dr. hargrove entscheidet morgen. bis dahin bin ich dramatisch. ich kann nich mehr',
      ],
      personalMessages: { 2: '~*61 zu 61. ich kann nich mehr*~' },
    },
  },
  day10: {
    coreps: {
      lines: [
        '{name}',
        'überraschende wendung',
        'dr. hargrove hat uns zu CO-KLASSENSPRECHERINNEN gemacht. mich UND brianna',
        'und dann sind wir zu marcos show gegangen. zusammen. frag nich',
        'und wir hatten GENAU das gleiche an. bis zum HAARGUMMI',
      ],
      choices: [
        { text: 'co-klassensprecherinnen!!', label: 'Co-sprecherinnen!' },
        { text: 'SCHON WIEDER gleich??', label: 'Schon wieder gleich??' },
        {
          text: 'also is der krieg so richtig vorbei?',
          label: 'Krieg vorbei?',
        },
      ],
    },
    co: {
      lines: [
        'co-klassensprecherinnen. wie eine klassensprecherin, nur 2',
        'bei einer sache sind wir uns schon einig',
        'pony. is doch klar',
      ],
      choices: [
        { text: 'guter anfang' },
        { text: 'und der hackbraten?', label: 'Und der hackbraten?' },
      ],
    },
    match: {
      lines: [
        'SCHON WIEDER',
        'sie hat mich angeguckt. ich hab sie angeguckt',
        'sie hat gesagt „du auch“',
      ],
      choices: [
        { text: 'DU AUCH lol', label: 'Du auch lol' },
        { text: 'und was haste gesagt', label: 'Was haste gesagt?' },
      ],
    },
    over: {
      lines: [
        'der krieg is so richtig vorbei',
        'wir haben jetzt besprechungen. BESPRECHUNGEN {name}',
        'sie bringt immer was zu knabbern mit. schwer jemanden zu hassen der chips dabei hat',
      ],
      choices: [
        { text: 'chips = frieden' },
        {
          text: 'also seid ihr jetzt freundinnen?',
          label: 'Jetzt freundinnen?',
        },
      ],
    },
    friends: {
      lines: [
        'wir sind keine freundinnen',
        'wir sind co-klassensprecherinnen',
        '...',
        'ok wir sind freundinnen',
        '',
        g(
          'sags ihr nich. oder doch. ka. <3',
          'sags ihr nich. oder doch. ka (Y)',
        ),
      ],
      personalMessages: { 4: '~*überraschende wendung*~ (schon wieder)' },
    },
  },
};

export const kaylaGirlThreads: ContactOverlay['scripts'] = {
  outfitPick: {
    ask: {
      lines: [
        '{name}',
        'ok vergiss die wahl ma für 5 min',
        'hilf mir n outfit für die show aussuchen',
        'A: schwarzes top + die sternchenjeans',
        'B: der lila rock + stulpen. die aus meinem album',
      ],
      choices: [
        { text: 'A!! schwarz is so rockig', label: 'A: schwarzes top' },
        { text: 'B!! die stulpen', label: 'B: lila rock' },
      ],
    },
    a: {
      lines: [
        'A. schwarz. geheimnisvoll',
        'wie ne klassensprecherin der NACHT',
      ],
      choices: [
        { text: 'sehr geheimnisvoll' },
        { text: 'dazu die silbernen creolen', label: 'Silberne creolen' },
      ],
    },
    b: {
      lines: ['B. lila. ein STATEMENT', 'stulpen auf nem rockkonzert. kult'],
      choices: [
        { text: 'voll kult' },
        { text: 'und n haargummi', label: 'Und n haargummi' },
      ],
    },
    sealed: {
      lines: [
        'und das beste',
        'brianna zieht NIEMALS zweimal hintereinander das gleiche an',
        'statistisch gesehen',
        '',
      ],
      personalMessages: { 3: '~*outfit: gewählt. schicksal: besiegelt*~' },
    },
  },
};
