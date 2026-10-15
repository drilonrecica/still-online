# Architecture v0.2

This doc extends [architecture.md](architecture.md) (session, windows, apps, event bus, persistence and clock still apply). It fixes the v0.2 foundations so feature tasks don't have to design them. The shared types are the source of truth:

| File                                              | Holds                                                                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/os/types.ts`                                 | `AppId`, `AppCategory`, `AppDefinition.category/pinned`, `Shortcut`, `SettingsV02` + `SETTINGS_V02_DEFAULTS`, `PersistedStoreName`, `GameId` |
| `src/os/events.ts`                                | `OsEventMap`                                                                                                                                 |
| `src/os/serviceTypes.ts`                          | world, network, idle, balloon and games contracts                                                                                            |
| `src/os/fs/types.ts`                              | `FsNode`, `PhotoSpec`, `FsStore`                                                                                                             |
| `src/os/overlay/slots.ts`                         | `OVERLAY_SLOTS`, `Z_INDEX`                                                                                                                   |
| `src/os/random.ts`                                | `mulberry32`, `seedFrom`, `randInt`, `pick`                                                                                                  |
| `src/content/sites/types.ts`                      | `SiteDefinition`, `SitePageProps`, site content, `WebState`                                                                                  |
| `src/content/profiles/types.ts` · `mail/types.ts` | Spaceport profiles · mail content and `MailState`                                                                                            |
| `src/content/types.ts` (end)                      | `TuneMoleResult`, `AssistantTip`                                                                                                             |

Content files under `src/content/` use **relative imports**, because the e2e tsconfig compiles them and has no `@/` alias.

## Module map

```
App.tsx ── installs once: installIdle(), browserRouter, amplifierRouter
   │        session effects: booting → world.onBoot() · off → world.markShutdown()
   └─ Desktop: DesktopIcons · WindowLayer · OverlayLayer · StartMenu · ToastLayer · Taskbar
os/ fs/ (store, FolderView, photos) · blobStore · world · network · idle · random · linkify
    balloon/ · wallpapers/ · screensaver/ · pet/ · assistant/ · overlay/ · games
apps/<id>/ talk to each other only through `events`; they may import anything in os/ and content/
```

## Apps and shortcuts

- **New `AppId`s:** `explorer`, `display`, `dialup`, `diskcleanup`, `messenger-history`, `browser`, `mail`, `tunemole`, `paint`, `photobooth`, `mines`, `henhunt`, `pinball`, `wrecker`. Names and window sizes are in tasks.md → Defaults. Fluff and Stapley are overlays, not apps.
- **`category`** places an app in an All Programs submenu (`APP_CATEGORIES` order: Accessories, Games, Internet, Entertainment, System Tools). If there's no category, the app isn't in the menus (`messenger-chat`, `messenger-history`). **`pinned`** puts it in the Start menu's left column.
- **`Shortcut { appId, props?, label, icon16?, icon32? }`** is a launcher with window props, e.g. `{ appId: 'explorer', props: { folder: 'pics' }, label: 'My Pictures' }`. `DESKTOP_SHORTCUTS` and `START_PLACES` (P0-02) are `Shortcut[]`. Icons default to the app's. Shortcuts to unregistered apps are skipped.

## Events

Added to `OsEventMap`. Payloads written `{}` in the plan are typed `Record<string, never>`, so emit them as `emit('os:active', {})`.

| Event                  | Payload                    | Emitted by → handled by                                                                                      |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `browser:open`         | `{ url }`                  | linkify links, Mail, Explorer links, balloons → `os/browserRouter.ts` opens `browser`                        |
| `amplifier:enqueue`    | `{ trackId, play? }`       | Explorer, Spaceport, TuneMole → amplifier store; `os/amplifierRouter.ts` opens the window when `play` is set |
| `game:score`           | `{ game, score, detail? }` | Mines/Hen Hunt/Pinball → Messenger runtime (`gameScore`)                                                     |
| `world:dayChanged`     | `{ day }`                  | `world.onBoot` → new-day balloon, Stapley                                                                    |
| `world:unlock`         | `{ id }`                   | `world.unlock` → Display Properties list                                                                     |
| `network:connected`    | `{ kbps }`                 | `network` → balloon, Mail delivery                                                                           |
| `network:disconnected` | `{}`                       | `network` → Messenger signs out                                                                              |
| `os:idle`              | `{ minutes }`              | `idle` (one per threshold reached)                                                                           |
| `os:active`            | `{}`                       | `idle` (first input after an `os:idle`) → Messenger leaves auto-away                                         |
| `fs:changed`           | `{ ids }`                  | every fs mutation → views not driven by the store                                                            |

P5-01 adds `messenger:setDisplayPicture { fileId }`. Every new event goes into `OsEventMap` first.

## Stores

| Store    | File                    | Persisted name | Data                                                            |
| -------- | ----------------------- | -------------- | --------------------------------------------------------------- |
| settings | `os/store/settings.ts`  | `settings`     | v0.1 fields + `SettingsV02` (below)                             |
| fs       | `os/fs/store.ts`        | `fs`           | `FsState { nodes, purgedSeeds }`                                |
| world    | `os/world.ts`           | `world`        | `WorldState`                                                    |
| network  | `os/network.ts`         | —              | `status`, `phase`, `kbps`, `connectedAt`                        |
| balloons | `os/balloon/store.ts`   | —              | queue; seen ids live in `settings.seenTips`                     |
| games    | `os/games.ts`           | `games`        | `GamesState` (mines best per level, top-10 lists)               |
| mail     | `apps/mail/store.ts`    | `mail`         | `MailState { messages, deliveredDays }`                         |
| web      | `apps/browser/store.ts` | `web`          | `WebState { favorites, counters, guestbook, votes, myProfile }` |

Every persisted store uses `persistOptions` with a `sanitize` that drops invalid entries and falls back to defaults. **Settings v0.2.** Each task moves its fields into `SettingsStore` with a setter and a sanitize; the defaults come from `SETTINGS_V02_DEFAULTS`.

| Field                                             | Default                                                | Task     |
| ------------------------------------------------- | ------------------------------------------------------ | -------- |
| `wallpaper: WallpaperChoice`, `wallpaperPosition` | `{ kind: 'builtin', id: 'classic' }`, `'stretch'`      | P1-01    |
| `theme: 'blue' \| 'olive' \| 'silver'`            | `'blue'`                                               | P1-02    |
| `screensaver: { id, minutes, text }`              | `{ id: 'panes', minutes: 5, text: 'still online...' }` | P1-02/03 |
| `connectAutomatically`                            | `true`                                                 | P1-05    |
| `seenTips: string[]`                              | `[]`                                                   | P1-04    |
| `awayMinutes`, `awayMessage`                      | `5`, `'brb'`                                           | P3-01    |
| `petEnabled`, `assistantEnabled`                  | `false`, `true`                                        | P6-05/06 |

`WallpaperChoice = { kind: 'builtin'; id } | { kind: 'custom'; blobKey } | { kind: 'color'; color }`. A builtin id that doesn't exist (or is locked) renders as `classic`.

**Wallpapers** (`src/os/wallpapers/`, P1-01): `WALLPAPERS` in `registry.ts` (`classic` + 9 homages + `ponies`/`retro`, hidden until their `unlock`); `listWallpapers(unlocks)` for pickers, `resolveWallpaperId` for the fallback. Painters (`landscapes.ts`, `nature.ts`, `abstract.ts`, `hidden.ts`) draw with `mulberry32(seedFrom(id))`. `wallpaperUrl(id, w, h)` renders to an offscreen canvas and caches a JPEG data URL per id and 256 px-bucketed size; it returns null for `classic` and in jsdom. `useDesktopBackground()` styles `.desktop-root` (builtin → data URL, custom → `useBlobUrl`, color → solid; no image → the CSS hill) and re-renders on a debounced resize.

## File system (`src/os/fs/`, P0-04)

- **Nodes:** `FsNode` is a flat map keyed by id, with `parentId` links. Ids: system folders use their well-known id (`root`, `docs`, `pics`, `music`, `recycle`, see `FS_FOLDERS`), seeds `seed:<slug>`, player files `f:<random>`. A file's content depends on its `type`: `text`, `photo` or `blobKey`, `trackId`, or `url`.
- **Names:** case-insensitively unique per folder (except inside the Recycle Bin, which keeps original names). Clashes become `name (2).ext`. `path(id)` joins names from below `root` with `\`; `path('root')` is `My Computer`. Code: `fs/store.ts` (actions), `fs/nodes.ts` (pure helpers, `sanitizeFsState`).
- **Recycle Bin:** `remove` sets `parentId = 'recycle'` and `deletedFrom = <old parent>`. Only the top node moves; its children keep their parent and travel with it. `restore` moves it back (to `docs` if the old parent is gone) with a unique name. `purge` deletes the subtree, calls `deleteBlob` for each `blobKey` and adds purged `seed:` ids to `purgedSeeds`. System folders can't be removed or renamed.
- **Seeding:** `App` calls `seed(SEED_FILES)` on mount with `src/content/files/` (P1-06: 8 docs, 6 photos, 2 tracks, 4 Recycle Bin files; helpers in `files/seed.ts`). It adds only ids that are missing and not in `purgedSeeds`, so the player's edits, moves and deletions survive updates.
- **Photos:** `renderPhoto(spec, canvas, w, h): void` in `fs/photos.ts`, drawn with `mulberry32(spec.seed)` (scenes in `fs/photoScenes*.ts`). It sets the canvas size; if there's no 2D context (jsdom), it returns. The date stamp comes from the seed (`photoDateStamp`), so a photo is identical every run.
- **Blobs** (`src/os/blobStore.ts`, P0-03): `putBlob(blob) → 'blob:<random>'`, `getBlob`, `deleteBlob`, `clearBlobs`, `useBlobUrl(key)`. They live in IndexedDB `still-online`, store `blobs`, with an in-memory fallback. These are the only bytes of player data; the fs only holds keys. Reset clears both.

## World, network, idle

- **World (P0-06):** `onBoot(realNow)` runs once each time the session enters `booting`. The first boot sets day 1. After that, `shutdownPending` or a new local date moves the day forward by exactly 1, and `world:dayChanged` fires. `markShutdown()` runs when the session reaches `off`. A page reload without shutting down keeps the same day. `unlock(id)` is idempotent; `currentDay()` reads the store outside React. Story content covers days 1–5; day 6+ keeps the day-5 presence.
- **Network (P0-07):** a store that isn't persisted, so every page load starts offline.

  ```
  offline ─connect()─▶ dialing [dialing 3s → verifying 1.5s → registering 1.2s] (scaleMs) ─▶ online (56.0 kbps)
     ▲                    │ cancel()                                                         │ disconnect()
     └────────────────────┴──────────────── network:disconnected ◀──────────────────────────┘
  ```

  `requireOnline(): Promise<boolean>` resolves `true` right away when online. Otherwise it opens (or focuses) the `dialup` dialog and, when `settings.connectAutomatically` is on, calls `dial()` at once. It resolves `true` on `network:connected`, or `false` on `network:disconnected` or when the dialog is closed while still offline (closing it mid-dial keeps the attempt going). Concurrent callers share one attempt. Apps that need a connection (Messenger sign-in, Web Explorer, Mail, TuneMole) await it, or render an offline state with a Connect button that awaits it.

  `dial()` (P1-05) is `connect()` plus the synthesized `dialup` modem sound, which `cancel()` silences. The dial-up dialog (`src/apps/dialup/`) is a thin view over the store; `network.ts` closes it on `network:connected` (with `?speed=fast` the dial can finish before the lazy dialog mounts). `network:disconnected` signs Messenger out. The tray network icon (`src/os/taskbar/NetworkTray.tsx`) is grey offline, blinks while dialling and is blue online; offline it calls `requireOnline()`, online it opens a Disconnect / Status menu (Status = a balloon with speed and `hh:mm` duration).

- **Idle (P0-08):** `installIdle()` adds passive `pointermove/pointerdown/keydown/wheel/touchstart` listeners on `window`. `onIdle(minutes, cb)` fires once per idle period and re-arms after input; `minutes <= 0` registers nothing. Each threshold that fires emits `os:idle { minutes }`. The first input after any of them emits `os:active`. Timers use `scaleMs`, so under `?speed=fast` 5 minutes take 3 s (see Testing).

## Overlay layer

`src/os/overlay/OverlayLayer.tsx` renders inside `Desktop` in `App.tsx`, after `WindowLayer`. The first overlay task in plan order (P1-03) creates it; later tasks add their component to their slot. Each slot in `OVERLAY_SLOTS` is a `position: fixed; inset: 0; pointer-events: none` div with `data-overlay="<slot>"` and `z-index: Z_INDEX[slot]`. Overlay content sets `pointer-events: auto` only on its own hit areas.

| Slot          | z     | Content                                                                                           | Shown when                  |
| ------------- | ----- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| (windows)     | 1     | `WindowLayer` — gets `z-index: 1` so window `z` values stay inside it                             | always                      |
| `pet`         | 100   | Fluff (P6-05)                                                                                     | `settings.petEnabled`       |
| `assistant`   | 200   | Stapley (P6-06)                                                                                   | `settings.assistantEnabled` |
| (taskbar)     | 10000 | existing                                                                                          | —                           |
| `balloons`    | 10001 | `BalloonLayer` (P1-04); the existing `ToastLayer` uses the same z                                 | queue non-empty             |
| (Start menu)  | 10002 | existing                                                                                          | open                        |
| `wrecker`     | 15000 | reserved: the `wrecker` app portals its full-screen canvas to `document.body` with this z (P6-04) | app open                    |
| (boot/login)  | 20000 | existing                                                                                          | —                           |
| `screensaver` | 25000 | screensaver (P1-03); swallows the first input                                                     | idle / Preview              |

**Screensaver (P1-03):** `src/os/screensaver/` — `store.ts` (`running`, runtime only), `controller.ts` (`installScreensaver()` from `Desktop`: `onIdle(settings.screensaver.minutes)` → `startIdle`), `dismiss.ts` (pure stop rules: 400 ms grace, move > 4 px, click, key, wheel; `swallowNextClick`), `Screensaver.tsx` (canvas + `requestAnimationFrame`, paused while hidden; reduced motion = still text) and `savers/` (one `SaverFactory` each; `pipesGrowth.ts` is the pure, seeded pipe simulation). The `@review` test in `tests/e2e/screensaver.spec.ts` writes `docs/review/P1/screensavers.png`.

The task that creates `OverlayLayer` also sets `.layer { z-index: 1 }` in `Window.module.css` and the Start menu to `Z_INDEX.startMenu`. Without that, window `z` would keep growing past the overlays. The dial-up dialog is a normal window (`dialup` app), not an overlay. Canvas overlays pause `requestAnimationFrame` while hidden (P7-02 `useAnimationFrame`).

## Web (P4)

- **Sites:** `src/apps/browser/sites/<host-slug>/` holds one `SiteDefinition` each, and `sites/index.ts` exports `SITES` and `resolve(url): ResolvedPage | null`. Normalising a URL adds `http://`, lowercases the host and defaults the path to `/`. A page is matched by its exact path, then by `/*` (one segment, e.g. Spaceport `/kayla`). Unknown hosts, or any page while offline, show "The page cannot be displayed". Every host ends in `.example`.
- **Browser (P4-01):** `src/apps/browser/` — `Browser.tsx` (chrome), `useNavigation.ts` (per-window history from `history.ts`, page loads of `scaleMs(400–1300)` ms; offline is decided when a load finishes), `url.ts` (`normalizeUrl`, `resolveHref`, `parseUrl`), `store.ts` (`web`). Site pages link with `<SiteLink href>` (relative or absolute), which uses the window's `NavigatorContext`; hovering shows the address in the status bar. `about.example` is the built-in placeholder site. `os/browserRouter.ts` (installed in `App.tsx`) opens a new `browser` window for each `browser:open`.
- **Tinfoil Comets (P4-03):** `sites/tinfoilcomets/` — all text in `src/content/sites/tinfoilcomets.ts` (linted). Every page view of the site calls `web.hit(host)` once (pages remount per load) and the odometer shows `4203 + hits - 1`. Player guestbook entries go through `web.signGuestbook(host, entry)` and carry the `day` they were signed, so they sort among friends' day-gated entries. The webring is every registered host in alphabetical order. "Background MIDI" is `os/chiptune.ts` (an 8-bar loop scheduled with `scheduleVoices` from `sound.ts`; opt-in, stops on mute, on Stop and when the home page unmounts).
- **Spaceport (P4-04):** `sites/spaceport/` — `/`, `/me`, one concrete page per `PROFILES` entry (`/jess`…, so Searchly indexes them) and `/*` → "Lost in orbit!". Friend names and pictures come from `src/content/contacts` (the pattern is re-drawn with `seedFrom`, never imported from Messenger). Walls show comments with `day <= currentDay`, newest first; `/me` shows every friend's `commentsOnPlayer`. A friend's Top 8 is the player + the 5 other friends + 2 extras (`TopFriend` kind `player`). The song strip emits `amplifier:enqueue { trackId, play: true }` on click only. `/me` edits go through `cleanProfile` into `web.saveProfile`; until then `effectiveProfile` uses `DEFAULT_PLAYER_PROFILE` (`src/content/sites/spaceport.ts`, with the 6 `THEME_PRESETS`). Profile text may use `{name}`.
- **Content:** site text lives in `src/content/sites/` (`GuestbookEntry`, `BlogPost`, `NewsPost`, `Poll`, all gated by `day`), profiles in `src/content/profiles/<contactId>.ts` (`ProfileContent`), and mail in `src/content/mail/` (`MailContent`, `AutoReply`). Site pages may import content and `os/`, but never Messenger. Profile pictures re-draw the contact's pattern avatar from its seed.

## Games

`GameId = 'mines' | 'henhunt' | 'pinball'`. Simulations are pure TS with `mulberry32` and fixed timesteps, rendered separately. A finished game calls `recordScore` (the `games` store) and emits `game:score`. Messenger reacts through `onGameScore` triggers (P6-07).

## Testing

- **Seeded art:** draw with `mulberry32(seed)` or `mulberry32(seedFrom('name'))`. Test drawing with a recording fake 2D context; jsdom's `getContext` returns null (`src/test/setup.ts`).
- **E2E helpers** (`tests/e2e/helpers.ts`): `logIn(page, name = 'Ada', { quiet = true })` goes to `./?speed=fast`, skips boot, logs on and waits for the desktop. `openMessenger(page)` signs in (and auto-dials once P1-05 lands), closes Jess's nudge chat and returns the Messenger window. `closeNudgeChats(page, { wait = true })` closes every chat window.
- **`quiet`** merges `screensaver.minutes = 0` and `awayMinutes = 0` into the persisted settings before the app loads. Specs that test the screensaver or auto-away pass `{ quiet: false }`.
