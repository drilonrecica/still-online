// German about.example (Web Explorer's welcome site), same exports as `src/content/sites/about`.
// Web Explorer is system software, so it says „Sie" like German XP did.
import type { SiteMeta } from '../../sites/types';

export const ABOUT_HOST = 'about.example';

export const SITE_META: SiteMeta = {
  title: 'Willkommen bei Web Explorer',
  description:
    'Ihr erster Halt im World Wide Web: erste Schritte, Surftipps und coole Seiten zum Besuchen.',
  keywords: ['willkommen', 'web explorer', 'hilfe', 'erste schritte', 'tipps'],
  pages: {
    '/': {
      title: 'Willkommen bei Web Explorer',
      keywords: ['willkommen', 'start'],
    },
    '/tips': {
      title: 'Web Explorer: Surftipps',
      keywords: ['tipps', 'favoriten', 'zurück', 'surfen'],
    },
  },
};

export const ABOUT_TEXT = {
  banner: 'Web Explorer',
  bannerTagline: 'Ihr Fenster zum World Wide Web',
  ticker:
    '*** NEU! Speichern Sie Ihre Lieblingsseiten im Menü „Favoriten“ *** Tipp: Mit einem 56K-Modem laden die meisten Seiten in unter einer Minute! ***',
  coolSitesTitle: 'Coole Seiten',
  footer:
    'Optimiert für 800x600 · Diese Seite ist auf Ihrem Computer gespeichert',
  welcomeTitle: 'Willkommen bei Web Explorer!',
  welcome: [
    'Herzlichen Glückwunsch, Sie sind im Internet! Geben Sie eine Adresse in die Adressleiste ein und drücken Sie die Eingabetaste, oder wählen Sie links eine der coolen Seiten.',
    'Verlaufen? Die Schaltfläche „Zurück“ bringt Sie zur vorherigen Seite, „Startseite“ zurück zu Ihrer Startseite.',
  ],
  tipsLink: 'Surftipps »',
  tipsTitle: 'Surftipps',
  tips: [
    {
      label: 'Favoriten:',
      text: 'Sie haben eine tolle Seite gefunden? Öffnen Sie das Menü „Favoriten“ und klicken Sie auf „Zu Favoriten hinzufügen“, damit Sie sie wiederfinden.',
    },
    {
      label: 'Aktualisieren:',
      text: 'Wenn eine Seite hängt, klicken Sie auf „Aktualisieren“, um sie neu zu laden. „Abbrechen“ gibt eine Seite auf, die zu lange braucht.',
    },
    {
      label: 'Sicher surfen:',
      text: 'Verraten Sie Fremden niemals Ihren echten Namen, Ihre Adresse oder Ihre Schule. Fragen Sie Ihre Eltern, bevor Sie sich irgendwo anmelden.',
    },
  ],
  backLink: '« Zurück zur Willkommensseite',
};

export const COOL_SITES: readonly { label: string; url: string }[] = [
  { label: 'Searchly', url: 'http://searchly.example/' },
  { label: 'Tinfoil Comets', url: 'http://tinfoilcomets.example/' },
  { label: 'Spaceport', url: 'http://spaceport.example/' },
  { label: 'Westfield-Gymnasium', url: 'http://westfield-high.example/' },
  { label: 'Celeb Gossip 07', url: 'http://celebgossip07.example/' },
];
