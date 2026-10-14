// The app-wide conversation engine: one instance, created on first use, bound to the messenger store.
import { contacts } from '@/content/contacts';
import type { ContactContent } from '@/content/types';
import { playSound } from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { requestShake } from './chat/nudge';
import { createConversationEngine, type ConversationEngine } from './engine';
import { useMessengerStore } from './store';

let engine: ConversationEngine | null = null;
let contents: readonly ContactContent[] = contacts;

/** The chat window for `contactId` is the active window. */
function isChatFocused(contactId: string): boolean {
  const state = useWindowsStore.getState();
  const activeId = selectActiveWindowId(state);
  const win = state.windows.find((w) => w.id === activeId);
  return win?.appId === 'messenger-chat' && win.props.contactId === contactId;
}

function createEngine(): ConversationEngine {
  const created = createConversationEngine({
    contents,
    store: useMessengerStore,
    getPlayerName: () => useSettingsStore.getState().playerName,
    isChatFocused,
  });
  // Incoming nudge: sound, bring the conversation up, shake it.
  created.on('nudge', ({ contactId, from }) => {
    if (from !== 'contact') return;
    playSound('nudge');
    requestShake(contactId);
    useWindowsStore.getState().openApp('messenger-chat', { contactId });
  });
  return created;
}

export function getMessengerEngine(): ConversationEngine {
  engine ??= createEngine();
  return engine;
}

/** The contacts the engine plays; the UI lists these. */
export function getMessengerContents(): readonly ContactContent[] {
  return contents;
}

/** Tests swap in their own content (and drop the engine so the next use rebuilds it). */
export function setMessengerContentsForTests(next: readonly ContactContent[]) {
  engine?.dispose();
  engine = null;
  contents = next;
}
