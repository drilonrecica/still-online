// Web Explorer's toolbar and status-bar icons: original hand-written SVG (24px toolbar, 16px small).
import type { ReactElement } from 'react';

const svg = (size: number, body: ReactElement) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    aria-hidden="true"
    focusable="false"
  >
    {body}
  </svg>
);

/** A glossy green ball with a white arrow; `dir` -1 points left. */
function ArrowBall({ dir }: { dir: 1 | -1 }) {
  const t = dir === 1 ? undefined : 'scale(-1 1) translate(-24 0)';
  return svg(
    24,
    <g transform={t}>
      <circle cx="12" cy="12" r="10.5" fill="#3aa83a" stroke="#1d6b1d" />
      <ellipse cx="12" cy="8" rx="7" ry="4" fill="#9be59b" opacity="0.7" />
      <path
        d="M6 10.5h6.5V6.5L18.5 12l-6 5.5v-4H6z"
        fill="#fff"
        stroke="#1d6b1d"
        strokeWidth="0.6"
      />
    </g>,
  );
}

export const BackIcon = () => <ArrowBall dir={-1} />;
export const ForwardIcon = () => <ArrowBall dir={1} />;

export const StopIcon = () =>
  svg(
    24,
    <>
      <rect
        x="3.5"
        y="2.5"
        width="14"
        height="18"
        fill="#fff"
        stroke="#6b7a99"
      />
      <path d="M6 7h9M6 10h9M6 13h6" stroke="#b7c3dc" />
      <circle cx="16" cy="16" r="6" fill="#d8352a" stroke="#8c1b13" />
      <path
        d="M13.2 13.2l5.6 5.6M18.8 13.2l-5.6 5.6"
        stroke="#fff"
        strokeWidth="1.8"
      />
    </>,
  );

export const RefreshIcon = () =>
  svg(
    24,
    <>
      <rect
        x="3.5"
        y="2.5"
        width="14"
        height="18"
        fill="#fff"
        stroke="#6b7a99"
      />
      <path d="M6 7h9M6 10h9" stroke="#b7c3dc" />
      <path
        d="M11.5 16a4.5 4.5 0 0 1 8.4-2.2"
        fill="none"
        stroke="#2f9a2f"
        strokeWidth="2"
      />
      <path d="M21.5 11.5l-0.6 4-3.8-1.2z" fill="#2f9a2f" />
      <path
        d="M20.5 17.5a4.5 4.5 0 0 1-8.4 1.4"
        fill="none"
        stroke="#2f9a2f"
        strokeWidth="2"
      />
    </>,
  );

export const HomeIcon = () =>
  svg(
    24,
    <>
      <path
        d="M3 12L12 4l9 8"
        fill="none"
        stroke="#a33a1f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M5.5 11v9.5h13V11L12 5.3z" fill="#fbe7b0" stroke="#8a6a2a" />
      <rect x="10" y="14" width="4" height="6.5" fill="#7a4a22" />
      <rect
        x="6.5"
        y="12.5"
        width="3"
        height="3"
        fill="#7fb6f0"
        stroke="#3b6fae"
        strokeWidth="0.6"
      />
      <rect x="16" y="5" width="2.2" height="4" fill="#a33a1f" />
    </>,
  );

export const StarIcon = ({ size = 24 }: { size?: 16 | 24 }) =>
  svg(
    size,
    <path
      transform={size === 16 ? 'scale(0.667)' : undefined}
      d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"
      fill="#ffd23f"
      stroke="#b8860b"
      strokeLinejoin="round"
    />,
  );

export const GoIcon = () =>
  svg(
    16,
    <>
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="2"
        fill="#3aa83a"
        stroke="#1d6b1d"
      />
      <path d="M3.5 6.5h5V3.5l4.5 4.5-4.5 4.5v-3h-5z" fill="#fff" />
    </>,
  );

export const GlobeIcon = () =>
  svg(
    16,
    <>
      <circle cx="8" cy="8" r="6.5" fill="#4f9be8" stroke="#1f5fa8" />
      <path
        d="M4 5.5c1.5.5 2 2 3.5 1.5s1 2.5 2.5 2 1.5 2 0 3.5M9.5 2c-.5 1.5.5 2 2 2.5"
        fill="none"
        stroke="#3aa83a"
        strokeWidth="1.4"
      />
      <path
        d="M1.5 8h13M8 1.5c-2.5 3.5-2.5 9.5 0 13M8 1.5c2.5 3.5 2.5 9.5 0 13"
        fill="none"
        stroke="#cfe6ff"
        strokeWidth="0.5"
      />
    </>,
  );

export const PageIcon = () =>
  svg(
    16,
    <>
      <path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#6b7a99" />
      <path d="M9.5 1.5v3h3" fill="#dfe6f3" stroke="#6b7a99" />
      <circle
        cx="10.5"
        cy="11.5"
        r="3"
        fill="#4f9be8"
        stroke="#1f5fa8"
        strokeWidth="0.7"
      />
    </>,
  );
