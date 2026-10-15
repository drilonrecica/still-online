// Shared engine internals: store access and timers. Used by runner.ts and engine.ts.
import { getLocale as currentLocale } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import { createEventBus } from '@/os/events';
import type {
  ContactContent,
  ContactId,
  ContactProgress,
} from '@/content/types';
import { defaultContactProgress, defaultScriptProgress } from './progress';
import { realScheduler } from './scheduler';
import type {
  EngineEventMap,
  EngineStore,
  Scheduler,
  TimerHandle,
} from './types';

export interface ConversationEngineOptions {
  contents: readonly ContactContent[];
  store: EngineStore;
  scheduler?: Scheduler;
  getPlayerName?: () => string;
  /** The locale choices and typing times are rendered in. Default: the app's locale. */
  getLocale?: () => Locale;
  /**
   * A contact's content with its text in `locale` (same scripts and nodes as `contents`).
   * Default: `contents`, whatever the locale.
   */
  getText?: (
    contactId: ContactId,
    locale: Locale,
  ) => ContactContent | undefined;
  /** True while the contact's chat window is focused; such messages don't count as unread. */
  isChatFocused?: (contactId: ContactId) => boolean;
  /** The world day, for `onDay` triggers and `Contact.days` presence. Default 1. */
  getDay?: () => number;
  /** A delivered line grants a world unlock (the runtime calls `world.unlock`). */
  onUnlock?: (id: string) => void;
}

export type EngineContext = ReturnType<typeof createEngineContext>;

export function createEngineContext(options: ConversationEngineOptions) {
  const { contents, store } = options;
  const scheduler = options.scheduler ?? realScheduler;
  const playerName = options.getPlayerName ?? (() => 'Player');
  const locale = options.getLocale ?? currentLocale;
  const isFocused = options.isChatFocused ?? (() => false);
  const getDay = options.getDay ?? (() => 1);
  const onUnlock = options.onUnlock ?? (() => {});
  const bus = createEventBus<EngineEventMap>();
  const byId = new Map(contents.map((c) => [c.contact.id, c]));
  /** One pending line step per contact (lines play strictly in sequence). */
  const lineTimers = new Map<ContactId, TimerHandle>();
  const otherTimers = new Set<TimerHandle>();

  const data = () => store.getState();
  const contentOf = (id: ContactId) => byId.get(id);
  /** `id`'s content with text in the current locale. */
  const textOf = (id: ContactId) =>
    options.getText?.(id, locale()) ?? contentOf(id);
  const progressOf = (id: ContactId): ContactProgress => {
    const p = data().progress.contacts[id];
    if (p) return p;
    const content = contentOf(id);
    if (!content) throw new Error(`[messenger] unknown contact "${id}"`);
    return defaultContactProgress(content.contact);
  };
  const patchContact = (
    id: ContactId,
    fn: (p: ContactProgress) => ContactProgress,
  ) => {
    const { progress } = data();
    store.setState({
      progress: {
        ...progress,
        contacts: { ...progress.contacts, [id]: fn(progressOf(id)) },
      },
    });
  };
  const setFlag = (key: 'online' | 'typing', id: ContactId, value: boolean) =>
    store.setState({ [key]: { ...data()[key], [id]: value } });
  const isOnline = (id: ContactId) => data().online[id] === true;
  const visit = (p: ContactProgress, scriptId: string, nodeId: string) => {
    const s = p.scripts[scriptId] ?? defaultScriptProgress();
    const visited = s.visited.includes(nodeId)
      ? s.visited
      : [...s.visited, nodeId];
    return { ...p.scripts, [scriptId]: { ...s, visited } };
  };

  // --- timers --------------------------------------------------------------

  const after = (ms: number, fn: () => void) => {
    const handle = scheduler.setTimeout(() => {
      otherTimers.delete(handle);
      fn();
    }, ms);
    otherTimers.add(handle);
  };
  const lineStep = (id: ContactId, ms: number, fn: () => void) => {
    const prev = lineTimers.get(id);
    if (prev !== undefined) scheduler.clearTimeout(prev);
    lineTimers.set(
      id,
      scheduler.setTimeout(() => {
        lineTimers.delete(id);
        fn();
      }, ms),
    );
  };
  const clearTimers = () => {
    for (const h of [...lineTimers.values(), ...otherTimers])
      scheduler.clearTimeout(h);
    lineTimers.clear();
    otherTimers.clear();
  };

  return {
    contents,
    store,
    scheduler,
    playerName,
    locale,
    isFocused,
    getDay,
    onUnlock,
    bus,
    data,
    contentOf,
    textOf,
    progressOf,
    patchContact,
    setFlag,
    isOnline,
    visit,
    after,
    lineStep,
    clearTimers,
  };
}
