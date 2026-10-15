// Fluff, drawn facing right in a 40×32 box with the feet on the bottom edge. Original art.
import type { PetMode } from './machine';

export interface SheepSpriteProps {
  mode: PetMode;
  /** Animation frame, 0 or 1 (legs, wool bob, nibbling). */
  frame: number;
  /** Eyes shut for a moment. */
  blink: boolean;
}

const WOOL = '#fbf9f2';
const WOOL_EDGE = '#cfc8b8';
const FACE = '#4b4038';
const EAR = '#3a312a';
const LEG = '#3f362f';

/** Puffs of the fleece: [cx, cy, r]. */
const PUFFS: readonly [number, number, number][] = [
  [9, 17, 6],
  [14, 12, 6.5],
  [21, 11, 6.5],
  [27, 14, 6],
  [27, 20, 5.5],
  [20, 22, 6],
  [12, 22, 6],
];

/** x positions of the four legs (back pair, front pair). */
const LEGS = [11, 15, 22, 26] as const;

function Legs({ mode, frame }: Pick<SheepSpriteProps, 'mode' | 'frame'>) {
  if (mode === 'sit' || mode === 'sleep') return null;
  if (mode === 'fall' || mode === 'drag') {
    // Dangling and splayed.
    return (
      <g stroke={LEG} strokeWidth={2} strokeLinecap="round">
        <path d="M11 25l-3 5M15 26l-1 5M23 26l1 5M27 25l3 5" />
      </g>
    );
  }
  const walking = mode === 'walk';
  return (
    <g fill={LEG}>
      {LEGS.map((x, i) => {
        // Diagonal pairs step together.
        const step = walking && i % 2 === frame % 2 ? 1 : 0;
        return (
          <rect
            key={x}
            x={x - 1 + (walking ? (step ? 1 : -1) : 0)}
            y={25 - step}
            width={2.4}
            height={7 - step}
            rx={1}
          />
        );
      })}
    </g>
  );
}

function Eye({ shut }: { shut: boolean }) {
  return shut ? (
    <path
      d="M31.4 14.6q1.5 1.2 3 0"
      fill="none"
      stroke="#f4efe6"
      strokeWidth={0.9}
      strokeLinecap="round"
    />
  ) : (
    <g>
      <circle cx={33} cy={14} r={1.7} fill="#fff" />
      <circle cx={33.5} cy={14.2} r={0.95} fill="#111" />
      <circle cx={33.8} cy={13.7} r={0.35} fill="#fff" />
    </g>
  );
}

function Head({ mode, frame, blink }: SheepSpriteProps) {
  const grazing = mode === 'graze';
  const bleating = mode === 'baa';
  const shut = blink || mode === 'sleep';
  // Grazing dips the head to the ground; bleating tips it up.
  const transform = grazing
    ? `translate(1 9) rotate(35 30 15)`
    : bleating
      ? 'rotate(-12 30 16)'
      : mode === 'sleep'
        ? 'translate(0 3)'
        : undefined;
  const nibble = grazing && frame % 2 === 1;
  return (
    <g transform={transform}>
      <ellipse
        cx={28.6}
        cy={14}
        rx={2.6}
        ry={1.4}
        fill={EAR}
        transform="rotate(-25 28.6 14)"
      />
      <ellipse cx={32} cy={16} rx={4.6} ry={5.6} fill={FACE} />
      <circle
        cx={31}
        cy={10.6}
        r={3}
        fill={WOOL}
        stroke={WOOL_EDGE}
        strokeWidth={0.6}
      />
      <Eye shut={shut} />
      {bleating ? (
        <ellipse cx={34.6} cy={19.6} rx={1.3} ry={1.6} fill="#2a1f1a" />
      ) : (
        <path
          d={nibble ? 'M33.4 20.2h2' : 'M33.6 19.8q1 0.6 1.8 0'}
          stroke="#d79a95"
          strokeWidth={0.8}
          fill="none"
          strokeLinecap="round"
        />
      )}
      <ellipse cx={34.4} cy={17.6} rx={0.9} ry={0.55} fill="#2a201b" />
    </g>
  );
}

export function SheepSprite({ mode, frame, blink }: SheepSpriteProps) {
  const lowered = mode === 'sit' || mode === 'sleep';
  // The fleece bobs on every other step; sitting and sleeping lower the body onto the ground.
  const bob = lowered ? 5 : mode === 'walk' && frame % 2 === 1 ? -0.6 : 0;
  return (
    <svg
      width={40}
      height={32}
      viewBox="0 0 40 32"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <Legs mode={mode} frame={frame} />
      <g transform={`translate(0 ${bob})`}>
        <g fill={WOOL} stroke={WOOL_EDGE} strokeWidth={0.8}>
          {PUFFS.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        {/* Fill the seams so the outline only shows on the outside. */}
        <ellipse cx={18.5} cy={17} rx={10} ry={6.5} fill={WOOL} />
        <path
          d="M8 15q2-2 4 0M17 10q2-2 4 0M14 19q2-2 4 0M22 16q2-2 4 0"
          fill="none"
          stroke="#e7e1d3"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
        <Head mode={mode} frame={frame} blink={blink} />
      </g>
    </svg>
  );
}
