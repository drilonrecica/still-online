// German text for theo (docs/localization-de.md → "Theo: shy, apologizing, …"). Same ids, same
// line and choice counts as `src/content/contacts/theo*.ts`; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const theo: ContactOverlay = {
  personalMessage: 'bio-referat am freitag…',
  days: {
    2: { personalMessage: '2 packungen waldmeister-wackelpudding. sorry mama' },
    3: { personalMessage: 'der wackelpudding ist… wackelig' },
    4: { personalMessage: 'morgen referat. 14 karteikarten' },
    5: { personalMessage: 'ne 2+ :) (sorry fürs angeben)' },
  },
  scripts: {
    opening: {
      hi: {
        lines: ['ähm hi', 'bist du {name}? aus bio?'],
        choices: [
          { text: 'ja! hi theo', label: 'Ja, hi!' },
          { text: 'wer bist du?' },
        ],
      },
      who: {
        lines: ['oh. sorry. ich bin’s, theo', 'ich sitze hinter dir in bio'],
        choices: [
          { text: 'ach hey theo!' },
          {
            text: 'der mit den coolen zeichnungen?',
            label: 'Der mit den Zeichnungen?',
          },
        ],
      },
      drawings: {
        lines: ['oh. die hast du gesehen?', 'die sind nicht so gut…'],
        choices: [
          { text: 'die sind echt gut' },
          { text: 'lol der frosch war der hammer' },
        ],
      },
      yes: {
        lines: ['ok gut. ich war mir nicht sicher, ob die adresse stimmt'],
        choices: [{ text: 'was gibt’s?' }, { text: 'lol klar stimmt die' }],
      },
      project: {
        lines: [
          `also ähm. du bist ${g('meine partnerin', 'mein partner')} fürs zell-referat`,
          'herr dalton hat uns eingeteilt',
          'sorry',
        ],
        choices: [
          {
            text: 'cool! treffen wir uns in der bücherei?',
            label: 'Bücherei?',
          },
          {
            text: 'kannst du das nich einfach machen lol',
            label: 'Mach du lol',
          },
        ],
      },
      doall: {
        lines: ['oh. ähm. ok, wenn du meinst', '…'],
        choices: [
          { text: 'spaß spaß!! wir machen das zusammen', label: 'Spaß!!' },
          { text: 'nee, im ernst' },
        ],
      },
      library: {
        lines: ['ok ja. donnerstag nach der schule?'],
        choices: [
          { text: 'donnerstag passt (Y)' },
          { text: 'geht auch mittwoch?' },
        ],
      },
      thursday: {
        lines: ['cool. ich bring filzstifte mit :)', ''],
        personalMessages: { 1: 'donnerstag: bücherei :)' },
      },
      wednesday: {
        lines: [
          'mittwoch hab ich klavierunterricht',
          'aber ok. ich kann schwänzen. sag’s nicht meiner mama',
        ],
      },
      solo: { lines: ['ok', ''] },
    },
    poster: {
      poster: {
        lines: [
          'ähm {name}?',
          'ich hab einen entwurf fürs plakat gemacht. der ist irgendwie schlecht',
        ],
        choices: [{ text: 'schick mal!' }, { text: 'der ist bestimmt super' }],
      },
      send: {
        lines: [
          'der ist auf dem computer von meinem bruder. ich bring ihn morgen mit',
        ],
      },
      great: { lines: ['danke :)'] },
    },
    nudged: {
      oh: {
        lines: ['oh! hi. tschuldige, sollte ich was sagen?'],
      },
    },
    followup1: {
      q: {
        lines: [
          'ähm. sorry. ich schon wieder',
          'kurze frage zum referat',
          'sollen wir eine pflanzenzelle machen oder eine tierzelle?',
        ],
        choices: [
          { text: 'pflanzenzelle!' },
          { text: 'tierzelle' },
          { text: 'ka, such du aus :)', label: 'Such du aus' },
        ],
      },
      pick: {
        lines: [
          'oh. ähm',
          'ok',
          'sorry. ich kann mich so schlecht entscheiden',
          'pflanze? ich glaub pflanze',
        ],
        choices: [{ text: 'dann pflanze (Y)' }, { text: 'gute wahl theo' }],
      },
      plant: {
        lines: [
          'ok cool',
          'ich kann die chloroplasten malen. die sehen aus wie kleine grüne bohnen…',
          'tschuldige. das war komisch. vergiss es',
        ],
        choices: [
          {
            text: g(
              'lol nein das is süß',
              'lol nein bohnen sind fett. bohnenzelle',
            ),
          },
          {
            text: 'grüne bohnen trifft’s ehrlich gesagt ziemlich gut',
            label: 'Stimmt genau',
          },
        ],
      },
      animal: {
        lines: [
          'ok',
          'die mitochondrien sind die kraftwerke der zelle',
          'sorry. das musste sein',
        ],
        choices: [
          { text: 'LOL theo' },
          { text: 'herr dalton wär stolz auf dich', label: 'Dalton = stolz' },
        ],
      },
      proud: {
        lines: [
          'das sagt er in jeder stunde',
          'ich hab einmal mitgezählt. 7 mal',
          'sorry. mir ist manchmal langweilig',
        ],
      },
      cute: {
        lines: [g(':)', 'hehe. ok :)'), 'ok. ich fang mit den skizzen an', ''],
        personalMessages: {
          2: 'male zellen. bitte nicht ansprechen. war ein witz',
        },
      },
    },
    followup2: {
      jello: {
        lines: [
          'hi. sorry',
          'ich hab meiner mama vom referat erzählt',
          'sie meint, wir könnten eine 3d-zelle aus wackelpudding machen',
          'ist das blöd. das ist bestimmt blöd',
        ],
        choices: [
          { text: 'WACKELPUDDING-ZELLE!! das is genial', label: 'Genial!!' },
          { text: 'schmilzt der nich im bus?', label: 'Schmilzt der?' },
        ],
      },
      melt: {
        lines: [
          'oh',
          'ja. du hast recht. sorry',
          'vergiss, dass ich was gesagt hab',
        ],
        choices: [
          {
            text: 'nee warte, wir können ihn in ner kühlbox transportieren!',
            label: 'Kühlbox!',
          },
          {
            text: 'is aber ne coole idee. vielleicht für pluspunkte?',
            label: 'Pluspunkte?',
          },
        ],
      },
      cooler: {
        lines: [
          'oh. wir haben eine kühlbox',
          'vom zelten. die riecht ein bisschen nach fisch',
          'aber das würde gehen',
        ],
        choices: [
          { text: 'fisch-wackelpudding-zelle lol' },
          { text: 'wir können sie auslüften' },
        ],
      },
      extra: {
        lines: [
          'vielleicht',
          'ich frag herrn dalton. wenn ich mich traue',
          'ok ich hab jetzt klavier. sorry. tschüss',
          '',
        ],
      },
      genius: {
        lines: [
          'echt?',
          'ok. weintrauben können die mitochondrien sein',
          'und eine pflaume der zellkern',
          'tschuldige. ich hab mich gefreut',
        ],
        choices: [
          {
            text: 'entschuldig dich nicht, das is super',
            label: 'Kein Sorry',
          },
          { text: 'können wir ihn danach essen?', label: 'Danach essen?' },
        ],
      },
      eat: {
        lines: [
          'ich glaube, das wäre kannibalismus. für zellen',
          'aber ja',
          '',
        ],
        personalMessages: { 2: 'wackelpudding-zelle (Y) frag nicht' },
      },
      thanks: {
        lines: [
          'ok',
          'ähm. danke {name}',
          'ich bin froh, dass herr dalton uns zusammen eingeteilt hat. sorry, falls das komisch ist',
          '',
        ],
        personalMessages: { 3: 'wackelpudding-zelle (Y) frag nicht' },
      },
    },
    day2: {
      jello: {
        lines: [
          'ähm hi {name}',
          'sorry. passt es grad?',
          'wir haben den wackelpudding gemacht. ich und meine mama',
          'der muss über nacht fest werden',
          'ich hab die weintrauben zu früh reingetan. die sind alle untergegangen',
        ],
        choices: [
          {
            text: 'lol sinkende mitochondrien',
            label: 'Sinkende Mitochondrien',
          },
          { text: 'geht’s dem zellkern gut?', label: 'Der Zellkern?' },
        ],
      },
      sank: {
        lines: [
          'ja. die liegen alle unten',
          'vielleicht sind das müde mitochondrien',
          'sorry. schlechter witz',
        ],
        choices: [
          { text: 'nein der war lustig lol', label: 'Lustig lol' },
          { text: 'wir kriegen das morgen hin', label: 'Morgen hinkriegen' },
        ],
      },
      plum: {
        lines: [
          'der pflaume geht’s gut',
          'also. meine kleine schwester hat die hälfte gegessen',
          'jetzt ist es ein halber zellkern. sorry',
        ],
        choices: [
          {
            text: 'ein halber zellkern. sehr wissenschaftlich',
            label: 'Sehr wissenschaftlich',
          },
          { text: 'wir nehmen nen pfirsich!', label: 'Pfirsich nehmen' },
        ],
      },
      joke: {
        lines: [':)', 'ok. ich mal heute abend die beschriftungen', ''],
        personalMessages: { 2: 'beschrifte wackelpudding. ganz normal' },
      },
      fix: {
        lines: [
          'ok. gut',
          'du weißt immer, was zu tun ist',
          'tschuldige. das klang komisch. tschüss',
          '',
        ],
        personalMessages: { 3: 'plan B für den wackelpudding' },
      },
    },
    day3: {
      fridge: {
        lines: [
          '{name}? sorry. ist irgendwie ein notfall',
          'ich hab grad nach dem wackelpudding geguckt',
          'der ist nicht ganz fest geworden',
          'der wackelt. also SEHR',
        ],
        choices: [
          { text: 'ab in die tiefkühltruhe!', label: 'Tiefkühltruhe!' },
          {
            text: 'mehr gelatine rein und warten',
            label: 'Mehr Gelatine',
          },
          {
            text: 'wackelig is ok. zellen sind auch wackelig',
            label: 'Wackelig is ok',
          },
        ],
      },
      wobbly: {
        lines: [
          'oh. das stimmt eigentlich',
          'zytoplasma ist so ähnlich wie wackelpudding. hab ich gelesen',
          'aber herr dalton piekst da rein. der piekst überall rein',
        ],
        choices: [
          { text: 'ok dann mehr gelatine' },
          { text: 'schnell. tiefkühltruhe' },
        ],
      },
      freezer: {
        lines: [
          'ok. mach ich',
          'ähm',
          'der ist gerissen. genau in der mitte. und die weintrauben sind gefroren',
          'sorry. das ist meine schuld',
        ],
        choices: [
          {
            text: 'nenn es ne zelle nach einem erdbeben',
            label: 'Erdbeben-Zelle',
          },
          {
            text: 'is nich deine schuld. bring das plakat auch mit',
            label: 'Nich deine Schuld',
          },
        ],
      },
      quake: {
        lines: [
          'oh',
          'das könnte herrn dalton sogar gefallen',
          'ich kann ein schild machen. „eine zelle unter stress“',
          '',
        ],
        personalMessages: { 3: 'unsere zelle hat viel durchgemacht' },
      },
      backup: {
        lines: [
          'ok. das plakat als reserve',
          'und den wackelpudding. für die… haptik',
          'danke {name}. sorry. tschüss',
          '',
        ],
        personalMessages: { 3: 'wackelpudding: gerissen. plakat: fertig' },
      },
      wait: {
        lines: [
          'ok. meine mama hatte noch eine packung',
          'sorry. ich sag dir in einer stunde bescheid',
          '…',
          'es hat geklappt',
          'der ist perfekt. die weintrauben sind sogar an der richtigen stelle',
        ],
        choices: [
          { text: 'JA theo!!', label: 'JA!!' },
          { text: 'siehste? gutes team (Y)', label: 'Gutes Team' },
        ],
      },
      yay: {
        lines: [':D', 'sorry. den benutz ich sonst nie', ''],
        personalMessages: { 2: 'der wackelpudding ist FEST :D' },
      },
      team: {
        lines: ['ja', 'ähm. ja, sind wir', ''],
        personalMessages: { 2: 'der wackelpudding ist FEST :D' },
      },
    },
    day4: {
      cards: {
        lines: [
          'ähm {name}',
          'wir halten morgen das referat. erste stunde',
          'ich hab meinen teil auf 14 karteikarten geschrieben',
          'ich hab vorm spiegel geübt. ich hab 6 mal sorry gesagt',
          'zum spiegel',
        ],
        choices: [
          { text: 'du schaffst das theo', label: 'Du schaffst das' },
          { text: 'üb an mir!', label: 'Üb an mir' },
        ],
      },
      practice: {
        lines: [
          'ok. ähm',
          '„das ist eine pflanzenzelle. sorry. das ist eine pflanzenzelle“',
          '…war das ok',
        ],
        choices: [
          { text: 'lass das sorry weg und es is perfekt', label: 'Ohne Sorry' },
          { text: 'sehr deutlich. glatte eins', label: 'Glatte Eins' },
        ],
      },
      nosorry: {
        lines: [
          'ich hab gar nicht gemerkt, dass ich das gesagt hab',
          'ok. ich schreib mir KEIN SORRY auf die hand',
          '',
        ],
        personalMessages: { 2: 'KEIN SORRY (steht auf meiner hand)' },
      },
      great: {
        lines: ['ok', 'du machst die einleitung und ich die organellen?'],
        choices: [
          { text: 'abgemacht (Y)' },
          {
            text: 'du machst die einleitung. du kannst das besser als du denkst',
            label: 'Du machst die Einleitung',
          },
        ],
      },
      deal: {
        lines: [
          'ok. danke',
          'ich bring den wackelpudding in unserer zelt-kühlbox mit',
          'die riecht ein bisschen nach fisch. sorry schon mal',
        ],
      },
      intro: {
        lines: [
          'oh',
          'ok. ich versuch’s',
          'dann brauch ich noch 3 karteikarten',
          '',
        ],
        personalMessages: { 3: 'morgen referat. 17 karteikarten' },
      },
    },
    day5: {
      grade: {
        lines: [
          'ähm hi',
          'herr dalton hat die noten ausgehängt',
          'wir haben ne 2+',
        ],
        choices: [
          { text: '2+!! WIR HABEN’S GESCHAFFT', label: 'Geschafft!!' },
          { text: 'nur ne 2+? lol', label: 'Nur ne 2+?' },
        ],
      },
      only: {
        lines: [
          'oh. ähm. sorry',
          'der wackelpudding hat punkte verloren wegen „statischer mängel“',
          'aber er meinte, die zeichnungen waren die besten in der klasse',
        ],
        choices: [
          { text: 'ok das is echt super', label: 'Das is super' },
          {
            text: 'deine zeichnungen haben uns gerettet',
            label: 'Deine Zeichnungen haben uns gerettet',
          },
        ],
      },
      did: {
        lines: [
          ':)',
          'er meinte, der wackelpudding war „unvergesslich“',
          'ich glaube, das war ein kompliment',
        ],
        choices: [
          { text: 'auf jeden fall ein kompliment', label: 'Ein Kompliment' },
          { text: 'und deine zeichnungen?' },
        ],
      },
      drawings: {
        lines: [
          'er meinte, die waren die besten in der klasse',
          'ich wusste nicht, was ich machen soll, also hab ich sorry gesagt',
          'er meinte „entschuldige dich nicht, sei stolz“',
        ],
        choices: [
          { text: 'hör auf herrn dalton' },
          { text: 'ich bin stolz auf dich theo' },
        ],
      },
      thanks: {
        lines: [
          'ähm',
          `danke, dass du ${g('meine partnerin', 'mein partner')} warst, {name}`,
          'sorry. ich mein. danke. nicht sorry',
          '',
        ],
        personalMessages: {
          3: `ne 2+ und ${g('ne gute partnerin', 'ein guter partner')} :)`,
        },
      },
    },
    nowPlaying2: {
      wave: {
        lines: [
          'ähm',
          'ist das newer wave? was du hörst',
          'sorry. das steht bei deinem namen. ich hab nicht spioniert',
          'das hör ich immer beim zeichnen',
        ],
        choices: [
          { text: 'was zeichnest du grad?', label: 'Was zeichnest du?' },
          {
            text: 'dann haben wir den gleichen geschmack',
            label: 'Gleicher Geschmack',
          },
        ],
      },
      frog: {
        lines: [
          'einen frosch. im raumanzug',
          'nicht lachen',
          'ok, ein bisschen darfst du lachen',
        ],
      },
      taste: {
        lines: [
          'oh. cool',
          'das ist eigentlich echt cool',
          'sorry. ok. tschüss',
        ],
      },
    },
    gameScore: {
      wow: {
        lines: [
          'hi. sorry',
          'hast du grad minen in {score} sekunden geschafft?',
          'das ist echt gut',
          'ich klick immer als erstes auf eine mine. sorry, das ist nicht dein problem',
        ],
        choices: [
          {
            text: 'der erste klick is immer sicher!',
            label: 'Erster Klick is sicher',
          },
          { text: 'soll ich’s dir zeigen?', label: 'Ich zeig’s dir' },
        ],
      },
      safe: {
        lines: [
          'oh',
          'dann klick ich wohl als zweites auf eine mine',
          'sorry. das ist schlimmer',
        ],
      },
      show: {
        lines: [
          'echt?',
          'vielleicht im computerraum. wenn das ok ist',
          'danke {name}',
        ],
      },
    },
  },
};
