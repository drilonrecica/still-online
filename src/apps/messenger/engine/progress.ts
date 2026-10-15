// Default progress values and a sanitizer for persisted (untrusted) progress.
import { isRecord } from '@/os/persist';
import { isGameId } from '@/os/types';
import {
  isWinkId,
  type ActiveScript,
  type Contact,
  type ContactProgress,
  type ContactStatus,
  type MessengerProgress,
  type PlayerProgress,
  type QueuedTrigger,
  type Script,
  type ScriptProgress,
  type TranscriptEntry,
  type TriggerContext,
} from '@/content/types';
import { sanitizeCustomEmoticons } from '../customEmoticons';

const STATUSES: readonly ContactStatus[] = [
  'online',
  'away',
  'busy',
  'offline',
];

export const defaultPlayerProgress = (): PlayerProgress => ({
  status: 'online',
  personalMessage: '',
  showNowPlaying: false,
  personalMessageBeforeNowPlaying: null,
  awayMessage: '',
  autoAway: false,
  awaySince: null,
});

export const defaultProgress = (): MessengerProgress => ({
  player: defaultPlayerProgress(),
  contacts: {},
});

export const defaultContactProgress = (contact: Contact): ContactProgress => ({
  everSignedIn: false,
  status: contact.initialStatus,
  personalMessage: contact.personalMessage,
  active: null,
  queue: [],
  scripts: {},
  transcript: [],
  unread: 0,
  presenceDay: 1,
});

export const defaultScriptProgress = (): ScriptProgress => ({
  runs: 0,
  visited: [],
  trackIds: [],
});

const isStatus = (v: unknown): v is ContactStatus =>
  typeof v === 'string' && (STATUSES as readonly string[]).includes(v);
const isCount = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isSender = (v: unknown): v is 'contact' | 'player' =>
  v === 'contact' || v === 'player';
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

function context(v: unknown): TriggerContext {
  if (!isRecord(v)) return {};
  const out: TriggerContext = {};
  if (typeof v.trackId === 'string') out.trackId = v.trackId;
  if (typeof v.artist === 'string') out.artist = v.artist;
  if (typeof v.title === 'string') out.title = v.title;
  if (isGameId(v.game)) out.game = v.game;
  if (typeof v.score === 'number' && Number.isFinite(v.score))
    out.score = v.score;
  return out;
}

function active(v: unknown): ActiveScript | null {
  if (
    !isRecord(v) ||
    typeof v.scriptId !== 'string' ||
    typeof v.nodeId !== 'string' ||
    !isCount(v.lineIndex) ||
    typeof v.awaitingChoice !== 'boolean'
  ) {
    return null;
  }
  return {
    scriptId: v.scriptId,
    nodeId: v.nodeId,
    lineIndex: v.lineIndex,
    awaitingChoice: v.awaitingChoice,
    context: context(v.context),
  };
}

function queued(v: unknown): QueuedTrigger[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((q: unknown) =>
    isRecord(q) && typeof q.scriptId === 'string'
      ? [{ scriptId: q.scriptId, context: context(q.context) }]
      : [],
  );
}

function scripts(v: unknown): Record<string, ScriptProgress> {
  if (!isRecord(v)) return {};
  const out: Record<string, ScriptProgress> = {};
  for (const [id, s] of Object.entries(v)) {
    if (!isRecord(s) || !isCount(s.runs)) continue;
    out[id] = {
      runs: s.runs,
      visited: strings(s.visited),
      trackIds: strings(s.trackIds),
    };
  }
  return out;
}

function transcript(v: unknown): TranscriptEntry[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((e: unknown): TranscriptEntry[] => {
    if (!isRecord(e) || !isSender(e.from) || typeof e.at !== 'number')
      return [];
    if (e.kind === 'nudge') return [{ kind: 'nudge', from: e.from, at: e.at }];
    if (e.kind === 'wink')
      return isWinkId(e.wink)
        ? [{ kind: 'wink', from: e.from, wink: e.wink, at: e.at }]
        : [];
    if (e.kind === 'message' && typeof e.text === 'string') {
      return [
        e.whileAway === true && e.from === 'contact'
          ? {
              kind: 'message',
              from: e.from,
              text: e.text,
              at: e.at,
              whileAway: true,
            }
          : { kind: 'message', from: e.from, text: e.text, at: e.at },
      ];
    }
    return [];
  });
}

function contactProgress(v: unknown): ContactProgress | null {
  if (
    !isRecord(v) ||
    typeof v.everSignedIn !== 'boolean' ||
    !isStatus(v.status) ||
    typeof v.personalMessage !== 'string'
  ) {
    return null;
  }
  return {
    everSignedIn: v.everSignedIn,
    status: v.status,
    personalMessage: v.personalMessage,
    active: active(v.active),
    queue: queued(v.queue),
    scripts: scripts(v.scripts),
    transcript: transcript(v.transcript),
    unread: isCount(v.unread) ? v.unread : 0,
    presenceDay:
      isCount(v.presenceDay) && v.presenceDay >= 1 ? v.presenceDay : 1,
    ...(isCount(v.awayReplyDay) ? { awayReplyDay: v.awayReplyDay } : {}),
  };
}

/**
 * Builds progress from any persisted value. Invalid parts fall back to defaults. A contact with
 * unusable core fields is dropped, and the engine recreates it from content.
 */
export function sanitizeProgress(v: unknown): MessengerProgress {
  const fallback = defaultProgress();
  if (!isRecord(v)) return fallback;
  const p = isRecord(v.player) ? v.player : {};
  const player: PlayerProgress = {
    status: isStatus(p.status) ? p.status : fallback.player.status,
    personalMessage:
      typeof p.personalMessage === 'string' ? p.personalMessage : '',
    showNowPlaying:
      typeof p.showNowPlaying === 'boolean' ? p.showNowPlaying : false,
    personalMessageBeforeNowPlaying:
      typeof p.personalMessageBeforeNowPlaying === 'string'
        ? p.personalMessageBeforeNowPlaying
        : null,
    awayMessage: typeof p.awayMessage === 'string' ? p.awayMessage : '',
    autoAway: p.autoAway === true,
    awaySince: typeof p.awaySince === 'number' ? p.awaySince : null,
  };
  if (isRecord(p.displayPicture) && typeof p.displayPicture.fileId === 'string')
    player.displayPicture = { fileId: p.displayPicture.fileId };
  const customEmoticons = sanitizeCustomEmoticons(p.customEmoticons);
  if (customEmoticons.length > 0) player.customEmoticons = customEmoticons;
  if (player.status !== 'away') {
    player.autoAway = false;
    player.awaySince = null;
  }
  const contacts: Record<string, ContactProgress> = {};
  if (isRecord(v.contacts)) {
    for (const [id, c] of Object.entries(v.contacts)) {
      const sane = contactProgress(c);
      if (sane) contacts[id] = sane;
    }
  }
  return { player, contacts };
}

/**
 * Drops progress that no longer matches the content (e.g. a script or node was renamed) and
 * repairs an inconsistent `awaitingChoice`.
 */
export function reconcileContact(
  c: ContactProgress,
  scripts: readonly Script[],
): ContactProgress {
  const queue = c.queue.filter((q) => scripts.some((s) => s.id === q.scriptId));
  const a = c.active;
  const node = a && scripts.find((s) => s.id === a.scriptId)?.nodes[a.nodeId];
  if (!a || !node || a.lineIndex > node.lines.length) {
    return { ...c, queue, active: null };
  }
  const waiting = 'choices' in node && a.awaitingChoice;
  const lineIndex = waiting ? node.lines.length : a.lineIndex;
  return { ...c, queue, active: { ...a, awaitingChoice: waiting, lineIndex } };
}
