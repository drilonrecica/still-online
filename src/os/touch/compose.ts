// Merges event-handler props: handlers under the same name all run, in argument order.
type Props = object;

export function composeHandlers<A extends Props, B extends Props>(
  a: A,
  b: B,
): A & B;
export function composeHandlers<
  A extends Props,
  B extends Props,
  C extends Props,
>(a: A, b: B, c: C): A & B & C;
export function composeHandlers(...parts: Props[]): Props {
  const out: Record<string, unknown> = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      const prev = out[key];
      out[key] =
        typeof prev === 'function' && typeof value === 'function'
          ? (...args: unknown[]) => {
              prev(...args);
              value(...args);
            }
          : value;
    }
  }
  return out;
}
