// Engine-facing types: the injected scheduler, the store port and the events the engine emits.
import type {
  Choice,
  ContactId,
  ContactStatus,
  MessengerProgress,
  ScriptId,
  WinkId,
} from '@/content/types';

export type TimerHandle = unknown;

/** Injected time source. Tests use Vitest fake timers or a manual implementation. */
export interface Scheduler {
  setTimeout: (fn: () => void, ms: number) => TimerHandle;
  clearTimeout: (handle: TimerHandle) => void;
  /** Epoch ms, used for transcript timestamps. */
  now: () => number;
}

/** Runtime presence. Not persisted: every Messenger sign-in starts with everyone offline. */
export interface MessengerRuntime {
  /** The player is signed in to Messenger. */
  signedIn: boolean;
  /** Contact is signed in (including "appearing offline"). */
  online: Record<ContactId, boolean>;
  /** Contact's typing indicator is showing. */
  typing: Record<ContactId, boolean>;
}

export interface MessengerData extends MessengerRuntime {
  progress: MessengerProgress;
}

/** The slice of a Zustand store the engine needs. `useMessengerStore` satisfies it. */
export interface EngineStore {
  getState: () => MessengerData;
  setState: (partial: Partial<MessengerData>) => void;
}

/** A choice with placeholders already resolved. */
export type ResolvedChoice = Pick<Choice, 'text' | 'next'> & { label: string };

export interface EngineEventMap {
  /** `toast` is false for contacts already online when the list appears and for "appear offline". */
  contactSignedIn: {
    contactId: ContactId;
    status: ContactStatus;
    toast: boolean;
  };
  contactSignedOut: { contactId: ContactId };
  typingStart: { contactId: ContactId };
  typingStop: { contactId: ContactId };
  message: { contactId: ContactId; from: 'contact' | 'player'; text: string };
  nudge: { contactId: ContactId; from: 'contact' | 'player' };
  wink: { contactId: ContactId; from: 'contact' | 'player'; wink: WinkId };
  statusChange: { contactId: ContactId; status: ContactStatus };
  personalMessageChange: { contactId: ContactId; personalMessage: string };
  /** The player can reply now (also re-emitted when a waiting script resumes). */
  choices: { contactId: ContactId; choices: ResolvedChoice[] };
  scriptStarted: { contactId: ContactId; scriptId: ScriptId };
  scriptEnded: { contactId: ContactId; scriptId: ScriptId };
  /** The player signed out of Messenger (all timers stopped). */
  signedOut: Record<string, never>;
}

export interface NowPlayingTrack {
  trackId: string;
  artist: string;
  title: string;
}
