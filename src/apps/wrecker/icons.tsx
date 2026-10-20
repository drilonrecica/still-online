// Tool palette icons: original 24×24 cartoon SVGs.
import type { ReactElement } from 'react';
import type { ToolId } from './engine';

export type PaletteIconId = ToolId | 'repair' | 'exit';

const S = {
  stroke: '#1b1b1b',
  strokeWidth: 1.2,
  strokeLinejoin: 'round' as const,
};

const ICONS: Record<PaletteIconId, ReactElement> = {
  hammer: (
    <g {...S}>
      <path d="M9.5 11.5l11 8.5-2 2.5-11-8.5z" fill="#b0733a" />
      <path d="M16.5 17l4 3-2 2.5-4-3z" fill="#22262b" />
      <path
        d="M3 9.5l6-7 2.5 2-1.5 2 3 2.5-2 2.5-3-2.5-2 2.5c-1-.5-2.5-1.3-3-2z"
        fill="#9aa3ac"
      />
      <path d="M5 8l4.5-5" stroke="#eef2f5" strokeWidth="1" />
    </g>
  ),
  chainsaw: (
    <g {...S}>
      <path d="M3 9.5h10v5H3a2.5 2.5 0 0 1 0-5z" fill="#b5bdc5" />
      <path
        d="M2 8.6h11M2 15.4h11"
        stroke="#26292d"
        strokeWidth="1.6"
        strokeDasharray="1.6 1.2"
      />
      <rect x="12" y="6.5" width="9" height="11" rx="2.5" fill="#f07d14" />
      <rect x="15" y="9" width="4.5" height="5" rx="1" fill="#1d2024" />
      <path d="M13 6.5c1-3 6-3.5 7-1" fill="none" strokeWidth="1.8" />
      <path d="M13.5 8h3" stroke="#ffd9a8" strokeWidth="1" />
    </g>
  ),
  flamethrower: (
    <g {...S}>
      <path
        d="M1.5 6c1.5-3.5 5-3.5 4.5-.5 1.5-1.5 3.5.5 2 2.5-1.8 2.2-5.3 1.8-6.5-2z"
        fill="#ffb02e"
      />
      <path d="M3.5 6.3c.6-1.2 2-1.3 2.2-.2" fill="#fff4c2" stroke="none" />
      <rect x="7" y="8.2" width="9" height="3.6" rx="1" fill="#9aa3ac" />
      <rect x="9.5" y="7.4" width="4.5" height="5.2" rx="1" fill="#2f343a" />
      <rect x="15" y="10" width="7" height="12" rx="3.5" fill="#c4231b" />
      <path d="M16.6 12v8" stroke="#ff8a7c" strokeWidth="1" />
    </g>
  ),
  machinegun: (
    <g {...S}>
      <path d="M1.5 9.5h8v3.5h-8z" fill="#2f343a" />
      <path d="M2.5 11.2h1M4.6 11.2h1M6.7 11.2h1" stroke="#000" />
      <rect x="9" y="8" width="10" height="6" rx="1" fill="#3a3f45" />
      <path d="M19 9l3.5-1v6.5l-3.5-1z" fill="#3a2716" />
      <path
        d="M11 14c0 3 1 5 2.5 6.5l2.5-1c-1.5-1.5-2-3.5-2-5.5z"
        fill="#2a2e33"
      />
      <path d="M16 14l1 4h2.5l-1-4z" fill="#1d2024" />
      <path d="M10 9.4h8" stroke="#8a929b" strokeWidth="0.8" />
    </g>
  ),
  stamp: (
    <g {...S}>
      <circle cx="12" cy="5" r="3.6" fill="#d1322a" />
      <circle cx="10.8" cy="3.8" r="1" fill="#ffd0c8" stroke="none" />
      <rect x="10.5" y="8.4" width="3" height="5.6" rx="1" fill="#a8693a" />
      <rect x="5" y="13.8" width="14" height="3.6" rx="1" fill="#9a5f2b" />
      <rect x="4" y="17.4" width="16" height="3.6" rx="1" fill="#c3202c" />
    </g>
  ),
  repair: (
    <g {...S}>
      <path d="M17 2l3 2-8 11-3-2z" fill="#a0682c" />
      <path d="M8 12l5 3-2 3c-1 2-5 4-9 3 2-2 3-6 6-9z" fill="#f2c94c" />
      <path d="M5 19l2-3M8 20l2-3" />
    </g>
  ),
  exit: (
    <g {...S}>
      <rect x="4" y="3" width="11" height="18" fill="#8a5a2b" />
      <circle cx="12.5" cy="12" r="1" fill="#f2c94c" />
      <path
        d="M14 12h8m-3-3l3 3-3 3"
        fill="none"
        stroke="#1d7d22"
        strokeWidth="2"
      />
    </g>
  ),
};

export function PaletteIcon({ id }: { id: PaletteIconId }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}
