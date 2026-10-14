// Script playback: triggers, the per-contact queue, line delivery and contact sign-in.
import type {
  ActiveScript,
  ContactId,
  ContactLine,
  Script,
  ScriptNode,
  TranscriptEntry,
  TriggerContext,
} from '@/content/types';
import type { EngineContext } from './context';
import { defaultScriptProgress } from './progress';
import { resolveText, typingMs } from './text';
import type { ResolvedChoice } from './types';

interface Running {
  script: Script;
  node: ScriptNode;
  active: ActiveScript;
}

export type Runner = ReturnType<typeof createRunner>;

export function createRunner(ctx: EngineContext) {
  const {
    bus,
    contentOf,
    progressOf,
    patchContact,
    setFlag,
    isOnline,
    visit,
    lineStep,
    playerName,
    isFocused,
    scheduler,
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
    pump(id);
  };

  const choicesOf = (id: ContactId): ResolvedChoice[] | null => {
    const r = running(id);
    if (!r?.active.awaitingChoice || !('choices' in r.node)) return null;
    const resolve = (t: string) =>
      resolveText(t, playerName(), r.active.context);
    return r.node.choices.map((c) => ({
      text: resolve(c.text),
      label: resolve(c.label ?? c.text),
      next: c.next,
    }));
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
      lineStep(
        id,
        typingMs(resolveText(line.text, playerName(), r.active.context)),
        () => {
          setFlag('typing', id, false);
          bus.emit('typingStop', { contactId: id });
          deliver(id, line);
        },
      );
    });
  };

  /** Delivers one line and its actions in a single store write, so a reload never repeats it. */
  const deliver = (id: ContactId, line: ContactLine) => {
    const r = running(id);
    if (!r) return;
    const at = scheduler.now();
    const resolve = (t: string) =>
      resolveText(t, playerName(), r.active.context);
    const text = line.text === undefined ? undefined : resolve(line.text);
    const personalMessage =
      line.personalMessageChange === undefined
        ? undefined
        : resolve(line.personalMessageChange);
    const entries: TranscriptEntry[] = [];
    if (text !== undefined)
      entries.push({ kind: 'message', from: 'contact', text, at });
    if (line.nudge) entries.push({ kind: 'nudge', from: 'contact', at });
    const before = progressOf(id);
    const wasOnline = isOnline(id);
    const status = line.statusChange;

    patchContact(id, (c) => ({
      ...c,
      transcript: [...c.transcript, ...entries],
      unread: c.unread + (text !== undefined && !isFocused(id) ? 1 : 0),
      status: status ?? c.status,
      everSignedIn:
        c.everSignedIn || (status !== undefined && status !== 'offline'),
      personalMessage: personalMessage ?? c.personalMessage,
      active: c.active && { ...c.active, lineIndex: c.active.lineIndex + 1 },
    }));

    if (text !== undefined)
      bus.emit('message', { contactId: id, from: 'contact', text });
    if (line.nudge) bus.emit('nudge', { contactId: id, from: 'contact' });
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
        if (!wasOnline) fireAll(id, 'onSignIn');
      }
    }
    if (personalMessage !== undefined) {
      bus.emit('personalMessageChange', { contactId: id, personalMessage });
    }
    playNext(id);
  };

  // --- sign-in -------------------------------------------------------------

  const contactSignIn = (id: ContactId) => {
    const content = contentOf(id);
    if (!content) return;
    const p = progressOf(id);
    const status =
      p.everSignedIn && p.status !== 'offline'
        ? p.status
        : content.contact.initialStatus;
    patchContact(id, (c) => ({ ...c, everSignedIn: true, status }));
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
    fireAll(id, 'onSignIn');
    pump(id);
  };

  return { running, fire, fireAll, choicesOf, playNext, contactSignIn };
}
