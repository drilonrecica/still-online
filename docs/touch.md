# Touch: phones and tablets

still online is the same XP desktop on every device, adapted for touch. The design is in `docs/superpowers/specs/2026-10-20-v06-touch-design.md`.

## Device classes

`src/os/device.ts` is the only place that decides the device. `getDevice()` returns one of:

| Class     | Rule                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| `phone`   | `innerWidth < 600` or `innerHeight < 500` (`DEVICE_PHONE_MAX_WIDTH`/`_HEIGHT`)          |
| `tablet`  | not a phone, and `matchMedia('(pointer: coarse)')` matches (false without `matchMedia`) |
| `desktop` | everything else                                                                         |

- `installDevice()` (called in `App.tsx`) keeps it live on `resize`, `orientationchange` and `visualViewport` resize. `useDevice()` re-renders on a change, and `App` renders it as `data-device` on `.desktop-root`.
- CSS targets `.desktop-root[data-device='phone']` / `[data-device='tablet']`. Don't add width `@media` queries and don't sniff the user agent.
- Gestures go **per event** by `pointerType === 'touch'`, never by device class.

## Shell

- The viewport meta has `viewport-fit=cover, interactive-widget=resizes-content`. `global.css` defines `--safe-top/right/bottom/left` from `env(safe-area-inset-*)`.
- `.desktop-root` sets `touch-action: manipulation` (no double-tap zoom), with no tap highlight and no long-press callout. Text fields keep text selection and the callout.
- **Work area:** `viewportWorkArea()` uses `visualViewport.height` (so the on-screen keyboard shrinks it) minus `taskbarHeight(device)`, which is 30 px on a desktop and 40 px on touch devices.
- **Re-clamp:** 100 ms after resizing stops, `reclampAll()` moves every window back into the work area and caps its size to it. It changes nothing when everything fits. A phone skips it, because phone windows render maximized and their stored desktop geometry has to survive the trip.
- A swipe over the shell becomes a browser pan and ends in `pointercancel`. Anything that tracks a swipe itself needs `touch-action: none`.

## Windows

- **Phone:** every window renders maximized (`effectiveMaximized(win, device)`), but this is never stored, so the desktop geometry comes back on a desktop. Maximize/Restore are hidden. The title bar is 36 px with 36×36 Minimize and Close buttons, and there's no drag and no resize grips.
- **Tablet:** windows float. The title bar is 36 px with 32 px buttons, and the invisible resize grips get 16 px touch zones. `openApp` opens a window maximized (stored, so it can restore) when its default size doesn't fit the work area.
- **Desktop:** unchanged.

## Taskbar, Start menu and overlays

- **Taskbar:** 40 px on touch devices. `--xp-taskbar-height` becomes `calc(40px + var(--safe-bottom))` on `.desktop-root` (`global.css`), so the window layer, desktop icons, Start menu, toasts and balloons all clear it. Stapley and Fluff read `taskbarHeight(device)`. On a phone the window buttons are icon-only 40×40 (title as `aria-label` and tooltip) and scroll sideways. The tray shows language, sound and clock, and a „‹" chevron (`HiddenIcons.tsx`) opens network, Messenger and Fluff. An outside tap, Escape or a window coming to the front closes it. On a tablet the buttons keep their labels (min 110 px).
- **Start menu:** on a phone it is `min(380px, 100vw)` wide and capped to the work area. All Programs is a full-height panel over the menu with a Back row, and its folders unfold in place on a tap. A tablet keeps the flyouts, and a tap's compatibility `mouseenter` starts no hover timer.
- **Overlays:** toasts are `min(220px, 92vw)` and balloons `min(250px, 92vw)`. Stapley is drawn at 0.8 on a phone (balloon `max-width: 70vw`). App `.dialog`s are `max-width: 94vw` on a phone. The screensaver also stops on `touchstart`.
- **Login:** on a phone the wordmark, then the prompt over a divider, then the tile and fields. The middle scrolls when the keyboard shrinks the screen.
- `tests/e2e/v06-m1-02.spec.ts-snapshots/` holds the v0.5 desktop taskbar and Start menu (1280×800). The desktop test compares against them.

## Touch primitives

Both hooks live in `src/os/touch/` and return a binder, so one hook serves a whole list: `const press = useLongPress((point, i) => …)`, then `<li {...press(i)}>`. Every double-click or context-menu interaction goes through them, so nothing is mouse-only.

- **`useActivate(onActivate, { touchTaps, enter })`** opens: a mouse double-click, a touch (or pen) tap, or Enter. A mouse single click keeps the site's own meaning (usually select). A habitual double-tap opens once. Title bars pass `touchTaps: 2` (a double-tap) and `enter: false`.
- **`useLongPress(handler)`** opens a context menu: a touch or pen held for 500 ms (`LONG_PRESS_MS`, not scaled by `scaleMs`) without moving more than 10 px, or a mouse right-click. It vibrates briefly, swallows the click that ends the press, and blocks the native `contextmenu` Android fires, so the menu opens once.
- `composeHandlers(a, b, c)` merges them with a site's own handlers (title-bar drag, select-on-click).
- Sites that only `preventDefault` the native menu (the Paint canvas, the games) don't use them.

## Tests

| Project           | Device                           | Runs                                 |
| ----------------- | -------------------------------- | ------------------------------------ |
| `chromium`        | Desktop Chrome                   | everything except `@phone`/`@tablet` |
| `phone`           | Pixel 7 (412×915, touch, mobile) | `@phone`                             |
| `phone-landscape` | Pixel 7 at 915×412               | `@phone`                             |
| `tablet`          | 1024×768, touch, mobile, DPR 2   | `@tablet`                            |

- `@review` and `@screenshots` stay opt-in in every project (`tagFilter` in `playwright.config.ts`).
- Touch specs use the helpers in `tests/e2e/helpers.ts`: `tap`, `longPress`, `swipe`, `logInTouch` and `openAppTouch`. They never `dblclick` or hover.
- Run one project with `npx playwright test --project phone`.

## Try it on a real phone

Run `npm run dev -- --host` and open the printed network URL (`http://<your-ip>:5173/still-online/`) on a phone on the same Wi-Fi.
