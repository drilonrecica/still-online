// Contracts of the v0.2 OS services. Each module implements its interface in the file named in
// the comment; docs/architecture-v0.2.md describes the behaviour.
import type { GameId } from '@/os/types';

// ---------------------------------------------------------------------------
// World / days — src/os/world.ts (P0-06), persisted as `world`
// ---------------------------------------------------------------------------

export interface WorldState {
  /** Starts at 1; +1 at most once per boot. */
  day: number;
  /** Local `YYYY-MM-DD` of the real date at the last boot; '' before the first boot. */
  lastRealDate: string;
  /** Set by `markShutdown()`; the next boot advances the day. */
  shutdownPending: boolean;
  /** Unlock ids in the order they were earned (`ponies`, `konami`, …). */
  unlocks: string[];
  /** Epoch ms when the current day started. */
  dayStartedAt: number;
}

export interface WorldStore extends WorldState {
  /** Once per boot (session enters `booting`). Emits `world:dayChanged` when the day advances. */
  onBoot: (realNow?: Date) => void;
  /** When the session reaches `off`. */
  markShutdown: () => void;
  /** Adds the id once and emits `world:unlock`. */
  unlock: (id: string) => void;
  hasUnlock: (id: string) => boolean;
}
// Also exported from world.ts: `useWorldStore`, `currentDay(): number`.

// ---------------------------------------------------------------------------
// Network — src/os/network.ts (P0-07), not persisted
// ---------------------------------------------------------------------------

export type NetStatus = 'offline' | 'dialing' | 'online';

export type NetPhase =
  'idle' | 'dialing' | 'verifying' | 'registering' | 'connected';

/** Phase durations before `scaleMs`. */
export const NET_PHASE_MS = {
  dialing: 3000,
  verifying: 1500,
  registering: 1200,
} as const;

export const MODEM_KBPS = 56.0;

export interface NetworkStore {
  status: NetStatus;
  /** 0 while offline. */
  kbps: number;
  phase: NetPhase;
  /** Epoch ms of the last successful connect (tray "Status" duration); null offline. */
  connectedAt: number | null;
  /** offline → dialing → online; emits `network:connected`. No-op unless offline. */
  connect: () => void;
  /** Aborts dialing; emits `network:disconnected`. */
  cancel: () => void;
  /** online → offline; emits `network:disconnected`. */
  disconnect: () => void;
}
// Also exported from network.ts:
//   requireOnline(): Promise<boolean>  — true once online, false if the attempt is cancelled.

// ---------------------------------------------------------------------------
// Idle — src/os/idle.ts (P0-08)
// ---------------------------------------------------------------------------

/** Runs `cb` once after `minutes` of no input, re-arming after activity. Returns unsubscribe. */
export type OnIdle = (minutes: number, cb: () => void) => () => void;
// Also exported from idle.ts:
//   onIdle: OnIdle
//   installIdle(): () => void  — once from App.tsx; adds the passive window listeners.

// ---------------------------------------------------------------------------
// Balloon tips — src/os/balloon/ (P1-04), not persisted (seen ids live in settings.seenTips)
// ---------------------------------------------------------------------------

export type BalloonIcon =
  'info' | 'warning' | 'network' | 'shield' | 'sheep' | 'stapley';

export interface BalloonInput {
  /** Show-once id; skipped if already in `settings.seenTips`. Omit for repeatable balloons. */
  id?: string;
  title: string;
  text: string;
  icon?: BalloonIcon;
  /** Clicking the body runs this, then dismisses. */
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// Games — src/os/games.ts (P6-01), persisted as `games`
// ---------------------------------------------------------------------------

export type MinesLevel = 'beginner' | 'intermediate' | 'expert';

export interface HighScore {
  name: string;
  score: number;
  /** Epoch ms (real time); shown through `toGameDate`. */
  date: number;
}

export interface GamesState {
  mines: { best: Record<MinesLevel, { seconds: number; name: string } | null> };
  /** Top 10, best first. */
  henhunt: { high: HighScore[] };
  pinball: { high: HighScore[] };
}

export type ScoreEntry =
  | { game: 'mines'; level: MinesLevel; seconds: number; name: string }
  | {
      game: Exclude<GameId, 'mines'>;
      name: string;
      score: number;
      date: number;
    };
