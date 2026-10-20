// Hen Hunt's heads-up display: clock, score, shells, score popups and the crosshair.
import { t } from '@/i18n/t';
import {
  LAST_SECONDS,
  RELOAD_SECONDS,
  SHELLS,
  VIEW_H,
  VIEW_W,
  toScreenX,
} from './layout';
import type { Ctx } from './scene';
import type { Game } from './sim';

const FONT = "Tahoma, Verdana, 'Segoe UI', sans-serif";

export function drawPopups(c: Ctx, g: Game) {
  c.font = `bold 20px ${FONT}`;
  c.textAlign = 'center';
  c.lineWidth = 4;
  c.strokeStyle = '#1b1b1b';
  for (const p of g.popups) {
    c.globalAlpha = Math.min(1, p.life * 2);
    const text = p.points > 0 ? `+${p.points}` : String(p.points);
    const x = toScreenX(p.x, p.depth, g.camX);
    c.strokeText(text, x, p.y);
    c.fillStyle = p.points > 0 ? '#ffe14d' : '#ff5a4a';
    c.fillText(text, x, p.y);
  }
  c.globalAlpha = 1;
}

function panel(c: Ctx, x: number, y: number, w: number, h: number) {
  c.fillStyle = 'rgb(30 20 10 / 55%)';
  c.beginPath();
  c.roundRect(x, y, w, h, 10);
  c.fill();
}

export function formatClock(seconds: number): string {
  const s = Math.ceil(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function drawHud(c: Ctx, g: Game) {
  const late = g.time <= LAST_SECONDS && !g.over;
  c.textBaseline = 'middle';
  panel(c, 12, 10, 120, 50);
  c.font = `bold 36px ${FONT}`;
  c.textAlign = 'center';
  c.fillStyle = late && Math.ceil(g.time * 2) % 2 ? '#ff4b3a' : '#fff6d8';
  c.fillText(formatClock(g.time), 72, 36);

  // The score panel grows to fit the (localized) label plus the number, never narrower than 180.
  const label = t('henhunt.hud.score');
  c.font = `bold 13px ${FONT}`;
  const labelW = c.measureText(label).width;
  c.font = `bold 32px ${FONT}`;
  const scoreW = c.measureText(String(g.score)).width;
  const panelW = Math.max(180, Math.ceil(labelW + scoreW) + 36);
  panel(c, VIEW_W - panelW - 12, 10, panelW, 50);
  c.textAlign = 'right';
  c.fillStyle = '#fff6d8';
  c.fillText(String(g.score), VIEW_W - 24, 36);
  c.font = `bold 13px ${FONT}`;
  c.textAlign = 'left';
  c.fillText(label, VIEW_W - panelW, 36);

  if (late && g.time > LAST_SECONDS - 2.5) {
    c.textAlign = 'center';
    c.font = `bold 34px ${FONT}`;
    c.lineWidth = 6;
    c.strokeStyle = '#5a1206';
    const warning = t('henhunt.hud.lastSeconds', { seconds: LAST_SECONDS });
    const maxW = VIEW_W - 40;
    c.strokeText(warning, VIEW_W / 2, 92, maxW);
    c.fillStyle = '#ffd23a';
    c.fillText(warning, VIEW_W / 2, 92, maxW);
  }
  drawShells(c, g);
  c.textBaseline = 'alphabetic';
}

function drawShells(c: Ctx, g: Game) {
  // While reloading, shells slide in one by one.
  const loaded =
    g.reloading > 0
      ? Math.floor((1 - g.reloading / RELOAD_SECONDS) * SHELLS)
      : g.shells;
  const x0 = VIEW_W - 16 - SHELLS * 16;
  const y0 = VIEW_H - 50;
  panel(c, x0 - 8, y0 - 8, SHELLS * 16 + 12, 46);
  for (let i = 0; i < SHELLS; i++) {
    const x = x0 + i * 16;
    if (i < loaded) {
      c.fillStyle = '#c4281c';
      c.fillRect(x, y0, 11, 22);
      c.fillStyle = '#d9b44a';
      c.fillRect(x - 1, y0 + 22, 13, 8);
      c.fillStyle = 'rgb(255 255 255 / 35%)';
      c.fillRect(x + 2, y0 + 2, 3, 18);
    } else {
      c.strokeStyle = 'rgb(255 255 255 / 35%)';
      c.lineWidth = 1;
      c.strokeRect(x + 0.5, y0 + 0.5, 10, 29);
    }
  }
  if (g.shells === 0 && g.reloading === 0 && !g.over) {
    c.textAlign = 'right';
    c.font = `bold 15px ${FONT}`;
    c.fillStyle = '#ffd23a';
    c.fillText(
      t(g.touch ? 'henhunt.hud.reloadTouch' : 'henhunt.hud.reload'),
      VIEW_W - 16,
      y0 - 18,
      VIEW_W - 32,
    );
  }
}

export function drawCrosshair(c: Ctx, x: number, y: number) {
  for (const [color, width] of [
    ['rgb(255 255 255 / 85%)', 4],
    ['#1b1b1b', 2],
  ] as const) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.arc(x, y, 14, 0, Math.PI * 2);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      c.moveTo(x + dx * 6, y + dy * 6);
      c.lineTo(x + dx * 22, y + dy * 22);
    }
    c.stroke();
  }
}
