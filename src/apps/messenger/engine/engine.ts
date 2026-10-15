// Conversation engine: plays contact scripts (docs/content-format.md) against the messenger store.
// Pure TS: time comes from the injected scheduler, output goes to the store and engine events.
import type { createEventBus } from '@/os/events';
import type { ContactId, TriggerContext, WinkId } from '@/content/types';
import { createEngineContext, type ConversationEngineOptions } from './context';
import { reconcileContact } from './progress';
import { createRunner } from './runner';
import type { EngineEventMap, NowPlayingTrack, ResolvedChoice } from './types';

export type { ConversationEngineOptions } from './context';

export interface ConversationEngine {
  /** Player signs in: contacts sign in on their delays, scripts resume, `afterMinutes` arm. */
  signIn: () => void;
  /** Stops every timer. Undelivered lines stay pending and replay on the next sign-in. */
  signOut: () => void;
  /** Player picks reply `index`. Returns false if that contact isn't waiting for a choice. */
  choose: (contactId: ContactId, index: number) => boolean;
  /** Current choices for a contact, or null if they aren't waiting for one. */
  getChoices: (contactId: ContactId) => ResolvedChoice[] | null;
  playerNudge: (contactId: ContactId) => void;
  /** The player sends a wink: a transcript entry and a `wink` event (no script trigger). */
  playerWink: (contactId: ContactId, wink: WinkId) => void;
  nowPlaying: (track: NowPlayingTrack) => void;
  on: ReturnType<typeof createEventBus<EngineEventMap>>['on'];
  off: ReturnType<typeof createEventBus<EngineEventMap>>['off'];
  dispose: () => void;
}

export function createConversationEngine(
  options: ConversationEngineOptions,
): ConversationEngine {
  const ctx = createEngineContext(options);
  const { contents, store, scheduler, bus, data, contentOf } = ctx;
  const { patchContact, progressOf, visit, after, clearTimers, getDay } = ctx;
  const {
    running,
    fire,
    fireAll,
    choicesOf,
    playNext,
    contactSignIn,
    armFollowUps,
  } = createRunner(ctx);

  return {
    signIn() {
      if (data().signedIn) return;
      store.setState({ signedIn: true, online: {}, typing: {} });
      const day = getDay();
      for (const { contact, scripts } of contents) {
        patchContact(contact.id, (c) => reconcileContact(c, scripts));
        // Queued before the contact signs in; `fire` skips scripts that already ran.
        for (const script of scripts) {
          const t = script.trigger;
          if (t.type === 'onDay' && t.day <= day) fire(contact.id, script, {});
        }
        if (contact.signInAfterMs <= 0) contactSignIn(contact.id);
        else after(contact.signInAfterMs, () => contactSignIn(contact.id));
        for (const script of scripts) {
          const t = script.trigger;
          if (t.type === 'afterMinutes')
            after(t.minutes * 60_000, () => fire(contact.id, script, {}));
        }
        // Follow-ups whose target already ran (earlier session or before a reload).
        const ran = progressOf(contact.id).scripts;
        for (const s of scripts) {
          if ((ran[s.id]?.runs ?? 0) > 0) armFollowUps(contact.id, s.id);
        }
      }
    },
    signOut() {
      if (!data().signedIn) return;
      clearTimers();
      store.setState({ signedIn: false, online: {}, typing: {} });
      bus.emit('signedOut', {});
    },
    choose(id, index) {
      const r = running(id);
      const choice = choicesOf(id)?.[index];
      if (!data().signedIn || !r || !choice || !r.script.nodes[choice.next])
        return false;
      patchContact(id, (c) => ({
        ...c,
        transcript: [
          ...c.transcript,
          {
            kind: 'message',
            from: 'player',
            text: choice.text,
            at: scheduler.now(),
          },
        ],
        active: {
          ...r.active,
          nodeId: choice.next,
          lineIndex: 0,
          awaitingChoice: false,
        },
        scripts: visit(c, r.script.id, choice.next),
      }));
      bus.emit('message', { contactId: id, from: 'player', text: choice.text });
      playNext(id);
      return true;
    },
    getChoices: choicesOf,
    playerNudge(id) {
      if (!data().signedIn || !contentOf(id)) return;
      patchContact(id, (c) => ({
        ...c,
        transcript: [
          ...c.transcript,
          { kind: 'nudge', from: 'player', at: scheduler.now() },
        ],
      }));
      bus.emit('nudge', { contactId: id, from: 'player' });
      fireAll(id, 'onPlayerNudge');
    },
    playerWink(id, wink) {
      if (!data().signedIn || !contentOf(id)) return;
      patchContact(id, (c) => ({
        ...c,
        transcript: [
          ...c.transcript,
          { kind: 'wink', from: 'player', wink, at: scheduler.now() },
        ],
      }));
      bus.emit('wink', { contactId: id, from: 'player', wink });
    },
    nowPlaying(track) {
      if (!data().signedIn) return;
      const context: TriggerContext = { ...track };
      for (const { contact, scripts } of contents) {
        for (const script of scripts) {
          const t = script.trigger;
          if (t.type !== 'onNowPlaying') continue;
          if (t.trackId === undefined || t.trackId === track.trackId)
            fire(contact.id, script, context);
        }
      }
    },
    on: bus.on,
    off: bus.off,
    dispose() {
      clearTimers();
      bus.clear();
    },
  };
}
