// Marquee: the player's text scrolls across black, a new colour and height on every pass.
import type { Saver, SaverFactory } from './types';

export const DEFAULT_MARQUEE_TEXT = 'still online...';

export const createMarquee: SaverFactory = ({ w, h, rand, text }): Saver => {
  const message = text.trim() || DEFAULT_MARQUEE_TEXT;
  const size = Math.max(24, Math.round(h * 0.09));
  const speed = Math.max(120, w / 7);
  let x = w;
  let y = 0;
  let color = '';
  const newPass = () => {
    x = w;
    y = size + rand() * Math.max(1, h - size * 2);
    color = `hsl(${Math.floor(rand() * 360)} 100% 60%)`;
  };
  newPass();
  return {
    frame(ctx, dtMs) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `bold ${size}px Tahoma, Verdana, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const width = ctx.measureText(message).width;
      x -= (speed * dtMs) / 1000;
      if (x + width < 0) newPass();
      ctx.fillStyle = color;
      ctx.fillText(message, x, y);
    },
  };
};
