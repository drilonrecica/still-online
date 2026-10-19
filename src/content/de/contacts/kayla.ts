// German text for kayla (docs/localization-de.md → "Kayla: ~*drama*~"). Same ids, same line
// and choice counts as `src/content/contacts/kayla*.ts`; '' = a line without text.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';
import { kaylaWeek2Days, kaylaWeek2Scripts } from '../../contacts/kayla-week2';
import { kaylaGirlThreads } from './girl-threads';
import { placeholderDays, placeholderScripts } from './placeholder';

export const kayla: ContactOverlay = {
  personalMessage: 'manche leute sollten ma lernen was treue heißt...',
  days: {
    2: { personalMessage: '~*manche leute sind SO originell*~ (nich)' },
    3: { personalMessage: '~*nich eingeladen und heul NICHT*~' },
    4: { personalMessage: '~*wart drauf dass das universum sich erklärt*~' },
    5: { personalMessage: '~*übernachtungsparty überlebt*~' },
    // Days 6–10: placeholders until W3.
    ...placeholderDays(kaylaWeek2Days),
  },
  scripts: {
    opening: {
      hi: {
        lines: [
          '{name}',
          'hast du gesehen was brianna für nen spruch drin hat',
        ],
        choices: [
          { text: 'nein was??' },
          { text: 'kayla nich schon wieder', label: 'Nich schon wieder...' },
        ],
      },
      again: {
        lines: ['wie bitte?? das is WICHTIG', ''],
        personalMessages: { 1: 'keiner versteht mich' },
        choices: [
          { text: 'ok ok was is passiert' },
          { text: 'na gut. erzähl' },
        ],
      },
      what: {
        lines: [
          'sie hat reingeschrieben „manche leute machen ALLES nach was ich mach“',
          'JEDER weiß dass das um mich geht',
          'ich hatte den gestreiften kapuzenpulli ZUERST',
        ],
        choices: [
          { text: 'omg wie fies', label: 'Voll fies' },
          { text: 'vllt gehts gar nich um dich?', label: 'Nich um dich?' },
        ],
      },
      doubt: {
        lines: ['{name}. es geht IMMER um mich', 'auf wessen seite bist du'],
        choices: [
          { text: 'auf deiner natürlich' },
          { text: 'auf keiner. ich bin die schweiz', label: 'Schweiz' },
        ],
      },
      swiss: {
        lines: ['boah du bist so diplomatisch das nervt', ''],
        personalMessages: { 1: 'trau niemandem. nich ma der schweiz' },
        choices: [
          { text: 'lol ok ich bin auf deiner seite', label: 'Ok, deine Seite' },
          {
            text: 'können wir über was anderes reden',
            label: 'Themawechsel',
          },
        ],
      },
      side: {
        lines: ['DANKE', 'ok ich änder meinen spruch. pass auf', ''],
        personalMessages: { 2: '~*wahre freunde bleiben treu*~ (L)' },
        choices: [
          { text: 'uuh dramatisch' },
          { text: 'geht das um brianna?', label: 'Um Brianna?' },
        ],
      },
      plan: {
        lines: [
          'vielleicht. vielleicht auch nich ;)',
          'soll ich ihr morgen in der großen pause was sagen?',
        ],
        choices: [
          { text: 'ignorier es einfach', label: 'Ignorieren' },
          { text: 'red mit ihr. nett', label: 'Nett reden' },
        ],
      },
      ignore: {
        lines: ['ja. ignorieren is die ultimative rache', ''],
        personalMessages: { 1: 'ignoriere leute die egal sind :)' },
      },
      talk: {
        lines: [
          'menno OK du hast wahrscheinlich recht',
          'aber wenn sie die augen verdreht geh ich',
          '',
        ],
        personalMessages: { 2: 'die klügere gibt nach (Y)' },
      },
      else: {
        lines: [
          'na gut. haste den deutsch-aufsatz fertig',
          'spaß. is mir egal lol',
          '',
        ],
        personalMessages: { 2: '~*egal*~' },
      },
    },
    update: {
      update: {
        lines: [
          'UPDATE',
          'brianna hat grad AUCH ihren spruch geändert',
          'das heißt krieg',
          '',
        ],
        personalMessages: { 3: '~*jetzt gehts LOS*~' },
        choices: [
          { text: 'kayla. atmen.', label: 'Atmen' },
          { text: 'lol mach sie fertig', label: 'Mach sie fertig' },
        ],
      },
      calm: {
        lines: ['...ok. ich atme', ''],
        personalMessages: { 1: '~*zen-modus*~' },
      },
      war: {
        lines: ['lol spaß so dramatisch bin ich nich', '...doch bin ich'],
      },
    },
    nowPlaying: {
      life: {
        lines: ['omg {title} is grad echt mein leben', ''],
        personalMessages: { 1: '{title} = mein leben <3' },
      },
    },
    followup1: {
      poll: {
        lines: [
          '{name}',
          'ich brauch deine meinung. is dringend',
          'brianna guckt so alle 5 min auf meinen spruch also muss er PERFEKT sein',
          'option 1: „manche leute sind halt neidisch“',
          'option 2: „~*glücklich und strahlend*~ :)“',
          'option 3: was trauriges damit alle fragen was los is',
        ],
        choices: [
          { text: '1 natürlich' },
          {
            text: `2. sei ${g('die klügere', 'der klügere')}`,
            label: `2, ${g('Die Klügere', 'Der Klügere')}`,
          },
          {
            text: '3 lol du bist so ne drama-queen',
            label: '3, Drama-Queen',
          },
        ],
      },
      jealous: {
        lines: [
          'JA. subtil aber tödlich',
          '',
          'und jetzt stell ich auf beschäftigt',
          '',
          'ich bin nich wirklich beschäftigt. is ne strategie',
        ],
        personalMessages: { 1: 'manche leute sind halt neidisch ;)' },
      },
      thriving: {
        lines: [
          'menno du hast recht. reife kayla. neue kayla',
          '',
          '...',
          'das fühlt sich so fake an',
          'ok ich hab 30 sekunden durchgehalten',
          '',
        ],
        personalMessages: {
          1: '~*glücklich und strahlend*~ :)',
          5: '~*glücklich und strahlend (irgendwie)*~',
        },
      },
      sad: {
        lines: [
          'WIE BITTE',
          'ich bin keine drama-queen',
          'ich bin ne drama-PRINZESSIN. das is ein unterschied *seufz*',
          'ok aber was schreib ich rein',
        ],
        choices: [
          {
            text: 'was mit regen. traurige sachen sind immer mit regen',
            label: 'Was mit Regen',
          },
          {
            text: 'denk dir selber was aus. du bist tiefgründig',
            label: 'Selbst schreiben',
          },
        ],
      },
      rain: {
        lines: ['omg du hast so recht', '', 'perfekt. so tragisch. 10 von 10'],
        personalMessages: { 1: '~*der regen kennt meine geheimnisse*~ :(' },
      },
      poet: {
        lines: [
          'ok warte. es kommt grad',
          '',
          'warte das is echt tiefgründig',
          'ich heul grad n bisschen',
        ],
        personalMessages: {
          1: 'man kann nich zerbrechen was nie ganz war...',
        },
      },
    },
    followup2: {
      omg: {
        lines: [
          'omg. omg. {name}',
          'brianna hat mich grad angeschrieben',
          'sie hat geschrieben „süßer spruch“',
          'WAS SOLL DAS HEISSEN',
          '',
        ],
        personalMessages: { 4: '???????' },
        choices: [
          {
            text: g(
              'vllt findet sie ihn einfach süß?',
              'vllt meint sies einfach nett?',
            ),
            label: 'Vllt nett gemeint?',
          },
          { text: 'das is TOTAL ironisch', label: 'Ironisch' },
          { text: 'sag einfach danke lol', label: 'Danke sagen' },
        ],
      },
      literal: {
        lines: [
          'süß wie SÜSS oder süß wie „ooch wie traurig“',
          g(
            'das is ein RIESEN unterschied {name}',
            'das is ein RIESEN unterschied {name}. boah JUNGS',
          ),
        ],
        choices: [
          {
            text: g(
              'süß wie süß. chill ma',
              'kayla. das sind 2 wörter. passt schon',
            ),
            label: g('Chill ma', 'Passt schon'),
          },
          {
            text: 'ok ja das is die traurige sorte',
            label: 'Die traurige Sorte',
          },
        ],
      },
      sarcastic: {
        lines: [
          'ICH WUSSTE ES',
          'ok ich schreib zurück „thx, dein spruch is auch süß“',
          'warte is das zu viel',
        ],
        choices: [
          { text: 'perfekt. abschicken', label: 'Abschicken' },
          { text: 'zu viel. abbrechen abbrechen', label: 'Abbrechen!' },
        ],
      },
      sent: {
        lines: [
          'GESCHICKT',
          '...',
          'sie hat :P zurückgeschickt',
          'is das krieg oder frieden',
          'ich muss mich hinlegen *seufz*',
          '',
        ],
        personalMessages: { 5: '~*lieg flach. bitte nich stören*~' },
      },
      thanks: {
        lines: [
          'na gut. ich hab „thx :)“ geschrieben',
          '...',
          'sie hat „np :)“ geschrieben',
          'omg sind wir jetzt freundinnen??',
          'ich weiß nich was ich davon halten soll',
          '',
        ],
        personalMessages: { 5: '~*verwirrt*~ :O' },
      },
    },
    day2: {
      hoodie: {
        lines: [
          '{name}',
          'alarmstufe rot',
          'brianna hatte heute den gestreiften kapuzenpulli an',
          'DEN gestreiften kapuzenpulli. MEINEN gestreiften kapuzenpulli',
          'wir sind morgens gleichzeitig in die klasse gekommen. wie ZWILLINGE',
          '',
        ],
        personalMessages: { 5: '~*nachmacher-alarm*~' },
        choices: [
          { text: 'omg hats wer gemerkt??', label: 'Hats wer gemerkt?' },
          {
            text: 'vllt is das einfach n beliebter hoodie',
            label: 'Beliebter Hoodie?',
          },
          { text: 'lol zwillinge', label: 'Zwillinge' },
        ],
      },
      notice: {
        lines: [
          'ALLE habens gemerkt',
          'herr dalton hat gefragt ob wir das abgesprochen haben',
          'vor der GANZEN bio-klasse',
        ],
        choices: [
          { text: 'was hast du gesagt?' },
          { text: 'was hat SIE gesagt?' },
        ],
      },
      popular: {
        lines: [
          '{name}. es gab 2 stück im ganzen einkaufszentrum. ich hab nachgeguckt',
          'sie WUSSTE es',
        ],
        choices: [
          { text: 'ok das is verdächtig', label: 'Verdächtig' },
          { text: 'hast du mit ihr geredet?' },
        ],
      },
      twins: {
        lines: [
          'NICH LUSTIG',
          '...ok n bisschen lustig',
          'NEIN. nich lustig',
          '',
        ],
        personalMessages: { 3: '~*ich bin NIEMANDES zwilling*~' },
        choices: [
          { text: 'sorry sorry. was is passiert' },
          { text: 'es war n BISSCHEN lustig', label: 'N bisschen lustig' },
        ],
      },
      said: {
        lines: [
          'ich hab gesagt „schöner pulli“',
          'sie hat gesagt „du auch“',
          'DU AUCH. als wärs IHRER',
          'morgen zieh ich was an das sie NIEMALS nachmachen kann',
          '',
        ],
        personalMessages: {
          4: '~*einzigartig. anders als MANCHE leute*~',
        },
      },
    },
    day3: {
      invite: {
        lines: [
          '{name} bist du da',
          g(
            'also brianna macht ne übernachtungsparty',
            'also brianna macht ne geburtstagsparty. und danach ne übernachtungsparty',
          ),
          g(
            'alle aus unserer stufe sind eingeladen',
            'alle aus unserer stufe sind eingeladen. ihr jungs nur zur party',
          ),
          'ALLE',
          'rate ma wer nich',
        ],
        choices: [
          { text: 'oh nein kayla :(', label: 'Oh nein :(' },
          {
            text: 'vllt is die einladung verloren gegangen?',
            label: 'Verloren gegangen?',
          },
        ],
      },
      fine: {
        lines: [
          'is ok. mir gehts GUT',
          '',
          g(
            'die machen gesichtsmasken und horrorfilme. ich HASSE spaß. ich kann nich mehr',
            'ihr kriegt kuchen und danach gucken die die ganze nacht horrorfilme. ich HASSE spaß. ich kann nich mehr',
          ),
        ],
        personalMessages: { 1: '~*GUT*~' },
        choices: [
          {
            text: g(
              'wir machen unsere eigene übernachtungsparty!!',
              'filmabend bei mir!!',
            ),
            label: g('Eigene Party', 'Filmabend'),
          },
          {
            text: 'du darfst auch traurig sein weißt du',
            label: 'Darfst traurig sein',
          },
        ],
      },
      lost: {
        lines: [
          'verloren WO {name}',
          'sie hat morgens in der klasse rosa umschläge verteilt',
          'keiner verliert einen ROSA umschlag',
        ],
        choices: [
          {
            text: g(
              'dann machen wir unsere eigene übernachtungsparty. ne bessere',
              'dann komm zum filmabend bei mir. n besserer',
            ),
            label: g('Eigene Party', 'Filmabend'),
          },
          { text: 'das is echt doof. tut mir leid', label: 'Tut mir leid' },
        ],
      },
      own: {
        lines: [
          'omg ja',
          g(
            'ne GEGEN-übernachtungsparty. aber besser',
            'n GEGEN-filmabend. aber besser',
          ),
          g('wir haben 2 sorten eis', 'wir haben 2 sorten pizza'),
          'das is eine mehr als bei brianna wahrscheinlich',
          '',
        ],
        personalMessages: {
          4: g(
            '~*übernachtungspartys sind für ECHTE freunde*~ (L)',
            '~*filmabende sind für ECHTE freunde*~ (Y)',
          ),
        },
      },
      upset: {
        lines: [
          '...',
          'ok ich bin n bisschen traurig',
          'danke {name}. sag keinem dass ich das gesagt hab',
          '',
        ],
        personalMessages: { 3: '~*manche tage sind einfach grau*~ :(' },
      },
    },
    day4: {
      sit: {
        lines: [
          '{name}. setz dich',
          'brianna hat mich angeschrieben',
          'sie hat gefragt warum ich nie auf ihre mail geantwortet hab',
          'also hab ich nachgeguckt. die war bei meinem gelöschten zeug',
          'ich lösch alles von brianna ungelesen. das is ein prinzip',
        ],
        choices: [
          { text: 'kayla.', label: 'Kayla.' },
          { text: 'was stand drin??', label: 'Was stand drin?' },
        ],
      },
      email: {
        lines: [
          'das war die einladung zur übernachtungsparty',
          'von vor so 2 wochen',
          'da stand „ich hoffe du kommst!! :)“ mit SMILEY',
          '{name} ich glaub brianna is... nett??',
          '',
        ],
        personalMessages: { 4: '~*überraschende wendung*~ :O' },
        choices: [
          { text: 'und was is mit dem spruch', label: 'Und der Spruch?' },
          {
            text: 'hab doch gesagt dass es nich um dich geht',
            label: 'Hab ich doch gesagt',
          },
        ],
      },
      sister: {
        lines: [
          'HAB ICH GEFRAGT',
          'das ging um ihre kleine schwester',
          'ihre schwester macht alles nach. ihre haare. ihre lieder. ihren spruch',
          'und den pulli hat sie gekauft weil sie MEINEN cool fand',
        ],
        choices: [
          { text: 'also is sie n fan lol', label: 'Sie is n Fan' },
          {
            text: g(
              'ooch das is irgendwie süß',
              'ha ok das is eigentlich ganz nett',
            ),
            label: g('Irgendwie süß', 'Ganz nett'),
          },
        ],
      },
      told: {
        lines: [
          'das hast du NICH gesagt',
          '...ok vllt doch. n bisschen',
          'es ging um ihre kleine schwester. die ALLES nachmacht',
        ],
        choices: [
          {
            text: 'siehste. nich alles dreht sich um dich',
            label: 'Nich um dich',
          },
          {
            text: g(
              'und gehst du jetzt zur übernachtungsparty?',
              'und gehst du jetzt hin? ich geh eh zur party',
            ),
            label: 'Gehst du hin?',
          },
        ],
      },
      go: {
        lines: [
          g(
            'die übernachtungsparty is morgen. und ich bin eingeladen. theoretisch',
            'die party is morgen. und die übernachtungsparty. und ich bin eingeladen. theoretisch',
          ),
          g(
            'soll ich hin?? nach ALLEM??',
            'du bist doch bei der party oder?? soll ich hin?? nach ALLEM??',
          ),
        ],
        choices: [
          {
            text: g('GEH. natürlich', 'GEH. ich bin beim kuchen dabei'),
            label: 'Geh hin!',
          },
          { text: 'nur wenn du willst', label: 'Wenn du willst' },
        ],
      },
      going: {
        lines: [
          'ok. ok ich geh hin',
          'ich bring eis mit. als friedensangebot',
          '',
        ],
        personalMessages: { 2: '~*betrete feindesgebiet*~ (irgendwie)' },
      },
      want: {
        lines: [
          'ich WILL ja',
          'glaub ich',
          'boah gefühle sind so verwirrend *seufz*',
          '',
        ],
        personalMessages: { 3: '~*verwirrt aber optimistisch*~' },
      },
    },
    day5: {
      survived: {
        lines: [
          '{name}',
          'ich hab überlebt',
          g(
            'die übernachtungsparty',
            'die übernachtungsparty. ihr jungs seid nach dem kuchen gegangen. GLÜCKSPILZE',
          ),
        ],
        choices: [
          { text: 'WIE WARS', label: 'Wie wars??' },
          { text: 'habt ihr euch gestritten??', label: 'Gestritten?' },
        ],
      },
      how: {
        lines: [
          'es war... okay??',
          'wir haben beide das GLEICHE eis mitgebracht',
          'stracciatella. wir beide. wir haben uns nur angestarrt',
        ],
        choices: [
          { text: 'LOL schon wieder zwillinge', label: 'Wieder Zwillinge' },
          { text: 'zwei doofe, ein gedanke!' },
        ],
      },
      fight: {
        lines: [
          'nein!! wir waren voll höflich',
          'ZU höflich',
          'wir haben so 40 mal „oh sorry“ gesagt',
        ],
        choices: [
          { text: 'das klingt so peinlich', label: 'So peinlich' },
          { text: 'höflich is n anfang!', label: 'Is n Anfang' },
        ],
      },
      laugh: {
        lines: [
          g(
            'dann hat sie gesagt „süßer schlafanzug“',
            'dann hat sie nach dir gefragt. sie findet dich „irgendwie witzig“',
          ),
          g(
            'und ich hab gesagt „du auch“',
            'und ich hab gesagt „is er auch. manchmal“',
          ),
          'und dann haben wir GELACHT. so richtig gelacht',
          'wir sind keine besten freundinnen. wir sind so... friedensvertrag-freundinnen',
        ],
        choices: [
          { text: 'ich bin stolz auf dich kayla', label: 'Stolz auf dich' },
          { text: 'also is der krieg vorbei?', label: 'Krieg vorbei?' },
        ],
      },
      proud: {
        lines: [
          'hör auf sonst muss ich heulen',
          'ok ich heul SCHON. drama-prinzessinnen-kram',
          g(
            'hier. gefühle. mach es nich komisch',
            'hier. herzchen. die sind für MICH. hab ich mir verdient',
          ),
          '',
        ],
        personalMessages: { 3: '~*frieden (irgendwie)*~ <3' },
      },
      over: {
        lines: [
          'der krieg is vorbei',
          'aber wenn sie meinen neuen haarschnitt nachmacht gehts WIEDER LOS',
          'spaß',
          '...größtenteils spaß',
          '',
        ],
        personalMessages: { 4: '~*friedensvertrag unterschrieben*~ (Y)' },
      },
    },
    nowPlaying2: {
      porridge: {
        lines: [
          '{name}',
          'PLEASANT porridge?? „angenehmer haferbrei“??',
          'in meinem leben is grad gar nix angenehm und du spielst n lied über FRÜHSTÜCK',
        ],
        choices: [
          { text: 'soll ich was anderes anmachen?', label: 'Was anderes?' },
          {
            text: 'vllt brauchst du einfach n haferbrei',
            label: 'Iss Haferbrei',
          },
        ],
      },
      keep: {
        lines: ['nein. lass laufen', 'is eigentlich irgendwie beruhigend', ''],
        personalMessages: { 2: '~*finde meinen inneren haferbrei*~' },
      },
      eat: {
        lines: [
          'omg du hast recht. ich hab nix gegessen seit brianna das gesagt hat',
          'bg mach mir haferflocken',
          '',
        ],
        personalMessages: { 2: 'bg. emotionale haferflocken' },
      },
    },
    gameScore: {
      stress: {
        lines: [
          'du hast minen gespielt??',
          'minen is SO stressig ich kann nich mehr',
          '{score} sekunden purer STRESS',
          'jedes mal wenn ich klicke hab ich das gefühl der ganze computer verurteilt mich',
        ],
        choices: [
          {
            text: 'das sind doch nur zahlen. is entspannend',
            label: 'Is entspannend',
          },
          {
            text: 'ich hätt ehrlich gesagt fast nen herzinfarkt gekriegt',
            label: 'Ich auch',
          },
        ],
      },
      relax: {
        lines: ['ENTSPANNEND???', 'wer BIST du', ''],
        personalMessages: {
          2: 'manche finden minen ENTSPANNEND. gruselig.',
        },
      },
      same: {
        lines: [
          'DANKE',
          'das is wie n winziges bomben-drama in ner schachtel',
          'ich spiel das nur wenn ich eh schon traurig bin',
        ],
      },
    },
    // Top 8 drama (P0-03).
    'top8-dropped': {
      noticed: {
        lines: [
          'so.',
          'ich war gestern abend auf deinem friendspace',
          'und ich bin nich mehr in deiner top 8??',
          'also. wow. ok {name}',
        ],
        choices: [
          { text: 'das war ein versehen ehrlich', label: 'War ein Versehen' },
          {
            text: 'ich hab nur bisschen was umgestellt',
            label: 'Nur umgestellt',
          },
        ],
      },
      accident: {
        lines: [
          'ein VERSEHEN',
          'deine maus is einfach ausgerutscht und hat mich gelöscht. klar.',
          '',
        ],
        personalMessages: { 2: '~*anscheinend ersetzbar*~' },
      },
      changing: {
        lines: [
          'bisschen was umstellen = MICH rausschmeißen',
          'gemerkt. *seufz*',
          '',
        ],
        personalMessages: { 2: '~*anscheinend ersetzbar*~' },
      },
    },
    'top8-readded': {
      back: {
        lines: [
          'omg ich bin wieder in deiner top 8!!!',
          'ok dir is verziehen. dieses mal',
          g('<3', '(Y)'),
          '',
        ],
        personalMessages: { 3: '~*wieder da wo ich hingehöre*~ <3' },
      },
    },
    // Days 6–10 and the girl-only threads (W1-01): placeholders until W3.
    ...placeholderScripts(kaylaWeek2Scripts),
    ...kaylaGirlThreads,
  },
};
