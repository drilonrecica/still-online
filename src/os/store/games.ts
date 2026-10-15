// Games store: best times and high scores. Persisted under `still-online:v1:games`.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';

export const MINES_LEVELS = ['beginner', 'intermediate', 'expert'] as const;
export type MinesLevel = (typeof MINES_LEVELS)[number];

export const MAX_SCORE_NAME = 20;
export const MAX_HIGH_SCORES = 10;
/** The largest time a Mines counter can show. */
export const MAX_MINES_SECONDS = 999;

export interface MinesBest {
  seconds: number;
  name: string;
}

export interface HighScore {
  name: string;
  score: number;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
}

export interface GamesData {
  mines: { best: Record<MinesLevel, MinesBest | null> };
  henhunt: { high: HighScore[] };
  pinball: { high: HighScore[] };
}

/** What a finished game hands to `recordScore`. Mines: `score` = seconds, `level` is required. */
export interface ScoreEntry {
  name: string;
  score: number;
  date?: string;
  level?: MinesLevel;
}

export interface GamesStore extends GamesData {
  /** Returns true when the entry made a table (a Mines best, or a top-10 place). */
  recordScore: (game: keyof GamesData, entry: ScoreEntry) => boolean;
  /** Clears one game's table; Mines clears all three levels. */
  resetScores: (game: keyof GamesData) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function sanitizeName(v: unknown, fallback = 'Anonymous'): string {
  const name = typeof v === 'string' ? v.trim().slice(0, MAX_SCORE_NAME) : '';
  return name || fallback;
}

const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

function sanitizeMinesBest(v: unknown): MinesBest | null {
  if (!isRecord(v) || !finite(v.seconds)) return null;
  const seconds = Math.round(v.seconds);
  if (seconds < 1 || seconds > MAX_MINES_SECONDS) return null;
  return { seconds, name: sanitizeName(v.name) };
}

function sanitizeHighScore(v: unknown): HighScore | null {
  if (!isRecord(v) || !finite(v.score) || v.score < 0) return null;
  const date =
    typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date)
      ? v.date
      : today();
  return { name: sanitizeName(v.name), score: Math.round(v.score), date };
}

/** Valid entries only, best first, at most ten. */
export function sanitizeHighScores(v: unknown): HighScore[] {
  if (!Array.isArray(v)) return [];
  return v
    .map(sanitizeHighScore)
    .filter((e): e is HighScore => e !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGH_SCORES);
}

export function sanitizeGames(persisted: unknown): GamesData {
  const p = isRecord(persisted) ? persisted : {};
  const mines = isRecord(p.mines) ? p.mines : {};
  const best = isRecord(mines.best) ? mines.best : {};
  const henhunt = isRecord(p.henhunt) ? p.henhunt : {};
  const pinball = isRecord(p.pinball) ? p.pinball : {};
  return {
    mines: {
      best: {
        beginner: sanitizeMinesBest(best.beginner),
        intermediate: sanitizeMinesBest(best.intermediate),
        expert: sanitizeMinesBest(best.expert),
      },
    },
    henhunt: { high: sanitizeHighScores(henhunt.high) },
    pinball: { high: sanitizeHighScores(pinball.high) },
  };
}

const initial = (): GamesData => sanitizeGames({});

export const useGamesStore = create<GamesStore>()(
  persist(
    (set, get) => ({
      ...initial(),
      recordScore(game, entry) {
        if (!finite(entry.score)) return false;
        const name = sanitizeName(entry.name);
        if (game === 'mines') {
          const level = MINES_LEVELS.find((l) => l === entry.level);
          const seconds = Math.round(entry.score);
          if (!level || seconds < 1 || seconds > MAX_MINES_SECONDS) {
            return false;
          }
          const current = get().mines.best[level];
          if (current && current.seconds <= seconds) return false;
          set((s) => ({
            mines: {
              best: { ...s.mines.best, [level]: { seconds, name } },
            },
          }));
          return true;
        }
        const high = sanitizeHighScores([
          ...get()[game].high,
          { name, score: entry.score, date: entry.date },
        ]);
        const made = high.some(
          (h) => h.name === name && h.score === Math.round(entry.score),
        );
        if (made) set({ [game]: { high } } as Partial<GamesData>);
        return made;
      },
      resetScores(game) {
        set({ [game]: initial()[game] } as Partial<GamesData>);
      },
    }),
    persistOptions<GamesStore, GamesData>({
      name: 'games',
      partialize: ({ mines, henhunt, pinball }) => ({
        mines,
        henhunt,
        pinball,
      }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeGames(persisted),
      }),
    }),
  ),
);
