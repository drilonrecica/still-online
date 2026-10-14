// The app-wide conversation engine: one instance, created on first use, bound to the messenger store.
import { contacts } from '@/content/contacts';
import type { ContactContent } from '@/content/types';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { attentionKey, useAttentionStore } from '@/os/store/attention';
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
let stopListening: (() => void) | null = null;
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
  // Now playing follows state, not single events, so a track that started before
  // Messenger or the toggle was on still shows, and stopping/unticking restores the
  // player's own message. `onNowPlaying` scripts run at most once per trackId (engine).
  const syncNowPlaying = () => {
    const track = useNowPlayingStore.getState().track;
    const store = useMessengerStore.getState();
    if (store.progress.player.showNowPlaying && track) {
      store.showNowPlayingLine(`♫ ${track.artist} - ${track.title}`);
      created.nowPlaying(track);
    } else {
      store.clearNowPlayingLine();
    }
  };
  stopListening?.();
  const stopTrack = useNowPlayingStore.subscribe(syncNowPlaying);
  const stopToggle = useMessengerStore.subscribe((s, prev) => {
    // The engine ignores nowPlaying while signed out, so signing in syncs again.
    if (
      s.progress.player.showNowPlaying !==
        prev.progress.player.showNowPlaying ||
      s.signedIn !== prev.signedIn
    )
      syncNowPlaying();
  });

  // Taskbar attention: a waiting contact's chat window flashes, and the Messenger window
  // flashes while some waiting contact has no chat window open to show it.
  let flagged = new Set<string>();
  const syncAttention = () => {
    const { signedIn, progress } = useMessengerStore.getState();
    const waiting = signedIn
      ? Object.entries(progress.contacts)
          .filter(([, c]) => c.active?.awaitingChoice === true)
          .map(([id]) => id)
      : [];
    const openChats = new Set(
      useWindowsStore
        .getState()
        .windows.filter((w) => w.appId === 'messenger-chat')
        .map((w) => String(w.props.contactId)),
    );
    const next = new Set(
      waiting.map((id) => attentionKey('messenger-chat', id)),
    );
    if (waiting.some((id) => !openChats.has(id))) next.add('messenger');
    const { setAttention } = useAttentionStore.getState();
    for (const key of flagged) if (!next.has(key)) setAttention(key, false);
    for (const key of next) setAttention(key, true);
    flagged = next;
  };
  const stopAttention = [
    useMessengerStore.subscribe(syncAttention),
    useWindowsStore.subscribe(syncAttention),
  ];

  stopListening = () => {
    stopTrack();
    stopToggle();
    for (const stop of stopAttention) stop();
    flagged = new Set();
    for (const key of Object.keys(useAttentionStore.getState().keys))
      if (key === 'messenger' || key.startsWith('messenger-chat:'))
        useAttentionStore.getState().setAttention(key, false);
  };
  syncNowPlaying();
  syncAttention();
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
  stopListening?.();
  stopListening = null;
  engine?.dispose();
  engine = null;
  contents = next;
}
