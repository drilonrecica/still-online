# still online — v0.3 plan (Deutsch)

<!-- igris:format 1 -->

This is the build plan for still online v0.3, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file.** Read the whole brief, the global rules and your task's spec before starting. Earlier plans (all done) are archived in `docs/plans/v0.1-tasks.md` and `docs/plans/v0.2-tasks.md`.

```sh
igris check --strict          # validate this plan
igris arise P0 --through P3   # run everything (yolo mode is the default in igris.toml)
```

---

# Project brief

still online is a browser-based nostalgia simulator: an XP-style desktop frozen in **2007**. v0.1 and v0.2 shipped the shell, Messenger with 6 scripted friends and a 5-day living world, Amplifier, a fictional internet (Web Explorer, Spaceport, Mail, TuneMole), Paint, Snapshot Booth, Display Properties, screensavers, games (Mines, Hen Hunt, Star Pinball, Desktop Wrecker), Fluff and Stapley. Everything is English today.

v0.3 makes the whole computer **bilingual: English and German.**

## v0.3 scope (this plan)

1. **Language selection:**
   - On the very first start the language comes from the browser (`navigator.languages`: any `de*` → German, otherwise English).
   - The login screen has a language picker that is visible **on every visit, before logging on**.
   - After that, the chosen language is used for **everything** until the player changes it.
   - The player can change it later in three places: the login screen, a new **Regional and Language Options** app (Control Panel / System Tools), and an **EN/DE badge in the tray** (click → menu).
   - Switching is live (no reload) and changes everything on screen, **including chats, mails and files that already happened**.
2. **i18n foundation:** typed message catalogs, `t()`/`useT()`, locale-aware date/number formatting, language-neutral persisted state (ids + params, text rendered at view time).
3. **Every UI string in German:** shell, all apps, games (including canvas text), websites' chrome.
4. **All authored content culturally localized into German:** the same 6 friends and storylines, written the way German teenagers chatted in 2007 (German chat-speak, Gymnasium, Klausur, Referat, German chain letters and spam), not a literal translation.
5. **Release v0.3:** bilingual e2e coverage, docs, release notes.

## Explicitly out of scope (do NOT build these)

- Languages other than English and German. (The design must make a third language easy, but don't add one.)
- Any i18n runtime library (react-intl, i18next, …). Build the small typed system described below.
- Translating the product name ("still online"), friend names, the shipped CC BY track titles, or the fictional `.example` host names.
- Any backend, accounts, multiplayer, real networking, real web access or AI-generated text.
- Real product names, logos, sounds or wallpapers. Homages only.
- Mobile-first layout. Keep the existing small-screen notice.
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
  - The OS is unnamed. Its product name is **still online** (`APP_NAME` in `src/os/brand/brand.ts`), the same in every language.
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

## Defaults for ambiguous situations (from v0.2; still valid)

| Question | Default |
|---|---|
| Player's name | Asked once on the login screen (text field, default `Player`, max 24 chars), stored in settings. Their messenger handle is `<lowercased-name-no-spaces>@livemail.example`. |
| In-game date/time | Real local time of day, real month/day, **year forced to 2007**. Implemented once in `src/os/clock.ts` (`now(): Date`). If the date is Feb 29, use Feb 28. |
| Font | `Tahoma, Verdana, 'Segoe UI', sans-serif`, 11px base (xp.css default). Don't ship font files. |
| Icons | Hand-written SVG, 32×32 (desktop) and 16×16 (taskbar/menus), simple glossy XP-ish style. One SVG per icon in `src/assets/icons/`. |
| Wallpaper | Default stays the current CSS rolling hill; v0.2 adds procedural homages (P1-01). No photos are shipped. |
| Sounds | Synthesized at runtime with Web Audio oscillators/envelopes in `src/os/sound.ts`. No audio files needed for UI sounds. |
| Storage | `localStorage`, keys prefixed `still-online:v1:`; on a version mismatch, discard and start fresh. **v0.3 does not bump the version:** shape changes migrate inside each store's `sanitize` so v0.2 saves survive. |
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
- **Tests:** `src/test/setup.ts` pins `language: 'en'` before every unit test, so English assertions keep working. A test that checks German sets `useSettingsStore.setState({ language: 'de' })` itself. Playwright's default project uses `locale: 'en-US'`; German specs use `test.use({ locale: 'de-DE' })`. Every new UI task adds at least one German assertion.
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

- **Tone:** system UI (Start menu, dialogs, Explorer, Display Properties, errors) uses the formal **"Sie"** like German XP did. Friends, sites, mail from friends, Tacki and Fluff use **"du"**.
- Typography: German quotes „…" in content and UI prose; `…` for ellipses; no ASCII substitutes for umlauts (write ä ö ü ß, never ae/oe/ue/ss) except where a friend's chat voice deliberately types that way.
- Hosts, email domains and friend handles stay identical in both languages (`westfield-high.example`, `jess@livemail.example`). What a site calls itself is localized (`westfield-high.example` → „Westfield-Gymnasium").
- Player name default: English `Player`, German `Spieler`. Messenger away message default: `brb` / `bin gleich wieder da`. Screensaver marquee default: `still online...` (same in both).

---

# Phases

## P0 — i18n foundations

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P0-01 | **i18n architecture** — write `docs/i18n.md` and the shared types (`Locale`, `Messages`, `MessageKey`, `ContactOverlay`, transcript/mail/fs reference types); see spec. | — | done | opus | agent | — | fast | — | Doc covers catalogs, detection, live switching, every persisted store's neutral shape and migration, content overlays + parity; types compile; no behavior change yet. | §P0-01 |
| P0-02 | **i18n core** — catalogs, `t`/`useT`, `settings.language` + `detectLocale`, `lang` sync, test pinning, catalog parity test. | P0-01 | done | opus | agent | — | fast | — | `t`/`useT` typed and tested; language persisted, `null` → detection; `<html lang>` follows; unit tests pinned to `en`; `catalog.test.ts` green. | §P0-02 |
| P0-03 | **Locale formatting** — `src/i18n/format.ts` (Intl); `clock.ts` formatters delegate; remove `en-US` hard-codes; locale-aware pinball `formatScore`. | P0-02 | done | sonnet | agent | — | fast | — | EN output unchanged; DE gives `15:07`, `Sonntag, 14. Oktober 2007`, `14.10.2007`, `1.234`; every former formatter call site goes through `format.ts`; tests for both locales. | §P0-03 |
| P0-04 | **Neutral persistence I** — window titles, fs seed nodes + system folders, mail, settings defaults, default favorites, contact groups become ids/params rendered at view time; v0.2 saves migrate. | P0-02 | done | opus | agent | — | fast | — | Each store's saved shape holds no generated English; old saves load without data loss (tests with v0.2 fixtures); switching locale changes titles/folder names/mail/files live. | §P0-04 |
| P0-05 | **Neutral persistence II: Messenger** — transcript entries and presence messages as references, resolved at render time; legacy text entries kept. | P0-04 | done | opus | agent | — | fast | — | Transcript/history/toasts/contact list render from references; `{game}`/`{score}` stored as params; v0.2 transcripts still render; playthrough tests green. | §P0-05 |
| P0-06 | **Content per locale** — accessors, contact overlay merge, `src/content/de/` skeleton, parity test, per-locale lint, Unicode-aware Searchly tokenizer. | P0-05 | done | opus | agent | — | fast | — | `getContacts('de')` etc. work with empty overlays (fallback to EN text); parity test catches structure drift; lint runs per locale; Searchly finds `Müll`/`Größe`. | §P0-06 |
| P0-07 | **Language UI** — login picker (every visit), `regional` app, tray `EN`/`DE` badge with menu; live switching everywhere. | P0-06 | done | sonnet | agent | — | fast | — | Picker changes language before logon and persists; app + tray switch live with no reload; keyboard operable; registry/icons/CREDITS updated; tests in both languages. | §P0-07 |
| P0-G | **P0 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: login with picker (EN + DE), Regional and Language Options, tray menu. | P0-01…P0-07 | done | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/v03-P0/` screenshots; `docs/review/v03-P0.md` written. | §Gate |

## P1 — Every UI string in German

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-01 | **OS shell strings** — boot, login, desktop, taskbar, tray, Start menu, window buttons, balloons, toasts, screensaver, pet, assistant, fs views, off screen, notices; registry titles/labels; shortcuts; wallpaper/theme/saver names. | P0-G | done | sonnet | agent | — | fast | — | No literal UI text left in `src/os/**` and `src/apps/registry.ts`/`src/os/shortcuts.ts`; German per "German defaults"; DE tests for Start menu + desktop. | §P1-01 |
| P1-02 | **Messenger UI strings** — main window, chat window, statuses, groups, emoticon + wink names, transcript templates, history, away dialogs, picture picker, toasts. | P1-01 | done | sonnet | agent | — | fast | — | No literal UI text in `src/apps/messenger/**` (content excluded); DE test of contact list + chat chrome. | §P1-02 |
| P1-03 | **Internet apps strings** — Web Explorer chrome + error page + dialogs, Dial-up, Mail UI, TuneMole UI and status labels. | P1-01 | done | sonnet | agent | — | fast | — | No literal UI text in those app folders (site content excluded); DE tests for each app. | §P1-03 |
| P1-04 | **Accessories strings** — Notepad, Paint, Snapshot Booth, Display Properties, Disk Cleanup, My Computer, Explorer, image viewer. | P1-01 | done | sonnet | agent | — | fast | — | No literal UI text left in those folders; dialogs/confirm() localized; DE tests for each app. | §P1-04 |
| P1-05 | **Amplifier strings** — main window, playlist, equalizer, skins menu, Burn CD dialog, windowshade. | P1-01 | done | sonnet | agent | — | fast | — | No literal UI text in `src/apps/amplifier/**`; layout holds in DE (skin labels, buttons); DE test. | §P1-05 |
| P1-06 | **Games strings** — Mines, Hen Hunt (incl. canvas HUD), Desktop Wrecker (incl. canvas text), high-score dialogs. | P1-01 | done | sonnet | agent | — | fast | — | No literal UI text in those folders; canvas text comes from `t()`; HUD fits in DE; DE tests. | §P1-06 |
| P1-07 | **Star Pinball strings** — screens, ranks, dot-matrix display texts and in-canvas labels; add Ä Ö Ü ß glyphs to the dot-matrix font. | P1-01 | done | opus | agent | — | fast | — | Every pinball text from `t()`; font renders umlauts (unit-tested glyph table); no DE text exceeds the display (scroll or shorter wording); DE review screenshot. | §P1-07 |
| P1-08 | **German layout pass** — fix overflow/clipping in German across shell and all apps; `hyphens: auto`; desktop label choices. | P1-02…P1-07 | done | sonnet | agent | — | e2e | — | Review screenshots of every app in DE show no clipped/overflowing text; fixed-size windows still fit; EN unchanged. | §P1-08 |
| P1-G | **P1 gate (self-review)** — follow "Task specs → Gate procedure" plus the literal-string check in the spec; screenshots: every app in German. | P1-01…P1-08 | done | sonnet | agent | — | e2e | — | verify + e2e pass; no leftover literals (spec check); `docs/review/v03-P1.md` + screenshots. | §Gate |

## P2 — German content (cultural localization)

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-01 | **German style guide** — `docs/localization-de.md`: each friend's German voice, 2007 German chat-speak, school mapping, spam/chain-letter tropes, storyline glossary. | P1-G | done | opus | agent | — | — | — | Guide covers all 6 voices with example lines, a do/don't list, a glossary of every recurring storyline term in EN → DE. | §P2-01 |
| P2-02 | **Jess + Kayla in German** — full overlays: profile/presence, day 1, days 2–5, game and now-playing scripts. | P2-01 | done | opus | agent | — | fast | — | Overlays complete (no EN fallback left for these two); parity + lint + playthrough green in DE; voices per style guide. | §P2-02 |
| P2-03 | **Dex + Theo in German** — full overlays as in P2-02. | P2-01 | done | opus | agent | — | fast | — | As P2-02 for Dex and Theo. | §P2-02 |
| P2-04 | **Marco + Pia in German** — full overlays as in P2-02. | P2-01 | done | opus | agent | — | fast | — | As P2-02 for Marco and Pia; Marco never uses „!" in German either. | §P2-02 |
| P2-05 | **Files + mail in German** — seeded documents, pictures captions, Recycle Bin files, mail days 1–5, auto-replies. | P2-01 | done | opus | agent | — | fast | — | Every file and mail has a German version with the same id; lint + content tests green in DE. | §P2-05 |
| P2-06 | **Websites + profiles in German** — Spaceport profiles, all site content, inline site text moved to content, Searchly DE index. | P2-01 | done | opus | agent | — | fast | — | Every site and profile renders fully German in DE; Searchly finds German pages; site tests in both locales. | §P2-06 |
| P2-07 | **Small content in German** — tray balloons, Tacki tips, TuneMole results, celeb gossip polls, game names in chat placeholders. | P2-01 | done | sonnet | agent | — | fast | — | All remaining `src/content/**` modules have German versions; no English fallback reachable in DE (spec check). | §P2-07 |
| P2-G | **P2 gate (content self-review)** — follow "Task specs → Gate procedure" + German content rubric; full DE playthrough over 5 days. | P2-02…P2-07 | done | opus | agent | — | e2e | — | verify + e2e pass; rubric checked per friend; 5-day DE playthrough screenshots; `docs/review/v03-P2.md`. | §Gate |

## P3 — Release v0.3

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P3-01 | **Bilingual e2e** — German happy paths, auto-detection, mid-game language switch re-rendering old chats/mail/files/titles, v0.2 save migration. | P2-G | done | sonnet | agent | — | e2e | — | New specs in `tests/e2e/i18n-*.spec.ts` pass in the default suite; switching shows no English leftovers on the checked screens. | §P3-01 |
| P3-02 | **Docs + release notes** — README "Deutsch" section, German screenshot, `docs/release-notes-v0.3.0.md`, CREDITS, architecture docs updated. | P3-01 | done | sonnet | agent | — | — | — | Docs accurate; release notes list user-visible changes; screenshot committed. | §P3-02 |
| P3-G | **Release-ready gate (self-review)** — follow "Task specs → Gate procedure"; play 3 days in German, switch to English mid-game, then back. **Do not tag, push or release.** | P3-01, P3-02 | in progress | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v03-P3.md`; nothing pushed or tagged. | §Gate |

---

# Task specs

Full descriptions for every task. The row's Acceptance cell always applies too. When a spec and the existing code disagree about a detail the spec doesn't care about, follow the code's existing pattern.

## Specs

### Gate — Gate procedure (all phase gates)

1. Run `npm run verify` and `npm run e2e` and fix any failure.
2. Add one e2e happy-path spec for the phase's main user flows: `tests/e2e/v03-<phase>.spec.ts` (lowercase phase, e.g. `v03-p0.spec.ts`), using the helpers in `tests/e2e/helpers.ts`. It runs in the default suite.
3. Write `tests/e2e/v03-review-<phase>.spec.ts`, tagged `@review` (already excluded from the default run by `grepInvert`). It saves the screenshots named in the gate's row to `docs/review/v03-<phase>/` at 1280×800. Run it with `npx playwright test --grep @review`. Collect console errors and page errors and assert there are none, like the v0.1 review specs.
4. **Look at every screenshot** with your image-reading tool and fix the obvious problems:
   - broken layout or overlap
   - missing icons
   - unstyled elements
   - text overflow
   - anything that looks un-XP-like or breaks the asset rules
5. Review the phase's code against the Acceptance cells of its tasks. Do missing work that is small (≤ ~30 min); list larger gaps as follow-ups.
6. Write `docs/review/v03-<phase>.md`:
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

**v0.3 additions to every gate:**
- Take each screenshot **twice**, once with `language: 'en'` and once with `'de'` (suffix `-en`/`-de`), and look at both.
- Run the P1 leftover-literal check (§P1 common procedure, step 5) over `src/os` and `src/apps`; anything left must be a proper noun.
- `catalog.test.ts`, `parity.test.ts` and (from P2-07) `fallback.test.ts` must be green.

**German content rubric** (P2-G and P3-G, on top of the Content rubric):
- Each friend sounds like the German voice in `docs/localization-de.md`, not like a translation. Read 3 random scripts per friend: would a German 15-year-old in 2007 have typed that?
- System UI uses „Sie", friends/Tacki/Fluff use „du"; terms match the "German defaults" table everywhere.
- No anglicisms beyond the allowed list; no English left in DE (except proper nouns, band names, track titles, brand-name apps).
- Umlauts and ß correct; German quotes „…"; no ae/oe/ue substitutes outside deliberate chat voice.
- Storylines still consistent across chat, mail, sites and profiles in German (the glossary in `docs/localization-de.md`).

### P0-01 — i18n architecture

Write `docs/i18n.md` (short, factual) and the shared types. No behavior change in this task.

Read first: `src/os/store/settings.ts`, `src/os/persist.ts`, `src/os/types.ts` (`SettingsStore`, `PersistedStoreName`, defaults ~line 279), `src/content/types.ts` (Contact, Script, ContactLine, Choice, `TranscriptEntry` ~line 230, `ContactProgress` ~line 242), `src/apps/messenger/engine/` (`runner.ts`, `engine.ts`, `progress.ts`, `text.ts`), `src/apps/mail/store.ts`, `src/os/fs/store.ts` + `nodes.ts`, `src/os/store/windows.ts`, `src/apps/browser/store.ts`, `src/os/clock.ts`.

The doc must decide and describe (use the "i18n rules" section as the binding baseline):
1. Catalog layout, `MessageKey` derivation (leaf dot-paths of `typeof en`), param typing, function values.
2. `getLocale()` / `useLocale()` / `t()` / `useT()` and how non-React modules re-render on change (settings store subscription).
3. **Per persisted store**, the new language-neutral shape and the migration from the v0.2 shape (done inside each store's `sanitize`, so no storage version bump and no save wipe):
   - `windows`: drop persisted `title`; add optional `titleKey` + `titleParams` for windows whose title changes at runtime (`setWindowTitle`); otherwise title = function of `appId` + `props` (registry gets `titleKey`, see P0-04).
   - `fs`: system folders named by id at render; `seed:` nodes store `{ id, parentId, kind, … , dirty?: boolean }` and take `name`/`text`/`caption` from `getSeedFiles(locale)` until the player renames/edits them (`dirty: true` → freeze the then-current text into the node).
   - `mail`: content mail stored as `{ id, folder, read, deliveredAt }` (text from `getMailContent(locale)`); generated mail (`bounce`, `autoReply`) stored as `{ kind, params }`; player-written mail stays text.
   - `settings`: `language: Locale | null`; `awayMessage`, `screensaver.text`, `playerName` use `''`/`null` = "localized default"; existing values equal to the old English defaults (`'brb'`, `'Player'`) migrate to the default marker.
   - `web`: default favorites stored as `{ url }` (title from the site registry at render); custom favorites keep the title the player saw.
   - `messenger`: transcript entries `{ kind: 'line', scriptId, nodeId, lineIndex, params? }`, `{ kind: 'choice', scriptId, nodeId, choiceIndex }`, `{ kind: 'awayReply' }`, `{ kind: 'typed', text }` (player free text), plus the existing nudge/wink entries; legacy `{ kind: 'message', text }` entries are kept and rendered verbatim. Presence `personalMessage` stored as a source ref `'initial' | { day } | { scriptId, nodeId, lineIndex }`. Placeholder params stored raw (`game` id, `score` number, track id) and formatted at render.
   - Contact groups: ids `friends | school | family | offline`, labels from the catalog.
4. Content per locale: `ContactOverlay` type, merge rules (missing overlay text → English fallback, used only until P2 fills it), accessors list, parity rules.
5. Detection + where the picker/app/tray live (P0-07).

Add the types in `src/i18n/types.ts` and `src/content/types.ts` (new types only; existing ones untouched until P0-04/P0-05). Create `src/i18n/messages/en.ts` and `de.ts` with only the `common` area (OK/Cancel/Apply/Yes/No/Close/Browse…) so the types compile. Append the main decisions to `docs/decisions.md`.

### P0-02 — i18n core

- `src/i18n/detect.ts`: `detectLocale(langs)` — first entry whose primary subtag is `de` → `'de'`; else `'en'`; empty/undefined → `'en'`. Unit-test with `['de-AT']`, `['en-GB','de']` (→ `en`, first wins), `['fr','de-DE']` (→ `de`), `[]`.
- Settings: add `language: Locale | null` (default `null`), `setLanguage(l)`, sanitize (unknown → `null`), add to `partialize`. Effective locale = `language ?? detectLocale(navigator.languages ?? [navigator.language])`.
- `getLocale()`, `useLocale()`, `t(key, params?)`, `useT()`. Interpolation replaces `{name}` tokens; function values get the params object. Missing param in dev → leave the token visible (and a test proves it never happens for catalog entries via the parity test).
- `App.tsx`: `useEffect` keeps `document.documentElement.lang` = locale (like the existing `data-theme` sync). `index.html` keeps `lang="en"` as the pre-hydration default.
- `src/test/setup.ts`: before each test, `useSettingsStore.setState({ language: 'en' })`.
- `src/i18n/catalog.test.ts`: same key sets in `en` and `de`; for string values, the set of `{params}` matches; function values are called with a sample param object in both catalogs without throwing.
- Playwright: set `use: { locale: 'en-US' }` in `playwright.config.ts`; add a helper `setLanguage(page, 'de')` in `tests/e2e/helpers.ts` that uses the login picker once it exists (P0-07 fills it in; until then a localStorage seed).

### P0-03 — Locale formatting

- `src/i18n/format.ts`: `formatTime(d, locale)` (`en`: `3:07 PM`, `de`: `15:07`), `formatLongDate` (`en`: `Sunday, October 14, 2007`; `de`: `Sonntag, 14. Oktober 2007`), `formatShortDate` (`10/14/2007` / `14.10.2007`), `formatDateTime` (the Explorer "Modified" style), `formatNumber`. Use `Intl.DateTimeFormat`/`Intl.NumberFormat` with `en-US`/`de-DE`; cache formatters per locale.
- `src/os/clock.ts`: keep `now()`; `formatTrayTime`/`formatLongDate` become thin wrappers that pass `getLocale()`; delete the English `WEEKDAYS`/`MONTHS` arrays if nothing else needs them.
- Replace every hand-rolled date/number format: Mail list dates (`apps/mail/Mail.tsx`), Notepad F5 (`apps/notepad/Notepad.tsx`), Explorer modified column (`os/fs/FolderView.tsx`), Spaceport `shortDate` (`sites/spaceport/logic.ts`), Westfield date (`sites/westfieldhigh/Layout.tsx`), Message History headers (`apps/messenger/history/groups.ts`), Disk Cleanup KB (`apps/diskcleanup/DiskCleanup.tsx`), `{score}` in `apps/messenger/engine/text.ts` (only the formatting function; storage changes in P0-05), pinball `formatScore` (`apps/pinball/font.ts`; DE uses `.` separators), game high-score dates.
- The relative-day labels ("today", "yesterday", "N days ago") in `sites/spaceport/logic.ts`, `sites/daily.ts`, `sites/tinfoilcomets/logic.ts` become one shared helper `formatRelativeDay(n, locale)` in `format.ts` (`heute`, `gestern`, `vor N Tagen`).
- Tests: both locales for every formatter; existing English tests unchanged.

### P0-04 — Neutral persistence I

Implement the shapes from `docs/i18n.md` for `windows`, `fs`, `mail`, `settings`, `web` and contact groups. For each store: change the saved shape, render text at view time, migrate inside `sanitize`, and add a test that loads a **v0.2 fixture** (a JSON snapshot of the old shape; build fixtures from the current code before changing it) and checks nothing the player made is lost.

- **Registry:** `AppDefinition` gets `titleKey: MessageKey` (and `labelKey?`); `title`/`label` strings are removed from the registry (P1-01 writes the German; for now add the English values to `en.ts` and the same English text to `de.ts` marked `// TODO(P1)` — the catalog test only checks keys). `openApp` no longer copies a title into state; `Window` renders `t(titleKey, titleParams)`.
- **Dynamic titles** (`setWindowTitle` callers: Messenger chat "X - Conversation", Paint "<file> - Paint", Notepad "<file> - Notepad", Explorer folder name, Mail, Web Explorer page title) switch to `setWindowTitle(id, key, params)`. File names that the player chose are params, not keys.
- **fs:** system folder names by id (`root/docs/pics/music/recycle`) via catalog keys `fs.folders.*`; `pathOf`, `uniqueName` and Explorer's title fallback use the rendered names. Seed nodes render from `getSeedFiles(locale)` (temporarily the English seeds for both locales — P0-06 adds the accessor; until then use the existing `SEED_FILES`). Rename/edit sets `dirty: true` and freezes text. Searching/sorting uses rendered names.
- **mail:** as in the doc. The delivery scheduler keeps working per day; rendering looks up content by id. Bounce and auto-reply templates move to the catalog (`mail.bounce.*`, `mail.reply.*`).
- **settings/web/groups:** as in the doc.
- Every touched view must re-render on language change (test: set `language: 'de'` after render and assert the change, using a German placeholder string in `de.ts` for the keys you add).

### P0-05 — Neutral persistence II: Messenger

- Engine (`apps/messenger/engine/runner.ts`, `engine.ts`, `progress.ts`) records references instead of text, exactly as in `docs/i18n.md`. `resolveText` (or its successor) becomes a pure render-time function `renderEntry(entry, contacts, locale, playerName)` used by the chat transcript, Message History, toasts ("X says: …"), and the contact-list presence line.
- Personal messages: store the source ref; render from the merged contact for the current locale.
- Placeholders: `{game}` → game id rendered via catalog `games.<id>`; `{score}` via `formatNumber`; `{artist}/{title}` from the track id; `{name}` = player name at render time.
- Migration in `sanitize`: legacy text entries survive unchanged; legacy `personalMessage` strings become `{ kind: 'literal', text }` source refs.
- Tests: existing engine/playthrough tests updated to assert on rendered output; new test: run a script to completion, switch locale (with a test overlay that changes one line), re-render → transcript shows the overlay text; legacy fixture renders verbatim.
- Performance: rendering a 500-entry transcript stays fast (memoize per entry + locale).

### P0-06 — Content per locale

- `src/content/locale.ts` (or `src/content/index.ts`): accessors listed in "i18n rules"; each returns the German module when `locale === 'de'`, else English. For contacts, `mergeOverlay(contact, overlay)` builds a full `Contact` (missing overlay text → English text, so the game works before P2).
- Create the `src/content/de/` skeleton: `contacts/<id>.ts` with empty overlays (`scripts: {}`) for all 6 friends, and `files/`, `mail/`, `profiles/`, `sites/`, `balloons.ts`, `assistant.ts`, `tunemole.ts` that **re-export the English modules for now** with a `// TODO(P2)` comment. P2 replaces them.
- Switch every consumer to the accessors (Messenger runtime/engine, fs seeding/rendering, mail delivery/rendering, Spaceport/site components, balloon scheduler, Stapley, TuneMole, Searchly index). Consumers re-render on language change.
- `src/content/parity.test.ts`: for each friend, every overlay script/node exists in English, `lines.length` and `choices.length` match, and placeholder tokens per line match; for other content, ids (or array lengths) match English. Empty overlays pass.
- Lint per locale: `lintText(text, locale)`; German adds anachronisms `WhatsApp|Instagram|Facebook|Smartphone|Tablet|Apps?\b|App-Store|posten|gepostet|Story|Stories|Selfie|Hashtag|streamen|Streaming|DM`; real TLDs stay forbidden (including `.de`, `.at`, `.ch`). `content.test.ts` lints both locales.
- Searchly: `tokenize()` in `src/apps/browser/sites/searchly/search.ts` becomes Unicode-aware (`/[^\p{L}\p{N}]+/u`, lowercase with `toLocaleLowerCase(locale)`), and German search folds `ä→a ö→o ü→u ß→ss` on both query and index so „Grösse" finds „Größe". Index per locale.

### P0-07 — Language UI

- **Login picker** (`src/os/login/Login.tsx`): a small XP-style dropdown "Language / Sprache" (label shows both words) in the footer or under the prompt, options `English` / `Deutsch`, visible **on every visit**. Changing it calls `setLanguage` immediately (the login screen re-renders in the new language) and persists.
- **`regional` app** — "Regional and Language Options" / „Regions- und Sprachoptionen": new `AppId`, registry entry (category `system`, in Start → All Programs → System Tools and reachable from Control Panel/Display-style places list as you see fit), fixed size 380×300, original 16/32 px SVG icon (a globe with a small clock), CREDITS row. One tab "Languages" with a dropdown and an example preview ("Time: 15:07 · Date: 14.10.2007 · Number: 1.234"), OK/Cancel/Apply semantics like Display Properties.
- **Tray badge:** `EN`/`DE` box in the tray (left of the network icon), `aria-label` „Eingabesprache: Deutsch" / "Input language: English"; click opens a two-item menu with a check mark on the current one; Escape/outside click closes.
- Live switching: every open window title, the Start menu, the taskbar and the clock update without reload. Add the needed catalog keys (EN + DE).
- Update `src/os/types.ts` `AppId`, `src/apps/registry.test.tsx` id list, shortcuts/Start menu.
- Tests: picker changes language and persists; app Apply/Cancel; tray menu keyboard path; e2e `tests/e2e/i18n-language.spec.ts` (switch on login, reload, still German).

### P1 — common procedure for every P1 string task

For each file in your area:
1. Move every user-visible literal (JSX text, `aria-label`, `title`, `alt`, `placeholder`, `confirm`/`alert`, option labels, canvas `fillText`, SVG `<text>`, strings in non-React modules that reach the screen) into `src/i18n/messages/en.ts` under your area key, and write the German in `de.ts` following "German defaults" (Sie for system UI, du for friendly characters).
2. Use `useT()` in components and `t()` in plain modules. Labels that live in data tables (tool lists, menus, catalogs) store a `labelKey`, not a string.
3. Replace any leftover `// TODO(P1)` English placeholders in `de.ts` for your area.
4. Keep existing English tests green (they run with `language: 'en'`). Add at least one German test per app/area that renders with `language: 'de'` and asserts 2–3 key German strings.
5. Run the leftover check for your folders: `grep -rnE ">[^<{]*[A-Za-z]{3,}[^<{]*<|(aria-label|title|alt|placeholder)=\"[A-Za-z]" <your folders> --include=*.tsx` — what remains must be proper nouns or `APP_NAME`. Note anything intentionally left in the done note.

Don't touch `src/content/**` (P2 does content) except to read it.

### P1-01 — OS shell strings

Folders: `src/os/boot`, `login`, `desktop`, `taskbar` (incl. `NetworkTray.tsx`), `startmenu` (incl. `OffScreen.tsx`), `wm`, `balloon` (incl. `schedule.ts` "A new day!"), `toast`, `screensaver`, `overlay`, `pet`, `assistant`, `notice`, `fs` (`FolderView.tsx`, `FsIcon.tsx`, type labels like "Text Document" → „Textdokument"), `konami.ts`, `wallpapers/registry.ts` (wallpaper names: localize descriptive names, e.g. "Rolling Hill" → „Grüner Hügel"; keep "Pony Paradise"), `brand` (tagline: use the German default), plus `src/apps/registry.ts` titles/labels and `src/os/shortcuts.ts` labels (`labelKey`). The Start button reads „Start" in German (German XP capitalised it) and "start" in English. Theme names (Display) stay in P1-04.

### P1-02 — Messenger UI strings

`src/apps/messenger/**` except `src/content`: `Messenger.tsx`, `chat/*` (Transcript templates "says:", nudge/wink lines, toolbar, font/emoticon/wink menus, input placeholder), `StatusIcon.tsx` (status labels per "German defaults"), `contactList.ts` group labels, `AwayDialogs.tsx`, `PicturePicker.tsx`, `history/History.tsx`, `chat/emoticons.ts` names (tooltip names like "Smile" → „Lächeln"; shortcut codes stay the same), `winks/catalog.ts` names, `runtime.ts` toasts ("While you were away: 2 messages" → „Während Sie abwesend waren: 2 Nachrichten"; app chrome uses „Sie", only friends say „du"), `engine/text.ts` `GAME_NAMES` → catalog `games.*`. The hamster wink's SVG "HA HA HA!" → „HA HA HA!" stays; any other SVG text localized.

### P1-03 — Internet apps strings

`src/apps/browser/` shell only (`Browser.tsx`, `MenuBar.tsx`, `FavoritesPane.tsx`, `ErrorPage.tsx` — use the German XP error page wording, `LoadProgress.tsx`, dialogs), not `sites/*` (P2-06). `src/apps/dialup/` (dialog states "Dialing…"/„Wählen…", "Verifying username and password…"/„Benutzername und Kennwort werden überprüft…", "Connected"/„Verbunden"). `src/apps/mail/` UI (folders Inbox/Sent/Deleted Items → Posteingang/Gesendete Objekte/Gelöschte Objekte, compose, toolbar). `src/apps/tunemole/` UI + status labels in `store.ts` (Queued → „Warteschlange", Connecting… → „Verbinde…", Awaiting more sources… → „Warte auf weitere Quellen…").

### P1-04 — Accessories strings

`src/apps/notepad` (incl. "Do you want to save the changes?" → „Möchten Sie die Änderungen speichern?", FileDialog), `paint` (`Paint.tsx`, `Toolbox.tsx`, `tools.ts` tool names in German Paint terms: Stift, Pinsel, Radierer, Farbfüller, Linie, Rechteck, Ellipse, Text, Farbauswahl; `dialogs.tsx`, `usePaintFiles.ts`), `photobooth` (consent screen, filters, countdown, errors), `display` (tabs Designs/Desktop/Bildschirmschoner/Darstellung, theme and saver names, labels), `diskcleanup` (category names stay funny in German, e.g. „Alte Schwärme"), `mycomputer`, `explorer` + `ImageViewer.tsx`.

### P1-05 — Amplifier strings

`src/apps/amplifier/**`: buttons, LCD texts (keep short; the LCD is narrow), playlist, EQ ("Preamp" → „Vorverst."; presets Rock/Pop/Bass Boost → Rock/Pop/Bass-Boost), skins menu, windowshade, Burn CD dialog („52-fach" speed, „Pufferunterlauf"). Check the 7–9 px skin labels and 20 px EQ bands still fit; abbreviate in German where needed.

### P1-06 — Games strings

`src/apps/mines` (menu, levels Anfänger/Fortgeschrittene/Profis, best-times dialog), `src/apps/henhunt` (`Screens.tsx`, `hud.ts` canvas: „PUNKTE", „Noch 10 Sekunden!", „Nachladen! (Rechtsklick oder Leertaste)" — measure text with `ctx.measureText` instead of fixed x offsets so longer German fits), `src/apps/wrecker` (`engine.ts` tool label/hint pairs, `Palette.tsx`, `draw.ts` "BOOM!" → „BUMM!"). High-score name fallback "Anonymous" → „Anonym" (render-time default, not persisted).

### P1-07 — Star Pinball strings

`src/apps/pinball`: `Screens.tsx`, `backdrop.ts`, `draw.ts` (SHOOT AGAIN → „NOCHMAL", HYPERSPACE stays, TILT stays, STAR target letters stay), `display.ts` (PRESS PLAY → „START DRÜCKEN", LAST n → „LETZTE n", GAME OVER → „SPIEL AUS", BALL n), `scoring.ts` ranks (Cadet…Admiral → Kadett, Fähnrich, Leutnant, Kapitän, Kommodore, Admiral — keep the same count). `font.ts`: add 5×7 glyphs for Ä Ö Ü (and map ß → „SS" on the uppercase display); unit-test that every character used by any DE/EN display string has a glyph. Texts longer than 21 characters must scroll (marquee) or be reworded; add a test over all display strings in both locales.

### P1-08 — German layout pass

With `language: 'de'`, open every app and the shell at 1280×800 (review spec `tests/e2e/review-p1-layout.spec.ts`, `@review`) and fix clipping/overflow: desktop icon labels (`hyphens: auto` works once `lang="de"`; choose German desktop labels that read well in two lines, e.g. „Mit dem Internet verbinden"), Start menu widths, fixed-size windows (Display Properties tabs, Disk Cleanup, Dial-up, Mines menu bar, Desktop Wrecker palette), Amplifier, Web Explorer favorites pane/status bar, Messenger menus and dialog buttons (allow `min-width` buttons to grow), Paint status bar. Prefer letting containers grow or wrap; shorten German wording only as a last resort (and record it in `docs/decisions.md`). English rendering must not change (compare a couple of EN screenshots before/after).

### P2-01 — German style guide

Write `docs/localization-de.md`. Read first: all of `src/content/contacts/*` (at least each friend's day-1 script and one later day), `src/content/profiles/*`, `src/content/mail/day1.ts`, `src/content/sites/*`, `docs/content-format.md`, and the "Content rubric" in the Gate procedure.

The guide must contain:
1. **The goal:** a German teenager in 2007 should feel at home. Localize references, don't translate words. Keep every storyline beat, every branch's meaning and every unlock; change *how* it's said.
2. **Each friend's German voice**, with 5 example lines each (EN original → DE):
   - Jess: ALL CAPS, many „!!!", nudges, „OMG", „HDGDL".
   - Kayla: ~*drama*~ decorations, „*seufz*", „ich kann nicht mehr", ever-changing personal message with „~*…*~".
   - Dex: slow, short, „jo", „kp" (kein Plan), „bin ma kurz weg", always Abwesend.
   - Theo: shy, „sorry", „tschuldige", over-explains, lots of „…".
   - Marco: dry, all lowercase, never „!", deadpan.
   - Pia: bossy little sister, ponies („Ponys"), „ich sags Mama!!".
3. **2007 German chat-speak list** with meaning and who uses it: lol, rofl, omg, hdl, hdgdl, hdmfg (rare), kp, bb, bg (bin gleich wieder da), brb (also used), *knuddel*, *g*, *lach*, mom (Moment), n8, gn8, ka, wb, sry, thx, gz; spelling habits (lowercase, „nich", „hab", „is", „ma"). Emoticon codes stay the same.
4. **School mapping:** Westfield High → „Westfield-Gymnasium" (host unchanged); grade → „Klasse 9b"; homework → „Hausaufgaben"; test → „Klausur"/„Arbeit"; bio cell project → „Bio-Referat über die Zelle"; Mr Dalton → „Herr Dalton"; prom → „Abschlussball"; detention → „Nachsitzen"; cafeteria → „Mensa"; school dance → „Schulparty".
5. **Storyline glossary** (EN → DE) for every recurring term: Tinfoil Comets (band name stays), Velvet Lantern (stays), the concert, Kayla vs Brianna, Dex's kickflip and skate video, Pia's ponies, „Pony Paradise", Spaceport („Spaceport" stays; „Top 8" stays; comments → „Kommentare"; guestbook → „Gästebuch"), chain letters („Kettenbrief"), spam („Sie haben gewonnen!!!", „Gratis MP3-Player"), VirusGuard.
6. **Don'ts:** no anachronisms (the P0-06 German list), no real brands/sites (no StudiVZ/SchülerVZ/ICQ/Bravo names — use the existing fictional ones or invent `.example` names), no `.de` domains, PG-13, no dialect parody, no English left except loanwords German teens really used in 2007 (cool, sorry, lol, crush is borderline → prefer „verknallt").
7. **Parity reminder:** same number of lines per node and choices per node; placeholders stay; one English line = one German line.

### P2-02 — Friend overlays (used by P2-02, P2-03, P2-04)

For each of your two friends write `src/content/de/contacts/<id>.ts` completely: `displayName` (only if the name contains English words; ~*decorations*~ kept), `personalMessage`, `awayReply`, `days` presence messages, and **every** script in the friend's merged English contact — the main file, `<id>-days.ts`, the friend's script in `game-reactions.ts` and in `now-playing.ts` — node by node: `lines` (same count) and `choices` (same count, `text` is what the player sends, `label` if the English has one).
- Follow `docs/localization-de.md` exactly. Re-read the English branch around each node so jokes and callbacks still land in German.
- Run `npm run test -- src/content` until parity, lint and playthrough pass for `de`. Extend `playthrough.test.ts` so it runs per locale (if P0 didn't already) and asserts no English fallback is used for your two friends (a helper in `src/content/locale.ts` can report fallbacks).
- Record notable cultural swaps in `docs/decisions.md` (one line each, max ~5 per friend).

### P2-05 — Files + mail in German

`src/content/de/files/*` (replace the re-export): every seed file with the same id; German file names (`Bio-Referat Entwurf.txt`, `geheimes gedicht.txt`, `top 8 drama.txt` → „top 8 drama.txt" may stay as the teen named it), German bodies in each author's voice, photo captions. Recycle Bin files stay embarrassing. `src/content/de/mail/*`: days 1–5, same ids, German chain letters/spam/Herr Dalton/Mama/Spaceport notifications; `autoReplies.ts` per friend in their voice. Bounce texts already live in the catalog (P0-04). Tests: content + lint per locale; Mail renders German in DE.

### P2-06 — Websites + profiles in German

`src/content/de/profiles/*` (all 6 + player defaults), `src/content/de/sites/*` (celebgossip07, tinfoilcomets, westfieldhigh, spaceport, virusguard). Move remaining inline prose of `src/apps/browser/sites/about/*` and `searchly/*` (toolbar-setup joke, results chrome) into `src/content/sites/` (EN) + `src/content/de/sites/` (DE), and site chrome (table headers, buttons) into the catalog under `sites.<host>`. Each site's `index.ts` page `title`/`description`/`keywords` become per-locale so Searchly indexes German pages in DE. Fictional celebs stay fictional; the gossip blog gets German gossip-magazine style („Exklusiv!", „Schock!"). Site tests run in both locales (keep English assertions; add German ones).

### P2-07 — Small content in German

`src/content/de/balloons.ts`, `assistant.ts` (Tacki's tips: „Es sieht so aus, als würden Sie einen Brief schreiben…" — Tacki says „Sie" like the original assistants did), `tunemole.ts` (German-sounding fictional peers and file names; real shipped track titles stay), celeb gossip polls if not done in P2-06, and catalog `games.*` names used in chat placeholders. Then add `src/content/fallback.test.ts`: with `language: 'de'`, walk every accessor and assert no English fallback is returned anywhere (all `// TODO(P2)` re-exports gone).

### P3-01 — Bilingual e2e

New specs in `tests/e2e/` (default suite, use helpers, `?speed=fast`):
- `i18n-detect.spec.ts`: `test.use({ locale: 'de-DE' })` → first visit shows German login; `en-US` → English.
- `i18n-switch.spec.ts`: play day 1 in English (Messenger sign-in + one chat with a choice, open a mail, open a seeded file), switch to German via the tray badge → the open chat transcript, contact list, mail, Notepad title and file text are German with no reload; switch back via Regional and Language Options.
- `i18n-de-flow.spec.ts`: German happy path through Start menu, Messenger, Web Explorer (Searchly German search), Mail, a game.
- `i18n-migration.spec.ts`: seed localStorage with a v0.2 save fixture (from P0-04/P0-05), load, verify chats/files/mail survive and the UI is in the detected language.

### P3-02 — Docs + release notes

- README: a short „Deutsch" section (what's localized, how to switch), a German screenshot `docs/screenshots/desktop-de.png` (1280×800, desktop with Start menu open), version line → v0.3.
- `docs/release-notes-v0.3.0.md` in English with a German summary paragraph.
- `docs/architecture.md` / `docs/architecture-v0.2.md`: link to `docs/i18n.md`; `docs/content-format.md`: German overlays + parity rules.
- CREDITS: new icons (regional app) as original work.

### Gate notes for P3-G

On top of the Gate procedure: play 3 in-game days in German with `?speed=fast` (Turn Off → power on loop), switch to English mid-game and back, and confirm every screen follows the language. Write `docs/review/v03-P3.md` with a final summary of v0.3. Do not tag, push or release.

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

- **Run it:** `igris arise P0 --through P3` inside herdr or tmux (`igris.toml` sets yolo mode, auto-commit and 5 verify attempts). Nothing is pushed or tagged.
- **Afterwards, review:** `docs/review/v03-P0.md` … `v03-P3.md` (with EN + DE screenshots), `docs/localization-de.md` (the German voices — worth reading yourself), `docs/decisions.md`, and `docs/release-notes-v0.3.0.md`. Then push, check the live site in both languages, and tag `v0.3.0`.
- **Try German quickly:** use a browser profile whose language is German, or pick „Deutsch" on the login screen.
- **Existing saves** from v0.2 keep working: chat lines written before the update stay in English; everything new follows the chosen language.
- igris can still stop for: verify failing 5× in a row, a crashed session, editing this file mid-run, or a session idling without `igris done` after its reminder.
