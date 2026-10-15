// German westfield-high.example, same exports as `src/content/sites/westfieldhigh`: the
// Westfield-Gymnasium's official site in stiff school-office German („Sie“). Herr Dalton's notices
// follow Theo's arc (Wackelpudding, Referate in der ersten Stunde, Noten an Tag 5).
import type { NewsPost, SiteMeta } from '../../sites/types';
import type { MenuDay, StaffMember } from '../../sites/westfieldhigh';

export const WESTFIELD_HOST = 'westfield-high.example';

export const SITE_META: SiteMeta = {
  title: 'Westfield-Gymnasium - Heimat der Westfield-Wildkatzen',
  description:
    'Offizielle Website des Westfield-Gymnasiums: Aktuelles und Mitteilungen, Lehrerkollegium und der Mensa-Speiseplan. Auf geht’s, Wildkatzen!',
  keywords: [
    'westfield',
    'gymnasium',
    'schule',
    'wildkatzen',
    'aktuelles',
    'lehrer',
    'dalton',
    'biologie',
  ],
  pages: {
    '/': {
      title: 'Westfield-Gymnasium - Startseite',
      keywords: ['willkommen', 'mitteilungen', 'schulleiter'],
    },
    '/news': {
      title: 'Westfield-Gymnasium - Aktuelles und Mitteilungen',
      keywords: ['kuchenbasar', 'zellmodell', 'referat', 'projektwoche', 'mp3'],
    },
    '/staff': {
      title: 'Westfield-Gymnasium - Lehrerkollegium',
      keywords: ['lehrer', 'dalton', 'raum 12', 'e-mail'],
    },
    '/cafeteria': {
      title: 'Westfield-Gymnasium - Mensa-Speiseplan',
      keywords: ['mittagessen', 'speiseplan', 'essen', 'mensa'],
    },
  },
};

export const WESTFIELD_TEXT = {
  name: 'Westfield-Gymnasium',
  motto: 'Heimat der Westfield-Wildkatzen',
  welcomeTitle: 'Willkommen auf der Website des Westfield-Gymnasiums',
  welcome:
    'Willkommen auf unserer Schul-Website! Hier finden Sie Aktuelles und Mitteilungen, die Kontaktdaten des Kollegiums und den Mensa-Speiseplan. Bitte schauen Sie regelmäßig vorbei.',
  principalNote:
    'Am Westfield-Gymnasium ist jede Schülerin und jeder Schüler eine Wildkatze, und jede Wildkatze zählt. Bitte denken Sie daran, im Ostflur zu gehen und nicht zu rennen, solange der Boden gebohnert wird. - Dr. Hargrove, Schulleiter',
  address: 'Am Obstgarten 12, Westfield',
  phone: 'Sekretariat: 555-0142 · Krankmeldungen: 555-0143',
  footer: 'Copyright 2001-2007 Westfield-Gymnasium. Alle Rechte vorbehalten.',
  credits:
    'Gestaltet von der Computer-AG des Westfield-Gymnasiums (2001). Optimiert für Web Explorer bei 800x600.',
  newsIntro: 'Neuigkeiten und Mitteilungen der Schule, die neuesten zuerst.',
  noNews: 'Zurzeit liegen keine Mitteilungen vor.',
  staffIntro:
    'Um eine Lehrkraft zu erreichen, schreiben Sie bitte eine E-Mail oder hinterlassen Sie eine Nachricht im Sekretariat.',
  menuIntro:
    'Zu jedem Mittagessen gibt es Milch (normal oder Kakao). Änderungen vorbehalten.',
};

export const WESTFIELD_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'Biologie: Abgabe der Zellmodelle am Ende der Woche',
    author: 'Herr Dalton',
    body: 'Liebe Biologie-Kurse (alle Klassen): Eure Zellmodelle und Ausarbeitungen sind am Ende der Woche fällig. Jedes Organell muss beschriftet sein. Essbare Modelle bitte abdecken. Bitte keine lebenden Organismen mitbringen. Die Partner wurden im Unterricht eingeteilt. Wer mit seinem Partner noch nicht gesprochen hat: Heute wäre ein guter Tag, damit anzufangen.',
  },
  {
    day: 1,
    title: 'Kuchenbasar der Wildkatzen: Helfer gesucht',
    author: 'Frau Okafor, Elternbeirat',
    body: 'Nächste Woche findet in der Eingangshalle der Kuchenbasar der Wildkatzen statt. Der gesamte Erlös ist für neue Instrumente der Schulband bestimmt. Wir brauchen Bäckerinnen und Bäcker! Die Listen zum Eintragen hängen vor dem Sekretariat. Bitte kennzeichnen Sie alles, was Nüsse enthält.',
  },
  {
    day: 2,
    title: 'Erinnerung: Keine MP3-Player im Unterricht',
    author: 'Dr. Hargrove, Schulleiter',
    body: 'Ab sofort sind MP3-Player, tragbare CD-Player und „das kleine Ding mit dem Clip“ im Unterricht nicht erlaubt. Geräte, die gesehen oder gehört werden, werden eingesammelt und können nach der letzten Stunde im Sekretariat abgeholt werden. Wir hören uns Ihre Musik nicht an. (Herr Pruitt sagt, manches davon sei „eigentlich ganz gut“.)',
  },
  {
    day: 2,
    title: 'Mensa: Der Geheimnisbraten hat einen neuen Namen',
    author: 'Das Mensa-Team',
    body: 'Auf Wunsch der Schülerschaft heißt der „Geheimnisbraten“ ab sofort „Überraschungsbraten nach Art des Hauses“. Das Rezept bleibt unverändert. Bitte hören Sie auf zu fragen, was drin ist.',
  },
  {
    day: 3,
    title: 'Biologie: Ein Hinweis zum Thema Wackelpudding',
    author: 'Herr Dalton',
    body: 'Mehrere von euch haben gefragt, ob ein Zellmodell aus Wackelpudding bestehen darf. Ja. Bitte kühl lagern. Bitte nicht ohne Deckel im Schulbus transportieren. Wackelig ist in Ordnung. Das Zytoplasma ist auch wackelig. Flüssig ist nicht in Ordnung. Falls euer Modell schmilzt, bringt euer beschriftetes Plakat mit.',
  },
  {
    day: 3,
    title: 'Neues vom Kuchenbasar',
    author: 'Frau Okafor, Elternbeirat',
    body: 'Vielen Dank an alle, die sich eingetragen haben! Bisher haben wir 14 Bleche Marmorkuchen und sonst nichts. Falls Sie vorhatten, Marmorkuchen mitzubringen, denken Sie bitte über Kekse, Muffins oder buchstäblich alles nach, was kein Marmorkuchen ist.',
  },
  {
    day: 4,
    title: 'Biologie: Referate zum Zellmodell morgen in der ersten Stunde',
    author: 'Herr Dalton',
    body: 'Die Referate finden morgen in der ersten Stunde in Raum 12 statt. Jedes Paar hat fünf Minuten. Karteikarten sind erlaubt. Aufregung ist normal. Kühlboxen werden an der Tür angenommen. Wenn eure Kühlbox nach Fisch riecht, lasst sie bitte im Flur stehen.',
  },
  {
    day: 4,
    title: 'Anmeldung zur Projektwoche ab sofort möglich',
    author: 'Herr Dalton',
    body: 'Die Anmeldelisten für die Projektwoche hängen an der Tür von Raum 12. Projekte können allein oder zu zweit bearbeitet werden. Die Vulkan-Regel vom letzten Jahr gilt weiterhin: ein Vulkan pro Jahrgangsstufe.',
  },
  {
    day: 5,
    title: 'Biologie: Noten für das Zellmodell hängen aus',
    author: 'Herr Dalton',
    body: 'Die Noten für das Zellmodell hängen vor Raum 12 aus. Insgesamt hat die Klasse sehr gut abgeschnitten. Mehrere Modelle kamen wackelig, gefroren oder beides an. Alle waren eindeutig als Zellen zu erkennen. Ich habe diese Woche sehr viel über Wackelpudding gelernt. Gut gemacht, alle zusammen, und danke an die Paare, die so gut zusammengearbeitet haben.',
  },
  {
    day: 5,
    title: 'Ergebnis des Kuchenbasars',
    author: 'Frau Okafor, Elternbeirat',
    body: 'Der Kuchenbasar der Wildkatzen hat 212,50 € für neue Instrumente der Schulband eingebracht. Vielen Dank! Der übrig gebliebene Marmorkuchen wurde dem Lehrerzimmer gespendet, wo er neun Minuten überlebt hat.',
  },
];

export const WESTFIELD_STAFF: readonly StaffMember[] = [
  {
    name: 'Dr. Hargrove',
    role: 'Schulleiter',
    room: 'Sekretariat',
    email: 'principal@westfield-high.example',
  },
  {
    name: 'Herr Pruitt',
    role: 'Sekretariat',
    room: 'Sekretariat',
    email: 'office@westfield-high.example',
  },
  {
    name: 'Herr Dalton',
    role: 'Biologie',
    room: 'Raum 12',
    email: 'mr.dalton@westfield-high.example',
  },
  {
    name: 'Frau Okafor',
    role: 'Mathematik, Verbindungslehrerin zum Elternbeirat',
    room: 'Raum 9',
    email: 'mrs.okafor@westfield-high.example',
  },
  {
    name: 'Frau Fennimore',
    role: 'Deutsch',
    room: 'Raum 4',
    email: 'ms.fennimore@westfield-high.example',
  },
  {
    name: 'Frau Lindqvist',
    role: 'Kunst',
    room: 'Raum 21',
    email: 'ms.lindqvist@westfield-high.example',
  },
  {
    name: 'Herr Ramos',
    role: 'Computerraum, Computer-AG',
    room: 'Raum 15',
    email: 'mr.ramos@westfield-high.example',
  },
  {
    name: 'Herr Brickley',
    role: 'Sport',
    room: 'Turnhalle',
    email: 'coach.brickley@westfield-high.example',
  },
];

/** The weekly Mensa menu (not a story-day calendar, so weekday names are fine here). */
export const WESTFIELD_MENU: readonly MenuDay[] = [
  {
    day: 'Montag',
    main: 'Überraschungsbraten nach Art des Hauses',
    side: 'Kartoffelpüree',
    note: 'Früher: Geheimnisbraten.',
  },
  {
    day: 'Dienstag',
    main: 'Taco-Schiffchen',
    side: 'Mais',
    note: 'Das Schiffchen ist eine Tortilla. Es schwimmt nicht.',
  },
  { day: 'Mittwoch', main: 'Blechpizza', side: 'Gemischter Salat' },
  {
    day: 'Donnerstag',
    main: 'Hähnchen-Nuggets',
    side: 'Grüne Bohnen',
    note: 'Kroketten sind bis auf Weiteres gestrichen.',
  },
  {
    day: 'Freitag',
    main: 'Fischstäbchen',
    side: 'Kroketten (unter Vorbehalt)',
    note: 'Wer beim Ketchup wählerisch ist, bringt bitte eigenen mit.',
  },
];
