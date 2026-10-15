import type { TriggerContext } from '@/content/types';
import type { GameId } from '@/os/types';

export const TYPING_MS_PER_CHAR = 40;
export const TYPING_MAX_MS = 2500;

/** How long the typing indicator shows before a line: `min(len × 40ms, 2500ms)`. */
export function typingMs(text: string): number {
  return Math.min(text.length * TYPING_MS_PER_CHAR, TYPING_MAX_MS);
}

/** How friends name the games in `{game}`. */
export const GAME_NAMES: Readonly<Record<GameId, string>> = {
  mines: 'Mines',
  henhunt: 'Hen Hunt',
  pinball: 'Star Pinball',
};

/**
 * Resolves `{name}`, `{artist}`, `{title}`, `{score}` and `{game}`. A placeholder without a value
 * (e.g. `{artist}` outside an `onNowPlaying` script) is left as written so authoring mistakes
 * stay visible.
 */
export function resolveText(
  text: string,
  playerName: string,
  context: TriggerContext,
): string {
  const values: Record<string, string | undefined> = {
    name: playerName,
    artist: context.artist,
    title: context.title,
    score: context.score?.toLocaleString('en-US'),
    game: context.game && GAME_NAMES[context.game],
  };
  return text.replace(
    /\{(name|artist|title|score|game)\}/g,
    (match, key: string) => values[key] ?? match,
  );
}
