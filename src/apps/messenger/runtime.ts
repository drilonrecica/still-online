// The app-wide conversation engine: one instance, created on first use, bound to the messenger store.
import { contacts } from '@/content/contacts';
import type { ContactContent } from '@/content/types';
import { events } from '@/os/events';
import { useNowPlayingStore } from '@/os/nowPlaying';
import { attentionKey, useAttentionStore } from '@/os/store/attention';
import { playSound, type SoundName } from '@/os/sound';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import { useToastStore } from '@/os/toast/store';
import { onIdle } from '@/os/idle';
import { useWorldStore } from '@/os/world';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { requestShake } from './chat/nudge';
import { requestWink } from './winks/play';
import { summarizeAway } from './awaySummary';
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
    getDay: () => useWorldStore.getState().day,
    onUnlock: (id) => useWorldStore.getState().unlock(id),
  });
  // Incoming nudge: sound, bring the conversation up, shake it.
  created.on('nudge', ({ contactId, from }) => {
    if (from !== 'contact') return;
    playSound('nudge');
    requestShake(contactId);
    useWindowsStore.getState().openApp('messenger-chat', { contactId });
  });
  // Winks play over the chat; an incoming one brings the chat up like a nudge (no shake).
  created.on('wink', ({ contactId, from, wink }) => {
    playSound('notify');
    requestWink(contactId, wink);
    if (from === 'contact')
      useWindowsStore.getState().openApp('messenger-chat', { contactId });
  });
  // Toasts: never for the chat the player is already looking at.
  const toast = (
    contactId: string,
    sound: SoundName,
    title: string,
    text?: string,
  ) => {
    if (isChatFocused(contactId)) return;
    playSound(sound);
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
    if (show)
      toast(contactId, 'online', `${nameOf(contactId)} has just signed in.`);
  });
  created.on('message', ({ contactId, from, text }) => {
    if (from !== 'contact') return;
    const preview =
      text.length > TOAST_PREVIEW_CHARS
        ? `${text.slice(0, TOAST_PREVIEW_CHARS)}…`
        : text;
    toast(contactId, 'notify', `${nameOf(contactId)} says:`, preview);
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

  // No line, no Messenger: hanging up the modem signs out.
  const stopNetwork = events.on('network:disconnected', () => {
    if (useMessengerStore.getState().signedIn) created.signOut();
  });

  // Logging off or shutting down ends the session. Without this the engine stays signed in
  // across a power cycle in the same tab, so the next day's presence and scripts never fire.
  const stopSession = useSessionStore.subscribe((s, prev) => {
    if (prev.state === 'desktop' && s.state !== 'desktop') created.signOut();
  });

  // Auto-away: idle for `awayMinutes` while signed in and Online → Away; input → back.
  let stopIdle = () => {};
  const armIdle = (minutes: number) => {
    stopIdle();
    stopIdle = onIdle(minutes, () => {
      const { signedIn, progress, goAway } = useMessengerStore.getState();
      if (!signedIn || progress.player.status !== 'online') return;
      goAway(useSettingsStore.getState().awayMessage, true);
    });
  };
  armIdle(useSettingsStore.getState().awayMinutes);
  const stopAwaySetting = useSettingsStore.subscribe((s, prev) => {
    if (s.awayMinutes !== prev.awayMinutes) armIdle(s.awayMinutes);
  });
  const stopActive = events.on('os:active', () => {
    const { progress, setPlayerStatus } = useMessengerStore.getState();
    if (progress.player.status === 'away' && progress.player.autoAway)
      setPlayerStatus('online');
  });

  // Back from Away: "While you were away" lists what arrived meanwhile.
  const stopAwaySummary = useMessengerStore.subscribe((s, prev) => {
    const was = prev.progress.player;
    if (was.status !== 'away' || s.progress.player.status === 'away') return;
    const summary = summarizeAway(
      s.progress.contacts,
      was.awaySince ?? 0,
      nameOf,
    );
    if (!summary) return;
    playSound('notify');
    useToastStore.getState().push({
      title: 'While you were away',
      text: summary.text,
      icon: messengerIcon,
      onClick: () =>
        useWindowsStore
          .getState()
          .openApp('messenger-chat', { contactId: summary.latestContactId }),
    });
  });

  stopListening = () => {
    stopIdle();
    stopAwaySetting();
    stopActive();
    stopAwaySummary();
    stopNetwork();
    stopSession();
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
