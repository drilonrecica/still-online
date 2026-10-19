// A small live preview of a layout: the theme with the parsed extras on top, a glittering title,
// stickers and the cursor trail. The editor shows it under the layout-code box; GlitterCodez (P1-04)
// can reuse it for gallery tiles.
import type { ReactNode } from 'react';
import type { LayoutExtras } from '@/content/friendspace/layoutSets';
import type { ProfileTheme } from '@/content/friendspace/profiles/types';
import { CursorTrail, useCursorTrail } from './CursorTrail';
import { applyLayout } from './layoutStyles';
import { LayoutStickers, useGlitterClass } from './ProfileExtras';
import { themeStyle } from './ProfileView';
import styles from './Extras.module.css';
import fs from './Friendspace.module.css';

export function LayoutPreview({
  theme,
  extras,
  title,
  label,
  children,
}: {
  theme: ProfileTheme;
  extras: LayoutExtras;
  title: string;
  label: string;
  children?: ReactNode;
}) {
  const look = applyLayout(theme, extras);
  const glitter = useGlitterClass(look.glitter);
  const { handlers, trail } = useCursorTrail(extras.cursor);
  return (
    <div
      className={`${styles.preview} ${look.glitter ? fs.glitter : ''}`}
      style={themeStyle(look)}
      role="group"
      aria-label={label}
      data-testid="layout-preview"
      {...handlers}
    >
      <p
        className={`${styles.previewTitle} ${glitter || styles.previewTitlePlain}`}
      >
        {title}
      </p>
      {children && <div className={styles.previewPanel}>{children}</div>}
      <LayoutStickers stickers={extras.stickers} size={28} />
      {trail && <CursorTrail {...trail} />}
    </div>
  );
}
