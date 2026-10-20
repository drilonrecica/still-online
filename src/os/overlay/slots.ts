// The overlay layer's slots and the desktop's z-order. See docs/architecture-v0.2.md → "Overlay layer".

/** Overlays rendered by `<OverlayLayer>`, bottom to top. */
export const OVERLAY_SLOTS = [
  'pet',
  'assistant',
  'balloons',
  'wrecker',
  'screensaver',
] as const;

export type OverlaySlot = (typeof OVERLAY_SLOTS)[number];

/**
 * Root stacking order of the desktop: windows < Fluff < Stapley < taskbar < balloons/toasts
 * < Start menu < Desktop Wrecker < boot/login < screensaver.
 * `windows` is the window layer itself; window `z` values only order windows inside it.
 */
export const Z_INDEX = {
  windows: 1,
  pet: 100,
  assistant: 200,
  taskbar: 10000,
  balloons: 10001,
  startMenu: 10002,
  wrecker: 15000,
  screens: 20000,
  screensaver: 25000,
} as const satisfies Record<OverlaySlot | string, number>;
