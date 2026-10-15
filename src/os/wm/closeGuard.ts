// Lets an app veto a window close, e.g. Notepad's "Do you want to save the changes?".
// Only the titlebar Close button asks; log off and shut down close windows outright.
import { useWindowsStore } from '@/os/store/windows';

/** Returns true when the guard took over; it then closes the window itself later (or not at all). */
export type CloseGuard = () => boolean;

const guards = new Map<string, CloseGuard>();

/** Registers the guard for a window; returns the unregister function (an effect cleanup). */
export function registerCloseGuard(windowId: string, guard: CloseGuard) {
  guards.set(windowId, guard);
  return () => {
    if (guards.get(windowId) === guard) guards.delete(windowId);
  };
}

/** Closes the window unless its app's guard intercepts. */
export function requestClose(windowId: string): void {
  if (guards.get(windowId)?.()) return;
  useWindowsStore.getState().closeWindow(windowId);
}
