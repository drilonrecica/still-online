# still online — v0.6 architecture (phones and tablets)

Extends `architecture.md`, `architecture-v0.2.md` and `architecture-v0.4.md`. The day-to-day rules (sizes, per-app behaviour) are in [touch.md](touch.md); this note is the map. Design: `docs/superpowers/specs/2026-10-20-v06-touch-design.md`. v0.6 adds no content, no app and no runtime dependency. The desktop is meant to stay as it was in v0.5.

## Device class

`src/os/device.ts` is the one place that decides the device: `phone` (`innerWidth < 600` or `innerHeight < 500`), else `tablet` (`(pointer: coarse)`), else `desktop`. `installDevice()` (from `App.tsx`) follows `resize`, `orientationchange` and `visualViewport` resizes, and `useDevice()` re-renders on a change. A phone turned to landscape is still a phone (the height rule).

## `[data-device]` CSS

`App` renders the class as `data-device` on `.desktop-root`, and CSS targets `.desktop-root[data-device='phone']` or `'tablet'`. There are no width `@media` queries and no user-agent sniffing. Overlays portalled outside `.desktop-root` (Desktop Wrecker) carry `data-device` themselves. The desktop has no rules of its own, which is how it stays as in v0.5.

Gestures are the opposite: they go **per event** by `pointerType === 'touch'`, never by device class, so a tablet with a mouse and a desktop with a touch screen both work.

## Touch hooks

`src/os/touch/` has `useActivate` (mouse double-click, touch tap or double-tap, Enter → open) and `useLongPress` (touch held 500 ms without moving 10 px, or right-click → context menu), plus `composeHandlers`. Both return a binder (`press(i)`), so one hook serves a whole list. Every double-click or context-menu interaction goes through them, so nothing is mouse-only. Sites that only block the native menu (Paint's canvas, the games) use pointer events directly.

## Shell: work area, keyboard, render-only maximize

- **Work area:** `viewportWorkArea()` uses `visualViewport.height` minus `taskbarHeight(device)` (30 px on a desktop, 40 px on touch). `interactive-widget=resizes-content` in the viewport meta makes the on-screen keyboard shrink the layout viewport, so a full-screen window shrinks above it. Safe-area insets are CSS variables (`--safe-*`).
- **Re-clamp:** `reclampAll()` (debounced 100 ms after a resize) moves windows back into the work area. It is a no-op when everything fits.
- **Render-only maximize:** on a phone `effectiveMaximized(win, device)` renders every window full screen **without storing it**, so the desktop geometry survives a rotation or a move to a bigger screen. A tablet opens a window maximized (stored, restorable) only when its default size does not fit.

## `ScaleToFit` and the browser zoom

Two places lay content out at a fixed width and shrink it with CSS `zoom` (not `transform`, so hit-testing and scrolling stay native):

- **`ScaleToFit`** (`src/os/touch/ScaleToFit.tsx`): a fixed-size stage zoomed to fit its box, centred, with a `ResizeObserver`. It renders its children bare when inactive, which is how desktop games stay as in v0.5. It exposes `--stage-scale`, so controls can stay 36 px on screen. Pinball and Hen Hunt use it on a phone, Mines on a phone (grown) and a tablet (shrunk only).
- **Browser zoom** (`src/apps/browser/zoom.ts`): on a phone every page lays out at 800 px (`PAGE_VIRTUAL_WIDTH`) and **Fit to screen** zooms it to the page area. **Actual size** drops the zoom and scrolls sideways. A tablet and a desktop never zoom. The Amplifier skin (`skinZoom.ts`) uses the same idea.

Under `zoom` (Chromium), `getBoundingClientRect()` and `clientX/Y` are in on-screen pixels while `offsetWidth` is unzoomed, so pointer maths divides by the rect-width / `offsetWidth` ratio (`toStage` for games).

## Test projects

`playwright.config.ts` has four Chromium projects. `chromium` is the desktop and skips `@phone` and `@tablet`. `phone` (Pixel 7) and `phone-landscape` (915×412) run `@phone` specs. `tablet` (1024×768, touch) runs `@tablet`. `@review` and `@screenshots` stay opt-in in all four. Touch helpers in `tests/e2e/helpers.ts` (`tap`, `longPress`, `swipe`, `logInTouch`, `openAppTouch`) never `dblclick` or hover.

The v0.6 specs: `v06-m0` to `v06-m3` (per phase), `v06-playthrough` (day 1 and day 10 by touch), the `v06-review-*` gates (`@review`) and `v06-m4` (release flows: phone portrait and landscape, tablet, desktop smoke). Desktop snapshots in `v06-m1-02.spec.ts-snapshots/` and `v06-m2-02.spec.ts-snapshots/` guard that the desktop did not change.
