# still online

_everyone you knew, still online._

A browser-based nostalgia simulator recreating Windows XP and the social internet of 2007 through MSN, Netlog, MySpace, Winamp, and a living fictional desktop.

> **v0.3 — now in German.** Play it now: **<https://drilonrecica.github.io/still-online/>**

![The still online desktop](docs/screenshots/desktop.png)

## About

Remember coming home from school, hearing the XP startup sound, and waiting for MSN to sign in so you could see who was online? **still online** is an attempt to bring that moment back: a Windows XP–style desktop that runs entirely in your browser, frozen somewhere in 2007.

It isn't meant to be a static museum piece. The desktop is meant to feel *lived in*. A cast of fictional friends sends you messages, updates their profiles, changes their status lines and leaves comments while you're away. You're logging back into an internet that kept going without you.

## What's in it

### Desktop

- **Windows XP–style shell**: boot and login screens, Start menu with an All Programs flyout, taskbar and tray (mute, network, clock), draggable/resizable windows, desktop icons, synthesized system sounds
- **A world that moves on**: the in-game day advances after a shutdown or a new real date, and each day brings new chats, mail, guestbook entries and profile comments (days 1–5 are scripted; later days keep the day-5 state)
- **Display Properties**: eleven procedurally drawn wallpapers (nine homages and two easter eggs), Blue / Olive / Silver appearance, and screensavers (Pipes, Flying Panes, Marquee, My Pictures Slideshow)
- **Explorer**: My Documents, My Pictures and My Music on a persistent virtual file system, plus a Recycle Bin you can restore from
- **Balloon tips**, a dial-up connection dialog with a synthesized modem handshake, and a **Disk Cleanup** that scans forever and frees nothing
- **Notepad** that opens and saves files in My Documents

### Messenger

- Six fictional friends with statuses, personal messages, emoticons (including your own, made from your pictures), nudges, winks, sign-in toasts and a "now playing" line
- Conversations continue over days; friends react to the music you play and to your game scores
- Away messages with a "while you were away" summary, a per-contact **Message History** and display pictures from My Pictures

### Internet

- **Web Explorer** with history, favorites and a fully fictional, local web: **Searchly** (search over every page), **Friendspace** profiles for each friend and you (Top 8, comment wall, profile song), a cursed 2003 fan page, a gossip blog, a school site and more
- **Mail** with a new batch of messages per day: chain letters, spam, family and friends, with replies to what you send
- **TuneMole**, a fake peer-to-peer client with slow, jittery downloads that lands tracks in My Music and the Amplifier

### Creative

- **Paint**: classic tools, undo, open/save to My Pictures, set as wallpaper or display picture
- **Snapshot Booth**: webcam photos with filters, or a cartoon avatar if you have no camera. The webcam stays local: nothing is recorded or uploaded, and photos are saved only in this browser
- **Amplifier**: five CC BY tracks, three skins, windowshade mode, a ten-band equalizer, an editable playlist and a visualizer

### Games and extras

- **Mines**, **Hen Hunt** (a shooting gallery), **Star Pinball** and **Desktop Wrecker** (smash the desktop, then Repair it), each with high scores
- **Fluff** the desktop sheep and **Stapley**, an original stapler assistant with contextual tips

| Desktop | Messenger |
| --- | --- |
| ![The desktop](docs/screenshots/desktop.png) | ![Messenger contact list](docs/screenshots/messenger.png) |
| **Amplifier** | **Web Explorer** |
| ![Amplifier with its playlist](docs/screenshots/amplifier.png) | ![Web Explorer on Searchly](docs/screenshots/browser.png) |
| **Friendspace** | **Paint** |
| ![A Friendspace profile](docs/screenshots/friendspace.png) | ![Paint with a drawing](docs/screenshots/paint.png) |
| **Mines** | **Hen Hunt** |
| ![Mines mid-game](docs/screenshots/mines.png) | ![Hen Hunt mid-round](docs/screenshots/henhunt.png) |

## Deutsch

still online is fully playable in **German** as well as English. It is not a word-for-word translation: the six friends, the mail, the websites and the files were rewritten for a German 2007 (SchülerVZ-era chat-speak, a Gymnasium instead of a US high school, euros and Fischstäbchen), with the same storylines and the same ids underneath.

- **What's localized:** the whole desktop and every app, all chats, mail, Friendspace profiles, Searchly and the other sites, seeded files, balloons, assistant tips, TuneMole results, and date/time/number formatting.
- **How to switch:** a German browser starts in Deutsch automatically. Otherwise pick a flag under **Language / Sprache** on the login screen, the **DE/EN** badge in the tray, or **Regional and Language Options** (*Regions- und Sprachoptionen*) in the Start menu. Switching is live, with no reload; your saves, chats and files carry over.
- **What stays as written:** things you typed or named yourself keep their language, like files on a real disk.

![Der still online Desktop mit geöffnetem Startmenü](docs/screenshots/desktop-de.png)

See [docs/i18n.md](docs/i18n.md) for how it works and [docs/localization-de.md](docs/localization-de.md) for the German style guide.

## Planned

Not built yet:

- Content beyond day 5: stories for later days currently repeat the day-5 state
- More friends, sites and games
- Further languages (the i18n system is built for them, see [docs/i18n.md](docs/i18n.md))
- Mobile and touch layouts (small screens only get a notice)

Ideas are welcome in the [issues](https://github.com/drilonrecica/still-online/issues).

## Run locally

```bash
nvm use        # Node version from .nvmrc
npm ci
npm run dev    # http://localhost:5173/still-online/
```

Other useful scripts: `npm run verify` (typecheck, lint, unit tests, build) and `npm run e2e` (Playwright; run `npx playwright install chromium` once).

## Tech stack

React 18, TypeScript, Vite, Zustand, [xp.css](https://botoxparty.github.io/XP.css/) for the window chrome, Vitest and Playwright. Everything runs client-side and is deployed to GitHub Pages. See [docs/architecture.md](docs/architecture.md) for how it fits together.

## Contributing

Ideas, memories, bug reports and feedback are very welcome. [Open an issue](https://github.com/drilonrecica/still-online/issues) to share them.

## Disclaimer

still online is a fan-made, non-commercial nostalgia project. It is **not** affiliated with, endorsed by, or sponsored by Microsoft, MySpace, Netlog, Winamp, or any of their owners. All product names, logos and trademarks belong to their respective owners and are mentioned only to describe the era the project recreates. All characters, conversations and content inside the simulation are fictional.

## License

Licensed under the [Apache License 2.0](LICENSE).

Asset attributions are listed in [Credits](CREDITS.md).
