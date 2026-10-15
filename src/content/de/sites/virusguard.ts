// German virusguard.example, same exports as `src/content/sites/virusguard`. Scareware spoke stiff,
// formal German („Sie") with euro prices; 87 stays 87.
import type { SiteMeta } from '../../sites/types';
import type { Threat } from '../../sites/virusguard';

export const VIRUSGUARD_HOST = 'virusguard.example';

export const SITE_META: SiteMeta = {
  title: 'VirusGuard 2007 - Ist Ihr Computer infiziert?',
  description:
    'ACHTUNG!!! Ihr Computer ist möglicherweise zu 87% infiziert!!! Kaufen Sie VirusGuard 2007 für nur 49,95 €. (Eine Scherz-Website.)',
  keywords: [
    'virus',
    'viren',
    'virenschutz',
    'antivirus',
    'virusguard',
    'scan',
    'sicherheit',
    'infiziert',
  ],
  pages: {
    '/': {
      title: 'VirusGuard 2007 - Ist Ihr Computer infiziert?',
      keywords: ['kaufen', 'scan', 'bedrohungen'],
    },
  },
};

export const VIRUSGUARD_TEXT = {
  brand: 'VirusGuard 2007',
  slogan: 'Wir schützen Ihren Computer seit Anfang dieses Jahres',
  alert: 'ACHTUNG!!! IHR COMPUTER IST ZU 87% INFIZIERT!!!',
  subAlert:
    'Unser KOSTENLOSER Online-Scan hat SCHWERWIEGENDE Probleme festgestellt. (Wir scannen alle. Alle sind 87%.)',
  scanTitle: 'Scan-Ergebnisse',
  scanning:
    'Ihr Computer wird gescannt… 100% abgeschlossen (das ging sehr schnell)',
  offer: 'Kaufen Sie VirusGuard 2007 für nur 49,95 €',
  offerNote: 'Statt 49,95 €. Jetzt nur 49,95 €! SIE SPAREN 0,00 €!',
  buy: 'JETZT KAUFEN!!!',
  bought:
    'Das Bezahlsystem befindet sich im Aufbau. Bitte versuchen Sie es nie wieder.',
  rescan: 'Erneut scannen',
  rescanned: 'Erneuter Scan abgeschlossen. Immer noch 87%. Es sind immer 87%.',
  testimonialsTitle: 'Das sagen unsere Kunden',
  seals: ['100% zertifiziert', 'Absolut sicher', 'Preisgekrönt*'],
  fineprint:
    'Dies ist eine Scherz-Website. VirusGuard 2007 gibt es nicht, hat nichts gescannt und kann Ihnen nichts verkaufen. Ihr Computer ist in Ordnung. *Den Preis hat uns unser Cousin verliehen.',
};

export const VIRUSGUARD_THREATS: readonly Threat[] = [
  {
    name: 'Trojaner.TanzenderHamster.B',
    location: 'tinfoilcomets.example',
    risk: 'EXTREM',
  },
  {
    name: 'Wurm.Glitzer.Overload',
    location: 'spaceport.example',
    risk: 'SEHR HOCH',
  },
  {
    name: 'Adware.SearchlyToolbar (3% installiert)',
    location: 'Eigene Dateien',
    risk: 'HOCH',
  },
  {
    name: 'Spyware.Klatsch.OMG',
    location: 'celebgossip07.example',
    risk: 'HOCH',
  },
  {
    name: 'Joke.Kettenbrief.WG.WG.WG',
    location: 'Posteingang',
    risk: 'SEHR HOCH',
  },
  { name: 'Tracking.Cookie.Haferkeks', location: 'Küche', risk: 'naja' },
];

export const VIRUSGUARD_TESTIMONIALS: readonly {
  quote: string;
  who: string;
}[] = [
  {
    quote:
      'Ich habe VirusGuard gekauft und jetzt ist mein Computer zu 87% infiziert!',
    who: 'K. Unde',
  },
  {
    quote:
      'Es hat einen Virus auf meinem Toaster gefunden. Ich besitze gar keinen Computer.',
    who: 'Gerhard, 71',
  },
  {
    quote: 'Die besten 49,95 €, die ich fast ausgegeben hätte.',
    who: 'xXdj_kevXx',
  },
];
