// The six wink animations as SVG. Every element's resting style is the still frame (reduced
// motion and menu previews); the CSS keyframes in Winks.module.css animate away from it.
import type { CSSProperties, ReactNode } from 'react';
import type { WinkId } from '@/content/types';
import { mulberry32 } from '@/os/random';
import styles from './Winks.module.css';

const W = 320;
const H = 180;

/** CSS custom properties (delays, distances) for one animated element. */
const vars = (v: Record<string, string>) => v as CSSProperties;
const delay = (s: number) => vars({ '--d': `${s}s` });

const HEART =
  'M0 7 C-11 -2 -13 -10 -7 -13 C-3 -15 0 -11 0 -9 C0 -11 3 -15 7 -13 C13 -10 11 -2 0 7Z';

function Heart({ fill = '#e8336d' }: { fill?: string }) {
  return <path d={HEART} fill={fill} stroke="#fff" strokeWidth={1} />;
}

function Kiss() {
  const hearts: [number, number, number, number][] = [
    [-58, -28, 0.9, 0.5],
    [56, -34, 1.1, 0.7],
    [-30, -52, 0.7, 0.9],
    [34, -60, 0.8, 1.0],
    [0, -44, 1.2, 0.6],
  ];
  return (
    <g transform={`translate(${W / 2} ${H / 2 + 14})`}>
      {hearts.map(([x, y, s, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <g className={styles.floatUp} style={delay(d)}>
            <Heart />
          </g>
        </g>
      ))}
      <g className={styles.stamp}>
        <path
          d="M-46 0 C-34 -20 -16 -26 0 -12 C16 -26 34 -20 46 0 C22 5 -22 5 -46 0Z"
          fill="#d11f4f"
        />
        <path d="M-46 2 C-22 8 22 8 46 2 C34 26 -34 26 -46 2Z" fill="#e0285a" />
        <path
          d="M-30 -6 L-26 -14 M-12 -6 L-10 -15 M12 -6 L10 -15 M30 -6 L26 -14 M-24 10 L-22 17 M0 11 L0 19 M24 10 L22 17"
          stroke="#9e0f38"
          strokeWidth={1.5}
          opacity={0.5}
        />
      </g>
    </g>
  );
}

function Hamster() {
  return (
    <g transform={`translate(${W / 2} ${H / 2 + 20})`}>
      <ellipse cx={0} cy={38} rx={34} ry={5} fill="#000" opacity={0.15} />
      <g className={styles.roll}>
        <g className={styles.laugh}>
          <text
            x={0}
            y={-48}
            textAnchor="middle"
            fontSize={18}
            fontWeight="bold"
            fill="#c0392b"
            stroke="#fff"
            strokeWidth={3}
            paintOrder="stroke"
            fontFamily="Comic Sans MS, Chalkboard, cursive"
          >
            HA HA HA!
          </text>
        </g>
        <g className={styles.spin}>
          <circle cx={-22} cy={-26} r={9} fill="#d08a48" />
          <circle cx={22} cy={-26} r={9} fill="#d08a48" />
          <circle cx={-22} cy={-26} r={5} fill="#f2a7a7" />
          <circle cx={22} cy={-26} r={5} fill="#f2a7a7" />
          <circle r={34} fill="#e3a35f" />
          <ellipse cx={0} cy={10} rx={22} ry={20} fill="#f7dfbb" />
          <path
            d="M-17 -10 Q-12 -17 -7 -10 M7 -10 Q12 -17 17 -10"
            stroke="#3a2412"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={-20} cy={2} r={5} fill="#f29a9a" opacity={0.8} />
          <circle cx={20} cy={2} r={5} fill="#f29a9a" opacity={0.8} />
          <path d="M-10 4 Q0 24 10 4Z" fill="#a8243a" />
          <rect x={-4} y={4} width={8} height={4} fill="#fff" />
          <circle cx={0} cy={-2} r={2.5} fill="#5b3a29" />
        </g>
      </g>
    </g>
  );
}

const HEART_COLORS = ['#e8336d', '#ff6f91', '#d11f4f', '#ff9eb5'];

/** Seeded, so the rain looks the same every time. */
const RAIN = (() => {
  const rand = mulberry32(1607);
  return Array.from({ length: 18 }, (_, i) => {
    const y = 16 + rand() * (H - 32);
    return {
      x: 12 + rand() * (W - 24),
      y,
      scale: 0.7 + rand() * 0.9,
      delay: rand() * 1.4,
      dur: 1.6 + rand() * 0.6,
      color: HEART_COLORS[i % HEART_COLORS.length],
    };
  });
})();

function Hearts() {
  return (
    <g>
      {RAIN.map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y}) scale(${h.scale})`}>
          <g
            className={styles.fall}
            style={vars({
              '--d': `${h.delay}s`,
              '--dur': `${h.dur}s`,
              '--from': `${(-h.y - 20) / h.scale}px`,
              '--to': `${(H + 20 - h.y) / h.scale}px`,
            })}
          >
            <Heart fill={h.color} />
          </g>
        </g>
      ))}
    </g>
  );
}

function Pickle() {
  const notes: [number, number, number, string][] = [
    [-60, -30, 0, '♪'],
    [62, -40, 0.6, '♫'],
    [-48, -64, 1.2, '♫'],
    [52, -70, 1.6, '♪'],
  ];
  return (
    <g transform={`translate(${W / 2} ${H / 2 + 6})`}>
      {notes.map(([x, y, d, note], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className={styles.floatUp} style={delay(d)}>
            <text fontSize={22} fill="#2f6b1f" textAnchor="middle">
              {note}
            </text>
          </g>
        </g>
      ))}
      <g className={styles.popIn}>
        <g className={styles.dance}>
          <path
            d="M-14 40 L-22 66 M14 40 L22 66 M-24 0 L-46 -18 M24 0 L46 14"
            stroke="#3d6b2c"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <ellipse
            rx={27}
            ry={54}
            fill="#6aa84f"
            stroke="#3d6b2c"
            strokeWidth={2}
          />
          {[
            [-12, -30],
            [10, -12],
            [-14, 18],
            [12, 34],
            [4, -40],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="#4e8a3a" />
          ))}
          <circle cx={-9} cy={-18} r={7} fill="#fff" />
          <circle cx={9} cy={-18} r={7} fill="#fff" />
          <circle cx={-7} cy={-17} r={3} fill="#1b1b1b" />
          <circle cx={11} cy={-17} r={3} fill="#1b1b1b" />
          <path
            d="M-10 0 Q0 12 10 0"
            stroke="#1b1b1b"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
  );
}

const BURSTS: [number, number, number, string][] = [
  [80, 56, 0, '#ffd23f'],
  [236, 48, 0.8, '#ff5fa2'],
  [160, 104, 1.6, '#5fd3ff'],
];

function Fireworks() {
  return (
    <g>
      {/* Oversized: the overlay clips it, so the sky fills any chat shape. */}
      <rect
        x={-W}
        y={-H}
        width={W * 3}
        height={H * 3}
        fill="#0b1240"
        className={styles.night}
      />
      {BURSTS.map(([x, y, d, color], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <line
            className={styles.rocket}
            style={delay(d)}
            y1={0}
            y2={10}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <g className={styles.burst} style={delay(d + 0.5)}>
            {Array.from({ length: 12 }, (_, k) => {
              const a = (k / 12) * Math.PI * 2;
              const [c, s] = [Math.cos(a), Math.sin(a)];
              return (
                <g key={k}>
                  <line
                    x1={c * 8}
                    y1={s * 8}
                    x2={c * 28}
                    y2={s * 28}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                  <circle cx={c * 34} cy={s * 34} r={2.5} fill="#fff" />
                </g>
              );
            })}
          </g>
        </g>
      ))}
    </g>
  );
}

const SPLAT =
  'M-22 -4 C-26 -16 -10 -24 -2 -18 C6 -28 22 -20 20 -8 C30 -2 26 14 14 14 C10 24 -6 24 -10 16 C-24 20 -30 6 -22 -4Z';
const SPLATS: [number, number, number][] = [
  [72, 46, 0],
  [230, 62, 0.45],
  [136, 112, 0.9],
  [262, 130, 1.35],
];

function Snowball() {
  return (
    <g>
      {SPLATS.map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(1.3)`}>
          <g className={styles.splat} style={delay(d)}>
            <rect
              x={-6}
              y={4}
              width={12}
              height={24}
              rx={6}
              fill="#dbe9f7"
              stroke="#7fa7d1"
            />
            <path d={SPLAT} fill="#f4f9ff" stroke="#7fa7d1" strokeWidth={2} />
            <ellipse cx={4} cy={4} rx={13} ry={9} fill="#cfe1f4" />
            <ellipse cx={-6} cy={-8} rx={6} ry={4} fill="#fff" />
            <circle cx={-28} cy={-14} r={3.5} fill="#f4f9ff" stroke="#7fa7d1" />
            <circle cx={30} cy={-16} r={3} fill="#f4f9ff" stroke="#7fa7d1" />
            <circle cx={26} cy={20} r={2.5} fill="#f4f9ff" stroke="#7fa7d1" />
          </g>
        </g>
      ))}
    </g>
  );
}

const ART: Record<WinkId, () => ReactNode> = {
  kiss: Kiss,
  hamster: Hamster,
  hearts: Hearts,
  pickle: Pickle,
  fireworks: Fireworks,
  snowball: Snowball,
};

/** One wink drawing. `still` freezes it on its still frame. */
export function WinkArt({ wink, still }: { wink: WinkId; still: boolean }) {
  const Art = ART[wink];
  return (
    <svg
      className={still ? `${styles.art} ${styles.still}` : styles.art}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-wink-art={wink}
    >
      <Art />
    </svg>
  );
}
