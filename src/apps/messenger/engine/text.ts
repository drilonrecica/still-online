export const TYPING_MS_PER_CHAR = 40;
export const TYPING_MAX_MS = 2500;

/** How long the typing indicator shows before a line: `min(len × 40ms, 2500ms)`. */
export function typingMs(text: string): number {
  return Math.min(text.length * TYPING_MS_PER_CHAR, TYPING_MAX_MS);
}
