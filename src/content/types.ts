// Messenger content format: authored contacts + scripts, and the persisted progress shape.
// See docs/content-format.md for the semantics the engine (M2-02) implements.
import type { AppId, GameId, Gender } from '../os/types';
import type { FsNode, PhotoSpec } from '../os/fs/types';
import type { MailAddress, MailAttachment, MailFolder } from './mail/types';

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export type ContactId = string;

export type ContactStatus = 'online' | 'away' | 'busy' | 'offline';

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
  /** Language-neutral id; the list renders `messenger.groups.<id>`. */
  group: ContactGroupId;
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
   * script changes later that day win. From day 11 on, the day-10 entry stays.
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
 * `{title}` resolve only in `onNowPlaying` scripts, `{score}` and `{game}` only in `onGameScore`.
 */
export const TEXT_PLACEHOLDERS = [
  '{name}',
  '{artist}',
  '{title}',
  '{score}',
  '{game}',
] as const;

/** Which placeholders need which trigger; any other placeholder resolves everywhere. */
export const TRIGGER_PLACEHOLDERS: Readonly<
  Record<string, Script['trigger']['type']>
> = {
  '{artist}': 'onNowPlaying',
  '{title}': 'onNowPlaying',
  '{score}': 'onGameScore',
  '{game}': 'onGameScore',
};

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
  | { type: 'onDay'; day: number }
  /**
   * When the player finishes a game (`game:score`) with `score >= minScore` (raw score: Mines
   * reports seconds). Ignored while signed out of Messenger.
   */
  | { type: 'onGameScore'; game: GameId; minScore?: number }
  /**
   * The player dropped this contact from their Friendspace Top 8: armed on the contact's sign-in
   * on a later day than the drop ("noticed overnight"). Runs once per drop, not `repeat`.
   */
  | { type: 'onTop8Dropped' }
  /**
   * The player put this contact back after their `onTop8Dropped` script ran: on the next
   * sign-in, or at once if they are online. Runs once per re-add, not `repeat`.
   */
  | { type: 'onTop8Readded' };

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
  /**
   * Only for this gender (G2-03): the trigger arms only while the player's gender matches. The
   * script has one side, so its text uses no `g()`. Unset: everyone.
   */
  forGender?: Gender;
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
  /** `onGameScore`: the game that reported the score, and the score. */
  game?: GameId;
  score?: number;
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
  /**
   * The world day this script last started (F-04; absent in older saves). An `afterScript`
   * follow-up of it expires once a later `onDay` script of the contact has started.
   */
  day?: number;
}

/**
 * A transcript entry as views show it: `message` holds text. Persisted transcripts hold
 * `NeutralTranscriptEntry` instead; there `message` only survives from v0.2 saves.
 */
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
  /** Current status and where the personal message comes from, as changed by scripts. */
  status: ContactStatus;
  personalMessage: PersonalMessageRef;
  active: ActiveScript | null;
  queue: QueuedTrigger[];
  scripts: Record<ScriptId, ScriptProgress>;
  /**
   * Delivered entries as references (rendered at view time by `renderEntry`), oldest first.
   * v0.2 `message` entries hold rendered text and stay verbatim. `at` = epoch ms (real time).
   */
  transcript: NeutralTranscriptEntry[];
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
  /** The message shown as "(Away: …)" while status is Away; null = the localized default. */
  awayMessage: string | null;
  /** Away was set by idling, so activity puts the player back Online. */
  autoAway: boolean;
  /** Epoch ms the current Away began; null unless status is Away. */
  awaySince: number | null;
  /** The My Pictures file shown as the player's picture; null/absent = the default pattern. */
  displayPicture?: { fileId: string } | null;
  /** Emoticons made from My Pictures files (P3-05); absent = none. */
  customEmoticons?: CustomEmoticon[];
}

/** A player-made emoticon: `code` is e.g. `[ponies]`, `fileId` a My Pictures image. */
export interface CustomEmoticon {
  code: string;
  fileId: string;
}

/**
 * Top 8 drama bookkeeping for one contact (P0-03): `dropped` = waiting to react, `reacted` = their
 * `onTop8Dropped` script ran (a re-add now fires `onTop8Readded`). `day` = the day of the drop.
 */
export interface Top8Record {
  state: 'dropped' | 'reacted';
  day: number;
}

export interface MessengerProgress {
  player: PlayerProgress;
  contacts: Record<ContactId, ContactProgress>;
  /** Contacts dropped from the player's Friendspace Top 8; absent = none. */
  top8?: Record<ContactId, Top8Record>;
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

// ---------------------------------------------------------------------------
// v0.3 i18n: per-locale overlays and language-neutral persisted shapes (docs/i18n.md).
// New types only; P0-04/P0-05/P0-06 move the stores and the engine onto them.
// ---------------------------------------------------------------------------

/** Language-neutral contact group ids; labels come from the catalog. */
export const CONTACT_GROUP_IDS = ['friends', 'school', 'family'] as const;

export type ContactGroupId = (typeof CONTACT_GROUP_IDS)[number];

/** Contact list sections: the three groups plus Offline. */
export type ContactListGroupId = ContactGroupId | 'offline';

/**
 * The translated text of one script node. `lines` has exactly one entry per English line, in
 * order (`''` for a line without `text`); `choices` exactly one per English choice.
 */
export interface NodeOverlay {
  lines: readonly string[];
  choices?: readonly { text: string; label?: string }[];
  /** `personalMessageChange` text, keyed by the index of the English line that carries it. */
  personalMessages?: Readonly<Partial<Record<number, string>>>;
}

/**
 * A contact's text in another locale (`src/content/de/contacts/<id>.ts`). Only text: delays,
 * triggers, actions and the node graph always come from the English module. Anything missing
 * falls back to English (`getContacts(locale)` merges).
 */
export interface ContactOverlay {
  /** Only when the English name contains English words. */
  displayName?: string;
  personalMessage?: string;
  awayReply?: string;
  /** Per-day presence messages, same day keys as `Contact.days`. */
  days?: Readonly<Partial<Record<number, { personalMessage?: string }>>>;
  scripts: Readonly<
    Record<ScriptId, Readonly<Partial<Record<NodeId, NodeOverlay>>>>
  >;
}

/**
 * Raw placeholder values stored with a transcript reference, formatted at render: `{game}` via
 * the catalog, `{score}` via `formatNumber`, `{artist}`/`{title}` from the playlist track.
 * `{name}` is always the player's current name.
 */
export interface LineParams {
  game?: GameId;
  score?: number;
  trackId?: string;
}

/** A transcript entry that stores where its text comes from instead of the text. */
export type TranscriptRefEntry =
  /** A contact's script line. */
  | {
      kind: 'line';
      from: 'contact';
      scriptId: ScriptId;
      nodeId: NodeId;
      lineIndex: number;
      params?: LineParams;
      at: number;
      whileAway?: true;
    }
  /** The reply the player picked; `flavor` = emoticon codes the player added (kept as typed). */
  | {
      kind: 'choice';
      from: 'player';
      scriptId: ScriptId;
      nodeId: NodeId;
      choiceIndex: number;
      params?: LineParams;
      flavor?: string;
      at: number;
    }
  /** The contact's `awayReply`. */
  | { kind: 'awayReply'; from: 'contact'; at: number; whileAway?: true }
  /** Free text the player typed: stored verbatim. */
  | { kind: 'typed'; from: 'player'; text: string; at: number };

/**
 * A transcript entry after P0-05: references, nudges/winks, and v0.2 `message` entries, which
 * are kept and rendered verbatim.
 */
export type NeutralTranscriptEntry = TranscriptRefEntry | TranscriptEntry;

/** Where a contact's current personal message comes from; rendered in the current locale. */
export type PersonalMessageRef =
  /** `Contact.personalMessage`. */
  | 'initial'
  /** `Contact.days[day].personalMessage`. */
  | { kind: 'day'; day: number }
  /** A script line's `personalMessageChange`. */
  | {
      kind: 'line';
      scriptId: ScriptId;
      nodeId: NodeId;
      lineIndex: number;
      params?: LineParams;
    }
  /** A v0.2 save's already-rendered message: shown verbatim. */
  | { kind: 'literal'; text: string };

interface MailRecordBase {
  /** Content id for `content`; `m:<random>` otherwise. */
  id: string;
  folder: MailFolder;
  read: boolean;
  /** Epoch ms (real time). */
  receivedAt: number;
}

/**
 * A mail as the `mail` store persists it. Only `text` records hold prose; the others render from
 * content or the catalog in the current locale. The player's address is derived at render.
 */
export type MailRecord =
  /** Authored mail: `getMailContent(locale)` by `id`. */
  | (MailRecordBase & { kind: 'content' })
  /** "Undeliverable" for an address that isn't a friend; params are what the player typed. */
  | (MailRecordBase & {
      kind: 'bounce';
      params: { to: string; subject: string };
    })
  /** A friend's canned reply; `again` = the reply to every later mail ("RE: <subject>"). */
  | (MailRecordBase & {
      kind: 'autoReply';
      contactId: ContactId;
      again: boolean;
      params: { subject: string };
    })
  /** Player-written mail, and v0.2 mail no migration rule recognizes: stored verbatim. */
  | (MailRecordBase & {
      kind: 'text';
      from: MailAddress;
      to: MailAddress[];
      subject: string;
      body: string;
      attachments: MailAttachment[];
    });

/**
 * A `seed:` fs node as persisted. Untouched seeds carry no text: `name`, `text` and the photo
 * `caption` come from `getSeedFiles(locale)`. Renaming or editing sets `dirty` and freezes the
 * then-rendered text into the node, which from then on is the player's.
 */
export type SeedNodeRecord =
  | (Omit<FsNode, 'name' | 'text' | 'photo'> & {
      dirty?: false;
      photo?: Omit<PhotoSpec, 'caption'>;
    })
  | (FsNode & { dirty: true });

/** A system folder as persisted: no name; it renders from the catalog by id. */
export type SystemFolderRecord = Omit<FsNode, 'name'> & { system: true };

/** A Web Explorer favorite as persisted: no `title` = a default favorite named by the site. */
export interface FavoriteRecord {
  url: string;
  /** Player-added favorites keep the title they were added with. */
  title?: string;
}
