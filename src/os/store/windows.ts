// Window manager store. Semantics are documented in docs/architecture.md → "Windows".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';
import {
  CASCADE_ORIGIN,
  CASCADE_STEP,
  MIN_VISIBLE_TITLEBAR,
  TASKBAR_HEIGHT,
  TITLEBAR_HEIGHT,
  WM_MIN_SIZE,
  type AppDefinition,
  type AppId,
  type Size,
  type WindowProps,
  type WindowState,
  type WindowsStore,
} from '@/os/types';

/** The part of an `AppDefinition` the window manager needs. */
export type WindowAppSpec = Pick<
  AppDefinition,
  'id' | 'title' | 'defaultSize' | 'minSize' | 'singleInstance' | 'instanceKey'
>;

export type AppResolver = (appId: AppId) => WindowAppSpec | undefined;

export interface WindowsStoreDeps {
  getApp: AppResolver;
  /** Work area size in px: the viewport minus the taskbar. */
  getWorkArea: () => Size;
}

export function viewportWorkArea(): Size {
  return {
    w: window.innerWidth,
    h: Math.max(0, window.innerHeight - TASKBAR_HEIGHT),
  };
}

/** Keeps ≥ MIN_VISIBLE_TITLEBAR px of the titlebar on screen and its top edge ≥ 0. */
export function clampPosition(
  x: number,
  y: number,
  w: number,
  work: Size,
): { x: number; y: number } {
  const minX = MIN_VISIBLE_TITLEBAR - w;
  const maxX = Math.max(minX, work.w - MIN_VISIBLE_TITLEBAR);
  const maxY = Math.max(0, work.h - TITLEBAR_HEIGHT);
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, 0), maxY),
  };
}

/** Position for a new window: last opened + CASCADE_STEP, wrapping to the origin at the edges. */
export function cascadePosition(
  last: Pick<WindowState, 'x' | 'y'> | undefined,
  size: Size,
  work: Size,
): { x: number; y: number } {
  if (!last) return { x: CASCADE_ORIGIN, y: CASCADE_ORIGIN };
  const x = last.x + CASCADE_STEP;
  const y = last.y + CASCADE_STEP;
  if (x + size.w > work.w || y + size.h > work.h) {
    return { x: CASCADE_ORIGIN, y: CASCADE_ORIGIN };
  }
  return { x, y };
}

/** The front-most non-minimized window, or null if there is none. */
export function selectActiveWindowId(
  state: Pick<WindowsStore, 'windows'>,
): string | null {
  let active: WindowState | undefined;
  for (const win of state.windows) {
    if (!win.minimized && (!active || win.z > active.z)) active = win;
  }
  return active?.id ?? null;
}

const ID_PREFIX = 'win-';

function idNumber(id: string): number {
  const n = Number(id.slice(ID_PREFIX.length));
  return id.startsWith(ID_PREFIX) && Number.isInteger(n) ? n : 0;
}

function instanceMatches(
  app: WindowAppSpec,
  win: WindowState,
  props: WindowProps,
): boolean {
  if (win.appId !== app.id) return false;
  return (
    !app.instanceKey || app.instanceKey(win.props) === app.instanceKey(props)
  );
}

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Validates one persisted window; returns null when it can't be restored. */
function restoreWindow(
  raw: unknown,
  deps: WindowsStoreDeps,
): WindowState | null {
  if (!isRecord(raw)) return null;
  const { id, appId, title, x, y, w, h, z, minimized, maximized, props } = raw;
  if (
    typeof id !== 'string' ||
    typeof appId !== 'string' ||
    typeof title !== 'string' ||
    !isNum(x) ||
    !isNum(y) ||
    !isNum(w) ||
    !isNum(h) ||
    !isNum(z) ||
    typeof minimized !== 'boolean' ||
    typeof maximized !== 'boolean' ||
    !isRecord(props)
  ) {
    return null;
  }
  const app = deps.getApp(appId as AppId);
  if (!app) return null;
  const min = app.minSize ?? WM_MIN_SIZE;
  const work = deps.getWorkArea();
  const width = Math.max(w, min.w);
  const height = Math.max(h, min.h);
  return {
    id,
    appId: appId as AppId,
    title,
    ...clampPosition(x, y, width, work),
    w: width,
    h: height,
    z,
    minimized,
    maximized,
    props: props as WindowProps,
  };
}

/**
 * Persisted under `still-online:v1:windows` but not hydrated at creation: the session calls
 * `useWindowsStore.persist.rehydrate()` on log on, so windows never restore during boot.
 */
export function createWindowsStore(deps: WindowsStoreDeps) {
  return create<WindowsStore>()(
    persist(
      windowsInitializer,
      persistOptions<WindowsStore, Pick<WindowsStore, 'windows' | 'topZ'>>({
        name: 'windows',
        skipHydration: true,
        partialize: ({ windows, topZ }) => ({ windows, topZ }),
        sanitize: (persisted, current) => {
          if (!isRecord(persisted) || !Array.isArray(persisted.windows)) {
            return current;
          }
          const seen = new Set<string>();
          const windows = persisted.windows
            .map((raw) => restoreWindow(raw, deps))
            .filter((win): win is WindowState => {
              if (!win || seen.has(win.id)) return false;
              seen.add(win.id);
              return true;
            });
          const topZ = Math.max(
            isNum(persisted.topZ) ? persisted.topZ : 0,
            ...windows.map((win) => win.z),
          );
          return { ...current, windows, topZ };
        },
      }),
    ),
  );

  function windowsInitializer(
    set: (
      partial:
        | Partial<WindowsStore>
        | ((state: WindowsStore) => Partial<WindowsStore>),
    ) => void,
    get: () => WindowsStore,
  ): WindowsStore {
    function update(
      id: string,
      patch: (win: WindowState) => Partial<WindowState>,
    ) {
      set((state) => ({
        windows: state.windows.map((win) =>
          win.id === id ? { ...win, ...patch(win) } : win,
        ),
      }));
    }

    function focus(id: string) {
      const { windows, topZ } = get();
      const win = windows.find((w) => w.id === id);
      if (!win) return;
      // Already in front and visible: don't burn a z value.
      if (!win.minimized && win.z === topZ) return;
      set({ topZ: topZ + 1 });
      update(id, () => ({ z: topZ + 1, minimized: false }));
    }

    return {
      windows: [],
      topZ: 0,

      openApp(appId, props = {}) {
        const app = deps.getApp(appId);
        if (!app) throw new Error(`[windows] unknown app "${appId}"`);
        const { windows, topZ } = get();

        if (app.singleInstance) {
          const existing = windows.find((win) =>
            instanceMatches(app, win, props),
          );
          if (existing) {
            focus(existing.id);
            return existing.id;
          }
        }

        const work = deps.getWorkArea();
        const w = Math.min(app.defaultSize.w, work.w);
        const h = Math.min(app.defaultSize.h, work.h);
        const cascaded = cascadePosition(windows.at(-1), { w, h }, work);
        const { x, y } = clampPosition(cascaded.x, cascaded.y, w, work);
        // Derived from existing ids so they stay unique after a persisted reload.
        const next =
          windows.reduce((max, win) => Math.max(max, idNumber(win.id)), 0) + 1;
        const id = `${ID_PREFIX}${next}`;

        set({
          topZ: topZ + 1,
          windows: [
            ...windows,
            {
              id,
              appId,
              title: app.title,
              x,
              y,
              w,
              h,
              z: topZ + 1,
              minimized: false,
              maximized: false,
              props,
            },
          ],
        });
        return id;
      },

      closeWindow(id) {
        set((state) => ({
          windows: state.windows.filter((win) => win.id !== id),
        }));
      },

      closeAll() {
        set({ windows: [] });
      },

      focusWindow: focus,

      minimizeWindow(id) {
        update(id, () => ({ minimized: true }));
      },

      toggleMaximize(id) {
        update(id, (win) => ({ maximized: !win.maximized }));
        focus(id);
      },

      setWindowTitle(id, title) {
        update(id, () => ({ title }));
      },

      setWindowProps(id, props) {
        update(id, () => ({ props }));
      },

      moveWindow(id, x, y) {
        const work = deps.getWorkArea();
        update(id, (win) => clampPosition(x, y, win.w, work));
      },

      resizeWindow(id, geometry) {
        const work = deps.getWorkArea();
        update(id, (win) => {
          const min = deps.getApp(win.appId)?.minSize ?? WM_MIN_SIZE;
          const w = Math.max(geometry.w, min.w);
          const h = Math.max(geometry.h, min.h);
          return { ...clampPosition(geometry.x, geometry.y, w, work), w, h };
        });
      },
    };
  }
}

let resolveApp: AppResolver = () => undefined;

/** Called once by the app registry (M1-05) so the shared store can look up apps. */
export function setAppResolver(resolver: AppResolver): void {
  resolveApp = resolver;
}

export const useWindowsStore = createWindowsStore({
  getApp: (appId) => resolveApp(appId),
  getWorkArea: viewportWorkArea,
});
