// German text for Marco's week two (W3-01; `src/content/contacts/marco-week2.ts` and the week-two
// boy-only threads in `marco-boy.ts`). Same ids, same line and choice counts; '' = a line without
// text. Lowercase, dry, never „!".
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const marcoWeek2Days: ContactOverlay['days'] = {
  6: { personalMessage: 'das jugendzentrum. diesmal echt. samstag' },
  7: { personalMessage: 'setlist-besprechung. 3 stunden. 8 songs' },
  8: { personalMessage: 'neuer song im set. mach kein ding draus' },
  9: { personalMessage: 'soundcheck. betet für uns' },
  10: { personalMessage: 'heute abend im juz. passen 80 rein. also so 12' },
};

export const marcoWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    hall: {
      lines: [
        'zwerg',
        'die bean-cellar-ära ist vorbei',
        'velvet lantern spielt im jugendzentrum. samstag',
        'diesmal echt',
      ],
      choices: [
        {
          text: 'moment. im JUGENDZENTRUM? im echten?',
          label: 'Im Jugendzentrum?',
        },
        {
          text: 'was is mit dem ersten termin passiert?',
          label: 'Der erste Termin?',
        },
      ],
    },
    room: {
      lines: [
        'im echten. neben dem schwimmbad',
        'passen 80 rein. einlass um 6. ohne altersgrenze',
        'ohne altersgrenze heißt, deine mutter kann nicht sagen, es ist ne kneipe',
      ],
      choices: [
        { text: '80 leute lol', label: '80 Leute' },
        { text: 'ok wo is der haken', label: 'Der Haken?' },
      ],
    },
    bingo: {
      lines: [
        'bingo hatte den ersten termin',
        'bingo gewinnt immer. bingo hat tanten',
        'also haben wir den samstag danach. passen 80 rein. einlass um 6. ohne altersgrenze',
      ],
      choices: [
        { text: 'gegen bingo verloren lol', label: 'Gegen Bingo verloren' },
        { text: 'ok wo is der haken', label: 'Der Haken?' },
      ],
    },
    poster: {
      lines: [
        'der haken ist ein poster. ein richtiges',
        'letztes mal hat derek die laterne gemalt. drei leute haben nach suppe gefragt',
        'dein freund mit den froschzeichnungen. zeichnet der noch',
        '',
      ],
      personalMessages: { 3: 'gesucht: poster. keine suppe' },
      choices: [
        { text: 'theo? ich frag ihn', label: 'Ich frag Theo' },
        {
          text: g('nimm doch wieder meinen flyer', 'ich mach wieder flammen'),
          label: g('Wieder mein Flyer', 'Wieder Flammen'),
        },
      ],
    },
    theo: {
      lines: [
        'genau der',
        'sag ihm, bezahlt wird in ruhm. und in limo',
        'und sag ihm: laterne. keine suppe',
        'bis dann zwerg',
      ],
    },
    flyer: {
      lines: [
        g(
          'dein flyer war gut. für nen keller',
          'kleine flammen. geschmackvolle',
        ),
        'aber das ist das jugendzentrum. wir brauchen jemanden, der wirklich zeichnet',
        'frag den froschtypen. ich schulde dir was',
        'bis dann zwerg',
      ],
    },
  },
  day7: {
    meeting: {
      lines: [
        'zwerg. bist du da',
        'setlist-besprechung. bis jetzt 3 stunden',
        '8 songs. bei allen 8 sind wir uns einig',
        'das problem ist der farbeimer',
        'derek will in jedem song gegen den eimer treten',
        'steht 2 zu 2. du entscheidest. schon wieder',
      ],
      choices: [
        {
          text: 'jeder song. der eimer IST die band',
          label: 'Jeder Song',
        },
        {
          text: 'nur beim letzten. wie im bean cellar',
          label: 'Nur beim letzten',
        },
        { text: 'kompromiss?', label: 'Kompromiss' },
      ],
    },
    every: {
      lines: [
        'zwerg',
        'ich habs laut vorgelesen. derek ist einmal durchs zimmer gerannt',
        'dann hat er gesagt: „ok. nicht JEDER song. 5“',
      ],
      choices: [
        { text: 'nimm den deal', label: 'Deal annehmen' },
        { text: 'biet ihm 2', label: 'Gegenangebot: 2' },
      ],
    },
    last: {
      lines: [
        'hab ich auch gesagt',
        'derek sagt, der eimer hat „bandbreite“',
        'dann wollte er 5. dann 4',
      ],
      choices: [
        { text: 'bleib hart', label: 'Hart bleiben' },
        { text: 'gib ihm 3', label: 'Gib ihm 3' },
      ],
    },
    compromise: {
      lines: [
        'kompromiss. mit derek',
        'ok. ich hab 2 geboten. er 5',
        'mein mitbewohner hat pizza geboten. keiner wollte',
      ],
      choices: [
        { text: 'trefft euch in der mitte', label: 'Die Mitte' },
        { text: 'nehmt die pizza', label: 'Die Pizza nehmen' },
      ],
    },
    lawyer: {
      lines: [
        '3 songs. endgültig',
        'derek hat verhandelt wie ein anwalt. er hatte notizen',
        'steht jetzt schriftlich fest. auf ner serviette',
        '',
        'ok. wieder rein. noch 2 songs zum streiten',
        'bis dann zwerg',
      ],
      personalMessages: { 3: 'der eimer: 3 songs. verhandelt' },
    },
  },
  day8: {
    song: {
      lines: [
        'zwerg',
        'neuigkeiten. mach kein ding draus',
        'wir nehmen nen song ins set',
        g(
          '„laternenherz“. dein song. aus deinem heft',
          '„56k“. dein song. aus deinem heft',
        ),
        'ich hab gesagt, der hat potenzial. hat er immer noch',
        '',
      ],
      personalMessages: {
        5: g(
          'läuft gerade: laternenherz (von meiner cousine)',
          'läuft gerade: 56k (von meinem cousin)',
        ),
      },
      choices: [
        { text: 'NEIN. ECHT JETZT??', label: 'Echt jetzt?' },
        { text: 'welche wörter??', label: 'Welche Wörter?' },
        { text: 'werd ich genannt?', label: 'Werd ich genannt?' },
      ],
    },
    way: {
      lines: [
        'doch. echt',
        g(
          'derek mag den refrain. er sagt, „oh oh laterne“ ist ein ohrwurm',
          'derek mag den piiiep-krrrsch-teil. er macht ihn auf dem eimer',
        ),
        'sag ihm nicht, dass ich gesagt hab, dass er was mag',
      ],
      choices: [
        { text: 'hast du was geändert?', label: 'Änderungen?' },
        { text: 'bester tag meines lebens', label: 'Bester Tag überhaupt' },
      ],
    },
    words: {
      lines: [
        'ich hab ein wort geändert',
        '...',
        'ok vier',
        g(
          '„wie ein auto“ heißt jetzt „wie ein stern“. das auto hat die leute verwirrt. die anderen 3 sind geheim',
          '„meine schwester“ heißt jetzt „mein mitbewohner“. der geht wirklich ans telefon. die anderen 3 sind von derek',
        ),
      ],
      choices: [
        { text: 'ok so is besser', label: 'Besser' },
        { text: 'das sind 4 wörter??', label: 'Das sind 4??' },
      ],
    },
    credit: {
      lines: [
        'genannt. klar',
        `text: ${g('meine cousine', 'mein cousin')}. kleine buchstaben`,
        'wie der abspann im video von dex',
        'liest keiner. aber er ist da',
      ],
      choices: [
        { text: 'größere buchstaben', label: 'Größere Buchstaben' },
        { text: 'passt schon', label: 'Passt schon' },
      ],
    },
    theo: {
      lines: [
        'übrigens. theos entwürfe sind da',
        'er hat sich im betreff entschuldigt',
        'beides laternen. keine suppe. ich mag ihn',
        'ok probe. bis dann zwerg',
      ],
    },
  },
  day9: {
    check: {
      lines: [
        'zwerg',
        'soundcheck im jugendzentrum. schlechte nachricht',
        'das mikro geht nur verkehrt rum',
        'normal halten. nichts. umdrehen. geht',
      ],
      choices: [
        { text: 'dann sing halt verkehrt rum', label: 'Verkehrt rum singen' },
        { text: 'wird das gut gehen??', label: 'Geht das gut?' },
      ],
    },
    bat: {
      lines: [
        'das ist der plan',
        'derek hats so an den ständer geklebt. mit dem guten klebeband',
        'ich sing rein wie ne fledermaus',
        '',
      ],
      personalMessages: { 3: 'mikro geht nur verkehrt rum. wir auch' },
      choices: [
        { text: 'voll rock’n’roll', label: 'Voll Rock’n’Roll' },
        {
          text: 'siehst du überhaupt die leute',
          label: 'Siehst du die Leute?',
        },
      ],
    },
    ok: {
      lines: [
        'wahrscheinlich',
        'der hausmeister sagt, jedes mikro im haus macht das. dem bingo ists egal',
        'derek hats verkehrt rum an den ständer geklebt. ich sing rein wie ne fledermaus',
        '',
      ],
      personalMessages: { 3: 'mikro geht nur verkehrt rum. wir auch' },
      choices: [
        { text: 'ne fledermaus. voll rock’n’roll', label: 'Voll Rock’n’Roll' },
        { text: 'das wird schon', label: 'Wird schon' },
      ],
    },
    poster: {
      lines: [
        'theos poster hängt. überall',
        'es ist gut. ist ne laterne. keiner hat nach suppe gefragt',
        g(
          'du stehst auf der liste. deine mutter hat ja gesagt. diesmal 8 reihen. such dir eine aus',
          'du bist morgen in der crew. aufbau um 4. deine mutter hat ja gesagt. diesmal auch zur show',
        ),
      ],
      choices: [
        {
          text: g('erste reihe. logisch', 'aufbau um 4. alles klar'),
          label: g('Erste Reihe', 'Aufbau um 4'),
        },
        {
          text: g('ganz hinten. wie ein echter fan', 'krieg ich ein shirt'),
          label: g('Ganz hinten', 'Ein Shirt?'),
        },
      ],
    },
    tmrw: {
      lines: [
        'gut',
        'morgen. jugendzentrum. sei pünktlich',
        'the grip tapes spielen vor. wir danach',
        'bis dann zwerg',
      ],
    },
  },
  day10: {
    show: {
      lines: [
        'zwerg',
        'die show ist gelaufen',
        '83 leute',
        'the grip tapes haben eröffnet. wir haben den schluss gemacht',
        'passen 80 rein. der hausmeister meinte, brandschutz ist eher ne empfehlung. seine worte. schon wieder',
        '',
      ],
      personalMessages: { 5: '83 leute. lag um 71 daneben' },
      choices: [
        { text: '83 leute!!!', label: '83 Leute!!!' },
        { text: 'du hast das plektrum geworfen', label: 'Das Plektrum' },
        { text: 'mochten sie meinen song?', label: 'Mein Song?' },
      ],
    },
    count: {
      lines: [
        '83',
        'ich hab zweimal gezählt. derek dreimal und kam auf 85',
        'er hat seine mutter doppelt gezählt',
      ],
      choices: [
        { text: 'und das plektrum?', label: 'Das Plektrum?' },
        { text: 'mochten sie meinen song?', label: 'Mein Song?' },
      ],
    },
    pick: {
      lines: [
        'jess hatte ein schild. MARCO WIRF EIN PLEKTRUM',
        'ich hab nein gesagt. verkehrt rum ins mikro',
        'dann hab ich im letzten song eins geworfen',
        'sag ihr nicht, dass ich gezielt hab',
      ],
      choices: [
        { text: 'dein geheimnis is sicher', label: 'Bleibt geheim' },
        { text: 'mochten sie meinen song?', label: 'Mein Song?' },
      ],
    },
    song: {
      lines: [
        g(
          'laternenherz lief gut. 83 leute haben „oh oh laterne“ gesungen',
          '56k lief gut. derek hat das piiiep krrrsch auf dem eimer gemacht. 83 leute habens zurückgebrüllt',
        ),
        `die vier wörter bleiben. text: ${g('meine cousine', 'mein cousin')}. kleine buchstaben`,
      ],
      choices: [
        { text: 'kleine buchstaben sind ok', label: 'Klein is ok' },
        { text: 'und der eimer?', label: 'Der Eimer?' },
      ],
    },
    bucket: {
      lines: [
        'der eimer war in 3 songs dabei. wie verhandelt',
        'im 4. hat derek ihn umgetreten. nicht verhandelt',
        'herr dalton hatte aufsicht. nach der show hat er den eimer angestupst. zur kontrolle',
        '...',
        'danke zwerg',
      ],
    },
  },
};

/** Marco's week-two boy-only threads: the LAN rematch (day 7) and the load-in crew report (10). */
export const marcoBoyWeek2: ContactOverlay['scripts'] = {
  lanRematch: {
    rematch: {
      lines: [
        'zwerg. revanche',
        'mein mitbewohner will rache für die lan-party. galaxy raiders 3. dieselben 4 pcs',
        'du und ich gegen mitbewohner und derek. derek brüllt',
      ],
      choices: [
        { text: 'alter ich bin dabei', label: 'Bin dabei' },
        { text: 'dürfen wir BIGBRAIN nehmen', label: 'BIGBRAIN nehmen?' },
      ],
    },
    in: {
      lines: [
        'gut. gleiche regeln. du bringst chips',
        'deine mutter sagt, um 10 zuhause. wie letztes mal',
        '',
      ],
      personalMessages: { 2: 'revanche. chips mitbringen. vor allem chips' },
    },
    bigbrain: {
      lines: [
        'mein mitbewohner sagt, riesenköpfe sind schummeln',
        'sind sie. wir nehmen sie trotzdem',
        'deine mutter sagt, um 10 zuhause. wie letztes mal',
        '',
      ],
      personalMessages: { 3: 'revanche. chips mitbringen. vor allem chips' },
    },
  },
  loadInCrew: {
    report: {
      lines: [
        'zwerg. crew-bericht',
        'du hast um 4 den verstärker reingetragen. diesmal 4 stufen. luxus',
        'derek hat neue shirts gemacht. LANTERN richtig geschrieben',
        'dann ist ihm bei CREW das shirt ausgegangen',
        'diesmal bist du zur show geblieben. deine mutter hat ja gesagt. ich hab zweimal gefragt',
      ],
      choices: [
        { text: 'bester crew-job aller zeiten', label: 'Bester Crew-Job' },
        { text: 'krieg ich die limo', label: 'Die Limo?' },
      ],
    },
    best: {
      lines: [
        'war dein einziger crew-job. aber ok',
        'nächste show gleicher job. gleiche bezahlung',
        '',
      ],
      personalMessages: { 2: 'crew: 1. bezahlt in shirts' },
    },
    soda: {
      lines: [
        '2 limos. gewerkschaftsregel',
        'derek hat eine getrunken. ich schulde dir ne limo',
        '',
      ],
      personalMessages: { 2: 'crew: 1. bezahlt in shirts' },
    },
  },
};
