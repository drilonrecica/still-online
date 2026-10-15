// English catalog: the source of truth for every key (see docs/i18n.md → "Catalogs").
// One top-level key per area; values are strings with `{param}` tokens or `(p) => string`.
export const en = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    apply: 'Apply',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    browse: 'Browse…',
  },
  /** Localized defaults for settings stored as `null` (docs/i18n.md → "settings"). */
  defaults: {
    playerName: 'Player',
    awayMessage: 'brb',
    screensaverText: 'still online...',
  },
  /** Language pickers: login screen, Regional and Language Options, tray badge. */
  language: {
    pickerLabel: 'Language / Sprache',
    trayLabel: 'Input language: {language}',
    trayMenu: 'Input language',
    regional: {
      tab: 'Languages',
      language: 'Language:',
      example: 'Example',
      preview: 'Time: {time} · Date: {date} · Number: {number}',
    },
  },
  /** Registry titles (window titles, taskbar) and short labels (Start menu). */
  apps: {
    explorer: { title: 'Explorer' },
    display: { title: 'Display Properties', label: 'Display' },
    regional: { title: 'Regional and Language Options' },
    diskcleanup: { title: 'Disk Cleanup' },
    mycomputer: { title: 'My Computer' },
    messenger: { title: 'Messenger' },
    'messenger-chat': { title: 'Conversation' },
    'messenger-history': { title: 'Message History' },
    dialup: { title: 'Connect to the Internet' },
    browser: { title: 'Web Explorer' },
    mail: { title: 'Mail' },
    tunemole: { title: 'TuneMole' },
    amplifier: { title: 'Amplifier' },
    notepad: { title: 'Untitled - Notepad', label: 'Notepad' },
    paint: { title: 'untitled - Paint', label: 'Paint' },
    photobooth: { title: 'Snapshot Booth' },
    mines: { title: 'Mines' },
    henhunt: { title: 'Hen Hunt' },
    pinball: { title: 'Star Pinball' },
    wrecker: { title: 'Desktop Wrecker' },
    stapley: { title: 'Stapley' },
    recyclebin: { title: 'Recycle Bin' },
  },
  fs: {
    folders: {
      root: 'My Computer',
      docs: 'My Documents',
      pics: 'My Pictures',
      music: 'My Music',
      recycle: 'Recycle Bin',
    },
    /** Explorer's title for a folder the player made. */
    folderTitle: '{name}',
    newFolder: 'New Folder',
    newFile: 'New File',
  },
  notepad: {
    title: '{file} - Notepad',
    titleModified: '*{file} - Notepad',
    untitledModified: '*Untitled - Notepad',
  },
  paint: {
    title: '{file} - Paint',
  },
  /** How friends name the games in chat (`{game}`). */
  games: {
    mines: 'Mines',
    henhunt: 'Hen Hunt',
    pinball: 'Star Pinball',
  },
  messenger: {
    chatTitle: '{name} - Conversation',
    groups: {
      friends: 'Friends',
      school: 'School',
      family: 'Family',
      offline: 'Offline',
      count: '{group} ({online}/{total})',
      offlineCount: 'Offline ({total})',
    },
  },
  mail: {
    title: '{folder} - Mail',
    titleUnread: '{folder} ({n}) - Mail',
    folders: {
      inbox: 'Inbox',
      sent: 'Sent Items',
      deleted: 'Deleted Items',
    },
    noSubject: '(no subject)',
    bounce: {
      senderName: 'Mail Delivery Subsystem',
      subject: 'Undeliverable: {subject}',
      body: 'Your message to {to} could not be delivered.\n\nThe address was not found on the server. Check the spelling and try again.',
      unknownRecipient: 'the recipient',
    },
    reply: {
      subject: 'RE: {subject}',
    },
  },
  browser: {
    title: '{page} - Web Explorer',
    cannotFindServer: 'Cannot find server',
    /** Names of the default favorites, by host without `.example`. */
    defaultFavorites: {
      searchly: 'Searchly',
      tinfoilcomets: 'Tinfoil Comets',
      spaceport: 'Spaceport',
      'westfield-high': 'Westfield High',
      celebgossip07: 'Celeb Gossip 07',
    },
  },
} as const;
