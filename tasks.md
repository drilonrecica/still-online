# still online — v0.4 plan (Friendspace, Pixlog, GlitterCodez)

<!-- igris:format 1 -->

This is the build plan for still online v0.4, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file** and in the design spec it points to. Read the whole brief, the global rules, the v0.4 rules and your task's spec before starting. Earlier plans (all done) are archived in `docs/plans/v0.1-tasks.md`, `v0.2-tasks.md` and `v0.3-tasks.md`.

```sh
igris check --strict          # validate this plan
igris arise P0 --through P5   # run everything (yolo mode is the default in igris.toml)
```

---

# Project brief

still online is a browser-based nostalgia simulator: an XP-style desktop frozen in **2007**, bilingual (English and German). v0.1–v0.3 shipped the shell, Messenger with 6 scripted friends and a 5-day living world, Amplifier, a fictional internet (Web Explorer, Searchly, **Spaceport**, Mail, TuneMole, a fan site, a gossip blog, a school site), Paint, Snapshot Booth, games, Fluff and Tacki/Stapley, and full German localization. v0.3.1 made the player name required, added flag buttons for the language, and moved German into a lazy chunk.

v0.4 brings back the two social networks a 2007 teenager had open side by side.

**The agreed design is `docs/superpowers/specs/2026-10-15-v04-social-design.md`. Read it first; it is binding.** In short:

## v0.4 scope (this plan)

1. **Spaceport is renamed Friendspace** (`friendspace.example`), the MySpace homage. Old `spaceport.example` URLs, favorites and open windows redirect. It gains:
   - **bulletins**
   - **band pages** with an inline music player
   - **profile-song autoplay**
   - a fully editable **Top 8 with drama**: dropped friends react in Messenger and on your wall
   - **profile extras**: glitter headline, stickers, sparkle cursor, comment graphics, mood history
2. **GlitterCodez** (`glittercodez.example`): a 2007 free-layouts site. You copy a layout code (a safe made-up markup, never real CSS or HTML) and paste it into Friendspace's editor.
3. **Pixlog** (`pixlog.example`), the Netlog homage:
   - visitors and kudos
   - photo albums (friends' albums plus your own, from My Pictures)
   - blogs and surveys
   - a shouts feed
4. **Content** for days 1–5, tied into the existing storylines, in **English and German** (German written for a German 2007, as in v0.3).
5. **Release v0.4:** e2e coverage, review screenshots, docs and release notes.

**Focus:** self-expression, story content and nostalgia details. It is **not** a social engine. The only things the player writes are their own pages (profile, layout code, Top 8, album, surveys, skin) and kudos.

## Explicitly out of scope (do NOT build these)

- Player-written comments on friends' walls, photos or blogs, and friend requests, messages or groups on the sites.
- New story days (6+). Content stays within days 1–5.
- Real CSS/HTML in layout codes, or any `dangerouslySetInnerHTML` of player or content text.
- Any backend, accounts, real networking, real web access or AI-generated text.
- Real product names, logos or brand-alike names (no "MySpace", "Netlog", "YourSpace", "NetZLog" anywhere in the UI or content). Homages only.
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

**Defaults that changed since v0.3 (these override older text in this file):**
- **Player name:** required on the login screen. There is no default name and Log On is disabled while it's blank. Messenger handle: `<lowercased-name-no-spaces>@livemail.example`.
- **German games UI** says „Sie" like all system UI. Only friends, sites, Tacki and Fluff say „du".
- **Login language:** a radio group of flag buttons (UK flag = English, German flag = Deutsch).


---

# Phases

## P0 — Foundations

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P0-01 | **Rename Spaceport → Friendspace** — host, folders, catalog keys, every visible "Spaceport" in EN + DE content, new logo, redirects for old URLs/favorites/windows. | — | ready | opus | agent | — | e2e | — | No "Spaceport"/`spaceport.example` left in `src/` except the redirect map and migration tests; old URLs, favorites and restored windows land on `friendspace.example`; ids like `d2-spaceport-views` unchanged; all tests green. | §P0-01 |
| P0-02 | **v0.4 architecture + data model** — `docs/architecture-v0.4.md`, content types, `LocaleContent` fields + accessors, `web` store fields with sanitize/migrations, empty content modules + DE placeholders. | P0-01 | blocked | opus | agent | — | fast | — | Doc covers every new type, store field, event and route; types compile; v0.3 save fixture loads unchanged (Top 8 migrates); sanitize tests per new field; parity covers new modules; no UI yet. | §P0-02 |
| P0-03 | **Top 8 drama engine** — `onTop8Dropped`/`onTop8Readded` triggers, events between the web store and Messenger, reaction bookkeeping, lint support. | P0-02 | blocked | opus | agent | — | fast | — | Dropping a friend in a saved Top 8 queues one reaction that runs on their first sign-in on a later day; re-adding runs the readded script once; wall entries recorded; engine + lint + store tests. | §P0-03 |
| P0-G | **P0 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: Friendspace home, a friend profile, `/me` (EN + DE). | P0-01…P0-03 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/v04-P0.md` + screenshots; redirect checked by hand. | §Gate |

## P1 — Friendspace + GlitterCodez

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-01 | **Bulletins** — `/bulletins` page, newest 3 on `/me`, unread dot in the nav. | P0-G | blocked | sonnet | agent | — | fast | — | Day-gated list renders from content; dot shows until the page is opened that day (persisted `bulletinsSeen`); links to `.example` URLs work; tests EN + DE UI. | §P1-01 |
| P1-02 | **Band pages + player + autoplay** — `/band/<id>`, dark inline `BandPlayer` driving Amplifier through events, profile-song autoplay with stop + `/me` setting. | P0-G | blocked | opus | agent | — | fast | — | Band page plays/pauses its tracks through Amplifier and reflects Amplifier state; autoplay only when unmuted, idle and enabled; stop works; bands linkable from Top 8; tests. | §P1-02 |
| P1-03 | **Layout codes + profile extras** — `layoutCode.ts` parser/generator, backgrounds/fonts/stickers/cursors sets, editor textarea with live preview, glitter headline, stickers, sparkle cursor, comment graphics, mood history. | P0-G | blocked | opus | agent | — | fast | — | Parser is total (fuzz-style tests: junk, partial, huge input); generator round-trips; pasted code changes the profile; extras render on friend and own pages; reduced motion honoured; no raw CSS/HTML path. | §P1-03 |
| P1-04 | **GlitterCodez site** — `glittercodez.example`: layout gallery with live mini previews and copy boxes, `/glitter`, `/stickers`, `/cursors`, 2007 look. | P1-03 | blocked | sonnet | agent | — | fast | — | Every gallery code is produced by `layoutCodeFor` and parses back to its layout; Copy works (clipboard + select fallback); Searchly indexes it; tests. | §P1-04 |
| P1-05 | **Top 8 editor + drama UI** — add/remove/reorder friends, bands and extras; wall shows drop/readd reactions; mood history saved on mood change. | P0-03, P1-02 | blocked | sonnet | agent | — | fast | — | Editor saves typed Top 8 (max 8), emits the P0-03 event; reactions appear on `/me` wall from content; keyboard operable; tests EN + DE UI. | §P1-05 |
| P1-G | **P1 gate (self-review)** — Gate procedure; screenshots: bulletins, a band page playing, GlitterCodez home, `/me` with a pasted layout (sparkles, stickers), Top 8 editor. | P1-01…P1-05 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/v04-P1.md` + EN/DE screenshots. | §Gate |

## P2 — Pixlog

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-01 | **Pixlog shell** — `pixlog.example`: look + logo, home splash, friend profile with tabs (profile, photos, blog, surveys, guestbook), album page, 6 skins. | P1-G | blocked | sonnet | agent | — | fast | — | All routes render from content; tabs via `?tab=`; album page shows procedural photos + day-gated comments; skins switch; Searchly indexes friend pages; tests. | §P2-01 |
| P2-02 | **Pixlog logic: feed + visitors** — derived shouts feed, visitor list and counter (pure, seeded), home feed UI, visitors box. | P2-01 | blocked | opus | agent | — | fast | — | `shoutsFeed`/`visitors`/`visitorCount` deterministic per day and locale, unit-tested; feed lines localized via the catalog; UI shows them. | §P2-02 |
| P2-03 | **Pixlog `/me`** — kudos (give once per friend per day; received from content), your album from My Pictures with captions, surveys you fill in and post, skin picker. | P2-02 | blocked | opus | agent | — | fast | — | Kudos persisted and limited per day; album picks procedural and blob images, deleted files drop out; survey answers persisted and shown; tests EN + DE UI. | §P2-03 |
| P2-G | **P2 gate (self-review)** — Gate procedure; screenshots: Pixlog home feed, a friend's photos tab, an album, `/me` with album + survey + visitors. | P2-01…P2-03 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/v04-P2.md` + EN/DE screenshots. | §Gate |

## P3 — English content

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P3-01 | **Friendspace content** — ~15 bulletins (days 1–5), 4 bands, Top 8 reaction wall lines + Messenger `top8-dropped`/`top8-readded` scripts for all 6 friends, `commentGraphic` on some wall comments, friends' Top 8 gain bands. | P2-G | blocked | opus | agent | — | fast | — | Content lint + playthrough green; reactions in each friend's voice; storylines consistent; German placeholders updated to match structure. | §P3-01 |
| P3-02 | **Pixlog content: Jess, Kayla, Pia** — albums (photos, captions, comments), blog posts, surveys, shouts, guestbooks, kudos days. | P2-G | blocked | opus | agent | — | fast | — | Per spec volume; voices + storylines hold; lint green; placeholders updated. | §P3-02 |
| P3-03 | **Pixlog content: Marco, Theo, Dex** — as P3-02. | P2-G | blocked | opus | agent | — | fast | — | As P3-02. | §P3-02 |
| P3-04 | **GlitterCodez layouts + mail** — 12 layouts with names/blurbs, glitter/sticker/cursor page text, site chrome text; mails `d2-pixlog-visitors`, `d4-friendspace-bulletin`. | P2-G | blocked | sonnet | agent | — | fast | — | 12 distinct good-looking layouts (screenshot each); mails delivered on their days; lint green; placeholders updated. | §P3-04 |
| P3-G | **P3 gate (content self-review)** — Gate procedure + Content rubric; 5-day English playthrough of the new sites. | P3-01…P3-04 | blocked | opus | agent | — | e2e | — | verify + e2e pass; rubric per friend; day-by-day screenshots; `docs/review/v04-P3.md`. | §Gate |

## P4 — German content

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P4-01 | **German: Friendspace + GlitterCodez + mail** — bulletins, bands, Top 8 reaction lines + contact overlays for the new scripts, layouts text, mails; glossary in `docs/localization-de.md`. | P3-G | blocked | opus | agent | — | fast | — | No placeholder left in these modules; overlays complete (overlay fallback test green); fallback assertions added; German voices per style guide. | §P4-01 |
| P4-02 | **German: Pixlog Jess, Kayla, Pia** | P3-G | blocked | opus | agent | — | fast | — | As P4-01 for these Pixlog modules. | §P4-02 |
| P4-03 | **German: Pixlog Marco, Theo, Dex** | P3-G | blocked | opus | agent | — | fast | — | As P4-01 for these Pixlog modules. | §P4-02 |
| P4-G | **P4 gate (German content self-review)** — Gate procedure + German content rubric; 5-day German playthrough of the new sites. | P4-01…P4-03 | blocked | opus | agent | — | e2e | — | verify + e2e pass; no placeholder comments left in `src/content/de`; `docs/review/v04-P4.md`. | §Gate |

## P5 — Release v0.4

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| P5-01 | **v0.4 e2e** — the flows listed in the spec's Testing section, EN + DE. | P4-G | blocked | sonnet | agent | — | e2e | — | New `tests/e2e/v04-*.spec.ts` pass in the default suite. | §P5-01 |
| P5-02 | **Docs + release notes** — README, CREDITS (new SVGs), architecture docs, `docs/release-notes-v0.4.0.md` (EN + German summary), screenshots. | P5-01 | blocked | sonnet | agent | — | — | — | Docs accurate; notes list user-visible changes; screenshots committed. | §P5-02 |
| P5-G | **Release-ready gate (self-review)** — Gate procedure; play days 1–3 in English and 4–5 in German across Friendspace, Pixlog and GlitterCodez. **Do not tag, push or release.** | P5-01, P5-02 | blocked | opus | agent | — | e2e | — | verify + e2e pass; `docs/review/v04-P5.md`; bundle sizes reported (German stays lazy); nothing pushed or tagged. | §Gate |

---


# Task specs

Full descriptions for every task. The row's Acceptance cell always applies too, and so does the design spec (`docs/superpowers/specs/2026-10-15-v04-social-design.md`). When a spec and the existing code disagree about a detail the spec doesn't care about, follow the code's existing pattern.

## Specs

### Gate — Gate procedure (all phase gates)

1. Run `npm run verify` and `npm run e2e` and fix any failure.
2. Add one e2e happy-path spec for the phase's main user flows: `tests/e2e/v04-<phase>.spec.ts` (lowercase phase, e.g. `v04-p0.spec.ts`), using the helpers in `tests/e2e/helpers.ts`. It runs in the default suite.
3. Write `tests/e2e/v04-review-<phase>.spec.ts`, tagged `@review` (already excluded from the default run by `grepInvert`). It saves the screenshots named in the gate's row to `docs/review/v04-<phase>/` at 1280×800. Run it with `npx playwright test --grep @review`. Collect console errors and page errors and assert there are none, like the v0.1 review specs.
4. **Look at every screenshot** with your image-reading tool and fix the obvious problems:
   - broken layout or overlap
   - missing icons
   - unstyled elements
   - text overflow
   - anything that looks un-XP-like or breaks the asset rules
5. Review the phase's code against the Acceptance cells of its tasks. Do missing work that is small (≤ ~30 min); list larger gaps as follow-ups.
6. Write `docs/review/v04-<phase>.md`:
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

**German content rubric** (P4-G and P5-G, on top of the Content rubric):
- Each friend sounds like the German voice in `docs/localization-de.md`, not like a translation. Read 3 random scripts per friend: would a German 15-year-old in 2007 have typed that?
- System UI uses „Sie", friends/Tacki/Fluff use „du"; terms match the "German defaults" table everywhere.
- No anglicisms beyond the allowed list; no English left in DE (except proper nouns, band names, track titles, brand-name apps).
- Umlauts and ß correct; German quotes „…"; no ae/oe/ue substitutes outside deliberate chat voice.
- Storylines still consistent across chat, mail, sites and profiles in German (the glossary in `docs/localization-de.md`).

### P0-01 — Rename Spaceport → Friendspace

Find everything with `grep -rni "spaceport" src tests docs/*.md README.md CREDITS.md`.

**Code:**
- `src/apps/browser/sites/spaceport/` → `friendspace/`; `SPACEPORT_HOST` → `FRIENDSPACE_HOST = 'friendspace.example'`.
- `src/content/sites/spaceport.ts` and `src/content/de/sites/spaceport.ts` → `friendspace.ts`; the exports follow (`SPACEPORT_TEXT` → `FRIENDSPACE_TEXT`, …).
- Catalog key `sites.spaceport.*` → `sites.friendspace.*` in `en.ts` and `de.ts`; CSS module and test file names too.

**Visible text:**
- Every visible "Spaceport" becomes "Friendspace" in EN and DE: contact scripts and overlays, mail, seeded files, site text, Searchly metadata, default favorites, balloons, tips.
- Keep sentence rhythm and voice: "Spaceport" → "Friendspace" in place, lowercase where a friend types lowercase ("friendspace").
- **Ids don't change:** mail ids (`d2-spaceport-views`, `d4-spaceport-comment`), seed file ids, script ids. Saves reference them.

**Logo:**
- Replace the planet in `Layout.tsx` with an original SVG: two overlapping round chat bubbles in the existing colours, one with a small ring like a planet.
- Wordmark "Friendspace" in the existing italic style.

**Redirect:**
- Add `LEGACY_HOSTS = { 'spaceport.example': 'friendspace.example' }`.
- Apply it:
  - in the browser's URL resolution (typed URLs, links, history)
  - in the `web` store's sanitize (favorites)
  - where a restored browser window reads `props.url`
- The path and query are kept. Unit tests cover each place; one e2e opens `http://spaceport.example/jess` and lands on Friendspace.
- `docs/decisions.md`: one line for the rename.

### P0-02 — v0.4 architecture + data model

Write `docs/architecture-v0.4.md` (≤ 4 pages, extends the older architecture docs). Add the types and store fields below, empty content modules, and their German placeholders. No UI in this task.

**Content types** (`src/content/friendspace/types.ts`, `src/content/pixlog/types.ts`, `src/content/sites/glittercodez.ts` types):

```ts
// friendspace
type BandId = string;                       // 'tinfoil-comets', …
interface Bulletin { id: string; day: number;
  from: { contactId: ContactId } | { extra: string; seed: string };
  subject: string; body: string; link?: string /* *.example URL */ }
interface Band { id: BandId; name: string; genre: string; hometown: string; bio: string;
  trackIds: string[] /* playlist ids */; shows: { day: number; text: string }[];
  blog: { day: number; title: string; body: string }[]; theme: ProfileTheme }
interface Top8Reaction { contactId: ContactId; dropped: string; readded: string } // wall lines
// ProfileContent.top8 gains a band variant: TopFriend | { band: BandId }
// ProfileComment gains graphic?: 'thanks' | 'hug' | 'glitterheart'

// pixlog
type PixlogSkinId = 'orange' | 'ocean' | 'bubblegum' | 'lime' | 'night' | 'sunset';
interface PixlogPhoto { photo: PhotoSpec /* caption inside */;
  comments: { day: number; from: ContactId | string /* extra name */; text: string }[] }
interface PixlogAlbum { id: string; day: number; title: string; photos: PixlogPhoto[] }
interface PixlogProfile { contactId: ContactId; skin: PixlogSkinId; about: string;
  albums: PixlogAlbum[]; blog: { id: string; day: number; title: string; body: string }[];
  survey: { surveyId: string; answers: string[] };
  shouts: { day: number; text: string }[]; kudosToPlayer: number[] /* days */;
  guestbook: { day: number; from: ContactId | string; text: string }[] }
interface Survey { id: string; title: string; questions: string[] }   // pixlog/surveys.ts

// glittercodez
interface LayoutDef { id: string; name: string; blurb: string; extras: LayoutExtras } // see P1-03
```

**Content modules:**
- English: `src/content/friendspace/{bulletins,bands,top8Reactions}.ts`, `src/content/pixlog/{index,surveys,<friend>}.ts`, and the layouts in `src/content/sites/glittercodez.ts`.
- The existing `src/content/profiles/` **moves** to `src/content/friendspace/profiles/` (and `de/` likewise). Update the imports.
- Each module gets **1–2 sample items** so later UI tasks have something to render. P3 writes the real content.
- **Locale wiring:** extend `LocaleContent` with `bulletins`, `bands`, `top8Reactions`, `pixlog` (profiles), `surveys` and `layouts`, plus accessors `getBulletins(locale)` etc. Wire EN in `locale.ts`; German placeholders go in `de/bundle.ts` (see "v0.4 rules"). Extend `parity.test.ts` and the content lint to the new modules.

**`web` store fields** (`src/content/sites/types.ts` `WebState` + `src/apps/browser/store.ts`):

```ts
myProfile: PlayerProfile & {
  layoutCode?: string;                               // ≤ 2000 chars, parsed at render
  autoplay?: boolean;                                // default true
  moodHistory?: { text: string; emoticon: string; day: number }[]; // ≤ 5, newest first
  top8: PlayerTopEntry[];                            // was ContactId[]
}
type PlayerTopEntry = { kind: 'contact'; id: ContactId } | { kind: 'band'; id: BandId }
                    | { kind: 'extra'; name: string; seed: string };
bulletinsSeen?: number;                              // highest day the bulletins were opened
top8Wall?: { contactId: ContactId; kind: 'dropped' | 'readded'; day: number }[];
pixlog?: { skin: PixlogSkinId; album: { fsNodeId: string; caption: string }[];  // ≤ 24
           surveys: Record<string, string[]>; kudosGiven: Record<ContactId, number[]> };
```

- **Migration:** a `top8` of strings → `{kind:'contact', id}`. Unknown kinds or ids are dropped, there are at most 8 entries, and they are deduped.
- Each field gets its own `sanitize*` function with tests, including a v0.3 fixture: copy `src/test/fixtures/v02-save.json`'s shape, or build a v0.3 one, and assert it loads unchanged except for the `top8` migration.
- Actions: `saveProfile` (existing, widened), `markBulletinsSeen(day)`, `appendTop8Wall(entry)`, `setPixlogSkin`, `setAlbum`, `saveSurvey`, `giveKudos(contactId, day)` (returns false if already given that day).

**The doc covers:** the routes of all three sites, the types above, the store fields, the events (P0-03, P1-02), the layout-code format (summarized; P1-03 owns it), and the derived feed/visitors (P2-02).

### P0-03 — Top 8 drama engine

**Flow** (browser and Messenger don't import each other):
1. **Browser:** `saveProfile` compares old vs new `top8` contact ids. For each removed contact, and each added contact, it emits `web:top8Changed { dropped: ContactId[]; added: ContactId[] }` (new typed event in `src/os/events.ts`).
2. **Messenger runtime** (`src/apps/messenger/runtime.ts`) listens and keeps persisted bookkeeping in the Messenger store: `top8: Record<ContactId, { state: 'dropped' | 'reacted'; day: number }>`.
   - A drop records `{state:'dropped', day: currentDay}` unless one is already pending.
   - An add of a contact in state `dropped` (not reacted yet) deletes the record silently.
   - An add of a contact in state `reacted` deletes the record and queues the `onTop8Readded` trigger.
3. **New triggers** in `src/content/types.ts`: `{ type: 'onTop8Dropped' }` and `{ type: 'onTop8Readded' }`.
   - `onTop8Dropped` arms on the contact's sign-in when a `dropped` record has `day < currentDay`. It is the next day: the friend "noticed overnight". When the script runs, the record becomes `reacted`.
   - `onTop8Readded` fires on the next sign-in, or at once if the contact is online.
   - Both may run again for a new drop (repeatable by record, not `repeat: true`).
   - Follow how `onGameScore`/`onDay` are armed in `engine/`.
4. **After either script ends**, Messenger emits `messenger:top8Reacted { contactId; kind: 'dropped' | 'readded' }`. The browser store's listener appends `top8Wall` with the current day; the wall line text comes from `top8Reactions` content at render.

**Lint and content:**
- `lint.ts` accepts the new triggers; a contact may have at most one script per new trigger.
- Add a minimal `top8-dropped`/`top8-readded` script to **one** contact (Kayla) as a sample, plus German overlay placeholders. P3-01 writes all six.

**Tests:** drop → no reaction the same day; next day's sign-in → script runs once, record `reacted`; re-add before reacting → nothing; re-add after → readded once; wall entries appended; events typed.

### P1-01 — Bulletins

- **Route `/bulletins`:** a list (newest day first, then content order) with sender picture and name, subject, relative day label (`sites/daily.ts` `postedLabel`) and body (through `rich.tsx`). `link` renders as a `SiteLink`.
- **`/me`:** a "Bulletin Space" box with the newest 3 and "view all".
- **Unread dot:** the nav shows "Bulletins (●)" while `bulletinsSeen < currentDay` and some bulletin exists for today. Opening `/bulletins` calls `markBulletinsSeen(day)`.
- Senders: friends link to their profile; extras get a seeded `Picture`.
- **Tests:** day-gating, the dot logic, links; one German UI assertion.

### P1-02 — Band pages, player, autoplay

- **Route `/band/<id>`:** a band profile in its `theme`: name, genre and hometown card, bio, **BandPlayer**, "Upcoming shows" (day-gated, as in the existing Friendspace content) and "Band blog". Bands appear in friends' Top 8 tiles (`TopFriend` band variant) and link here. Fixed paths per band, so Searchly indexes them.
- **BandPlayer** (`friendspace/BandPlayer.tsx`):
  - A black and dark-grey box with a small LCD-style track title, ▶/❚❚, a track list (click to play) and a progress bar.
  - It never owns an `<audio>`. It drives Amplifier through events: `amplifier:enqueue {trackId, play:true}` (existing), plus new `amplifier:control { action: 'pause' | 'resume' | 'stop' }`.
  - It reflects state from the existing `amplifier:trackChanged`/`amplifier:stopped` events. Add a small `amplifier:progress { trackId; position; duration }` event emitted ~1×/s while playing, only if the existing events can't show progress.
  - Amplifier handles `amplifier:control` in its store.
- **Autoplay:**
  - Opening a friend or band profile emits one `amplifier:enqueue {play:true}` for its song per page view.
  - Only when all of these hold: `settings.muted` is false, Amplifier is not currently playing (track the last `trackChanged`/`stopped` in a tiny os-level mirror or the player component state; no import of the amplifier store), and the player's `myProfile.autoplay !== false`.
  - `SongStrip` gets a "■" stop button (`amplifier:control stop`).
  - `/me` and the profile editor get an "Autoplay profile songs" checkbox.
- **Tests:** player state from events, autoplay conditions (muted / already playing / disabled), stop; German UI assertion.

### P1-03 — Layout codes + profile extras

**Format** (`src/apps/browser/sites/friendspace/layoutCode.ts`):

```
<!-- anything in comments is ignored -->
[layout bg=<BackgroundId> text=<#hex> accent=<#hex> panel=<#hex|none> font=<FontId> glitter=<on|off>]
[cursor <CursorId>]
[sticker <StickerId> <top-left|top-right|bottom-left|bottom-right>]   (repeatable, max 4)
```

- **`parseLayoutCode(text: string): LayoutExtras`** is total. Tags are case-insensitive. Unknown tags, keys and values are ignored, the last value wins, and there are max 4 stickers. Input is capped at 2000 characters. Never throws.
  - `LayoutExtras = { background?: BackgroundId; text?; accent?; panel?: string | 'none'; font?: FontId; glitter?: boolean; cursor?: CursorId; stickers: {id, pos}[] }`.
- **`layoutCodeFor(extras, name?)`** writes the canonical code with a header comment `<!-- GlitterCodez.example layout: <name> -->`. Round-trip: `parseLayoutCode(layoutCodeFor(x))` deep-equals `x`.
- **Fixed sets** (original, CSS-only or hand-written SVG):
  - **Backgrounds (10):** `starry`, `leopard`, `pastel`, `emo-stripes`, `rainbow`, `grunge`, `matrix`, `hearts`, `checker`, `clouds`. Each is a CSS background (gradients/repeating patterns).
  - **Fonts (6):** `comic`, `tahoma`, `verdana`, `courier`, `impact`, `georgia`. These are CSS font stacks; no font files.
  - **Stickers (6 SVGs in `src/assets/stickers/`):** `star`, `heart`, `skull`, `pony`, `music`, `smiley`.
  - **Cursors (3):** `sparkle`, `hearts`, `stars`. This is a trail of small CSS shapes following the pointer **inside the profile area only**, throttled, with at most ~12 nodes. It is off under `prefers-reduced-motion`.
- **Rendering:** the theme for `/me` = the preset or custom theme (existing `playerTheme`) with the parsed `LayoutExtras` on top. `ProfileView` renders the glitter headline (a CSS shimmer animation, static under reduced motion), stickers absolutely positioned in the profile frame, and the cursor trail.
- **Editor:** a "Layout code" `<textarea>` (with a hint "paste your code from glittercodez.example!") and a live preview of the parsed result.
- **Comment graphics:** wall comments with `graphic` render a small original badge above the text ("Thanks for the add!!" glitter box, hug, glitter heart), as CSS/SVG.
- **Mood history:** on save, if the mood changed, prepend `{text, emoticon, day}` (max 5). `/me` shows "Mood history" under the ID card.
- **Tests:** the parser (valid, junk, unknown, partial, case, caps, 10k-char input), round-trip for random extras, rendering of each extra, reduced motion. Add `docs/decisions.md` lines.

### P1-04 — GlitterCodez site

- **Look:** host `glittercodez.example`, "GlitterCodez – free layouts 4 ur profile!!". A 2007 layout site: dark purple background, hot-pink headings, an animated "NEW!!" badge (static under reduced motion), a fake "1.337.420 layouts copied" counter, a "link back 2 us plz" box. Original SVG logo.
- **Routes:**
  - `/`: the gallery of `layouts` from content. Each tile has a mini preview (a scaled-down `ProfileView`-like box rendered with the layout's extras), the name and blurb, a read-only `<textarea>` with `layoutCodeFor(extras, name)`, and a "Copy code!!" button (`navigator.clipboard.writeText`; fallback: select the textarea text and show "press Ctrl+C!!").
  - `/glitter`, `/stickers`, `/cursors`: codes for single tags.
- **Wiring:** Searchly indexes it via `meta(locale)`, and Friendspace's editor hint links here.
- **Tests:** every tile's code parses back to its layout; Copy uses the clipboard and falls back; German UI assertion.

### P1-05 — Top 8 editor + drama UI

- **Editor** (replaces the reorder-only list): 8 slots.
  - Each slot has a picker of friends, then bands, then extras gathered from friends' Top 8s. It also has ▲/▼ and ✕.
  - "Add" appears while there are fewer than 8 entries. Duplicates are prevented.
  - Keyboard operable; `aria-label`s.
- **Saving** uses `saveProfile` (P0-02), which emits `web:top8Changed` (P0-03).
- **Wall:** `/me` merges `top8Wall` entries with the existing `playerWall`, sorted by day. Each entry renders the friend's `top8Reactions` `dropped`/`readded` line in the current locale, with their picture.
- **Mood history** UI if P1-03 didn't finish it.
- **Tests:** add, remove and reorder; the event is emitted with the right diff; wall entries render; German UI assertion.

### P2-01 — Pixlog shell

**Look:** clearly not Friendspace.
- white page, orange (`#ff7f00`-ish) header bar with a rounded original "pixlog" wordmark (lowercase, a camera-shutter "o")
- rounded tabs, big square thumbnails, light grey boxes, Verdana 11px
- six **skins** recolour the header and tabs

**Routes:**
- `/`: a login splash ("log in" goes to `/me`) and a placeholder for the shouts feed (P2-02).
- `/<friend>`: a fixed path per profile, tabs via `?tab=profile|photos|blog|surveys|guestbook` (default `profile`):
  - **profile:** picture (reuse the Friendspace `Picture`), about, skin, latest album thumbnails, kudos count (P2-03).
  - **photos:** album grid, linking to `/album?id=`.
  - **blog:** day-gated posts.
  - **surveys:** the friend's survey, questions and answers.
  - **guestbook:** day-gated entries.
- `/album?id=<albumId>`: photos rendered with the existing `renderPhoto`, at large size with prev/next. Each shows its caption and its day-gated comments.

**Also:** Searchly indexes the friend pages; tests per route and a German UI assertion.

### P2-02 — Pixlog logic: feed + visitors

In `src/apps/browser/sites/pixlog/logic.ts`, all pure and tested:
- **`shoutsFeed(profiles, day, locale)`** returns items `{ day, contactId, kind: 'shout' | 'album' | 'blog', text? , albumId?, count? }`, newest day first. Album and blog items come from content items whose `day` equals the item's day. The text for those generated items comes from the catalog at render (`sites.pixlog.feed.album`: "{name} added {n} photos to „{title}"" etc.), so it localizes.
- **`visitors(profiles, day)`** returns up to 8 per day: friends with any Pixlog content that day, plus seeded strangers from a fixed name list in content (`pixlog/index.ts` `STRANGERS`, ~12 2007-style screen names), using `mulberry32(seedFrom('pixlog:visitors:' + day))`.
- **`visitorCount(day)`** grows monotonically (seeded per day).

**UI:** the home feed, and a "Who visited my profile" box (pictures + names + day labels) used by `/me` in P2-03.

### P2-03 — Pixlog `/me`

- **Header:** your name and picture (`playerPicture`), visitor counter, visitors box, "Kudos received: N" (sum of friends' `kudosToPlayer` days ≤ today).
- **Kudos:** on a friend's page, "Give kudos ★" calls `giveKudos(contactId, day)`. It's disabled once given that day ("Kudos given today!"). The count shown is content-free: the friend's base count is seeded, plus yours.
- **Album:**
  - "Add photos" opens a picker of My Pictures (`FS_FOLDERS.pics` children with `photo` or `blobKey`), shown as thumbnails.
  - Images render with the existing fs image rendering (procedural via `renderPhoto`, blob via `blobStore`).
  - Captions are editable (≤ 80 chars); remove; max 24 photos. Entries whose node is gone are filtered at render.
- **Surveys:** pick a survey from `surveys` content, fill in answers (≤ 80 chars each), "Post to my profile". It's shown on `/me` and can be edited later.
- **Skin picker:** 6 swatches.
- **Tests:** kudos once per day; album add, caption, remove and deleted node; survey save and edit; German UI assertion.

### P3 — common content rules (P3-01…P3-04)

- **Read first:** the Content rubric (Gate procedure), the existing friends' scripts, profiles, mail and site content. Keep every storyline consistent: the Tinfoil Comets concert, the bio cell project with Mr Dalton, Velvet Lantern band life, Pia's ponies, Kayla vs Brianna (sleepover invite by email, day 4), Dex's kickflip and skate video.
- **Day-gate everything** to days 1–5, so the new content follows what happens in chat that day: no spoilers before the chat reveals it.
- **Placeholders:** keep each German placeholder module structurally in sync (same ids, counts, days). Copy the English text into it; P4 translates.
- **After writing:** run the lint and playthrough tests, and look at your pages in the dev server (screenshots in the done note are welcome).

### P3-01 — Friendspace content

- **~15 bulletins** across days 1–5, from friends and Top 8 extras:
  - 3 chain letters (one per category: luck, crush, "if u don't repost")
  - 2 surveys ("bulletin survey: 20 qs about me")
  - "NEW PICS on pixlog!!" bulletins linking `pixlog.example/<friend>` on the days their albums appear
  - Tinfoil Comets concert promos and aftermath
  - Pia's pony club announcement
  - Marco's dry "this is not a chain letter"
- **4 bands:**
  - Tinfoil Comets (existing fan site; the concert)
  - Velvet Lantern (Dex/Marco band life; check the existing content for who is in it)
  - two more original bands, one per remaining playlist artist group
  - Each lists its `trackIds` from `src/content/playlist.ts` (shipped CC BY tracks only), with a bio, shows (the concert on its day) and 2–3 blog lines.
- **Top 8:** add a band to 3 friends' Top 8s (replacing an extra).
- **Top 8 drama:** a `top8-dropped` and a `top8-readded` script (2–4 lines each, one choice node at most) for each of the 6 friends, in their voice, plus wall lines in `top8Reactions`. Examples of tone:
  - Kayla: dramatic
  - Jess: CAPS hurt then over it
  - Dex: "wait was i in it"
  - Theo: apologetic, as if it were his fault
  - Marco: dry
  - Pia: tells mom
- **Comment graphics:** add `graphic` to ~6 existing wall comments where it fits ("thx for the add!!").

### P3-02 — Pixlog content per friend (P3-02: Jess, Kayla, Pia · P3-03: Marco, Theo, Dex)

Per friend:
- `skin`, `about`
- **1–2 albums** of 4–6 photos (scenes from `PhotoScene`), with captions in voice and 0–3 comments per photo from other friends or extras, on the album's day or later. The albums tie into story days, e.g.:
  - Jess: concert album on day 5
  - Kayla: sleepover drama
  - Pia: ponies
  - Dex: skate session
  - Theo: bio project / camp
  - Marco: band rehearsal
- **2–4 blog posts** on different days.
- **1 survey**, answering every question of one survey in `pixlog/surveys.ts`. Define ~3 surveys there (P3-02 writes them; P3-03 reuses them), e.g. "25 things about me" and "this or that".
- **shouts** on each of days 1–5 (1–2 per day)
- `kudosToPlayer` on 1–3 days
- **3–6 guestbook entries**

### P3-04 — GlitterCodez layouts + mail

- **12 layouts:** Emo Black/Pink, Pony Pastel, Starry Night, Leopard Luxe, Rainbow Glitter, Skater Grunge, Gamer Green (matrix), Hearts 4 Ever, Checkerboard Punk, Cloud Dreams, Midnight Purple, Sunset Beach.
  - Each has a 2007 blurb ("omg my fave!!! ~*~") and extras that look good. Screenshot each preview and fix ugly ones.
- **Text:** `/glitter`, `/stickers`, `/cursors` page text; site chrome text.
- **Mail:**
  - `d2-pixlog-visitors`: "You have 3 new visitors on Pixlog!", from `noreply@pixlog.example`, with a link.
  - `d4-friendspace-bulletin`: from `noreply@friendspace.example`, about Jess's bulletin, with a link.

### P4-01 — German content (common for P4-01…P4-03)

**Read first:** `docs/localization-de.md`, the "German content rubric", and the v0.3 German content for each friend's German voice.

**For every placeholder:**
- Replace it with German, written for a German 2007, not translated literally.
- Keep the structure: same ids, counts, days, scenes and seeds.
- Remove the `// P4 replaces this` comment.
- Contacts' new scripts (`top8-dropped`/`top8-readded`) get overlay entries in `src/content/de/contacts/<id>.ts`, with the same lines and choices count.

**Then:**
- Add "differs from English" assertions for the new modules to `src/content/fallback.test.ts`.
- Extend `docs/localization-de.md` with the v0.4 glossary (the "Names" table in "v0.4 rules") and any new recurring terms.
- **P4-01** covers Friendspace (bulletins, bands, reactions), GlitterCodez (layouts' names and blurbs, page text) and the two mails. **P4-02/P4-03** cover the Pixlog profiles as split in their rows, and `pixlog/surveys.ts` plus `STRANGERS` (in P4-02).

### P4-02 — German Pixlog content

Follow §P4-01 for the Pixlog profiles named in the row; P4-02 also translates `pixlog/surveys.ts` and `STRANGERS`.

### P5-01 — v0.4 e2e

`tests/e2e/v04-*.spec.ts`, default suite, with helpers from `tests/e2e/helpers.ts`:
1. `spaceport.example/jess` opens Friendspace Jess. A favorite saved as Spaceport opens Friendspace.
2. Copy a code on GlitterCodez → paste it into the Friendspace editor → save → `/me` shows its background and stickers.
3. Band page: play → the Amplifier window shows the track; mute → no autoplay on a profile.
4. Bulletins dot visible → open `/bulletins` → dot gone.
5. Drop Kayla from the Top 8 → Turn Off → next day, sign in to Messenger → Kayla's reaction opens. `/me` wall shows her line. Re-add → happy line.
6. Pixlog: give kudos (button then disabled); add a Snapshot Booth picture to your album; post a survey.
7. German: run 2 and 6 with `test.use({ locale: 'de-DE' })` and German assertions.

### P5-02 — Docs + release notes

- **README:** features list (Friendspace, Pixlog, GlitterCodez), a screenshot or two, known gaps.
- **CREDITS:** new SVGs (stickers, logos) as original work.
- **Architecture:** update `docs/architecture-v0.4.md` to match what was built.
- **Release notes:** `docs/release-notes-v0.4.0.md` (English + „Auf Deutsch" summary), in the style of v0.3.0.

### Gate notes for P5-G

- Play days 1–3 in English and 4–5 in German across all three sites and Messenger. Include one Top 8 drop and re-add, one pasted layout, one album and kudos.
- Report `npm run build` chunk sizes: the main and App chunks vs v0.3.1 (index ~184 kB, App ~183 kB, English content ~159 kB, German ~197 kB). German must stay in its lazy chunk (`tests/e2e/i18n-detect.spec.ts` green).
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

- **Run it:** `igris arise P0 --through P5` inside herdr or tmux (`igris.toml` sets yolo mode, auto-commit and 5 verify attempts). Nothing is pushed or tagged.
- **Afterwards, review:**
  - `docs/review/v04-P0.md` … `v04-P5.md` (with EN + DE screenshots)
  - the new German content (`src/content/de/friendspace`, `src/content/de/pixlog`)
  - `docs/decisions.md`
  - `docs/release-notes-v0.4.0.md`
  Then push, check the live site, and tag `v0.4.0` if you want.
- **Design:** `docs/superpowers/specs/2026-10-15-v04-social-design.md` (the agreed brainstorm).
- **Existing saves** keep working: Spaceport favorites redirect to Friendspace, and the Top 8 migrates.
- igris can still stop for any of these:
  - verify failing 5× in a row
  - a crashed session
  - editing this file mid-run
  - a session idling without `igris done` after its reminder
