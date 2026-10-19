// German text for marco (docs/localization-de.md → "Marco: dry, lowercase, never „!“"). Same ids,
// same line and choice counts as `src/content/contacts/marco*.ts`; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const marco: ContactOverlay = {
  personalMessage: 'studio heute abend. nicht anrufen.',
  awayReply: 'abwesend. klassiker.',
  days: {
    2: { personalMessage: 'velvet lantern im bean cellar. flyer hängen' },
    3: { personalMessage: 'schlagzeuger gesucht. muss in nen rucksack passen' },
    4: { personalMessage: 'derek ist zurück. der eimer auch' },
    5: { personalMessage: 'ausverkauft. kapazität: 11' },
  },
  scripts: {
    opening: {
      hey: {
        lines: [
          'hey zwerg',
          'hab gehört, du hast nen neuen computer. nicht schlecht',
        ],
        choices: [
          { text: 'ja der is sooo schnell', label: 'Sooo schnell' },
          { text: 'wer hat dir das erzählt??', label: 'Wer hat’s erzählt?' },
        ],
      },
      who: {
        lines: ['tante rita. die erzählt allen alles', 'weißt du doch'],
        choices: [{ text: 'stimmt' }, { text: 'boah. familie' }],
      },
      fast: {
        lines: [
          'genieß es, solange es hält',
          'und müll ihn nicht mit toolbars zu. lol',
        ],
        choices: [{ text: 'welche toolbars?' }, { text: 'zu spät haha' }],
      },
      toolbars: {
        lines: [
          'die, die bei jedem gratis-bildschirmschoner mit dabei sind. glaub mir',
        ],
        choices: [
          { text: 'ok ok keine bildschirmschoner', label: 'Ok ok' },
          {
            text: 'aber der mit den fischen is so cool',
            label: 'Aber die Fische...',
          },
        ],
      },
      late: {
        lines: [
          'lol. klassiker',
          'fängt mit einem smiley-paket an und dann ist es vorbei',
        ],
        choices: [
          { text: 'kannst du das reparieren?', label: 'Reparierst du’s?' },
          { text: 'egal. wie is die uni?', label: 'Wie is die Uni?' },
        ],
      },
      fix: {
        lines: [
          'an omas geburtstag. bring knabberzeug mit',
          'muss los, probe. bis dann zwerg',
          '',
        ],
      },
      band: {
        lines: [
          'egal. die band hat endlich nen richtigen auftritt',
          'velvet lantern im jugendzentrum, samstag',
        ],
        choices: [
          { text: 'darf ich kommen??' },
          { text: 'deine band gibts noch?', label: 'Gibt’s die noch?' },
        ],
      },
      come: {
        lines: [
          'wenn deine mama ja sagt. ich setz dich auf die liste',
          'aber sag keinem, dass du mich kennst',
          '',
        ],
        personalMessages: { 2: 'velvet lantern live sa. (Y)' },
      },
      roast: {
        lines: [
          'wow. ok. eiskalt',
          'du kannst trotzdem kommen. ich widme deiner einstellung einen song',
        ],
      },
    },
    nowPlaying: {
      taste: {
        lines: [
          '{title}? ok dein geschmack wird besser',
          'noch nicht velvet lantern, aber ein anfang',
        ],
      },
    },
    practice: {
      bye: {
        lines: ['bin auf dem weg zur probe. benimm dich', ''],
        personalMessages: { 1: 'bei der probe. echt jetzt nicht anrufen' },
      },
    },
    followup1: {
      ask: {
        lines: [
          'ok frage',
          'dein schicker neuer computer. der hat doch n malprogramm oder',
        ],
        choices: [
          { text: 'ja logisch. wieso' },
          {
            text: 'kommt drauf an. was krieg ich dafür',
            label: 'Was krieg ich dafür?',
          },
        ],
      },
      deal: {
        lines: [
          'wow. verhandeln. wer hat dich bloß erzogen',
          'ein velvet-lantern-shirt. größe s',
          'die einzige größe, die noch übrig ist. interpretier da nichts rein',
        ],
        choices: [
          { text: 'abgemacht (Y)' },
          {
            text: 'also hat keiner die kleinen gekauft lol',
            label: 'Keiner wollte die?',
          },
        ],
      },
      smalls: {
        lines: ['wir haben zwei verkauft. an meine mutter', 'weiter im text'],
        choices: [
          { text: 'lol ok. was brauchst du' },
          { text: 'deine mama is dein größter fan :)', label: 'Größter Fan' },
        ],
      },
      flyer: {
        lines: [
          'wir brauchen nen flyer für den nächsten auftritt',
          'unser schlagzeuger hat einen gemacht. sah aus wie ne einladung zum 6. kindergeburtstag',
          'regenbogenbuchstaben. clipart-luftballon. es war schlimm',
          'also. bist du dabei',
        ],
        choices: [
          {
            text: g(
              'JA. glitzerschrift und überall flammen',
              'JA. überall flammen. und n brennender totenkopf',
            ),
            label: g('Glitzer + Flammen', 'Flammen + Totenkopf'),
          },
          {
            text: 'schwarz-weiß. ganz düster. ganz ernst',
            label: 'Düster und ernst',
          },
        ],
      },
      glitter: {
        lines: [
          'nein',
          '...',
          'ok vielleicht flammen. kleine flammen. geschmackvolle flammen',
          g(
            'wenn derek glitzer sieht, steigt er aus. schon wieder',
            'wenn derek nen totenkopf sieht, steigt er aus. schon wieder. totenköpfe sind „was für metalbands“',
          ),
          '',
        ],
        personalMessages: {
          4: g(
            'neuer flyer in arbeit. kein glitzer. ok n paar flammen',
            'neuer flyer in arbeit. keine totenköpfe. ok n paar flammen',
          ),
        },
      },
      serious: {
        lines: [
          `siehste. deswegen bist du ${g('meine lieblingscousine', 'mein lieblingscousin')}`,
          'sags nicht den anderen',
          'schick ihn mir per mail, wenn du fertig bist. kein stress. bis freitag',
          '',
        ],
        personalMessages: {
          3: 'velvet lantern. neuer flyer kommt. sehr ernst',
        },
      },
    },
    followup2: {
      vote: {
        lines: [
          'bist du da',
          'brauche ne entscheidende stimme. band-notfall',
          'derek will unseren namen ändern',
          'in „velvet lantern and the night shift“',
          'steht 2 zu 2. du entscheidest. kein druck',
        ],
        choices: [
          { text: 'velvet lantern bleibt natürlich', label: 'Name bleibt' },
          {
            text: 'der night-shift-teil is aber schon cool',
            label: 'Night Shift is cool',
          },
          {
            text: 'wie wärs mit „marco und die versager“',
            label: 'Marco und die Versager',
          },
        ],
      },
      keep: {
        lines: [
          'richtige antwort',
          `ich sag derek, dass ihn ${g('meine kleine cousine', 'mein kleiner cousin')} überstimmt hat. der schmollt die ganze woche`,
        ],
        choices: [
          { text: 'sag ihm sorry von mir lol', label: 'Sorry sagen' },
          { text: 'gut. hat er verdient', label: 'Hat er verdient' },
        ],
      },
      nightshift: {
        lines: [
          'wow',
          'verraten von der eigenen familie',
          'ok gut. ich hab gewettet, dass du unseren nimmst. jetzt schulde ich derek ne pizza',
        ],
        choices: [
          { text: 'sorry :P' },
          { text: 'krieg ich n stück ab', label: 'Krieg ich n Stück?' },
        ],
      },
      pizza: {
        lines: [
          'nein',
          'verräter kriegen keine pizza. steht in den bandregeln',
        ],
      },
      losers: {
        lines: [
          'zum totlachen',
          'derek hat so gelacht, dass ihm ein drumstick runtergefallen ist',
          'jetzt stimmt er dafür. danke auch, zwerg',
          '',
        ],
        personalMessages: { 3: 'bandname: wird überprüft. (N)' },
      },
      studio: {
        lines: [
          'ok muss wieder rein. der studiotyp rechnet nach stunden ab',
          'bis dann zwerg',
          '',
        ],
        personalMessages: {
          2: 'immer noch velvet lantern. studio. nicht anrufen',
        },
      },
    },
    day2: {
      flyer: {
        lines: [
          'hey zwerg',
          'der flyer hängt. café, waschsalon, bushaltestelle',
          'velvet lantern. live im bean cellar. nur eine nacht',
          'der bean cellar ist der keller unterm café. sehr intim',
        ],
        choices: [
          {
            text: 'wie viele leute passen da rein?',
            label: 'Wie viele passen rein?',
          },
          { text: 'hast du meinen flyer genommen??', label: 'Mein Flyer??' },
        ],
      },
      myflyer: {
        lines: [
          'teile davon',
          'derek hat ihn mit filzstift „verbessert“. frag nicht',
          'den namen kann man noch lesen. größtenteils',
        ],
        choices: [
          { text: 'was hat er gemalt??', label: 'Was hat er gemalt?' },
          {
            text: 'boah. und wie viele passen rein?',
            label: 'Wie viele passen rein?',
          },
        ],
      },
      marker: {
        lines: [
          'ne laterne. das soll ne laterne sein',
          'sieht aus wie n glas suppe',
          'drei leute haben gefragt, ob wir suppe verkaufen',
          '',
        ],
        personalMessages: { 3: 'velvet lantern im bean cellar. keine suppe' },
      },
      capacity: {
        lines: [
          'der typ sagt 11. vielleicht 12, wenn sie sich mögen',
          'brandschutz ist eher ne empfehlung. seine worte, nicht meine',
        ],
        choices: [
          { text: 'das is ja winzig lol', label: 'Winzig lol' },
          { text: 'gemütlich. sehr indie', label: 'Sehr indie' },
        ],
      },
      tiny: {
        lines: [
          'das nennt man exklusiv',
          'du stehst trotzdem auf der liste. wenn deine mama ja sagt',
          '',
        ],
        personalMessages: { 2: 'velvet lantern. exklusiv. (winzig)' },
      },
      indie: {
        lines: [
          'siehste. du verstehst das',
          'derek sagt, er ist „zu klein für seinen sound“',
          'sagt derek immer. ok probe. bis dann zwerg',
          '',
        ],
      },
    },
    day3: {
      quit: {
        lines: [
          'also',
          'derek ist ausgestiegen',
          'schon wieder. das vierte mal dieses jahr',
          'im bean cellar ist kein platz für ein schlagzeug. der typ sagt, er darf eine snare mitbringen',
        ],
        choices: [
          { text: 'eine snare??', label: 'Eine Snare??' },
          {
            text: 'findest du nen neuen schlagzeuger?',
            label: 'Neuer Schlagzeuger?',
          },
          {
            text: 'sag ihm, er soll nicht aussteigen',
            label: 'Nicht aussteigen',
          },
        ],
      },
      snare: {
        lines: [
          'eine snare. und „was in nen rucksack passt“',
          'derek nimmt das persönlich. er sagt, seine kunst braucht becken',
        ],
        choices: [
          { text: 'seine KUNST lol', label: 'Seine Kunst lol' },
          { text: 'der kommt wieder. tut er immer', label: 'Der kommt wieder' },
        ],
      },
      art: {
        lines: [
          'ich weiß',
          'hab ich ihm auch gesagt. deswegen ist er unter anderem ausgestiegen',
          '',
        ],
        personalMessages: { 2: 'schlagzeuger gesucht. bitte keine kunst' },
      },
      always: {
        lines: [
          'wahrscheinlich',
          'er hat seine sticks hier liegen lassen. ist meistens ein gutes zeichen',
          'oder er hat sie einfach vergessen. bis dann zwerg',
        ],
      },
      replace: {
        lines: [
          'zwei tage vor dem auftritt. klar',
          'mein mitbewohner hat sich angeboten. er kam mit pfanne und gabel zum vorspielen',
        ],
        choices: [
          { text: 'nimm ihn', label: 'Nimm ihn' },
          { text: 'ok vielleicht ruf derek doch an', label: 'Derek anrufen' },
        ],
      },
      fork: {
        lines: [
          'er hat den takt besser gehalten als derek',
          'das ist für niemanden ein kompliment',
          '',
        ],
        personalMessages: {
          2: 'neuer schlagzeuger: eine pfanne. läuft ganz ok',
        },
      },
      plea: {
        lines: [
          'ich sags ihm',
          `auf mich hört er nicht. auf ${g('meine kleine cousine', 'meinen kleinen cousin')} vielleicht`,
          'ok. ich ruf ihn an. drück mir die daumen',
          '',
        ],
      },
    },
    day4: {
      back: {
        lines: [
          'neuigkeiten',
          'derek ist wieder eingestiegen',
          'kam mit ner snare und nem eimer zur probe',
          'er sagt, der eimer ist „eine zweite trommel“. es ist ein farbeimer',
        ],
        choices: [
          { text: 'lol und klingt das gut?', label: 'Klingt das gut?' },
          {
            text: 'hab doch gesagt, der kommt wieder',
            label: 'Hab ich doch gesagt',
          },
        ],
      },
      sound: {
        lines: [
          'ehrlich gesagt. ja',
          'sags ihm nicht',
          'er hat auch ein tamburin mitgebracht. keiner hat nach dem tamburin gefragt',
        ],
        choices: [
          { text: 'das tamburin bleibt', label: 'Tamburin bleibt' },
          { text: 'biste aufgeregt wegen morgen?', label: 'Aufgeregt?' },
        ],
      },
      toldu: {
        lines: [
          'ja ja',
          'er war 26 stunden weg. neuer rekord. letztes mal waren es 3',
        ],
        choices: [
          { text: 'biste aufgeregt wegen morgen?', label: 'Aufgeregt?' },
          { text: 'was spielt ihr?', label: 'Setlist?' },
        ],
      },
      tambourine: {
        lines: [
          'die band hat abgestimmt',
          'das tamburin bleibt. derek ist seitdem unerträglich',
          '',
        ],
        personalMessages: { 2: 'jetzt neu: mit tamburin' },
      },
      setlist: {
        lines: [
          'sechs songs. fünf eigene und ein cover, das keiner kennt',
          'also quasi sechs eigene',
          'ok. letzte probe. bis dann zwerg',
        ],
      },
      nerves: {
        lines: [
          'nein',
          '...',
          'n bisschen. sags keinem. vor allem nicht tante rita',
          '',
        ],
        personalMessages: { 3: 'nicht aufgeregt. geh weg' },
      },
    },
    day5: {
      gig: {
        lines: [
          'zwerg',
          'der auftritt ist gelaufen',
          '11 leute waren da',
          'ausverkauft, wenn in den laden 11 reinpassen',
          'tun sie',
        ],
        choices: [
          { text: '11 is super!!', label: '11 is super!!' },
          { text: 'wer waren die 11?', label: 'Wer war da?' },
        ],
      },
      great: {
        lines: [
          'ist ok. ist ne zahl',
          '...',
          'ok es war gut. es war richtig gut',
        ],
        choices: [
          { text: 'bin stolz auf dich :)', label: 'Stolz auf dich' },
          { text: 'hat derek den eimer gespielt?', label: 'Der Eimer?' },
        ],
      },
      who: {
        lines: [
          'mein mitbewohner. dereks mutter. zwei mädels aus meinem literaturseminar',
          'der typ vom café oben drüber',
          'und fünf fremde. zwerg. wir haben jetzt fans',
        ],
        choices: [
          { text: 'du bist berühmt', label: 'Berühmt' },
          { text: 'hat derek den eimer gespielt?', label: 'Der Eimer?' },
        ],
      },
      bucket: {
        lines: [
          'der eimer war das beste',
          'beim letzten song hat er ihn umgetreten. alle dachten, das war absicht',
          'jetzt gehört das zur show',
          '',
        ],
        personalMessages: { 3: 'velvet lantern feat. der eimer. ausverkauft' },
      },
      proud: {
        lines: [
          'danke zwerg',
          'nächstes mal stehst du auf der liste. erste reihe',
          'ist auch die letzte reihe. es gibt nur eine',
          '',
        ],
        personalMessages: { 3: '11 leute. 1 reihe. nichts bereut' },
      },
      famous: {
        lines: [
          'berühmt bei elf leuten',
          'ich hab ne serviette signiert. mein mitbewohner wollte das aus spaß',
          'hab trotzdem unterschrieben. aus prinzip',
        ],
      },
    },
    nowPlaying2: {
      judge: {
        lines: [
          'moment',
          'voxel revolution. echt jetzt',
          'das ist musik für den ladebildschirm von nem videospiel',
        ],
        choices: [
          {
            text: 'der song is der hammer und das weißt du',
            label: 'Is der Hammer',
          },
          { text: 'ok und was soll ich dann hören', label: 'Was dann?' },
        ],
      },
      banger: {
        lines: ['ist ok. ist ok', 'ich hab einmal genickt. sags niemandem'],
      },
      mix: {
        lines: [
          'velvet-lantern-demo. natürlich',
          'ich brenn dir ne mix-cd, wenn ich das nächste mal zuhause bin',
          'mit handgeschriebener titelliste. wie ein profi',
        ],
      },
    },
    gameScore: {
      hens: {
        lines: [
          'hab gehört, du hast heute {score} punkte hühner geschossen',
          'hat pia mir erzählt. sie erzählt mir alles',
          'unser schlagzeuger spielt das zwischen den sets. da ist er noch schlechter als am schlagzeug',
        ],
        choices: [
          { text: 'is das schlecht?', label: 'Is das schlecht?' },
          { text: 'den würd ich schlagen', label: 'Den schlag ich' },
        ],
      },
      bad: {
        lines: [
          'er hat mal neunmal auf die vogelscheuche geschossen',
          'mit absicht. er sagt, das war persönlich',
        ],
      },
      beat: {
        lines: ['den schlägt jeder', 'ich sags ihm. das braucht er'],
      },
    },
    // Top 8 drama (P0-03).
    'top8-dropped': {
      noticed: {
        lines: [
          'zwerg',
          'tante rita hat angerufen. ich bin wohl nicht mehr in deiner top 8',
          'sie ist gekränkter als ich',
          'ich bin nicht gekränkt. nur fürs protokoll',
          '',
        ],
        personalMessages: { 4: 'aus einer top 8 entfernt. komme klar' },
      },
    },
    'top8-readded': {
      back: {
        lines: [
          'zwerg',
          'wieder in der top 8. tante rita wusste es vor mir',
          'ich versuche, bescheiden zu bleiben',
          '',
        ],
        personalMessages: { 3: 'wieder top 8. demütig' },
      },
    },
  },
};
