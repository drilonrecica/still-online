// The app-wide conversation engine: one instance, created on first use, bound to the messenger store.
import { contacts } from '@/content/contacts';
import type { ContactContent } from '@/content/types';
import { playSound } from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { useToastStore } from '@/os/toast/store';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { requestShake } from './chat/nudge';
import { createConversationEngine, type ConversationEngine } from './engine';
import { useMessengerStore } from './store';
import messengerIcon from '@/assets/icons/messenger-32.svg';

/** Characters of a message shown in its toast. */
export const TOAST_PREVIEW_CHARS = 40;

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
  // Toasts: never for the chat the player is already looking at.
  const toast = (contactId: string, title: string, text?: string) => {
    if (isChatFocused(contactId)) return;
    playSound('notify');
    useToastStore.getState().push({
      title,
      text,
      icon: messengerIcon,
      onClick: () =>
        useWindowsStore.getState().openApp('messenger-chat', { contactId }),
    });
  };
  const nameOf = (contactId: string) =>
    contents.find((c) => c.contact.id === contactId)?.contact.displayName ??
    contactId;
  created.on('contactSignedIn', ({ contactId, toast: show }) => {
    if (show) toast(contactId, `${nameOf(contactId)} has just signed in.`);
  });
  created.on('message', ({ contactId, from, text }) => {
    if (from !== 'contact') return;
    const preview =
      text.length > TOAST_PREVIEW_CHARS
        ? `${text.slice(0, TOAST_PREVIEW_CHARS)}…`
        : text;
    toast(contactId, `${nameOf(contactId)} says:`, preview);
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
