# still-online — MVP plan

<!-- igris:format 1 -->

This is the build plan for the first playable version of still-online, written for [igris](https://github.com/drilonrecica/igris). Each task row runs in its own fresh Claude Code session, so **everything a session needs is written down in this file.** Read the whole brief and the global rules before starting any task.

```sh
igris check --strict   # validate this plan
igris phases           # list phases
igris arise M0         # run a phase
```

---

# Project brief

still-online is a browser-based nostalgia simulator. The player boots a Windows XP–style desktop that is frozen in **2007**, signs in to an MSN-style messenger, chats with fictional friends and plays music in a Winamp-style player. The world is meant to feel *lived in*: friends sign in, message you, nudge you and react to what you're listening to.

## MVP scope (this plan)

1. **XP-style shell**
   - Boot, login, desktop, icons, taskbar, start menu, tray clock
   - A window manager with drag, resize, minimize, maximize and focus
   - Sounds, plus persistence of state in the browser
2. **Messenger:** an MSN-style instant messenger with 6 scripted fictional contacts, chat windows, emoticons, nudges, toasts and "now playing".
3. **Amplifier:** a Winamp-style music player with an original skin, a playlist, a visualizer, and 3–5 freely licensed tracks.
4. **Delivery:**
   - CI on every push/PR
   - Automatic deploy to GitHub Pages at `https://drilonrecica.github.io/still-online/`

## Explicitly out of scope (do NOT build these now)

- Netlog / MySpace-style profile pages
- Any backend, accounts, multiplayer, real networking or AI-generated chat
- A full "living world" simulation. The MVP only has scripted triggers: on sign-in, after N minutes, on track change.
- Internet Explorer / browser emulation, Paint, Minesweeper, other apps
- Mobile-first layout. We only show a "best on desktop" notice.
- i18n. All UI copy is English.

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

## npm scripts (created in M0-01, must keep working)

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
tests/e2e/                   # Playwright specs
docs/                        # architecture.md, content-format.md, etc.
```

Tests sit next to the code as `*.test.ts(x)`. Use path alias `@/` → `src/`.

## Code conventions

- Use function components and hooks. Use named exports, except where React.lazy needs a default export.
- Keep logic (stores, engines, reducers) in plain TS that can be tested without React. Components stay thin.
- Use no `any`. Use no default-exported objects for config. Keep each file under ~300 lines; split if bigger.
- Cross-app communication goes **only** through `src/os/events.ts`, never through direct imports between `src/apps/*` folders.
- Every user-facing interactive element is keyboard reachable and has a visible focus style. Interactive icons need an `aria-label`.
- Respect `prefers-reduced-motion`: disable shakes, marquees and visualizer animation, or reduce them to static.

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
- Songs and bands mentioned in chats are fictional too, unless they are tracks actually shipped in `public/music/`.
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
| Wallpaper | Pure CSS: blue sky gradient + green rolling hill (radial/linear gradients). No photos. |
| Sounds | Synthesized at runtime with Web Audio oscillators/envelopes in `src/os/sound.ts`. No audio files needed for UI sounds. |
| Storage | `localStorage`, keys prefixed `still-online:v1:`; on a version mismatch, discard and start fresh. |
| Animations | Short (≤ 250ms), except boot (~3s) and the nudge shake (~500ms). |
| Window defaults | New windows open cascaded (+24px x/y from the last one, wrapping), min size 240×140, never fully off-screen (keep ≥ 40px of titlebar visible). |
| Unknown visual detail | Match the XP "Luna Blue" look as closely as possible in original CSS. Use the tokens in "Visual reference" below. |
| Unclear test scope | Unit-test every store action and engine function. Add one Playwright happy path per user-visible feature. |

---

## M0 — Foundation

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M0-01 | **Project scaffold** — implement exactly as described in "Task specs → M0-01" below. | — | done | sonnet | agent | — | — | — | `npm ci && npm run verify` passes; one Vitest test renders `<App/>` and finds "still-online"; `npm run build` emits `dist/index.html` with asset URLs under `/still-online/`; page `<title>` is `still-online`. | §M0-01 |
| M0-02 | **Playwright setup** — `playwright.config.ts` (Chromium only, `webServer` = `npm run build && npm run preview -- --port 4173 --strictPort`, `baseURL` `http://localhost:4173/still-online/`), `tests/e2e/smoke.spec.ts` that loads the page and sees "still-online". Exclude `tests/e2e` from Vitest. | M0-01 | done | sonnet | agent | — | e2e | — | `npx playwright install chromium && npm run e2e` passes locally; Vitest does not pick up e2e specs. | — |
| M0-03 | **CI workflow** — `.github/workflows/ci.yml`: on `pull_request` and `push` to `master`; ubuntu-latest; `actions/setup-node` with `node-version-file: .nvmrc` and npm cache; `npm ci`, `npm run verify`, `npx playwright install --with-deps chromium`, `npm run e2e`; upload `playwright-report` as artifact on failure. | M0-02 | done | sonnet | agent | — | — | — | YAML is valid (`npx --yes yaml-lint` or equivalent check passes); every step maps to an existing npm script; no secrets needed. | — |
| M0-04 | **GitHub Pages deploy workflow** — implement exactly as described in "Task specs → M0-04" below. | M0-01 | done | sonnet | agent | — | — | — | Workflow YAML is valid; uses current major versions of the official actions; `npm run build` locally still works with `.nojekyll` in `dist/`. | §M0-04 |
| M0-05 | **Enable GitHub Pages** — in GitHub → repo `drilonrecica/still-online` → Settings → Pages → Source: **GitHub Actions**. | — | done (enabled by owner) | — | user | — | — | — | Pages source is "GitHub Actions". | — |
| M0-06 | **Credits & asset skeleton** — `CREDITS.md` with a short intro (asset policy summary from "Content and asset rules") and a table `File \| Source \| Author \| License`; create `src/assets/icons/`, `src/assets/emoticons/`, `public/music/` with `.gitkeep`; add a "Credits" link in README's License section. | M0-01 | done | sonnet | agent | — | — | — | Files exist; README links to CREDITS.md; verify passes. | — |
| M0-G | **M0 gate (self-review)** — follow "Task specs → Gate procedure"; also confirm `npm run preview` serves the app correctly under `/still-online/` (assets load, no 404s in the console). | M0-01…M0-06 | done | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/M0.md` written; preview at `/still-online/` works. | §Gate |

## M1 — XP shell

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M1-01 | **Shell architecture** — implement exactly as described in "Task specs → M1-01" below. | M0-G | done | opus | agent | — | none | — | Doc + `src/os/types.ts` + `src/os/events.ts` (implemented + unit-tested, it's tiny) + `src/os/clock.ts` (implemented + tested, incl. Feb 29 rule); later M1 tasks can implement without design questions. | §M1-01 |
| M1-02 | **Theme & wallpaper** — install `xp.css`, import it globally; `src/os/theme/tokens.css` with the "Visual reference" tokens as CSS variables; global reset (no page scroll, `user-select: none` on chrome, full-viewport desktop); CSS-only Bliss-like wallpaper (original gradients) on the desktop root. | M1-01 | done | sonnet | agent | — | — | — | Desktop root fills the viewport with the wallpaper; xp.css styles a sample button; no font files or images added. | — |
| M1-03 | **Window manager store** — `src/os/store/windows.ts` (Zustand): `openApp(appId, props?)` (respects `singleInstance` by focusing the existing window), `closeWindow`, `focusWindow` (brings to top, un-minimizes), `minimizeWindow`, `toggleMaximize`, `moveWindow`, `resizeWindow` (enforce minSize), `activeWindowId` selector; cascade placement and off-screen clamping per "Defaults". | M1-01 | done | opus | agent | — | fast | — | Unit tests cover every action incl. singleInstance, z-order after focus, minimize→focus restores, clamp keeps 40px titlebar visible, cascade wraps. | — |
| M1-04 | **Window component** — implement exactly as described in "Task specs → M1-04" below. | M1-03 | done | opus | agent | — | fast | — | Testing Library tests: buttons call store actions; focus on mousedown; drag updates position (simulate pointer events). Manual check in `npm run dev` noted in done note. | §M1-04 |
| M1-05 | **App registry + starter apps** — implement exactly as described in "Task specs → M1-05" below. | M1-04 | done | sonnet | agent | — | — | — | All three open via `openApp`; Notepad text survives reload; reset clears storage; icons listed in CREDITS.md as original work. | §M1-05 |
| M1-06 | **Desktop icons** — `src/os/desktop/`: icons for apps with `showOnDesktop`, arranged in a column top-left (grid 75×75); single click selects (blue highlight), click empty desktop deselects, double-click or Enter opens; arrow keys move selection; label has XP text shadow. | M1-05 | done | sonnet | agent | — | fast | — | Tests for select/deselect/open/keyboard; icons not draggable (out of scope). | — |
| M1-07 | **Taskbar & tray** — `src/os/taskbar/`: 30px Luna taskbar fixed bottom; green Start button (original CSS, text "start"); one button per open window (icon + truncated title; active = pressed look; click active → minimize, click other → focus); tray with mute toggle icon (uses sound store) and clock from `clock.ts` (`h:mm AM/PM`, tooltip full date with year 2007, updates every minute). | M1-05 | done | sonnet | agent | — | fast | — | Tests: button click toggles minimize/focus; clock shows year 2007 in tooltip; mute toggles setting. | — |
| M1-08 | **Start menu** — implement exactly as described in "Task specs → M1-08" below. | M1-07 | done | sonnet | agent | — | fast | — | Tests: opens/closes, launching opens app and closes menu, Log Off returns to login, Escape closes. | §M1-08 |
| M1-09 | **Boot, login & session flow** — implement exactly as described in "Task specs → M1-09" below. | M1-08 | in progress | sonnet | agent | — | fast | — | Tests for session transitions; name persisted; boot skip works; reduced-motion shows static progress. | §M1-09 |
| M1-10 | **Sound service** — `src/os/sound.ts`: lazily created AudioContext (resumed on first user gesture), synthesized original sounds: `startup`, `logon`, `logoff`, `error`, `notify` (messenger ping), `nudge`, `click`; volume + mute in settings store (persisted); `playSound(name)` is a no-op when muted or before a gesture. Wire startup/logon/logoff/error into the shell. | M1-09 | blocked | sonnet | agent | — | fast | — | Unit tests with a mocked AudioContext: muted → nothing plays; each name maps to a definition. Sounds are pleasant and short (≤ 2s, startup ≤ 4s). | — |
| M1-11 | **Persistence** — `src/os/persist.ts` + Zustand `persist` on settings (name, mute, volume, firstBootDone), windows (open windows with geometry; restored on login, not during boot) and Notepad; keys `still-online:v1:<store>`; version mismatch → reset. | M1-10 | blocked | sonnet | agent | — | fast | — | Tests: round-trip each store; corrupted JSON doesn't crash (falls back to defaults). | — |
| M1-12 | **Shell E2E** — `tests/e2e/shell.spec.ts`: boot (skip) → enter name → desktop → double-click Notepad → type → drag window → minimize via taskbar → restore → reload page → Notepad text and name persist → Start → Turn Off → power on. | M1-11 | blocked | sonnet | agent | — | e2e | — | Spec passes headless; no `waitForTimeout` over 500ms (use locators/expect polling). | — |
| M1-G | **M1 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: login screen, desktop, Start menu open, two overlapping windows (one focused), off screen. | M1-01…M1-12 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; screenshots in `docs/review/M1/`; regressions fixed; `docs/review/M1.md` written. | §Gate |

## M2 — Messenger (MSN-style)

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M2-01 | **Content format** — implement exactly as described in "Task specs → M2-01" below. | M1-G | blocked | opus | agent | — | none | — | Types compile; doc includes one complete small example script; design supports everything in M2-02…M2-07 without changes. | §M2-01 |
| M2-02 | **Conversation engine** — implement exactly as described in "Task specs → M2-02" below. | M2-01 | blocked | opus | agent | — | fast | — | Thorough Vitest suite with fake timers: ordering, branching, each trigger type, reload/resume without duplicates, nudge events. | §M2-02 |
| M2-03 | **Messenger main window** — implement exactly as described in "Task specs → M2-03" below. | M2-02 | blocked | sonnet | agent | — | fast | — | Tests: sign-in flow, grouping/counts, status changes reflect live, personal message edit persists. | §M2-03 |
| M2-04 | **Chat window** — implement exactly as described in "Task specs → M2-04" below. | M2-03 | blocked | opus | agent | — | fast | — | Tests: emoticon parser (unit), sending a choice advances the engine, nudge rate limit, shake respects reduced motion. | §M2-04 |
| M2-05 | **Contacts & scripts** — implement exactly as described in "Task specs → M2-05" below. | M2-02 | blocked | opus | agent | — | fast | — | Content type-checks; a Vitest "content lint" test validates every script graph (all `next` ids exist, no unreachable nodes, every choice leads somewhere, no real-looking emails/URLs). | §M2-05 |
| M2-06 | **Toast notifications** — bottom-right above tray, XP/MSN-style slide-up toast (≤ 4s, stack max 3): "<name> has just signed in." and "<name> says: <first 40 chars>…"; `notify` sound; click opens the chat. Only when the chat window isn't the focused window. | M2-04 | blocked | sonnet | agent | — | fast | — | Tests: toast appears/disappears, click opens chat, suppressed when chat focused. | — |
| M2-07 | **Now playing (event side)** — player's "Show what I'm listening to" toggle in the contact-list header; when on and an `amplifier:trackChanged` event arrives, personal message shows `♫ <Artist> - <Title>`; engine `onNowPlaying` triggers fire. Add a dev-only helper to emit a fake track event (until M3). | M2-05, M2-06 | blocked | sonnet | agent | — | fast | — | Tests: event → personal message updates; trigger fires once per trackId. | — |
| M2-08 | **Messenger E2E** — `tests/e2e/messenger.spec.ts`: log in → open Messenger → sign in → (use a test-only fast clock, e.g. `?speed=fast` query param that multiplies timers by 0.01, documented in architecture.md) → contact signs in toast → open chat → receive message → pick a choice → receive reply → receive/send nudge. | M2-07 | blocked | sonnet | agent | — | e2e | — | Spec passes headless in < 60s; fast-clock flag only affects timers. | — |
| M2-G | **M2 gate (self-review)** — follow "Task specs → Gate procedure"; also play through every contact's opening script (fast clock) and apply the content rubric in "Task specs → Gate procedure". | M2-01…M2-08 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; every script played through; rubric issues fixed; `docs/review/M2.md` written. | §Gate |

## M3 — Amplifier (Winamp-style player)

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M3-01 | **Music candidates** — find 8–10 tracks under **CC0 or CC BY 4.0** that fit a 2007 teen vibe (pop-punk, indie, electro, emo, R&B-ish instrumentals ok), each ≤ 5 MB MP3/OGG. Write `docs/music-candidates.md`: title, artist, genre, length, license, source page URL, direct download URL. Don't download yet. | M2-G | blocked | sonnet | agent | — | none | — | ≥ 8 candidates, every license verified on the source page and linked. | — |
| M3-02 | **Pick the tracks** — choose 3–5 tracks from `docs/music-candidates.md` (or generate them) exactly as described in "Task specs → M3-02"; record the choice and reasons in the doc. | M3-01 | blocked | sonnet | agent | — | none | — | 3–5 tracks chosen or generated; every choice meets the criteria; decision logged in `docs/decisions.md`. | §M3-02 |
| M3-03 | **Add tracks** — download the chosen tracks (or copy the generated ones) into `public/music/` (kebab-case filenames), add rows to `CREDITS.md` (with required CC BY attribution text), create `src/content/playlist.ts` (id, title, artist, file, durationSec, license). | M3-02 | blocked | sonnet | agent | — | — | — | Files present; total ≤ 25 MB; CREDITS complete; playlist type-checks. | — |
| M3-04 | **Playback store** — `src/apps/amplifier/store.ts` (Zustand) wrapping one `HTMLAudioElement`: load playlist, play/pause/stop/next/prev, seek, volume (persisted), shuffle, repeat, auto-advance on `ended`; emits `amplifier:trackChanged` / `amplifier:stopped` on the event bus; respects global mute. | M3-03 | blocked | sonnet | agent | — | fast | — | Unit tests with a mocked Audio element for every action, auto-advance, shuffle without immediate repeats, events emitted. | — |
| M3-05 | **Amplifier main window** — implement exactly as described in "Task specs → M3-05" below. | M3-04 | blocked | sonnet | agent | — | fast | — | Tests: controls call store; time formatting unit-tested; marquee static with reduced motion; keyboard: Space play/pause when focused, arrows seek. | §M3-05 |
| M3-06 | **Playlist panel** — toggled by "PL", attached under the main window (same window, grows height): numbered list with durations, current track highlighted, double-click/Enter plays, total time footer. | M3-05 | blocked | sonnet | agent | — | fast | — | Tests: toggle, highlight follows current track, double-click plays. | — |
| M3-07 | **Visualizer** — small canvas (~76×16 CSS px, crisp pixel bars) in the main window using Web Audio `AnalyserNode` via `createMediaElementSource` (shared AudioContext from `sound.ts`); 19 bars with falling peaks, ~30fps; click cycles bars → oscilloscope → off; static when paused or reduced motion. | M3-05 | blocked | opus | agent | — | fast | — | Draw function unit-tested with a fake analyser; AudioContext created only once; no errors when audio element is reused. | — |
| M3-08 | **Messenger integration** — remove the M2-07 dev helper from production builds; real `amplifier:trackChanged` events drive "now playing"; ensure at least one contact script reacts to now-playing (add one if M2-05 didn't). | M3-05, M2-07 | blocked | sonnet | agent | — | fast | — | Test: playing a track updates the player's personal message when the toggle is on. | — |
| M3-09 | **Amplifier E2E** — `tests/e2e/amplifier.spec.ts`: open Amplifier → play (launch Chromium with `--autoplay-policy=no-user-gesture-required` and use a tiny silent fixture via route interception if real files are slow) → time advances → next track → playlist toggle → Messenger shows now playing. | M3-06, M3-07, M3-08 | blocked | sonnet | agent | — | e2e | — | Spec passes headless. | — |
| M3-G | **M3 gate (self-review)** — follow "Task specs → Gate procedure"; screenshots: Amplifier playing with visualizer, playlist open, Messenger showing now playing. | M3-01…M3-09 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; screenshots in `docs/review/M3/`; `docs/review/M3.md` written. | §Gate |

## M4 — Release v0.1.0

| ID | Task | Deps | Status | Model | Owner | Mode | Verify | Timeout | Acceptance | Spec |
|---|---|---|---|---|---|---|---|---|---|---|
| M4-01 | **Accessibility pass** — add `@axe-core/playwright` (dev dep); e2e checks for login, desktop with Start menu open, Messenger chat, Amplifier; fix all serious/critical violations; verify full keyboard path: login → Start → open Messenger → chat → close. | M3-G | blocked | sonnet | agent | — | e2e | — | No serious/critical axe violations; keyboard path documented in done note. | — |
| M4-02 | **Performance pass** — lazy-load every app (`React.lazy` in registry); initial JS ≤ 250 KB gzip (check `vite build` output); no layout thrash during window drag (use `transform` while dragging, commit position on pointerup); music `preload="none"`. | M3-G | blocked | sonnet | agent | — | e2e | — | Build output shows initial chunk within budget; drag is smooth (note the profiling result in done note). | — |
| M4-03 | **Small-screen notice** — under 900px width or on coarse pointers, show an XP-style dialog over the boot screen: "still-online is best experienced on a desktop computer." with "Continue anyway"; remember dismissal. | M3-G | blocked | sonnet | agent | — | fast | — | Tests: shown under 900px, not shown after dismissal. | — |
| M4-04 | **README & screenshots** — implement exactly as described in "Task specs → M4-04" below. | M4-01, M4-02, M4-03 | blocked | sonnet | agent | — | — | — | Screenshots exist and show original assets only; README links work; no claims about unbuilt features. | §M4-04 |
| M4-G | **Release-ready gate (self-review)** — follow "Task specs → Gate procedure", then write `docs/release-notes-v0.1.0.md` (highlights, what's in it, known issues, credits pointer). **Do not tag, push or create a release** — the owner does that. | M4-01…M4-04 | blocked | sonnet | agent | — | e2e | — | verify + e2e pass; `docs/review/M4.md` and `docs/release-notes-v0.1.0.md` written; nothing pushed or tagged. | §Gate |

---


# Task specs

Full descriptions for tasks whose row points here. The Acceptance cell in the row still applies.

## Specs

### Gate — Gate procedure (all phase gates)

1. Run `npm run verify` and `npm run e2e` and fix any failure.
2. Write `tests/e2e/review-<phase>.spec.ts`, tagged `@review` and excluded from the default `e2e` run via `grepInvert`. It saves the screenshots named in the gate's row to `docs/review/<phase>/` at 1280×800. Run it with `npx playwright test --grep @review`.
3. **Look at every screenshot** with your image-reading tool. Fix the obvious problems:
   - broken layout or overlap
   - missing icons
   - unstyled elements
   - text overflow
   - anything that looks un-XP-like or violates the asset rules
4. Review this phase's code against the Acceptance cells of its tasks. Do any missing work that is small (≤ ~30 min). List larger gaps as follow-ups.
5. Write `docs/review/<phase>.md`:
   - what was built
   - how to try it (`npm run dev`, then the steps)
   - the screenshots, linked
   - fixes made in this gate
   - known gaps and follow-ups
6. Re-run verify + e2e, then finish with `igris done`. Don't push.

**Content rubric (M2 gate):**
- Each contact has a distinct voice.
- It feels like 2007 MSN: lowercase, "lol", "brb", emoticons, ~*decorated*~ names.
- The content is PG-13.
- No real people, celebrities or real email addresses or URLs.
- Brands and bands are only mentioned in passing, never as characters.
- Every node is reachable, and every branch has an ending.
- No typos, except intentional chat-speak.
- No anachronisms (smartphones, apps, "DM", "selfie", streaming services).

### M3-02 — Pick the tracks

**Selection criteria**, every one required:
- The license is CC0 or CC BY 4.0, and the source page itself says so. "Royalty-free" alone isn't enough.
- The direct download URL works (`curl -I` returns 200), and the file is MP3 or OGG and ≤ 5 MB.
- No vocals that name real people or brands.

Aim for a mix of moods: upbeat pop-punk/indie, electro/dance, and something chill.

**Choose 3–5 tracks:**
- Prefer CC0 over CC BY.
- Prefer instrumentals when quality is equal.
- Mark the chosen tracks in `docs/music-candidates.md` with ✅ and a one-line reason each.

**Fallback.** Use it when fewer than 3 candidates meet every criterion, or there's no network:
1. Write `scripts/gen-music.mjs` (Node, no dependencies). It renders **3 original synth tracks**, each 60–90 s, 44.1 kHz:
   - an upbeat pop-punk-ish chord progression with a drum pattern
   - an electro arpeggio track
   - a chill pad track
2. Render them to WAV in `public/music/`. If `ffmpeg` is on `PATH`, convert them to OGG (q4) and delete the WAVs. Keep the total ≤ 25 MB.
3. Give the tracks fictional artist and title names that fit 2007, e.g. "The Dial-Up Kids — Away Message".
4. Credit them as "original work (generated by scripts/gen-music.mjs)".

If 1–2 real tracks qualify, ship them and generate the rest up to 3.

### M0-01 — Project scaffold

Vite + React 18 + TS app in the repo root with every tool and npm script in "Global rules": `.nvmrc` (24), strict tsconfig with `@/` alias, ESLint flat config, Prettier, Vitest + jsdom + Testing Library setup file, `base: '/still-online/'`. `App.tsx` renders a placeholder "still-online" text. Add `node_modules`, `dist`, `playwright-report`, `test-results` to `.gitignore` (keep `.igris/`). Keep README, LICENSE, tasks.md, igris.toml untouched.

### M0-04 — GitHub Pages deploy workflow

`.github/workflows/deploy.yml`: on `push` to `master` + `workflow_dispatch`; permissions `contents: read, pages: write, id-token: write`; concurrency group `pages` (cancel-in-progress false); build job (`npm ci`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` with `path: dist`); deploy job (`actions/deploy-pages`, environment `github-pages`). Add `public/.nojekyll`. Add a SPA-safe `404.html` copy step only if routing needs it (it doesn't yet: no router — skip).

### M1-01 — Shell architecture

write `docs/architecture.md` (≤ 2 pages) and the TS types/interfaces only (no UI): session state machine (`booting → login → desktop → shuttingDown → off`, `off` → click to power on → `booting`); `WindowState` (id, appId, title, x, y, w, h, z, minimized, maximized, props); `AppDefinition` (id, title, icon16, icon32, component (lazy), defaultSize, minSize, singleInstance, chrome: `'xp' | 'none'` so Amplifier can draw its own frame, showOnDesktop, showInStartMenu); store split (session, windows, settings, sound); typed event bus API (`emit`/`on`/`off`, event map type); persistence keys/versioning; `clock.ts` API.

### M1-04 — Window component

`src/os/wm/Window.tsx` + `WindowLayer.tsx`: XP-styled frame (xp.css `.window`), titlebar with 16px icon + title, minimize/maximize/close buttons; drag by titlebar with pointer events (pointer capture); resize from 8 edges/corners; double-click titlebar toggles maximize; mousedown anywhere focuses; inactive windows show the faded titlebar; maximized fills area above the taskbar; `chrome: 'none'` renders the app without frame (app provides its own drag handle via a `useWindowDrag(id)` hook). Renders the app component lazily with `Suspense`.

### M1-05 — App registry + starter apps

`src/apps/registry.ts`; apps: **My Computer** (about window: what still-online is + the README disclaimer text + link to CREDITS on GitHub + "Reset still-online…" button that confirms then clears `still-online:v1:*` and reloads), **Notepad** (textarea, content persisted, title "Untitled - Notepad"), **Recycle Bin** (empty-state window "The Recycle Bin is empty."). Original 16/32px SVG icons for each.

### M1-08 — Start menu

`src/os/startmenu/`: XP two-column layout; header with user picture (original SVG avatar) + player name; left column: apps with `showInStartMenu` (Messenger and Amplifier appear once registered — design the list to be data-driven); right column: My Computer, Recycle Bin; footer: **Log Off** (→ login screen, windows closed) and **Turn Off Computer** (→ `shuttingDown` → `off` black screen with "It is now safe to turn off your computer." and click-to-power-on). Closes on outside click, Escape, or after launching. Keyboard navigable.

### M1-09 — Boot, login & session flow

`src/os/boot/` and `src/os/login/` wired to the session store in `App.tsx`. Boot: black screen, "still-online" wordmark, XP-style moving progress bar, ~3s, skippable by click/key, shortened to ~1s on return visits. Login: blue welcome screen, one account tile; first visit shows a name field (default `Player`), later visits show the saved name; click tile/Enter → logon sound → desktop. Shutdown flow as in M1-08.

### M2-01 — Content format

`docs/content-format.md` + `src/content/types.ts`. **Contact**: id, displayName (2007-style decorations allowed), handle (`@livemail.example`), avatar (original SVG or generated pattern), group (`Friends` / `School` / `Family`), initial status (`online` / `away` / `busy` / `offline`), personalMessage, signInAfterMs. **Script**: graph of nodes; node = contact lines (`text`, `delayMs`, optional `nudge`, `statusChange`, `personalMessageChange`), then either player `choices` (2–3 labelled lines → next node id) or `end`. **Triggers**: `onSignIn`, `afterMinutes(n)`, `onNowPlaying(trackId?)`, `onPlayerNudge`. Progress state shape for persistence.

### M2-02 — Conversation engine

`src/apps/messenger/engine/`: pure TS, no React; consumes content + an injected scheduler/clock (so tests use fake timers); emits engine events (contactSignedIn, message, typingStart/Stop, nudge, statusChange); handles player choices; persists progress (which nodes done, pending triggers) via a Zustand store `src/apps/messenger/store.ts`; resumes sensibly after reload (no duplicate messages). Typing indicator shows for `min(len*40ms, 2500ms)` before each contact line.

### M2-03 — Messenger main window

app id `messenger`, singleInstance, registered in Start menu + desktop + tray icon (green figure when signed in, grey when out). Sign-in view (handle prefilled from player name, "Sign in" button, ~2s spinning animation, `logon`-style notify sound). Contact list: player header (name, editable personal message, own status dropdown), collapsible groups with counts `Friends (3/5)`, status icons, personal messages in grey italics, offline contacts in an "Offline" group. Double-click contact opens chat.

### M2-04 — Chat window

app id `messenger-chat` (one window per contact via `props.contactId`, singleInstance per contact). Header with contact name/status/personal message + avatar; transcript in `"<name> says:"` + indented line format; emoticon replacement (`:) :( :D ;) :P :O (Y) (N) <3 (L)`) with original SVGs in `src/assets/emoticons/`; typing indicator in status bar ("Lena is typing a message…"); player replies via choice buttons above the input (clicking shows the text in the input, Send/Enter sends); "Nudge" toolbar button (player→contact, triggers `onPlayerNudge`, rate-limited 1 per 10s). Incoming nudge: window shakes 500ms + `nudge` sound + line "Lena just sent you a nudge!".

### M2-05 — Contacts & scripts

author 6 fictional contacts in `src/content/contacts/` with distinct personalities (e.g. hyperactive best friend who nudges a lot, cool older cousin, shy classmate, sibling, a "~*drama*~" friend who changes personal message often, someone always "Away"). Each gets an opening script (≥ 8 nodes, ≥ 2 branches) and ≥ 1 timed or now-playing trigger script. Staggered sign-ins over the first 5 minutes. Follow the content rules (fictional, PG-13, 2007 vibe).

### M3-05 — Amplifier main window

app id `amplifier`, singleInstance, `chrome: 'none'`, fixed size ~275×116 (CSS scale 2× toggle optional); **original** dark brushed-metal skin in CSS (don't recreate Winamp's bitmap skin); drag handle titlebar strip "AMPLIFIER"; green LCD time display (elapsed, click toggles remaining); scrolling marquee `1. Artist - Title (m:ss)`; prev/play/pause/stop/next buttons, seek bar, volume slider, shuffle/repeat toggles, "PL" toggle; close/minimize buttons. Register in Start menu + desktop.

### M4-04 — README & screenshots

Playwright script `tests/e2e/screenshots.spec.ts` (tagged, excluded from default run) that saves `docs/screenshots/{desktop,messenger,amplifier}.png` at 1280×800; update README: replace the "Early concept" note with "v0.1 — playable MVP" + live link, screenshots, "What's in it" (built features) vs "Planned" (Netlog/MySpace-style profiles, living world), "Run locally" (`nvm use`, `npm ci`, `npm run dev`), "Tech stack", keep Disclaimer + License + Credits.

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

- **Run it unattended:** `igris arise M0 --through M4 --mode yolo` inside herdr or tmux. `igris.toml` already sets `default_mode = "yolo"`, `commit = "auto"` and `verify_max_attempts = 5`.
- **Nothing gets pushed, tagged or released.** Every task is committed locally.
- **Afterwards, review:**
  - `docs/review/M0.md` … `docs/review/M4.md`, with screenshots
  - `docs/decisions.md`
  - `docs/release-notes-v0.1.0.md`
- **Then:** `git push` (CI and the Pages deploy run), check https://drilonrecica.github.io/still-online/, then tag `v0.1.0` and publish the release.
- igris can still stop to ask you in these cases:
  - verify failed 5× in a row
  - a session crashed
  - the plan was edited mid-run
  - a session sat idle without `igris done` after its one reminder
