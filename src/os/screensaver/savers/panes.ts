// Flying Panes: plain four-pane window frames (white frame, blue glass) fly out of a vanishing
// point toward the viewer on black.
import type { Rand } from '@/os/random';
import type { Saver, SaverFactory } from './types';

const COUNT = 26;
const FAR = 6;
const NEAR = 0.25;
/** Depth units per second. */
const SPEED = 0.9;
/** Frame size in depth units. */
const SIZE = 0.32;

interface Pane {
  x: number;
  y: number;
  z: number;
  angle: number;
  spin: number;
}

function spawn(rand: Rand, z: number): Pane {
  return {
    x: (rand() - 0.5) * 3.2,
    y: (rand() - 0.5) * 2.2,
    z,
    angle: (rand() - 0.5) * 0.6,
    spin: (rand() - 0.5) * 0.5,
  };
}

function drawPane(ctx: CanvasRenderingContext2D, s: number) {
  const half = s / 2;
  const bar = s * 0.09;
  const glass = ctx.createLinearGradient(-half, -half, half, half);
  glass.addColorStop(0, '#9cc8ff');
  glass.addColorStop(0.5, '#3d7fe0');
  glass.addColorStop(1, '#1b4fb0');
  ctx.fillStyle = glass;
  ctx.fillRect(-half, -half, s, s);
  // Frame and the cross between the four panes.
  ctx.fillStyle = '#f4f7ff';
  ctx.fillRect(-half, -half, s, bar);
  ctx.fillRect(-half, half - bar, s, bar);
  ctx.fillRect(-half, -half, bar, s);
  ctx.fillRect(half - bar, -half, bar, s);
  ctx.fillRect(-bar / 2, -half, bar, s);
  ctx.fillRect(-half, -bar / 2, s, bar);
  // A soft reflection on the top-left pane.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.fillRect(-half + bar, -half + bar, s * 0.3, s * 0.12);
}

export const createPanes: SaverFactory = ({ w, h, rand }): Saver => {
  const panes = Array.from({ length: COUNT }, (_, i) =>
    spawn(rand, NEAR + ((i + rand()) / COUNT) * (FAR - NEAR)),
  );
  const focal = Math.min(w, h) * 0.9;
  return {
    frame(ctx, dtMs) {
      const dt = dtMs / 1000;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      for (const [i, p] of panes.entries()) {
        p.z -= SPEED * dt;
        p.angle += p.spin * dt;
        if (p.z < NEAR) panes[i] = spawn(rand, FAR);
      }
      // Far ones first.
      panes.sort((a, b) => b.z - a.z);
      for (const p of panes) {
        const scale = focal / p.z;
        const x = w / 2 + p.x * scale;
        const y = h / 2 + p.y * scale;
        const s = SIZE * scale;
        if (x + s < 0 || x - s > w || y + s < 0 || y - s > h) continue;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (FAR - p.z) / 1.5);
        ctx.translate(x, y);
        ctx.rotate(p.angle);
        drawPane(ctx, s);
        ctx.restore();
      }
    },
  };
};
