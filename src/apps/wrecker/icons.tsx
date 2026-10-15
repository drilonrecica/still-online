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
      <rect
        x="10"
        y="9"
        width="4"
        height="14"
        rx="1"
        fill="#a0682c"
        transform="rotate(35 12 16)"
      />
      <rect
        x="3"
        y="3"
        width="13"
        height="7"
        rx="1"
        fill="#8d949c"
        transform="rotate(35 9.5 6.5)"
      />
    </g>
  ),
  chainsaw: (
    <g {...S}>
      <path d="M2 9h12v6H2a3 3 0 0 1 0-6z" fill="#b7bec6" />
      <path d="M3 8.5v-1M6 8.5v-1M9 8.5v-1M12 8.5v-1M3 16.5v-1M6 16.5v-1M9 16.5v-1M12 16.5v-1" />
      <rect x="13" y="6" width="9" height="12" rx="2" fill="#f07d14" />
      <rect x="15" y="3" width="5" height="3" fill="#2a2a2a" />
    </g>
  ),
  flamethrower: (
    <g {...S}>
      <path d="M2 7c2-4 6-4 5 0 2-2 3 1 1 3-2 2-5 1-6-3z" fill="#ff9a1f" />
      <rect x="7" y="9" width="8" height="4" fill="#6c737a" />
      <ellipse cx="18" cy="14" rx="4.5" ry="6" fill="#c4231b" />
    </g>
  ),
  machinegun: (
    <g {...S}>
      <rect x="2" y="9" width="14" height="4" fill="#4a4f55" />
      <rect x="12" y="7" width="9" height="7" rx="1" fill="#2f3337" />
      <path d="M15 14l-1 6h4l1-6z" fill="#7b4a22" />
      <path d="M8 13v4h3v-4" fill="#c99a2e" />
    </g>
  ),
  stamp: (
    <g {...S}>
      <circle cx="12" cy="5" r="3.5" fill="#c0392b" />
      <rect x="10.5" y="8" width="3" height="6" fill="#9a6431" />
      <rect x="5" y="14" width="14" height="3" fill="#7b4a22" />
      <rect x="4" y="17" width="16" height="4" fill="#b31f2a" />
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
