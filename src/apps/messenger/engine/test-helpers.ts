// Test-only helpers for engine specs: content builders and an event log.
import type {
  Contact,
  ContactContent,
  ContactLine,
  NeutralTranscriptEntry,
  PersonalMessageRef,
  Script,
} from '@/content/types';
import { createMessengerStore } from '../store';
import {
  createConversationEngine,
  type ConversationEngineOptions,
} from './engine';
import { renderEntry, renderPersonalMessage } from './render';
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

/** Renders stored references in English (for the engine's gender) for the log and `said`. */
type Render = {
  entry: (id: string, e: NeutralTranscriptEntry) => string;
  pm: (id: string, ref: PersonalMessageRef) => string;
};

const formatters = (render: Render): Formatters => ({
  contactSignedIn: (p) =>
    `signedIn ${p.contactId} ${p.status}${p.toast ? ' toast' : ''}`,
  contactSignedOut: (p) => `signedOut ${p.contactId}`,
  typingStart: (p) => `typing ${p.contactId}`,
  typingStop: (p) => `typingStop ${p.contactId}`,
  message: (p) =>
    `${p.from === 'player' ? '>' : '<'} ${p.contactId}: ${render.entry(p.contactId, p.entry)}`,
  nudge: (p) => `nudge ${p.from} ${p.contactId}`,
  wink: (p) => `wink ${p.from} ${p.contactId} ${p.wink}`,
  statusChange: (p) => `status ${p.contactId} ${p.status}`,
  personalMessageChange: (p) =>
    `pm ${p.contactId} ${render.pm(p.contactId, p.personalMessage)}`,
  choices: (p) =>
    `choices ${p.contactId} ${p.choices.map((c) => c.label).join('|')}`,
  scriptStarted: (p) => `start ${p.contactId}/${p.scriptId}`,
  scriptEnded: (p) => `end ${p.contactId}/${p.scriptId}`,
  signedOut: () => 'player signedOut',
});

/** A fresh store (hydrated from localStorage) + engine whose events are recorded in `log`. */
export function setup(
  contents: ContactContent[],
  options: Partial<ConversationEngineOptions> = {},
) {
  const store = createMessengerStore();
  // Engine tests play the girl side unless they pass `getGender`.
  const gender = options.getGender ?? (() => 'girl' as const);
  const engine = createConversationEngine({
    contents,
    store,
    getPlayerName: () => 'Ann',
    getGender: gender,
    ...options,
  });
  const name = options.getPlayerName ?? (() => 'Ann');
  const contentOf = (id: string) => contents.find((c) => c.contact.id === id);
  const render: Render = {
    entry: (id, e) => {
      const r = renderEntry(e, contentOf(id), 'en', name(), gender());
      return r?.kind === 'message' ? r.text : `<unresolved ${e.kind}>`;
    },
    pm: (id, ref) =>
      renderPersonalMessage(ref, contentOf(id), 'en', name(), gender()),
  };
  const format = formatters(render);
  const log: string[] = [];
  for (const type of Object.keys(format) as (keyof EngineEventMap)[]) {
    engine.on(type, (payload) =>
      log.push((format[type] as (p: typeof payload) => string)(payload)),
    );
  }
  const progress = (id: string) => {
    const p = store.getState().progress.contacts[id];
    if (!p) throw new Error(`no progress for ${id}`);
    return p;
  };
  /** The transcript rendered in English. */
  const said = (id: string) =>
    progress(id).transcript.map((e) =>
      e.kind === 'wink'
        ? `wink ${e.from} ${e.wink}`
        : e.kind === 'nudge'
          ? `nudge ${e.from}`
          : `${e.from === 'player' ? '>' : '<'} ${render.entry(id, e)}`,
    );
  /** The contact's personal message rendered in English. */
  const pm = (id: string) => render.pm(id, progress(id).personalMessage);
  /** Progress with the personal message rendered. */
  const presence = (id: string) => ({
    ...progress(id),
    personalMessage: pm(id),
  });
  /** Returns and clears the log. */
  const take = () => log.splice(0, log.length);
  return { store, engine, log, take, progress, said, pm, presence };
}
