// Profile extras (P1-03): layout-code stickers in the frame's corners, comment graphics above wall
// comments and the player's mood history. All original CSS/SVG; nothing here renders HTML.
import controller from '@/assets/stickers/controller.svg';
import flame from '@/assets/stickers/flame.svg';
import heart from '@/assets/stickers/heart.svg';
import music from '@/assets/stickers/music.svg';
import pony from '@/assets/stickers/pony.svg';
import skateboard from '@/assets/stickers/skateboard.svg';
import skull from '@/assets/stickers/skull.svg';
import smiley from '@/assets/stickers/smiley.svg';
import star from '@/assets/stickers/star.svg';
import type { StickerId, StickerPos } from '@/content/friendspace/layoutSets';
import type {
  CommentGraphic,
  MoodHistoryEntry,
} from '@/content/friendspace/profiles/types';
import { useId, type CSSProperties } from 'react';
import { useT } from '@/i18n/useT';
import { useReducedMotion } from '@/os/useReducedMotion';
import { dayLabel } from './logic';
import { MoodIcon } from './Mood';
import styles from './Extras.module.css';
import fs from './Friendspace.module.css';

/** The class for a glittering headline: a shimmer, or a still gradient under reduced motion. */
export function useGlitterClass(on: boolean): string {
  const reduced = useReducedMotion();
  if (!on) return '';
  return `${styles.glitterHeadline} ${reduced ? styles.glitterStatic : ''}`;
}

export const STICKER_SRC: Record<StickerId, string> = {
  star,
  heart,
  skull,
  pony,
  music,
  smiley,
  flame,
  skateboard,
  controller,
};

export function LayoutStickers({
  stickers,
  size = 48,
}: {
  stickers: readonly { id: StickerId; pos: StickerPos }[];
  size?: number;
}) {
  if (stickers.length === 0) return null;
  return (
    <div
      className={styles.layoutStickers}
      style={{ '--st': `${size}px` } as CSSProperties}
      aria-hidden
    >
      {stickers.map((s, i) => (
        <img
          key={i}
          className={styles.layoutSticker}
          data-pos={s.pos}
          data-sticker={s.id}
          // Two stickers in one corner sit side by side.
          data-nth={stickers.slice(0, i).filter((o) => o.pos === s.pos).length}
          src={STICKER_SRC[s.id]}
          alt=""
          width={size}
          height={size}
        />
      ))}
    </div>
  );
}

function HugArt() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden>
      <circle cx="11" cy="6" r="4.5" fill="#ffd2a8" stroke="#8a4b1c" />
      <circle cx="23" cy="6" r="4.5" fill="#ffe0bd" stroke="#8a4b1c" />
      <path
        d="M4 22c0-7 4-11 7-11s5 2 6 4c1-2 3-4 6-4s7 4 7 11z"
        fill="#7fb2ff"
        stroke="#24508f"
      />
      <path
        d="M8 15c4 3 14 3 18 0"
        fill="none"
        stroke="#ffd2a8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M17 1.5c-1-1.5-3.5-.5-2.5 1.5L17 5l2.5-2c1-2-1.5-3-2.5-1.5z"
        fill="#ff3d8b"
      />
    </svg>
  );
}

function HeartArt() {
  const id = `fsheart${useId().replace(/:/g, '')}`;
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9fd6" />
          <stop offset="0.5" stopColor="#ff2d8a" />
          <stop offset="1" stopColor="#b3005a" />
        </linearGradient>
      </defs>
      <path
        d="M13 22C3 15 1 10 2.5 6 4 2 9 1.5 13 6c4-4.5 9-4 10.5 0 1.5 4-.5 9-10.5 16z"
        fill={`url(#${id})`}
        stroke="#7d0040"
      />
      <path
        d="M7 6l.8 1.7L9.5 8.5l-1.7.8L7 11l-.8-1.7L4.5 8.5l1.7-.8zM18 9l.6 1.2 1.2.6-1.2.6L18 12.6l-.6-1.2-1.2-.6 1.2-.6zM14 15l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z"
        fill="#fff"
      />
    </svg>
  );
}

/** The badge drawn above a wall comment with a `graphic`. */
export function CommentBadge({ graphic }: { graphic: CommentGraphic }) {
  const t = useT();
  const label = t(`sites.friendspace.graphics.${graphic}`);
  return (
    <div
      className={`${styles.badge} ${styles[`badge-${graphic}`] ?? ''}`}
      role="img"
      aria-label={label}
      data-graphic={graphic}
    >
      {graphic === 'hug' && <HugArt />}
      {graphic === 'glitterheart' && <HeartArt />}
      <span aria-hidden>{label}</span>
    </div>
  );
}

/** "Mood history" under the player's ID card, newest first. */
export function MoodHistory({
  entries,
  day,
}: {
  entries: readonly MoodHistoryEntry[];
  day: number;
}) {
  const t = useT();
  if (entries.length === 0) return null;
  const title = t('sites.friendspace.moodHistory');
  return (
    <section className={fs.box} aria-label={title}>
      <h3 className={fs.boxTitle}>{title}</h3>
      <ol className={`${fs.boxBody} ${styles.moodHistory}`}>
        {entries.map((m, i) => (
          <li key={i}>
            <span>
              {m.text} <MoodIcon code={m.emoticon} />
            </span>
            <span className={styles.moodDay}>{dayLabel(m.day, day)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
