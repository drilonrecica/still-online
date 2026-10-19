// Script playback: triggers, the per-contact queue, line delivery and contact sign-in.
import { resolveGender } from '@/content/gender';
import type {
  ActiveScript,
  Contact,
  ContactId,
  DayPresence,
  ContactLine,
  NeutralTranscriptEntry,
  PersonalMessageRef,
  Script,
  ScriptNode,
  TriggerContext,
} from '@/content/types';
import type { EngineContext } from './context';
import { defaultScriptProgress } from './progress';
import {
  fillPlaceholders,
  lineParams,
  scriptChoice,
  scriptLine,
} from './render';
import { typingMs } from './text';
import type { ResolvedChoice } from './types';

interface Running {
  script: Script;
  node: ScriptNode;
  active: ActiveScript;
}

/** How long after the message a contact's `awayReply` follows. */
export const AWAY_REPLY_DELAY_MS = 1500;

export type Runner = ReturnType<typeof createRunner>;

/** The key of the highest `days` entry with `key <= day`; 0 if there is none. */
export function presenceDayFor(contact: Contact, day: number): number {
  let best = 0;
  for (const key of Object.keys(contact.days ?? {}).map(Number)) {
    if (key <= day && key > best && contact.days?.[key]) best = key;
  }
  return best;
}

/** The highest `days` entry with `key <= day`, or none. */
export function presenceFor(contact: Contact, day: number): DayPresence {
  return contact.days?.[presenceDayFor(contact, day)] ?? {};
}

export function createRunner(ctx: EngineContext) {
  const {
    bus,
    data,
    contentOf,
    textOf,
    progressOf,
    patchContact,
    top8Of,
    setTop8,
    setFlag,
    isOnline,
    visit,
    lineStep,
    playerName,
    locale,
    gender,
    isFocused,
    scheduler,
    after,
    getDay,
    onUnlock,
  } = ctx;

  const running = (id: ContactId): Running | null => {
    if (!contentOf(id)) return null;
    const active = progressOf(id).active;
    const script =
      active && contentOf(id)?.scripts.find((s) => s.id === active.scriptId);
    const node = active && script?.nodes[active.nodeId];
    return active && script && node ? { script, node, active } : null;
  };

  const eligible = (id: ContactId, script: Script, context: TriggerContext) => {
    // A gendered script never arms for the other gender; a switch mid-run lets it finish.
    if (script.forGender !== undefined && script.forGender !== gender())
      return false;
    // Top 8 reactions run once per drop / re-add: the record decides, not `runs`.
    const record = top8Of(id);
    if (script.trigger.type === 'onTop8Dropped')
      return record?.state === 'dropped' && record.day < getDay();
    if (script.trigger.type === 'onTop8Readded')
      return record?.state !== 'dropped';
    const s = progressOf(id).scripts[script.id] ?? defaultScriptProgress();
    if (context.trackId !== undefined && s.trackIds.includes(context.trackId))
      return false;
    return script.repeat === true || s.runs === 0;
  };

  const fire = (id: ContactId, script: Script, context: TriggerContext) => {
    const p = progressOf(id);
    if (p.active?.scriptId === script.id) return;
    if (p.queue.some((q) => q.scriptId === script.id)) return;
    if (!eligible(id, script, context)) return;
    if (isOnline(id) && !p.active) start(id, script, context);
    else
      patchContact(id, (c) => ({
        ...c,
        queue: [...c.queue, { scriptId: script.id, context }],
      }));
  };

  const fireAll = (
    id: ContactId,
    type: Script['trigger']['type'],
    context: TriggerContext = {},
  ) => {
    for (const script of contentOf(id)?.scripts ?? []) {
      if (script.trigger.type === type) fire(id, script, context);
    }
  };

  /** Starts the next runnable queued script, if the contact is free. */
  const pump = (id: ContactId) => {
    while (isOnline(id) && !progressOf(id).active) {
      const [next, ...rest] = progressOf(id).queue;
      if (!next) return;
      patchContact(id, (c) => ({ ...c, queue: rest }));
      const script = contentOf(id)?.scripts.find((s) => s.id === next.scriptId);
      if (script && eligible(id, script, next.context))
        start(id, script, next.context);
    }
  };

  const start = (id: ContactId, script: Script, context: TriggerContext) => {
    const active: ActiveScript = {
      scriptId: script.id,
      nodeId: script.start,
      lineIndex: 0,
      awaitingChoice: false,
      context,
    };
    patchContact(id, (c) => ({
      ...c,
      active,
      scripts: visit(c, script.id, script.start),
    }));
    // The friend has reacted: a re-add from now on fires `onTop8Readded`.
    const record = top8Of(id);
    if (script.trigger.type === 'onTop8Dropped' && record)
      setTop8(id, { ...record, state: 'reacted' });
    bus.emit('scriptStarted', { contactId: id, scriptId: script.id });
    playNext(id);
  };

  const end = (id: ContactId, { script, active }: Running) => {
    patchContact(id, (c) => {
      const s = c.scripts[script.id] ?? defaultScriptProgress();
      const trackId = active.context.trackId;
      const trackIds =
        trackId === undefined || s.trackIds.includes(trackId)
          ? s.trackIds
          : [...s.trackIds, trackId];
      return {
        ...c,
        active: null,
        scripts: {
          ...c.scripts,
          [script.id]: { ...s, runs: s.runs + 1, trackIds },
        },
      };
    });
    bus.emit('scriptEnded', { contactId: id, scriptId: script.id });
    const t = script.trigger.type;
    if (t === 'onTop8Dropped' || t === 'onTop8Readded')
      bus.emit('top8Reacted', {
        contactId: id,
        kind: t === 'onTop8Dropped' ? 'dropped' : 'readded',
      });
    armFollowUps(id, script.id);
    pump(id);
  };

  /** Arms the `afterScript` scripts of `id` that wait on `scriptId`. */
  const armFollowUps = (id: ContactId, scriptId: string) => {
    for (const s of contentOf(id)?.scripts ?? []) {
      const t = s.trigger;
      if (t.type === 'afterScript' && t.scriptId === scriptId)
        after(t.minutes * 60_000, () => fire(id, s, {}));
    }
  };

  const choicesOf = (id: ContactId): ResolvedChoice[] | null => {
    const r = running(id);
    if (!r?.active.awaitingChoice || !('choices' in r.node)) return null;
    const { scriptId, nodeId, context } = r.active;
    const params = lineParams(context);
    const resolve = (t: string) =>
      resolveGender(
        fillPlaceholders(t, params, locale(), playerName()),
        gender(),
      );
    const text = textOf(id);
    return r.node.choices.map((c, i) => {
      const shown = scriptChoice(text, scriptId, nodeId, i) ?? c;
      return {
        text: resolve(shown.text),
        label: resolve(shown.label ?? shown.text),
        next: c.next,
      };
    });
  };

  /** Plays the next undelivered line of the active node, or waits for a choice / ends. */
  const playNext = (id: ContactId) => {
    const r = running(id);
    if (!r) return;
    const line = r.node.lines[r.active.lineIndex];
    if (!line) {
      if (!('choices' in r.node)) return end(id, r);
      patchContact(id, (c) =>
        c.active ? { ...c, active: { ...c.active, awaitingChoice: true } } : c,
      );
      bus.emit('choices', { contactId: id, choices: choicesOf(id) ?? [] });
      return;
    }
    lineStep(id, line.delayMs, () => {
      if (line.text === undefined) return deliver(id, line);
      setFlag('typing', id, true);
      bus.emit('typingStart', { contactId: id });
      const { scriptId, nodeId, lineIndex } = r.active;
      const shown = scriptLine(textOf(id), scriptId, nodeId, lineIndex)?.text;
      const text = resolveGender(
        fillPlaceholders(
          shown ?? line.text,
          lineParams(r.active.context),
          locale(),
          playerName(),
        ),
        gender(),
      );
      lineStep(id, typingMs(text), () => {
        setFlag('typing', id, false);
        bus.emit('typingStop', { contactId: id });
        deliver(id, line);
      });
    });
  };

  /** Delivers one line and its actions in a single store write, so a reload never repeats it. */
  const deliver = (id: ContactId, line: ContactLine) => {
    const r = running(id);
    if (!r) return;
    const at = scheduler.now();
    const { scriptId, nodeId, lineIndex, context } = r.active;
    const params = lineParams(context);
    const ref = { scriptId, nodeId, lineIndex, ...(params ? { params } : {}) };
    const personalMessage: PersonalMessageRef | undefined =
      line.personalMessageChange === undefined
        ? undefined
        : { kind: 'line', ...ref };
    const away = data().progress.player.status === 'away';
    const message: NeutralTranscriptEntry | undefined =
      line.text === undefined
        ? undefined
        : {
            kind: 'line',
            from: 'contact',
            ...ref,
            at,
            ...(away ? { whileAway: true as const } : {}),
          };
    const entries: NeutralTranscriptEntry[] = message ? [message] : [];
    if (line.nudge) entries.push({ kind: 'nudge', from: 'contact', at });
    if (line.wink)
      entries.push({ kind: 'wink', from: 'contact', wink: line.wink, at });
    const before = progressOf(id);
    const wasOnline = isOnline(id);
    const status = line.statusChange;

    patchContact(id, (c) => ({
      ...c,
      transcript: [...c.transcript, ...entries],
      unread: c.unread + (message && !isFocused(id) ? 1 : 0),
      status: status ?? c.status,
      everSignedIn:
        c.everSignedIn || (status !== undefined && status !== 'offline'),
      personalMessage: personalMessage ?? c.personalMessage,
      active: c.active && { ...c.active, lineIndex: c.active.lineIndex + 1 },
    }));

    if (message)
      bus.emit('message', { contactId: id, from: 'contact', entry: message });
    if (line.nudge) bus.emit('nudge', { contactId: id, from: 'contact' });
    if (line.wink)
      bus.emit('wink', { contactId: id, from: 'contact', wink: line.wink });
    if (status !== undefined) {
      if (status === 'offline') setFlag('online', id, false);
      else if (!wasOnline) setFlag('online', id, true);
      bus.emit('statusChange', { contactId: id, status });
      if (status === 'offline' && wasOnline) {
        bus.emit('contactSignedOut', { contactId: id });
      } else if (
        status !== 'offline' &&
        (!wasOnline || before.status === 'offline')
      ) {
        bus.emit('contactSignedIn', { contactId: id, status, toast: true });
        if (!wasOnline) signInTriggers(id);
      }
    }
    if (personalMessage !== undefined) {
      bus.emit('personalMessageChange', { contactId: id, personalMessage });
    }
    if (line.unlock !== undefined) onUnlock(line.unlock);
    if (message && away) awayReply(id);
    playNext(id);
  };

  /** A contact's one-per-day reaction to messaging someone who is Away. */
  const awayReply = (id: ContactId) => {
    const reply = contentOf(id)?.contact.awayReply;
    const day = getDay();
    if (reply === undefined || progressOf(id).awayReplyDay === day) return;
    patchContact(id, (c) => ({ ...c, awayReplyDay: day }));
    after(AWAY_REPLY_DELAY_MS, () => {
      if (!isOnline(id)) return;
      const entry: NeutralTranscriptEntry = {
        kind: 'awayReply',
        from: 'contact',
        at: scheduler.now(),
        ...(data().progress.player.status === 'away'
          ? { whileAway: true as const }
          : {}),
      };
      patchContact(id, (c) => ({
        ...c,
        transcript: [...c.transcript, entry],
        unread: c.unread + (isFocused(id) ? 0 : 1),
      }));
      bus.emit('message', { contactId: id, from: 'contact', entry });
    });
  };

  // --- sign-in -------------------------------------------------------------

  const contactSignIn = (id: ContactId) => {
    const content = contentOf(id);
    if (!content) return;
    const p = progressOf(id);
    const day = getDay();
    const presenceDay =
      p.presenceDay < day ? presenceDayFor(content.contact, day) : 0;
    const presence = presenceFor(content.contact, presenceDay);
    const status =
      presence.status ??
      (p.everSignedIn && p.status !== 'offline'
        ? p.status
        : content.contact.initialStatus);
    patchContact(id, (c) => ({
      ...c,
      everSignedIn: true,
      status,
      personalMessage:
        presence.personalMessage === undefined
          ? c.personalMessage
          : { kind: 'day', day: presenceDay },
      presenceDay: Math.max(c.presenceDay, day),
    }));
    setFlag('online', id, true);
    bus.emit('contactSignedIn', {
      contactId: id,
      status,
      toast: content.contact.signInAfterMs > 0 && status !== 'offline',
    });
    // Resume: re-offer pending choices, or continue with the next undelivered line.
    const r = running(id);
    if (r?.active.awaitingChoice) {
      bus.emit('choices', { contactId: id, choices: choicesOf(id) ?? [] });
    } else if (r) {
      playNext(id);
    }
    signInTriggers(id);
    pump(id);
  };

  /** What a contact's sign-in fires: `onSignIn`, then a pending Top 8 drop from an earlier day. */
  const signInTriggers = (id: ContactId) => {
    fireAll(id, 'onSignIn');
    fireAll(id, 'onTop8Dropped');
  };

  return {
    running,
    fire,
    fireAll,
    choicesOf,
    playNext,
    contactSignIn,
    armFollowUps,
  };
}
