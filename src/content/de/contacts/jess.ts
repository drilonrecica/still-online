// German text for jess (docs/localization-de.md → "Jess: loud, ALL CAPS, nudges"). Same ids,
// same line and choice counts as `src/content/contacts/jess*.ts`; '' = a line without text.
import type { ContactOverlay } from '../../types';

export const jess: ContactOverlay = {
  personalMessage: 'OMG noch 3 TAGE!!!1 (L)',
  awayReply: 'DU BIST WEG?? menno. ok dann bin ich AUCH ma kurz weg. bg',
  days: {
    2: { personalMessage: 'SCHILD-NOTFALL!!! ÜBERALL GLITZER' },
    3: { personalMessage: 'NIX ZUM ANZIEHEN. NIX!!!! :(' },
    4: { personalMessage: 'NUR NOCH 1 MAL SCHLAFEN!!!!! (L) (L)' },
    5: { personalMessage: 'ERSTE REIHE!!!!! da musste man dabei sein (L)' },
  },
  scripts: {
    opening: {
      hi: {
        lines: ['{name}!!!!!', 'omg omg omg', 'rate ma was'],
        choices: [
          { text: 'was?? sag schon!!', label: 'Was??' },
          {
            text: 'lass mich raten... du hast nen hamster',
            label: 'Ein Hamster?',
          },
        ],
      },
      hamster: {
        lines: [
          'NEIN lol wie kommst du DA drauf :P',
          'hier haste trotzdem nen hamster',
          'ok es is VIEL besser als ein hamster',
        ],
        choices: [
          { text: 'ok jetzt sag schon!!', label: 'Sag schon' },
          {
            text: 'du hast das radio-gewinnspiel gewonnen??',
            label: 'Gewinnspiel?',
          },
        ],
      },
      contest: {
        lines: [
          'WOHER WEISST DU DAS',
          'du bist hellseherisch. voll gruselig. ich liebs',
          '2 KARTEN für die Tinfoil Comets!!!',
        ],
        choices: [
          { text: 'OMG!!!' },
          { text: 'ich bin grad SO neidisch', label: 'Neidisch' },
        ],
      },
      guess: {
        lines: [
          'ich hab das RADIO-GEWINNSPIEL gewonnen!!!',
          '2 KARTEN für die Tinfoil Comets!!! :D',
        ],
        choices: [{ text: 'NEEEIN. ECHT JETZT??' }, { text: 'wer?' }],
      },
      who: {
        lines: [
          'WER??? die tinfoil comets!!! die beste band ALLER ZEITEN',
          'wir ham ihre cd auf meinem geburtstag so 40 mal gehört',
        ],
        choices: [
          { text: 'ach ja, die cd mit dem roboter drauf', label: 'Ach ja!' },
          { text: 'lol spaß, ich weiß wer die sind', label: 'Spaß lol' },
        ],
      },
      invite: {
        lines: ['sooooo...', 'willste mitkommen?? :D is nächsten freitag'],
        choices: [
          { text: 'JA na klar', label: 'JA' },
          {
            text: 'ich muss erst meine mama fragen',
            label: 'Erst Mama fragen',
          },
        ],
      },
      yes: {
        lines: ['AAAAAHHHHH', 'beste nacht UNSERES LEBENS (L) hdgdl', ''],
        personalMessages: { 2: 'TINFOIL COMETS MIT {name}!!!!' },
      },
      mom: {
        lines: [
          'menno ok aber sag ihr das is pädagogisch wertvoll lol',
          'frag JETZT. ich wart. bg',
          '',
          '',
        ],
      },
    },
    bored: {
      bored: {
        lines: ['{name} mir is sooooo langweilig', 'unterhalte mich!!!'],
        choices: [
          {
            text: 'warum musste die cd zum arzt? sie hatte nen sprung',
            label: 'Witz erzählen',
          },
          { text: 'mach ma deine hausis lol', label: 'Hausaufgaben' },
        ],
      },
      joke: {
        lines: [
          'LOL das is der SCHLECHTESTE witz der welt',
          'den erzähl ich morgen ALLEN',
        ],
      },
      hw: { lines: ['hausaufgaben sind was für SCHWÄCHLINGE :P'] },
    },
    nowPlaying: {
      loud: { lines: ['omg du hörst {artist}??', 'MACH LAUTER!!! :D'] },
    },
    nudged: {
      war: { lines: ['NUDGE-KRIEG!!!'] },
    },
    followup1: {
      back: {
        lines: [
          'BIN WIEDER DA',
          'ok SEHR wichtige frage',
          'is deine mama ok mit freitag?? so OFFIZIELL offiziell??',
        ],
        choices: [
          { text: 'jap sie findet das total ok!!', label: 'Jap, alles gut!' },
          {
            text: 'sie „denkt noch drüber nach“',
            label: 'Denkt noch nach...',
          },
          {
            text: 'ähm ich hab irgendwie noch nich gefragt',
            label: 'Noch nich gefragt',
          },
        ],
      },
      official: {
        lines: [
          'JAAAAAAAA',
          'ok meine mama fährt uns hin',
          'sie hat VERSPROCHEN dass sie im auto nich singt',
          '(sie wird im auto singen)',
        ],
        choices: [
          { text: 'lol wir armen' },
          {
            text: 'ich bring ohrstöpsel für die fahrt mit :P',
            label: 'Ohrstöpsel',
          },
        ],
      },
      bribe: {
        lines: [
          'menno mamas LIEBEN es drüber nachzudenken',
          'ok plan B. wir bestechen sie',
          'ich kann meine berühmten muffins backen. berühmt bei meinem hund aber trotzdem',
        ],
        choices: [
          { text: 'lol ok dann muffins', label: 'Dann Muffins' },
          {
            text: 'ich sag ihr das is ne einmalige chance',
            label: 'Einmalige Chance',
          },
        ],
      },
      notyet: {
        lines: [
          'WAS',
          '{name} das is in ner WOCHE',
          'frag sie direkt danach. versprich es mir',
        ],
        choices: [
          { text: 'ok ok ich versprechs!!', label: 'Versprochen' },
          { text: 'großes ehrenwort (Y)', label: 'Großes Ehrenwort' },
        ],
      },
      sign: {
        lines: [
          'ok EGAL',
          'ich mach uns ein SCHILD fürs konzert!!',
          'überall GLITZER. meine katze glitzert jetzt',
          'was soll draufstehen?? :D',
        ],
        choices: [
          { text: 'ZIGGY HEIRATE MICH', label: 'Ziggy heirate mich' },
          {
            text: 'WIR SIND 3 STD HERGEFAHREN (sind wir nich)',
            label: '3 Std hergefahren',
          },
          {
            text: 'mal einfach nen riesigen roboter drauf',
            label: 'Riesiger Roboter',
          },
        ],
      },
      marry: {
        lines: [
          'LOL ziggy is so 28 das is ALT',
          'aber er macht das ding wo er den drumstick dreht also... lohnt sich',
          'ich schreibs in rosa. GROSS in rosa',
          '',
        ],
        personalMessages: { 3: 'ZIGGY HEIRATE MICH (L) (L) (L)' },
      },
      drove: {
        lines: [
          'HAHAHAHA',
          'das wird NIEMAND je erfahren',
          'du bist GENIAL {name}',
          '',
        ],
        personalMessages: {
          3: 'wir sind 3 std hergefahren (sind wir nich) :P',
        },
      },
      robot: {
        lines: [
          'OMG JA wie auf ihrem cd-cover!!',
          'ok ich kann aber keine roboter malen',
          'der wird aussehen wie ein toaster. ein toaster mit gefühlen',
          '',
        ],
        personalMessages: { 3: 'bastel n schild!!! wird vllt n toaster' },
      },
    },
    followup2: {
      panic: {
        lines: [
          '{name}',
          '{name} {name} {name}',
          'ich find die karten nich',
          'ICH FIND DIE KARTEN NICH',
        ],
        choices: [
          {
            text: 'WAS. wo hattest du sie zuletzt??',
            label: 'Wo waren sie?',
          },
          {
            text: 'haste in deinen hosentaschen geguckt',
            label: 'Hosentaschen!',
          },
          { text: 'lol das is n witz oder', label: 'Witz, oder?' },
        ],
      },
      notjoke: {
        lines: [
          'DAS IS KEIN WITZ',
          'das is ALARMSTUFE ROT',
          'hilf mir nachdenken!!!',
        ],
        choices: [
          { text: 'ok wo waren sie zuletzt' },
          { text: 'guck in deine hosentaschen' },
        ],
      },
      desk: {
        lines: [
          'AUF MEINEM SCHREIBTISCH. neben meinem lipgloss',
          'und jetzt sind sie WEG',
          'mein kleiner bruder war vorhin in meinem zimmer. VERDÄCHTIG',
        ],
        choices: [
          { text: 'geh ihn verhören!!', label: 'Verhör ihn' },
          {
            text: 'jess. guck. in. deine. hosentaschen.',
            label: 'Hosentaschen!',
          },
        ],
      },
      brother: {
        lines: [
          'oh und wie ich GEH. bg',
          '',
          'HAB SIE',
          'er hat sie als LESEZEICHEN benutzt. in seinem dinobuch',
          'ich hab gesagt wenn er sie nochma anfasst erzähl ich allen von seinem nachtlicht',
        ],
        choices: [{ text: 'LOL knallhart' }, { text: 'der arme kleine lol' }],
      },
      pocket: {
        lines: [
          '...',
          'moment',
          'OMG',
          'die warn in meiner jeans. IN DER WASCHMASCHINE',
          'die sind jetzt n bisschen knusprig aber man kann sie noch lesen!!!',
        ],
        choices: [
          { text: 'knusprige karten lol', label: 'Knusprige Karten' },
          {
            text: 'jess wie lebst du überhaupt noch',
            label: 'Wie lebst du noch',
          },
        ],
      },
      found: {
        lines: [
          'ok neue regel',
          'meine mama behält die karten bis freitag',
          'mir kann man keine schönen sachen anvertrauen :P',
          'hdgdl bye!!! (L)',
          '',
        ],
        personalMessages: { 4: 'karten: SICHER. ich: ein wrack :P' },
      },
    },
    day2: {
      sign: {
        lines: [
          '{name}!!!!',
          'SCHILD-NOTFALL',
          'ich habs falsch geschrieben. MIT GLITZERKLEBER',
          'da steht TINFOIL COMTES',
        ],
        choices: [
          {
            text: 'mach einfach n winziges E oben drüber',
            label: 'Winziges E',
          },
          {
            text: 'comtes is aber irgendwie n cooles wort',
            label: 'Lass es so',
          },
          {
            text: 'nochmal von vorn?? is doch noch zeit',
            label: 'Von vorn',
          },
        ],
      },
      fix: {
        lines: [
          'n WINZIGES E. du bist genial',
          'ok es schwebt jetzt so drüber wie n kleiner hut',
          'egal. es is SÜSS',
        ],
        choices: [
          { text: 'das gibt dem schild charakter' },
          { text: 'das merkt eh keiner' },
        ],
      },
      keep: {
        lines: [
          'LOL comtes',
          'das kann unser geheimwort sein',
          'COMTES 4 LIFE',
        ],
        choices: [
          { text: 'COMTES 4 LIFE' },
          { text: 'was heißt das überhaupt', label: 'Was heißt das?' },
        ],
      },
      over: {
        lines: [
          'VON VORN??? der glitzer is ALLE {name}',
          'ich hab ALLES verbraucht. den rest hat meine katze',
        ],
        choices: [
          { text: 'ok ok lass es so lol' },
          {
            text: 'leih dir glitzer von der katze',
            label: 'Von der Katze leihen',
          },
        ],
      },
      cat: {
        lines: [
          'ok WARTE update',
          'meine katze is grad drübergelaufen',
          'jetzt is in der mitte n PFOTENABDRUCK',
          'ehrlich gesagt siehts besser aus',
          '',
        ],
        personalMessages: { 4: 'SCHILD-STATUS: hat n pfotenabdruck (L)' },
      },
    },
    day3: {
      help: {
        lines: [
          '{name} {name}',
          'ALARMSTUFE PINK',
          'ich hab NIX zum anziehen fürs konzert',
          'mein ganzer kleiderschrank is eine LÜGE',
        ],
        choices: [
          { text: 'dein tinfoil-comets-shirt!!', label: 'Band-Shirt' },
          { text: 'das glitzernde lila top!!', label: 'Glitzertop' },
          {
            text: 'zieh echtes tinfoil an. also alufolie lol',
            label: 'Echte Alufolie',
          },
        ],
      },
      shirt: {
        lines: [
          'das mit dem roboter??',
          'omg warte das is jetzt zu klein',
          'ich habs zu oft getragen. es is vor LIEBE eingelaufen',
        ],
        choices: [
          { text: 'zieh es trotzdem an' },
          { text: 'zieh n langarmshirt drunter', label: 'Drüberziehen' },
        ],
      },
      sparkly: {
        lines: ['OMG JA', 'mit der jeans mit den sternen auf der tasche??'],
        choices: [
          { text: 'JA die sternchenjeans', label: 'Sternchenjeans' },
          { text: 'und glitzer. logisch', label: 'Und Glitzer' },
        ],
      },
      tinfoil: {
        lines: [
          'LOL',
          '...',
          'warte',
          'WARTE. ARMBÄNDER aus alufolie',
          'DU BIST GENIAL',
        ],
        choices: [
          { text: 'ich weiß :P' },
          { text: 'das war n witz aber ok', label: 'War n Witz...' },
        ],
      },
      mirror: {
        lines: [
          'ok ich probiers an. bg',
          '',
          'ok ich seh MEGA aus',
          'mein bruder sagt ich seh aus wie ne discokugel',
          'das is n KOMPLIMENT',
          '',
        ],
        personalMessages: { 5: 'outfit: GELÖST. discokugel-modus (L)' },
      },
    },
    day4: {
      cant: {
        lines: [
          '{name}',
          'ich kann nich schlafen',
          'ich WEISS es is noch nich mal spät. ich kann TROTZDEM schon nich schlafen',
          'zeit für die checkliste. bereit??',
        ],
        choices: [
          { text: 'bereit!!' },
          { text: 'jess das wird schon. atmen', label: 'Atmen' },
        ],
      },
      breathe: {
        lines: [
          'ATMEN IS WAS FÜR SCHWÄCHLINGE',
          'ok gut. ein. aus. ein. aus',
          'ok DAS hat geholfen. checkliste',
        ],
        choices: [{ text: 'los' }, { text: 'checkliste!!' }],
      },
      list: {
        lines: [
          'karten: hat meine mama. SICHER (Y)',
          'schild: mit pfotenabdruck und allem. PERFEKT',
          'outfit: liegt auf meinem stuhl. starrt mich an',
          'einwegkamera: CHECK',
          'was vergess ich??',
        ],
        choices: [
          { text: 'ohrstöpsel!!' },
          {
            text: 'deine stimme. heb sie dir zum kreischen auf',
            label: 'Stimme schonen',
          },
        ],
      },
      earplugs: {
        lines: [
          'OHRSTÖPSEL?? wer braucht schon ohren',
          'ok gut meine mama hat die schon eingepackt',
          'sie hat auch n pulli eingepackt. das is n KONZERT mama',
        ],
        choices: [
          { text: 'lol mamas' },
          { text: 'der pulli kommt mit', label: 'Pulli kommt mit' },
        ],
      },
      voice: {
        lines: [
          'omg du hast recht',
          'ok ich red nich mehr',
          'tippen zählt nich',
        ],
        choices: [{ text: 'das zählt voll' }, { text: 'lol schlupfloch' }],
      },
      night: {
        lines: ['ok ich VERSUCH zu schlafen', 'gn8 {name}!!!! hdgdl (L)', ''],
        personalMessages: {
          2: 'schlafe (NICHT) NUR NOCH 1 MAL SCHLAFEN!!!',
        },
      },
    },
    day5: {
      recap: {
        lines: [
          '{name}!!!!!',
          'ERSTE REIHE',
          'ICH WAR IN DER ERSTEN REIHE',
          'nachdem wir uns verloren haben hat mich die menge einfach GESCHOBEN. ganz nach vorne',
        ],
        choices: [
          {
            text: 'ich hab dich gesehen!! du hast die ganze zeit gekreischt',
            label: 'Hab dich gesehen!!',
          },
          {
            text: 'ich hing am t-shirt-stand fest lol',
            label: 'Hing hinten fest',
          },
        ],
      },
      saw: {
        lines: [
          'HAB ICH. ich hab keine stimme mehr',
          'meine mama sagt das is ein segen',
          'aber du hast das ENDE verpasst. du warst nachos holen',
        ],
        choices: [
          { text: 'was war am ende??', label: 'Was war?' },
          { text: 'die nachos warns wert', label: 'Nachos halt' },
        ],
      },
      back: {
        lines: ['NEEEIN', 'dann hast du das beste verpasst'],
        choices: [
          { text: 'welches beste??', label: 'Welches Beste?' },
          {
            text: 'aber ich konnte dein schild sehen!!',
            label: 'Schild gesehen!',
          },
        ],
      },
      best: {
        lines: [
          'ziggy hat den drumstick gedreht',
          'UND DANN HAT ER IHN GEWORFEN',
          'UND ICH HAB IHN GEFANGEN',
          'ok er is mir erst an die stirn geknallt. aber DANN hab ich ihn gefangen',
          'da musste man dabei sein. so RICHTIG dabei',
        ],
        choices: [
          { text: 'NEIN!! ECHT??!' },
          { text: 'is deine stirn ok??', label: 'Stirn ok?' },
        ],
      },
      keep: {
        lines: [
          'ECHT. der liegt unter meinem kopfkissen',
          'beste. nacht. ALLER ZEITEN. (L)',
          'danke dass du mitgekommen bist {name}. du bist SPITZE',
          '',
        ],
        personalMessages: {
          3: 'ich hab ZIGGYS DRUMSTICK gefangen!!!!! (mit dem gesicht)',
        },
      },
      bump: {
        lines: [
          'da is jetzt ne kleine beule',
          'ich nenn sie mein souvenir',
          'danke dass du mitgekommen bist {name}. HDGDL (L)',
          '',
        ],
        personalMessages: {
          3: 'ich hab ZIGGYS DRUMSTICK gefangen!!!!! (mit dem gesicht)',
        },
      },
    },
    nowPlaying2: {
      surf: {
        lines: [
          'WARTE',
          'IS DAS SURF SHIMMY?!?!',
          'ich TANZE. in meinem ZIMMER. meine mama starrt mich einfach an',
          'du musst auch tanzen das is GESETZ',
        ],
        choices: [
          { text: 'ich tanze!! (ich tanze nich)', label: 'Ich tanze!' },
          { text: 'ich tanze NICHT', label: 'Ich tanz nich' },
        ],
      },
      dance: {
        lines: [
          'TANZPARTY!!!!',
          'ok ich hab meine lampe umgeschmissen. HAT SICH GELOHNT',
          '',
        ],
        personalMessages: { 2: 'SURF SHIMMY 4EVER!!! ~~~ :D' },
      },
      nodance: {
        lines: [
          'doch auf übernachtungspartys schon',
          'das ding mit der haarbürste als mikro. ich hab ZEUGEN',
          'TANZ!!!',
        ],
      },
    },
    gameScore: {
      omg: {
        lines: [
          'WARTE',
          'OMG {score}?? mein rekord is so 400 lol',
          'ich schieß immer aus versehen auf die vogelscheuche. die STEHT da einfach',
          'hast du das goldene huhn erwischt?!?!',
        ],
        choices: [
          { text: 'JA das war so schnell', label: 'Ja!' },
          { text: 'was is n goldenes huhn', label: 'Goldenes Huhn?' },
        ],
      },
      golden: {
        lines: [
          'NEIN!!! ich hab das NOCH NIE erwischt',
          'du bist so n hühner-ninja',
          '',
        ],
        personalMessages: { 2: '{name} is ein HÜHNER-NINJA!!! >:D' },
      },
      what: {
        lines: [
          'das is GOLDEN. und das macht ZOOM',
          '100 punkte!!! halt nächstes ma die augen offen',
          'PENG PENG PENG',
        ],
      },
    },
  },
};
