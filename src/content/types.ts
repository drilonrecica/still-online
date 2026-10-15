// Messenger content format: authored contacts + scripts, and the persisted progress shape.
// See docs/content-format.md for the semantics the engine (M2-02) implements.
import type { AppId } from '../os/types';

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export type ContactId = string;

export type ContactStatus = 'online' | 'away' | 'busy' | 'offline';

export type ContactGroup = 'Friends' | 'School' | 'Family';

/** Every handle uses the fictional domain. */
export type Handle = `${string}@livemail.example`;

export type Avatar =
  /** An original SVG (`import url from '@/assets/avatars/x.svg'`). */
  | { kind: 'svg'; src: string }
  /** A generated pattern: same seed + colors always draw the same picture. */
  | { kind: 'pattern'; seed: string; colors: readonly [string, string] };

export interface Contact {
  /** Stable, lowercase, used as a persistence key and as `props.contactId`. */
  id: ContactId;
  /** 2007-style decorations allowed, e.g. `~*Lena*~ <3`. */
  displayName: string;
  handle: Handle;
  avatar: Avatar;
  group: ContactGroup;
  /**
   * Status the contact signs in with. `'offline'` signs in "appearing offline": the contact stays
   * in the Offline group with no sign-in toast, but their triggers are armed.
   */
  initialStatus: ContactStatus;
  personalMessage: string;
  /** Delay after the player signs in to Messenger. 0 = already online when the list appears. */
  signInAfterMs: number;
  /**
   * Presence per world day (keys ≥ 2; day 1 is `initialStatus`/`personalMessage`). On the
   * contact's first sign-in of a new day, the highest entry with `key <= day` is applied once;
   * script changes later that day win. From day 6 on, the day-5 entry stays.
   */
  days?: Partial<Record<number, DayPresence>>;
  /**
   * Said once per world day when this contact messages the player while they are Away
   * (placeholders aren't resolved).
   */
  awayReply?: string;
}

export interface DayPresence {
  status?: ContactStatus;
  personalMessage?: string;
}

// ---------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------

export type ScriptId = string;
export type NodeId = string;

/**
 * Placeholders allowed in line text, choice text/labels and personal messages. `{artist}` and
 * `{title}` resolve only in `onNowPlaying` scripts.
 */
export const TEXT_PLACEHOLDERS = ['{name}', '{artist}', '{title}'] as const;

/** World unlock ids content may grant (`world.unlock`); the lint rejects others. */
export const CONTENT_UNLOCKS = ['ponies'] as const;

/** The full-window animations a contact or the player can send (P3-04). */
export const WINK_IDS = [
  'kiss',
  'hamster',
  'hearts',
  'pickle',
  'fireworks',
  'snowball',
] as const;

export type WinkId = (typeof WINK_IDS)[number];

export const isWinkId = (v: unknown): v is WinkId =>
  (WINK_IDS as readonly unknown[]).includes(v);

/**
 * One step by the contact. Applied in this order: text, nudge, wink, statusChange,
 * personalMessageChange, unlock.
 */
export interface ContactLine {
  /** Message text. Omit for a pure action (nudge / status / personal message). */
  text?: string;
  /** Pause before this line starts (before the typing indicator), in ms. */
  delayMs: number;
  nudge?: true;
  /** Sends a wink: it plays over the chat (opening it like a nudge, without the shake). */
  wink?: WinkId;
  statusChange?: ContactStatus;
  personalMessageChange?: string;
  /** World unlock id granted when the line is delivered (one of `CONTENT_UNLOCKS`). */
  unlock?: string;
}

export interface Choice {
  /** What the player sends. */
  text: string;
  /** Button caption when it should differ from `text` (keep it short). */
  label?: string;
  next: NodeId;
}

interface NodeBase {
  /** Contact lines, played in order. May be empty (e.g. an `end` right after a choice). */
  lines: readonly ContactLine[];
}

export type ScriptNode =
  | (NodeBase & {
      choices: readonly [Choice, Choice] | readonly [Choice, Choice, Choice];
    })
  | (NodeBase & { end: true });

export type Trigger =
  /** When the contact signs in. */
  | { type: 'onSignIn' }
  /** N minutes after the player signed in to Messenger (this page session). */
  | { type: 'afterMinutes'; minutes: number }
  /** When the Amplifier changes track; to one specific track if `trackId` is set. */
  | { type: 'onNowPlaying'; trackId?: string }
  /** When the player nudges this contact. */
  | { type: 'onPlayerNudge' }
  /**
   * N minutes after another script of the same contact ends (a follow-up conversation).
   * Re-armed from each Messenger sign-in when the target already ran, since end times
   * aren't persisted.
   */
  | { type: 'afterScript'; scriptId: ScriptId; minutes: number }
  /**
   * On Messenger sign-in once the world day is `day` or later (a missed day still fires).
   * Runs once ever; queued until the contact signs in, after their `onSignIn` scripts.
   */
  | { type: 'onDay'; day: number };

export type TriggerType = Trigger['type'];

export interface Script {
  /** Unique within its contact. */
  id: ScriptId;
  trigger: Trigger;
  start: NodeId;
  nodes: Readonly<Record<NodeId, ScriptNode>>;
  /**
   * Default false: the script runs at most once ever. When true it can run again after it ends;
   * an `onNowPlaying` script still runs at most once per trackId.
   */
  repeat?: boolean;
}

/** One contact module (`src/content/contacts/<id>.ts`) exports one of these. */
export interface ContactContent {
  contact: Contact;
  scripts: readonly Script[];
}

// ---------------------------------------------------------------------------
// Progress (persisted under `still-online:v1:messenger`)
// ---------------------------------------------------------------------------

export type PlayerStatus = 'online' | 'away' | 'busy' | 'offline';

/** Values for text placeholders captured when a script starts. */
export interface TriggerContext {
  trackId?: string;
  artist?: string;
  title?: string;
}

export interface ActiveScript {
  scriptId: ScriptId;
  nodeId: NodeId;
  /** Index of the next line of `nodeId` to deliver; `lines.length` = all delivered. */
  lineIndex: number;
  /** True once every line of a `choices` node is delivered. */
  awaitingChoice: boolean;
  context: TriggerContext;
}

/** A trigger that fired while another script of the same contact was active. */
export interface QueuedTrigger {
  scriptId: ScriptId;
  context: TriggerContext;
}

export interface ScriptProgress {
  /** Completed runs. A non-repeat script with `runs > 0` never starts again. */
  runs: number;
  /** Nodes entered at least once (any run). */
  visited: NodeId[];
  /** `onNowPlaying` only: tracks this script already ran for. */
  trackIds: string[];
}

export type TranscriptEntry =
  | {
      kind: 'message';
      from: 'contact' | 'player';
      text: string;
      at: number;
      /** A contact message that arrived while the player was Away. */
      whileAway?: true;
    }
  | { kind: 'nudge'; from: 'contact' | 'player'; at: number }
  | { kind: 'wink'; from: 'contact' | 'player'; wink: WinkId; at: number };

export interface ContactProgress {
  /** True after the contact's first sign-in; never reset. */
  everSignedIn: boolean;
  /** Current status and personal message, as changed by scripts. */
  status: ContactStatus;
  personalMessage: string;
  active: ActiveScript | null;
  queue: QueuedTrigger[];
  scripts: Record<ScriptId, ScriptProgress>;
  /** Delivered lines only (text already resolved), oldest first. `at` = epoch ms (real time). */
  transcript: TranscriptEntry[];
  /** Messages received while the chat window was closed or unfocused. */
  unread: number;
  /** The world day whose `Contact.days` presence was last applied (default 1). */
  presenceDay: number;
  /** The world day this contact last sent their `awayReply` (absent until then). */
  awayReplyDay?: number;
}

export interface PlayerProgress {
  status: PlayerStatus;
  personalMessage: string;
  /** "Show what I'm listening to" (M2-07). */
  showNowPlaying: boolean;
  /** The player's own message while a now-playing line replaces it; null when none is shown. */
  personalMessageBeforeNowPlaying: string | null;
  /** The message shown as "(Away: …)" while status is Away. */
  awayMessage: string;
  /** Away was set by idling, so activity puts the player back Online. */
  autoAway: boolean;
  /** Epoch ms the current Away began; null unless status is Away. */
  awaySince: number | null;
  /** The My Pictures file shown as the player's picture; null/absent = the default pattern. */
  displayPicture?: { fileId: string } | null;
}

export interface MessengerProgress {
  player: PlayerProgress;
  contacts: Record<ContactId, ContactProgress>;
}

// ---------------------------------------------------------------------------
// v0.2 single-module content (src/content/tunemole.ts, assistant.ts)
// Sites, profiles and mail have their own `types.ts` in their folders.
// ---------------------------------------------------------------------------

/** One TuneMole search result (P4-08). */
export interface TuneMoleResult {
  fileName: string;
  sizeKb: number;
  bitrate: number;
  /** Fictional peer nickname. */
  peer: string;
  /** track: a shipped playlist track · prank: a joke txt · stall: never finishes. */
  kind: 'track' | 'prank' | 'stall';
  /** Required for `track`. */
  trackId?: string;
  /** Extra search words besides the file name. */
  keywords?: readonly string[];
  /** prank: the Notepad text of the created file ("lol gotcha. - xXdj_kevXx"). */
  prankText?: string;
}

export type AssistantEvent = 'newDay' | 'idle' | 'firstBoot' | 'notepadLetter';

export type AssistantAction = 'dismiss' | 'never' | `openApp:${AppId}`;

/** One Stapley tip (P6-06). Shown once (`settings.seenTips`) unless `trigger.event` is `idle`. */
export interface AssistantTip {
  id: string;
  /** Matches when the app opens and/or the event fires; `minDay` gates by world day. */
  trigger: { app?: AppId; event?: AssistantEvent; minDay?: number };
  text: string;
  options?: readonly { label: string; action: AssistantAction }[];
}
