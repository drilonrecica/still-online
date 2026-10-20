// German celebgossip07.example, days 6–10 (`src/content/sites/celebgossip07-week2`): two posts and
// one TOP-oder-FLOP poll a day in Roxi's gossip-magazine voice („Exklusiv!“, „Wahnsinn!“, „!!!“).
// Die Pony-Saison echoes Kayla and Brianna (day 7), Lakeview Festwiese sells out in 9 Minuten (day 8,
// Jess's grief) and blows Buzz's Alu-Hut away on show night (day 10, the same night as the Juz).
// Same ids, days, tags, photos and comment counts; Brenda the cow is „Berta“, as on day 2.
import type { BlogPost, Poll } from '../../sites/types';

export const GOSSIP_POSTS_WEEK2: readonly BlogPost[] = [
  {
    id: 'bff-bracelets',
    day: 6,
    title:
      'Starla + Dakota tauschen FREUNDSCHAFTSARMBÄNDER. auf dem roten Teppich',
    body: 'wisst ihr noch, wie sie im gleichen kleid kamen und wir alle dachten, das is KRIEG??? tja, jetzt haben Starla Vance und Dakota Sky passende freundschaftsarmbänder. jede ein halbes herz. auf Starlas steht „BESTE FREU“ und auf Dakotas „NDINNEN“.\n\nsie haben sie auf der premierenparty von Maple Bay vorgeführt und für die kameras so 5 minuten lang aneinandergehalten. ein fotograf sagt, ihm is der arm eingeschlafen. ich war noch nie gleichzeitig so verwirrt und so glücklich',
    tags: ['starla vance', 'dakota sky', 'fashion', 'spotted'],
    photo: {
      scene: 'party',
      seed: 9107,
      caption: 'BESTE FREU + NDINNEN (sie mussten SEHR nah beieinander stehen)',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'ok man KANN also vom zoff zu bffs werden. notiert. ich sag nich, an wen ich grad denke *seufz*',
      },
      { user: 'maplebay_mel', text: 'ich will die dakota-hälfte' },
      { user: 'hater_patrol', text: 'NDINNEN klingt wie ne krankheit' },
    ],
  },
  {
    id: 'rex-trailer-trip',
    day: 6,
    title:
      'Trailer zu Exploding Point 3: Rex Hammerton STOLPERT. und sie habens drin gelassen',
    body: 'der erste trailer zu Exploding Point 3: Detonation Day is draußen und fans mit adleraugen haben bei 1:12 was entdeckt. Rex läuft von ner explosion weg (cool) und stolpert über nen gartenschlauch (nich cool). er fällt nich hin. er macht nen kleinen hüpfer.\n\ndas studio sagt, der hüpfer „gehört zur rolle“. Rex sagt „das gibt nen krater“. schon wieder. es gibt keinen krater. ich habs mir 40 mal angeguckt, mit modem. hat die ganze nacht gedauert',
    tags: ['rex hammerton', 'movies', 'ouch'],
    comments: [
      {
        user: 'dex',
        text: 'der hüpfer is gut gerettet. wieder respekt',
      },
      {
        user: 'action_jackson',
        text: 'der hüpfer is das beste dran. EP3 für den oscar',
      },
      {
        user: 'langeweile_in_mathe',
        text: 'was hat der mann eigentlich mit dem boden',
      },
    ],
  },
  {
    id: 'bangs-season',
    day: 7,
    title:
      'PONY-SAISON: Starla UND Dakota lassen sich nen Pony schneiden. am GLEICHEN TAG',
    body: 'es is offiziell. es is pony-saison. Starla Vance kam morgens mit nem nagelneuen pony aus dem Haar-Himmel. am nachmittag hatte Dakota Sky AUCH einen. gleiche länge. gleich schräg zur seite.\n\nkeiner weiß, wer von wem abgeguckt hat. Starla sagt „große geister“. Dakota sagt „der termin war seit wochen gebucht“. eine quelle (mein cousin, immer noch im einkaufszentrum) sagt, die friseurin „will einfach nur nach hause“. wenn eure beste freundin morgen mit pony auftaucht, wisst ihr jetzt warum',
    tags: ['starla vance', 'dakota sky', 'hair', 'feud'],
    photo: {
      scene: 'party',
      seed: 9108,
      caption: 'pony links. pony rechts. pony ÜBERALL',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'ICH HATTE IHN ZUERST. nich starla. nich dakota. ICH. und jetzt hat JEMAND an meiner schule auch einen und tritt bei der wahl gegen mich an. das is mein leben',
      },
      {
        user: '~*starla_stan*~',
        text: 'starla hatte ihn zuerst. das war um 9 uhr morgens',
      },
      {
        user: 'maplebay_mel',
        text: 'dakota hat LETZTE WOCHE gebucht. ich hab es gesehen',
      },
      { user: '~*Kayla*~ <3', text: 'maplebay_mel du hilfst IMMER NOCH nich' },
    ],
  },
  {
    id: 'bianca-buys-brenda',
    day: 7,
    title: 'Bianca Goldcrest KAUFT Berta die Kuh. Berta zieht ins Hotel',
    body: 'die staffel von Silver Spoon Ranch is vorbei und Bianca Goldcrest konnte sich nich verabschieden. also hat sie Berta die kuh GEKAUFT. Berta wohnt jetzt im garten vom Goldcrest Grand Hotel, neben dem springbrunnen.\n\ndas hotel sagt, Berta is „ein gast wie jeder andere“. sie hat nen zimmerschlüssel am halsband. sie benutzt ihn nich. Duchess, der chihuahua, redet seitdem nich mehr mit Bianca',
    tags: ['bianca goldcrest', 'reality tv', 'animals'],
    comments: [
      {
        user: 'pia (L) ponys (L)',
        text: 'GUT. berta hat ein hotel verdient. ich frag mama HEUTE ABEND nach nem hamster und bianca kriegt ne GANZE KUH',
      },
      {
        user: 'stallbursche_rick',
        text: 'endlich behandelt mal jemand berta anständig',
      },
      {
        user: 'duchess_fanclub',
        text: 'duchess war zuerst da. GERECHTIGKEIT FÜR DUCHESS',
      },
    ],
  },
  {
    id: 'lakeview-sold-out',
    day: 8,
    title: 'Tinfoil Comets: Lakeview Festwiese in 9 MINUTEN AUSVERKAUFT',
    body: 'sie habens schon wieder geschafft. die karten für die Tinfoil Comets auf der Lakeview Festwiese gingen heute morgen in den verkauf und waren nach 9 minuten WEG. das sind 2 minuten schneller als bei der Riverside Arena.\n\nbei TicketTown war die leitung noch ne stunde danach besetzt. leute haben immer noch angerufen, um zu fragen, ob es wirklich ausverkauft is. es war wirklich ausverkauft. Buzz sagt, er bastelt sich nen hut für draußen. „wegen dem wind“',
    tags: ['tinfoil comets', 'concerts', 'omg'],
    comments: [
      {
        user: 'xX~JeSs~Xx :D',
        text: 'NEUN MINUTEN. ICH HING ALLE NEUN IN DER WARTESCHLEIFE. DIE WARTESCHLEIFENMUSIK WAR NICH MAL VON IHNEN',
      },
      {
        user: 'comet_fan_4ever',
        text: 'SCHON WIEDER keine karten. ich bin jetzt ein geist',
      },
      {
        user: 'marco | velvet lantern',
        text: 'gleicher abend: velvet lantern im jugendzentrum westfield. keine karten nötig. auch kein wind',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: '@marco WEISS ICH. ICH KOMME. ICH BASTEL EIN SCHILD',
      },
    ],
  },
  {
    id: 'duchess-recall',
    day: 8,
    title: 'Eau de Duchess ZURÜCKGERUFEN. es „riecht nach Hund“',
    body: 'es hat 3 tage gehalten. Eau de Duchess, das parfüm für 80 €, benannt nach dem chihuahua von Bianca Goldcrest, is aus allen läden geflogen. offizieller grund: „rückmeldungen von kunden“. echter grund: es riecht nach hund.\n\nnich nach nem hund nach nem wellness-tag. einfach nach hund. eine verkäuferin hat meinem cousin erzählt, die ganze parfümtheke hat danach gerochen wie ne zoohandlung. Duchess is angeblich „einverstanden“. sie hat schon wieder in ner handtasche geschlafen',
    tags: ['bianca goldcrest', 'animals', 'rumors'],
    comments: [
      {
        user: 'duchess_fanclub',
        text: 'ich hab 3 gekauft. ich behalte alle 3',
      },
      {
        user: 'pia (L) ponys (L)',
        text: 'nach hund riechen is GUT. keks riecht nach hund und er is der beste',
      },
      {
        user: 'hater_patrol',
        text: 'hab ich doch gesagt. tag 5. nachlesen',
      },
    ],
  },
  {
    id: 'kyle-hair-back',
    day: 9,
    title:
      '4Ever Boulevard bringen eine COMEBACK-Single raus und Kyles Strähnchen wachsen... nach???',
    body: 'zwei große news in einem beitrag, weil ich keine zwei beiträge darüber verkrafte. 4Ever Boulevard haben ne neue single namens „Grow Back To Me“ und im video hat Kyle (der stille) WIEDER STRÄHNCHEN. kleine. baby-strähnchen.\n\ngeht der song um haare??? die band sagt nein. im refrain heißt es „it was time / now its time again“ (also: „es war zeit / jetzt is wieder zeit“). KYLE. die fans weinen schon wieder in ihre westen, aber diesmal vor glück',
    tags: ['4ever boulevard', 'hair', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9109,
      caption: 'die baby-strähnchen (ranzoomen. RANZOOMEN)',
    },
    comments: [
      {
        user: 'boulevard_girl_99',
        text: 'ich WUSSTE, dass es richtig war, das poster zu behalten',
      },
      {
        user: 'popfan4life',
        text: 'braun war ok. strähnchen sind auch ok. ich hab alle lieb',
      },
      {
        user: 'boulevard_girl_99',
        text: '@popfan4life wir sind sowas von zurück',
      },
    ],
  },
  {
    id: 'best-bangs-tie',
    day: 9,
    title:
      'Teen-Wave-Umfrage: „bester Pony“ endet UNENTSCHIEDEN. Starla und Dakota TEILEN sich den Titel',
    body: 'die umfrage der zeitschrift Teen Wave zum „besten pony des jahres“ is heute zu ende gegangen und das ergebnis is UNENTSCHIEDEN. Starla Vance und Dakota Sky haben exakt gleich viele stimmen bekommen. die zeitschrift sagt, sie hat zweimal gezählt.\n\nsie teilen sich den pokal. das is ne goldene schere. sie sagen, jede behält sie „immer ne woche“. ich geb dem nen monat',
    tags: ['starla vance', 'dakota sky', 'hair', 'feud'],
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'UNENTSCHIEDEN?? wie zufällig is das denn. das würde im echten leben NIEMALS passieren. (is heute passiert. an meiner schule. ich kann nich drüber reden) *seufz*',
      },
      {
        user: 'maplebay_mel',
        text: 'dakota sollte sie 2 wochen kriegen. ihr pony war schräger',
      },
      { user: '~*starla_stan*~', text: 'nachzählen' },
    ],
  },
  {
    id: 'lakeview-hat',
    day: 10,
    title: 'LAKEVIEW: Der Alu-Hut von Buzz WEGGEWEHT. live im Radio',
    body: 'die Tinfoil Comets haben heute abend auf der Lakeview Festwiese gespielt und es war WINDIG. beim dritten song hat ne riesige böe Buzz Kowalczyk den alu-hut glatt vom kopf geweht, quer übers publikum. der typ im radio hat gesagt „und da fliegt der hut“. das publikum hat lauter geschrien als bei jedem song.\n\nBuzz hat den rest vom konzert zum ALLERERSTEN MAL OHNE HUT gespielt. Ziggy hat den wirbel trotzdem gemacht. wenn ihr auf nem feld bei Lakeview nen glänzenden hut findet: der is eine million euro wert. angeblich',
    tags: ['tinfoil comets', 'concerts', 'ziggy', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9110,
      caption: 'der hut, sekunden bevor er uns verlassen hat',
    },
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'habs im radio gehört. man hat gehört, wie der hut gegangen is',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'ICH WAR HEUTE ABEND AUF NER ANDEREN SHOW UND DIE WAR AUCH DER WAHNSINN. EIN BASSIST HAT MIR EIN PLEKTRUM ZUGEWORFEN. DIESMAL HAB ICHS MIT DER HAND GEFANGEN',
      },
      {
        user: 'marco | velvet lantern',
        text: 'es war ein plektrum. ich hab erst nein gesagt. wenn man erst nein sagt, zählt es nicht als werfen',
      },
      { user: 'spacegirl4eva', text: 'mit hut oder ohne. buzz is buzz' },
    ],
  },
  {
    id: 'rex-stunt-nap',
    day: 10,
    title:
      'Der „große Stunt“ von Rex Hammerton am Set von EP3 war... ein NICKERCHEN',
    body: 'das team von Exploding Point 3 hat den fans für heute „den größten stunt, den Rex je gemacht hat“ versprochen. die fans haben den ganzen nachmittag vorm set gewartet. der stunt: Rex legt sich auf ein autodach. das auto fährt nich. Rex schläft ein.\n\nsein sprecher sagt, das war „ein stunt der ausdauer“. der regisseur sagt, sie haben „die szene im kasten“. dem auto gehts gut. Rex is aufgewacht und hat gesagt „das gibt nen krater“. es gab ne kleine delle',
    tags: ['rex hammerton', 'movies', 'rumors'],
    comments: [
      {
        user: 'action_jackson',
        text: 'auf nem auto schlafen is SCHWERER als es aussieht',
      },
      { user: 'dex', text: 'hab ich auch mal gemacht. auf ner rampe. respekt' },
      {
        user: 'hater_patrol',
        text: 'ich mach auch nickerchen. wo is mein film (schon wieder)',
      },
    ],
  },
];

export const GOSSIP_POLLS_WEEK2: readonly Poll[] = [
  {
    id: 'bff-bracelets',
    day: 6,
    question: 'Freundschaftsarmbänder:',
    options: ['TOP', 'FLOP'],
  },
  {
    id: 'bangs',
    day: 7,
    question: 'Pony (die Frisur):',
    options: ['TOP', 'FLOP', 'hab ich auch'],
  },
  {
    id: 'lakeview',
    day: 8,
    question: 'Lakeview in 9 Minuten ausverkauft:',
    options: ['TOP', 'FLOP', 'hab keine karten'],
  },
  {
    id: 'kyle-hair-back',
    day: 9,
    question: 'Kyles Strähnchen wachsen nach:',
    options: ['TOP', 'FLOP'],
  },
  {
    id: 'buzz-hat-wind',
    day: 10,
    question: 'Der Hut von Buzz im Wind:',
    options: ['TOP', 'FLOP'],
  },
];
