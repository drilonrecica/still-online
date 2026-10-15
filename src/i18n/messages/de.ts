// German catalog. `Messages` makes TypeScript demand every key of `en.ts`.
import type { Messages } from '../types';

export const de: Messages = {
  common: {
    ok: 'OK',
    cancel: 'Abbrechen',
    apply: 'Übernehmen',
    yes: 'Ja',
    no: 'Nein',
    close: 'Schließen',
    browse: 'Durchsuchen…',
  },
  defaults: {
    playerName: 'Spieler',
    awayMessage: 'bin gleich wieder da',
    screensaverText: 'still online...',
  },
  apps: {
    explorer: { title: 'Explorer' },
    display: { title: 'Eigenschaften von Anzeige', label: 'Anzeige' },
    diskcleanup: { title: 'Datenträgerbereinigung' },
    mycomputer: { title: 'Arbeitsplatz' },
    messenger: { title: 'Messenger' },
    'messenger-chat': { title: 'Unterhaltung' },
    'messenger-history': { title: 'Nachrichtenverlauf' },
    dialup: { title: 'Mit dem Internet verbinden' },
    browser: { title: 'Web Explorer' },
    mail: { title: 'Mail' },
    tunemole: { title: 'TuneMole' },
    amplifier: { title: 'Amplifier' },
    notepad: { title: 'Unbenannt - Editor', label: 'Editor' },
    paint: { title: 'Unbenannt - Paint', label: 'Paint' },
    photobooth: { title: 'Fotobox' },
    mines: { title: 'Minen' },
    henhunt: { title: 'Hühnerjagd' },
    pinball: { title: 'Sternen-Flipper' },
    wrecker: { title: 'Desktop-Randale' },
    stapley: { title: 'Tacki' },
    recyclebin: { title: 'Papierkorb' },
  },
  fs: {
    folders: {
      root: 'Arbeitsplatz',
      docs: 'Eigene Dateien',
      pics: 'Eigene Bilder',
      music: 'Eigene Musik',
      recycle: 'Papierkorb',
    },
    folderTitle: '{name}',
    newFolder: 'Neuer Ordner',
    newFile: 'Neue Datei',
  },
  notepad: {
    title: '{file} - Editor',
    titleModified: '*{file} - Editor',
    untitledModified: '*Unbenannt - Editor',
  },
  paint: {
    title: '{file} - Paint',
  },
  games: {
    mines: 'Minen',
    henhunt: 'Hühnerjagd',
    pinball: 'Sternen-Flipper',
  },
  messenger: {
    chatTitle: '{name} - Unterhaltung',
    groups: {
      friends: 'Freunde',
      school: 'Schule',
      family: 'Familie',
      offline: 'Offline',
      count: '{group} ({online}/{total})',
      offlineCount: 'Offline ({total})',
    },
  },
  mail: {
    title: '{folder} - Mail',
    titleUnread: '{folder} ({n}) - Mail',
    folders: {
      inbox: 'Posteingang',
      sent: 'Gesendete Objekte',
      deleted: 'Gelöschte Objekte',
    },
    noSubject: '(kein Betreff)',
    bounce: {
      senderName: 'E-Mail-Zustellsystem',
      subject: 'Unzustellbar: {subject}',
      body: 'Ihre Nachricht an {to} konnte nicht zugestellt werden.\n\nDie Adresse wurde auf dem Server nicht gefunden. Überprüfen Sie die Schreibweise, und versuchen Sie es erneut.',
      unknownRecipient: 'den Empfänger',
    },
    reply: {
      subject: 'AW: {subject}',
    },
  },
  browser: {
    title: '{page} - Web Explorer',
    cannotFindServer: 'Server nicht gefunden',
    defaultFavorites: {
      searchly: 'Searchly',
      tinfoilcomets: 'Tinfoil Comets',
      spaceport: 'Spaceport',
      'westfield-high': 'Westfield-Gymnasium',
      celebgossip07: 'Celeb Gossip 07',
    },
  },
};
