// The desktop's overlays, one fixed full-screen slot each, stacked by Z_INDEX.
// See docs/architecture-v0.2.md → "Overlay layer". Later tasks fill their slot.
import type { ReactNode } from 'react';
import { BalloonLayer } from '@/os/balloon/BalloonLayer';
import { Screensaver } from '@/os/screensaver/Screensaver';
import { OVERLAY_SLOTS, Z_INDEX, type OverlaySlot } from './slots';
import styles from './OverlayLayer.module.css';

const CONTENT: Partial<Record<OverlaySlot, () => ReactNode>> = {
  balloons: () => <BalloonLayer />,
  screensaver: () => <Screensaver />,
};

export function OverlayLayer() {
  return (
    <>
      {OVERLAY_SLOTS.map((slot) => (
        <div
          key={slot}
          className={styles.slot}
          data-overlay={slot}
          style={{ zIndex: Z_INDEX[slot] }}
        >
          {CONTENT[slot]?.()}
        </div>
      ))}
    </>
  );
}
