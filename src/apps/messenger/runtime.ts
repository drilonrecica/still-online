// The app-wide conversation engine: one instance, created on first use, bound to the messenger store.
import { contacts } from '@/content/contacts';
import type { ContactContent } from '@/content/types';
import { useSettingsStore } from '@/os/store/settings';
import { createConversationEngine, type ConversationEngine } from './engine';
import { useMessengerStore } from './store';

let engine: ConversationEngine | null = null;
let contents: readonly ContactContent[] = contacts;

export function getMessengerEngine(): ConversationEngine {
  engine ??= createConversationEngine({
    contents,
    store: useMessengerStore,
    getPlayerName: () => useSettingsStore.getState().playerName,
  });
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
