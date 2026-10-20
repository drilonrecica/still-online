// German Friendspace bulletins, days 6–10, same ids, days, senders and links as
// `src/content/friendspace/bulletins-week2`. Jess's Ruhmeswand, der Fan-Art-Wettbewerb, Lakeview
// ausverkauft und der 2. Platz; Kayla gegen Brianna bei der Klassensprecherwahl (61 zu 61,
// Co-Klassensprecherinnen); Velvet Lantern im Jugendzentrum (die Setlist, „83“); Pias
// Hamster-Petition und der Fisch. Kaylas Haarschnitt heißt bei den anderen „Fransen“ („Pony“ nur
// in Kaylas eigenen Zeilen). Tag 10 ist nach der Show.
import { g } from '../../gender';
import type { Bulletin } from '../../friendspace/types';

export const BULLETINS_WEEK2: readonly Bulletin[] = [
  // Tag 6: der Drumstick an der Wand, das Juz diesmal echt, Theos Zeichnungen an der Kunstwand.
  {
    id: 'd6-jess-wall-tour',
    day: 6,
    from: { contactId: 'jess' },
    subject: 'ZIGGY HAT DAS ANGEFASST (ne führung durch meine wand)',
    body:
      'station 1: der DRUMSTICK. zwei nägel. über meinem bett. auf dem zettel steht ZIGGY HAT DAS ANGEFASST. ' +
      'station 2: meine stirn. sie is LILA. wenn man die augen zukneift isses ein stern. ' +
      'station 3: meine mama, die fragen stellt. führung vorbei. schickt das weiter wenn ihr auch ne ruhmeswand habt',
  },
  {
    id: 'd6-marco-rec-hall',
    day: 6,
    from: { contactId: 'marco' },
    subject: 'velvet lantern. jugendzentrum. diesmal echt',
    body:
      'das jugendzentrum westfield. samstag. einlass ab 18 uhr. ohne altersgrenze. passen 80 rein. ' +
      'ja. die show am samstag, von der ich erzählt habe. bingo hatte den ersten termin. bingo gewinnt immer. ' +
      'wir brauchen ein poster. laterne. keine suppe',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  {
    id: 'd6-theo-new-pics',
    day: 6,
    from: { contactId: 'theo' },
    subject: 'neue fotos auf pixlog. sorry',
    body: 'herr dalton hat meine zellzeichnungen an die kunstwand in raum 12 gehängt. ich hab fotos gemacht. sorry für das bulletin. und für die fotos',
    link: 'http://pixlog.example/theo',
  },
  // Tag 7: der Wahlkampf geht los, Brianna hat Fransen, der Fan-Art-Wettbewerb.
  {
    id: 'd7-kayla-vote',
    day: 7,
    from: { contactId: 'kayla' },
    subject: '~*WÄHLT KAYLA ZUR KLASSENSPRECHERIN*~ (NEUE FOTOS)',
    body:
      'ich hab mich eingetragen. 4 minuten vor schluss. das nennt man SCHICKSAL. ' +
      'meine plakate hängen im ostflur. die wahlkampf-fotos sind auf pixlog. ' +
      `friedensvertrag: ausgesetzt. das nennt man POLITIK. ${g('wählt kayla ~*~', 'wählt kayla. jungs auch')}`,
    link: 'http://pixlog.example/kayla',
  },
  {
    id: 'd7-brianna-vote',
    day: 7,
    from: { extra: 'Brianna', seed: 'brianna' },
    subject: 'wählt brianna :) (ja ich hab jetzt stirnfransen)',
    body: 'ich kandidiere als klassensprecherin!! ich hab ideen. und fransen. wählt brianna :) ps die fransen waren MEINE idee. pps ok warn sie nich',
  },
  {
    id: 'd7-cometgirl-contest',
    day: 7,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: 'FAN-ART-WETTBEWERB!!!',
    body: 'auf der fanseite gibts nen WETTBEWERB!!! thema: die comets im weltall!!! abgabe is MORGEN!!! die gewinner kriegen SIGNIERTE SACHEN!!! schickt das an jeden comet-fan weiter den ihr kennt!!!',
    link: 'http://tinfoilcomets.example/',
  },
  // Tag 8: Lakeview ist ausverkauft, die Hamster-Petition, die Setlist steht.
  {
    id: 'd8-jess-lakeview',
    day: 8,
    from: { contactId: 'jess' },
    subject: 'LAKEVIEW FESTWIESE: AUSVERKAUFT. MIR GEHTS NICH GUT',
    body:
      'NEUN MINUTEN. in NEUN MINUTEN ausverkauft. ich hing die GANZE zeit am telefon. ' +
      'ABER. is am selben abend wie marcos show. also geh ich ins juz. ' +
      `{name} kommt gefälligst mit ${g('(L)', '(Y)')}. ICH BRAUCH EIN NEUES SCHILD`,
  },
  {
    id: 'd8-pia-petition',
    day: 8,
    from: { contactId: 'pia' },
    subject: 'UNTERSCHREIB MEINE HAMSTER-PETITION (du musst)',
    body:
      'mama hat MAL SEHEN gesagt. und mal sehen heißt NEIN. das weiß jeder. deswegen gibts jetzt ne PETITION. ' +
      `unterschriften bis jetzt: ich. keks (pfote). papa (er hat „klar“ gesagt). {name} (${g('sie', 'er')} musste). ` +
      'unten unterschreiben. professor knabber zählt auf euch',
  },
  {
    id: 'd8-derek-setlist',
    day: 8,
    from: { extra: 'derek (schlagzeug)', seed: 'derekdrums' },
    subject: 'setlist. final. der eimer is in 3',
    body: '8 songs. der eimer is bei 3 dabei. marco hat verhandelt. ich hab besser verhandelt. the grip tapes spielen vorher. wir sehn uns im juz',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  // Tag 9: das Unentschieden, die Wettbewerbs-Ergebnisse, der Jam.
  {
    id: 'd9-kayla-tie',
    day: 9,
    from: { contactId: 'kayla' },
    subject: '~*61 zu 61*~',
    body: '61 zu 61. auf einem zettel stand „rätsel-hackbraten“. der zählt nich. brianna und ich sitzen im SEKRETARIAT. betet für mich. oder für sie. nein. für mich *seufz*',
  },
  {
    id: 'd9-jess-new-pics',
    day: 9,
    from: { contactId: 'jess' },
    subject: 'NEUE FOTOS auf pixlog!!! 2. PLATZ',
    body: 'ICH HAB DEN 2. PLATZ BEIM FAN-ART-WETTBEWERB!!! ich hab die SIGNIERTE SETLIST gewonnen. ziggy hat ZWEIMAL unterschrieben. ich hab gegen nudeln verloren. mir gehts gut. fotos sind drin',
    link: 'http://pixlog.example/jess',
  },
  {
    id: 'd9-dex-new-pics',
    day: 9,
    from: { contactId: 'dex' },
    subject: 'neue fotos auf pixlog. der jam',
    body: 'dritter. kickflip gestanden. kev hat die fotos gemacht. objektivdeckel war diesmal ab',
    link: 'http://pixlog.example/dex',
  },
  // Tag 10: nach der Show. 83 Leute, der Fisch, Co-Klassensprecherinnen.
  {
    id: 'd10-marco-83',
    day: 10,
    from: { contactId: 'marco' },
    subject: '83 leute',
    body:
      'in den raum passen 80. gekommen sind 83. brandschutz ist eine empfehlung. ' +
      'das mikro geht nur verkehrt rum. also wir auch. der eimer wurde in einem vierten song umgetreten. ' +
      'danke an alle. alle 83. die fotos sind drin',
    link: 'http://pixlog.example/marco',
  },
  {
    id: 'd10-pia-new-pics',
    day: 10,
    from: { contactId: 'pia' },
    subject: 'NEUE FOTOS auf pixlog!! MEIN FISCH',
    body: 'er heißt SIR STERNENSTAUB DER ZWEITE. er is ein goldfisch. er is KEIN hamster. er is trotzdem ein haustier. ich durfte nich zur show. es gibt ein foto von meinem gesicht dazu',
    link: 'http://pixlog.example/pia',
  },
  {
    id: 'd10-kayla-co-reps',
    day: 10,
    from: { contactId: 'kayla' },
    subject: '~*co-klassensprecherinnen. und dann DIE wendung*~',
    body:
      'dr. hargrove hat uns zu CO-KLASSENSPRECHERINNEN gemacht. mich UND brianna. ' +
      'dann sind wir zur show gegangen. in exakt den gleichen sachen. bis zum HAARGUMMI. sie hat „du auch“ gesagt. ' +
      'wir sind keine freundinnen. wir sind co-klassensprecherinnen. ...ok wir sind freundinnen',
  },
];
