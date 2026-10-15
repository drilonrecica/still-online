// German celebgossip07.example, same exports as `src/content/sites/celebgossip07`. Roxi blogs like
// a German gossip magazine run from a teenager's bedroom: „Exklusiv!", „Schock!", „Wahnsinn!",
// „du"/„ihr", lots of „!!!". Every celeb, band, show and commenter is invented, as in English.
import type { Celeb } from '../../sites/celebgossip07';
import type { BlogPost, Poll, SiteMeta } from '../../sites/types';

export const GOSSIP_HOST = 'celebgossip07.example';

export const SITE_META: SiteMeta = {
  title: 'Celeb Gossip 07 ★ OMG!!',
  description:
    'Der heißeste Promi-Klatsch, ca. 2x am Tag neu!!! Starla Vance, 4Ever Boulevard, Bianca Goldcrest, Rex Hammerton, Tinfoil Comets und MEHR. Stimm ab: TOP oder FLOP!!!',
  keywords: [
    'promi',
    'promis',
    'stars',
    'klatsch',
    'tratsch',
    'blog',
    'gerüchte',
    'top oder flop',
    'starla',
    'tinfoil comets',
  ],
  pages: {
    '/': {
      title: 'Celeb Gossip 07 ★ OMG!!',
      keywords: ['neueste', 'beiträge', 'umfrage'],
    },
    '/post': {
      title: 'Celeb Gossip 07 - Beitrag + Kommentare',
      keywords: ['beitrag', 'kommentare'],
    },
    '/tag': {
      title: 'Celeb Gossip 07 - Tags',
      keywords: ['tags', 'tag-wolke'],
    },
    '/celebs': {
      title: 'Celeb Gossip 07 - Wer ist wer',
      keywords: ['promis', 'stars', 'wer', 'berühmt'],
    },
  },
};

export const GOSSIP_TEXT = {
  title: 'Celeb Gossip 07',
  star: '★',
  omg: 'OMG!!',
  tagline: 'aller klatsch. null fakten. ca. 2x am tag neu!!!',
  owner: 'Roxi',
  about:
    'hi ich bin Roxi!!! ich schreib über promis weil mein leben langweilig is und ihrs NICHT. alles hier is 100% wahr* (*wahrscheinlich)',
  disclaimer:
    'Celeb Gossip 07 is ein fan-blog. gerüchte sind gerüchte. wenn du ein promi bist und sauer bist, schreib nen kommentar',
  footer:
    '(c) 2007 Celeb Gossip 07. nicht meine beiträge klauen, meinen STIL klauen',
  tagsHeading: 'TAGS',
  pollHeading: 'TOP oder FLOP?!',
  noPostYet: 'den beitrag gibts nich (noch nich??). Roxi is dran!!!',
  noTagPosts: 'noch keine beiträge mit dem tag. schau morgen wieder vorbei!!!',
  commentsClosed:
    'kommentare sind wegen spam geschlossen (danke auch, hater_patrol)',
  pollThanks: 'danke fürs abstimmen!!! morgen gibts ne neue umfrage',
  pollNag: 'erst eins auswählen!!!',
};

export const CELEBS: readonly Celeb[] = [
  {
    tag: 'starla vance',
    name: 'Starla Vance',
    famousFor: 'pop-prinzessin. „Sparkle Alarm“ war 9 wochen auf platz 1',
    status: 'auf tour + kauft haargummis',
    stars: 5,
    facts: [
      'ihr album Bubblegum Galaxy hat dreifach platin',
      'hat ein kaninchen namens Herr Flauschig',
      'sagt sie schreibt alle songs in der badewanne',
    ],
  },
  {
    tag: '4ever boulevard',
    name: '4Ever Boulevard',
    famousFor: 'boygroup. 5 jungs, 1 tanzschritt, gleiche westen',
    status: 'im studio (angeblich)',
    stars: 4,
    facts: [
      'mitglieder: Jayden, Tyler, Marcus, Brett und Kyle (der stille)',
      'ihr hit „Girl, U R My Homework“ handelt von hausaufgaben. wahrscheinlich',
      'sie haben die blondesten strähnchen im ganzen business',
    ],
  },
  {
    tag: 'bianca goldcrest',
    name: 'Bianca Goldcrest',
    famousFor: 'hotel-erbin aus der realityshow „Silver Spoon Ranch“',
    status: 'lernt gerade was ein stall is',
    stars: 3,
    facts: [
      'ihrer hotelfamilie gehören 40 hotels und jetzt 1 (ein) bauernhof',
      'ihr chihuahua Duchess hat nen eigenen bodyguard',
      'spruch: „das is SO nich ranch“',
    ],
  },
  {
    tag: 'rex hammerton',
    name: 'Rex Hammerton',
    famousFor: 'actionstar. Exploding Point 1, 2 und 3',
    status: 'dreht gerade Exploding Point 3: Detonation Day',
    stars: 4,
    facts: [
      'spruch: „das gibt nen krater“',
      'behauptet, er macht alle stunts selbst',
      'seine oberarme haben nen eigenen fanclub',
    ],
  },
  {
    tag: 'dakota sky',
    name: 'Dakota Sky',
    famousFor: 'star der teenie-serie „Maple Bay“',
    status: 'im zoff (oder ETWA NICHT)',
    stars: 4,
    facts: [
      'hat im staffelfinale von Maple Bay echte tränen geweint',
      'hat 200 paar flip-flops',
      'hat mal in ner cornflakes-werbung ne meerjungfrau gespielt',
    ],
  },
  {
    tag: 'tinfoil comets',
    name: 'Tinfoil Comets',
    famousFor: 'space-pop-band. Nova, Buzz, Mo und Ziggy',
    status: 'live in der Riverside Arena!!!',
    stars: 5,
    facts: [
      'Buzz trägt auf der bühne nen echten alu-hut',
      'Ziggy wirft bei jedem konzert nen drumstick in die menge',
      'auf ihrem album Hello, Robot is ein roboter namens Kevin drauf',
    ],
  },
];

export const GOSSIP_POSTS: readonly BlogPost[] = [
  {
    id: 'starla-scrunchies',
    day: 1,
    title: 'GESICHTET: Starla Vance kauft VIERZIG Haargummis?!',
    body: 'OMG!!! eine quelle (mein cousin, der im einkaufszentrum jobbt) sagt, Starla Vance war gestern bei Haar-Himmel und hat 40 haargummis gekauft. VIERZIG!!!\n\nis das ein comeback??? sind haargummis wieder in??? muss ich meine aus der badezimmerschublade kramen??? Starlas leute sagen, sie „mag die halt einfach“. klar, Starla. KLAR.',
    tags: ['starla vance', 'mode', 'gesichtet'],
    photo: {
      scene: 'party',
      seed: 9101,
      caption: 'unscharf aber das is GANZ SICHER sie',
    },
    comments: [
      {
        user: 'popfan4life',
        text: 'starla kann tragen was sie will sie is ne KÖNIGIN',
      },
      { user: 'hater_patrol', text: '40 sind zu viele für 1 kopf' },
      {
        user: '~*starla_stan*~',
        text: 'ich hab 41. wer is jetzt die trendsetterin',
      },
    ],
  },
  {
    id: 'tinfoil-sold-out',
    day: 1,
    title: 'Tinfoil Comets: Riverside Arena in 11 Minuten AUSVERKAUFT!!!',
    body: 'das konzert der Tinfoil Comets in der Riverside Arena is AUSVERKAUFT. die karten waren nach 11 minuten weg. ein radiosender hat die letzten 2 verlost und die gewinnerin hat wohl so laut geschrien, dass dem moderator die kopfhörer runtergefallen sind.\n\ndrummer Ziggy Voltz verspricht „den größten drumstick-wirbel meiner karriere“. Buzz sagt, er bastelt sich extra nen neuen alu-hut. „einen glänzenderen.“ wir bleiben dran!!!',
    tags: ['tinfoil comets', 'konzerte', 'ziggy'],
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'hab keine karten bekommen. mir gehts GUT. (mir gehts nich gut)',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'DAS WAR ICH IM RADIO!!!!! ICH HAB GEWONNEN!!! ERSTE REIHE ICH KOMME (L)',
      },
      { user: 'langeweile_in_mathe', text: 'was is ein tinfoil comet' },
      { user: 'comet_fan_4ever', text: '@langeweile_in_mathe raus hier' },
    ],
  },
  {
    id: 'kyle-tips',
    day: 2,
    title:
      'SCHOCK! Kyle von 4Ever Boulevard schneidet seine Strähnchen AB. Fans: „uns gehts nicht gut“',
    body: 'ein trauriger tag für alle strähnchen-fans. Kyle von 4Ever Boulevard (der stille) kam mit ganz normalen braunen haaren zur autogrammstunde. EINFACH BRAUN.\n\nfans haben in ihre passenden westen geweint. Kyle meinte „es war zeit“. zeit für WAS, Kyle. die band sagt, die neue single kommt trotzdem raus, aber mal ehrlich, wie soll man in so ner zeit an musik denken',
    tags: ['4ever boulevard', 'haare', 'omg'],
    photo: {
      scene: 'party',
      seed: 9102,
      caption: 'das letzte bekannte foto der strähnchen (ruhe in frieden)',
    },
    comments: [
      {
        user: 'boulevard_girl_99',
        text: 'ich hab ein poster von den strähnchen. was mach ich jetzt damit',
      },
      { user: 'popfan4life', text: 'braun is auch ne haarfarbe leute' },
      { user: 'boulevard_girl_99', text: '@popfan4life nich für KYLE' },
    ],
  },
  {
    id: 'bianca-cow',
    day: 2,
    title:
      'Bianca Goldcrest melkt auf der Silver Spoon Ranch eine Kuh. Die Kuh: „unbeeindruckt“',
    body: 'in der neuen folge Silver Spoon Ranch musste hotel-erbin Bianca Goldcrest eine kuh namens Berta melken. in weißen stiefeln. ihr könnt euch denken, wie das ausging.\n\nBianca: „das is SO nich ranch“. Berta: kein kommentar. Duchess, der chihuahua, hat von nem winzigen heuballen aus zugeguckt, mit nem winzigen cowboyhut. ehrlich, Duchess is der wahre star der sendung',
    tags: ['bianca goldcrest', 'reality-tv', 'tiere'],
    comments: [
      {
        user: 'pia (L) ponys (L)',
        text: 'kühe sind einfach große ponys mit flecken. sei NETT zu berta',
      },
      {
        user: 'stallbursche_rick',
        text: 'man zieht nach UNTEN nich zur seite. komm schon bianca',
      },
      { user: 'duchess_fanclub', text: 'DUCHESS FÜR BUNDESKANZLERIN' },
    ],
  },
  {
    id: 'rex-stunts',
    day: 3,
    title:
      'Rex Hammerton „macht seine Stunts selbst“ (er ist über einen Bordstein gestolpert)',
    body: 'actionheld Rex Hammerton war am set von Exploding Point 3: Detonation Day, als er auf dem weg zu seinem wohnwagen über nen bordstein gestolpert is. nen BORDSTEIN!!! der mann springt beruflich aus hubschraubern (im film).\n\nsein sprecher sagt, das war „eine geplante stuntprobe“. Rex is danach zum buffet gehumpelt und hat gesagt „das gibt nen krater“. es gab keinen krater. es gab ne kleine schramme',
    tags: ['rex hammerton', 'filme', 'autsch'],
    photo: {
      scene: 'trip',
      seed: 9103,
      caption: 'der bordstein, um den es geht',
    },
    comments: [
      { user: 'dex', text: 'bordsteine sind kein spaß. respekt' },
      {
        user: 'action_jackson',
        text: 'EP3 wird der beste teil. mit oder ohne schramme',
      },
      {
        user: 'hater_patrol',
        text: 'ich kann auch über nen bordstein fallen. wo is mein film',
      },
    ],
  },
  {
    id: 'starla-dakota-dress',
    day: 3,
    title: 'ZOFF-ALARM: Starla Vance + Dakota Sky im GLEICHEN KLEID',
    body: 'jetzt is es passiert. bei den Teen Wave Awards kamen pop-prinzessin Starla Vance und Maple-Bay-star Dakota Sky im EXAKT gleichen glitzernden lila kleid. gleiches kleid. gleiche schuhe. gleicher entsetzter blick.\n\nsie standen an entgegengesetzten enden vom roten teppich und haben sich KEIN EINZIGES MAL angeguckt. eine quelle sagt, Dakota „wusste es“ und hat es „mit absicht“ angezogen. Starlas leute sagen „kein kommentar“, und das heißt JA KOMMENTAR. leute, das is DER zoff des jahres',
    tags: ['starla vance', 'dakota sky', 'zoff', 'mode'],
    photo: {
      scene: 'party',
      seed: 9104,
      caption: 'finde den unterschied (geht nich)',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'das is grad EXAKT mein leben. mir is GENAU das gleiche mit nem hoodie passiert. halt durch starla *seufz*',
      },
      {
        user: '~*starla_stan*~',
        text: 'starla hatte es zuerst an. DAKOTA HAT ABGEGUCKT',
      },
      { user: 'maplebay_mel', text: 'dakota sieht aber BESSER drin aus' },
      { user: '~*Kayla*~ <3', text: 'maplebay_mel du hilfst grad nich' },
    ],
  },
  {
    id: 'buzz-hat',
    day: 4,
    title:
      'Tinfoil Comets HEUTE ABEND: Ist der Hut von Buzz für eine MILLION Euro versichert?',
    body: 'heute is es soweit!!! die Tinfoil Comets spielen in der ausverkauften Riverside Arena und die gerüchteküche KOCHT. quellen sagen, gitarrist Buzz Kowalczyk hat seinen neuen alu-hut für eine million euro versichert. der hut is aus alufolie. der hat so 2 € gekostet.\n\naußerdem hat Ziggy die ganze woche „seinen wurf geübt“ und die fans in der ersten reihe basteln schilder. wenn du hingehst: ohrstöpsel mitnehmen. und vielleicht nen helm',
    tags: ['tinfoil comets', 'konzerte', 'gerüchte'],
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'der hut is MIR mehr wert als ne million',
      },
      {
        user: 'marco | velvet lantern',
        text: 'hallenkonzerte sind ok. die echte musik passiert in kleinen räumen. velvet lantern. bean cellar. hingehen',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'ICH HAB EIN SCHILD UND ALU-ARMBÄNDER. ICH BIN BEREIT. ZIGGY ICH BIN BEREIT',
      },
    ],
  },
  {
    id: 'starla-dakota-bffs',
    day: 4,
    title: 'WAHNSINN: Starla + Dakota sind... beste Freundinnen???',
    body: 'stopp, alles anhalten. erinnert ihr euch an den kleider-zoff??? Starla Vance und Dakota Sky wurden ZUSAMMEN beim eisessen gesichtet. lachend. mit geteilten streuseln. mit PASSENDEN bettelarmbändern.\n\nes stellt sich raus, die sind befreundet seit ner cornflakes-werbung, die sie mit 9 gedreht haben (Dakota war die meerjungfrau, Starla der singende löffel). die kleider-sache war „ein totaler zufall“ und sie finden es „jetzt voll lustig“. ich weiß nich mehr, was ich glauben soll. ich hatte schon nen ganzen beitrag fertig',
    tags: ['starla vance', 'dakota sky', 'zoff', 'gesichtet'],
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'ok das is AUCH mein leben. ich bin so verwirrt. sind alle heimlich nett??',
      },
      { user: 'hater_patrol', text: 'fake. das is nur für die zeitschriften' },
      {
        user: 'maplebay_mel',
        text: 'der singende löffel!!! an die werbung erinner ich mich!!!',
      },
    ],
  },
  {
    id: 'tinfoil-recap',
    day: 5,
    title:
      'EXKLUSIV: Ziggys Drumstick trifft Fan in der ersten Reihe MITTEN INS GESICHT. Fan: „noch nie so glücklich“',
    body: 'das konzert der Tinfoil Comets in der Riverside Arena war laut allen EPISCH. Nova hat den letzten ton von Space Girl 24 sekunden gehalten (neuer rekord). Buzz hat den hut die ganze zeit aufbehalten. Mo hat sich EINMAL umgedreht.\n\naber DER moment, über den alle reden: Ziggy hat den größten drumstick-wirbel aller zeiten gemacht und den stick dann in die erste reihe geworfen, wo er nem fan direkt an die stirn geknallt is. zeugen sagen, sie hat ihn beim abprallen gefangen, hochgehalten und 2 volle minuten geschrien. legende. ziggy, falls du das liest: nächstes mal tiefer zielen',
    tags: ['tinfoil comets', 'konzerte', 'ziggy', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9105,
      caption: 'der wirbel des jahrhunderts (eingeschickt von einer leserin)',
    },
    comments: [
      {
        user: 'xX~JeSs~Xx :D',
        text: 'DAS WAR ICH!!!!!!! DAS WAR MEIN GESICHT!!!!! ICH HAB DEN DRUMSTICK UND NE BEULE UND ICH BEREUE NICHTS (L)(L)(L)',
      },
      {
        user: 'comet_fan_4ever',
        text: 'ehrlich gesagt neidisch auf dein gesicht',
      },
      {
        user: 'spacegirl4eva',
        text: '24 sekunden. daran werd ich für immer denken',
      },
      {
        user: 'langeweile_in_mathe',
        text: 'ok jetzt versteh ich das mit den tinfoil comets',
      },
    ],
  },
  {
    id: 'eau-de-duchess',
    day: 5,
    title: 'Bianca Goldcrests Chihuahua Duchess bringt ein PARFÜM raus',
    body: 'news, nach denen keiner gefragt hat: Duchess, der chihuahua von der Silver Spoon Ranch, hat jetzt ein eigenes parfüm. es heißt Eau de Duchess und kommt in ner flasche, die aussieht wie ein winziger hundeknochen.\n\nBianca sagt, es riecht „wie ein wellness-tag“. leute, die dran gerochen haben, sagen, es riecht „wie ein hund nach nem wellness-tag“. kostet 80 €. Duchess war für einen kommentar nicht zu erreichen (sie hat in ner handtasche geschlafen)',
    tags: ['bianca goldcrest', 'tiere', 'omg'],
    photo: {
      scene: 'pet',
      seed: 9106,
      caption: 'Duchess auf der party zum verkaufsstart (erschöpft)',
    },
    comments: [
      { user: 'duchess_fanclub', text: 'ICH KAUF 3' },
      {
        user: 'pia (L) ponys (L)',
        text: 'ich will ein pony-parfüm. das riecht nach heu und LIEBE',
      },
      {
        user: 'stallbursche_rick',
        text: 'berta die kuh hätte eher ein parfüm verdient',
      },
    ],
  },
];

export const GOSSIP_POLLS: readonly Poll[] = [
  {
    id: 'scrunchies',
    day: 1,
    question: 'Starlas 40 Haargummis:',
    options: ['TOP', 'FLOP'],
  },
  {
    id: 'kyle-hair',
    day: 2,
    question: 'Kyle ohne Strähnchen:',
    options: ['TOP', 'FLOP', 'wer is kyle'],
  },
  {
    id: 'rex-limp',
    day: 3,
    question: 'Das „Stunt“-Humpeln von Rex Hammerton:',
    options: ['TOP', 'FLOP'],
  },
  {
    id: 'buzz-hat',
    day: 4,
    question: 'Der Millionen-Euro-Alu-Hut von Buzz:',
    options: ['TOP', 'FLOP', 'will ich auch'],
  },
  {
    id: 'eau-de-duchess',
    day: 5,
    question: 'Eau de Duchess (Hundeparfüm):',
    options: ['TOP', 'FLOP', 'igitt'],
  },
];
