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

- **Taskbar:** 40 px on touch devices. `--xp-taskbar-height` becomes `calc(40px + var(--safe-bottom))` on `.desktop-root` (`global.css`), so the window layer, desktop icons, Start menu, toasts and balloons all clear it. Stapley and Fluff read `taskbarHeight(device)`. On a phone the window buttons are icon-only 40×40 (title as `aria-label` and tooltip) and scroll sideways. The tray shows language, sound and clock, and a „‹" chevron (`HiddenIcons.tsx`) opens network, Messenger and Fluff. An outside tap, Escape or a window coming to the front closes it. On a tablet the buttons keep their labels and shrink from 160 px down to 110 px before the row scrolls. When the row scrolls, the front window's button scrolls into view.
- **Start menu:** on a phone it is `min(380px, 100vw)` wide and capped to the work area. All Programs is a full-height panel over the menu with a Back row, and its folders unfold in place on a tap. A tablet keeps the flyouts, and a tap's compatibility `mouseenter` starts no hover timer.
- **Overlays:** toasts are `min(220px, 92vw)` and balloons `min(250px, 92vw)`. Stapley is drawn at 0.8 on a phone (balloon `max-width: 70vw`), and his balloon options and menu rows are 45 px (36 px once scaled). App `.dialog`s are `max-width: 94vw` on a phone, and the buttons of any XP `[role='dialog']` are at least 36 px tall. A toast's × is a 36×36 corner target on a phone. The screensaver also stops on `touchstart`.
- **Login:** on a phone the wordmark, then the prompt over a divider, then the tile and fields. The middle scrolls when the keyboard shrinks the screen.
- `tests/e2e/v06-m1-02.spec.ts-snapshots/` holds the v0.5 desktop taskbar and Start menu (1280×800). The desktop test compares against them.

## Apps on a phone (M2-01)

- **Tap targets:** an app root with the class `touch-controls` gets 36 px buttons, drop-downs and text fields on a phone (`global.css`). Rows in lists (contacts, mail, folder items, menus) are 36 px in each app's CSS.
- **Messenger:** contact rows are 36 px and a tap opens a chat. The chat's transcript scrolls, the reply buttons wrap to full width, and the input and Send stay at the bottom above the keyboard. The emoticon picker is one column `min(290px, 92vw)` wide. On a phone, toasts drop in under the title bar, so they never cover the reply row, and only the newest one shows (the others still time out). „Show what I'm listening to" is an XP checkbox (`input` + `label`).
- **Mail:** one pane at a time (`mailPhoneView`): a Folders drop-down over the full-width list, a message full screen with Back in the toolbar, or Compose full screen with the fields stacked.
- **Folders** (Explorer, Recycle Bin, the Notepad file dialogs): no task pane, and its actions (Rename, Delete, Restore, Empty Recycle Bin) join the wrapping toolbar, with the address on its own row. A tap opens and a long-press selects. Details is a single-column list.
- **System apps:** Display, User Accounts, Regional, Disk Cleanup and Dial-up reflow to one column. Tab strips scroll sideways and Display's monitor preview scales. On a short (landscape) phone the panels and Dial-up scroll vertically instead of squeezing or clipping their content. My Computer's Credits link is a 36 px target.
- **Notepad:** menus open by tap (hover switching is mouse-only); dialogs are 94vw and scroll when the screen is short.
- **TuneMole:** results show the file name over size · bitrate · peer, plus Download. Each download wraps into its own block.
- **Stapley** steps out while a full-screen window is in front and he has nothing to say, so he never covers a Send or OK button. A new tip brings him back.
- **Web Explorer (M2-02):** on a phone every page lays out at 800 px (`PAGE_VIRTUAL_WIDTH`, `src/apps/browser/zoom.ts`). **Fit to screen** (the phone default) gives the page CSS `zoom` = page-area width / 800, rounded down to 1/1000 and recomputed by a `ResizeObserver`. `zoom` rather than `transform`, so hit-testing and scrolling stay native; code that reads pointer positions inside a page divides by `getBoundingClientRect().width / offsetWidth` (the rect is zoomed, `offsetWidth` isn't). **Actual size** drops the zoom and the page area scrolls sideways. View → Fit to screen / Actual size (radio items, phone only) saves `fitToScreen` in the `web` store. A tablet and a desktop always show pages at actual size, with no wrapper and the v0.5 chrome. The phone toolbar is Back, Forward, Refresh, Home and Favorites as 36 px icons, the address on its own row (16 px text), and Favorites is a sheet over the page that closes on a choice or a tap beside it. Form fields inside a page are `max(16px, 1em)`. Its menu bar items are at least 36×36 on a phone, which covers German's one-character „?" (Help).
- **Paint (M2-03):** on a phone the tool box is a sideways-scrolling strip of 36 px tools (with the current tool's options) under the menu bar, and the colour box a strip of 36 px swatches at the bottom. A new picture is the work area's size in whole pixels, at least 200×200 (`phoneCanvasSize`, `src/apps/paint/touch.ts`), including the blank one Paint opens with; opened and saved pictures keep their size. On touch one finger draws; when a second finger lands, `useCanvasTools` restores the picture to before the stroke (no undo step) and the fingers' midpoint scrolls the work area until every finger lifts (`createTouchTracker`). The work area takes the touch pointers in its capture phase, so it sees the second finger before the canvas does. A long-press on a swatch sets the secondary colour, and menu hover is mouse-only. On touch devices the status bar gives the touch hint („Drag to draw, two fingers to scroll…"), which wraps on a phone.
- **Snapshot Booth (M2-03):** stacked as on the desktop (preview, filters, controls, then the photo strip, which scrolls sideways), with 36 px buttons and the preview at least 140 px tall. The stage behind the 4:3 picture is transparent on a phone, so a tall portrait stage shows the window face, not black bars. `getUserMedia` asks for `facingMode: 'user'`, the front camera; the cartoon fallback is the e2e path.
- **Amplifier (M2-03):** the skin fills the full-screen window with CSS `zoom` (`useSkinFit`, `src/apps/amplifier/skinZoom.ts`). The zoom is the width / 275, or less when the open panels would run past the bottom, and never below 1. The skin is laid out at the window size divided by the zoom, so it stretches to fill it exactly. `--amp-tap` (36 px / zoom) keeps every button, playlist row and menu item 36 px on screen. The buttons wrap into a transport row and a toggle row. When the EQ and the playlist don't both fit (landscape), the skin scrolls. On a phone the playlist starts open, so the full-screen skin isn't mostly empty. The track menu divides the press point by the zoom (rect width / `offsetWidth`), as Web Explorer does.

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
