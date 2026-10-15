// Hen Hunt's moving scenery pieces: the windmill window and sails, the scarecrow's hat.
import { SCARECROW, WINDMILL } from './layout';
import type { Ctx } from './scene';

/** The windmill window: dark when empty (the hen is drawn into it when it peeks). */
export function windowFrame(c: Ctx, lit: boolean) {
  const { x, y } = WINDMILL.window;
  c.fillStyle = lit ? '#4a3220' : '#2d2118';
  c.fillRect(x - 10, y - 10, 20, 20);
  c.strokeStyle = '#7a4a2c';
  c.lineWidth = 2;
  c.strokeRect(x - 10, y - 10, 20, 20);
}

/** The scarecrow's hat, at layer position (x, y), tipped by `tilt` radians. */
export function drawHat(c: Ctx, x: number, y: number, tilt: number) {
  const { w, h } = SCARECROW.hat;
  c.save();
  c.translate(x, y);
  c.rotate(tilt);
  c.fillStyle = '#3d3326';
  c.fillRect(-w / 2, h / 2 - 5, w, 5);
  c.fillRect(-w / 2 + 9, -h / 2, w - 18, h - 4);
  c.fillStyle = '#a03a2a';
  c.fillRect(-w / 2 + 9, h / 2 - 11, w - 18, 4);
  c.restore();
}

/** Four windmill sails turning about the hub, drawn in far-layer coordinates. */
export function drawSails(c: Ctx, angle: number) {
  const { x, hubY, sailLength } = WINDMILL;
  c.save();
  c.translate(x, hubY);
  c.rotate(angle);
  for (let i = 0; i < 4; i++) {
    c.rotate(Math.PI / 2);
    c.fillStyle = '#5b4030';
    c.fillRect(-2, 0, 4, sailLength);
    c.fillStyle = 'rgb(245 240 225 / 92%)';
    c.fillRect(3, 14, 13, sailLength - 16);
    c.strokeStyle = '#8c7b62';
    c.lineWidth = 1;
    for (let k = 14; k < sailLength; k += 10) {
      c.beginPath();
      c.moveTo(3, k);
      c.lineTo(16, k);
      c.stroke();
    }
  }
  c.fillStyle = '#3d2a1c';
  c.beginPath();
  c.arc(0, 0, 5, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
