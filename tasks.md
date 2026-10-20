# still online — v0.6 plan (phones and tablets)

<!-- igris:format 1 -->

This is the build plan for still online v0.6, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file** and in the design spec it points to. Read the whole brief, the global rules, the v0.6 touch rules and your task's spec before starting. Earlier plans (all done) are archived in `docs/plans/` (`v0.1-tasks.md` … `v0.5-tasks.md`).

```sh
igris check --strict          # validate this plan
igris arise M0 --through M4   # run everything (yolo mode is the default in igris.toml)
```

---

# Project brief

still online is a browser-based nostalgia simulator: an XP-style desktop frozen in **2007**, bilingual (English and German).

**Shipped so far (v0.1–v0.5.1):**
- the shell
- Messenger with 6 scripted friends and a 10-day living world
- Amplifier
- a fictional internet: Web Explorer, Searchly, Mail, TuneMole and the sites, including Friendspace, Pixlog, GlitterCodez, CheatCave and Kickflip Kings
- Paint, Snapshot Booth, four games, Fluff and Stapley
- full German localization
- the player as a girl or a boy

All of it assumes a mouse and a big screen. Phones and tablets only get a "best experienced on a desktop computer" notice.

**This plan (v0.6, phases M0–M4)** makes **everything work on phones and tablets**, with the **same XP desktop** adapted for touch:
- On a phone, every window is full-screen, a tap opens things, a long-press is right-click, and controls are finger-sized.
- On a tablet, windows keep floating and the controls get touch-sized.

**The agreed design is binding:** `docs/superpowers/specs/2026-10-20-v06-touch-design.md`. Read it before you start. The "v0.6 touch rules" below condense it.

## Explicitly out of scope (do NOT build these)

- A separate phone UI, app grid or launcher. It is the XP desktop everywhere.
- An app-store wrapper, PWA install or offline service worker.
- New content, apps, sites, games or story days.
- Pinch-zoom of the whole shell. Only Web Explorer's Fit to screen / Actual size and the game `ScaleToFit` scale things.
- Changing desktop behaviour at 1280×800, beyond the window re-clamp on resize.
- Smartphones, apps or touch screens inside the fiction. The story stays in 2007.
- New runtime dependencies.
- Tagging, pushing or publishing a release.

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
  - The OS is unnamed. Its product name is **still online** (`APP_NAME` in `src/os/brand/brand.ts`), the same in every language.
  - Don't write "Windows", "MSN" or "Winamp" in the UI.
- **All characters are fictional.** Use no real people or celebrities, and no real email addresses. Contact handles use the fictional domain `@livemail.example`.
- Songs and bands mentioned in chats, sites, mails and files are fictional too, unless they are tracks actually shipped in `public/music/`.
- **The fictional web uses only the reserved `.example` TLD** (`searchly.example`, `friendspace.example`, …). Never write a real-looking domain (`.com`, `.net`, …), even as a joke. Email addresses use `@livemail.example` for friends and `@<site>.example` for others (e.g. `mr.dalton@westfield-high.example`).
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

## Defaults for ambiguous situations (from v0.2; still valid unless "v0.4 rules" says otherwise)

| Question | Default |
|---|---|
| Player's name | Required on the login screen (no default, max 20 chars), stored in settings. Their messenger handle is `<lowercased-name-no-spaces>@livemail.example`. |
| In-game date/time | Real local time of day, real month/day, **year forced to 2007**. Implemented once in `src/os/clock.ts` (`now(): Date`). If the date is Feb 29, use Feb 28. |
| Font | `Tahoma, Verdana, 'Segoe UI', sans-serif`, 11px base (xp.css default). Don't ship font files. |
| Icons | Hand-written SVG, 32×32 (desktop) and 16×16 (taskbar/menus), simple glossy XP-ish style. One SVG per icon in `src/assets/icons/`. |
| Wallpaper | Default stays the current CSS rolling hill; v0.2 adds procedural homages (P1-01). No photos are shipped. |
| Sounds | Synthesized at runtime with Web Audio oscillators/envelopes in `src/os/sound.ts`. No audio files needed for UI sounds. |
| Storage | `localStorage`, keys prefixed `still-online:v1:`; on a version mismatch, discard and start fresh. **v0.3 and v0.4 do not bump the version:** shape changes migrate inside each store's `sanitize` so v0.2 saves survive. |
| Animations | Short (≤ 250ms), except boot (~3s) and the nudge shake (~500ms). |
| Window defaults | New windows open cascaded (+24px x/y from the last one, wrapping), min size 240×140, never fully off-screen (keep ≥ 40px of titlebar visible). |
| Unknown visual detail | Match the XP "Luna Blue" look as closely as possible in original CSS. Use the tokens in "Visual reference" below. |
| Unclear test scope | Unit-test every store action and engine function. Add one Playwright happy path per user-visible feature. |
| v0.2 app names (final) | Explorer windows: "My Documents", "My Pictures", "My Music" (app `explorer`) · Display Properties (`display`) · Connect to the Internet (`dialup`) · Disk Cleanup (`diskcleanup`) · Message History (`messenger-history`) · Web Explorer (`browser`) · Mail (`mail`) · TuneMole (`tunemole`) · Paint (`paint`) · Snapshot Booth (`photobooth`) · Mines (`mines`) · Hen Hunt (`henhunt`) · Star Pinball (`pinball`) · Desktop Wrecker (`wrecker`) · Fluff (desktop sheep, overlay) · Stapley (assistant, overlay) |
| Window sizes | Explorer 520×380 · Display Properties 400×440 (fixed) · Connect to the Internet 360×260 (fixed) · Disk Cleanup 380×300 · Message History 520×420 · Web Explorer 800×600 · Mail 720×500 · TuneMole 640×460 · Paint 720×560 · Snapshot Booth 560×480 · Mines: sized to its board · Hen Hunt 800×560 · Star Pinball 460×640 · Desktop Wrecker: full-screen overlay |
| Idle | Screensaver after 5 min (setting; 0 = never). Messenger auto-Away after 5 min idle (setting). Idle = no pointer/keyboard/wheel input on the page. |
| Art | Everything is drawn in code: SVG, CSS, or canvas with seeded randomness so it's identical every run. No new binary image/audio files, except player data in IndexedDB. Use `mulberry32(seed)` (add it to `src/os/random.ts` in P0) for seeded randomness. |
| World day | Starts at 1. Story content covers days 1–10 (v0.5; days 1–5 before); from day 11 on, friends keep their day-10 presence and only ambient content runs. Don't name weekdays for story days (the tray shows the real date); say "today", "yesterday", "Day 3". |
| Online | Messenger sign-in, Web Explorer, Mail and TuneMole need a connection. When offline they call `requireOnline()`, which opens "Connect to the Internet" and **dials automatically** ("Connect automatically" is on by default). Dialing takes ~6 s, scaled by `scaleMs`. The connection is not persisted: every boot starts offline. |
| Fictional text | Run new authored text through the shared content lint (P0-09). Sites, mails, files and profiles follow the same voice rules as chats: 2007, PG-13, fictional people only. |
| Game scores | Games emit `game:score` on the event bus; best scores persist in the `games` store. |

## i18n rules (v0.3; apply to every task)

**Architecture (fixed by P0; follow it, don't redesign it):**

```
src/i18n/
  types.ts           # Locale = 'en' | 'de'; LOCALES; Messages type (derived from en.ts)
  detect.ts          # detectLocale(languages: readonly string[]): Locale
  messages/en.ts     # SOURCE OF TRUTH: nested `as const` catalog, one top-level key per area
  messages/de.ts     # `export const de: Messages = {…}` — TypeScript forces every key
  t.ts               # t(key, params?) for non-React code; reads useSettingsStore.getState()
  useT.ts            # useT() hook: re-renders when settings.language changes
  format.ts          # Intl-based formatTime / formatLongDate / formatShortDate / formatDateTime / formatNumber
src/content/de/      # German content, mirroring src/content/ (see "Content per locale")
```

- **Keys** are dot paths into the catalog, e.g. `t('startMenu.allPrograms')`, `t('messenger.status.away')`. They are type-checked (a `MessageKey` union of all leaf paths). One top-level area per folder: `boot`, `login`, `desktop`, `taskbar`, `startMenu`, `wm`, `balloon`, `fs`, `apps` (titles/labels per app id), `messenger`, `browser`, `mail`, `tunemole`, `dialup`, `notepad`, `paint`, `photobooth`, `display`, `diskcleanup`, `mycomputer`, `amplifier`, `mines`, `henhunt`, `pinball`, `wrecker`, `pet`, `assistant`, `regional`, `sites.<host>`, `common` (OK, Cancel, Apply, Yes, No, Close, …).
- **Values** are strings with `{param}` placeholders, or functions `(p) => string` when grammar needs it (plurals, German cases). Example: `files: (p: { n: number }) => p.n === 1 ? '1 Datei' : `${p.n} Dateien``.
- **No user-visible string literal stays in a component or module** after its P1 task, except: the product name (`APP_NAME` from `src/os/brand/brand.ts`), proper nouns from content (friend names, track titles, hosts), and text the player typed. `aria-label`, `title`, `alt`, `placeholder`, `confirm()`/`alert()` text, canvas text and SVG `<text>` count as user-visible.
- **Language state:** `settings.language: Locale | null` (persisted). `null` = not chosen yet → the effective locale is `detectLocale(navigator.languages)`. Read it only through `useLocale()` / `getLocale()` from `src/i18n/`. `App.tsx` keeps `document.documentElement.lang` in sync.
- **Live switching:** changing the language never reloads the page. Every view that shows text must re-render on change (use `useT()`/`useLocale()`; for non-React caches, subscribe to the settings store).
- **Persist ids and params, never rendered text.** Anything saved that the game generated (chat lines, presence messages, mails, file names/bodies of seeded files, window titles, default favorites, settings defaults) is stored as an id/reference + params and rendered at view time in the current locale. Only text the **player typed** is stored as text. (P0-04/P0-05 build this; later tasks must keep it.)
- **Dates and numbers:** only through `src/i18n/format.ts` (which uses `now()` from `src/os/clock.ts` for "now"). Never `toLocaleString('en-US')`, never hand-built month/weekday names. German: 24-hour clock (`15:07`), `Sonntag, 14. Oktober 2007`, `14.10.2007`, `1.234` thousands separator.
- **Tests:** `src/test/setup.ts` loads German once and pins `language: 'en'` before every unit test, so English assertions keep working. A test that checks German sets `useSettingsStore.setState({ language: 'de' })` itself. Playwright's default project uses `locale: 'en-US'`; German specs use `test.use({ locale: 'de-DE' })`. Every new UI task adds at least one German assertion.
- **Catalog parity:** `src/i18n/catalog.test.ts` (P0-02) asserts `en` and `de` have identical key sets and that every `{param}` used in an English string also appears in the German one. Never silence it.

**Content per locale:**
- English content stays where it is (`src/content/**`). German content lives in `src/content/de/**` with the **same ids**.
- **Contacts are text overlays.** `src/content/de/contacts/<id>.ts` exports a `ContactOverlay` (type defined in P0-01, merged by P0-06): `displayName?`, `personalMessage`, `awayReply?`, `days?` (personal messages), and `scripts: { [scriptId]: { [nodeId]: { lines: string[]; choices?: { text: string; label?: string }[] } } }`. Delays, triggers, nudges, winks, unlocks and the node graph come from the English module. `getContacts(locale)` merges them.
- **Structural parity is mandatory** (enforced by `src/content/parity.test.ts`): same scripts, same nodes, **same number of lines per node and choices per node**, same placeholders per line. Cultural localization happens *inside* a line (rephrase, swap a reference, merge two short sentences into one line), never by adding or removing lines. This is what lets old chats re-render in the new language.
- Everything else (files, mail, profiles, sites, balloons, assistant tips, TuneMole results) is a full German module of the same type, keyed by the same ids (or same array order where items have no id). Accessors: `getSeedFiles(locale)`, `getMailContent(locale)`, `getProfiles(locale)`, `getSiteText(host, locale)`, `getBalloons(locale)`, `getTips(locale)`, `getTuneMoleResults(locale)`.
- The content lint runs per locale (P0-06): the shared rules (`.example` only, no real TLDs including `.de`, no brands) plus a German anachronism list.

## German defaults (v0.3; final — use these exact terms)

| English | German |
|---|---|
| start · All Programs · Log Off · Turn Off Computer · Shut Down · Restart · Cancel | Start · Alle Programme · Abmelden · Ausschalten · Ausschalten · Neu starten · Abbrechen |
| Accessories · Games · Internet · Entertainment · System Tools | Zubehör · Spiele · Internet · Unterhaltung · Systemprogramme |
| My Computer · My Documents · My Pictures · My Music · Recycle Bin · Control Panel | Arbeitsplatz · Eigene Dateien · Eigene Bilder · Eigene Musik · Papierkorb · Systemsteuerung |
| Notepad · Paint · Display Properties · Disk Cleanup | Editor · Paint · Eigenschaften von Anzeige · Datenträgerbereinigung |
| Connect to the Internet · Message History · Snapshot Booth · Regional and Language Options | Mit dem Internet verbinden · Nachrichtenverlauf · Fotobox · Regions- und Sprachoptionen |
| Mines · Hen Hunt · Star Pinball · Desktop Wrecker | Minen · Hühnerjagd · Sternen-Flipper · Desktop-Randale |
| Fluff (sheep) · Stapley (stapler assistant) | Flocke · Tacki (original name; never "Karl Klammer") |
| Messenger · Web Explorer · Mail · Amplifier · TuneMole | unchanged (brand names) |
| Untitled - Notepad · untitled - Paint | Unbenannt - Editor · Unbenannt - Paint |
| File · Edit · View · Favorites · Tools · Help | Datei · Bearbeiten · Ansicht · Favoriten · Extras · ? |
| New · Open… · Save · Save As… · Exit · Undo · Cut · Copy · Paste · Delete · Select All | Neu · Öffnen… · Speichern · Speichern unter… · Beenden · Rückgängig · Ausschneiden · Kopieren · Einfügen · Löschen · Alles markieren |
| Minimize · Maximize · Restore · Close | Minimieren · Maximieren · Wiederherstellen · Schließen |
| OK · Cancel · Apply · Yes · No · Browse… | OK · Abbrechen · Übernehmen · Ja · Nein · Durchsuchen… |
| Online · Busy · Be Right Back · Away · On the Phone · Out to Lunch · Appear Offline · Offline | Online · Beschäftigt · Bin gleich zurück · Abwesend · Am Telefon · Zum Essen · Als offline anzeigen · Offline |
| Friends · School · Family | Freunde · Schule · Familie |
| "<name> says:" · "<name> just sent you a nudge!" · "Sign in" | "<name> sagt:" · "<name> hat dir einen Nudge geschickt!" · "Anmelden" |
| "It is now safe to turn off your computer." | "Sie können den Computer jetzt ausschalten." |
| "The page cannot be displayed" | "Die Seite kann nicht angezeigt werden" |
| "To begin, click your user name" | "Klicken Sie auf Ihren Benutzernamen, um zu beginnen" |
| Address (browser) · Go · Back · Forward · Refresh · Home | Adresse · Wechseln zu · Zurück · Vorwärts · Aktualisieren · Startseite |
| Tagline "everyone you knew, still online" · "2007 Edition" | "alle, die du kanntest – still online" · "2007 Edition" |
| Language names in pickers | Always in their own language: "English", "Deutsch" (never translated) |
| Tray badge | `EN` / `DE` |

- **Tone:** system UI (Start menu, dialogs, Explorer, Display Properties, errors) uses the formal **"Sie"** like German XP did. Friends, sites, mail from friends, Tacki and Fluff use **"du"**. Games use „Sie" (v0.3.1).
- Typography: German quotes „…" in content and UI prose; `…` for ellipses; no ASCII substitutes for umlauts (write ä ö ü ß, never ae/oe/ue/ss) except where a friend's chat voice deliberately types that way.
- Hosts, email domains and friend handles stay identical in both languages (`westfield-high.example`, `jess@livemail.example`). What a site calls itself is localized (`westfield-high.example` → „Westfield-Gymnasium").
- There is no default player name (v0.3.1). Messenger away message default: `brb` / `bin gleich wieder da`. Screensaver marquee default: `still online...` (same in both).

---


## v0.4 rules (apply to every task)

**Lazy German (v0.3.1; keep it):**
- Only English is bundled.
- All German content and the German catalog are reachable **only** through `src/content/de/bundle.ts`, which `loadLocale` (`src/i18n/load.ts`) imports dynamically. Never import a `src/content/de/**` module or `src/i18n/messages/de.ts` from app code.
- New German modules are added to `bundle.ts`'s `content` object, and their English twins to `EN` in `src/content/locale.ts`. Both are typed by `LocaleContent`; extend that interface.
- Accessors stay synchronous (`contentFor(locale)`); German falls back to English until loaded.
- `src/test/setup.ts` loads German once, so unit tests can use `contentFor('de')` directly.
- `tests/e2e/i18n-detect.spec.ts` guards that English players never fetch the German chunk.

**German placeholders until P4:**
- P0–P3 tasks that add a content module also add its German twin under `src/content/de/**` as a **placeholder copy**: a structural copy of the English data, `export const X: T = structuredClone(EN_X)` or a spread literal, with `// P4 replaces this with German`. That wires it into `bundle.ts` and the parity tests.
- P4 replaces every placeholder with real German and adds "differs from English" assertions to `src/content/fallback.test.ts`. Until then, German screenshots may show English content in the new sites. That's expected; note it in gate reviews.
- UI strings are different: every new UI string goes into `en.ts` **and** `de.ts` (real German) in the same task. The catalog parity test requires it.

**Persistence:**
- All new saved state lives in the existing `web` store (`src/apps/browser/store.ts`, key `still-online:v1:web`), except Top 8 reaction bookkeeping, which lives in the Messenger store (see P0-03).
- New fields are **optional**, each sanitized on its own with fallback to the default (the existing `sanitize*` pattern). v0.3 saves must load unchanged, and `STORAGE_VERSION` is not bumped.
- Persist ids and params, never generated text.

**Cross-app:**
- `src/apps/browser/**` (all sites) and `src/apps/messenger/**`/`src/apps/amplifier/**` never import each other. They talk through `src/os/events.ts`; add typed events there.
- `src/os/**` stores (settings, fs, world, blobStore) may be imported by any app.

**Safety:**
- Layout codes and all content render as React text or through the existing `sites/rich.tsx` inline formatter.
- No `dangerouslySetInnerHTML`, no `style` strings built from player text. Only validated values from fixed sets, plus `#rgb`/`#rrggbb` colours, reach `style`.

**Names (final):**

| Thing | EN | DE |
|---|---|---|
| MySpace homage | Friendspace (`friendspace.example`) | Friendspace |
| Netlog homage | Pixlog (`pixlog.example`) | Pixlog |
| Layout site | GlitterCodez (`glittercodez.example`) | GlitterCodez |
| wall · comments | wall · comments | Pinnwand · Kommentare |
| bulletins | Bulletins | Bulletins |
| Top 8 | Top 8 | Top 8 |
| kudos · give kudos | kudos · give kudos | Kudos · Kudos geben |
| visitors · who visited my profile | visitors · who visited my profile | Besucher · Wer war auf meinem Profil |
| shouts | shouts | Shouts |
| layout code(s) | layout code(s) | Layout-Code(s) |
| photo album(s) | album(s) | Album/Alben |
| skin | skin | Skin |

**Gender rules (from G-02 on; apply to every later task, P0–P5 included):**
- **Settings:**
  - `settings.gender: 'girl' | 'boy' | null` (null only before the first choice; it resolves as `'girl'`).
  - `settings.userPicture: string | null` (null = the gender's default tile).
  - Read them only through `getGender()`/`useGender()` (`src/i18n/settingsText.ts`).
- **Authoring:**
  - `g(girl, boy)` from `src/content/gender.ts` writes both versions into **one string**, inline in template literals when only a word differs.
  - `gendered({ girl, boy })` is for non-string values (e.g. a `PhotoSpec`).
  - **Never** branch on gender in components for content text; put the variant in the content.
  - UI catalog strings that need it take a `gender` param (function leaves).
- **Content contract:**
  - Use a variant for anything addressed to or about the player: compliments, nouns for the player, crush talk, topics aimed at the player.
  - The friends' own lines about themselves stay the same.
  - Both sides share ids, line/choice counts, days, links and story facts.
  - No nesting; both sides non-empty.
  - German may vary where English doesn't, and uses natural gendered forms through `g()` („Heldin/Held", „die/der Beste", „Lieblingscousine/Lieblingscousin", „Partnerin/Partner"). Never gender-star forms.
- **Flavour:**
  - A **girl** gets girly 2007: glitter, pastel, hearts, crush on Theo, sleepovers, gossip.
  - A **boy** gets boyish 2007: games, cheats, skating, wrestling, funny clips, band names, dark/skater/gamer looks.
  - A boy has **no crush** anywhere.
  - Per-gender defaults (profile presets, skins, favorites, featured items) put the player's side first. Nothing is hidden from the other gender; both can find every site and layout.
- **Accessors:**
  - `contentFor(locale, gender)` and the `getX(locale, gender)` accessors return resolved content.
  - Persisted state keeps ids and references only, so a gender switch re-renders like a language switch.
  - Files the player edited (`dirty`) keep their text.
- **Tests:**
  - Lint, parity and the playthrough cover girl/boy × en/de.
  - `src/test/setup.ts` pins `gender: 'girl'`.
  - A test that checks the boy side sets `useSettingsStore.setState({ gender: 'boy' })` itself.
  - Every task that adds player-facing content adds at least one boy assertion.

**Defaults that changed since v0.3 (these override older text in this file):**
- **Player name:** required on the login screen. There is no default name and Log On is disabled while it's blank. Messenger handle: `<lowercased-name-no-spaces>@livemail.example`.
- **German games UI** says „Sie" like all system UI. Only friends, sites, Tacki and Fluff say „du".
- **Login language:** a radio group of flag buttons (UK flag = English, German flag = Deutsch).
- **Login gender (from G-01):**
  - A radio group "I am a: Girl / Boy" („Ich bin: Mädchen / Junge") below the name.
  - Log On is disabled until the name and gender are set.
  - The User Accounts app changes the name, gender and picture later.
- **Phase G is not bound by "German placeholders until P4":** every G task writes real German in the same task, as v0.3 did. G-01 stores its new fields in the **settings** store, not the `web` store; that is the one exception to "Persistence" above.


---

## v0.5 rules (story and content rules from v0.5; still valid)

**German:**
- **Phase F** writes real German in the same task, as v0.3 did.
- **W1 and W2** follow "German placeholders until P4", read as "until W3":
  - Every new English content module, mail day or contact script gets a structural German placeholder (`// W3 replaces this with German`).
  - Contact overlays may copy the English text as a placeholder.
- **W3** replaces every placeholder. The gates W1-G and W2-G note English in German screenshots as expected.

**Story days:**
- Days 1–10 are story days. Day-gated content uses `day` 1–10, and `after: { day }` states may point at days 6–10.
- Day-5 content never changes meaning. Week two continues it; nothing is retconned.
- Facts from days 1–5 stay true:
  - Jess caught the drumstick with her forehead.
  - Kayla and Brianna signed a peace treaty.
  - Stardust is home.
  - The bean cellar gig had 11 people.
  - Theo got a B+.
  - Dex's video is 30 seconds long.
- **The week-two story bible** (`docs/story-week2.md`, written in W0-02) is binding for W1–W3. If the bible and the design spec disagree, follow the bible.

**Gender (G2 rules continue):**
- Every line about or addressed to the player uses `g()` where a boy and a girl would be told something different.
- Every task that adds player-facing content:
  - keeps `npm run gender-audit` green
  - adds allowlist entries only with a real reason, never on a choice
  - adds boy assertions
- A boy is a guy friend: teasing, games, skating, music, (Y), never an insider at a girls' sleepover, no hearts aimed at him.
- A girl gets girly 2007 and the slow Theo crush.
- `forGender` threads have only one side and no `g()`.

**Photo date stamps (from F-03):**
- Story photos give `day` in their `PhotoSpec`, and the stamp then reads `'07 10 <7 + day>` (day 1 = `'07 10 8`, day 10 = `'07 10 17`).
- Photos without `day` keep the seeded stamp.

**Testing:**
- Per-day unit tests loop over `STORY_DAYS` (W0-01 exports it), never a literal 5 or 10.
- e2e reaches a day with `setDay(page, n)` (W0-01), never by hand-writing localStorage in a spec.


## v0.6 touch rules (apply to every task in this plan; they override older text above)

**Device class (M0-01 builds it; everyone uses it):**
- `src/os/device.ts` exports `getDevice(): 'phone' | 'tablet' | 'desktop'`, a `useDevice()` hook, and sets `data-device` on `.desktop-root`. It updates live on `resize` and `orientationchange`.
- `phone` = `innerWidth < 600 || innerHeight < 500`. `tablet` = not phone and `matchMedia('(pointer: coarse)')`. `desktop` = everything else.
- **Never** detect devices any other way: no user-agent sniffing, no new breakpoints. CSS uses `[data-device='phone']` / `[data-device='tablet']` selectors on the root, not new `@media` width queries.
- **Gestures are decided per event** by `pointerType === 'touch'`, never by device class.

**Touch primitives (M0-02 builds them):**
- `useLongPress` (500 ms, cancelled by a 10 px move, fires the context-menu handler at the touch point, suppresses the following click) and `useActivate` (mouse double-click, touch single tap, or Enter), both in `src/os/touch/`.
- Every new double-click or context-menu interaction uses them, so nothing is mouse-only.

**Sizes:**
- On a phone, every tap target is at least 36×36 px. Taskbar buttons are 40 px.
- On a tablet, title bars are 36 px, resize grips have 16 px touch zones, and the taskbar is 40 px.
- The desktop keeps every v0.5 size (30 px taskbar and title bar). The "Visual reference" values are the desktop values.

**Windows on a phone:** they render maximized (`effectiveMaximized = maximized || device === 'phone'`). Never write that into the windows store: stored geometry must survive a trip from desktop to phone and back.

**No horizontal page scroll** on a phone or tablet anywhere, except inside Web Explorer's "Actual size" and inside a canvas or game area that scrolls on purpose.

**The keyboard:** the work area height comes from `visualViewport.height` (M0-01). A focused text input is never hidden behind the on-screen keyboard.

**Desktop stays identical:** every existing desktop e2e spec must pass unchanged. When a phone or tablet change touches shared CSS, scope it under `[data-device=…]`.

**i18n:** every new UI string goes into `en.ts` and `de.ts` (real German, system UI uses „Sie") in the same task. Use the terms in the design spec's i18n table.

**Testing:**
- **Projects:** M0-01 adds the Playwright projects `phone` (Chromium + `devices['Pixel 7']`), `phone-landscape` (Chromium, 915×412, `hasTouch`, `isMobile`) and `tablet` (Chromium, 1024×768, `hasTouch`, `isMobile`).
- **Tags:**
  - A spec for a touch project is tagged `@phone` (it runs in `phone` and `phone-landscape`) or `@tablet`.
  - The desktop project `chromium` excludes `@phone` and `@tablet`.
  - `@review` and `@screenshots` stay opt-in for every project.
- **Helpers:** touch specs use the helpers from M0-01 (`tap`, `longPress`, `swipe`, `logInTouch`, `openAppTouch`). They never `dblclick` and never hand-write localStorage (use `setDay`).
- **Verify:** `npm run e2e` runs all four projects, and every task with Verify `e2e` must leave all of them green.

**Screenshots in gates:** phone 412×915 (portrait) and 915×412 (landscape), tablet 1024×768, desktop 1280×800. Each is taken in English and German, as before.

---

# Phases

## M0 — Touch foundations

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M0-01 | **Device class + viewport + test projects** — `src/os/device.ts`, viewport meta, safe areas, shell touch CSS, `visualViewport` work area, re-clamp on resize, remove `SmallScreenNotice`, Playwright `phone`/`phone-landscape`/`tablet` projects + touch helpers, docs. | — | ready | opus | agent | — | e2e | — | `data-device` is right for 412×915, 915×412, 1024×768 touch and 1280×800; the notice and its setting are gone (old saves load); windows re-clamp after a resize; the 4 projects run with the tag rules; one `@phone` and one `@tablet` smoke spec pass; desktop suite unchanged; unit tests. | §M0-01 |
| M0-02 | **Touch primitives** — `useLongPress`, `useActivate`; applied at every double-click open and context menu (desktop, folder view, Messenger list, Amplifier, title bar, Stapley); Amplifier long-press Move up/down/Remove; Paint long-press secondary colour; EN + DE. | M0-01 | blocked | opus | agent | — | e2e | — | No `onDoubleClick`/`onContextMenu` left without a touch path (grep in §M0-02); a tap opens a desktop icon, a folder item and a Messenger chat in the `phone` project; long-press opens the desktop and Stapley menus; mouse behaviour unchanged; unit tests for both hooks. | §M0-02 |

## M1 — Touch shell

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M1-01 | **Window manager** — phone: render-only maximize, Max/Restore hidden, 36 px title bar and buttons, no drag/grips, min sizes capped; tablet: 36 px title bar, 16 px grip zones, oversize windows open maximized. | M0-02 | blocked | opus | agent | — | e2e | — | Every app opens full-screen on a phone and restores its stored desktop geometry at 1280×800; on a tablet windows drag and resize by touch; HenHunt opens maximized on a tablet; tests. | §M1-01 |
| M1-02 | **Shell pieces** — 40 px taskbar, icon-only window buttons, tray "Show hidden icons" chevron, Start menu + All Programs on tap, desktop icon reflow, toasts/balloons/Stapley/dialogs sized, login stacked, screensaver touch dismiss; EN + DE. | M1-01 | blocked | opus | agent | — | e2e | — | On a phone: log in, open Start → All Programs → Mines, switch windows from the taskbar, open the hidden tray icons, toggle the language; nothing overflows at 412 or 360 px wide; tablet + desktop unchanged where specified; tests. | §M1-02 |
| M1-G | **M1 gate (self-review)** — Gate procedure + Touch rubric; the shell on phone (portrait + landscape), tablet and desktop. | M1-01, M1-02 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v06-M1.md` + screenshots (login, desktop, Start menu, All Programs, taskbar with 4 windows, tray chevron open, a toast, Stapley, a dialog) per device, EN + DE, girl + boy once; fixes made. | §Gate |

## M2 — Apps on touch

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M2-01 | **Messenger, Mail, folders, system apps, Notepad, TuneMole** — phone layouts per the design spec. | M1-G | blocked | opus | agent | — | e2e | — | On a phone: chat with Jess with the keyboard open and the input visible, read and reply to a mail with Back, browse My Documents, change the picture in User Accounts, write in Notepad, download a track in TuneMole; no horizontal scroll; tests. | §M2-01 |
| M2-02 | **Web Explorer** — 800 px virtual width with Fit to screen / Actual size (persisted), condensed toolbar, Favorites sheet; every site checked on day 1 and day 10. | M2-01 | blocked | opus | agent | — | e2e | — | Every site in `SITES` renders in Fit to screen on a phone with no horizontal page scroll and working links/forms (Searchly search, a Tinfoil Comets guestbook entry, Friendspace `/me` edit + Save, a Pixlog album); Actual size scrolls sideways; desktop browser unchanged; tests. | §M2-02 |
| M2-03 | **Paint, Snapshot Booth, Amplifier** — Paint strip + phone canvas size + one-finger draw / two-finger scroll; Booth stacked + front camera; Amplifier full-width touch player. | M2-02 | blocked | opus | agent | — | e2e | — | On a phone: draw a line, fill, pick a secondary colour by long-press, save and reopen a picture; take a Booth photo with the cartoon fallback; play, pause and skip in Amplifier and reorder the playlist by long-press; tests. | §M2-03 |
| M2-G | **M2 gate (self-review)** — Gate procedure + Touch rubric; every app on phone (portrait + landscape) and tablet. | M2-01…M2-03 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v06-M2.md` + a screenshot of every app per device (phone portrait, phone landscape, tablet), EN + DE, plus four sites on a phone; fixes made. | §Gate |

## M3 — Games and the full phone playthrough

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M3-01 | **Games on touch** — `ScaleToFit`; Pinball scaled; HenHunt tap-to-shoot + drag-to-pan; Mines pointer events + flag mode + long-press flag; Wrecker Reset/Spin buttons; EN + DE. | M2-G | blocked | opus | agent | — | e2e | — | On a phone each game is fully playable by touch: Pinball flips and launches, HenHunt hits a hen and pans, Mines opens and flags (both ways) and wins a seeded board, Wrecker uses every tool; scores still saved; desktop controls unchanged; tests incl. `ScaleToFit` mapping. | §M3-01 |
| M3-02 | **Easter eggs + the phone playthrough** — Konami swipe, Fluff by touch; then play day 1 as a girl in English and day 10 as a boy in German on a phone and fix everything that blocks or looks broken. | M3-01 | blocked | opus | agent | — | e2e | — | The swipe code unlocks what the key code unlocks; Fluff can be dragged and petted by touch; `tests/e2e/v06-playthrough.spec.ts` (`@phone`) covers both playthroughs; every fix logged in `docs/decisions.md`. | §M3-02 |
| M3-G | **M3 gate (self-review)** — Gate procedure + Touch rubric; games and the playthrough on phone and tablet. | M3-01, M3-02 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v06-M3.md` + screenshots of each game per device, EN + DE; fixes made. | §Gate |

## M4 — Release v0.6

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M4-01 | **v0.6 e2e + docs** — release flows per device; README ("Play on your phone", gap removed, phone screenshot); `docs/architecture-v0.6.md`; `docs/release-notes-v0.6.0.md` (EN + „Auf Deutsch"). | M3-G | blocked | sonnet | agent | — | e2e | — | `tests/e2e/v06-*.spec.ts` pass in the default run on all four projects; README and notes list user-visible changes; architecture note explains device class, touch hooks, `ScaleToFit` and the browser zoom. | §M4-01 |
| M4-G | **Release-ready gate (self-review)** — Gate procedure + Touch rubric; phone portrait day 1 girl EN, phone landscape day 6 boy DE, tablet day 10 girl EN, desktop regression. **Do not tag, push or release.** | M4-01 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v06-M4.md`; bundle sizes reported vs v0.5 (German stays lazy); nothing pushed or tagged. | §M4-G |

---

# Task specs

Full descriptions for every task. The row's Acceptance cell always applies too, and so does the design spec (`docs/superpowers/specs/2026-10-20-v06-touch-design.md`). When a spec and the existing code disagree about a detail the spec doesn't care about, follow the code's existing pattern.

## Specs

### Gate — Gate procedure (all phase gates)

`<ver>` is `v06`. File names use the lowercase phase, e.g. `tests/e2e/v06-m1.spec.ts` and `docs/review/v06-M1.md`.

1. Run `npm run verify` and `npm run e2e` (all four projects) and fix any failure.
2. Add happy-path specs for the phase's main flows, using the touch helpers from `tests/e2e/helpers.ts`:
   - `tests/e2e/<ver>-<phase>.spec.ts`: `@phone` tests, plus `@tablet` tests where the phase changed the tablet
   - one desktop test that proves the 1280×800 behaviour is unchanged
3. Write `tests/e2e/<ver>-review-<phase>.spec.ts`, tagged `@review`:
   - It saves the screenshots named in the gate's row to `docs/review/<ver>-<phase>/`, at the sizes in "v0.6 touch rules", named `<nn>-<what>-<device>-<en|de>.png`.
   - It collects console errors and page errors and asserts there are none.
   - Run it with `npx playwright test --grep @review` (with `--project` per device).
4. **Look at every screenshot** with your image-reading tool and fix the obvious problems:
   - broken layout, overlap or cut-off text
   - horizontal scrollbars
   - tiny tap targets
   - missing icons or unstyled elements
   - anything that looks un-XP-like or breaks the asset rules
5. Review the phase's code against the Acceptance cells of its tasks. Do missing work that is small (≤ ~30 min); list larger gaps as follow-ups.
6. Write `docs/review/<ver>-<phase>.md`:
   - what was built
   - how to try it: `npm run dev`, then Chrome DevTools device mode, or a real phone on the same network with `npm run dev -- --host`, mentioning `?speed=fast`
   - the screenshots, linked
   - fixes made in this gate
   - known gaps and follow-ups
7. Re-run verify + e2e, then `igris done`. Don't push.

**Touch rubric (every M gate):**
- **Targets:** every tap target is at least 36×36 px on a phone, and 40 px in the taskbar. Measure a sample with `boundingBox()` in the review spec.
- **Hover:** no feature is reachable only by hover, double-click, right-click or keyboard. Each has a tap or long-press path.
- **Scrolling:** no horizontal page scroll, except in Actual size or a deliberate canvas or game area.
- **Keyboard:** the on-screen keyboard never hides the focused input. In Playwright, emulate it by shrinking the viewport height while focused.
- **Orientation:** portrait and landscape both work, and a rotation mid-use keeps the open windows usable.
- **Desktop:** 1280×800 looks and behaves as in v0.5. Compare one screenshot against `docs/review/v05-W4/`.
- **XP look:** it still looks like the XP desktop, just bigger where fingers need it. There is no flat "mobile app" styling.

**Bilingual checks in every gate:**
- Take each screenshot **twice**, once with `language: 'en'` and once with `'de'` (suffix `-en`/`-de`), and look at both. German strings are longer, so check them for overflow at 360 px.
- `catalog.test.ts`, `parity.test.ts` and `fallback.test.ts` must be green.

**Gender check:** at least one screenshot set per gate as a boy. Touch changes must not change any content.

### M0-01 — Device class, viewport and test projects

- **`src/os/device.ts`:**
  - `getDevice()`, a zustand-backed `useDevice()` (or `useSyncExternalStore`), and `installDevice(target = window)`.
  - It listens to `resize`, `orientationchange` and `visualViewport` `resize`, and sets `document.querySelector('.desktop-root')?.dataset.device`. Do this from `App.tsx`, where `.desktop-root` renders.
  - Rules exactly as in "v0.6 touch rules". Without `matchMedia` (jsdom), `pointer: coarse` is false.
  - Export `DEVICE_PHONE_MAX_WIDTH = 600` and `DEVICE_PHONE_MAX_HEIGHT = 500`.
- **`index.html`:** the viewport meta becomes `width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content`.
- **Global CSS** (`src/os/theme/global.css`):
  - `touch-action: manipulation`, `-webkit-touch-callout: none` and `-webkit-tap-highlight-color: transparent` on `.desktop-root`.
  - `user-select: text` and `-webkit-touch-callout: default` on `input`, `textarea` and `[contenteditable]`.
  - Safe-area custom properties: `--safe-top/right/bottom/left` from `env(safe-area-inset-*, 0px)`. M1 uses them.
- **Work area:**
  - `viewportWorkArea()` (`src/os/store/windows.ts`) uses `visualViewport.height` when present, else `innerHeight`, minus the taskbar height.
  - The taskbar height becomes device-aware through one function, `taskbarHeight(device)`: 30 on desktop, 40 on phone and tablet. M1-02 changes the taskbar itself; M0-01 only adds the function and uses it in the work area. Keep `TASKBAR_HEIGHT` as the desktop constant.
- **Re-clamp:**
  - A windows-store action `reclampAll()` runs every window through `clampPosition` and caps `w`/`h` to the work area.
  - `installDevice` calls it, debounced by 100 ms, on resize. It is a no-op when nothing changes, so desktop e2e stays the same.
- **Remove `SmallScreenNotice`:**
  - Delete the component, its CSS and its test, and unmount it from `App.tsx` and the overlay slot.
  - Remove `smallScreenNoticeDismissed` and `dismissSmallScreenNotice` from the settings store and its types. The sanitizer must ignore the field in old saves; add a test with a v0.5 save that has it.
  - Remove the catalog keys in EN and DE.
  - The README line about small screens stays until M4-01.
- **Playwright** (`playwright.config.ts`):
  - **Projects:**
    - `chromium` (desktop, `grepInvert` also excludes `@phone|@tablet`)
    - `phone` (`...devices['Pixel 7']`, `grep: /@phone/`)
    - `phone-landscape` (`...devices['Pixel 7']`, `viewport: { width: 915, height: 412 }`, `grep: /@phone/`)
    - `tablet` (`viewport: { width: 1024, height: 768 }`, `hasTouch: true`, `isMobile: true`, `deviceScaleFactor: 2`, `grep: /@tablet/`)
  - All on Chromium; no WebKit or Firefox downloads.
  - Keep the existing `@review` and `@screenshots` opt-in logic working for every project. When the CLI asks for `@review`, the touch projects still restrict to their own tag combined with it. Implement it as a small function and comment it.
- **Helpers** (`tests/e2e/helpers.ts`):
  - `tap(locator)` uses `locator.tap()`.
  - `longPress(page, locator, ms = 600)` dispatches touch pointer events via `page.touchscreen` or CDP `Input.dispatchTouchEvent`.
  - `swipe(page, from, to)`.
  - `logInTouch(page, opts)`: the same as `logIn`, but tap-only.
  - `openAppTouch(page, name)`: tap the desktop icon (it works after M0-02) or use the Start menu.
  - Until M0-02 lands, `openAppTouch` uses the Start menu.
- **Smoke specs:** `tests/e2e/v06-m0.spec.ts` with one `@phone` test (log in by touch, `data-device="phone"`, the desktop renders, no notice) and one `@tablet` test (`data-device="tablet"`).
- **Docs:** `docs/touch.md` (short): the device classes, the rules, the test projects and how to try on a real phone (`npm run dev -- --host`). Add a `docs/decisions.md` line.

### M0-02 — Touch primitives

- **`src/os/touch/useLongPress.ts`:**
  - Returns pointer handlers (`onPointerDown/Move/Up/Cancel`) plus `onContextMenu` passthrough.
  - It acts only for `pointerType === 'touch'` (and `'pen'`). After 500 ms (`LONG_PRESS_MS`; not scaled by `scaleMs`, because it is a human gesture) it calls `handler({ clientX, clientY, target })`.
  - A move of more than 10 px (`LONG_PRESS_SLOP`), a lift or a cancel aborts it.
  - It calls `navigator.vibrate?.(10)`, and swallows the next `click` on the same element when it fired.
  - It also calls `preventDefault` on the native `contextmenu` that Android fires on long-press, so the menu doesn't open twice.
- **`src/os/touch/useActivate.ts`:**
  - Returns `{ onClick, onDoubleClick, onKeyDown }`.
  - A touch `click` (track the last `pointerType` from `onPointerDown`) opens, a mouse `dblclick` opens, and Enter opens.
  - A mouse single click keeps its current meaning, such as selecting.
- **Apply to every site:**
  - Run `grep -rn "onDoubleClick\|onContextMenu" src --include=*.tsx`, excluding tests.
  - **Each real action gets a touch path:**
    - desktop icons
    - FolderView items (both sites)
    - the Messenger contact list
    - the Amplifier playlist and Amplifier's main menu
    - the window title bar double-click (maximize: on a tablet only, since phones are always maximized)
    - the desktop context menu
    - Stapley's menu
  - **`preventDefault`-only sites** (Paint canvas, the games) stay as they are; M3 handles the games.
  - List the result in the done note.
- **Amplifier playlist:** a long-press opens a small XP context menu with Play, Move up, Move down and Remove, reusing the existing menu styling. Mouse drag stays.
- **Paint ColorBox:** a long-press on a swatch sets the secondary colour, as a right-click does.
- **Strings:** add EN and DE for Move up / Move down („Nach oben" / „Nach unten") and any new menu labels.
- **Tests:**
  - Unit tests for both hooks, with fake timers and pointer events with `pointerType`.
  - An e2e spec (`@phone`) where a tap opens My Documents, then a document, and a long-press on the desktop opens its menu.
  - A desktop spec proving double-click still opens and a single click only selects.

### M1-01 — Window manager

- **Phone:**
  - `Window.tsx` reads `useDevice()`. When it is `'phone'`, it renders the maximized class (`effectiveMaximized`) and fills the work area above the 40 px taskbar.
  - Hide the Maximize/Restore button, disable title-bar drag and don't render `ResizeHandles`.
  - Title bar 36 px; Minimize and Close 36×36 with the same XP glyphs, scaled.
  - The stored `maximized`, `x`, `y`, `w` and `h` are never changed by the phone render.
  - Apps with `minSize` or fixed sizes get them capped to the work area on a phone, for layout only.
- **Tablet:**
  - Title bar 36 px and buttons 32 px.
  - Resize grips get an invisible 16 px touch zone, with the visual grip unchanged.
  - Title-bar drag works by touch (pointer events already do; check `touch-action: none` on the bar).
  - In `openApp`, if the default size is larger than the work area, the window opens with `maximized: true`. This is stored, because the user can restore it.
- **Desktop:** unchanged.
- **Tests:**
  - Unit tests: phone render with a stored geometry; tablet oversize-open.
  - e2e:
    - `@phone`: every app in the registry opens full-screen, measured by its bounding box ≈ the work area.
    - `@tablet`: drag a window by the title bar with touch, resize from the corner.
    - Desktop: geometry restored after the viewport goes 412 → 1280.

### M1-02 — Shell pieces

- **Taskbar on phone and tablet:**
  - 40 px tall, with `padding-bottom: var(--safe-bottom)`.
  - **Window buttons:**
    - On a phone they are icon-only, 40×40 px, with the title as `aria-label` and tooltip, in a row that scrolls sideways (no scrollbar shown).
    - On a tablet they keep their labels, min 110 px as today.
  - **Tray on a phone:** shows the language, volume and clock. A „‹" chevron button („Show hidden icons" / „Ausgeblendete Symbole einblenden") opens a small XP flyout above the tray with the network, Fluff and Messenger tray items, and closes on an outside tap.
- **Start menu:**
  - On a phone: `width: min(380px, 100vw)`, `max-height` = work area, and the inner list scrolls.
  - All Programs opens on tap as a full-height panel inside the Start menu, with a Back row, instead of the hover flyout. The hover flyout stays for a mouse.
  - On a tablet: as on desktop, but the flyout also opens on tap. It already has an `onClick`; make sure the hover timer doesn't fight it.
- **Desktop icons:** on a phone the grid uses the screen height (the column wrap uses the work area), with labels at least 11 px. A tap opens (M0-02).
- **Overlays:**
  - Toasts: `width: min(220px, 92vw)`.
  - Balloons: `max-width: min(250px, 92vw)`.
  - Stapley on a phone: `scale(0.8)` from the bottom-right, balloon `max-width: 70vw`, and his drag clamps updated for the 40 px taskbar.
  - XP dialogs (the `.dialog` patterns in Notepad, Paint and the shared ones): `max-width: 94vw`.
  - Fluff: clamps updated for the taskbar height.
- **Login:** on a phone the XP welcome screen stacks vertically (the logo/text above, the account tile and fields below) and stays usable with the keyboard open (the work area from M0-01). The gender and language pickers stay tappable at 36 px.
- **Screensaver:** dismiss on `touchstart` and `pointerdown` as well. The idle tracker already counts `touchstart`.
- **Strings:** EN and DE for Show hidden icons and Back.
- **Tests:** e2e `@phone` covering the Acceptance flow, at 412 and 360 px wide (use `page.setViewportSize` in one test); a desktop screenshot comparison of the taskbar at 1280×800.

### M2-01 — Messenger, Mail, folders, system apps, Notepad, TuneMole

- **Messenger:**
  - The contact list fits a phone.
  - The chat window has the transcript scrolling, the reply buttons wrap to full width, the input and Send are pinned to the bottom, and the winks, nudge and emoticon buttons are 36 px.
  - The emoticon picker fits 92vw.
  - Opening a chat from a toast works by tap.
- **Mail on a phone:**
  - A stacked layout (CSS under `[data-device='phone']` plus a small state flag in the component).
  - The folder pane becomes a `<select>` above the list.
  - The message list is full width; tapping a message shows the reading pane full screen with a Back button ("Back" / „Zurück") in the toolbar.
  - Compose is full screen with To, Subject and Body stacked.
  - Attachments open as before.
- **Explorer, FolderView, My Computer and Recycle Bin on a phone:**
  - Hide the 140 px task pane. Its actions are already in the toolbar; add any missing ones.
  - Icons flow in a grid; Details view becomes a single-column list.
- **System apps:**
  - Display, User Accounts, Regional, Disk Cleanup and Dial-up drop their fixed sizes on a phone (M1-01 makes the window full-screen) and reflow to one column.
  - Tab strips scroll sideways inside the window if needed.
  - Display's wallpaper preview scales.
- **Notepad:** the menu bar works by tap; the text area fills the window; Save dialogs are 94vw.
- **TuneMole:** the search results condense to Title / Artist / a download button. The downloads list wraps.
- **Tests:** an e2e `@phone` spec for each Acceptance flow. Emulate the keyboard by focusing the chat input and setting the viewport height to 500, then assert the input is visible. Unit tests for the Mail phone state.

### M2-02 — Web Explorer

- **Fit to screen** (default on a phone; never on a tablet or desktop, where it is Actual size):
  - The page container lays out at `width: 800px` (`PAGE_VIRTUAL_WIDTH`) and gets CSS `zoom: <container width / 800>`, recomputed on resize with a `ResizeObserver`.
  - Use `zoom`, not `transform`, so hit-testing and scrolling stay native.
  - Vertical scroll stays inside the page container.
- **Actual size:** no zoom; the container scrolls sideways.
- **The toggle:** View menu → „Fit to screen" / „An Bildschirm anpassen" (a checked menu item). Persist it in the `web` store as `fitToScreen?: boolean`, optional and sanitized; the default comes from the device.
- **Toolbar on a phone:**
  - Back, Forward, Refresh and Home as 36 px icon buttons, and the address bar on its own row.
  - The Favorites button opens the favorites as an overlay sheet over the page (the same list component), closed by a tap outside or by choosing a site.
  - Hide the 180 px pane.
  - The status bar stays (20 px).
- **Sites:** no per-site redesign.
  - Go through **every** host in `SITES` (sites/index.ts) on day 1 and day 10, in Fit to screen on a phone.
  - Fix only real breakage: an element wider than 800 px, a fixed-position element, a form field under 16 px font that makes Chrome zoom on focus (set inputs inside the browser page to `font-size: max(16px, 1em)` under `[data-device='phone']`), or a hover-only control.
  - List each site and its result in the done note.
- **Links that open other apps** (mailto-style or the `.example` linkify) work by tap.
- **Tests:** e2e `@phone` covering the Acceptance flows, plus an assertion that `document.scrollingElement.scrollWidth <= innerWidth` on every site. Unit tests for the zoom maths and the `fitToScreen` sanitizer.

### M2-03 — Paint, Snapshot Booth, Amplifier

- **Paint on a phone:**
  - The tool box becomes a horizontal, sideways-scrolling strip at the top, with 36 px tools. The colour box becomes a scrolling strip at the bottom.
  - The menu bar works by tap.
  - A **new** image on a phone defaults to the canvas area's size (rounded down to whole pixels, min 200×200). Saved or opened images keep their size.
  - **Drawing:** one pointer draws. When a second touch pointer goes down, cancel the current stroke (undo it if it already painted) and pan the canvas area with two fingers. Implement it in `useCanvasTools.ts` by tracking active pointers.
  - Secondary colour by long-press (from M0-02).
  - Dialogs are 94vw.
- **Snapshot Booth on a phone:**
  - The preview on top, the controls below, and the photo strip in a sideways-scrolling row.
  - `getUserMedia` asks for `facingMode: 'user'`.
  - The cartoon fallback stays the e2e path.
- **Amplifier on a phone:**
  - The window is the full width (M1-01 handles the window). The skin scales to the width with CSS `zoom`, keeping its look.
  - Buttons are at least 36 px after zoom.
  - The playlist uses the long-press menu (M0-02); the EQ and windowshade stay usable.
- **Tests:**
  - e2e `@phone` for the Acceptance flows: draw by pointer events with `pointerType: 'touch'`, then use the Booth cartoon fallback.
  - Unit tests for the two-pointer cancel logic and the phone canvas size.

### M3-01 — Games on touch

- **`src/os/touch/ScaleToFit.tsx`:**
  - `<ScaleToFit width height>` renders children at their fixed size, scaled with CSS `zoom` (or `transform: scale` plus the mapping, if a canvas needs it) to fit the parent while keeping the aspect ratio, and centred.
  - Export `toStage(clientX, clientY, rect, scale)` for apps that read pointer coordinates. With `zoom`, check `getBoundingClientRect` and `offsetX` behaviour in Chromium and document the choice.
  - Use it on a phone and on any device where the stage doesn't fit.
- **Pinball:** wrapped in `ScaleToFit` (460×640). The existing tap zones must map correctly after scaling. Multi-touch flippers keep working.
- **HenHunt:**
  - `ScaleToFit` (800×540).
  - On touch: tap = aim at the point and shoot; one-finger drag (move > 10 px) pans the view instead of shooting.
  - The hover edge-pan stays for a mouse only.
  - Show the crosshair at the last tap for 300 ms.
- **Mines:**
  - Replace the mouse handlers with pointer events, keeping mouse behaviour identical: left reveals, right flags, both or middle chords.
  - Touch:
    - A tap reveals, or flags when flag mode is on.
    - A long-press (M0-02) flags.
    - A tap on an opened number chords.
  - Add a 🚩 toggle button beside the face (`aria-pressed`, label „Flag mode" / „Markiermodus").
  - Wrap the board in `ScaleToFit` when it is wider than the window (Expert on a phone).
- **Wrecker:** when the last pointer was touch, show two extra palette buttons, Reset (R) and Spin (Space), in EN and DE. Tools 1–5 are already on the palette.
- **Scores** still emit `game:score`.
- **Tests:**
  - e2e `@phone` per game per the Acceptance cell. Use the games' existing seeds or test hooks for a deterministic Mines win.
  - Unit tests for `toStage` and Mines' input reducer.
  - Desktop game specs unchanged.

### M3-02 — Easter eggs and the phone playthrough

- **Konami swipe:**
  - `src/os/konami.ts` gets a swipe matcher: on the desktop background, touch swipes longer than 40 px are classified up, down, left or right; the sequence is U U D D L R L R, then two taps.
  - It unlocks `KONAMI_UNLOCK` with the same first-time announcement.
  - Unit-test the classifier.
- **Fluff:** drag and pet by touch (pointer events already exist; check `touch-action` and the hit area at 36 px minimum).
- **The playthrough** (`tests/e2e/v06-playthrough.spec.ts`, `@phone`):
  1. Day 1 as a girl in English: log in by touch, connect, read every mail, chat with every online friend through to the end of their day-1 script, visit Searchly and two sites from the favorites, open My Documents and a file, change the wallpaper, then Turn Off.
  2. Day 10 as a boy in German: `setDay(page, 10)`, open the show album on Pixlog, set the poster wallpaper, play one Mines game, then chat with Marco.
- Fix everything that blocks the playthrough or looks broken, with tests. Log each fix in `docs/decisions.md`.

### M4-01 — v0.6 e2e and docs

- **Release flows** (`tests/e2e/v06-m4.spec.ts`), all in the default run:
  - phone portrait: log in, a chat, a site, a game
  - phone landscape: Mail and Paint
  - tablet: drag and resize windows, Start menu
  - desktop: unchanged smoke
- **README:**
  - Remove "Mobile and touch layouts" from Known gaps.
  - Add a short "Play on your phone or tablet" section (same desktop, tap/long-press, Fit to screen in Web Explorer).
  - Add one phone screenshot (from M3-G's review images; copy it to the README image folder used by existing screenshots).
  - Update the version line to v0.6.
- **`docs/architecture-v0.6.md`:** the device class, `[data-device]` CSS, the touch hooks, render-only maximize, the work area and keyboard, `ScaleToFit`, browser zoom, and the test projects.
- **`docs/release-notes-v0.6.0.md`:** the same format as `release-notes-v0.5.0.md`, in EN and „Auf Deutsch". Under Known issues, drop "Not designed for phones or tablets" and add any real gaps from the M gates.

### M4-G — Release-ready gate

- Gate procedure + Touch rubric. Play:
  - day 1 as a girl in English on a phone in portrait
  - day 6 as a boy in German on a phone in landscape
  - day 10 as a girl in English on a tablet
  - a desktop regression at 1280×800 (compare with `docs/review/v05-W4/`)
- Report bundle sizes against v0.5 (`npm run build` output). German stays lazy (`i18n-detect.spec.ts` green). The touch code adds no new runtime dependency.
- Write `docs/review/v06-M4.md`. **Do not tag, push or release.**

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


On a phone and a tablet the taskbar is 40px and title bars are 36px (see "v0.6 touch rules"); the values above are the desktop ones.


# Notes for the owner

- **Run it:** `igris arise M0 --through M4` inside herdr or tmux (`igris.toml`: yolo, auto-commit, 5 verify attempts). Nothing is pushed or tagged.
- **Before the run:**
  - read `docs/superpowers/specs/2026-10-20-v06-touch-design.md`
  - push the v0.5.1 commits if you want them live first (not during the run)
- **Afterwards, review:**
  - `docs/review/v06-M1.md` … `v06-M4.md` and their screenshots
  - `docs/decisions.md`
  - `docs/release-notes-v0.6.0.md`
  - try it on a real phone: `npm run dev -- --host`, then open the shown network address
- **Then:** push (GitHub Pages deploys automatically), check the live site on your phone, and tag `v0.6.0` if you want.
- **The old v0.4.1/v0.5 plan** is archived in `docs/plans/v0.5-tasks.md`.
- igris can still stop for any of these:
  - verify failing 5× in a row
  - a crashed session
  - editing this file mid-run
  - a session idling without `igris done` after its reminder
