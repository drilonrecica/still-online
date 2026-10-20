// German text for Marco's and Dex's boy-only threads (G2-03; `src/content/contacts/marco-boy.ts`,
// `dex-boy.ts`). Same ids, same line and choice counts; '' = a line without text. One side only.
// The week-two threads (W1-03: Marco's LAN rematch and load-in crew, Dex's Jam course) live with
// each friend's week two (`marco-week2.ts`, `dex-week2.ts`).
import type { ContactOverlay } from '../../types';
import { dexBoyWeek2 } from './dex-week2';
import { marcoBoyWeek2 } from './marco-week2';

export const marcoBoyThreads: ContactOverlay['scripts'] = {
  lanParty: {
    lan: {
      lines: [
        'zwerg. frage',
        'lan-party bei mir, freitagabend. galaxy raiders 3. mein mitbewohner hat nen router und 4 pcs',
        'bring dein eigenes kabel mit. und chips. vor allem chips',
        'hab deine mutter gefragt. geht klar, wenn ich dich bis 10 heimfahre',
      ],
      choices: [
        { text: 'alter ja. bin dabei', label: 'Bin dabei' },
        { text: 'kann ich in dein team?', label: 'Dein Team?' },
      ],
    },
    in: {
      lines: [
        'gut. du bist für chips und kabel zuständig',
        'das blaue kabel. nicht das telefonkabel. letztes mal hat einer ein telefonkabel mitgebracht',
        '',
      ],
      personalMessages: { 2: 'lan fr. chips mitbringen. vor allem chips' },
    },
    team: {
      lines: [
        'nein. ich spiel mit meinem mitbewohner. wir haben ein system',
        'du spielst mit derek. der brüllt, ist aber gut in level 7',
        'sag ihm nicht, dass ich gesagt hab, er ist gut',
      ],
    },
  },
  cheatTrade: {
    trade: {
      lines: [
        'zwerg. tauschgeschäft',
        'ich hab einen für thunder kart. auf lava loop um den vulkan durchdriften. orange funken = großer boost',
        'funktioniert. habs an meinem mitbewohner getestet. er hats persönlich genommen',
        'du bist dran. was hast du',
      ],
      choices: [
        {
          text: 'riesenkopf-modus in galaxy raiders 3. BIGBRAIN eintippen',
          label: 'Riesenkopf-Modus',
        },
        {
          text: 'regenbogen-kart. beim ladebildschirm select halten',
          label: 'Regenbogen-Kart',
        },
      ],
    },
    bigbrain: {
      lines: [
        'zwerg',
        'den hab ich dir gegeben. steht in deiner cheat-datei. hab ich aus nem forum',
        'trotzdem der beste. deal',
        'mehr auf cheatcave.example. ignorier den typen, der sagt, galaxy raiders 4 kommt',
      ],
    },
    rainbow: {
      lines: [
        'probiert. gab ein normales kart und einen langen ladebildschirm',
        'vielleicht ist dein select-knopf besser als meiner',
        'die echten stehen auf cheatcave.example. im forum. die hälfte funktioniert',
        '',
      ],
      personalMessages: { 3: 'thunder kart. orange funken. vertrau mir' },
    },
  },
  roadie: {
    ask: {
      lines: [
        'zwerg. jobangebot',
        'velvet lantern braucht nen roadie. aufbau vor der show',
        'du trägst den verstärker die treppe runter in den bean cellar. derek trägt den eimer. das ist sein ganzer job',
        'bezahlung: ein crew-shirt. und ne limo',
      ],
      choices: [
        { text: 'ein CREW-shirt? alter, bin dabei', label: 'Bin dabei' },
        { text: 'wie schwer ist der verstärker', label: 'Wie schwer?' },
      ],
    },
    amp: {
      lines: [
        'schwer. aus den 80ern. damals hat man alles schwer gebaut',
        'mein mitbewohner nimmt das andere ende. du trägst das kabel und guckst stark',
        'deine mutter sagt: aufbau ja, show nein. nächstes mal. sorry zwerg',
      ],
    },
    crew: {
      lines: [
        'derek hat die shirts mit filzstift gemacht',
        'vorne CREW. hinten VELVET LANTRN. ihm ist das shirt ausgegangen',
        'deine mutter sagt: aufbau ja, show nein. nächstes mal. sorry zwerg',
        '',
      ],
      personalMessages: { 3: 'suchen roadies. bezahlung: 1 shirt' },
    },
  },
  ...marcoBoyWeek2,
};

export const dexBoyThreads: ContactOverlay['scripts'] = {
  skateSession: {
    curb: {
      lines: [
        '{name}',
        'willst du morgen nach der schule skaten kommen',
        'der bordstein an der tanke. kev sagt, das is der beste bordstein der stadt',
        'bring den helm mit, den deine mutter gekauft hat. oder sags ihr nich',
      ],
      choices: [
        { text: 'fett. bin da', label: 'Fett' },
        { text: 'alter, auf dem helm is n drache', label: 'Der Drachenhelm' },
      ],
    },
    there: {
      lines: [
        'cool',
        'kev will dir bestimmt den 50-50 beibringen. lass ihn nich. erst ollie',
        '',
      ],
      personalMessages: { 2: 'bordstein an der tanke. nach der schule. helm' },
    },
    dragon: {
      lines: [
        'lol',
        'drachen sind hart. über nen drachen lacht keiner',
        'ok kev lacht. kev lacht über alles',
      ],
    },
  },
  wrestling: {
    show: {
      lines: [
        '{name}',
        'wrestling bei mir im garten. mein bruder hat seine alte matratze auf den rasen gelegt',
        'du brauchst nen wrestling-namen',
      ],
      choices: [
        { text: 'DER MODEM-MÄHDRESCHER', label: 'Der Modem-Mähdrescher' },
        {
          text: 'ich hab schon ne einlauf-rede geschrieben',
          label: 'Ich hab ne Rede',
        },
      ],
    },
    mauler: {
      lines: [
        'DER MODEM-MÄHDRESCHER? lol. ok du bist dabei',
        'ich bin „das kickflip-kid“. kev sagt, das is lahm. kev heißt einfach „kev“',
        'regeln: nur auf der matratze. keine stühle. meine mutter hat zweimal gesagt keine stühle',
        '',
      ],
      personalMessages: { 3: 'garten-wrestling. nur matratze. keine stühle' },
    },
    speech: {
      lines: ['du hast eine GESCHRIEBEN', 'was is dein finisher'],
      choices: [
        {
          text: 'der EINWAHL-ABSTURZ. du hörst piep krrrsch und bist OFFLINE',
          label: 'Der Einwahl-Absturz',
        },
        { text: 'geheim. erfährst du im ring', label: 'Geheim' },
      ],
    },
    drop: {
      lines: [
        '...',
        'das is das beste, was ich je gehört hab',
        'ok du bist dabei. nur auf der matratze. keine stühle. meine mutter hat zweimal gesagt keine stühle',
      ],
    },
    secret: {
      lines: [
        'respekt',
        'ok du bist dabei. nur auf der matratze. keine stühle. meine mutter hat zweimal gesagt keine stühle',
      ],
    },
  },
  videoNight: {
    night: {
      lines: [
        '{name}',
        'videoabend bei mir. meine mutter hat pizza bestellt',
        'wir gucken die 30 sek am fernseher. in dauerschleife. sam und kev kommen auch',
        'die internet-version is auf kickflipkings.example/video, aber die lädt ewig. fernseher is besser',
      ],
      choices: [
        {
          text: 'pizza und das verschwommene video. alter, bin da',
          label: 'Bin da',
        },
        { text: 'wie oft gucken wir das', label: 'Wie oft?' },
      ],
    },
    there: {
      lines: [
        'cool. sekunde 22 is das beste. du wirst es hören',
        'mein bruder macht die fernbedienung. er hält beim orange an',
        '',
      ],
      personalMessages: { 2: 'videoabend. pizza. 30 sek in dauerschleife' },
    },
    times: {
      lines: [
        'kev sagt 50',
        'ich sag, bis die kassette aufgibt. hat sie schon mal. kann sie wieder',
        'ok bis gleich. is ne große pizza',
      ],
    },
  },
  ...dexBoyWeek2,
};
