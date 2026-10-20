// German text for Dex, days 6–10 (docs/localization-de.md → "Dex: slow, short, always Abwesend"):
// the Westfield Jam. Same ids, same line and choice counts as `src/content/contacts/dex-week2.ts`
// and the Jam course thread in `dex-boy.ts` (boy only, no `g()`); '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const dexWeek2Days: ContactOverlay['days'] = {
  6: { personalMessage: '41 aufrufe. so 30 davon bin ich' },
  7: { personalMessage: 'der westfield jam. ich. da drin??' },
  8: { personalMessage: 'am üben. abwesend (diesmal echt)' },
  9: { personalMessage: 'dritter platz. kamera: AN' },
  10: { personalMessage: 'filme velvet lantern. neue kassette' },
};

export const dexWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    views: {
      lines: [
        '{name}',
        'das video hat 41 aufrufe',
        'auf kickflipkings.example/video',
        'so 30 davon bin ich',
        'meine mutter hats 4 mal geguckt. online. dabei hat sie die kassette',
      ],
      choices: [
        { text: 'das sind 11 echte fans!', label: '11 echte Fans!' },
        { text: 'ich habs so 5 mal geguckt', label: 'Hab’s 5 mal geguckt' },
        { text: 'mach nen teil 2', label: 'Teil 2' },
      ],
    },
    fans: {
      lines: ['hm', '11 echte fans', 'so viele wie bei marcos erster show', ''],
      choices: [
        { text: 'du bist quasi berühmt' },
        { text: 'minus deine mutter' },
      ],
      personalMessages: { 3: '11 echte fans. wahrscheinlich' },
    },
    five: {
      lines: [
        'ok also',
        '30 ich. 4 meine mutter. 5 du. 2 fremde',
        'zwei fremde. das is ne fangemeinde',
        '',
      ],
      choices: [{ text: 'wer sind die fremden' }, { text: 'ich guck nochmal' }],
      personalMessages: { 3: '11 echte fans. wahrscheinlich' },
    },
    part2: {
      lines: [
        'teil 2',
        'hab noch 1 kassette. da steht auch 1999 drauf',
        'ry sagt teil 2 is nie so gut wie teil 1. ry hat nie nen teil 1 gemacht',
        '',
      ],
      choices: [
        { text: 'hör nich auf ry' },
        { text: 'teil 2: noch verschwommener' },
      ],
      personalMessages: { 3: '11 echte fans. wahrscheinlich' },
    },
    tell: {
      lines: [
        'kev sagt die aufrufe gehen hoch wenn mans leuten erzählt',
        'also',
        'erzähl ich leuten',
        'du zählst als leute',
      ],
    },
  },
  day7: {
    invite: {
      lines: [
        '{name}',
        'kev hat mich für was angemeldet',
        'den westfield jam. n skate-contest. im park',
        'in 2 tagen',
        'hat meinen namen schon hingeschrieben. mit kuli',
      ],
      choices: [
        { text: 'mach den kickflip!', label: 'Mach den Kickflip!' },
        { text: 'filmt kev das?', label: 'Filmt Kev?' },
      ],
    },
    kickflip: {
      lines: [
        'das is der plan',
        'man hat 1 min auf dem parcours',
        '1 kickflip. vielleicht',
        '',
      ],
      choices: [
        {
          text: 'du hast ihn schon mal gestanden',
          label: 'Schon mal gestanden',
        },
        { text: 'und wenn du hinfällst', label: 'Und wenn du fällst?' },
      ],
      personalMessages: { 3: 'jam-lauf: 1 min. 1 kickflip. vielleicht' },
    },
    film: {
      lines: [
        'jo. kev hat jetzt ne kamera',
        'ok die von seiner mutter',
        'wenn ich ihn stehe. sieht das mal einer. endlich',
        '',
      ],
      choices: [
        {
          text: 'du hast ihn schon mal gestanden',
          label: 'Schon mal gestanden',
        },
        { text: 'und wenn du hinfällst', label: 'Und wenn du fällst?' },
      ],
      personalMessages: { 3: 'jam-lauf: 1 min. 1 kickflip. vielleicht' },
    },
    landed: {
      lines: [
        'jo. als keiner gefilmt hat',
        'diesmal sind da leute. so richtig viele',
        'ok. morgen üben',
      ],
    },
    fall: {
      lines: [
        'dann fall ich halt',
        'kann ich. 40 mal auf kassette',
        'ok. morgen üben',
      ],
    },
  },
  day8: {
    practice: {
      lines: [
        '{name}',
        'sry. am üben',
        'diesmal echt abwesend',
        'bin den parcours so 30 mal gefahren',
      ],
      choices: [
        { text: 'du schaffst das', label: 'Du schaffst das' },
        { text: 'iss mal was dex', label: 'Iss was' },
      ],
    },
    got: {
      lines: ['jo', 'vielleicht', 'bin einmal hingefallen'],
      choices: [{ text: 'oh nein. alles ok?' }, { text: 'nur einmal??' }],
    },
    eat: {
      lines: [
        'hat meine mutter auch gesagt',
        'sie hat mir n butterbrot in den park gebracht. vor kevs augen',
        'kev hat die hälfte gegessen',
      ],
      choices: [{ text: 'kev is ne plage' }, { text: 'schon hingefallen?' }],
    },
    once: {
      lines: [
        'einmal hingefallen. mit absicht',
        'damits erledigt is',
        'jetzt kann ich morgen nich zum ersten mal fallen. is durch',
        '',
      ],
      choices: [
        { text: 'das is genial' },
        { text: 'so funktioniert das nich' },
      ],
      personalMessages: {
        3: 'parcours 30 mal gefahren. 1 mal gefallen. mit absicht',
      },
    },
    more: {
      lines: [
        'bei mir schon',
        'ok. noch 1 lauf. dann schlafen',
        'vielleicht 2',
      ],
    },
  },
  day9: {
    jam: {
      lines: [
        '{name}',
        'der jam',
        'kickflip gestanden',
        'vor allen. so 40 leute',
        'dritter platz',
      ],
      choices: [
        { text: 'DRITTER!!!', label: 'DRITTER!!!' },
        { text: 'hat kev das gefilmt??', label: 'Kev hat’s gefilmt?' },
        { text: 'wer hat gewonnen?', label: 'Wer hat gewonnen?' },
      ],
    },
    third: {
      lines: [
        'jo',
        'hab nen preis gekriegt',
        'n sticker-pack und ne leere kassette',
      ],
      choices: [
        { text: 'ne KASSETTE' },
        { text: 'wer hat gewonnen?', label: 'Wer hat gewonnen?' },
      ],
    },
    kev: {
      lines: [
        'hat er. 6 sekunden',
        'man sieht das board. und mich',
        'zum ersten mal bin ich nich verschwommen',
      ],
      choices: [
        { text: 'nich verschwommen!!' },
        { text: 'wer hat gewonnen?', label: 'Wer hat gewonnen?' },
      ],
    },
    won: {
      lines: [
        'sam. logisch',
        'big mike aus riverside zweiter. der is riesig',
        'ich dritter. preis is sticker und ne kassette',
      ],
      choices: [
        { text: 'nächstes jahr packst du big mike' },
        { text: 'was is auf der kassette?' },
      ],
    },
    tape: {
      lines: [
        'auf der kassette steht 2007',
        'die zukunft',
        'is leer. heb ich für was auf',
        '',
      ],
      personalMessages: { 3: 'dritter. sticker. ne kassette von 2007' },
    },
  },
  day10: {
    filmed: {
      lines: [
        '{name}',
        'hab die ganze show gefilmt',
        'auf die 2007er kassette',
        'als erstes drauf. velvet lantern',
      ],
      choices: [
        { text: 'wie viel hast du gefilmt?', label: 'Wie viel?' },
        { text: 'haste das plektrum drauf?', label: 'Das Plektrum?' },
      ],
    },
    much: {
      lines: [
        'alles. 8 songs',
        'und so 10 min derek beim stimmen',
        'der farbeimer is in 4 songs. derek zählt 3',
      ],
      choices: [
        { text: 'regisseur dex' },
        { text: 'schneid das stimmen raus' },
      ],
    },
    pick: {
      lines: [
        'jo. is n bisschen verschwommen',
        'jess hats gefangen. man hört sie',
        'man siehts nich. aber man hörts',
      ],
      choices: [{ text: 'typisch dex' }, { text: 'was hat sie geschrien' }],
    },
    mom: {
      lines: [
        'übrigens. hab deine mutter getroffen',
        'als sie dich abgesetzt hat',
        'hab Sie gesagt. zweimal. sie hat was aufgeschrieben',
        g(
          'sie hat gefragt ob ich der mit dem video bin',
          'sie hat nach helmen gefragt. fürs filmen',
        ),
        '',
      ],
      choices: [
        { text: 'was hat sie aufgeschrieben??', label: 'Was hat sie notiert?' },
        { text: 'sie mag dich', label: 'Sie mag dich' },
      ],
      personalMessages: { 4: 'kamera: dex. besonderer dank: {name}' },
    },
    list: {
      lines: ['kp', 'ry sagt is ne liste', 'ich will auf die gute liste'],
    },
  },
};

export const dexBoyWeek2: ContactOverlay['scripts'] = {
  jamCourse: {
    course: {
      lines: [
        '{name}',
        'komm heut abend auf den jam-parcours skaten',
        'park macht um 8 zu',
        'bring den drachenhelm mit',
      ],
      choices: [
        { text: 'bin dabei', label: 'Bin dabei' },
        { text: 'ich stopp dir die zeit', label: 'Ich stopp die Zeit' },
      ],
    },
    there: {
      lines: [
        'cool',
        'kev sagt du bist jetzt der offizielle anheizer',
        'du brüllst wenn ich ihn stehe. das is der job',
        '',
      ],
      personalMessages: { 3: 'jam-parcours. 2 leute. 1 drache' },
    },
    time: {
      lines: [
        'ok. kev hat ne uhr mit stoppuhr',
        'er sagt aber du bist der offizielle anheizer. also stoppen und brüllen',
        '',
      ],
      personalMessages: { 2: 'jam-parcours. 2 leute. 1 drache' },
    },
  },
};
