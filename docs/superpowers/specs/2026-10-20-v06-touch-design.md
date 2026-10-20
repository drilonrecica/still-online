# still online v0.6: phones and tablets

Design spec. Status: **approved by the owner on 2026-10-20**: the same XP desktop, adapted for touch, with every app and game working on a phone. It ships as igris phases **M0–M4**.

## Why

still online only works well with a mouse on a big screen. Phones and tablets get a "best experienced on a desktop computer" notice (`src/os/notice/SmallScreenNotice.tsx`), and the README lists touch layouts as a known gap. The live site is shared as a link, and most people open links on a phone.

## Decisions

| Topic   | Decision                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Look    | The **same XP desktop** everywhere. It is not a separate phone UI.                                            |
| Phone   | Every window renders full-screen. Taps open things, long-press is right-click, and controls are finger-sized. |
| Tablet  | The normal desktop with floating windows, plus touch-sized grips, title bars and taskbar.                     |
| Scope   | **Everything works on a phone:** the shell, every app, Paint, all four games and every 2007 site.             |
| Fiction | Unchanged. The game is still set in 2007, and touch support adds no smartphones to the story.                 |
| Desktop | Unchanged at 1280×800. The only change it shares is a window re-clamp when the browser window is resized.     |
| Version | v0.6.0.                                                                                                       |

## Device class

`src/os/device.ts` is the one source of truth. It provides `getDevice()`, a `useDevice()` hook and a `data-device` attribute on `.desktop-root`. It updates live on `resize` and `orientationchange`.

| Class     | Rule                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `phone`   | `innerWidth < 600 \|\| innerHeight < 500`. This covers phones in portrait and landscape, and very narrow desktop windows. |
| `tablet`  | Not a phone, and `matchMedia('(pointer: coarse)')`.                                                                       |
| `desktop` | Everything else.                                                                                                          |

Gestures decide **per event**, by `pointerType === 'touch'`, not by device class. So a touchscreen laptop also gets single tap to open and long-press menus, and a mouse on a tablet keeps double-click.

## Global

- **Viewport meta:** `width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content`.
- **Safe areas:** `env(safe-area-inset-*)` pads the taskbar (bottom, left, right) and the top of maximized windows.
- **Shell CSS:**
  - `touch-action: manipulation`, so a double-tap doesn't zoom.
  - `-webkit-touch-callout: none` and `-webkit-tap-highlight-color: transparent`.
  - Text fields keep `user-select: text`.
- **Work area:** the height comes from `visualViewport.height` when available, so the on-screen keyboard shrinks it and the focused input stays visible.
- **Re-clamp:** on resize and orientation change, every window is re-clamped into the work area, using the existing `clampPosition` rules.
- **Removed:** `SmallScreenNotice` and the `smallScreenNoticeDismissed` setting. The settings sanitizer drops the field from old saves.

## Touch primitives (`src/os/touch/`)

- **`useLongPress(handler)`:**
  - Fires after 500 ms on a touch pointer, cancelled by a 10 px move or a lift.
  - Calls the same handler as `onContextMenu`, at the touch point.
  - Vibrates for 10 ms where `navigator.vibrate` exists.
  - Suppresses the click that follows.
- **`useActivate(open)`:** opens on a mouse double-click, a touch single tap, or Enter.
- **Where they apply:**
  - every `onDoubleClick` open: desktop icons, folder view items, the Messenger contact list, the Amplifier playlist and the title bar
  - every real context menu: the desktop, Stapley and Amplifier
- **Amplifier playlist:** on touch, its long-press menu adds Move up, Move down and Remove. Mouse drag stays.
- **Paint:** a long-press on a swatch sets the secondary colour, as a right-click does.

## Phone shell

- **Windows:**
  - Every window renders maximized: `effectiveMaximized = maximized || device === 'phone'`. Stored geometry is unchanged, so going back to a desktop restores it.
  - Maximize and Restore are hidden. Minimize and Close are 36×36 px.
  - The title bar is 36 px tall, with no drag and no resize grips.
  - App min sizes are capped to the work area.
- **Taskbar:**
  - 40 px tall.
  - The Start button keeps its label.
  - Window buttons are icon-only and 40 px wide, and they scroll sideways if there are many.
  - The tray keeps the clock, volume and language. Network, Fluff and Messenger go behind an XP-style "Show hidden icons" chevron („Ausgeblendete Symbole einblenden").
- **Start menu:**
  - `min(380px, 100vw)` wide, capped to the work-area height, scrolling inside.
  - All Programs opens on tap as a full-height list, not a hover flyout.
- **Desktop icons:** the grid reflows to fit the screen. A tap opens on touch.
- **Overlays:**
  - Toasts and balloons are `min(<width>, 92vw)`.
  - Stapley is scaled to 0.8, and his menu opens on long-press.
  - XP dialogs are `max-width: 94vw`.
  - The screensaver dismisses on touch.
- **Login:** the welcome screen stacks the logo above the account tile on a phone.

## Tablet shell

- Floating windows as on the desktop.
- Resize grips have 16 px touch zones, and the title bar is 36 px.
- A window whose default size doesn't fit the work area opens maximized.
- The taskbar is 40 px.

## Apps on a phone

| App                                                     | Phone layout                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messenger                                               | The contact list and each chat are full-screen windows. The input stays above the keyboard, and the reply buttons wrap. A tap opens a chat.                                                                                                                                                                                                                                                                                                        |
| Mail                                                    | Stacked: the folder list becomes a drop-down above a full-width message list. Tapping a message opens it with a Back button, and Compose is full screen.                                                                                                                                                                                                                                                                                           |
| Explorer, folders, My Computer, Recycle Bin             | The task pane collapses and the toolbar stays.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Display, User Accounts, Regional, Disk Cleanup, Dial-up | The fixed sizes are dropped on a phone, and the content reflows to one column.                                                                                                                                                                                                                                                                                                                                                                     |
| Notepad, TuneMole                                       | The menu bars are tap-only (no hover switching needed). TuneMole condenses its result columns.                                                                                                                                                                                                                                                                                                                                                     |
| Web Explorer                                            | Pages lay out at an **800 px virtual width**, scaled to fit with CSS `zoom`, like a 2007 mobile browser. A View menu toggle switches between **Fit to screen** (the default on a phone) and **Actual size** (scrolls sideways), and the choice is persisted. The toolbar is condensed to Back, Forward, Refresh, Home and the address bar. Favorites open as an overlay sheet. Status-bar hover text has no touch equivalent and doesn't need one. |
| Paint                                                   | The tool box and palette become a scrollable strip. A new image on a phone defaults to the canvas area's size, and saved images keep their size. One finger draws; two fingers scroll the canvas area.                                                                                                                                                                                                                                             |
| Snapshot Booth                                          | Front camera by default, stacked layout.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Amplifier                                               | A full-width mini player with touch-sized buttons.                                                                                                                                                                                                                                                                                                                                                                                                 |

## Games on a phone

- **`<ScaleToFit width height>`** (`src/os/touch/ScaleToFit.tsx`): scales a fixed-size game stage to fit its window, and gives the app a `toStage(clientX, clientY)` mapping.
- **Pinball:** scaled to fit. Its tap zones (flippers left and right, plunger in the launch lane) already exist.
- **HenHunt:**
  - Scaled to fit.
  - On touch, a tap aims and shoots at that point, and a one-finger drag pans the view. This replaces the hover edge-pan.
- **Mines:**
  - Moves from mouse events to pointer events.
  - Adds a flag-mode toggle (🚩, „Markiermodus") next to the face, and a long-press flags a cell.
  - The board scales to fit.
- **Wrecker:** the on-screen palette already covers tools 1–5. Add on-screen Reset (R) and Spin (Space) buttons when the last pointer was touch.
- **Konami on touch:** swiping up, up, down, down, left, right, left, right on the desktop background, then two taps, unlocks the same thing as the key code.

## i18n

Every new UI string is added in English and German in the same task. German follows `docs/localization-de.md` (system UI uses „Sie").

| English             | German                           |
| ------------------- | -------------------------------- |
| Fit to screen       | An Bildschirm anpassen           |
| Actual size         | Originalgröße                    |
| Show hidden icons   | Ausgeblendete Symbole einblenden |
| Flag mode           | Markiermodus                     |
| Move up / Move down | Nach oben / Nach unten           |
| Back                | Zurück                           |

## Testing

- **Playwright projects:**
  - `chromium`: desktop, as today.
  - `phone`: Chromium with `devices['Pixel 7']` (`hasTouch`, `isMobile`).
  - `phone-landscape`: Chromium, 915×412, touch, mobile.
  - `tablet`: Chromium, 1024×768, touch, mobile.
- **Which specs run where:**
  - Phone specs are tagged `@phone` and tablet specs `@tablet`.
  - The desktop project excludes both tags.
  - The touch projects run only their tag.
  - `@review` and `@screenshots` stay opt-in everywhere.
- **Helpers** in `tests/e2e/helpers.ts`: `tap`, `longPress`, `swipe`, and a touch `logIn`/`openApp` that never double-clicks.
- **Unit tests:**
  - the device class and the hooks
  - `ScaleToFit` mapping
  - render-only maximize
  - the re-clamp
- **Review:**
  - play day 1 as a girl in English and day 10 as a boy in German, on a phone in portrait
  - every app in landscape
  - the shell on a tablet
  - a 1280×800 desktop regression
