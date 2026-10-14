// Which windows want the player's attention (their taskbar button flashes). Apps set keys;
// the taskbar reads them. A key is an appId, or `appId:instanceKey` for multi-instance apps.
import { create } from 'zustand';

interface AttentionStore {
  keys: Readonly<Record<string, true>>;
  setAttention: (key: string, on: boolean) => void;
}

export const useAttentionStore = create<AttentionStore>()((set) => ({
  keys: {},
  setAttention: (key, on) =>
    set((s) => {
      if (on === (s.keys[key] === true)) return {};
      const keys = { ...s.keys };
      if (on) keys[key] = true;
      else delete keys[key];
      return { keys };
    }),
}));

/** The attention key of a window: its appId, plus the instance key when the app has one. */
export function attentionKey(appId: string, instanceKey?: string): string {
  return instanceKey === undefined ? appId : `${appId}:${instanceKey}`;
}
