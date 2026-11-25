# Changelog

All notable changes to still online are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-26

The first stable release. It consolidates everything shipped as v0.1 through v0.6.1 (October 2026): the app is live at <https://drilonrecica.github.io/still-online/> and the content, the two languages and the touch support have settled. Per-milestone notes are in [docs/release-notes-\*.md](docs/).

### Added

#### XP desktop

- Boot, login and session flow (log off, shut down), with a Windows XP–style shell: Start menu with an All Programs flyout, taskbar and tray (mute, network, DE/EN badge, clock), draggable, resizable, minimizable windows, and synthesized system sounds (startup, logon, logoff, error, modem handshake).
- Desktop icons that can be dragged onto an XP grid, saved, and reset with Arrange Icons By ▸ Name.
- A world that moves on: the in-game day advances after a shutdown or a new real date; days 1–10 are scripted and later days keep the day-10 state.
- User Accounts: name, one of eight pictures, and play as a girl or a boy. Content addressed to or about the player follows the choice, live.
- Display Properties: thirteen procedurally drawn wallpapers (homages, easter eggs and Theo's show poster, unlocked on day 10), Blue / Olive / Silver appearance, and the Pipes, Flying Panes, Marquee and My Pictures Slideshow screensavers.
- Explorer over a persistent virtual file system (My Documents, My Pictures, My Music), a restorable Recycle Bin, and a Picture Viewer (previous/next, best fit or actual size, Edit in Paint).
- Notepad, My Computer, Disk Cleanup (scans forever, frees nothing), balloon tips and a dial-up connection dialog.
- Amplifier: five CC BY tracks, three skins, windowshade mode, a ten-band equalizer with presets, an editable playlist, Burn CD, and a bars/oscilloscope visualizer.
- Paint (classic tools, undo, open/save to My Pictures, set as wallpaper or display picture) and Snapshot Booth (webcam photos with filters, or a cartoon avatar; nothing leaves the browser).
- Games with high scores: Mines, Hen Hunt, Star Pinball and Desktop Wrecker (hammer, chainsaw, flamethrower, machine gun, stamp, with detailed tool models, particle effects, new sounds and a Repair button).
- Fluff the desktop sheep and Stapley, an original stapler assistant with contextual tips that folds away when a window covers his corner.
- Phone and tablet support: the same desktop adapted for touch. Full-screen windows and an icon-only taskbar on a phone, floating windows on a tablet, tap / long-press / double-tap gestures, an on-screen-keyboard-aware layout, touch controls in every app and game, the Konami code as swipes. Works in portrait and landscape.
- Persistence: name, open windows, files, mail, chats, scores and settings survive a reload, with migrations for older saves.
- Accessibility and performance passes: axe-checked apps with keyboard paths, reduced-motion support, lazy-loaded apps with a JS size budget, canvases that pause when hidden.

#### Messenger (MSN)

- Six fictional friends (Jess, Kayla, Pia, Theo, Marco, Dex) with statuses, personal messages, display pictures, emoticons (built-in and custom ones from your pictures), winks, nudges, sign-in and message toasts and a "now playing" line synced with the Amplifier.
- A conversation engine with scripted choices, follow-ups that unlock over time, contacts waiting for a reply (bold, counted in the footer, flashing taskbar button) and no stale follow-ups after the next day's chat.
- Day-aware scripts for days 1–10: the Tinfoil Comets concert week, then Marco's rec hall gig, Kayla's class rep election, Theo's poster, Jess's fan art contest, Pia's hamster and Dex's skate jam, meeting on day 10, show night. Girl-only and boy-only threads.
- Reactions to the music you play and to your game scores.
- Away messages with a "while you were away" summary and a per-contact Message History.

#### Friendspace, Pixlog and the fictional web (MySpace era)

- Web Explorer with history, favorites and Fit to screen / Actual size, over a fully local, invented web indexed by Searchly.
- Friendspace (renamed from Spaceport): profiles for each friend and the player, a Top 8 editor whose drops are noticed the next day in Messenger and on your wall, mood history, bulletins, band pages with a player that hands tracks to the Amplifier, Upcoming and Past Shows, an autoplaying profile song and a layout-code box.
- Pixlog: a photo-sharing site with per-friend albums, photo comments, blogs, surveys and guestbooks, a shouts feed, kudos, and the player's own page with an album from their pictures, surveys and six skins.
- GlitterCodez: twelve copy-and-paste layouts (girly and boyish), glitter text, stickers and cursors that restyle a Friendspace profile.
- CheatCave and Kickflip Kings: the boy side of the web, with cheats, flash-game news, a forum, trick tips, a shoutbox and Velvet Lantern gig listings.
- Westfield High, Celeb Gossip 07, the cursed Tinfoil Comets fan page, VirusGuard and more, with new posts through day 10.
- Mail with a new batch per day (chain letters, spam, family, friends, replies to what you send) and TuneMole, a fake peer-to-peer client with slow, jittery downloads that land in My Music.

#### German and i18n

- A full German localization, written for a German 2007 rather than translated: the shell, every app and game (Minen, Hühnerjagd, Sternen-Flipper, Desktop-Randale, Flocke, Tacki), all chats, mail, files, sites and profiles for days 1–10, both for a girl and a boy.
- Language picker with flags on the login screen, a DE/EN tray badge and a Regional and Language Options app. Switching is live, with no reload; a German browser starts in German.
- Locale-aware dates, times and numbers; language-neutral saves rendered in the current language; German loaded only when it is needed.
- A German style guide (`docs/localization-de.md`), a gender guide (`docs/gender.md`), `docs/i18n.md`, and a content gender audit (`npm run gender-audit`).

#### Infrastructure

- Vite + React 18 + TypeScript + Zustand scaffold, with xp.css for the window chrome.
- Vitest unit tests, Playwright end-to-end tests (desktop, phone and tablet projects, English and German, axe accessibility checks) and a bundle size check.
- GitHub Actions: `ci` (typecheck, lint, unit tests, build, e2e) on pushes and pull requests, and `deploy` to GitHub Pages from `master`.
- Documentation: architecture notes per milestone, content format, accessibility, touch, decisions, and `CREDITS.md` for asset attributions. Apache-2.0 license.
- A release workflow: pushing a `v*` tag creates a GitHub Release with generated notes and a zip of the production build (relative paths, so it runs from any folder) for self-hosting.
- `CHANGELOG.md` (this file), and "Try it" and "Self-host" lines at the top of the README.

### Fixed

Notable fixes carried into 1.0.0 from the 0.x point releases:

- Now-playing sync between Messenger and the Amplifier; music stops when the Amplifier closes.
- Login requires a real name (no default "Player"); language picker made prominent.
- Mail of a new day always sorts above earlier days; Celeb Gossip 07 tags survive a language switch; Notepad opens wide enough for the seeded files.
- Friendspace `/me` keeps only what you typed, follows a language or gender switch and shows your User Accounts picture; the autoplay toggle stays readable on dark pasted layouts.
- Boy-side content: diary entries, favorites, mood, Pia's day-10 line ("ok. busted").
- Tour dates on the Tinfoil Comets page keep up with the week; played shows move to Past Shows.
- Messenger toasts re-render on a language or gender switch; Stapley stands above a maximized window's status bar.
- Trashed pictures, full-grid icon drops and off-screen icon positions are handled.
- End-to-end tests tolerate CI font rendering and wait for the stage to fit after a rotation.

### Milestones before 1.0.0

Untagged, with notes in `docs/`:

| Version | Date       | Theme                                                          |
| ------- | ---------- | -------------------------------------------------------------- |
| 0.6.1   | 2026-10-21 | Picture Viewer, movable desktop icons, Desktop Wrecker rebuilt |
| 0.6.0   | 2026-10-20 | Phones and tablets                                             |
| 0.5.1   | 2026-10-20 | Week-two fixes                                                 |
| 0.5.0   | 2026-10-20 | Days 6–10, up to the Velvet Lantern show                       |
| 0.4.1   | 2026-10-19 | Profile and content fixes                                      |
| 0.4.0   | 2026-10-19 | Friendspace, Pixlog, GlitterCodez; play as a girl or a boy     |
| 0.3.1   | 2026-10-15 | Bilingual polish                                               |
| 0.3.0   | 2026-10-15 | German                                                         |
| 0.2.0   | 2026-10-15 | The living internet: days, web, mail, creative apps, games     |
| 0.1.0   | 2026-10-14 | First playable: shell, Messenger, Amplifier                    |

[Unreleased]: https://github.com/drilonrecica/still-online/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/drilonrecica/still-online/releases/tag/v1.0.0
