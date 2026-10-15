// Original SVG art for Mines: 7-segment digits, smiley faces, mine and flag.

export type FaceKind = 'smile' | 'worried' | 'cool' | 'dead';

/** Segments a–g (top, top-right, bottom-right, bottom, bottom-left, top-left, middle) per digit. */
const SEGMENTS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abdeg',
  '3': 'abcdg',
  '4': 'bcfg',
  '5': 'acdfg',
  '6': 'acdefg',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
  ' ': '',
};

const SEGMENT_SHAPES: Record<string, string> = {
  a: 'M2 1h7l-1 1.5H3z',
  b: 'M10 2l-1 1v4.5l1 .5 1-1V3z',
  c: 'M10 9l-1 .5V14l1 1 1-1V10z',
  d: 'M2 16h7l-1-1.5H3z',
  e: 'M1 9l1 .5V14l-1 1-1-1V10z',
  f: 'M1 2l1 1v4.5L1 8 0 7V3z',
  g: 'M2 8.5l1-.75h5l1 .75-1 .75H3z',
};

export function lcdText(value: number): string {
  const v = Math.max(-99, Math.min(999, Math.trunc(value)));
  return v < 0 ? `-${String(-v).padStart(2, '0')}` : String(v).padStart(3, '0');
}

export function Lcd({ value, label }: { value: number; label: string }) {
  const text = lcdText(value);
  return (
    <svg
      role="img"
      aria-label={`${label}: ${Number(text)}`}
      width={41}
      height={25}
      viewBox="0 0 41 25"
    >
      <rect width="41" height="25" fill="#000" />
      {[...text].map((ch, i) => (
        <g key={i} transform={`translate(${1 + i * 13} 4)`}>
          {Object.keys(SEGMENT_SHAPES).map((s) => (
            <path
              key={s}
              d={SEGMENT_SHAPES[s]}
              fill={SEGMENTS[ch]!.includes(s) ? '#f00' : '#300'}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Face({ kind }: { kind: FaceKind }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="8.5" fill="#ffd800" stroke="#000" />
      {kind === 'cool' ? (
        <>
          <path d="M3.5 7h13v2.2h-4.5L11 7.6 9 7.6 8 9.2H3.5z" fill="#000" />
          <path d="M6 13q4 3 8 0" fill="none" stroke="#000" strokeWidth="1.2" />
        </>
      ) : kind === 'dead' ? (
        <>
          <path
            d="M5.5 6.5l3 3M8.5 6.5l-3 3M11.5 6.5l3 3M14.5 6.5l-3 3"
            stroke="#000"
            strokeWidth="1.2"
          />
          <path d="M6 14q4-3 8 0" fill="none" stroke="#000" strokeWidth="1.2" />
        </>
      ) : (
        <>
          <circle cx="7" cy="8" r="1.3" fill="#000" />
          <circle cx="13" cy="8" r="1.3" fill="#000" />
          {kind === 'worried' ? (
            <ellipse cx="10" cy="14" rx="2" ry="2.4" fill="#000" />
          ) : (
            <path
              d="M5.5 12q4.5 4.5 9 0"
              fill="none"
              stroke="#000"
              strokeWidth="1.2"
            />
          )}
        </>
      )}
    </svg>
  );
}

export function MineIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
      <path
        d="M6 .5v11M.5 6h11M2 2l8 8M10 2l-8 8"
        stroke="#000"
        strokeWidth="1.2"
      />
      <circle cx="6" cy="6" r="3.6" fill="#000" />
      <circle cx="4.9" cy="4.9" r="1" fill="#fff" />
    </svg>
  );
}

export function FlagIcon({ wrong = false }: { wrong?: boolean }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
      <path d="M6.5 1.5 2.5 3.5l4 2z" fill="#f00" />
      <path d="M6.5 1v7.5" stroke="#000" />
      <path d="M3 10.5h7v1H3zM4.5 8.5h4v2h-4z" fill="#000" />
      {wrong && (
        <path d="M1 1l10 10M11 1 1 11" stroke="#f00" strokeWidth="1.4" />
      )}
    </svg>
  );
}
