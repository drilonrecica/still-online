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
