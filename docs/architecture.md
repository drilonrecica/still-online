# Architecture

still-online is a client-only React app that simulates a 2007 desktop OS. Logic lives in plain TS (Zustand stores, pure functions); React components stay thin. The shared contracts are in `src/os/types.ts`.

## Session state machine

`App.tsx` renders one screen per `SessionState` (`src/os/store/session.ts`):

```
booting ──bootComplete──▶ login ──logOn──▶ desktop ──shutDown──▶ shuttingDown ──shutdownComplete──▶ off
   ▲                        ▲                 │                                                     │
   │                        └─────logOff──────┘                                                     │
   └──────────────────────────────────────────powerOn (click)───────────────────────────────────────┘
```

- Allowed transitions are `SESSION_TRANSITIONS`. An action called from the wrong state is a no-op.
- The session state is **not** persisted. Every page load starts at `booting`.
- `logOff` and `shutDown` call `windows.closeAll()`.
- Windows (`WindowLayer`) render only in `desktop`. So persisted windows reappear after login, never during boot.

## Stores (`src/os/store/`)

| Store    | File               | Persisted | Holds                                                                     |
| -------- | ------------------ | --------- | ------------------------------------------------------------------------- |
| session  | `session.ts`       | no        | `state` + transition actions (`SessionStore`)                             |
| windows  | `windows.ts`       | yes       | `WindowState[]`, `topZ`, WM actions (`WindowsStore`)                      |
| settings | `settings.ts`      | yes       | `playerName`, `muted`, `volume` (0..1), `firstBootDone` (`SettingsStore`) |
| sound    | `sound.ts` (store) | no        | `unlocked` (AudioContext resumed after a gesture) (`SoundStore`)          |

All user-visible text goes through the catalogs and `t()`, and persisted state is language-neutral: see [docs/i18n.md](i18n.md).

Apps keep their own stores in `src/apps/<id>/store.ts` (Notepad text, messenger progress, amplifier volume).

## Windows

`WindowState` = `{ id, appId, titleKey?, titleParams?, x, y, w, h, z, minimized, maximized, props }`. The title is rendered, never stored: `titleKey`/`titleParams` from `setWindowTitle`, else the app's `titleKey` (see docs/i18n.md → "windows").

- **Coordinates** are px in the _work area_: the viewport minus the 30px taskbar (`TASKBAR_HEIGHT`).
- **Maximize** is a flag. `x/y/w/h` keep the restore geometry, and the Window component draws a maximized window over the whole work area.
- **Z-order:** `topZ` only grows. `openApp` and `focusWindow` set `z = ++topZ`. The **active window** is the non-minimized window with the highest `z`; there is none if every window is minimized. `focusWindow` also un-minimizes the window.
- **Minimize** keeps `z`. The active window then becomes the next highest non-minimized one, which is a derived value, not stored.
- **Cascade:** the first window opens at (`CASCADE_ORIGIN`, `CASCADE_ORIGIN`) = (24, 24). Each next window opens at the most recently opened window's position + `CASCADE_STEP` (24) on both axes. If the new window would cross the right or bottom edge of the work area, it wraps back to the origin.
- **Size:** `defaultSize` is clamped to the work area. `resizeWindow` enforces `minSize ?? WM_MIN_SIZE` (240×140).
- **Clamp** (on open, move and resize): `x ∈ [MIN_VISIBLE_TITLEBAR − w, workW − MIN_VISIBLE_TITLEBAR]` and `y ∈ [0, workH − TITLEBAR_HEIGHT]`. This keeps ≥ 40px of the titlebar visible.
- **singleInstance:** `openApp` focuses the existing window (and un-minimizes it) instead of opening a second one. If the app also has `instanceKey(props)`, the uniqueness is per key. Example: `messenger-chat` uses `props.contactId`, so there is one chat window per contact.
- Window ids are unique strings made by the store. They stay unique across reloads, so the store derives its counter from the persisted windows.
- `props` must be JSON, because open windows are persisted.

### Window component (`src/os/wm/`)

- `WindowLayer getApp={…}` renders every window. It covers the work area (`bottom: TASKBAR_HEIGHT`) and lets clicks between windows pass through to the desktop. The registry lookup is a prop, so `os/wm` never imports `apps/`. Windows of unknown apps are skipped.
- `Window` (chrome `'xp'`): xp.css `.window` + `.title-bar` with the 16px icon, the title, and Minimize / Maximize↔Restore / Close. The app renders lazily in `Suspense` inside a flex-column body with no padding. Apps that want xp.css padding add `.window-body` themselves.
- Mousedown or focus anywhere in a window (capture phase) calls `focusWindow`. Inactive windows get the faded titlebar.
- **Drag:** `useWindowDrag(id)` returns pointer handlers that use pointer capture. It focuses the window on pointerdown and never calls `preventDefault`, so `mousedown` still fires. It ignores presses on buttons and inputs and doesn't drag a maximized window. Chrome `'none'` apps spread these handlers on their own handle.
- **Resize:** 8 invisible grips (edges and corners), not shown while maximized or for chrome `'none'`. `resizeRect` (`geometry.ts`) keeps the opposite edge fixed and respects `minSize`. The store then clamps the result.
- Double-clicking the titlebar toggles maximize. A minimized window stays mounted but `hidden`, so app state (text, audio) survives.

## Apps (`src/apps/registry.ts`)

`registry.ts` exports `apps: AppDefinition[]` and `getApp(id)`. In an `AppDefinition`:

- `component` is `React.lazy(() => import('./<id>/<Name>'))`. The Window renders it in `Suspense` with `{ windowId, props }` (`AppComponentProps`).
- `chrome: 'none'` renders the app with no XP frame. The app then draws its own titlebar and calls `useWindowDrag(windowId)`. Amplifier uses this.
- `showOnDesktop` controls desktop icons. `showInStartMenu` controls the Start menu's left column. The right column is the fixed list `mycomputer`, `recyclebin`.
- Icons are imported SVG URLs: `src/assets/icons/<id>-16.svg` and `<id>-32.svg`.
- Apps never import each other. They may import `src/os/**`.

## Event bus (`src/os/events.ts`)

`events` is the only channel between apps.

```ts
events.emit('amplifier:trackChanged', { trackId, artist, title, durationSec });
const unsubscribe = events.on('amplifier:trackChanged', (p) => { … }); // returns unsubscribe
events.off(type, listener);
```

- Events and their payloads are declared in `OsEventMap`. Name them `<app>:<event>`. To add an event, add a key there.
- Delivery is synchronous, in subscription order, and goes to a snapshot of the listeners. This makes unsubscribing during an emit safe.
- A listener that throws is logged with `console.error`. The other listeners still run.
- In React, subscribe in `useEffect` and return the unsubscribe function. Tests use `createEventBus()` or `events.clear()`.

## Persistence

- Uses `localStorage` with keys `still-online:v1:<store>`, where `<store>` is a `PersistedStoreName`: `settings`, `windows`, `notepad`, `messenger`, `amplifier`.
- `src/os/persist.ts` (M1-11) wraps Zustand `persist` with this prefix and `version: 1`. If the version doesn't match or the JSON is corrupt, the store discards the data and starts from its defaults. It never crashes.
- Persist only data, never actions or derived values. Session and sound stores are not persisted.
- Reset (My Computer) removes every key that starts with `still-online:v1:` and then reloads.

## Clock (`src/os/clock.ts`)

| Function               | Returns                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `now(): Date`          | The in-game date: the real local time of day and real month/day, but year `GAME_YEAR` (2007). |
| `toGameDate(real)`     | The same mapping as a pure function. Feb 29 becomes Feb 28.                                   |
| `formatTrayTime(d)`    | `3:07 PM`                                                                                     |
| `formatLongDate(d)`    | `Sunday, October 14, 2007`. The weekday is the 2007 weekday.                                  |
| `msUntilNextMinute(d)` | The delay for scheduling the next tray update.                                                |

Always use `now()` for any date the player can see, never `new Date()`. Timers (`setTimeout`) use real time. The `?speed=fast` test flag (`src/os/speed.ts`, `scaleMs`) multiplies Messenger timers by 0.01 (engine scheduler delays and the sign-in spinner), not the clock, toast lifetimes or animations. It is read once at load, so reload to change it.
