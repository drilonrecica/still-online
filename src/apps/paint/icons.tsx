// Paint's toolbox icons: original hand-written 16px SVG.
import type { ReactElement } from 'react';
import type { ToolId } from './tools';

const OUT = '#33334d';

const icon = (body: ReactElement) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    {body}
  </svg>
);

export const TOOL_ICONS: Record<ToolId, ReactElement> = {
  select: icon(
    <rect
      x="2.5"
      y="3.5"
      width="11"
      height="9"
      fill="none"
      stroke={OUT}
      strokeDasharray="2 1.5"
    />,
  ),
  eraser: icon(
    <g stroke={OUT}>
      <path d="M2.5 10.5 8.5 4.5l5 3-6 6h-3z" fill="#f4c6d8" />
      <path d="M2.5 10.5h5l1.5 3" fill="none" />
    </g>,
  ),
  fill: icon(
    <g stroke={OUT}>
      <path d="M3.5 7.5 8 3l5 5-4.5 4.5z" fill="#e8e8f0" />
      <path
        d="M13 8.5c1.5 2 1.5 3.5.5 4"
        fill="none"
        stroke="#2266dd"
        strokeWidth="1.6"
      />
    </g>,
  ),
  picker: icon(
    <g stroke={OUT}>
      <path d="M3 13 10 6l1.5 1.5-7 7H3z" fill="#dfe8f5" />
      <path d="M10 4.5l1.5-1.5 2 2-1.5 1.5z" fill="#555" />
    </g>,
  ),
  magnifier: icon(
    <g stroke={OUT}>
      <circle cx="6.5" cy="6.5" r="4" fill="#cfe6ff" />
      <path d="M9.5 9.5 14 14" strokeWidth="2.2" strokeLinecap="round" />
    </g>,
  ),
  pencil: icon(
    <g stroke={OUT}>
      <path d="M3 13l1-3.5 7-7 2.5 2.5-7 7z" fill="#f6c83a" />
      <path d="M3 13l1-3.5 2.5 2.5z" fill="#f1dfc0" />
    </g>,
  ),
  brush: icon(
    <g stroke={OUT}>
      <path d="M8 8.5 13 2l1 1-5.5 6.5z" fill="#a0703a" />
      <path
        d="M3 13.5c0-2.5 1.5-4.5 4.5-4.5l1 1c0 3-2 4-5.5 3.5z"
        fill="#2c64c8"
      />
    </g>,
  ),
  airbrush: icon(
    <g>
      <rect
        x="7.5"
        y="5.5"
        width="5"
        height="8"
        rx="1"
        fill="#c8ccd8"
        stroke={OUT}
      />
      <rect x="8.5" y="3.5" width="3" height="2" fill="#666" />
      {[
        [3, 3],
        [5, 4.5],
        [2.5, 6],
        [4.5, 7],
        [2, 9],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="1"
          height="1"
          fill="#2c64c8"
        />
      ))}
    </g>,
  ),
  text: icon(
    <path
      d="M3 3h10v2.5M8 3v10M6 13h4M3 3v2.5"
      fill="none"
      stroke={OUT}
      strokeWidth="1.6"
    />,
  ),
  line: icon(<path d="M2.5 13.5 13.5 2.5" stroke={OUT} strokeWidth="1.5" />),
  rect: icon(
    <rect x="2.5" y="4.5" width="11" height="8" fill="none" stroke={OUT} />,
  ),
  ellipse: icon(
    <ellipse cx="8" cy="8.5" rx="5.5" ry="4" fill="none" stroke={OUT} />,
  ),
  roundrect: icon(
    <rect
      x="2.5"
      y="4.5"
      width="11"
      height="8"
      rx="3"
      fill="none"
      stroke={OUT}
    />,
  ),
};
