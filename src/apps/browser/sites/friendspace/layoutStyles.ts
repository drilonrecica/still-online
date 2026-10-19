// How the layout-code sets look (P1-03): original CSS backgrounds and font stacks, and the theme a
// profile renders with once a parsed layout code sits on top of its preset. Only these fixed strings
// and validated colours ever reach a `style`.
import type {
  BackgroundId,
  FontId,
  LayoutExtras,
} from '@/content/friendspace/layoutSets';
import type { ProfileTheme } from '@/content/friendspace/profiles/types';

const HEART_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 27 C8 20 7 14 10.5 11.5 C13.5 9.5 16.5 11 18 13.5 C19.5 11 22.5 9.5 25.5 11.5 C29 14 28 20 18 27Z' fill='%23ff5fa2'/%3E%3C/svg%3E\") 0 0 / 36px 36px";

/** CSS `background` values (gradients and repeating patterns, no image files). */
export const BACKGROUNDS: Record<BackgroundId, string> = {
  starry:
    'radial-gradient(circle, #fff 0 1px, transparent 1.6px) 0 0 / 37px 41px, ' +
    'radial-gradient(circle, #ffe9a8 0 1px, transparent 1.6px) 13px 19px / 53px 47px, ' +
    'radial-gradient(circle, #cfe3ff 0 1.5px, transparent 2px) 29px 7px / 89px 79px, ' +
    'linear-gradient(#07072e, #1d0f4f)',
  leopard:
    'radial-gradient(7px 5px at 30% 30%, #2e1a08 0 55%, transparent 60%) 0 0 / 34px 30px, ' +
    'radial-gradient(9px 7px at 72% 70%, #6b3e14 0 35%, #2e1a08 40% 55%, transparent 60%) 0 0 / 34px 30px, ' +
    '#d9a65a',
  pastel: 'linear-gradient(135deg, #ffd1ec, #d6f0ff 50%, #e9ffd6)',
  'emo-stripes':
    'repeating-linear-gradient(45deg, #111 0 14px, #ff3399 14px 28px)',
  rainbow:
    'linear-gradient(180deg, #ff4d4d, #ffa64d, #ffff66, #66ff66, #66ccff, #b366ff)',
  grunge:
    'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0 2px, transparent 2px 7px), ' +
    'repeating-linear-gradient(10deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 5px), ' +
    'radial-gradient(circle at 30% 40%, #5a5145, #2a2722 70%)',
  matrix:
    'repeating-linear-gradient(90deg, rgba(0, 255, 70, 0.18) 0 2px, transparent 2px 12px), ' +
    'repeating-linear-gradient(0deg, rgba(0, 255, 70, 0.12) 0 1px, transparent 1px 6px), ' +
    '#020c02',
  hearts: `${HEART_TILE}, #ffe0ef`,
  checker:
    'conic-gradient(#111 25%, #eee 0 50%, #111 0 75%, #eee 0) 0 0 / 32px 32px',
  clouds:
    'radial-gradient(60px 26px at 30% 40%, #fff 0 60%, transparent 63%) 0 0 / 160px 110px, ' +
    'radial-gradient(45px 20px at 75% 75%, #fff 0 60%, transparent 63%) 0 0 / 160px 110px, ' +
    'linear-gradient(#6cb8ff, #c9e7ff)',
  flames:
    'radial-gradient(18px 40px at 50% 100%, #ffcc00 0 30%, #ff6600 55%, transparent 72%) 0 100% / 40px 80px repeat-x, ' +
    'linear-gradient(0deg, #ff3300, #3a0000 55%, #000)',
  camo:
    'radial-gradient(30px 18px at 20% 30%, #3d4a26 0 60%, transparent 63%) 0 0 / 90px 70px, ' +
    'radial-gradient(26px 20px at 70% 60%, #2b2116 0 60%, transparent 63%) 0 0 / 90px 70px, ' +
    'radial-gradient(22px 14px at 45% 88%, #8a8a5c 0 60%, transparent 63%) 0 0 / 90px 70px, ' +
    '#5f6b3a',
};

/** CSS font stacks; nothing is downloaded. */
export const FONTS: Record<FontId, string> = {
  comic: "'Comic Sans MS', 'Comic Neue', 'Chalkboard SE', cursive",
  tahoma: "Tahoma, Verdana, 'Segoe UI', sans-serif",
  verdana: 'Verdana, Tahoma, sans-serif',
  courier: "'Courier New', Courier, monospace",
  impact: "Impact, 'Arial Black', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
};

/** `theme` with a parsed layout code's colours, background, font and glitter on top. */
export function applyLayout(
  theme: ProfileTheme,
  extras: LayoutExtras | undefined,
): ProfileTheme {
  if (!extras) return theme;
  return {
    ...theme,
    ...(extras.background && { background: BACKGROUNDS[extras.background] }),
    ...(extras.text && { text: extras.text }),
    ...(extras.accent && { accent: extras.accent }),
    ...(extras.panel && {
      panel: extras.panel === 'none' ? 'transparent' : extras.panel,
    }),
    ...(extras.font && { font: FONTS[extras.font] }),
    ...(extras.glitter !== undefined && { glitter: extras.glitter }),
  };
}
