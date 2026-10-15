// Test-only helpers for engine specs: content builders and an event log.
import type {
  Contact,
  ContactContent,
  ContactLine,
  Script,
} from '@/content/types';
import { createMessengerStore } from '../store';
import {
  createConversationEngine,
  type ConversationEngineOptions,
} from './engine';
import type { EngineEventMap } from './types';

export const line = (
  text: string | undefined,
  delayMs: number,
  extra: Omit<ContactLine, 'text' | 'delayMs'> = {},
): ContactLine =>
  text === undefined ? { delayMs, ...extra } : { text, delayMs, ...extra };

/** A one-node script that says `texts` (no delay) and ends. */
export const say = (
  id: string,
  trigger: Script['trigger'],
  texts: string[],
  repeat?: boolean,
): Script => ({
  id,
  trigger,
  start: 'only',
  repeat,
  nodes: { only: { lines: texts.map((t) => line(t, 0)), end: true } },
});

export const contactContent = (
  id: string,
  scripts: Script[],
  overrides: Partial<Contact> = {},
): ContactContent => ({
  contact: {
    id,
    displayName: id,
    handle: `${id}@livemail.example`,
    avatar: { kind: 'pattern', seed: id, colors: ['#000000', '#FFFFFF'] },
    group: 'friends',
    initialStatus: 'online',
    personalMessage: `${id}'s pm`,
    signInAfterMs: 0,
    ...overrides,
  },
  scripts,
});

type Formatters = {
  [K in keyof EngineEventMap]: (p: EngineEventMap[K]) => string;
};

const FORMAT: Formatters = {
  contactSignedIn: (p) =>
    `signedIn ${p.contactId} ${p.status}${p.toast ? ' toast' : ''}`,
  contactSignedOut: (p) => `signedOut ${p.contactId}`,
  typingStart: (p) => `typing ${p.contactId}`,
  typingStop: (p) => `typingStop ${p.contactId}`,
  message: (p) =>
    `${p.from === 'player' ? '>' : '<'} ${p.contactId}: ${p.text}`,
  nudge: (p) => `nudge ${p.from} ${p.contactId}`,
  wink: (p) => `wink ${p.from} ${p.contactId} ${p.wink}`,
  statusChange: (p) => `status ${p.contactId} ${p.status}`,
  personalMessageChange: (p) => `pm ${p.contactId} ${p.personalMessage}`,
  choices: (p) =>
    `choices ${p.contactId} ${p.choices.map((c) => c.label).join('|')}`,
  scriptStarted: (p) => `start ${p.contactId}/${p.scriptId}`,
  scriptEnded: (p) => `end ${p.contactId}/${p.scriptId}`,
  signedOut: () => 'player signedOut',
};

/** A fresh store (hydrated from localStorage) + engine whose events are recorded in `log`. */
export function setup(
  contents: ContactContent[],
  options: Partial<ConversationEngineOptions> = {},
) {
  const store = createMessengerStore();
  const engine = createConversationEngine({
    contents,
    store,
    getPlayerName: () => 'Ann',
    ...options,
  });
  const log: string[] = [];
  for (const type of Object.keys(FORMAT) as (keyof EngineEventMap)[]) {
    engine.on(type, (payload) =>
      log.push((FORMAT[type] as (p: typeof payload) => string)(payload)),
    );
  }
  const progress = (id: string) => {
    const p = store.getState().progress.contacts[id];
    if (!p) throw new Error(`no progress for ${id}`);
    return p;
  };
  /** Contact message texts in the transcript. */
  const said = (id: string) =>
    progress(id).transcript.map((e) =>
      e.kind === 'message'
        ? `${e.from === 'player' ? '>' : '<'} ${e.text}`
        : e.kind === 'wink'
          ? `wink ${e.from} ${e.wink}`
          : `nudge ${e.from}`,
    );
  /** Returns and clears the log. */
  const take = () => log.splice(0, log.length);
  return { store, engine, log, take, progress, said };
}
