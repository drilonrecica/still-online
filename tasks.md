# still online — v0.4.1 fixes + v0.5 plan (week two, days 6–10)

<!-- igris:format 1 -->

This is the build plan for still online v0.4.1 and v0.5, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file** and in the design spec it points to. Read the whole brief, the global rules, the v0.4 and v0.5 rules and your task's spec before starting. Earlier plans (all done) are archived in `docs/plans/` (`v0.1-tasks.md` … `v0.4-tasks.md`).

```sh
igris check --strict          # validate this plan
igris arise F --through W4    # run everything (yolo mode is the default in igris.toml)
igris arise F                 # only the v0.4.1 fixes
```

---

# Project brief

still online is a browser-based nostalgia simulator: an XP-style desktop frozen in **2007**, bilingual (English and German).

**Shipped so far:**
- the shell
- Messenger with 6 scripted friends and a 5-day living world
- Amplifier
- a fictional internet: Web Explorer, Searchly, Mail, TuneMole and the sites
- Paint, Snapshot Booth, games, Fluff and Tacki/Stapley
- full German localization
- **v0.4:**
  - the player is a girl or a boy, with a User Accounts app
  - CheatCave and Kickflip Kings
  - Friendspace (the MySpace homage), Pixlog (the Netlog homage) and GlitterCodez
  - **G2**, the boyish pass: a gender audit test and boy-only chat threads (`Script.forGender`)

**This plan:**
1. **Phase F (v0.4.1):** fixes every known gap the v0.4 reviews listed.
2. **Phases W0–W4 (v0.5):** add a **second school week, days 6–10**. It ends with the Velvet Lantern show at the rec hall on day 10.

**The agreed designs are binding; read the ones your task touches:**
- `docs/superpowers/specs/2026-10-19-v05-week-two-design.md` (W0–W4: the arcs day by day)
- `docs/superpowers/specs/2026-10-16-player-gender-design.md` (gender, incl. the G2 addendum)
- `docs/superpowers/specs/2026-10-15-v04-social-design.md` (Friendspace, Pixlog, GlitterCodez)
- `docs/review/v04-*.md` (what v0.4 built and its known gaps; F fixes them)

## Phase F scope (v0.4.1, runs first)

Small fixes only, no new features:
- **Friendspace/Pixlog player profile:** the saved profile no longer freezes default text, the player picture comes from User Accounts, and the page scrolls to the top after Save.
- **Content polish:** the boy diary, the boy favorites order, the boy mood, the timeline wording, British spellings, a German rhyme, „adden".
- **Visual fixes:**
  - story-dated photo stamps
  - the pixel-font digit spacing
  - bulletins in one column
  - Theo's transcript after a language switch
- **Messenger engine:** stale `afterScript` follow-ups from an earlier day no longer arrive after the next day's chat.

## v0.5 scope (W0–W4)

- **W0 (foundations):**
  - story days 1–10 everywhere: lint, balloons, tests, docs
  - an e2e `setDay` helper
  - the week-two story bible
  - three new photo scenes (`stage`, `classroom`, `livingroom`)
  - the `lantern-poster` wallpaper unlock
- **W1 (English chats days 6–10):** all six friends, gender-aware, plus 3 boy-only and 3 girl-only threads.
- **W2 (English mail, sites and social, days 6–10):** mail, the sites, Friendspace and Pixlog.
- **W3:** real German for everything W1 and W2 wrote.
- **W4:** e2e, docs, release notes and the release-ready gate.

## Explicitly out of scope (do NOT build these)

- Story days past 10. From day 11 on, the day-10 state stays.
- New apps, new sites or new games. Player-written comments on friends' walls, photos or blogs; friend requests, messages or groups on the sites.
- Real CSS/HTML in layout codes, or any `dangerouslySetInnerHTML` of player or content text.
- Any backend, real (online) accounts, real networking, real web access or AI-generated text.
- A third gender option, or gender-star forms in German.
- Changing the six friends' personalities to fit a gender. Only what is about or addressed to the player varies, plus `forGender` threads.
- Real product names, logos or brand-alike names. Homages only.
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

## v0.5 rules (apply to every task in this plan; they override older text above)

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


---

# Phases

## F — v0.4.1 fixes

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| F-01 | **Player profile fixes** — Friendspace saves only fields the player typed (defaults resolve at render, old saves migrate), `/me` scrolls to top after Save, Friendspace + Pixlog use the User Accounts picture for the player. | — | done | opus | agent | — | e2e | — | After Save with only a pasted layout, switching to German or to boy changes headline/mood/about to that side's defaults; typed fields stay; v0.4 saves with default text migrate; player picture = User Accounts tile on both sites; tests. | §F-01 |
| F-02 | **Content polish** — boy diary, boy favorites order, boy mood, concert timeline wording, American spellings, German song rhyme, „adden", d2 visitors mail; EN + DE. | F-01 | done | opus | agent | — | fast | — | Every item in §F-02 done or logged as decided; untouched favorites still detected (old order counts); audit + parity + playthrough green; boy assertions. | §F-02 |
| F-03 | **Visual fixes** — story-dated photo stamps (`PhotoSpec.day`), pixel-font digit spacing on reply buttons, bulletins in one column, Theo's transcript after a language switch, Stapley's balloon not covering the browser. | F-02 | done | opus | agent | — | e2e | — | Concert album stamps read `'07 10 11`; „1 obviously" keeps its space; survey bulletins don't wrap under the picture; a language flip mid-chat shows the whole transcript; balloon avoids the active browser window; tests. | §F-03 |
| F-04 | **Stale follow-ups** — `afterScript` follow-ups armed on an earlier day expire when the contact's next `onDay` script starts; docs. | F-03 | done | opus | agent | — | fast | — | Skipping Dex's day-1 follow-ups never delivers them after his day-2 chat; same-day follow-ups unchanged; boy-only threads still fire; engine tests; `docs/content-format.md` updated. | §F-04 |
| F-G | **F gate (self-review) + v0.4.1 notes** — Gate procedure + Gender rubric; `docs/release-notes-v0.4.1.md`. | F-01…F-04 | done | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v041-F.md` + screenshots (`/me` after Save girl→boy, Pixlog `/me` picture, concert album stamp, a reply button with a digit, a survey bulletin); notes written; nothing pushed or tagged. | §F-G |

## W0 — Week-two foundations

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| W0-01 | **Days 1–10 plumbing** — `STORY_DAYS` 1–10 shared, lint range, balloons' vague line from day 11, per-day tests via `STORY_DAYS`, mail `day6`…`day10` modules (empty + DE), e2e `setDay` helper, docs/README. | F-G | done | opus | agent | — | e2e | — | No literal 1–5 day cap left (grep listed in §W0-01); lint accepts day 10, rejects 11; empty day 6–10 modules wired EN + DE; existing specs use `setDay`; all tests green. | §W0-01 |
| W0-02 | **Story bible** — `docs/story-week2.md`: day-by-day beats per friend, mails, sites, social, gender variants, gender-only threads, cross-links, facts table. | W0-01 | done | opus | agent | — | fast | — | Covers days 6–10 for all six friends, Mom, Mr Dalton, every site, Friendspace, Pixlog; every cross-reference named once with its day; girl/boy differences listed; consistent with days 1–5 (facts table). | §W0-02 |
| W0-03 | **Scenes + poster wallpaper** — photo scenes `stage`, `classroom`, `livingroom`; `lantern-poster` procedural wallpaper + unlock id. | W0-01 | done | opus | agent | — | fast | — | Scenes deterministic per seed, in the XP-era photo style; wallpaper renders in Display Properties once unlocked; `CONTENT_UNLOCKS` includes `lantern-poster`; tests. | §W0-03 |

## W1 — English chats, days 6–10

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| W1-01 | **Jess + Kayla, days 6–10** — `onDay` scripts 6–10, presence per day, gender variants, Jess's girl-only threads (day 8 call, day 9 sign workshop) + Kayla's (day 9 outfit); DE placeholders. | W0-02, W0-03 | done | opus | agent | — | fast | — | Bible beats delivered in voice; per-day test (≥ 4 nodes, a real branch, new PM) passes for 6–10; audit green; boy assertions; playthrough green 1–10 × 4 combos. | §W1 |
| W1-02 | **Pia + Theo, days 6–10** — scripts 6–10, presence, gender variants (Theo's girl crush step, boy buddy), Theo's day-10 `lantern-poster` unlock; DE placeholders. | W1-01 | done | opus | agent | — | fast | — | As W1-01; the unlock fires once on day 10 for both genders. | §W1 |
| W1-03 | **Marco + Dex, days 6–10** — scripts 6–10, presence, the 3 boy-only threads (Dex Jam course d8, Marco LAN rematch d7, Marco load-in crew d10); DE placeholders. | W1-02 | done | opus | agent | — | fast | — | As W1-01; boy-only threads never run for a girl; Marco never uses „!"; Dex stays Away. | §W1 |
| W1-G | **W1 gate (content self-review)** — Gate procedure + Content rubric + Gender rubric; read days 6–10 as a girl and as a boy. | W1-01…W1-03 | done | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v05-W1.md` + screenshots (one chat per friend per gender on its key day, EN); fixes made. | §W1-G |

## W2 — English mail, sites + social, days 6–10

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| W2-01 | **Mail days 6–10** — 4–6 mails a day: Mom, Mr Dalton, Westfield High, fan club, CheatCave/Kickflip notices, spam, Friendspace/Pixlog notifications, a chain letter; gender variants; DE placeholders. | W1-G | done | opus | agent | — | fast | — | Per bible; ≥ 4 mails a day; Mom's day-10 mail per gender (no romance for a boy, none on Dex for either beyond the girl's „So THAT is Dex"); audit green; tests. | §W2-01 |
| W2-02 | **Sites days 6–10** — Celeb Gossip 07, Westfield High (election, show listing), Tinfoil Comets (contest, winners, sold out), CheatCave, Kickflip Kings (Jam, views); DE placeholders. | W2-01 | done | opus | agent | — | fast | — | Every site posts on days 6–10 at its days-1–5 rate; cross-links match the bible; `after` states move to day 10 where the story moved; tests per site. | §W2-02 |
| W2-03 | **Friendspace + Pixlog days 6–10** — bulletins, walls, `commentsOnPlayer`, Velvet Lantern band page show + blog, one new album per friend (day-10 show album with `stage`), blog posts, shouts, guestbooks, kudos; DE placeholders. | W2-02 | done | opus | agent | — | fast | — | `lintSocial` green for 1–10; a wall comment every day; 1–2 shouts a day; the show album uses `stage` and day stamps; gender variants on lines to the player; audit green. | §W2-03 |
| W2-G | **W2 gate (content self-review)** — Gate procedure + Content rubric + Gender rubric; English playthrough days 6–10 across mail, sites, Friendspace, Pixlog as girl and boy. | W2-01…W2-03 | done | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v05-W2.md` + day-by-day screenshots; cross-links checked; fixes made. | §W2-G |

## W3 — German, days 6–10

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| W3-01 | **German chats days 6–10** — overlays for every W1 script, presence and gender-only thread; glossary additions. | W2-G | in progress | opus | agent | — | fast | — | No W1 placeholder left in `src/content/de/contacts`; overlay fallback test green; German voices per style guide; natural gendered forms via `g()`; fallback assertions added. | §W3 |
| W3-02 | **German mail, sites, social days 6–10** — every W2 placeholder module. | W3-01 | blocked | opus | agent | — | fast | — | No `W3 replaces` comment left in `src/content/de`; parity + fallback green; audit green in DE. | §W3 |
| W3-G | **W3 gate (German content self-review)** — Gate procedure + German content rubric + Gender rubric; German playthrough days 6–10 as girl and boy. | W3-01, W3-02 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v05-W3.md`; DE screenshots of the key days; fixes made. | §Gate |

## W4 — Release v0.5

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| W4-01 | **v0.5 e2e + docs** — e2e flows from the spec's Testing section; README, architecture notes, `docs/release-notes-v0.5.0.md` (EN + „Auf Deutsch"), screenshots. | W3-G | blocked | sonnet | agent | — | e2e | — | New `tests/e2e/v05-*.spec.ts` pass in the default suite; README says days 1–10; notes list user-visible changes. | §W4-01 |
| W4-G | **Release-ready gate (self-review)** — Gate procedure; play days 6–8 in English as a girl and 9–10 in German as a boy. **Do not tag, push or release.** | W4-01 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v05-W4.md`; bundle sizes reported (German stays lazy); nothing pushed or tagged. | §W4-G |

---

# Task specs

Full descriptions for every task. The row's Acceptance cell always applies too, and so does the design spec named in the brief. When a spec and the existing code disagree about a detail the spec doesn't care about, follow the code's existing pattern.

## Specs

### Gate — Gate procedure (all phase gates)

`<ver>` is `v041` for phase F and `v05` for the W phases (lowercase phase in file names, e.g. `tests/e2e/v05-w1.spec.ts`, `docs/review/v05-W1.md`).

1. Run `npm run verify` and `npm run e2e` and fix any failure.
2. Add one e2e happy-path spec for the phase's main user flows: `tests/e2e/<ver>-<phase>.spec.ts` (lowercase phase, e.g. `v05-w0.spec.ts`), using the helpers in `tests/e2e/helpers.ts`. It runs in the default suite.
3. Write `tests/e2e/<ver>-review-<phase>.spec.ts`, tagged `@review` (already excluded from the default run by `grepInvert`). It saves the screenshots named in the gate's row to `docs/review/<ver>-<phase>/` at 1280×800. Run it with `npx playwright test --grep @review`. Collect console errors and page errors and assert there are none, like the v0.1 review specs.
4. **Look at every screenshot** with your image-reading tool and fix the obvious problems:
   - broken layout or overlap
   - missing icons
   - unstyled elements
   - text overflow
   - anything that looks un-XP-like or breaks the asset rules
5. Review the phase's code against the Acceptance cells of its tasks. Do missing work that is small (≤ ~30 min); list larger gaps as follow-ups.
6. Write `docs/review/<ver>-<phase>.md`:
   - what was built
   - how to try it (`npm run dev` plus steps, mentioning `?speed=fast`)
   - the screenshots, linked
   - fixes made in this gate
   - known gaps and follow-ups
7. Re-run verify + e2e, then `igris done`. Don't push.

**Content rubric** (gates P3, P4, P5, and any gate whose phase added authored text):
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

**Bilingual checks in every gate:**
- Take each screenshot **twice**, once with `language: 'en'` and once with `'de'` (suffix `-en`/`-de`), and look at both.
- Run the P1 leftover-literal check (§P1 common procedure, step 5) over `src/os` and `src/apps`; anything left must be a proper noun.
- `catalog.test.ts`, `parity.test.ts` and (from P2-07) `fallback.test.ts` must be green.

**Gender rubric** (G-G, and every later gate whose phase added player-facing content):
- **Girl vs boy:** play the same day as a girl and as a boy.
  - The girl's stuff is girly 2007.
  - The boy's stuff is boyish 2007, with no crush, no hair clips or outfit talk aimed at him, and no „Mädchen" words for him in German.
  - Nothing reads as "girl text with the nouns swapped"; the boy side has its own jokes and topics.
- **What stays the same:** friends keep their voices and storylines for both, and the story facts (who goes to the concert, the bio project, Dex's video) are the same.
- **German:**
  - It uses natural gendered forms for the player („die Beste" / „der Beste").
  - None of the old neutral workarounds are left where a gendered word reads better.
  - No gender-star forms.
- **Switching gender in User Accounts:**
  - re-renders chats, mail and untouched files
  - edited files keep their text
  - favorites follow only if the player never changed them

**German content rubric** (P4-G and P5-G, on top of the Content rubric):
- Each friend sounds like the German voice in `docs/localization-de.md`, not like a translation. Read 3 random scripts per friend: would a German 15-year-old in 2007 have typed that?
- System UI uses „Sie", friends/Tacki/Fluff use „du"; terms match the "German defaults" table everywhere.
- No anglicisms beyond the allowed list; no English left in DE (except proper nouns, band names, track titles, brand-name apps).
- Umlauts and ß correct; German quotes „…"; no ae/oe/ue substitutes outside deliberate chat voice.
- Storylines still consistent across chat, mail, sites and profiles in German (the glossary in `docs/localization-de.md`).


### F-01 — Player profile fixes

**Default text frozen on Save** (`docs/review/v04-P5.md`, "Known gaps"):
- **The bug:** Save Changes in the Friendspace editor (`src/apps/browser/sites/friendspace/`, `myProfile` in `src/apps/browser/store.ts`) stores the headline, mood and "About me" even when the player only pasted a layout. Those are the girl's English defaults, and they stay after a switch to German or to boy.
- **The fix:**
  - Only fields the player changed are persisted. A field equal to the current default for the current locale and gender is stored as absent.
  - `effectiveProfile` fills absent fields from the defaults at render, like untouched seed files.
- **Migration** in `sanitizeProfile`: a saved headline, mood or about text equal to **any** default (girl/boy × en/de) becomes absent. Other saved values stay.
- `docs/i18n.md` currently says `myProfile` is player data. Change it to "only what the player typed".

**`/me` after Save:** scroll the page to the top (the review screenshots `d1-05`, `d2-03` show it halfway down the wall).

**Player picture:**
- Friendspace and Pixlog build the player's picture from the name (`playerPicture(playerName)` in `src/apps/browser/sites/friendspace/people.ts:34`). Use the effective User Accounts picture instead (`getUserPicture()`, the tiles in `src/os/user/pictures.ts`).
- Render the tile SVG wherever the player's picture shows: `/me`, wall comments by the player, the Pixlog `/me`, visitors, and the Top 8 if the player appears.
- Friends keep their pattern pictures. A switch in User Accounts updates live.

**Tests:**
- the store migration (all four defaults → absent; typed text stays)
- a render test that switches locale and gender after Save
- the picture follows User Accounts
- one e2e: paste a layout, Save, switch to boy in User Accounts, and `/me` shows the boy's default headline

### F-02 — Content polish (EN + DE, real German)

1. **Boy diary** (`diary_age_11.txt`, `src/content/files/recycleBin.ts` `DIARY_BOY` + de): its last four entries are shared with the girl's. Write boy-only ones (skate, Dex, a dumb dare, Pia), with the same entry count.
2. **Boy favorites order** (`src/apps/browser/store.ts` `DEFAULT_FAVORITE_URLS`/`defaultFavoritesFor`):
   - The boy list becomes Searchly, CheatCave, Kickflip Kings, Friendspace, Westfield High.
   - `isUntouchedFavorites` must also accept the **old** boy order (add it as a legacy list) so saved untouched lists still follow the gender.
   - Test it with a v0.4 boy save.
3. **Boy mood:** the Friendspace boy default mood „pumped" with the (8) emoticon becomes a pair that fits, e.g. „bored" with :|, or a games mood. Pick one and make the DE side natural (not „voll motiviert").
4. **Concert timeline:**
   - Jess says „next friday"/„in like a week" (`jess.ts:110`) and „3 more days" in her day-1 status, but the concert falls between days 4 and 5.
   - Make the day-1 wording match: „in 4 days", „OMG 4 more days", or a relative phrase without weekdays. Check her day 2–4 statuses count down consistently (EN + DE).
   - Leave Marco's day-1 rec hall line: it is the **day-10 show** in v0.5 (decisions P2-04).
5. **American spellings** in English player-voiced and friend content: grep `maths`, `colour`, `favourite`, `mum`, `realise`, `organise`, `grey`, `holiday` (as vacation). Fix them, except proper nouns and lines that are deliberately British. `homework_maths.txt` becomes `homework_math.txt`: the seed id stays; check the tests that refer to the name.
6. **German song rhyme:** `meine_songs_fuer_tinfoil_comets.txt`, song 3: „stift / gleich" → a real rhyme.
7. **„adden"**: add it to the allowed anglicisms in `docs/localization-de.md`.
8. **d2 visitors mail** (`d2-pixlog-visitors`): it says „3 new visitors", but the day-2 visitors box lists more. Make the mail count match what the box shows on day 2 for friends (count friends only, or say "new visitors" without a number). Decide, log it, EN + DE.
9. **Minor German wording** from `docs/review/v04-P4.md`: „kicherig" → a more natural girl mood. Keep „emo_kind_93" and „stiefel. das ist ein look".

### F-03 — Visual fixes

1. **Story-dated photo stamps:**
   - Add an optional `day?: number` to `PhotoSpec` (`src/os/fs/types.ts`). `src/os/fs/photos.ts` prints `'07 10 <7 + day>` when it's set, otherwise the seeded stamp.
   - Set `day` on story photos whose day is known: the Pixlog albums (concert = day 4 → `'07 10 11`), Dex's premiere, Theo's cell, etc.
   - Seed photos in My Pictures stay seeded (they are older).
   - Test: `day: 4` → `'07 10 11`.
2. **Pixel-font digit spacing:** on reply buttons, „1 obviously" renders as „1obviously" because the pixel font's „1" glyph eats the following space. Find the font (Messenger reply buttons) and fix the glyph's advance width, or use `word-spacing`. Test by rendering, or in the gate's screenshot.
3. **Bulletins in one column:** long survey bulletins wrap under the floated sender picture. Give the bulletin body a `margin-left` (or `overflow: hidden`) so numbered lists stay in one column (`docs/review/v04-P4.md`).
4. **Theo's transcript after a language switch:**
   - The transcript can stop short of the last line when it re-renders in a longer language (`docs/review/v04-G.md`, `06-theo-chat-girl-de.png`).
   - Find why. Likely the scroll-to-bottom or a height measured before the re-render. Fix it so the last line is visible after a flip.
   - Add a test if it can be unit-tested, otherwise the gate checks the screenshot.
5. **Stapley's balloon** covers the bottom-right of the browser content in every review screenshot.
   - When the browser (or any window) is maximized or covers the balloon's corner, the balloon sits above the taskbar tray but must not cover page content that matters.
   - Pick one: shift it left of the scrollbar and make it smaller, or auto-hide it after its timeout while a browser is focused. Log the choice. Keep the existing "Hide Stapley" behaviour.

### F-04 — Stale follow-ups

- **The problem:**
  - `afterScript` follow-ups (`src/content/types.ts` Trigger docs) are re-armed on each Messenger sign-in when their target already ran.
  - If the player never answered Dex's day-1 follow-ups, they arrive **after** Dex's day-2 chat, e.g. „tmrw for sure" → „tried the kickflip again. landed it 0 times" after he already landed it (`docs/review/v04-G2.md`).
- **The fix** (in `src/apps/messenger/engine/`):
  - An `afterScript` follow-up whose chain started on an earlier world day than the contact's newest due `onDay` script expires when that `onDay` script starts. It's marked as skipped, not run.
  - Same-day chains are unchanged, and so are `forGender` threads hanging off `afterScript: 'dayN'` on day N.
- Persist nothing new unless needed. If a field is needed, add it optional and sanitized, without a version bump.
- **Tests:**
  - Dex: skip the day-1 follow-ups, advance to day 2, and the follow-ups never deliver.
  - A same-day follow-up still fires.
  - The boy-only `afterScript` threads still fire.
- **Unanswered chats from earlier days** (a script awaiting a choice) stay by design. Document both behaviours in `docs/content-format.md`.

### F-G — F gate + v0.4.1 notes

- **Gate procedure:** use `<ver>` = `v041`, the e2e `v041-f.spec.ts`, the review spec `v041-review-f.spec.ts` and `docs/review/v041-F.md`. Apply the Gender rubric to F-01/F-02.
- **Screenshots** (EN + DE):
  1. `/me` after Save, then switched to boy
  2. Pixlog `/me` with the User Accounts picture
  3. the concert album with its stamp
  4. a reply button with a digit
  5. a long survey bulletin
  6. Theo's chat after a language flip
  7. the browser with Stapley's balloon
- **Release notes:** `docs/release-notes-v0.4.1.md`, short, English + „Auf Deutsch", in the v0.3.1 style. Don't tag.

### W0-01 — Days 1–10 plumbing

- **`STORY_DAYS`:**
  - Export `STORY_DAYS = { first: 1, last: 10 }` from one place (`src/content/storyDays.ts`).
  - Use it in `src/content/lintSocial.ts:18` (replace the local constant; message „outside days 1–10"; `lintSocial.test.ts:23` uses 11).
  - Add a `days` key ≤ 10 check to `src/content/lint.ts` (`Contact.days` and `onDay` ≤ `STORY_DAYS.last`).
- **Balloons:** `src/content/balloons.ts:103` and `src/content/de/balloons.ts:78` switch to the vague line from day `STORY_DAYS.last + 1`. Update their doc comments and `src/os/balloon/schedule.test.ts:58`.
- **Types doc:** `src/content/types.ts:42-46` `Contact.days` says "From day 11 on, the day-10 entry stays".
- **Mail:** add empty `day6.ts`…`day10.ts` to `src/content/mail/` and `src/content/de/mail/` and wire both indexes. The empty arrays stay valid until W2-01, so loosen the per-day mail test for days > 5 until W2-01 (with a `// W2-01 tightens this` comment).
- **Per-day tests:** loop over `STORY_DAYS` but keep the days-6–10 expectations off until their content task. Use a helper `contentDays()` that returns 1–5 now. Each W task raises it, and W2-03 finally makes it 1–10.
  - `mail.test.ts:15`
  - `contacts.test.ts:64-81`
  - `pixlog.test.ts:8,32`
  - `profiles.test.ts:36,43`
  - `gossipSchool.test.ts:7,10`
  - `cheatcave.test.ts:8,17`
  - `kickflipkings.test.ts:16`
  - `cheatcave/logic.test.ts:28,67`
  - Document the helper in `docs/content-format.md`.
- **e2e:**
  - Add `setDay(page, n)` to `tests/e2e/helpers.ts`. It writes `still-online:v1:world` like the specs do today, then reloads.
  - Replace the hand-written world writes in `v04-p2`, `v04-p3`, `v04-p4`, `v04-review-p2`, `v04-review-p3` and `v04-review-g`.
  - Day-looping review specs keep 1–5.
- **Docs:** `docs/content-format.md:72`, `README.md:22,86` (say days 1–10 only in W4-01; for now add nothing user-facing), and a `docs/decisions.md` line.

### W0-02 — Story bible

Write `docs/story-week2.md` (≤ 6 pages) from `docs/superpowers/specs/2026-10-19-v05-week-two-design.md`. It is binding for W1–W3.

**Per friend and per day 6–10:**
- the status and personal message
- the beats of the `onDay` script, including what the player can choose
- the girl/boy differences
- any link to a site, file or mail

**Also cover:**
- **Gender-only threads:** 3 boy, 3 girl, with day, trigger (`onDay` or `afterScript: 'dayN'`) and beats.
- **Mail per day:** id, sender, subject, the gist and gender variants.
- **Sites per day:** what each posts.
- **Friendspace:** bulletins, wall comments, `commentsOnPlayer`, and the band page show and blog.
- **Pixlog:** the album per friend with its day, scene and photo count; blog posts, shouts, guestbooks, kudos days.

**A facts table:**
- everything days 1–5 established that week two touches, with file references
- the new week-two facts: dates, counts, names, the Jam placing, the vote tie, the goldfish name, the poster

**Rules for the bible:**
- Read days 1–5 first:
  - every `*-days.ts` file
  - the mails
  - the sites' day-5 states
  - `docs/review/v04-P3.md` and `v04-G2.md`
- Keep every voice. No new main characters; Kev, Brianna, Derek and Mr Dalton already exist. New side characters must be named in the bible.

### W0-03 — Scenes + poster wallpaper

- **Scenes:** add `stage` (a rec hall stage, a low ceiling, string lights, a band silhouette, a raised hand with a pick), `classroom` (a whiteboard, desks, cell drawings on the wall) and `livingroom` (a TV glow, a couch, a VHS stack). Add them to `PhotoScene` and `SCENE_PAINTERS` (`src/os/fs/photoScenes*.ts`), in the existing style, deterministic per seed, with the date stamp.
- **Wallpaper:**
  - `lantern-poster` is a procedural wallpaper of Theo's show poster: a lantern drawing, „VELVET LANTERN · LIVE AT THE REC HALL", hand-lettered look, original.
  - Register it in `src/os/wallpapers/registry.ts` as an unlockable like `ponies`, and add it to `CONTENT_UNLOCKS` (`src/content/types.ts:89`).
  - German title in `de.ts`.
- **Tests:** scenes render; the unlock shows the wallpaper in Display Properties.

### W1 — English chats days 6–10 (W1-01…W1-03)

- **Content per friend** (`src/content/contacts/<friend>-days.ts`):
  - `onDay` scripts `day6`…`day10` and `days` entries 6–10, following the bible.
  - Same density as days 2–5: one script a day, 4–6 nodes, 2–3 choices per branch, a mid-script `personalMessageChange`, about 20–35 contact lines.
- **Gender-only threads:** in `<friend>-boy.ts` / `<friend>-girl.ts` (create the girl files like `dex-boy.ts`), with `forGender`.
- **German:** placeholder overlays (`src/content/de/contacts/<friend>.ts`, `boy-threads.ts`, plus a new `girl-threads.ts`).
- **Tests:**
  - Raise `contentDays()` for contacts to 1–10 in W1-03; until then, test each finished friend's days 6–10 directly.
  - Add boy assertions.
  - The playthrough stays green for days 1–10 × girl/boy × en/de.
- **Voices** (Content rubric): Jess ALL CAPS; Kayla ~*drama*~ and a new PM; Dex slow and always Away; Theo shy and apologising; Marco dry, lowercase, never „!"; Pia bossy and tells mom.
- **W1-02:** Theo's day-10 line carries `unlock: 'lantern-poster'`, once, for both genders.

### W1-G — W1 gate

- **Gate procedure:** `<ver>` = `v05`, with the Content rubric and the Gender rubric.
- **Read every chat:** days 6–10 in full, as a girl and as a boy (English; use the playthrough transcripts, or `?speed=fast`). Fix what reads off.
- **Screenshots** (`-girl-en`, `-boy-en`):
  1. Jess day 9
  2. Kayla day 9
  3. Pia day 10
  4. Theo day 9
  5. Marco day 8
  6. Dex day 9
  7. one boy-only thread
  8. one girl-only thread
- **Note:** German shows English placeholders (expected).

### W2-01 — Mail days 6–10

- **Files:** `src/content/mail/day6.ts`…`day10.ts` per the bible, 4–6 mails a day. Senders and ids follow the existing pattern (`d6-mom-week`, …).
- **Gender variants:** through `g()`/`gendered()`, keeping the same ids, senders and days.
- **Mom's day-10 mail:**
  - girl: „So THAT is Dex. He was very polite. He called me ma'am. Twice."
  - boy: the helmet humour, no romance
- **Tests:** tighten the per-day mail test to 1–10; add boy assertions; DE placeholders.

### W2-02 — Sites days 6–10

- **Posting rate:** each site posts on days 6–10 at its days-1–5 rate (counts in the bible).
  - Celeb Gossip 07: 2 posts a day.
  - Westfield High:
    - 2 a day
    - the class rep election (posters day 7, the tie day 9, co-reps day 10)
    - the rec hall show listing
    - Theo's drawings on the art wall (day 6)
  - Tinfoil Comets: the fan art contest (day 7), the sold-out Lakeview Fairgrounds show (day 8), the winners with Jess second (day 9).
  - CheatCave: news and forum days 6–10 (Theo, Dex, Marco cameos per the bible).
  - Kickflip Kings: the video view counter (41 on day 6), the Westfield Jam (announced day 7, results day 9: Dex third), Kev's clip of Dex's kickflip.
- **`after` states:** move them to day 10 where the story moved, e.g. the tour list in `tinfoilcomets.ts:170` and the crew in `kickflipkings.ts:221,358`.
- **Searchly:** keep indexing the new pages.
- **Tests:** per-site day tests to 1–10; DE placeholders.

### W2-03 — Friendspace + Pixlog days 6–10

- **Friendspace:**
  - bulletins at about 3 a day
  - each friend's wall comments and `commentsOnPlayer` (gender variants)
  - the Velvet Lantern band page: the rec hall show on day 10 and a blog post after it
- **Pixlog** (per friend):
  - one new album with `day` stamps; the day-10 show album uses `stage`, and `classroom`/`livingroom` where they fit
  - blog posts, 1–2 shouts a day, guestbook entries
  - `kudosToPlayer` days
- **Tests:**
  - `lintSocial` covers 1–10.
  - Set `contentDays()` to 1–10 everywhere and remove the `// W2-01 tightens this` comments.
  - The audit stays green.
  - DE placeholders.

### W2-G — W2 gate

- **Gate procedure:** `<ver>` = `v05`, with the Content rubric and the Gender rubric.
- **Playthrough:** play days 6–10 in English as a girl, then as a boy, across mail, every site, Friendspace and Pixlog.
- **Cross-links:** check each one in the bible against the content (a fact mentioned in chat appears on the site that day, or earlier).
- **Screenshots:**
  - per day 6–10: mail inbox and one site
  - day 10: Westfield High election result, the Pixlog show album, Friendspace's Velvet Lantern band page, Theo's poster wallpaper on the desktop

### W3 — German (W3-01, W3-02)

- **What to replace:** every W1/W2 placeholder, with real German in the German voices (`docs/localization-de.md`), natural gendered forms via `g()`, and the glossary terms.
- **Glossary:** add the new terms, e.g. rec hall → „Jugendzentrum" (already in the glossary), class rep → „Klassensprecher/Klassensprecherin", the Westfield Jam, the goldfish's name.
- **Tests:** add fallback assertions ("differs from English") for the new modules, and keep the audit green in DE.
- **W3-02 acceptance:** `grep -rn "W3 replaces" src/content/de` is empty.

### W4-01 — v0.5 e2e + docs

- **e2e `tests/e2e/v05-w4.spec.ts`:**
  1. A girl at day 10 opens the Pixlog show album, finds the poster wallpaper in Display Properties, and sees the Westfield High election result.
  2. A boy at day 10: the same, plus a boy-only thread appears in Messenger.
  3. German: run 1 with `locale: 'de-DE'`.
- **Docs:**
  - README: days 1–10, the week-two features, known gaps.
  - `docs/architecture-v0.4.md`: a short "v0.5" section.
  - `docs/release-notes-v0.5.0.md`: English + „Auf Deutsch", in the v0.4.0 style.
  - Screenshots.

### W4-G — release-ready gate

- **Gate procedure:** `<ver>` = `v05`, with the Content rubric, the German content rubric and the Gender rubric.
- **Play:** days 6–8 in English as a girl, then switch in User Accounts and play days 9–10 in German as a boy, across Messenger, Mail, every site, Friendspace and Pixlog.
- **Bundle sizes:** report the `npm run build` chunk sizes against v0.4. German must stay lazy (`tests/e2e/i18n-detect.spec.ts` green).
- **Do not tag, push or release.**


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

- **Run it:** `igris arise F --through W4` inside herdr or tmux (`igris.toml`: yolo, auto-commit, 5 verify attempts). Run `igris arise F` alone first if you want to ship v0.4.1 before v0.5. Nothing is pushed or tagged.
- **Before the run:** read `docs/superpowers/specs/2026-10-19-v05-week-two-design.md`. It holds the story decisions for days 6–10 (the rec hall show finale, Kayla's election, Pia's hamster, Dex's Jam, Jess's contest, Theo's poster). Change it before W0-02 turns it into the story bible.
- **Afterwards, review:**
  - `docs/review/v041-F.md`
  - `docs/review/v05-W1.md` … `v05-W4.md`
  - `docs/story-week2.md`
  - `docs/decisions.md`
  - `docs/release-notes-v0.4.1.md` and `v0.5.0.md`
- **Then:** push, check the live site, and tag `v0.4.1`/`v0.5.0` if you want.
- **The old v0.4 plan** is archived in `docs/plans/v0.4-tasks.md`.
- **The old stash** "igris P0-02 WIP (before phase G)" can be dropped.
- igris can still stop for any of these:
  - verify failing 5× in a row
  - a crashed session
  - editing this file mid-run
  - a session idling without `igris done` after its reminder
