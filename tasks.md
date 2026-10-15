# still-online — v0.2 plan

<!-- igris:format 1 -->

This is the build plan for still-online v0.2, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file.** Read the whole brief, the global rules and your task's spec before starting. The v0.1 plan (all done) is archived in `docs/plans/v0.1-tasks.md`.

```sh
igris check --strict          # validate this plan
igris arise P0 --through P7   # run everything (yolo mode is the default in igris.toml)
```

---

# Project brief

still-online is a browser-based nostalgia simulator: an XP-style desktop frozen in **2007**. v0.1 shipped the shell (boot, login, desktop, taskbar, start menu, window manager), **Messenger** (6 scripted fictional friends with follow-up conversations, nudges, toasts, "now playing"), and **Amplifier** (a music player with playlist and visualizer). v0.2 turns it into a whole computer you want to come back to.

## v0.2 scope (this plan)

1. **Foundations:**
   - Start menu "All Programs"
   - a virtual file system with Explorer windows
   - an IndexedDB store for the player's own images
   - a world/day engine
   - dial-up networking
   - idle detection
   - shared content lint
2. **Desktop and system:**
   - Display Properties (homage wallpapers, Browse… your own, themes, screensavers)
   - screensavers
   - tray balloon tips
   - the dial-up dialog with a modem sound
   - a fake file system full of content
   - Notepad files
   - Disk Cleanup
3. **Living world:** days pass (a new real date, or shutting down and powering on), and friends' storylines continue over days 2–5.
4. **Messenger depth:**
   - away messages and auto-away
   - Message History
   - display pictures
   - winks
   - custom emoticons
5. **Internet:**
   - the Web Explorer browser
   - fictional 2000s websites (search engine, a cursed band fan page, Spaceport social profiles, gossip blog, school site)
   - Mail
   - the TuneMole download app
6. **Creative and media:**
   - Paint
   - Snapshot Booth (webcam)
   - Amplifier skins, equalizer, mini mode, playlist editing and a "Burn CD" joke
7. **Games and cult:**
   - Mines
   - Hen Hunt
   - Star Pinball
   - Desktop Wrecker
   - Fluff the desktop sheep
   - Stapley the assistant
   - game-score reactions from friends
8. **Release v0.2:** accessibility, performance, docs, release notes.

## Explicitly out of scope (do NOT build these)

- Any backend, accounts, multiplayer, real networking, real web access or AI-generated text. The "internet" is fictional and fully local.
- Real product names, logos, sounds or wallpapers (see the content and asset rules). Homages only.
- Uploading anything anywhere. The webcam and the player's images never leave the browser.
- Mobile-first layout. Keep the existing small-screen notice.
- i18n. All UI copy is English.
- Tagging or publishing a release.

If a task seems to need one of these, leave it out and mention it in your `igris done --note`.

---

# Global rules (apply to every task)

## Stack (fixed; do not substitute)

| Concern | Choice |
|---|---|
| Runtime | Node 24 LTS (pinned in `.nvmrc`; the owner's machine runs v24), npm (commit `package-lock.json`) |
| Build | Vite (latest 5.x or 6.x stable), `base: '/still-online/'` |
| UI | React 18 + TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`) |
| State | Zustand (+ `zustand/middleware` `persist` for persistence) |
| XP look | [`xp.css`](https://github.com/botoxparty/XP.css) (MIT) from npm, extended with our own CSS |
| Styling | Plain CSS Modules (`*.module.css`) + global tokens in `src/os/theme/tokens.css`. No Tailwind, no CSS-in-JS. |
| Unit tests | Vitest + @testing-library/react + jsdom |
| E2E tests | Playwright (Chromium only) |
| Lint/format | ESLint (flat config, typescript-eslint, react-hooks) + Prettier (default config, `singleQuote: true`) |

Don't add other runtime dependencies unless a task says so. Small dev dependencies are fine if you explain them in the done note.

## npm scripts (must keep working)

| Script | Does |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `typecheck` | `tsc -b --noEmit` (or equivalent that checks app + tests) |
| `lint` | `eslint .` |
| `format` | `prettier --write .` |
| `test` | `vitest run` |
| `e2e` | `playwright test` |
| `verify` | `npm run typecheck && npm run lint && npm run test && npm run build` |

igris runs these verify profiles after each task: default is `npm run verify`, `fast` is typecheck plus unit tests, and `e2e` is verify plus Playwright. Make sure they pass before running `igris done`.

## Folder layout

```
src/
  main.tsx, App.tsx          # entry; App renders the session state machine
  os/                        # the "operating system"
    store/                   # Zustand stores (windows, session, settings, sound)
    wm/                      # window manager components (Window, WindowLayer)
    desktop/  taskbar/  startmenu/  boot/  login/
    theme/                   # tokens.css, wallpaper, global styles
    events.ts                # typed event bus for cross-app events
    clock.ts                 # in-game clock (year 2007)
    sound.ts                 # sound service
    persist.ts               # storage keys + versioning helpers
  apps/
    registry.ts              # list of AppDefinition
    <app-id>/                # one folder per app (notepad, mycomputer, recyclebin, messenger, amplifier)
  content/                   # authored data: contacts, scripts, playlists (TS modules, typed)
  assets/                    # icons (SVG), emoticons (SVG) imported by code
public/
  music/                     # audio files (licensed, listed in CREDITS.md)
tests/e2e/                   # Playwright specs (shared helpers in tests/e2e/helpers.ts, from P0)
docs/                        # architecture.md, architecture-v0.2.md, content-format.md, decisions.md, review/, plans/
```

**v0.2 additions (created by the P0/P1 tasks; follow these locations):**

```
src/os/
  fs/            # virtual file system store, FolderView UI, procedural photo renderer
  blobStore.ts   # IndexedDB blobs (player images only)
  world.ts       # world/day store + unlocks
  network.ts     # dial-up connection state, requireOnline()
  idle.ts        # idle detection
  balloon/       # tray balloon tips + scheduler
  wallpapers/    # procedural homage wallpapers
  screensaver/   # screensaver overlay + savers
  linkify.ts     # turns *.example URLs into links that open Web Explorer
  pet/           # Fluff the sheep overlay
  assistant/     # Stapley overlay
src/apps/<id>/   # every new app has its own folder (explorer, display, dialup, diskcleanup,
                 # browser, mail, tunemole, paint, photobooth, mines, henhunt, pinball, wrecker,
                 # messenger-history lives in src/apps/messenger/history/)
src/apps/browser/sites/<host>/   # one folder per fictional website
src/content/     # files/, profiles/, mail/, sites/, tunemole.ts, assistant.ts, balloons.ts
```

Tests sit next to the code as `*.test.ts(x)`. Use path alias `@/` → `src/`.

## Code conventions

- Use function components and hooks. Use named exports, except where React.lazy needs a default export.
- Keep logic (stores, engines, reducers) in plain TS that can be tested without React. Components stay thin.
- Use no `any`. Use no default-exported objects for config. Keep each file under ~300 lines; split if bigger.
- Cross-app communication goes **only** through `src/os/events.ts`, never through direct imports between `src/apps/*` folders.
- Every user-facing interactive element is keyboard reachable and has a visible focus style. Interactive icons need an `aria-label`.
- Respect `prefers-reduced-motion`: disable shakes, marquees and visualizer animation, or reduce them to static. This also applies to screensavers, winks, the sheep, Stapley and game backgrounds: show a static frame or a gentle fade.
- **Every new app id** is added to the `AppId` union in `src/os/types.ts`, registered in `src/apps/registry.ts` (lazy component, 16px + 32px original SVG icons in `src/assets/icons/`, listed in `CREDITS.md` as original work), and added to the id list asserted in `src/apps/registry.test.tsx`.
- **Every new persisted store** uses `persistOptions` from `src/os/persist.ts` with a `sanitize` that tolerates corrupt data, and its name is added to `PersistedStoreName` in `src/os/types.ts`. Persist data only, never actions.
- All waits and animations driven by the game (timers, typing, dialing, downloads, page loads) go through `scaleMs` from `src/os/speed.ts`, so `?speed=fast` (×0.01) keeps e2e fast.
- Any date the player can see uses `now()` from `src/os/clock.ts`.
- Canvas-based apps must not crash in jsdom, where `getContext` returns null. Guard for it, and test the logic separately from drawing.
- Overlays (screensaver, Desktop Wrecker, Fluff, Stapley, balloons, dial-up dialog) render through a single overlay layer in `App.tsx`'s desktop. Z-order bottom to top: windows < Fluff < Stapley < balloons < Start menu < Desktop Wrecker < screensaver.

## Content and asset rules (legal; non-negotiable)

- **No copied assets.** Never use Microsoft, MSN, Winamp, MySpace or Netlog logos, icons, sounds, wallpapers, skins or fonts. Everything has to be an original lookalike:
  - CSS or hand-written SVG
  - sounds synthesized with the Web Audio API
  - or files under **CC0 / CC BY 4.0** licenses
- **Every** file in `src/assets/` and `public/` that we didn't write ourselves gets a row in `CREDITS.md`: file, source URL, author, license. Self-made assets are listed once as "original work".
- In-app product names are **original**:
  - The messenger is "Messenger", the player is "Amplifier".
  - The OS is unnamed. Use "still-online" where a name is needed, e.g. the boot screen.
  - Don't write "Windows", "MSN" or "Winamp" in the UI.
- **All characters are fictional.** Use no real people or celebrities, and no real email addresses. Contact handles use the fictional domain `@livemail.example`.
- Songs and bands mentioned in chats, sites, mails and files are fictional too, unless they are tracks actually shipped in `public/music/`.
- **The fictional web uses only the reserved `.example` TLD** (`searchly.example`, `spaceport.example`, …). Never write a real-looking domain (`.com`, `.net`, …), even as a joke. Email addresses use `@livemail.example` for friends and `@<site>.example` for others (e.g. `mr.dalton@westfield-high.example`).
- **Homages, not copies:** wallpapers are original procedural art "in the spirit of" famous ones; games are original takes on classic genres. Product names stay original. The v0.2 app names in "Defaults" are final.
- The player's own data (webcam photos, Paint pictures, uploaded wallpapers) stays in the browser (IndexedDB). It is never uploaded and never committed.
- Content is PG-13. No slurs, no sexual content, no self-harm themes.
- **Stay in 2007.** UI copy, slang and references fit 2007:
  - No smartphones or apps
  - No "DM", "stories" or "selfie"
  - "brb", "lol", ":P", "~*sparkles*~" names are good

## Working rules for sessions

- Do exactly the task in your row. If you notice something adjacent, mention it in the done note instead of doing it.
- **Don't edit the Status cells or task rows of this file.** igris manages them.
- When finished and verified, run `igris done <ID> --note "<what you did, anything the next task should know>"`. igris commits; don't push.
- **This plan runs unattended in yolo mode. Never ask the owner anything and never wait for input.** Don't use AskUserQuestion, plan mode or ExitPlanMode. There is nobody to answer.
- Decide with the "Defaults for ambiguous situations" table, then the task spec, then your best judgment. Log every non-trivial decision in your done note **and** append one line to `docs/decisions.md` (`- <ID>: <decision> — <reason>`). Create the file if it is missing.
- If something is truly blocked (no network, a package that won't install, a flaky tool):
  - Retry up to 3 times.
  - Then use the best offline or simpler fallback.
  - Note it in `docs/decisions.md` and finish with `igris done` anyway.
- If verification keeps failing, fix the cause. Never weaken, skip or delete tests just to get green, unless the test itself is wrong; then say so in the done note.
- **Never** `git push`, tag, create releases, or change GitHub settings. Never run `igris skip`.
- Docs you write (`docs/*.md`) are short, factual, and kept up to date by later tasks that change the described behavior.

## Defaults for ambiguous situations

| Question | Default |
|---|---|
| Player's name | Asked once on the login screen (text field, default `Player`, max 24 chars), stored in settings. Their messenger handle is `<lowercased-name-no-spaces>@livemail.example`. |
| In-game date/time | Real local time of day, real month/day, **year forced to 2007**. Implemented once in `src/os/clock.ts` (`now(): Date`). If the date is Feb 29, use Feb 28. |
| Font | `Tahoma, Verdana, 'Segoe UI', sans-serif`, 11px base (xp.css default). Don't ship font files. |
| Icons | Hand-written SVG, 32×32 (desktop) and 16×16 (taskbar/menus), simple glossy XP-ish style. One SVG per icon in `src/assets/icons/`. |
| Wallpaper | Default stays the current CSS rolling hill; v0.2 adds procedural homages (P1-01). No photos are shipped. |
| Sounds | Synthesized at runtime with Web Audio oscillators/envelopes in `src/os/sound.ts`. No audio files needed for UI sounds. |
| Storage | `localStorage`, keys prefixed `still-online:v1:`; on a version mismatch, discard and start fresh. |
| Animations | Short (≤ 250ms), except boot (~3s) and the nudge shake (~500ms). |
| Window defaults | New windows open cascaded (+24px x/y from the last one, wrapping), min size 240×140, never fully off-screen (keep ≥ 40px of titlebar visible). |
| Unknown visual detail | Match the XP "Luna Blue" look as closely as possible in original CSS. Use the tokens in "Visual reference" below. |
| Unclear test scope | Unit-test every store action and engine function. Add one Playwright happy path per user-visible feature. |
| v0.2 app names (final) | Explorer windows: "My Documents", "My Pictures", "My Music" (app `explorer`) · Display Properties (`display`) · Connect to the Internet (`dialup`) · Disk Cleanup (`diskcleanup`) · Message History (`messenger-history`) · Web Explorer (`browser`) · Mail (`mail`) · TuneMole (`tunemole`) · Paint (`paint`) · Snapshot Booth (`photobooth`) · Mines (`mines`) · Hen Hunt (`henhunt`) · Star Pinball (`pinball`) · Desktop Wrecker (`wrecker`) · Fluff (desktop sheep, overlay) · Stapley (assistant, overlay) |
| Window sizes | Explorer 520×380 · Display Properties 400×440 (fixed) · Connect to the Internet 360×260 (fixed) · Disk Cleanup 380×300 · Message History 520×420 · Web Explorer 800×600 · Mail 720×500 · TuneMole 640×460 · Paint 720×560 · Snapshot Booth 560×480 · Mines: sized to its board · Hen Hunt 800×560 · Star Pinball 460×640 · Desktop Wrecker: full-screen overlay |
| Idle | Screensaver after 5 min (setting; 0 = never). Messenger auto-Away after 5 min idle (setting). Idle = no pointer/keyboard/wheel input on the page. |
| Art | Everything is drawn in code: SVG, CSS, or canvas with seeded randomness so it's identical every run. No new binary image/audio files, except player data in IndexedDB. Use `mulberry32(seed)` (add it to `src/os/random.ts` in P0) for seeded randomness. |
| World day | Starts at 1. Story content covers days 1–5; from day 6 on, friends keep their day-5 presence and only ambient content runs. Don't name weekdays for story days (the tray shows the real date); say "today", "yesterday", "Day 3". |
| Online | Messenger sign-in, Web Explorer, Mail and TuneMole need a connection. When offline they call `requireOnline()`, which opens "Connect to the Internet" and **dials automatically** ("Connect automatically" is on by default). Dialing takes ~6 s, scaled by `scaleMs`. The connection is not persisted: every boot starts offline. |
| Fictional text | Run new authored text through the shared content lint (P0-09). Sites, mails, files and profiles follow the same voice rules as chats: 2007, PG-13, fictional people only. |
| Game scores | Games emit `game:score` on the event bus; best scores persist in the `games` store. |

---


---

## P0 — Foundations

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P0-01 | **v0.2 architecture** — design every foundation below and write `docs/architecture-v0.2.md` + the shared types; see spec. | — | done | opus | agent | — | — | — | Doc covers every P0 module, events, stores and the overlay layer; types compile; `src/os/random.ts` (`mulberry32`) implemented + tested; `tests/e2e/helpers.ts` exists. | §P0-01 |
| P0-02 | **Start menu programs + shortcuts** — `category`/`pinned` on apps, an "All Programs" flyout with submenus, data-driven desktop/Start shortcuts with props. | P0-01 | done | sonnet | agent | — | fast | — | Flyout opens by click and keyboard; submenus list apps by category; pinned apps in the left column; shortcuts can carry window props; tests updated. | §P0-02 |
| P0-03 | **Blob store** — `src/os/blobStore.ts` on IndexedDB with a memory fallback, plus a `useBlobUrl(key)` hook; Reset also clears it. | P0-01 | done | sonnet | agent | — | fast | — | put/get/delete/clear round-trip in tests (memory fallback in jsdom); object URLs revoked on unmount; Reset clears blobs. | §P0-03 |
| P0-04 | **Virtual file system** — persisted `fs` store with folders, files, Recycle Bin, seed merging and the procedural photo renderer. | P0-01 | done | opus | agent | — | fast | — | Every fs action unit-tested incl. delete → restore → purge, seed merge without resurrecting purged seeds, corrupt storage; `renderPhoto` is deterministic. | §P0-04 |
| P0-05 | **Explorer + Recycle Bin views** — `FolderView` UI, the `explorer` app (My Documents/Pictures/Music) and the Recycle Bin rebuilt on the fs. | P0-02, P0-04 | done | sonnet | agent | — | fast | — | Folders browse, open by type, rename, delete, restore, empty bin; keyboard operable; desktop + Start shortcuts open the right folder. | §P0-05 |
| P0-06 | **World/day engine** — persisted `world` store: day counter, advance rules, unlocks, `world:dayChanged`. | P0-01 | done | opus | agent | — | fast | — | Day advances once per boot when the real date changed or a shutdown happened; never more than +1; unlocks persist; fully unit-tested with fake dates. | §P0-06 |
| P0-07 | **Network core** — `src/os/network.ts`: offline/dialing/online, `requireOnline()`, events; dialing simulated (UI comes in P1-05). | P0-01 | done | sonnet | agent | — | fast | — | State machine + `requireOnline` resolve/cancel tested; events emitted; not persisted. | §P0-07 |
| P0-08 | **Idle detection** — `src/os/idle.ts` with `onIdle(minutes, cb)` and `os:idle`/`os:active` events. | P0-01 | done | sonnet | agent | — | fast | — | Thresholds fire once per idle period; any input resets; tested with fake timers. | §P0-08 |
| P0-09 | **Shared content lint + linkify** — generalise the text lint for all content folders; `src/os/linkify.ts` for `*.example` links. | P0-01 | done | sonnet | agent | — | fast | — | `lintText` reused by contact lint; `.example` URLs allowed, real TLDs flagged; linkify unit-tested; Messenger RichText links open Web Explorer via `browser:open`. | §P0-09 |
| P0-G | **P0 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: All Programs open, My Documents, Recycle Bin. | P0-01…P0-09 | done | sonnet | agent | — | e2e | — | verify + e2e pass; screenshots in `docs/review/P0/`; `docs/review/P0.md` written. | §Gate |

## P1 — Desktop and system

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-01 | **Homage wallpapers** — `src/os/wallpapers/`: 9 procedural homages + 2 easter-egg wallpapers, rendered to cached data URLs; the desktop reads the setting. | P0-G | done | opus | agent | — | — | — | All 11 render in Chromium (review screenshot grid); deterministic; jsdom-safe fallback; desktop shows the chosen one. | §P1-01 |
| P1-02 | **Display Properties** — the `display` app: Themes, Desktop (gallery, Browse…, position), Screen Saver, Appearance (Blue/Olive/Silver). | P1-01 | done | sonnet | agent | — | fast | — | Every tab works with Apply/OK/Cancel semantics; uploads go to the blob store; theme swap restyles the shell; Konami unlock works. | §P1-02 |
| P1-03 | **Screensavers** — overlay with Pipes, Flying Panes, Marquee and My Pictures Slideshow; starts on idle, stops on input, preview in Display Properties. | P1-02, P0-08 | done | opus | agent | — | fast | — | Each saver animates in Chromium (review screenshots); idle start/stop tested; reduced motion → static. | §P1-03 |
| P1-04 | **Tray balloon tips** — XP balloon UI anchored to the tray, a queue, and the scheduled content in `src/content/balloons.ts`. | P0-G | done | sonnet | agent | — | fast | — | One balloon at a time, close + auto-dismiss; seen-once tips persist; scheduler tested with fake timers. | §P1-04 |
| P1-05 | **Dial-up dialog + modem sound** — the `dialup` app, a synthesized handshake (`dialup` sound), a tray network icon with Disconnect. | P1-04, P0-07 | done | opus | agent | — | e2e | — | Messenger sign-in triggers auto-dial and then signs in; existing e2e still pass; the handshake renders offline (≤ 7 s, original). | §P1-05 |
| P1-06 | **Fake system content** — seed My Documents, My Pictures, My Music and the Recycle Bin with original 2007 content. | P0-G | done | opus | agent | — | fast | — | ≥ 8 docs, 6 photos, 2 music links, 4 embarrassing bin files; passes content lint; PG-13. | §P1-06 |
| P1-07 | **Notepad files** — open, save and save as fs txt files; the old single document migrates to `My Documents/notes.txt`. | P0-05 | done | sonnet | agent | — | fast | — | Explorer opens txt in Notepad; Save writes back; title `<name> - Notepad`; migration tested. | §P1-07 |
| P1-08 | **Disk Cleanup** — an endless, funny "scan" with joke categories that frees 0 KB. | P0-G | done | sonnet | agent | — | fast | — | Scan animates, lists categories with sizes, "OK" frees 0 KB with a dry message; reduced motion respected. | §P1-08 |
| P1-G | **P1 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: every wallpaper (grid), Display Properties tabs, each screensaver, a balloon, the dial-up dialog, Disk Cleanup. | P1-01…P1-08 | done | sonnet | agent | — | e2e | — | verify + e2e pass; screenshots in `docs/review/P1/`; `docs/review/P1.md` written. | §Gate |

## P2 — Living world

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-01 | **Day-aware Messenger** — `onDay` trigger, per-day contact presence, `unlock` lines; engine, lint, playthrough and docs updated. | P1-G | done | opus | agent | — | fast | — | onDay fires once per script when the day is reached; presence applies once per day; unlock emits `world:unlock`; content-format doc updated. | §P2-01 |
| P2-02 | **Days 2–5: Jess and Kayla** — day scripts and presence that continue their storylines to a day-5 resolution. | P2-01 | done | opus | agent | — | — | — | Lint + playthrough pass; ≥ 1 script per day 2–5 per contact; presence changes daily; voice consistent. | §P2-02 |
| P2-03 | **Days 2–5: Dex and Theo** — same as P2-02 for Dex and Theo. | P2-01 | done | opus | agent | — | — | — | Same as P2-02. | §P2-02 |
| P2-04 | **Days 2–5: Marco and Pia** — same as P2-02; Pia's day-5 script unlocks the "Pony Paradise" wallpaper. | P2-01 | done | opus | agent | — | — | — | Same as P2-02, plus the unlock line works. | §P2-02 |
| P2-05 | **New-day moments** — "Day N" on the boot screen and in the tray clock tooltip, plus a "new day" balloon summarising what changed. | P2-01, P1-04 | done | sonnet | agent | — | fast | — | Boot shows the day; the balloon lists friends whose presence changed; tested. | §P2-05 |
| P2-G | **P2 gate (self-review)** — follow "Task specs → Gate procedure", plus the content rubric; play days 1–5 with the fast clock. | P2-01…P2-05 | done | sonnet | agent | — | e2e | — | e2e flow advancing days passes; screenshots of boot day label, contact list per day; `docs/review/P2.md`. | §Gate |

## P3 — Messenger depth

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P3-01 | **Away messages** — auto-Away on idle, a custom away message, and a "While you were away" summary on return. | P2-G | done | sonnet | agent | — | fast | — | Idle → Away (status + message) → active restores; summary lists messages received while away; settings respected. | §P3-01 |
| P3-02 | **Message History** — a per-contact transcript browser with dates, search and Clear History. | P2-G | done | sonnet | agent | — | fast | — | Lists every contact with history; dates from `at`; search filters; opened from Messenger's menu and chat toolbar. | §P3-02 |
| P3-03 | **Display pictures** — the player picks a picture from My Pictures (incl. Paint/Booth images later); shown in chats and the list header. | P2-G | done | sonnet | agent | — | fast | — | Picker lists fs images; choice persists; generated photos and blob images both render. | §P3-03 |
| P3-04 | **Winks** — 6 original full-window animated winks; the player sends them, contacts send them via `ContactLine.wink`. | P2-G | done | opus | agent | — | fast | — | Each wink plays once over the chat (≤ 4 s), reduced motion = static frame; send menu works; ≥ 3 contact scripts use winks. | §P3-04 |
| P3-05 | **Emoticons++** — 6 new built-in emoticons and custom emoticons made from your pictures with your own shortcut code. | P3-03 | in progress | sonnet | agent | — | fast | — | Built-ins parse and render; custom emoticon create/delete persists; custom codes render in player messages. | §P3-05 |
| P3-G | **P3 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: away summary, Message History, a wink mid-play, emoticon picker. | P3-01…P3-05 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/P3.md`. | §Gate |

## P4 — Internet

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P4-01 | **Web Explorer shell + site framework** — the browser chrome, history, favorites, offline page, and the host → route site registry. | P3-G | blocked | opus | agent | — | e2e | — | Navigate, Back/Forward, Favorites, status-bar progress, offline "cannot be displayed" + Connect; `browser:open` from Messenger links works. | §P4-01 |
| P4-02 | **Searchly** — a search engine over every fictional page, with results, "I'm Feeling Lucky" and a cheesy homepage. | P4-01 | blocked | sonnet | agent | — | fast | — | Queries return ranked results from all registered sites; the index is built from site metadata; tested. | §P4-02 |
| P4-03 | **The cursed fan page** — `tinfoilcomets.example`: dancing hamsters, under construction, hit counter, guestbook, webring, opt-in synth tune. | P4-01 | blocked | opus | agent | — | fast | — | Peak-2003 look; guestbook persists player entries and shows friends' entries by day; counter ticks; content lint passes. | §P4-03 |
| P4-04 | **Spaceport profiles** — `spaceport.example`: a profile per friend (about me, mood, profile song, Top 8, comment wall by day) and the editable player profile. | P4-01 | blocked | opus | agent | — | fast | — | Six friend profiles + the player's; the profile song plays via `amplifier:enqueue`; comments appear per day; the player's edits persist. | §P4-04 |
| P4-05 | **Gossip blog + school site** — `celebgossip07.example` and `westfield-high.example`, with day-based posts tying into the storylines. | P4-01 | blocked | opus | agent | — | fast | — | Both sites render several pages; posts appear by day; fictional celebs only; content lint passes. | §P4-05 |
| P4-06 | **Mail** — the mail client app and store: folders, read/unread, compose with friends' auto-replies, attachments to the fs. | P3-G | blocked | sonnet | agent | — | fast | — | Inbox/Sent/Deleted work; per-day delivery; compose to a friend gets a canned reply; attachments save; needs a connection. | §P4-06 |
| P4-07 | **Mail content** — days 1–5 of mail: chain letters, spam, Mr Dalton, mom, Spaceport notifications, friends. | P4-06 | blocked | opus | agent | — | — | — | ≥ 3 mails per day; links open sites; content lint passes; PG-13. | §P4-07 |
| P4-08 | **TuneMole** — the fictional P2P app: search, peers, slow jittery downloads, stalls, a prank file; finished tracks land in My Music and the Amplifier. | P4-01 | blocked | sonnet | agent | — | fast | — | Search → download → progress → My Music file → enqueue; the prank opens Notepad; needs a connection; tested with fake timers. | §P4-08 |
| P4-G | **P4 gate (self-review)** — follow "Task specs → Gate procedure" plus the web content rubric; screenshots of every site and page, Mail, TuneMole. | P4-01…P4-08 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/P4.md`. | §Gate |

## P5 — Creative and media

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P5-01 | **Paint** — the classic drawing app: tools, palette, undo, open/save to My Pictures, set as wallpaper or display picture. | P4-G | blocked | opus | agent | — | fast | — | Every tool works (logic unit-tested on a pixel buffer); save/open round-trip; set-as-wallpaper and DP work. | §P5-01 |
| P5-02 | **Snapshot Booth** — webcam photos (local only) with filters and countdown, with an avatar-puppet fallback; saves to My Pictures. | P4-G | blocked | sonnet | agent | — | fast | — | Consent screen first; camera stops on close; filters render; fallback path works without a camera; photos saved. | §P5-02 |
| P5-03 | **Amplifier skins + windowshade** — 3 original skins and a mini windowshade mode. | P4-G | blocked | sonnet | agent | — | fast | — | Skin menu switches and persists; windowshade toggles on titlebar double-click and resizes the window. | §P5-03 |
| P5-04 | **Amplifier equalizer** — 10-band EQ in the audio graph, with presets, a toggle and an EQ panel. | P5-03 | blocked | opus | agent | — | fast | — | Filters inserted once in the media-element graph; presets apply; persisted; panel resizes the window like the playlist. | §P5-04 |
| P5-05 | **Amplifier playlist editing + Burn CD** — remove/reorder/add from My Music, `amplifier:enqueue`, and a "Burn CD…" joke. | P5-03 | blocked | sonnet | agent | — | fast | — | Edits persist; enqueue from TuneMole/Explorer/Spaceport plays; Burn CD fails with a "buffer underrun". | §P5-05 |
| P5-06 | **More now-playing reactions** — a second `onNowPlaying` script for every friend, track-specific where it's funny. | P4-G | blocked | opus | agent | — | — | — | Lint + playthrough pass; ≥ 1 new script per contact. | §P5-06 |
| P5-G | **P5 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: Paint with a drawing, Booth fallback, each skin, EQ, windowshade. | P5-01…P5-06 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/P5.md`. | §Gate |

## P6 — Games and cult

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P6-01 | **Games store + Mines** — the persisted `games` store and the minesweeper-style Mines. | P5-G | blocked | sonnet | agent | — | fast | — | Board logic unit-tested (first click safe, flood reveal, chord, win/lose); best times persist; `game:score` emitted. | §P6-01 |
| P6-02 | **Hen Hunt** — the Moorhuhn-style shooting gallery. | P6-01 | blocked | opus | agent | — | fast | — | 90 s rounds, shells and reload, depth scoring, bonuses, high scores; simulation unit-tested; renders in Chromium. | §P6-02 |
| P6-03 | **Star Pinball** — a space pinball table with fixed-timestep physics. | P6-01 | blocked | opus | agent | — | fast | — | Physics unit-tested (ball-segment/circle collisions, flipper impulse, no tunnelling at max speed); 3 balls; scoring; playable in Chromium. | §P6-03 |
| P6-04 | **Desktop Wrecker** — wreck the live desktop with 5 tools on a transparent overlay. | P5-G | blocked | opus | agent | — | fast | — | Every tool leaves its own marks + sound; Repair clears; Esc exits; cursor per tool; works over open windows. | §P6-04 |
| P6-05 | **Fluff the sheep** — a desktop pet that walks on the taskbar and window title bars. | P5-G | blocked | opus | agent | — | fast | — | Walk/fall/sleep/drag behaviour driven by a tested state machine; follows window geometry; tray toggle persists. | §P6-05 |
| P6-06 | **Stapley** — the original stapler assistant with contextual tips. | P5-G | blocked | sonnet | agent | — | fast | — | Tips fire on their triggers once; "don't show again" persists; Hide works; content lint passes. | §P6-06 |
| P6-07 | **Game reactions** — `onGameScore` trigger and a reaction script per friend. | P6-01, P6-02, P6-03 | blocked | opus | agent | — | fast | — | Trigger tested; each friend reacts to at least one game; lint + playthrough pass. | §P6-07 |
| P6-G | **P6 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: Mines won, Hen Hunt mid-round, Pinball, Wrecker damage, Fluff on a window, Stapley tip. | P6-01…P6-07 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/P6.md`. | §Gate |

## P7 — Release v0.2

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P7-01 | **Accessibility pass** — axe checks for every new app, plus keyboard paths through the main ones. | P6-G | blocked | sonnet | agent | — | e2e | — | No serious/critical axe violations in the new apps; keyboard paths documented. | §P7-01 |
| P7-02 | **Performance pass** — lazy loading, the initial bundle budget, and canvases that pause when hidden. | P6-G | blocked | sonnet | agent | — | e2e | — | Initial JS ≤ 250 KB gzip; every app chunk lazy; hidden/minimized canvases stop animating (tested). | §P7-02 |
| P7-03 | **README, screenshots, release notes** — update the README and screenshots, and write `docs/release-notes-v0.2.0.md`. | P7-01, P7-02 | blocked | sonnet | agent | — | — | — | README lists v0.2 features truthfully; a screenshot grid; release notes drafted; CREDITS complete. | §P7-03 |
| P7-G | **Release-ready gate (self-review)** — follow "Task specs → Gate procedure"; full playthrough over 3 days. **Do not tag, push or release.** | P7-01…P7-03 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/P7.md`; nothing pushed or tagged. | §Gate |

---

# Task specs

Full descriptions for every task. The row's Acceptance cell always applies too. When a spec and the existing code disagree about a detail the spec doesn't care about, follow the code's existing pattern.

## Specs

### Gate — Gate procedure (all phase gates)

1. Run `npm run verify` and `npm run e2e` and fix any failure.
2. Add one e2e happy-path spec for the phase's main user flows: `tests/e2e/v02-<phase>.spec.ts`, using the helpers in `tests/e2e/helpers.ts`. It runs in the default suite.
3. Write `tests/e2e/review-<phase>.spec.ts`, tagged `@review` (already excluded from the default run by `grepInvert`). It saves the screenshots named in the gate's row to `docs/review/<phase>/` at 1280×800. Run it with `npx playwright test --grep @review`. Collect console errors and page errors and assert there are none, like the v0.1 review specs.
4. **Look at every screenshot** with your image-reading tool and fix the obvious problems:
   - broken layout or overlap
   - missing icons
   - unstyled elements
   - text overflow
   - anything that looks un-XP-like or breaks the asset rules
5. Review the phase's code against the Acceptance cells of its tasks. Do missing work that is small (≤ ~30 min); list larger gaps as follow-ups.
6. Write `docs/review/<phase>.md`:
   - what was built
   - how to try it (`npm run dev` plus steps, mentioning `?speed=fast`)
   - the screenshots, linked
   - fixes made in this gate
   - known gaps and follow-ups
7. Re-run verify + e2e, then `igris done`. Don't push.

**Content rubric** (gates P2, P4, P5, P6, and any gate whose phase added authored text):
- Every friend keeps their established voice:
  - Jess: ALL CAPS, nudges
  - Kayla: ~*drama*~, ever-changing personal message
  - Dex: slow, always Away
  - Theo: shy, apologises
  - Marco: dry, lowercase, never "!"
  - Pia: bossy little sibling, ponies, tells mom
- It feels like 2007: lowercase chat-speak, emoticon codes, ~*decorated*~ names, guestbooks, glitter. No anachronisms (smartphones, apps, "DM", "selfie", streaming, social-media terms coined after 2007).
- PG-13. Fictional people only. No real celebrities, brands as characters, or real emails/URLs. Only `.example` domains.
- Storylines stay consistent across chat, mail, sites and profiles: the Tinfoil Comets concert, the bio cell project with Mr Dalton, Velvet Lantern band life, Pia's ponies, Kayla vs Brianna, Dex's kickflip and skate video.
- No typos except intentional chat-speak.

### P0-01 — v0.2 architecture

Write `docs/architecture-v0.2.md` (≤ 4 pages; it extends `docs/architecture.md`, it doesn't replace it) and add the shared **types only** (no feature UI). It must settle everything below so later tasks don't have to design.

1. **Event map** (`src/os/events.ts`, add to `OsEventMap`):

   | Event | Payload |
   |---|---|
   | `browser:open` | `{ url: string }` |
   | `amplifier:enqueue` | `{ trackId: string; play?: boolean }` |
   | `game:score` | `{ game: 'mines' \| 'henhunt' \| 'pinball'; score: number; detail?: string }` |
   | `world:dayChanged` | `{ day: number }` |
   | `world:unlock` | `{ id: string }` |
   | `network:connected` | `{ kbps: number }` |
   | `network:disconnected` | `{}` |
   | `os:idle` | `{ minutes: number }` |
   | `os:active` | `{}` |
   | `fs:changed` | `{ ids: string[] }` |

2. **AppDefinition additions** (`src/os/types.ts`):
   - `category?: 'accessories' | 'games' | 'internet' | 'entertainment' | 'system'`
   - `pinned?: boolean`

   Also a `Shortcut` type `{ appId: AppId; props?: WindowProps; label: string; icon16?: string; icon32?: string }`, used by the desktop and the Start menu's right column. Define the `AppId` additions for every v0.2 app (see Defaults → v0.2 app names).
3. **Stores and persisted names.** Add `'fs' | 'world' | 'mail' | 'web' | 'games'` to `PersistedStoreName`. Settings gains, specified now, implemented by their tasks:
   - `wallpaper: WallpaperChoice`, `wallpaperPosition: 'center' | 'tile' | 'stretch'`
   - `theme: 'blue' | 'olive' | 'silver'`
   - `screensaver: { id: 'none' | 'pipes' | 'panes' | 'marquee' | 'slideshow'; minutes: number; text: string }`
   - `awayMinutes: number`, `awayMessage: string`
   - `connectAutomatically: boolean`
   - `petEnabled: boolean`, `assistantEnabled: boolean`
   - `seenTips: string[]`

   `WallpaperChoice = { kind: 'builtin'; id: string } | { kind: 'custom'; blobKey: string } | { kind: 'color'; color: string }`. The default is `{ kind: 'builtin', id: 'classic' }`, which is the current CSS hill.
4. **Overlay layer:** a single `<OverlayLayer>` in the desktop (`App.tsx`) that renders overlay components in the z-order from the code conventions. Define its slots.
5. **The fs data model** (P0-04 implements it, so keep it exactly): `FsNode` as in §P0-04.
6. **The world model** (§P0-06), **network** (§P0-07) and **idle** (§P0-08) APIs, as signatures.
7. **The site registry contract** for Web Explorer (§P4-01) and the profile/mail/content type shapes, as signatures in `src/content/types.ts` or new `src/content/<area>/types.ts`.
8. **`src/os/random.ts`:** `mulberry32(seed: number): () => number` and `seedFrom(text: string): number` (FNV-1a), with tests.
9. **`tests/e2e/helpers.ts`:**
   - `logIn(page, name = 'Ada')`: goto `./?speed=fast`, skip boot, log in, wait for the desktop
   - `openMessenger(page)`: open, sign in (auto-dial happens after P1-05), close Jess's auto-opened nudge chat
   - `closeNudgeChats(page)`

   Refactor existing specs to use them where it's a pure simplification.

Verify `none`, because this is mostly docs and types; still keep `npm run typecheck && npm test` green.

### P0-02 — Start menu programs + shortcuts

- **Registry:**
  - Add `category` and `pinned` to the existing apps: Messenger (internet, pinned), Amplifier (entertainment, pinned), Notepad (accessories, pinned), My Computer (system), Recycle Bin (system).
  - Order inside a category is registration order.
  - `messenger-chat` and later `messenger-history` have no category (not launchable from menus).
- **Start menu** (`src/os/startmenu/`):
  - The left column shows pinned apps (32px icons).
  - An **"All Programs ▸"** button sits at the bottom of the left column, XP style: green arrow, separator above.
  - It opens a flyout listing the categories as submenus ("Accessories", "Games", "Internet", "Entertainment", "System Tools") with 16px icons. Each submenu opens on hover (300 ms delay) or click, and lists its apps.
  - Keyboard: ↑/↓ move, → opens a submenu, ← closes it, Enter launches, Esc closes one level.
  - Empty categories are hidden.
- **Shortcuts:** replace `PLACE_IDS` with a `START_PLACES: Shortcut[]`:
  - My Documents (explorer `{folder:'docs'}`)
  - My Pictures (`{folder:'pics'}`)
  - My Music (`{folder:'music'}`)
  - My Computer
  - Display Properties (labelled "Control Panel"; that's fine since it's generic)
  - Recycle Bin

  Shortcuts whose app isn't registered yet are skipped, so this works before P0-05/P1-02 land.
- **Desktop icons:** `DESKTOP_SHORTCUTS: Shortcut[]` in order: My Documents, My Computer, Recycle Bin, Messenger, Amplifier, Notepad. Web Explorer and others are added by their tasks. Missing apps are skipped. Keep the `apps` override props for tests (accept shortcuts).
- Launching a shortcut calls `openApp(appId, props)`.
- Update `StartMenu.test.tsx`, `DesktopIcons` tests and `registry.test.tsx`.

### P0-03 — Blob store

`src/os/blobStore.ts`:
- **API:**
  - `putBlob(blob: Blob): Promise<string>` returns a key `blob:<random>`
  - `getBlob(key): Promise<Blob | null>`
  - `deleteBlob(key): Promise<void>`
  - `clearBlobs(): Promise<void>`
- **Storage:** IndexedDB database `still-online`, object store `blobs`. If `indexedDB` is unavailable or throws (jsdom, private mode), fall back to an in-memory `Map` for the session and `console.warn` once.
- **`useBlobUrl(key: string | null): string | null`** (React hook): loads the blob, creates an object URL, and revokes it on change or unmount.
- **Reset:** extend `src/apps/mycomputer/reset.ts` so Reset also awaits `clearBlobs()` before reloading. Update its test.
- **Tests:** in-memory path round-trip; the hook revokes URLs (mock `URL.createObjectURL`/`revokeObjectURL`).

### P0-04 — Virtual file system

`src/os/fs/`. Persisted store name `fs`.

```ts
export type FsType = 'folder' | 'txt' | 'image' | 'audio' | 'link';
export interface PhotoSpec { scene: 'camp' | 'pet' | 'trip' | 'party' | 'beach' | 'snow' | 'concert' | 'selfportrait'; seed: number; caption?: string }
export interface FsNode {
  id: string;               // seeds: 'seed:<slug>'; user files: 'f:<random>'
  parentId: string | null;  // null only for 'root'
  name: string;             // with extension for files: 'bio_project.txt', 'camp.jpg'
  type: FsType;
  createdAt: number; modifiedAt: number;  // epoch ms (real time)
  text?: string;            // txt
  photo?: PhotoSpec;        // image (procedural)
  blobKey?: string;         // image (player data in blobStore)
  trackId?: string;         // audio → src/content/playlist.ts id
  url?: string;             // link → a *.example URL
  deletedFrom?: string;     // set while in the Recycle Bin: original parentId
  system?: boolean;         // folders that can't be deleted or renamed
}
```

- **Well-known folders** (system):
  - `root` ("My Computer")
  - `docs` ("My Documents", parent root)
  - `pics` ("My Pictures", parent docs)
  - `music` ("My Music", parent docs)
  - `recycle` ("Recycle Bin", parent root)
- **Store actions:**
  - `list(parentId)`: folders first, then by name, case-insensitive
  - `get(id)`, `path(id)` (e.g. `My Documents\My Pictures\camp.jpg`)
  - `createFile(parentId, partial)` returns the id. Names are made unique as `name (2).txt`.
  - `writeText(id, text)`, `rename(id, name)`
  - `remove(id)`: moves to `recycle` and sets `deletedFrom`. Folders move with their contents.
  - `restore(id)`, `purge(id)` (deleting a `blobKey` calls `deleteBlob`), `emptyRecycleBin()`
  - `seed(nodes: FsNode[])`: adds missing seed nodes; never re-adds a seed id listed in the persisted `purgedSeeds: string[]`
- Every mutation emits `fs:changed`.
- **`renderPhoto(spec, canvas, w, h)`** in `src/os/fs/photos.ts`: deterministic procedural "photos" in a slightly washed-out 2007 digicam style (date stamp in the corner, warm tint, slight vignette).
  - Each scene is drawn from shapes with `mulberry32(spec.seed)`: camp (tents, fire, trees), pet (a dog or cat silhouette on a carpet), trip (a bus and a crowd), party (balloons, blurry lights), beach, snow, concert (stage lights, crowd heads), selfportrait (a webcam-angle face with an arm).
  - jsdom: if there's no context, return without drawing.
- **Tests:** every action, unique naming, the recycle round-trip, purge deleting blobs (mock `blobStore`), seed merge plus purgedSeeds, sanitize of corrupt data (drop invalid nodes; re-create the system folders).

### P0-05 — Explorer + Recycle Bin views

- **`src/os/fs/FolderView.tsx`** (shared UI):
  - an XP Explorer layout: an address bar showing the path, an "Up" button, a left task pane ("File and Folder Tasks": Rename, Delete, and in the bin: Restore, Empty Recycle Bin), and a main area with Icons/Details view toggle
  - 32px icons per type (folder, txt, image thumbnail via `renderPhoto` or `useBlobUrl`, audio, link)
  - selection with click/arrows, open with double-click/Enter, Delete key = remove, F2 = rename (inline input)
- **App `explorer`:** `props.folder` is a folder id; `instanceKey = folder`; title = the folder name; category system.
  - **Opening by type:**
    - txt → `openApp('notepad', { fileId })` (Notepad support comes in P1-07; until then it opens Notepad without the file)
    - image → an image viewer pane inside Explorer ("Picture and Fax Viewer"-style: prev/next, zoom to fit)
    - audio → emit `amplifier:enqueue { trackId, play: true }` and open the Amplifier
    - link → emit `browser:open { url }`
    - folder → navigate
- **App `recyclebin`:** keep the id. Its component renders `FolderView` on `recycle` with restore/empty actions. The title shows "Recycle Bin". The desktop icon shows full or empty from the store.
- Add the My Documents/Pictures/Music shortcuts to the desktop and Start lists (see P0-02).
- **`amplifier:enqueue` (basic):** handle it in `src/apps/amplifier/store.ts` (subscribe at module load, like the now-playing store): add the track to the playlist if missing, then `playIndex` it when `play` is set. If no Amplifier window is open, open one via `useWindowsStore.getState().openApp('amplifier')`; keep that call in a tiny `src/os/amplifierRouter.ts` installed from `App.tsx`, so the store stays UI-free. P5-05 extends this; Explorer, Spaceport and TuneMole rely on it from now on.
- **Tests:** FolderView interactions, open-by-type dispatch, bin actions.

### P0-06 — World/day engine

`src/os/world.ts`, persisted as `world`:

```ts
interface WorldState { day: number; lastRealDate: string /* YYYY-MM-DD local */; shutdownPending: boolean; unlocks: string[]; dayStartedAt: number }
```

- **`onBoot(realNow = new Date())`**, called once when the session enters `booting`, wired in `App.tsx`:
  - On the first ever boot, set day 1 and the date.
  - Otherwise, if `shutdownPending` or the real date differs from `lastRealDate`, then day += 1 (exactly 1, never more), update the date, clear the flag, set `dayStartedAt`, and emit `world:dayChanged`.
- **`markShutdown()`:** called when the session reaches `off` (`shutdownComplete`).
- **Unlocks:** `unlock(id)` adds the id once and emits `world:unlock`; `hasUnlock(id)`.
- **Selectors:** `useWorldStore`, `currentDay()`.
- **Tests:** first boot; reboot on the same day without a shutdown keeps the day; a shutdown advances; a date change advances; both together advance by only 1; corrupt storage resets to day 1.

### P0-07 — Network core

`src/os/network.ts`. Not persisted.

```ts
type NetStatus = 'offline' | 'dialing' | 'online';
interface NetworkStore { status: NetStatus; kbps: number; phase: 'idle' | 'dialing' | 'verifying' | 'registering' | 'connected'; connect(): void; cancel(): void; disconnect(): void }
export function requireOnline(): Promise<boolean>
```

- `connect()` runs the phases with `scaleMs` durations (dialing 3 s, verifying 1.5 s, registering 1.2 s), then goes online with `kbps = 56.0`. It emits `network:connected`.
- `cancel()` and `disconnect()` go offline and emit `network:disconnected`.
- `requireOnline()` resolves `true` immediately if online. Otherwise it opens the dial-up UI (`openApp('dialup')`, guarded with `getApp('dialup')`; until P1-05 exists, it calls `connect()` directly) and resolves when online (`true`) or when the attempt is cancelled (`false`).
- **Wire now:** Messenger's Sign in awaits `requireOnline()` before `signIn()`. On `network:disconnected`, the Messenger engine signs out.
- **Tests:** state machine, events, `requireOnline` resolve/cancel with fake timers. Update Messenger tests: in unit tests, set the network store to `online` in `beforeEach`.

### P0-08 — Idle detection

`src/os/idle.ts`:
- Listens (passive) to `pointermove`, `pointerdown`, `keydown`, `wheel` and `touchstart` on `window`.
- `onIdle(minutes, cb): () => void` fires `cb` once when the player has been idle that long; it re-arms after activity.
- Emits `os:idle { minutes }` at each threshold registered through it, and `os:active` on the first input after an idle event.
- `installIdle()` is called once from `App.tsx`. Timers use `scaleMs`.
- **Tests:** fake timers; multiple thresholds; activity resets; `os:active` only after idle.

### P0-09 — Shared content lint + linkify

- Move the text checks out of `src/content/lint.ts` into an exported `lintText(text: string, path: string, opts?: { placeholders?: readonly string[] }): string[]`:
  - email, URL, forbidden names, and post-2007 terms (keep the existing list and also flag "app store", "hashtag", "tweet", "streaming")
  - URLs and emails ending in `.example` are allowed; other TLDs are flagged as before
- `lintContactText` uses it. Export `lintContentStrings(value: unknown, path: string)` for any content object.
- Add `src/content/content.test.ts`, which runs `lintContentStrings` over every content module under `src/content/` (files, profiles, mail, sites, balloons, assistant, tunemole) as they appear. Use `import.meta.glob('./**/*.ts', { eager: true })`, filtering out tests and `types.ts`.
- **`src/os/linkify.ts`:** `splitLinks(text): ({ kind: 'text'; text } | { kind: 'link'; text; url })[]` for `(https?://)?(www.)?<host>.example(/path)?`.
  - Messenger's `RichText` renders links as buttons styled like links. Clicking one emits `browser:open { url }` (normalised to `http://…`).
  - Emoticon parsing still applies to the text segments.
- **Tests:** lint cases, splitLinks cases, a RichText link click emits the event.

### P1-01 — Homage wallpapers

`src/os/wallpapers/`: a registry of `WallpaperDef { id; name; hidden?: boolean; unlock?: string; render(ctx, w, h, rand) }` and `wallpaperUrl(id, w, h): string | null`. It renders to an offscreen canvas and caches the `toDataURL('image/jpeg', 0.9)` per id at a bucketed size (round to 256 px). It returns null in jsdom.

Paint each one as **original procedural art**. Gradients, curves, noise and seeded shapes give the *feeling* of the famous originals without tracing them:

| id | Name | Feeling |
|---|---|---|
| `classic` | Rolling Hill | Keep the existing CSS hill as-is (no canvas). |
| `hill` | Green Hill Sky | Painted rolling green hill, deep blue sky, soft cumulus clouds (Bliss feeling). |
| `ripple` | Blue Ripple | Abstract blue water ripples, light from top-left (Azul feeling). |
| `autumn` | Autumn Lane | A path through orange and red trees, falling leaves. |
| `dunes` | Red Moon Dunes | Red desert dunes under a pale moon at dusk. |
| `stones` | Stone Circle | Standing-stone silhouettes against a sunset sky. |
| `tulips` | Tulip Field | Rows of red/yellow/pink tulips receding to the horizon. |
| `orbit` | Home Orbit | The Earth's limb from orbit, thin atmosphere glow, stars. |
| `bloom` | Violet Bloom | A big soft purple flower macro with bokeh. |
| `peaks` | Crystal Peaks | Snowy mountains reflected in a still lake. |
| `ponies` | Pony Paradise | Hidden, `unlock: 'ponies'`. Pastel rainbow, clouds, cartoon pony silhouettes, sparkles (Pia's day-5 gift). |
| `retro` | Retro Grid | Hidden, `unlock: 'konami'`. A neon synthwave grid with a sun, plus a tiny "1337" in the corner. |

- **The desktop root** (`.desktop-root` in `App.tsx`) reads `settings.wallpaper` and `wallpaperPosition`:
  - builtin → `background-image: url(dataUrl)`, with the CSS hill class kept as a fallback
  - custom → `useBlobUrl`
  - color → a solid colour
- Re-render on viewport resize (debounced).
- Add these settings fields to the settings store, with sanitize: `wallpaper`, `wallpaperPosition`.
- **Tests:** registry integrity, determinism (render twice into a fake 2D context recorder → same call log), and the settings sanitize.

### P1-02 — Display Properties

App `display` (category system; window 400×440, fixed size), XP's tabbed dialog using xp.css tabs: **Themes · Desktop · Screen Saver · Appearance**. The buttons are OK / Cancel / Apply; changes preview live inside the dialog and apply on Apply/OK.

- **Themes:** "still-online XP" (blue + classic), "Olive Afternoon" (olive + autumn), "Silver Night" (silver + orbit).
- **Desktop:**
  - a preview monitor (an SVG CRT with a scaled wallpaper)
  - a scrollable list of wallpapers (hidden ones only once unlocked) plus "(None)" with a colour picker (16 swatches)
  - **Browse…** (an `<input type=file accept=image/*>`) → `putBlob` → custom
  - Position: Center/Tile/Stretch
- **Screen Saver:** a dropdown (None, Pipes, Flying Panes, Marquee, My Pictures Slideshow), Wait N minutes (1–60), Settings… (for Marquee: the text), Preview (runs the saver until input; P1-03 wires the actual savers). Defaults as in "Defaults".
- **Appearance:** colour scheme Blue/Olive/Silver. It sets `document.documentElement.dataset.theme`. Add `[data-theme='olive']` and `[data-theme='silver']` overrides of the titlebar/taskbar/start tokens to `src/os/theme/tokens.css`, using the Luna-style palettes:
  - olive: titlebar `#8BA169` → `#B8C88F`, taskbar `#94A869` → `#7A8D52`
  - silver: titlebar `#A6A7B8` → `#D6D7E4`, taskbar `#C3C4D0` → `#9C9DB0`
- **Konami code:** ↑↑↓↓←→←→BA anywhere on the desktop, with no window focused. It unlocks `konami` (`world.unlock`), shows a balloon "Cheat activated! A new wallpaper is available." (if P1-04 isn't in yet, use a toast) and plays `notify`.
- **Shortcuts:** right-click on the empty desktop → a context menu with "Properties" (opens Display Properties), "Arrange Icons By ▸ Name" (no-op is fine) and "Refresh". Also the Start right column ("Control Panel").
- **Tests:** tab switching, Apply/Cancel semantics, the theme attribute, Browse stores a blob (mock), the Konami sequence.

### P1-03 — Screensavers

`src/os/screensaver/`: an overlay in the overlay layer.
- **Starting:**
  - `onIdle(settings.screensaver.minutes)` starts the selected saver when on the desktop (not during boot/login/off); `minutes = 0` or `none` disables it
  - "Preview" (from Display Properties) starts it immediately
- **Stopping:** any pointer move > 4 px, key or click stops it. The first input is swallowed so it doesn't click through.
- **The savers** (canvas, `requestAnimationFrame`, paused when the tab is hidden):
  - **Pipes:** XP's 3D-pipes feeling. Pipes grow on a 3D grid, drawn as shaded cylinders with ball joints, random colours per pipe, resetting after ~40 pipes. Use a simple 3D → 2D projection.
  - **Flying Panes:** generic four-pane window frames (white/blue, not any logo) fly toward the viewer from a vanishing point on black.
  - **Marquee:** `settings.screensaver.text` (default "still online...") scrolls across a black screen in a random colour, at a random height each pass.
  - **My Pictures Slideshow:** fades through the images in `pics` (`renderPhoto` or blobs), 6 s each, with a slow Ken Burns pan.
- **Reduced motion:** a static black screen with the text "still online" and a slow fade.
- **Tests:** start/stop logic with fake idle and input; the pipes growth step function (pure) is deterministic.

### P1-04 — Tray balloon tips

`src/os/balloon/`:
- **The store:** `push({ id?, title, text, icon?: 'info' | 'warning' | 'network' | 'shield' | 'sheep' | 'stapley', onClick? })`. It shows **one at a time**, queues the rest, auto-dismisses after `scaleMs(9000)`, and has a close ✕.
- A tip with an `id` that's in `settings.seenTips` is skipped; showing it adds the id.
- **The UI:** an XP balloon. Yellow `#FFFFE1` background, black 1 px border, rounded corners, a tail pointing down to the tray area above the clock, a bold title with an icon, the text, and a ✕. Clicking the body runs `onClick`, then dismisses.
- **`src/content/balloons.ts` + scheduler** (`src/os/balloon/schedule.ts`, started when the desktop mounts):

  | When | Balloon |
  |---|---|
  | After 3 min on the desktop, once ever (`id: 'unused-icons'`) | "There are unused icons on your desktop" / "Click here to have Desktop Cleanup Wizard clean up your desktop." Clicking opens Disk Cleanup (joke). |
  | Each day after 8 min, `id: 'updates-<day>'` | "Updates are ready for your computer" / "Click here to install these updates." Clicking shows a second balloon "Installing updates (1 of 47)…", then nothing. |
  | Day ≥ 2, after 12 min, `id: 'virusguard-<day>'` | Shield icon: "VirusGuard 2007: Your subscription has expired!" / "Your computer might be at risk." Clicking opens Web Explorer at `http://virusguard.example`. A tiny 1-page joke site; add it to the P4 site list as a TODO in decisions if Web Explorer isn't there yet. |
  | `network:connected` (always, no id) | Network icon: "Connected at 56.0 Kbps". |

- **Tests:** the queue, seen-once ids, the scheduler with fake timers and day.

### P1-05 — Dial-up dialog + modem sound

- **App `dialup`** ("Connect to the Internet"; category internet; 360×260; fixed size; xp chrome):
  - **The form:** "User name" `player` (from the player name), "Password" `••••••••` (disabled), a "Save password" checkbox (checked), "Dial: 555-0137", a "Connect automatically" checkbox (bound to `settings.connectAutomatically`, default on), and the buttons **Dial**, **Cancel** and **Properties** (the last does nothing).
  - **Opening:** when opened by `requireOnline()` and `connectAutomatically` is on, it starts dialing immediately.
  - **While dialing:** it shows the phase text ("Dialing…", "Verifying user name and password…", "Registering your computer on the network…") with an animated connection icon (two computers, a blinking line). It plays the `dialup` sound once at the start.
  - **Connected:** it closes itself (the balloon from P1-04 appears).
  - **Cancel** → `cancel()`.
- **The `dialup` sound** in `src/os/sound.ts`, an original synthesized modem handshake (~6 s; extend the length test to allow `dialup` ≤ 7 s). It's built from voices:
  - dial tone (350+440 Hz)
  - 7 DTMF digits (dual tones, ~90 ms each)
  - a ring
  - an answer tone (2100 Hz sweep with a phase-reversal click)
  - V.8-ish warbles (fast alternating tones)
  - the classic "bong-bong" carrier bursts
  - band-passed noise hiss bursts
  - a final click into silence

  Don't sample anything. Add a `sine` sweep capability if needed: `ToneVoice.glideTo?: number` (target note, a linear ramp over `dur`).
- **Tray network icon:** two small monitors. Grey = offline, blinking during dialing, blue = online. Click: offline → `requireOnline()`; online → a small menu "Disconnect" / "Status" (Status = a balloon with "Connected at 56.0 Kbps · Duration hh:mm").
- **e2e:** existing Messenger/Amplifier specs keep passing. Sign in triggers auto-dial, which takes ~60 ms with `?speed=fast`. Add one dial-up spec to `tests/e2e/v02-P1.spec.ts` (the gate creates that file; you may create it first).
- **Tests:** the dialog phases, auto-dial, Cancel, tray behaviour, the sound definition length, and an offline render in the sound test (reuse the fake context).

### P1-06 — Fake system content

Write the files in `src/content/files/` (typed `FsNode[]`, ids `seed:<slug>`, merged with `fs.seed()` on app start). The player is a 2007 teen and this is the family computer they just got.
- **My Documents** (≥ 8 txt):
  - `bio_project_draft.txt` (the cell project with Theo; half-written, with a "TODO ask theo about mitochondria")
  - `poem_DO_NOT_READ.txt` (a cringe-sweet secret poem; no names)
  - `song_lyrics_notebook.txt` (lyrics the player wrote for Marco's band "velvet lantern", terrible rhymes)
  - `top 8 drama.txt` (ranking friends, rewritten 4 times, crossed-out lines shown as `~~` or "(no wait)")
  - `homework_maths.txt` (half-done)
  - `concert_packing_list.txt` (Tinfoil Comets concert: earplugs, glitter sign…)
  - `mom_rules_for_the_computer.txt` (written by mom: "1 hour per day!!! no chatting with strangers")
  - `notes.txt` (empty, created by the P1-07 migration if missing)
  - `READ ME FIRST.txt` from the computer shop (fictional "PixelPoint Computers")
- **My Pictures** (6 `PhotoSpec`s, use them all): `summer_camp_2006.jpg` (camp), `biscuit_the_dog.jpg` (pet), `school_trip_museum.jpg` (trip), `kaylas_party_BLURRY.jpg` (party), `beach_holiday.jpg` (beach), `me_webcam_test.jpg` (selfportrait).
- **My Music:** `surf_shimmy.mp3` and `cool_rock.mp3` (audio, trackIds from the playlist).
- **Recycle Bin** (`deletedFrom: 'docs'`): `letter_to_theo_NEVER_SEND.txt`, `my_rap_lyrics.txt`, `diary_age_11.txt`, `pony_fanfic_by_pia.txt` (Pia wrote it on your computer; ponies, very dramatic).

All PG-13, funny, consistent with the friends' storylines. It must pass the content lint (P0-09). Write a test that every seed has a unique id and a valid parent.

### P1-07 — Notepad files

- Notepad gets `props.fileId?: string`.
  - With a file: it loads `text` from the fs, and the title becomes `<name> - Notepad`.
  - Without one: "Untitled - Notepad".
- **Menu bar:** File (New, Open…, Save, Save As…, Exit), Edit (Select All, Time/Date = inserts `now()` formatted like XP: `3:07 PM 10/14/2007`), Format (Word Wrap toggle), Help (About Notepad).
  - **Open…** and **Save As…** use a small XP file dialog built on `FolderView` (folder tree limited to My Documents and its subfolders, a file name box, and the type "Text Documents (*.txt)").
  - Unsaved changes show `*` in the title, and closing asks "Do you want to save the changes?" (Yes/No/Cancel).
- **Migration:** if the old `notepad` store has non-empty `text` and `My Documents/notes.txt` doesn't exist, create it from the text and clear the old store (once). Keep the `notepad` persisted name for compatibility.
- Notepad becomes multi-document. Each window keeps its own buffer in component state; the fs is the source of truth on save.
- **Tests:** open/save/save-as, dirty prompt, migration, Time/Date. Update the existing Notepad e2e expectations if they break (shell spec), keeping the scenario.

### P1-08 — Disk Cleanup

App `diskcleanup` (category system, 380×300):
1. **First dialog:** "Disk Cleanup is calculating how much space you will be able to free on (C:). This may take a few minutes to complete." A progress bar crawls with random pauses. It's never fast (minimum `scaleMs(6000)`), and the "Scanning:" label cycles through joke entries: "Temporary Internet Files", "Old crushes", "Embarrassing poems", "Unfinished homework", "Pony fan fiction", "Kayla drama archive".
2. **Then the classic list,** with checkboxes and sizes:
   - Downloaded Program Files 0 KB
   - Temporary Internet Files 14,382 KB
   - Recycle Bin (the real count of items × 1.2 KB)
   - Old crushes 2,048 KB
   - Feelings 0 KB
   - Compress old files 9,999,999 KB
3. **OK** asks "Are you sure you want to perform these actions?". Yes → a "Cleaning up…" progress bar, then "Disk Cleanup freed 0 KB on (C:). Your computer is as messy as before." with OK.
4. Reduced motion: no pauses in the animation, but the same steps.

### P2-01 — Day-aware Messenger

1. **Trigger:** `{ type: 'onDay'; day: number }`. On `signIn()`, every eligible `onDay` script with `day <= currentDay` fires once (non-repeat). The engine gets `getDay?: () => number` in `ConversationEngineOptions` (runtime passes `() => useWorldStore.getState().day`); the default is 1.
2. **Presence per day:** `Contact.days?: Partial<Record<number, { status?: ContactStatus; personalMessage?: string }>>`. On contact sign-in, if `ContactProgress.presenceDay` (a new persisted field, sanitized, default 1) is less than the current day, apply the highest `days` entry with `key <= currentDay` and set `presenceDay`. Script-driven changes later that day still win.
3. **Unlock lines:** `ContactLine.unlock?: string`. Delivering the line calls an `onUnlock` option the runtime wires to `world.unlock(id)`. Order: text, nudge, statusChange, personalMessageChange, unlock.
4. Update the playthrough test (`onDay` → set the engine day before sign-in), lint (unlock ids must be known: `'ponies'`), `docs/content-format.md` and `src/content/types.ts` docs.
5. **Tests:** fires at the right day, only once; presence applies once per day, and a later script change persists; unlock wiring.

### P2-02 — Days 2–5 storylines (used by P2-02, P2-03, P2-04)

Each task writes days 2–5 for its two friends: P2-02 Jess + Kayla, P2-03 Dex + Theo, P2-04 Marco + Pia. Read `src/content/contacts/<id>.ts` fully first; keep voice, running jokes and storyline.
- **Per friend and day:** at least one `onDay` script (≥ 4 nodes, ≥ 1 real branch, every path ends), plus a `days[N]` presence entry (a new personal message every day, a status where it fits; Dex stays Away).
- **Arcs to land by day 5** (make them land whatever branches the player took on earlier days; refer back with care):
  - **Jess:** concert week. Day 2 sign-making panic, day 3 outfit crisis, day 4 the night before, day 5 the concert happened and she was in the front row; she sends a "you had to be there" recap.
  - **Kayla:** the Brianna saga escalates (2–3), a twist (Brianna turns out to be nice, 4), an awkward peace (5).
  - **Dex:** the skate video. Day 2 filming, day 3 the camcorder eats the tape, day 4 he lands the kickflip with no camera, day 5 the "video" is a 30-second blur he's very proud of. He still answers slowly and is always Away.
  - **Theo:** the cell project. Day 2 the jello attempt, day 3 disaster or success depending on choices, day 4 presentation nerves, day 5 they got a B+, and a shy "thanks for being my partner". Keep the apologies.
  - **Marco:** Velvet Lantern's gig at a tiny venue. Day 2 the flyer is up, day 3 Derek quits again, day 4 he un-quits, day 5 the gig: 11 people came, "a sold-out show if the venue held 11". Never "!".
  - **Pia:** a pony crisis. Day 2 Stardust the pony is missing, day 3 she blames the dog, day 4 she finds it in the laundry, day 5 she "gives" the player a present. Her day-5 script includes a line with `unlock: 'ponies'` and the text tells the player to look at the desktop backgrounds ("i put a PRESENT in ur computer!!! look at the backrounds").
- **Content rules** as in the global rules, plus the content rubric. Run `npx vitest run src/content` and `npx tsc -b --noEmit`.

### P2-05 — New-day moments

- **Boot screen:** under the wordmark, "Day N", small and grey. The tray clock tooltip becomes `<long date> · Day N`.
- **On `world:dayChanged`,** after the desktop mounts (5 s later), a balloon (P1-04): title "A new day!", text "N friends changed their personal messages." (count the friends whose `days[day]` sets a personal message, or "Your friends are up to something." on day 6+). Clicking it opens Messenger.
- **Day 1, first ever boot:** a welcome balloon "Welcome to your new computer!" / "Click here to connect to the Internet." → `requireOnline()`.
- **Tests:** the label and tooltip; the balloon text logic.

### P3-01 — Away messages

- **Settings:** `awayMinutes` (default 5, 0 = off) and `awayMessage` (default "brb"), editable in a Messenger "Options…" dialog (File menu → Options; a simple xp.css form).
- **Auto-away:** on `onIdle(awayMinutes)` while signed in and status Online, set the player status to Away and remember `autoAway = true`. On `os:active`, if `autoAway`, go back to Online.
- **Manual Away:** choosing "Away" in the status dropdown asks for an optional away message (prefilled). The personal message isn't touched; the away message shows in the contact-list header as "(Away: brb)".
- **While Away** (manual or auto), contact messages are flagged `whileAway: true` (a new optional field on transcript entries, sanitized). On return to Online, if any arrived, show a toast "While you were away" with "N messages from …", and on click open the most recent chat.
- **Contacts may react:** add an optional `Contact.awayReply?: string` line that a contact sends once per day if you're Away when they message. Add it for Jess ("UR AWAY?? ugh fine. BRB 2") and Marco ("away. classic.").
- **Tests:** auto-away/active, the manual prompt, flags and the summary, awayReply once per day.

### P3-02 — Message History

App `messenger-history` (title "Message History"; no category; opened from Messenger's File menu → "View Message History…" and from each chat's toolbar "History" button with `props.contactId`).
- **Layout:** the left list has every contact with a transcript (avatar, name, message count); the right side is a conversation view with date separators ("Tuesday, October 16, 2007" via `now()`-style formatting of each entry's `at`, with the year forced via `toGameDate`). It reuses `RichText`, and has a search box filtering lines (highlighted) and a **Clear History** button per contact with a confirm (it clears only the transcript, not script progress).
- Reading from `useMessengerStore` is fine here (same app folder).
- **Tests:** list, date grouping, search, clear.

### P3-03 — Display pictures

- `PlayerProgress.displayPicture?: { fileId: string } | null` (sanitized).
- **The picker** opens from clicking the player's picture, which is now shown in the contact-list header (48 px) and in chat windows (bottom-right, 64 px, like the old IM layout with the contact's picture top-right). It's a dialog listing all `image` files in My Pictures (thumbnails via `renderPhoto` or `useBlobUrl`) plus "(None)" (the default pattern avatar from the player name).
- A missing or purged file falls back to the default.
- **Tests:** picker, persistence, fallback.

### P3-04 — Winks

- **`src/apps/messenger/winks/`:** 6 original animations as SVG/CSS (or a canvas for particles), each ≤ 4 s, played once over the chat window's transcript area (absolutely positioned, `pointer-events: none`):
  - `kiss` (a lipstick mark stamps, hearts float)
  - `hamster` (a laughing hamster rolls across)
  - `hearts` (raining hearts)
  - `pickle` (a dancing pickle)
  - `fireworks`
  - `snowball` (snowballs splat on the screen and slide down)
- **Sending:** a chat toolbar button "Winks ▾" opens a 3×2 grid menu with previews. Sending plays it locally, adds the transcript entry `{ kind: 'wink', from: 'player', wink, at }` (extend `TranscriptEntry`, sanitize, render as "You sent a wink: Hamster") and plays `notify`.
- **Receiving:** `ContactLine.wink?: WinkId` → the engine emits `wink` (an engine event plus a transcript entry). The runtime plays it in the open chat or opens the chat like a nudge does (without the shake).
- Add winks to ≥ 3 existing friend scripts (Jess `hamster`, Kayla `hearts`, Pia `pickle`), sensibly placed.
- **Reduced motion:** show the final frame for 1.5 s.
- **Tests:** the transcript entry, engine event, menu and lint.

### P3-05 — Emoticons++

- **New built-ins** (original SVGs, 19 px, in `src/assets/emoticons/`, added to CREDITS as original work): `(dog)`, `(cat)`, `(music)`/`(8)`, `(pizza)`/`(pi)`, `(party)`/`<:o)`, `(sun)`/`(#)`. Extend `EMOTICONS`.
- **Custom emoticons:** `PlayerProgress.customEmoticons: { code: string; fileId: string }[]` (codes are 2–7 chars in square brackets, like `[ponies]`; unique; sanitized).
  - "Create emoticon…" in the chat's emoticon picker (a new "😊 ▾" button that inserts codes into the reply). Since replies are scripted choices, inserted codes are appended to the chosen line before sending, as a "flavor" the player adds.
  - Images come from My Pictures and are cropped center-square, rendered at 19 px.
  - `parseEmoticons` accepts an optional custom list (the runtime passes the player's).
- **Tests:** parsing with custom codes, create/delete, rendering.

### P4-01 — Web Explorer shell + site framework

- **App `browser`** ("Web Explorer"; category internet; pinned; desktop shortcut "Web Explorer"; multi-instance; 800×600):
  - `props.url` sets the initial URL; the default homepage is `http://searchly.example/`.
  - The title is `<page title> - Web Explorer`.
  - **Chrome**, IE6 style in original CSS:
    - a menu bar (File, Edit, View, Favorites, Tools, Help; only Favorites and Help → About do anything; the others can be disabled menus)
    - a toolbar with big Back / Forward / Stop / Refresh / Home buttons (original 24 px SVG icons) and a Favorites button
    - an address bar ("Address" label, the input, a "Go" button with a green arrow)
    - the page viewport (scrollable, white)
    - a status bar (page status text, "Done", a zone label "Internet")
- **Navigation:** typing a URL normalises it (adds `http://`, lowercases the host). Each window keeps its own history stack (back/forward) in component state. Links inside sites use `<SiteLink href>`, which calls the window's navigator via context.
- **Loading:** when navigating, the status bar shows "Opening page http://…" and a progress bar for `scaleMs(400 + random 0–900)` ms (dial-up feel), then the page renders.
- **Offline:** if `network.status !== 'online'`, render the classic "The page cannot be displayed" page (original wording and layout: title, "Most likely causes:", bullet list, "What you can try:", a **Connect** button calling `requireOnline()` then reloading).
- **Unknown hosts** get the same page.
- **`browser:open`** is handled by `src/os/browserRouter.ts`, installed once from `App.tsx`. For each event it calls `useWindowsStore.getState().openApp('browser', { url })` when the app is registered. Apps never import the browser.
- **Favorites:** a persisted `web` store field `favorites: { title; url }[]`, seeded with Searchly, Tinfoil Comets, Spaceport, Westfield High and Celeb Gossip 07. Add/remove via the Favorites menu.
- **Site framework** (`src/apps/browser/sites/`):
  ```ts
  interface SitePageProps { path: string; query: URLSearchParams; navigate(url: string): void }
  interface SiteDefinition { host: string; title: string; description: string; keywords: string[];
    pages: Record<string /* path, '/' = home */, { title: string; keywords?: string[]; component: LazyExoticComponent<ComponentType<SitePageProps>> }> }
  ```
  - A registry `SITES` and `resolve(url) → { site, page } | null`.
  - A tiny placeholder site `about.example` ("Welcome to Web Explorer") proves the framework; later tasks add real sites.
  - Each site has its own CSS module (2000s styles: table layouts, tiled CSS-generated backgrounds, `font-family: 'Comic Sans MS', 'Chalkboard', cursive` fallbacks, `<marquee>`-like CSS animation, beveled buttons).
- **Linkify:** Messenger links (P0-09) already emit `browser:open`. Mail (P4-06) uses the same thing.
- **Tests:** navigation/history, offline page + Connect, the resolve function, `browser:open` opening a window.

### P4-02 — Searchly

`searchly.example`:
- **Home:** a big "Searchly" logo in original playful letters (CSS colours), a search box, the buttons "Searchly Search" and "I'm Feeling Lucky", and a "Searchly Toolbar — download now!" joke link (shows a fake "Installing Searchly Toolbar… 3%" dialog that never finishes).
- **Results** (`/search?q=`):
  - Rank over `SITES` page titles, keywords and descriptions. Tokenise, then score title ×3, keywords ×2, description ×1.
  - 10 per page with "Goooo"-style original pagination ("Searchlyyyyy" with links).
  - Each result: the title link, a green URL, a snippet.
  - "Did you mean:" for one-letter typos against known keywords.
  - No results → a friendly 2007 message with tips.
- Lucky → the top result.
- **Tests:** ranking and the lucky choice. Every registered page must be findable by its title words (a test that iterates `SITES`).

### P4-03 — The cursed fan page

`tinfoilcomets.example`, "The OFFICIAL UNOFFICIAL Tinfoil Comets Fan Page!!!1" made by a superfan "xX_CometGirl_Xx". Pages:
- **`/` (home):**
  - a tiled star background (CSS)
  - a rainbow-gradient title
  - a scrolling news marquee (CSS)
  - **dancing hamsters**: a row of 8 original CSS/SVG hamsters bouncing out of sync
  - an animated "UNDER CONSTRUCTION" sign with a little digger (CSS keyframes)
  - a hit counter in odometer digits that starts at 004,203 and ticks up as you browse (persist `web.counters[host]`, +1 per visit)
  - "Best viewed in 800x600 with Web Explorer 6"
  - a **webring** bar ("◀ Prev | Tinfoil Comets Webring | Random | Next ▶"; links go to the other fictional sites)
  - a "Sign my GUESTBOOK!!" button
  - a 🎵 "Play background MIDI" button that plays an original chiptune loop through Web Audio (`scheduleSound`-style voices; add a small `src/os/chiptune.ts` that plays a looped 8-bar original melody, with Stop)
- **`/band`:** the four members (fictional: Ziggy the drummer is ~28 and does the drumstick spin; the others are invented in the same spirit), the albums (the CD with the robot on the cover), and tour dates including "THIS FRIDAY!!!" (Jess's concert).
- **`/guestbook`:**
  - entries by day from `src/content/sites/tinfoilcomets.ts` (friends sign it on certain days: Jess on day 1 and day 5, Pia "this band is ok but PONIES r better" on day 3, Marco a dry review on day 4)
  - the player can sign it (name, message, "Homepage" field; persisted in `web.guestbook`)
- **`/pics`:** a "photo gallery" of procedural concert pics via `renderPhoto({ scene: 'concert' })`.

Content must pass the lint. Make it lovingly awful: peak 2003 home-made fan site.

### P4-04 — Spaceport profiles

`spaceport.example`, an original social-network homage, "Spaceport: a place for friends in orbit".
- **`/`:** the landing page (sign-up/log-in buttons that just log you in as the player), "Cool New People" (the 6 friends).
- **`/<contactId>` profile pages** (content in `src/content/profiles/<id>.ts`):
  - header with display name, glittery headline, a mood with an emoticon, and "Last Login: <today's date>" (apps can't read Messenger's state)
  - the profile picture (the Avatar pattern rendered via a small local SVG, re-implemented from the seed; don't import Messenger)
  - **profile song**: an auto-showing mini player strip "▶ <Artist> - <Title>" that emits `amplifier:enqueue { trackId, play: true }` on click (no autoplay)
  - "About me", "Who I'd like to meet", interests
  - **Top 8** (other friends plus 2 fictional extras)
  - a **comment wall** with comments by day (≤ current day, newest first)
  - each friend's own garish theme (`theme: { background, text, accent, glitter: boolean, font }`)
  - Example: Kayla pink glitter, Dex grey with skate stickers, Pia pastel ponies, Marco black and minimal, Theo plain default (he never customised it), Jess neon chaos.
- **`/me`:** the player's profile, **editable**: headline, mood, about me, the profile song (dropdown from the playlist), the theme (6 presets + custom background/text colours), Top 8 order. Persisted in `web.myProfile`. Friends leave comments on it on days 2–5 (content in the profiles files: `commentsOnPlayer: { day, text }[]`).
- **Content** (opus): all 6 profiles plus the player comments, in each friend's voice, consistent with their storylines; PG-13; lint.
- **Tests:** profile rendering by day, edits persist, the song button emits enqueue.

### P4-05 — Gossip blog + school site + small sites

- **`celebgossip07.example`:** "Celeb Gossip 07 ★ OMG!!". A gossip blog about **fictional** celebrities (≥ 5 invented: a pop princess, a boy band, a reality-TV heiress, an action star, the Tinfoil Comets themselves). Posts by day (2 per day, days 1–5), tag cloud, a "hot or not" poll that persists your vote, and a comment section from fictional usernames.
- **`westfield-high.example`:** the school site. News board posts by day (the science fair / bio project deadlines from Mr Dalton, the bake sale, the "no MP3 players in class" rule, cafeteria menu jokes), a staff page (Mr Dalton: "Biology, Room 12"), and a hit-counter-free, slightly boring design (the school bought a template in 2001).
- **`virusguard.example`:** a scary-joke antivirus page from the P1-04 balloon ("YOUR COMPUTER IS 87% INFECTED!!! Buy VirusGuard 2007 for only $49.95"). The Buy button shows "Payment system under construction". Make sure it's obviously parody.
- Register all the sites, and add them to Searchly via their keywords and the webring.
- Content lint passes.

### P4-06 — Mail

- **App `mail`** ("Mail"; category internet; pinned; 720×500); needs a connection. Opening while offline shows the folder list and "Working offline. Connect to send and receive." plus Connect.
- **Layout:**
  - a folders pane (Inbox, Sent Items, Deleted Items)
  - a message list (From, Subject, Received, a 📎 icon; unread in bold)
  - a preview pane, rendering text with `splitLinks` (links → `browser:open`) and attachments as chips that save to My Documents or My Pictures via the fs and open them
- **Toolbar:** Create Mail, Reply, Forward, Delete, Send/Recv.
- **Store** `mail` (persisted): `messages: MailMessage[]`, `deliveredDays: number[]`. On sign-in to the connection (`network:connected`) and on Send/Recv, deliver all content mails with `day <= currentDay` not yet delivered, with `receivedAt` = now (minus small random offsets so the list looks natural).
- **Compose:** To (a picker of friends by handle), Subject, Body. Sending to a friend schedules their canned auto-reply after `scaleMs(20_000)` from `autoReplies` in `src/content/mail/autoReplies.ts` (one per friend, in voice; a second send gets a "u know we can just chat right" style line). Sending to anyone else bounces with a "Mail Delivery Subsystem" message.
- **Types:** `src/content/mail/types.ts`: `MailContent { id; day; from: { name; address }; subject; body; attachments?: { name; type: 'txt' | 'image'; text?: string; photo?: PhotoSpec }[] }`.
- **Tests:** delivery by day, read/unread, compose and auto-reply, the bounce, attachment save, the offline state.

### P4-07 — Mail content

`src/content/mail/day1.ts` … `day5.ts`, with ≥ 3 mails per day:
- **Chain letters:** "FWD: FWD: FWD: send this to 10 ppl or u will have bad luck in love!!!" and "FWD: if u dont send this the girl from the well will…" (PG, silly, not scary).
- **Spam:** "U have WON a FREE mp3 player!!!", "Spaceport: 3 people viewed your profile", "Cheap ringtones" (2007, but no smartphones; it's fine for ringtones to exist).
- **Mr Dalton:** project reminders (days 1, 4), the B+ result (day 5).
- **Mom:** "computer rules", "dinner at 6", "who is Dex?".
- **Friends:** Jess's concert itinerary, Marco's gig flyer as an image attachment (`renderPhoto({ scene: 'concert' })` with a caption), Theo's "sorry to email u" note, Pia's "this is pias email now" message.
- **Tinfoil Comets fan club newsletter** linking to `tinfoilcomets.example`.
- **PixelPoint Computers welcome mail** (day 1).

Voices consistent; content lint; PG-13.

### P4-08 — TuneMole

- **App `tunemole`** (category internet; 640×460); needs a connection.
- **Original UI:** a green mole mascot SVG; tabs Search / Downloads / Library; a "Connected to 1,337 peers" status.
- **Search:**
  - over `src/content/tunemole.ts` results: `{ fileName; sizeKb; bitrate; peer; kind: 'track' | 'prank' | 'stall'; trackId?: string }[]`, with keyword matching on the file name and a keywords list
  - fictional peers ("xXdj_kevXx", "skaterboi_dex", "comet_fan_4ever", "~*kayla*~", "mixtape_mike")
  - tracks are only the shipped playlist tracks (with silly file names like `Surf_Shimmy_(LIVE)_(REAL)_.mp3`)
- **Downloads:**
  - progress with jittery speeds (2.1–7.8 KB/s shown), ETAs in "hh:mm:ss", sometimes "Connecting…", "Busy", "Queued"
  - real time is short: ≈ 20–40 s per file × `scaleMs`
  - `stall` files sit at "Awaiting more sources…" forever (deletable)
  - **completed `track` files:** create `audio` fs files in My Music, then emit `amplifier:enqueue { trackId }`
  - **`prank` files** (`totally_not_a_virus.mp3`, `free_ringtones_installer.exe.mp3`): create a txt in My Music; opening it shows a Notepad message from the peer ("lol gotcha. - xXdj_kevXx") and plays `error`
- **Library:** the finished files, with Play / Show in folder.
- Some downloaded tracks trigger a friend's `onNowPlaying` reaction naturally through the Amplifier.
- **Tests:** search, the download state machine with fake timers, fs creation, enqueue, prank, stall.

### P5-01 — Paint

App `paint` (category accessories, pinned, 720×560), an MS-Paint-style classic in original CSS.
- **Tools** (a toolbox on the left, 2 columns, original 16 px icons): free-form select (rect only is fine), pencil, brush (3 sizes), airbrush, eraser (4 sizes), fill bucket (flood fill with tolerance 0), colour picker, magnifier (1×/2×/4×), line, rectangle, ellipse, rounded rectangle (outline/fill modes), text (a simple text box committed on Enter/blur).
- **A colour box** at the bottom: 28 classic-style colours (original palette values close to the 2007 defaults), left-click = primary, right-click = secondary, plus a current-colours indicator.
- **The canvas** defaults to 640×480 white; Image → Attributes changes the size. Undo/Redo ×20 (Ctrl+Z/Ctrl+Y) with `ImageData` snapshots.
- **File menu:**
  - New
  - Open… (FolderView dialog on My Pictures; opens blob images or procedural photos by rendering them)
  - Save / Save As… (PNG → `putBlob` → an fs `image` node with `blobKey` in My Pictures, name `untitled.png` by default)
  - Set As Background (Tiled/Centered) → `settings.wallpaper = custom`
  - "Use as display picture" → sets Messenger's DP through an event: add `messenger:setDisplayPicture { fileId }` to `OsEventMap`; Messenger's runtime handles it
- **Logic** lives in plain TS on a `PixelBuffer { w; h; data: Uint8ClampedArray }` (flood fill, line Bresenham, ellipse, rect, eraser), unit-tested without a canvas. The component blits to a canvas.

### P5-02 — Snapshot Booth

App `photobooth` (category accessories; 560×480).
- **Start screen:** "Snapshot Booth needs your webcam. Your camera stays on this computer — photos are saved only in this browser, nothing is uploaded." Buttons: **Use my webcam** / **No camera — use a cartoon me**.
- **Webcam mode:** `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })` into a `<video>`, drawn to a canvas with the selected filter each frame:
  - Normal
  - Sepia
  - Comic (posterize + edges)
  - Thermal (a false-colour gradient map)
  - Mirror (left half mirrored)
  - Bulge (a simple radial distortion)
  - Glow (bloom)
  - Old Webcam (low-res 160×120 scaled up + noise + a "LIVE" text)
- **Taking a photo:** the **Take Photo** button runs a 3-2-1 countdown (big numbers), a white flash, the `click` sound, then the photo saves to My Pictures (`booth_<n>.png`, via `putBlob`) and appears in a thumbnail strip with "Set as display picture" (the `messenger:setDisplayPicture` event).
- **The camera stops** (all tracks) on window close and when switching modes.
- **Denied or no camera** → explain, then fall back to cartoon mode.
- **Cartoon mode:** a procedural cartoon face (SVG; hair, eyes, mouth chosen by buttons) that the filters apply to the same way.
- **Tests:** mock `getUserMedia` (success, deny), tracks stopped on unmount, filter functions on small ImageData, save.

### P5-03 — Amplifier skins + windowshade

- **Skins:** `skin: 'metal' | 'neon' | 'bubblegum'` in the amplifier persisted store (sanitized).
  - Implement as a `data-skin` attribute plus CSS-module variables overriding the brushed-metal values (backgrounds, LCD colours, button styles).
  - **Neon Night:** black + magenta/cyan glow. **Bubblegum:** pastel pink/blue plastic with rounded buttons.
  - Switch with a skin button "SKN" in the button row that cycles, and via right-click on the titlebar → a "Skins ▸" menu.
- **Windowshade:** double-click the titlebar → a 275×14 strip showing the time + a tiny marquee + play/pause; double-click again to restore. Resize the window via `resizeWindow` like the playlist does; it remembers whether the playlist/EQ were open.
- **Tests:** skin cycling and persistence, the windowshade geometry.

### P5-04 — Amplifier equalizer

- **Audio graph:** extend `src/apps/amplifier/analyser.ts` so the single `MediaElementAudioSourceNode` goes through a chain of 10 `BiquadFilterNode`s (60, 170, 310, 600, 1k, 3k, 6k, 12k, 14k, 16k Hz; peaking, Q 1.4, gains −12..+12 dB) plus a preamp gain, then the analyser, then the destination. Build the chain once per audio element (the existing "createMediaElementSource only once" rule). When the EQ is off, bypass by setting gains to 0.
- **The EQ panel** (button "EQ"), attached like the playlist (adds height):
  - vertical sliders for preamp + 10 bands (keyboard accessible)
  - ON and AUTO toggles (AUTO does nothing but light up, like a real skin)
  - a presets dropdown: Flat, Rock, Pop, Dance, Classical, Bass Boost, Treble Boost, "Kayla's Party"
- Persist `eq: { on: boolean; preamp: number; bands: number[] }`.
- **Tests:** chain construction with a fake context, presets, persistence; the playlist + EQ heights stack correctly.

### P5-05 — Amplifier playlist editing + Burn CD

- **Playlist panel:**
  - select a row; Del removes it from the playlist (not from disk)
  - Ctrl+↑/↓ (or drag) reorders
  - **"ADD ▸"** offers "From My Music…" (a FolderView dialog on `music`, audio files only) and "Shipped tracks…"
- The edited playlist persists (as trackIds).
- **`amplifier:enqueue`:** already handled since P0-05. Make sure enqueued tracks respect the edited playlist (append at the end, no duplicates) and persist.
- **"Burn CD…"** (in the playlist's "MISC ▸" menu): a dialog "Burn Audio CD": a drive "(E:) CD-RW", speed "52x". A progress bar goes fast to 37%, then the error "Buffer underrun. The disc is now a coaster." with an OK button and the `error` sound. A second attempt fails at 89% with "Please insert a blank disc". There's no success path (it's a joke).
- **Tests:** remove/reorder/add, enqueue, Burn CD steps.

### P5-06 — More now-playing reactions

For every friend, one more `onNowPlaying` script (id `nowPlaying2`, `repeat: false`). Make it track-specific where it's funny (`trackId` set, e.g. Marco judging "voxel-revolution", Jess losing it to "surf-shimmy"); otherwise generic. In voice, ≥ 3 nodes, one branch. Keep the existing `nowPlaying` scripts. Run the content tests.

### P6-01 — Games store + Mines

- **Store `games`** (persisted):
  - `mines: { best: Record<'beginner' | 'intermediate' | 'expert', { seconds: number; name: string } | null> }`
  - `henhunt: { high: { name; score; date }[] }` (top 10)
  - `pinball: { high: … }` (top 10)
  - helpers `recordScore(game, entry)`, which sanitize
- **App `mines`** ("Mines"; category games; non-resizable; sized to the board):
  - Game menu: New (F2), Beginner 9×9/10, Intermediate 16×16/40, Expert 30×16/99, Custom…, Best Times…, Exit
  - LCD counters for mines left and time (original 7-segment SVG digits)
  - a smiley button with faces 🙂, 😮 (mouse down), 😎 (win), 😵 (lose), drawn in original SVG
  - the classic raised/sunken cell look in CSS, and original SVG mine and flag icons
- **Rules:**
  - the first click is always safe (and opens an area)
  - left-click reveals; zero cells flood-reveal
  - right-click cycles flag → ? → none
  - chord (both buttons, or middle-click, or a click on a revealed number) reveals neighbours when the flags match
  - losing reveals all mines and marks wrong flags
  - winning records the best time (asks for a name, defaulting to the player name) and emits `game:score { game: 'mines', score: seconds, detail: level }`
- The board logic is pure TS, unit-tested with seeded RNG.

### P6-02 — Hen Hunt

App `henhunt` (category games; 800×560; a canvas). An original Moorhuhn-style shooting gallery.
- **The scene:** procedural parallax countryside on 3 layers: far hills with a windmill (its sails turn), mid fields with a scarecrow and haystacks, and a near fence and grass. Pan left/right by moving the mouse near the edges (the world is 2× the viewport width).
- **Hens:** cartoon hens drawn in code (round body, red comb, flapping wings) fly across at 3 depths (far = small and slow = 25 pts, mid = 10, near = big and fast = 5). They sometimes land and peck. A hit makes a feather burst and the hen tumbles.
- **Shooting:**
  - a crosshair cursor; left-click shoots (a shotgun synth: noise burst + low thump)
  - 8 shells shown bottom-right; right-click (or Space) reloads, with a shell-clatter synth and 1 s of reload time
  - a hit-scan on the topmost target
- **Bonuses:**
  - a hen hiding in the windmill window: 50 pts, appears occasionally
  - a golden hen once per round: 100 pts, fast
  - shooting the scarecrow's hat: −25 pts
- **Rounds:** 90 s. A big clock at top-left, the score at top-right, a "Last 10 seconds!" hen-cluck alarm. At the end: a score screen, a name entry if it's a top 10 high score, and `game:score { game: 'henhunt', score }`.
- **The menu screen:** "HEN HUNT" title art, Play / High Scores / Help.
- **Simulation** (spawns, movement, hit tests, scoring) is pure TS with seeded RNG and unit-tested; rendering is separate. Synth sounds use the voice system (add `shot`, `reload` and `cluck` SoundNames if useful; keep each ≤ 2 s).
- **Reduced motion:** a slower game, no screen shake.

### P6-03 — Star Pinball

App `pinball` (category games; 460×640; a canvas), an original space-themed table "Star Pinball".
- **Physics:** pure TS. Fixed timestep 1/240 s, ball radius 8 px, gravity along the table tilt, restitution per material. Walls are line segments and arcs; bumpers are circles with a kick impulse.
- **Flippers:** rotating capsule segments, controlled by Z / left Shift (left) and `/` / right Shift (right), plus clicking the left/right half of the window. They have angular velocity that transfers to the ball.
- **Plunger:** hold Space/↓ to pull back, release to launch.
- Continuous collision via substeps, so there's no tunnelling at max speed (test it).
- **The table:** a launch lane, 3 pop bumpers ("planets"), 2 slingshots, a left ramp (a lane with a gate), 3 rollover lanes at the top (light all = a 2× multiplier), drop targets "S-T-A-R" (all = "Rank up": Cadet → Ensign → Lieutenant → Captain → Admiral), and an outlane drain.
- **Visuals:** a deep-space background with stars and nebula (seeded), neon-lit parts, lights that blink on hits, and a score display above the table in a dot-matrix style.
- **Sounds:** bumper, flipper, launch, drain (synth voices).
- **Game:** 3 balls, ball save for 5 s after launch, tilt with T (nudges the ball; 3 warnings → tilt). On game over: high score entry plus `game:score { game: 'pinball', score }`.
- **Tests:** collision math (circle–segment, circle–circle, flipper sweep), no tunnelling, scoring rules, rank progression.

### P6-04 — Desktop Wrecker

- **App `wrecker`** (category games; `chrome: 'none'`): its component renders a portal to `document.body`, a **full-screen transparent overlay** above everything (a z-index above the Start menu, below the screensaver).
- **The floating tool palette** (draggable, original icons): Hammer, Chainsaw, Flamethrower, Machine Gun, Stamp, Repair, Exit (Esc also exits; exiting closes the window).
- **The damage canvas** covers the viewport and draws on top of the live desktop. Nothing underneath is actually changed.
- **Tools** (each with its own cursor drawn in canvas, its own synth sound, and an animation):
  - **Hammer:** click → a radial crack pattern (random branching lines), a thud, a small screen shake (none under reduced motion)
  - **Chainsaw:** hold + drag → a jagged cut path with a dark edge and sawdust particles, a buzzing tone while held
  - **Flamethrower:** hold → flame particles from the cursor; the area under it scorches (a radial dark brown/black with an orange edge, accumulating), crackle noise
  - **Machine Gun:** hold → rapid bullet holes (dark centre, light rim, small cracks) in a spread, shell casings bouncing at the bottom edge, rat-a-tat noise
  - **Stamp:** click → a cartoon "tank tread" or "BOOM!" stamp alternating, with a cartoon "boing"
- **Repair:** a "glass sweeps away" wipe animation clears the canvas.
- **Tests:** the tool state machine, damage generator functions (seeded, pure), Esc closing, the overlay unmounting cleanly.

### P6-05 — Fluff the sheep

`src/os/pet/`, an overlay. Toggle it from a tray icon (a little sheep head; `settings.petEnabled`, default false). On day 2, Stapley or a balloon says "Click the sheep in the tray to meet Fluff!" (balloon id `meet-fluff`).
- **Behaviour** as a state machine in pure TS, ticked at 20 Hz:
  - **walk:** along the current surface left/right at 30 px/s, turning at edges or randomly
  - **fall:** when the surface ends, with gravity, landing on the next surface below; if none, the taskbar
  - **sit, sleep** (after 30 s still: Z's), **graze** (nibbling animation), **baa** (a short synth bleat on a click; add a `baa` SoundName ≤ 1 s)
  - **drag:** pointer-grab it; release → a thrown arc with velocity
- **Surfaces:** the top edge of the taskbar, plus the top edges of visible, non-minimized windows' title bars, from `useWindowsStore` geometry (x, y, w; maximized ones are ignored). Recompute each tick; if a window moves while Fluff stands on it, Fluff moves with it.
- **Art:** an original cute fluffy sheep, about 40×32, drawn in SVG with simple frame animations (legs alternate, wool bob, blink).
- Fluff ignores pointer events except on itself.
- **Reduced motion:** Fluff sits still on the taskbar and blinks.
- **Tests:** the state machine (walk → edge → fall → land, sleep timer, drag/throw), surface computation from window geometry.

### P6-06 — Stapley

`src/os/assistant/`, an overlay. `settings.assistantEnabled` defaults to true.
- **Stapley:** an original cartoon stapler character (SVG: a stapler body with big googly eyes, eyebrows, a little arm), idle animations (blink, eyebrow raise, look around).
- **Position:** bottom-right above the taskbar; draggable.
- **Speech balloon:** the classic yellow help-balloon look, with options as blue bullet links.
- **Tips** in `src/content/assistant.ts`: `{ id; trigger: { app?: AppId; event?: 'newDay' | 'idle' | 'firstBoot' | 'notepadLetter' }; text; options?: { label; action: 'dismiss' | 'never' | 'openApp:<id>' }[] }`:
  - Notepad text starts with "Dear" → "It looks like you're writing a letter. Would you like help?" (options: "Get help with writing the letter", which only says "lol no", / "Just type the letter without help" / "Don't show me this tip again")
  - opening Paint → "Did you know? You can set your masterpiece as your desktop background!"
  - Mail → "Never open attachments from strangers. Unless they say FWD 6 times."
  - Mines → "Tip: the numbers are not a phone number."
  - day ≥ 2 → "Click the sheep in the tray to meet Fluff!"
  - idle 3 min → a random joke from a list of 8 (2007 computer jokes, original)
  - first boot → "Hi! I'm Stapley. I hold things together. Need help?"
- Each tip shows once (`settings.seenTips`), except the idle jokes, which cycle.
- **Options:** "Hide Stapley" (in a right-click menu or the balloon) sets `assistantEnabled = false`. It's re-enabled from the Start menu → All Programs → Accessories → "Stapley" (a tiny pseudo-app entry that toggles it on; implement as an app with no window that toggles and closes immediately, or a menu action; choose the simplest that fits the registry and note it).
- **Tests:** trigger matching, show-once, never, hide/show, content lint.

### P6-07 — Game reactions

- **Trigger:** `{ type: 'onGameScore'; game: 'mines' | 'henhunt' | 'pinball'; minScore?: number }`. The engine method is `gameScore(game, score)`; the runtime wires `game:score` to it. It fires matching eligible scripts with context `{ game, score }`, and adds the placeholders `{score}` and `{game}`, allowed only in `onGameScore` scripts (update the lint).
- **Content:** each friend gets one reaction (opus content):
  - Jess: Hen Hunt ("OMG {score}?? my record is like 400 lol")
  - Kayla: Mines ("mines is SO stressful i cant even")
  - Dex: Star Pinball (slow, "nice. i got 2 million once. maybe")
  - Theo: Mines (impressed, apologetic)
  - Marco: Hen Hunt, dry
  - Pia: Pinball, bossy, "i am better"
- **Tests:** trigger + placeholders, lint, playthrough support.

### P7-01 — Accessibility pass

Extend `tests/e2e/a11y.spec.ts` with axe checks for Explorer, Display Properties, the dial-up dialog, Web Explorer (Searchly, the fan page, a profile), Mail, TuneMole, Paint, Snapshot Booth (cartoon mode), Mines and Message History. Fix serious and critical violations. Canvas games need an `aria-label` and a text alternative describing the game state ("Score 120, 6 shells"). Document keyboard paths for Mines, Paint, Web Explorer and Mail in the done note.

### P7-02 — Performance pass

- Every app is `React.lazy` (registry), every site page is lazy, and wallpapers render lazily.
- Initial JS ≤ 250 KB gzip: check the `vite build` output and add a small Node script `scripts/check-bundle.mjs` that fails over budget, plus an npm script `size`.
- Canvases (screensaver, games, Fluff, Wrecker, Booth) pause their `requestAnimationFrame` loop when the window is minimized, `document.hidden`, or the overlay is off. Add a shared `useAnimationFrame(callback, active)` hook in `src/os/` and test it.
- No memory leaks: object URLs revoked, media tracks stopped, intervals cleared (spot-check with tests).

### P7-03 — README, screenshots, release notes

- **README:** update "What's in it" with every v0.2 feature, grouped (Desktop, Messenger, Internet, Creative, Games). Update "Planned" to what's left. Add a screenshot grid (extend `tests/e2e/screenshots.spec.ts` `@screenshots` to save `docs/screenshots/{desktop,messenger,amplifier,browser,spaceport,paint,mines,henhunt}.png`). Keep the disclaimer, license and credits links. Mention that the webcam stays local.
- **`docs/release-notes-v0.2.0.md`:** highlights, what's new by area, known issues, credits pointer.
- **CREDITS.md:** every new icon/SVG listed as original work (a glob row per folder is fine).

### Gate notes for P7-G

On top of the Gate procedure: play through 3 in-game days with `?speed=fast`, using the Turn Off → power on loop, and check that each day brings new chats, mail, guestbook and profile comments. Then write `docs/review/P7.md` with a final summary of v0.2. Do not tag, push or release.

---

# Visual reference (Luna Blue approximations — implement as CSS variables)

| Token | Value | Use |
|---|---|---|
| `--xp-face` | `#ECE9D8` | window body, dialogs |
| `--xp-titlebar-from` / `--xp-titlebar-to` | `#0058EE` / `#3A93FF` (gradient top→mid→bottom darker `#0050D0`) | active titlebar |
| `--xp-titlebar-inactive` | `#7A96DF` → `#A6BBEB` | inactive titlebar |
| `--xp-taskbar-from` / `--xp-taskbar-to` | `#245EDC` / `#1941A5` | taskbar gradient |
| `--xp-start-from` / `--xp-start-to` | `#3C9A3C` / `#2F7D2F` | start button |
| `--xp-tray` | `#0F8BEF` → `#0C59B9` | notification area |
| `--xp-selection` | `#316AC5` | selected icon/menu highlight |
| `--xp-startmenu-left` / `--xp-startmenu-right` | `#FFFFFF` / `#D3E5FA` | start menu columns |
| `--xp-desktop-text-shadow` | `1px 1px 1px #000` | desktop icon labels |
| `--msn-accent` | `#7BA4D9` (light blue chrome), `#E6EEF8` (panels) | messenger |
| `--amp-bg` / `--amp-lcd` | `#2A2A33` / `#00E000` on `#000` | amplifier skin |

Corner radius on titlebars is 8px top-left/top-right. Taskbar height 30px. Start menu ~380×480.

# Notes for the owner

- **Run it:** `igris arise P0 --through P7` inside herdr or tmux (`igris.toml` sets yolo mode, auto-commit and 5 verify attempts). Nothing is pushed or tagged.
- **Afterwards, review:** `docs/review/P0.md` … `P7.md` (with screenshots), `docs/decisions.md`, and `docs/release-notes-v0.2.0.md`. Then push, check the live site, and tag `v0.2.0`.
- **Webcam:** Snapshot Booth asks the browser for camera access only when you click "Use my webcam". Photos stay in your browser.
- **Your own wallpaper:** Display Properties → Desktop → Browse… lets you use any image you own (stored only in your browser).
- igris can still stop for: verify failing 5× in a row, a crashed session, editing this file mid-run, or a session idling without `igris done` after its reminder.
